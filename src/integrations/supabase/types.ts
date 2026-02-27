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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_snapshots: {
        Row: {
          beneficiary_count: number | null
          created_at: string | null
          id: string
          snapshot_date: string | null
          total_donation: number | null
          total_expense: number | null
          volunteer_count: number | null
        }
        Insert: {
          beneficiary_count?: number | null
          created_at?: string | null
          id?: string
          snapshot_date?: string | null
          total_donation?: number | null
          total_expense?: number | null
          volunteer_count?: number | null
        }
        Update: {
          beneficiary_count?: number | null
          created_at?: string | null
          id?: string
          snapshot_date?: string | null
          total_donation?: number | null
          total_expense?: number | null
          volunteer_count?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          address: string | null
          assistance_history: Json | null
          category: string | null
          contact: string | null
          created_at: string | null
          description: string | null
          documents: Json | null
          full_name: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          phone: string | null
          project_id: string | null
        }
        Insert: {
          address?: string | null
          assistance_history?: Json | null
          category?: string | null
          contact?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          full_name?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          phone?: string | null
          project_id?: string | null
        }
        Update: {
          address?: string | null
          assistance_history?: Json | null
          category?: string | null
          contact?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          full_name?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          phone?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          slug: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string | null
          title?: string
        }
        Relationships: []
      }
      blood_donors: {
        Row: {
          blood_group: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          last_donation_date: string | null
          location: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          blood_group?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          last_donation_date?: string | null
          location?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          blood_group?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          last_donation_date?: string | null
          location?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blood_requests: {
        Row: {
          approved_by: string | null
          blood_group: string | null
          contact: string | null
          created_at: string | null
          id: string
          location: string | null
          patient_name: string | null
          provider_name: string | null
          requested_by: string | null
          required_date: string | null
          status: string | null
          urgency: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          approved_by?: string | null
          blood_group?: string | null
          contact?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          patient_name?: string | null
          provider_name?: string | null
          requested_by?: string | null
          required_date?: string | null
          status?: string | null
          urgency?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          approved_by?: string | null
          blood_group?: string | null
          contact?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          patient_name?: string | null
          provider_name?: string | null
          requested_by?: string | null
          required_date?: string | null
          status?: string | null
          urgency?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          code: string | null
          contact: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          manager_name: string | null
          name: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          contact?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          manager_name?: string | null
          name?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          contact?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          manager_name?: string | null
          name?: string | null
        }
        Relationships: []
      }
      case_logs: {
        Row: {
          case_id: string | null
          created_at: string | null
          id: string
          log_text: string | null
          logged_by: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          log_text?: string | null
          logged_by?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          log_text?: string | null
          logged_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_worker_id: string | null
          beneficiary_id: string | null
          case_id: string | null
          created_at: string | null
          id: string
          priority: string | null
          private_notes: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_worker_id?: string | null
          beneficiary_id?: string | null
          case_id?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          private_notes?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_worker_id?: string | null
          beneficiary_id?: string | null
          case_id?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          private_notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          avatar_url: string | null
          channel: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          last_sent_at: string | null
          message: string
          organization_id: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          last_sent_at?: string | null
          message: string
          organization_id?: string | null
          user_id: string
          username?: string
        }
        Update: {
          avatar_url?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          last_sent_at?: string | null
          message?: string
          organization_id?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
        }
        Relationships: []
      }
      custom_fonts: {
        Row: {
          created_at: string | null
          font_url: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          font_url?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          font_url?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      custom_forms: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_forms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          title: string
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
          visibility: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
          visibility?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      donation_campaigns: {
        Row: {
          created_at: string | null
          current_amount: number | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          target_amount: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          target_amount?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          target_amount?: number | null
          title?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          id: string
          metadata: Json | null
          method: string | null
          payment_method: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          metadata?: Json | null
          method?: string | null
          payment_method?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          metadata?: Json | null
          method?: string | null
          payment_method?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_major: boolean | null
          lifetime_donation: number | null
          notes: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_major?: boolean | null
          lifetime_donation?: number | null
          notes?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_major?: boolean | null
          lifetime_donation?: number | null
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          sent_at: string | null
          status: string | null
          subject: string | null
          template_data: Json | null
          to_email: string
          type: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_data?: Json | null
          to_email: string
          type?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_data?: Json | null
          to_email?: string
          type?: string | null
        }
        Relationships: []
      }
      emergency_campaigns: {
        Row: {
          badge_text: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          is_active: boolean | null
          raised_amount: number | null
          redirect_url: string | null
          target_amount: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          badge_text?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          raised_amount?: number | null
          redirect_url?: string | null
          target_amount?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          badge_text?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          raised_amount?: number | null
          redirect_url?: string | null
          target_amount?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event_attendance: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string | null
          event_id: string | null
          id: string
          token: string | null
          user_id: string | null
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          token?: string | null
          user_id?: string | null
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          token?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          budget: number | null
          created_at: string | null
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          slug: string | null
          title: string
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          slug?: string | null
          title: string
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          slug?: string | null
          title?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string | null
          description: string | null
          expense_date: string | null
          id: string
          receipt_url: string | null
          status: string | null
          title: string
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string | null
          id?: string
          receipt_url?: string | null
          status?: string | null
          title: string
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string | null
          id?: string
          receipt_url?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string | null
          data: Json
          form_id: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          form_id: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          form_id?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "custom_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string | null
          title: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          title?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      grant_utilizations: {
        Row: {
          amount: number | null
          created_at: string | null
          date: string | null
          grant_id: string | null
          id: string
          purpose: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          date?: string | null
          grant_id?: string | null
          id?: string
          purpose?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          date?: string | null
          grant_id?: string | null
          id?: string
          purpose?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grant_utilizations_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          project_id: string | null
          source: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          utilized: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_id?: string | null
          source?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          utilized?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_id?: string | null
          source?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          utilized?: number | null
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          animation: Json | null
          config: Json | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_visible: boolean | null
          layout: Json | null
          position: number | null
          section_key: string | null
          style: Json | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          animation?: Json | null
          config?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_visible?: boolean | null
          layout?: Json | null
          position?: number | null
          section_key?: string | null
          style?: Json | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          animation?: Json | null
          config?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_visible?: boolean | null
          layout?: Json | null
          position?: number | null
          section_key?: string | null
          style?: Json | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      income_records: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          income_date: string | null
          source: string | null
          title: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          income_date?: string | null
          source?: string | null
          title: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          income_date?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          branch_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          low_stock_threshold: number | null
          name: string | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          branch_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          low_stock_threshold?: number | null
          name?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          branch_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          low_stock_threshold?: number | null
          name?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          note: string | null
          quantity: number | null
          reference: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          note?: string | null
          quantity?: number | null
          reference?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          note?: string | null
          quantity?: number | null
          reference?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          agreed_terms: boolean | null
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          agreed_terms?: boolean | null
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          agreed_terms?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          channel: string | null
          created_at: string | null
          id: string
          message: string
          recipient_email: string | null
          recipient_id: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          id?: string
          message: string
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          id?: string
          message?: string
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string | null
          organization_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          branding: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          mission: string | null
          name: string
          slug: string | null
          theme_config: Json | null
          vision: string | null
        }
        Insert: {
          branding?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          mission?: string | null
          name: string
          slug?: string | null
          theme_config?: Json | null
          vision?: string | null
        }
        Update: {
          branding?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          mission?: string | null
          name?: string
          slug?: string | null
          theme_config?: Json | null
          vision?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          page_id: string | null
          position: number | null
          settings: Json | null
          type: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          page_id?: string | null
          position?: number | null
          settings?: Json | null
          type?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          page_id?: string | null
          position?: number | null
          settings?: Json | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string | null
          id: string
          layout: Json | null
          seo: Json | null
          slug: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          layout?: Json | null
          seo?: Json | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          layout?: Json | null
          seo?: Json | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          donor_name: string | null
          email: string | null
          id: string
          invoice_id: string | null
          payment_method: string | null
          raw_response: Json | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          donor_name?: string | null
          email?: string | null
          id?: string
          invoice_id?: string | null
          payment_method?: string | null
          raw_response?: Json | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          donor_name?: string | null
          email?: string | null
          id?: string
          invoice_id?: string | null
          payment_method?: string | null
          raw_response?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          poll_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          poll_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allow_multiple: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          options: Json
          organization_id: string | null
          question: string
          show_results: boolean | null
        }
        Insert: {
          allow_multiple?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          organization_id?: string | null
          question: string
          show_results?: boolean | null
        }
        Update: {
          allow_multiple?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          organization_id?: string | null
          question?: string
          show_results?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          blood_group: string | null
          created_at: string | null
          custom_fields: Json | null
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          occupation: string | null
          social_facebook: string | null
          social_linkedin: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          blood_group?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          occupation?: string | null
          social_facebook?: string | null
          social_linkedin?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          blood_group?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          occupation?: string | null
          social_facebook?: string | null
          social_linkedin?: string | null
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          branch_id: string | null
          budget: number | null
          created_at: string | null
          description: string | null
          funding_current: number | null
          funding_target: number | null
          id: string
          impact_metrics: Json | null
          milestone: Json | null
          slug: string | null
          status: string | null
          title: string
        }
        Insert: {
          branch_id?: string | null
          budget?: number | null
          created_at?: string | null
          description?: string | null
          funding_current?: number | null
          funding_target?: number | null
          id?: string
          impact_metrics?: Json | null
          milestone?: Json | null
          slug?: string | null
          status?: string | null
          title: string
        }
        Update: {
          branch_id?: string | null
          budget?: number | null
          created_at?: string | null
          description?: string | null
          funding_current?: number | null
          funding_target?: number | null
          id?: string
          impact_metrics?: Json | null
          milestone?: Json | null
          slug?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_donations: {
        Row: {
          amount: number
          charge_count: number | null
          created_at: string | null
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          frequency: string
          id: string
          last_charged_at: string | null
          metadata: Json | null
          next_charge_date: string | null
          plan_id: string | null
          status: string | null
          total_charged: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          charge_count?: number | null
          created_at?: string | null
          donor_email?: string | null
          donor_name: string
          donor_phone?: string | null
          frequency?: string
          id?: string
          last_charged_at?: string | null
          metadata?: Json | null
          next_charge_date?: string | null
          plan_id?: string | null
          status?: string | null
          total_charged?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          charge_count?: number | null
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          frequency?: string
          id?: string
          last_charged_at?: string | null
          metadata?: Json | null
          next_charge_date?: string | null
          plan_id?: string | null
          status?: string | null
          total_charged?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          file_url: string | null
          id: string
          title: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          title?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          title?: string | null
          year?: number | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          id: string
          module: string | null
          role_name: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          id?: string
          module?: string | null
          role_name?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          id?: string
          module?: string | null
          role_name?: string | null
        }
        Relationships: []
      }
      section_blocks: {
        Row: {
          animation: Json | null
          config: Json | null
          content: Json | null
          created_at: string | null
          id: string
          layout: Json | null
          parent_id: string | null
          position: number | null
          section_id: string | null
          style: Json | null
          type: string | null
        }
        Insert: {
          animation?: Json | null
          config?: Json | null
          content?: Json | null
          created_at?: string | null
          id?: string
          layout?: Json | null
          parent_id?: string | null
          position?: number | null
          section_id?: string | null
          style?: Json | null
          type?: string | null
        }
        Update: {
          animation?: Json | null
          config?: Json | null
          content?: Json | null
          created_at?: string | null
          id?: string
          layout?: Json | null
          parent_id?: string | null
          position?: number | null
          section_id?: string | null
          style?: Json | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_blocks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "page_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sponsorships: {
        Row: {
          amount: number | null
          beneficiary_id: string | null
          created_at: string | null
          end_date: string | null
          frequency: string | null
          id: string
          notes: string | null
          sponsor_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          beneficiary_id?: string | null
          created_at?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          beneficiary_id?: string | null
          created_at?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsorships_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorships_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_backups: {
        Row: {
          backup_type: string | null
          created_at: string | null
          file_url: string | null
          id: string
        }
        Insert: {
          backup_type?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
        }
        Update: {
          backup_type?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string | null
          role: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          role?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          background_color: string | null
          body_font: string | null
          config: Json | null
          created_at: string | null
          font_family: string | null
          heading_font: string | null
          id: string
          primary_color: string | null
          secondary_color: string | null
          typography: Json | null
        }
        Insert: {
          background_color?: string | null
          body_font?: string | null
          config?: Json | null
          created_at?: string | null
          font_family?: string | null
          heading_font?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          typography?: Json | null
        }
        Update: {
          background_color?: string | null
          body_font?: string | null
          config?: Json | null
          created_at?: string | null
          font_family?: string | null
          heading_font?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          typography?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles_map: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      volunteer_availability: {
        Row: {
          available_date: string
          created_at: string | null
          id: string
          notes: string | null
          time_slot: string | null
          volunteer_id: string | null
        }
        Insert: {
          available_date: string
          created_at?: string | null
          id?: string
          notes?: string | null
          time_slot?: string | null
          volunteer_id?: string | null
        }
        Update: {
          available_date?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          time_slot?: string | null
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_availability_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_tasks: {
        Row: {
          assigned_user_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string | null
          title: string | null
          volunteer_id: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string | null
          volunteer_id?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string | null
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_tasks_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          badge: string | null
          branch_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_public: boolean | null
          phone: string | null
          skills: string[] | null
          status: string | null
          total_hours: number | null
        }
        Insert: {
          badge?: string | null
          branch_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_public?: boolean | null
          phone?: string | null
          skills?: string[] | null
          status?: string | null
          total_hours?: number | null
        }
        Update: {
          badge?: string | null
          branch_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_public?: boolean | null
          phone?: string | null
          skills?: string[] | null
          status?: string | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "member"
        | "viewer"
        | "fundraiser"
        | "finance_manager"
        | "content_manager"
        | "volunteer_manager"
        | "blood_manager"
        | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: [
        "super_admin",
        "admin",
        "member",
        "viewer",
        "fundraiser",
        "finance_manager",
        "content_manager",
        "volunteer_manager",
        "blood_manager",
        "user",
      ],
    },
  },
} as const
