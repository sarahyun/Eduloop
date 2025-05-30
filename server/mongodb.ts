import { MongoClient, Db } from 'mongodb';

const MONGO_DB_URI = "mongodb+srv://sarahyun02:admin@cluster0.y9oxu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (!client) {
    client = new MongoClient(MONGO_DB_URI);
    await client.connect();
    db = client.db('CollegeCounselingDB');
    console.log('Connected to MongoDB');
  }
  return db;
}

export { db };

// Initialize connection
connectToMongoDB().catch(console.error);