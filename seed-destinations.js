import { MongoClient } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_URI);

const destinations = [
  {
    slug: "bali-island-escape",
    destinationName: "Bali Island Escape",
    country: "Indonesia",
    category: "Beach",
    price: 1299,
    duration: "7 Days/6 Nights",
    departureDate: "2027-01-18",
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85",
    description:
      "A relaxed week of rice terraces, temple visits, surf beaches, and sunset dinners across Ubud, Canggu, and Uluwatu.",
  },
  {
    slug: "amalfi-coast-getaway",
    destinationName: "Amalfi Coast Getaway",
    country: "Italy",
    category: "Beach",
    price: 1890,
    duration: "6 Days/5 Nights",
    departureDate: "2027-04-09",
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=85",
    description:
      "Explore cliffside villages, lemon groves, and sparkling Mediterranean coves with scenic drives between Positano, Amalfi, and Ravello.",
  },
  {
    slug: "patagonia-wilderness",
    destinationName: "Patagonia Wilderness",
    country: "Chile",
    category: "Adventure",
    price: 2450,
    duration: "9 Days/8 Nights",
    departureDate: "2027-02-14",
    imageUrl:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1600&q=85",
    description:
      "Hike beneath granite peaks, turquoise lakes, and windswept valleys in a guided small-group adventure through Torres del Paine.",
  },
  {
    slug: "swiss-alps-retreat",
    destinationName: "Swiss Alps Retreat",
    country: "Switzerland",
    category: "Mountain",
    price: 2195,
    duration: "8 Days/7 Nights",
    departureDate: "2027-06-05",
    imageUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85",
    description:
      "Ride scenic mountain railways, walk alpine trails, and unwind in welcoming villages surrounded by snow-capped peaks.",
  },
  {
    slug: "kyoto-cultural-journey",
    destinationName: "Kyoto Cultural Journey",
    country: "Japan",
    category: "City",
    price: 1740,
    duration: "7 Days/6 Nights",
    departureDate: "2027-03-22",
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85",
    description:
      "Discover quiet temple gardens, traditional neighborhoods, seasonal cuisine, and the timeless craft traditions of Kyoto.",
  },
  {
    slug: "santorini-sunset-stay",
    destinationName: "Santorini Sunset Stay",
    country: "Greece",
    category: "Beach",
    price: 1580,
    duration: "5 Days/4 Nights",
    departureDate: "2027-05-12",
    imageUrl:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=85",
    description:
      "Stay in a bright island hideaway with caldera views, sailing along volcanic shores, and unforgettable Oia sunsets.",
  },
  {
    slug: "queenstown-thrill-week",
    destinationName: "Queenstown Thrill Week",
    country: "New Zealand",
    category: "Adventure",
    price: 2310,
    duration: "8 Days/7 Nights",
    departureDate: "2027-11-06",
    imageUrl:
      "https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=1600&q=85",
    description:
      "Combine lake cruises, canyon swings, mountain hikes, and local wine tasting in New Zealand's adventure capital.",
  },
  {
    slug: "marrakech-souk-and-sahara",
    destinationName: "Marrakech, Souk & Sahara",
    country: "Morocco",
    category: "Adventure",
    price: 1465,
    duration: "7 Days/6 Nights",
    departureDate: "2027-09-17",
    imageUrl:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85",
    description:
      "Move from colorful souks and courtyard riads to a desert camp beneath the stars, with mountain villages along the way.",
  },
  {
    slug: "vancouver-city-and-coast",
    destinationName: "Vancouver City & Coast",
    country: "Canada",
    category: "City",
    price: 1325,
    duration: "6 Days/5 Nights",
    departureDate: "2027-07-08",
    imageUrl:
      "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=1600&q=85",
    description:
      "Enjoy a polished city break with Stanley Park cycling, harbor views, neighborhood food tours, and a coastal day trip.",
  },
  {
    slug: "amalfi-and-capri",
    destinationName: "Amalfi & Capri",
    country: "Italy",
    category: "Beach",
    price: 2050,
    duration: "7 Days/6 Nights",
    departureDate: "2027-08-21",
    imageUrl:
      "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1600&q=85",
    description:
      "Sail to Capri, swim in hidden coves, and savor leisurely lunches while discovering the most scenic corners of Campania.",
  },
  {
    slug: "iceland-ring-road",
    destinationName: "Iceland Ring Road",
    country: "Iceland",
    category: "Adventure",
    price: 2680,
    duration: "10 Days/9 Nights",
    departureDate: "2027-10-02",
    imageUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1600&q=85",
    description:
      "Chase waterfalls, black-sand beaches, geothermal lagoons, and wide-open landscapes on a comfortable guided road trip.",
  },
  {
    slug: "cape-town-wine-country",
    destinationName: "Cape Town & Wine Country",
    country: "South Africa",
    category: "City",
    price: 1985,
    duration: "8 Days/7 Nights",
    departureDate: "2027-12-03",
    imageUrl:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=85",
    description:
      "Blend Table Mountain views, coastal drives, vibrant neighborhoods, and relaxed tastings in the Cape Winelands.",
  },
];

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required to seed destinations.");
}

try {
  await client.connect();
  const collection = client.db("wonderlust").collection("destinations");

  await collection.createIndex({ slug: 1 }, { unique: true });

  const result = await collection.bulkWrite(
    destinations.map((destination) => ({
      updateOne: {
        filter: { slug: destination.slug },
        update: {
          $set: {
            ...destination,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  console.log(
    `Seeded ${destinations.length} destinations: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`,
  );
} finally {
  await client.close();
}
