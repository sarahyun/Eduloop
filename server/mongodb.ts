import { MongoClient, Db } from 'mongodb';

const MONGO_DB_URI = process.env.MONGODB_URI || "mongodb+srv://sarahyun02:admin@cluster0.y9oxu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  if (!client || !db) {
    try {
      client = new MongoClient(MONGO_DB_URI);
      await client.connect();
      db = client.db('CollegeCounselingDB');
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  return db;
}

export { db };