export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    token: string;
  };
}

export interface ApiErrorResponse {
  msg: string;
  success: boolean;
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}