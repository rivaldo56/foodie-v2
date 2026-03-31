export type UserRole = 'client' | 'chef' | 'admin' | 'farmer' | 'business';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  onboarding_status: 'not_started' | 'in_progress' | 'complete';
  is_verified: boolean;
  profile_picture?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: any }) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}
