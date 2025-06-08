import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false, // Set to true only for debugging, not production
};

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Use a cached promise only in development
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
