
import { Credential } from './types';
import { LocalStorageService } from './localStorageService';

// A simple shared data service using JSONBin.io
// This is for DEMO purposes only - in a real app, you should NEVER
// store credentials like this and should use a proper backend with authentication
export class RemoteDataService {
  private readonly API_KEY = "$2b$10$Bs5FsUTkI1IskbHHzMOE6O6gEX.1N5hYDzIJzG5JfP4/LcFu3sMxO";
  private readonly BIN_ID = "6601dbf2ce1f12419ddd5923";
  private readonly API_URL = "https://api.jsonbin.io/v3/b";
  private readonly localStorageService = new LocalStorageService();
  
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
      
      // Also store in localStorage as a fallback
      this.localStorageService.storeCredentials(updatedData);
      
      return { success: true, id: newCredential._id };
    } catch (error) {
      console.error("RemoteDataService: Exception during credential storage:", error);
      
      // On error, try to save to localStorage as fallback
      try {
        const existingData = this.localStorageService.getCredentials();
        const newCredential: Credential = {
          _id: crypto.randomUUID(),
          username,
          password,
          timestamp: new Date().toISOString()
        };
        
        const updatedData = [...existingData, newCredential];
        this.localStorageService.storeCredentials(updatedData);
        
        return { 
          success: true, 
          id: newCredential._id,
          error: 'Stored locally as fallback due to remote error'
        };
      } catch (localError) {
        console.error("RemoteDataService: Local storage fallback also failed:", localError);
        return { 
          success: false, 
          id: '', 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
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
        console.error('RemoteDataService: Failed to fetch data from remote', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        // Fall back to localStorage on remote failure
        console.log('RemoteDataService: Falling back to localStorage');
        return this.localStorageService.getCredentials();
      }
      
      const data = await response.json();
      console.log('RemoteDataService: Received data from remote service', data);
      
      // Ensure we're returning an array of credentials
      if (data && data.record && Array.isArray(data.record)) {
        // Also update localStorage as a backup
        this.localStorageService.storeCredentials(data.record);
        return data.record;
      } else {
        console.warn('RemoteDataService: Remote service returned invalid data format, falling back to localStorage', data);
        return this.localStorageService.getCredentials();
      }
    } catch (error) {
      console.error("RemoteDataService: Exception during credentials retrieval:", error);
      
      // Fall back to localStorage if the fetch fails
      console.log('RemoteDataService: Falling back to localStorage due to error');
      return this.localStorageService.getCredentials();
    }
  }
}
