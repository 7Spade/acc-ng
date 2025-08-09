
export interface LoginResponse {
  msg: string;
  user?: {
    id: string;
    email: string | null;
    name: string;
    token: string;
    uid?: string;
    isAdmin?: boolean;
    isAnonymous?: boolean;
    time?: number;
    expired?: number;
  };
}

export interface ApiErrorResponse {
  error: string;
  code?: number;
}

export interface FirebaseUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}
