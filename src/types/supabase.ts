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
      clients: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          carrier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          carrier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          carrier?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          garments: Json
          payment_info: Json
          description: string | null
          status: string
          due_date: string
          event_info: Json | null
          timeline: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          garments: Json
          payment_info: Json
          description?: string | null
          status: string
          due_date: string
          event_info?: Json | null
          timeline?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          garments?: Json
          payment_info?: Json
          description?: string | null
          status?: string
          due_date?: string
          event_info?: Json | null
          timeline?: Json
          created_at?: string
          updated_at?: string
        }
      }
      forms: {
        Row: {
          id: string
          full_name: string
          contact_number: string
          email_address: string
          date: string
          preferred_contact_method: string
          preferred_pickup_date: string
          dropoff_signature: string
          client_signature: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          contact_number: string
          email_address: string
          date: string
          preferred_contact_method: string
          preferred_pickup_date: string
          dropoff_signature: string
          client_signature: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          contact_number?: string
          email_address?: string
          date?: string
          preferred_contact_method?: string
          preferred_pickup_date?: string
          dropoff_signature?: string
          client_signature?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          type: string
          recipient: string
          subject: string | null
          content: string
          status: string
          tracking_id: string | null
          tracking_pixel: string | null
          delivered_at: string | null
          opened_at: string | null
          bounced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          recipient: string
          subject?: string | null
          content: string
          status: string
          tracking_id?: string | null
          tracking_pixel?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          bounced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          recipient?: string
          subject?: string | null
          content?: string
          status?: string
          tracking_id?: string | null
          tracking_pixel?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          bounced_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      revenue: {
        Row: {
          id: string
          year: number
          month: number
          revenue: number
          order_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: number
          month: number
          revenue?: number
          order_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: number
          month?: number
          revenue?: number
          order_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}