
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
