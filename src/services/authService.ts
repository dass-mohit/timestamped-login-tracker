
import { RemoteDataService } from './remoteDataService';
import { LocalStorageService } from './localStorageService';
import { Credential, CredentialResult, CredentialsResponse } from './types';

// Create singleton instances
const remoteDataService = new RemoteDataService();
const localStorageService = new LocalStorageService();

export async function storeLoginCredential(username: string, password: string): Promise<CredentialResult> {
  console.log('storeLoginCredential: Attempting to store credential:', { username });
  
  try {
    // Try remote storage first
    const result = await remoteDataService.storeCredential(username, password);
    console.log('storeLoginCredential: Credential storage result:', result);
    
    if (!result.success && result.error) {
      console.warn(`storeLoginCredential: Remote storage failed: ${result.error}, falling back to localStorage`);
      
      // Fall back to localStorage if the remote service fails
      const localResult = localStorageService.storeCredential(username, password);
      return localResult;
    }
    
    return result;
  } catch (error) {
    console.error("storeLoginCredential: Unexpected error:", error);
    
    // Fall back to localStorage as a last resort
    const localResult = localStorageService.storeCredential(username, password);
    return localResult;
  }
}

export async function getLoginCredentials(): Promise<CredentialsResponse> {
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
    const localCredentials = localStorageService.getCredentials();
    
    // Sort by timestamp in descending order (newest first)
    localCredentials.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return { success: true, data: localCredentials };
  }
}

// For backward compatibility, export the Credential type
export type { Credential } from './types';
