import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Utility function to ensure valid session
export const ensureValidSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Session error:', error);
    throw new Error('Authentication session error');
  }
  
  if (!session) {
    throw new Error('No active session');
  }
  
  // Check if token is about to expire (within 5 minutes)
  const expiresAt = session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt - now;
  
  if (timeUntilExpiry < 300) { // Less than 5 minutes
    console.log('Token expiring soon, refreshing...');
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error('Token refresh failed:', refreshError);
      throw new Error('Failed to refresh authentication token');
    }
  }
  
  return session;
};

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
          avatar_url: string | null
          bio: string | null
          year_of_study: number | null
          branch: string | null
          phone_number: string | null
          leetcode_points: number
          streak_count: number
          total_problems_solved: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          personal_email?: string | null
          college_email?: string | null
          leetcode_username?: string | null
          linkedin_url?: string | null
          college_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          year_of_study?: number | null
          branch?: string | null
          phone_number?: string | null
          leetcode_points?: number
          streak_count?: number
          total_problems_solved?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          personal_email?: string | null
          college_email?: string | null
          leetcode_username?: string | null
          linkedin_url?: string | null
          college_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          year_of_study?: number | null
          branch?: string | null
          phone_number?: string | null
          leetcode_points?: number
          streak_count?: number
          total_problems_solved?: number
          created_at?: string
          updated_at?: string
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
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner: string
          weekday: number
          period: number
          subject?: string | null
          location?: string | null
          notes?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner?: string
          weekday?: number
          period?: number
          subject?: string | null
          location?: string | null
          notes?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
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
          issuer: string | null
          issue_date: string | null
          expiry_date: string | null
          verification_url: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner: string
          title: string
          description?: string | null
          file_path: string
          category?: string
          visibility?: string
          issuer?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          verification_url?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner?: string
          title?: string
          description?: string | null
          file_path?: string
          category?: string
          visibility?: string
          issuer?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          verification_url?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      store_products: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string | null
          price: number
          original_price: number | null
          category: string
          condition: string
          images: string[] | null
          tags: string[] | null
          location: string | null
          is_available: boolean
          is_negotiable: boolean
          contact_preference: string
          views_count: number
          favorites_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description?: string | null
          price: number
          original_price?: number | null
          category: string
          condition?: string
          images?: string[] | null
          tags?: string[] | null
          location?: string | null
          is_available?: boolean
          is_negotiable?: boolean
          contact_preference?: string
          views_count?: number
          favorites_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string | null
          price?: number
          original_price?: number | null
          category?: string
          condition?: string
          images?: string[] | null
          tags?: string[] | null
          location?: string | null
          is_available?: boolean
          is_negotiable?: boolean
          contact_preference?: string
          views_count?: number
          favorites_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      store_favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      store_messages: {
        Row: {
          id: string
          product_id: string
          sender_id: string
          receiver_id: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sender_id: string
          receiver_id: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      leetcode_stats: {
        Row: {
          id: string
          user_id: string
          leetcode_username: string
          total_solved: number
          easy_solved: number
          medium_solved: number
          hard_solved: number
          contest_rating: number
          contest_ranking: number | null
          acceptance_rate: number
          streak_count: number
          max_streak: number
          last_solved_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          leetcode_username: string
          total_solved?: number
          easy_solved?: number
          medium_solved?: number
          hard_solved?: number
          contest_rating?: number
          contest_ranking?: number | null
          acceptance_rate?: number
          streak_count?: number
          max_streak?: number
          last_solved_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          leetcode_username?: string
          total_solved?: number
          easy_solved?: number
          medium_solved?: number
          hard_solved?: number
          contest_rating?: number
          contest_ranking?: number | null
          acceptance_rate?: number
          streak_count?: number
          max_streak?: number
          last_solved_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leetcode_submissions: {
        Row: {
          id: string
          user_id: string
          problem_title: string
          problem_difficulty: string | null
          problem_url: string | null
          submission_date: string
          runtime: number | null
          memory_usage: number | null
          language: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          problem_title: string
          problem_difficulty?: string | null
          problem_url?: string | null
          submission_date: string
          runtime?: number | null
          memory_usage?: number | null
          language?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          problem_title?: string
          problem_difficulty?: string | null
          problem_url?: string | null
          submission_date?: string
          runtime?: number | null
          memory_usage?: number | null
          language?: string | null
          created_at?: string
        }
      }
      college_rankings: {
        Row: {
          id: string
          college_name: string
          total_students: number
          average_problems_solved: number
          total_problems_solved: number
          rank_position: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          college_name: string
          total_students?: number
          average_problems_solved?: number
          total_problems_solved?: number
          rank_position?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          college_name?: string
          total_students?: number
          average_problems_solved?: number
          total_problems_solved?: number
          rank_position?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          event_type: string
          start_date: string
          end_date: string | null
          location: string | null
          college_specific: string | null
          registration_required: boolean
          registration_link: string | null
          max_participants: number | null
          current_participants: number
          tags: string[] | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          event_type?: string
          start_date: string
          end_date?: string | null
          location?: string | null
          college_specific?: string | null
          registration_required?: boolean
          registration_link?: string | null
          max_participants?: number | null
          current_participants?: number
          tags?: string[] | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          event_type?: string
          start_date?: string
          end_date?: string | null
          location?: string | null
          college_specific?: string | null
          registration_required?: boolean
          registration_link?: string | null
          max_participants?: number | null
          current_participants?: number
          tags?: string[] | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          registration_date: string
          status: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          registration_date?: string
          status?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          registration_date?: string
          status?: string
        }
      }
      study_groups: {
        Row: {
          id: string
          creator_id: string
          name: string
          description: string | null
          subject: string | null
          college_name: string | null
          max_members: number
          current_members: number
          is_private: boolean
          invite_code: string | null
          meeting_schedule: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          description?: string | null
          subject?: string | null
          college_name?: string | null
          max_members?: number
          current_members?: number
          is_private?: boolean
          invite_code?: string | null
          meeting_schedule?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          description?: string | null
          subject?: string | null
          college_name?: string | null
          max_members?: number
          current_members?: number
          is_private?: boolean
          invite_code?: string | null
          meeting_schedule?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
    }
  }
}