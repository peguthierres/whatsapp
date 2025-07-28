import { supabase } from './supabase';

export interface AuthResponse {
  data: {
    user: any;
    session: any;
  };
  error: any;
}

export const auth = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signUp(email: string, password: string): Promise<AuthResponse> {
    return supabase.auth.signUp({
      email,
      password,
    });
  },

  async signOut(): Promise<AuthResponse> {
    return supabase.auth.signOut();
  },

  async getUser(): Promise<AuthResponse> {
    return supabase.auth.getUser();
  },

  async updateProfile({ email, password }: { email?: string; password?: string }): Promise<AuthResponse> {
    return supabase.auth.updateUser({
      email,
      password,
    });
  },
};
