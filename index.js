import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const dbClient = await connectToMongoDB();

const db = dbClient.db("wonderlust");
const destinationsCollection = db.collection("destinations");
const bookingsCollection = db.collection("bookings");

const verifyApi = (req,res, next)=>{
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  if (!authHeader !== "user logged in") {
    return res.status(401).send({ message: "Unauthorized" });
  }
  console.log("i am");
  next();

}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createUniqueSlug(destinationName, excludeId) {
  const baseSlug = slugify(destinationName) || "destination";
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await destinationsCollection.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function backfillMissingSlugs() {
  const destinations = await destinationsCollection
    .find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    })
    .toArray();

  for (const destination of destinations) {
    const slug = await createUniqueSlug(destination.destinationName);
    await destinationsCollection.updateOne(
      {
        _id: destination._id,
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
      },
      { $set: { slug } },
    );
  }
}

function normalizeBookingStatus(booking) {
  const status = String(booking.status ?? "").trim().toLowerCase();

  if (status === "confirmed" || status === "pending") {
    return status;
  }

  return booking.bookingDate ? "confirmed" : "pending";
}

const editableDestinationFields = [
  "destinationName",
  "country",
  "category",
  "price",
  "duration",
  "departureDate",
  "imageUrl",
  "description",
];

function getRequesterId(req) {
  const raw =
    req.body?.userId ?? req.body?.ownerId ?? req.headers["x-user-id"];

  return typeof raw === "string" ? raw.trim() : "";
}

function canManageDestination(destination, requesterId) {
  const ownerId = String(destination.ownerId ?? "").trim();

  return Boolean(ownerId) && Boolean(requesterId) && ownerId === requesterId;
}

await backfillMissingSlugs();

app.post("/add-destination", async (req, res) => {
  const ownerId = getRequesterId(req);

  if (!ownerId) {
    return res
      .status(401)
      .send({ message: "Sign in to add a destination" });
  }

  const { userId: _userId, ...payload } = req.body ?? {};
  const data = {
    ...payload,
    ownerId,
    ownerName: String(req.body?.ownerName ?? "").trim(),
    createdAt: new Date().toISOString(),
  };
  data.slug = await createUniqueSlug(data.destinationName);

  const result = await destinationsCollection.insertOne(data);
  console.log("Destination added successfully:", result);
  res.send({
    message: "Destination added successfully",
    data: result,
    destination: data,
  });
});

app.get("/alldestinations", async (req, res) => {
  const destinations = await destinationsCollection.find({}).toArray();
  res.send(destinations);
});

app.get("/destinations/:slug", async (req, res) => {
  const destination = await destinationsCollection.findOne({
    slug: req.params.slug,
  });

  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }

  res.send(destination);
});

app.get("/alldestinations/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid destination id" });
  }

  const destination = await destinationsCollection.findOne({
    _id: new ObjectId(id),
  });
  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }
  res.send(destination);
});

app.patch("/alldestinations/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid destination id" });
  }

  const destination = await destinationsCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }

  if (!canManageDestination(destination, getRequesterId(req))) {
    return res
      .status(403)
      .send({ message: "You can only edit packages you created" });
  }

  const data = {};
  for (const field of editableDestinationFields) {
    if (Object.hasOwn(req.body ?? {}, field)) {
      data[field] = req.body[field];
    }
  }

  if (
    data.destinationName &&
    data.destinationName !== destination.destinationName
  ) {
    data.slug = await createUniqueSlug(data.destinationName, destination._id);
  }

  data.updatedAt = new Date().toISOString();

  const result = await destinationsCollection.updateOne(
    { _id: destination._id },
    { $set: data },
  );

  res.send({ message: "Destination updated successfully", data: result });
});

app.delete("/alldestinations/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid destination id" });
  }

  const destination = await destinationsCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }

  if (!canManageDestination(destination, getRequesterId(req))) {
    return res
      .status(403)
      .send({ message: "You can only delete packages you created" });
  }

  const result = await destinationsCollection.deleteOne({
    _id: destination._id,
  });

  res.send({ message: "Destination deleted successfully", data: result });
});

app.get("/myBookings/:email", async (req, res) => {
  const { email } = req.params;

  const bookings = await bookingsCollection
    .find({ userEmail: email })
    .sort({ bookingDate: -1, createdAt: -1 })
    .toArray();

  res.send(
    bookings.map((booking) => ({
      ...booking,
      status: normalizeBookingStatus(booking),
    })),
  );
});

app.delete("/bookings/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid booking id" });
  }

  const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).send({ message: "Booking not found" });
  }

  res.send({ message: "Booking cancelled successfully", data: result });
});

app.patch("/bookings/:id/status", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid booking id" });
  }

  const status = String(req.body?.status ?? "")
    .trim()
    .toLowerCase();

  if (status !== "pending" && status !== "confirmed") {
    return res
      .status(400)
      .send({ message: "Status must be either pending or confirmed" });
  }

  const result = await bookingsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date().toISOString() } },
  );

  if (result.matchedCount === 0) {
    return res.status(404).send({ message: "Booking not found" });
  }

  res.send({ message: "Booking status updated successfully", status });
});

app.post("/bookings", async (req, res) => {
  if (!req.body?.userEmail) {
    return res.status(400).send({ message: "userEmail is required" });
  }

  const bookingData = {
    ...req.body,
    status: "pending",
    bookingDate: req.body.bookingDate ?? new Date().toISOString(),
  };

  const result = await bookingsCollection.insertOne(bookingData);
  console.log("Booking added successfully:", result);
  res.send({ message: "Booking added successfully", data: result });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
