
// Common types used across authentication services

export interface Credential {
  _id: string;
  username: string;
  password: string;
  timestamp: string;
}

export interface CredentialResult {
  success: boolean;
  id: string;
  error?: string;
}

export interface CredentialsResponse {
  success: boolean;
  data: Credential[];
}
