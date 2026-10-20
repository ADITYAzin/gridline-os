export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      checklist_items: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          item: string
          job_id: string
          org_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          item: string
          job_id: string
          org_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          item?: string
          job_id?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      company_services: {
        Row: {
          created_at: string
          default_price: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_services_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_assets: {
        Row: {
          asset_name: string
          brand: string
          created_at: string
          customer_id: string
          id: string
          installation_date: string | null
          location_tag: string | null
          model_number: string | null
          notes: string | null
          org_id: string
          serial_number: string | null
          status: string
          updated_at: string
          warranty_expires_at: string | null
        }
        Insert: {
          asset_name: string
          brand: string
          created_at?: string
          customer_id: string
          id?: string
          installation_date?: string | null
          location_tag?: string | null
          model_number?: string | null
          notes?: string | null
          org_id: string
          serial_number?: string | null
          status?: string
          updated_at?: string
          warranty_expires_at?: string | null
        }
        Update: {
          asset_name?: string
          brand?: string
          created_at?: string
          customer_id?: string
          id?: string
          installation_date?: string | null
          location_tag?: string | null
          model_number?: string | null
          notes?: string | null
          org_id?: string
          serial_number?: string | null
          status?: string
          updated_at?: string
          warranty_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_assets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string
          created_at: string
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          org_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          org_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          org_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          token_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_attendance: {
        Row: {
          check_in_at: string | null
          check_in_latitude: number | null
          check_in_longitude: number | null
          check_out_at: string | null
          check_out_latitude: number | null
          check_out_longitude: number | null
          created_at: string
          id: string
          job_id: string
          org_id: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          check_in_at?: string | null
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_out_at?: string | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          created_at?: string
          id?: string
          job_id: string
          org_id: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          check_in_at?: string | null
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_out_at?: string | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          created_at?: string
          id?: string
          job_id?: string
          org_id?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_attendance_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attendance_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attendance_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          captured_at: string
          created_at: string
          file_url: string
          id: string
          job_id: string
          latitude: number | null
          longitude: number | null
          org_id: string
          type: Database["public"]["Enums"]["photo_type"]
          uploaded_by: string
        }
        Insert: {
          captured_at: string
          created_at?: string
          file_url: string
          id?: string
          job_id: string
          latitude?: number | null
          longitude?: number | null
          org_id: string
          type: Database["public"]["Enums"]["photo_type"]
          uploaded_by: string
        }
        Update: {
          captured_at?: string
          created_at?: string
          file_url?: string
          id?: string
          job_id?: string
          latitude?: number | null
          longitude?: number | null
          org_id?: string
          type?: Database["public"]["Enums"]["photo_type"]
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string
          asset_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          customer_id: string
          id: string
          instructions: string | null
          issue: string
          job_number: string
          latitude: number | null
          longitude: number | null
          org_id: string
          priority: Database["public"]["Enums"]["job_priority"]
          service_type: string
          status: Database["public"]["Enums"]["job_status"]
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          address: string
          asset_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          id?: string
          instructions?: string | null
          issue: string
          job_number: string
          latitude?: number | null
          longitude?: number | null
          org_id: string
          priority?: Database["public"]["Enums"]["job_priority"]
          service_type: string
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          asset_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          instructions?: string | null
          issue?: string
          job_number?: string
          latitude?: number | null
          longitude?: number | null
          org_id?: string
          priority?: Database["public"]["Enums"]["job_priority"]
          service_type?: string
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "customer_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          is_onboarded: boolean
          job_sequence: number
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          subscription_tier: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_onboarded?: boolean
          job_sequence?: number
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          subscription_tier?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_onboarded?: boolean
          job_sequence?: number
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          subscription_tier?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          org_id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          org_id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          org_id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          end_at: string
          id: string
          job_id: string
          org_id: string
          start_at: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          job_id: string
          org_id: string
          start_at: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          job_id?: string
          org_id?: string
          start_at?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          customer_name: string
          id: string
          job_id: string
          org_id: string
          signature_url: string
          signed_at: string
        }
        Insert: {
          customer_name: string
          id?: string
          job_id: string
          org_id: string
          signature_url: string
          signed_at: string
        }
        Update: {
          customer_name?: string
          id?: string
          job_id?: string
          org_id?: string
          signature_url?: string
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_reports: {
        Row: {
          id: string
          job_id: string
          notes: string | null
          org_id: string
          result: string
          submitted_at: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          notes?: string | null
          org_id: string
          result: string
          submitted_at?: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          notes?: string | null
          org_id?: string
          result?: string
          submitted_at?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_reports_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_next_job_number: { Args: { p_org_id: string }; Returns: string }
      get_user_org_id: { Args: never; Returns: string }
    }
    Enums: {
      job_priority: "low" | "medium" | "high"
      job_status:
        | "pending"
        | "assigned"
        | "on_progress"
        | "completed"
        | "cancelled"
      lead_status: "new" | "contacted" | "qualified" | "lost"
      photo_type: "before" | "after"
      user_role: "admin" | "owner" | "technician"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      job_priority: ["low", "medium", "high"],
      job_status: [
        "pending",
        "assigned",
        "on_progress",
        "completed",
        "cancelled",
      ],
      lead_status: ["new", "contacted", "qualified", "lost"],
      photo_type: ["before", "after"],
      user_role: ["admin", "owner", "technician"],
    },
  },
} as const
