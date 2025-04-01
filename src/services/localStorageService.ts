
import { Credential } from './types';

export class LocalStorageService {
  private readonly STORAGE_KEY = 'instagram_login_credentials';
  
  storeCredentials(credentials: Credential[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
      console.log('LocalStorageService: Stored credentials in localStorage');
    } catch (error) {
      console.error('LocalStorageService: Failed to store in localStorage:', error);
    }
  }
  
  getCredentials(): Credential[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        console.log('LocalStorageService: No data in localStorage');
        return [];
      }
      const data = JSON.parse(storedData) as Credential[];
      console.log('LocalStorageService: Retrieved data from localStorage, count:', data.length);
      return data;
    } catch (error) {
      console.error("LocalStorageService: Failed to retrieve from localStorage:", error);
      return [];
    }
  }
  
  storeCredential(username: string, password: string): { success: boolean, id: string } {
    try {
      console.log('LocalStorageService: Storing in localStorage');
      
      // Get existing credentials from localStorage
      const existingCredentials = this.getCredentials();
      
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
      this.storeCredentials(existingCredentials);
      console.log('LocalStorageService: Successfully stored in localStorage');
      
      return { success: true, id: newCredential._id };
    } catch (error) {
      console.error("LocalStorageService: Failed to store in localStorage:", error);
      return { success: false, id: '' };
    }
  }
}
