import { AuthError, Session, User as SupabaseUser } from '@supabase/auth-js';
import { supabase } from './supabase';
import { User } from '../types';

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

export const auth = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return {
      data: {
        user: data.user as User,
        session: data.session
      },
      error: null
    };
  },

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return {
      data: {
        user: data.user as User,
        session: data.session
      },
      error: null
    };
  },

  async signOut(): Promise<AuthResponse> {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
    return {
      data: {
        user: null,
        session: null
      },
      error: null
    };
  },

  async getUser(): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;
    return {
      data: {
        user: data.user as User,
        session: data.session
      },
      error: null
    };
  },

  async updateProfile({ email, password }: { email?: string; password?: string }): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (error) throw error;
    return {
      data: {
        user: data.user as User,
        session: data.session
      },
      error: null
    };
  },

  async deleteUser(): Promise<AuthResponse> {
    const { error } = await supabase.auth.deleteUser();

    if (error) throw error;
    return {
      data: {
        user: null,
        session: null
      },
      error: null
    };
  },
};
