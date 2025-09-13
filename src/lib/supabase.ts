import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          personal_email: string | null
          college_email: string | null
          leetcode_username: string | null
          linkedin_url: string | null
          college_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          personal_email?: string | null
          college_email?: string | null
          leetcode_username?: string | null
          linkedin_url?: string | null
          college_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          personal_email?: string | null
          college_email?: string | null
          leetcode_username?: string | null
          linkedin_url?: string | null
          college_name?: string | null
          created_at?: string
        }
      }
      timetables: {
        Row: {
          id: string
          owner: string
          weekday: number
          period: number
          subject: string | null
          location: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          owner: string
          weekday: number
          period: number
          subject?: string | null
          location?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          owner?: string
          weekday?: number
          period?: number
          subject?: string | null
          location?: string | null
          notes?: string | null
        }
      }
      certificates: {
        Row: {
          id: string
          owner: string
          title: string
          description: string | null
          file_path: string
          category: string
          visibility: string
          created_at: string
        }
        Insert: {
          id?: string
          owner: string
          title: string
          description?: string | null
          file_path: string
          category?: string
          visibility?: string
          created_at?: string
        }
        Update: {
          id?: string
          owner?: string
          title?: string
          description?: string | null
          file_path?: string
          category?: string
          visibility?: string
          created_at?: string
        }
      }
    }
  }
}