# Wonderlast server

## Seed destination data

The server stores destinations in the `wonderlust.destinations` MongoDB collection. To load the sample catalog:

1. Make sure `.env` contains a valid `MONGODB_URI`.
2. Start MongoDB access and run the server dependencies install if needed:

   ```bash
   npm install
   ```

3. Run the idempotent seed:

   ```bash
   npm run seed
   ```

The seed creates 12 realistic destinations and uses the `slug` field as the unique key. You can run `npm run seed` repeatedly; existing sample records are updated instead of duplicated. The records use direct `images.unsplash.com` URLs with crop and quality parameters, so they can be used directly by image components that allow that host.

The API also exposes `GET /destinations/:slug` for the frontend destination details page.

Start the API separately with:

```bash
node index.js
```
