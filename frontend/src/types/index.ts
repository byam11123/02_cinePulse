// Define types for content items
export interface ContentItem {
  id: number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  first_air_date?: string;
  adult?: boolean;
  overview?: string;
}

export interface Trailer {
  key: string;
}

export interface SearchEntry {
  id: number;
  title?: string;
  name?: string;
  image?: string;
  createdAt: string;
  searchType: string;
}

// Auth types
export interface User {
  _id: string;
  username: string;
  email: string;
  image?: string;
}

export interface AuthState {
  user: User | null;
  isSigningUp: boolean;
  isCheckingAuth: boolean;
  isLoggingOut: boolean;
  isLogginIn: boolean;
  signup: (credentials: {
    username: string;
    email: string;
    password: string;
  }) => Promise<any>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  authCheck: () => Promise<void>;
}

// Content types
export interface ContentState {
  contentType: string;
  setContentType: (type: string) => void;
}
