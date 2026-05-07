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
      analytics_events: {
        Row: {
          created_at: string
          event_name: Database["public"]["Enums"]["analytics_event_name"]
          id: string
          metadata: Json | null
          package: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: Database["public"]["Enums"]["analytics_event_name"]
          id?: string
          metadata?: Json | null
          package?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: Database["public"]["Enums"]["analytics_event_name"]
          id?: string
          metadata?: Json | null
          package?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount_applied: number
          id: string
          order_id: string | null
          package_id: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_applied: number
          id?: string
          order_id?: string | null
          package_id?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_applied?: number
          id?: string
          order_id?: string | null
          package_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "discount_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "credit_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_packages: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          credits: number
          display_order: number
          future_price_eur: number | null
          id: string
          name: string
          price_eur: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          credits: number
          display_order?: number
          future_price_eur?: number | null
          id?: string
          name: string
          price_eur: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          credits?: number
          display_order?: number
          future_price_eur?: number | null
          id?: string
          name?: string
          price_eur?: number
          updated_at?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          type: Database["public"]["Enums"]["credit_tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          type: Database["public"]["Enums"]["credit_tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["credit_tx_type"]
          user_id?: string
        }
        Relationships: []
      }
      daily_messages: {
        Row: {
          created_at: string
          id: string
          message_id: number
          shown_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: number
          shown_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: number
          shown_date?: string
          user_id?: string
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          active: boolean
          allowed_package_ids: string[]
          code: string
          created_at: string
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          ends_at: string | null
          id: string
          max_uses: number | null
          max_uses_per_user: number | null
          notes: string | null
          starts_at: string | null
          updated_at: string
          uses_count: number
        }
        Insert: {
          active?: boolean
          allowed_package_ids?: string[]
          code: string
          created_at?: string
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          notes?: string | null
          starts_at?: string | null
          updated_at?: string
          uses_count?: number
        }
        Update: {
          active?: boolean
          allowed_package_ids?: string[]
          code?: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          notes?: string | null
          starts_at?: string | null
          updated_at?: string
          uses_count?: number
        }
        Relationships: []
      }
      message_reveals: {
        Row: {
          id: string
          message_id: number
          revealed_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: number
          revealed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: number
          revealed_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
        }
        Insert: {
          content: string
          created_at?: string
          id: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount: number
          created_at: string
          credits: number
          id: string
          ifthenpay_entity: string | null
          ifthenpay_payment_url: string | null
          ifthenpay_reference: string | null
          ifthenpay_request_id: string | null
          mbway_phone: string | null
          order_id: string
          package: string
          paid_at: string | null
          payment_method: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits: number
          id?: string
          ifthenpay_entity?: string | null
          ifthenpay_payment_url?: string | null
          ifthenpay_reference?: string | null
          ifthenpay_request_id?: string | null
          mbway_phone?: string | null
          order_id: string
          package: string
          paid_at?: string | null
          payment_method: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits?: number
          id?: string
          ifthenpay_entity?: string | null
          ifthenpay_payment_url?: string | null
          ifthenpay_reference?: string | null
          ifthenpay_request_id?: string | null
          mbway_phone?: string | null
          order_id?: string
          package?: string
          paid_at?: string | null
          payment_method?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean
          author: string
          created_at: string
          display_order: number
          id: string
          quote: string
          rating: number
          role: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          author: string
          created_at?: string
          display_order?: number
          id?: string
          quote: string
          rating?: number
          role?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          author?: string
          created_at?: string
          display_order?: number
          id?: string
          quote?: string
          rating?: number
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          credits: number
          updated_at: string
          user_id: string
        }
        Insert: {
          credits?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          credits?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      welcome_credit_grants: {
        Row: {
          granted_at: string
          id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          _amount: number
          _description?: string
          _type: Database["public"]["Enums"]["credit_tx_type"]
          _user_id: string
        }
        Returns: number
      }
      consume_one_credit: {
        Args: { _description?: string; _user_id: string }
        Returns: number
      }
      get_funnel_stats:
        | {
            Args: { _since?: string }
            Returns: {
              click_receive_message: number
              landing_views: number
              package_selected: number
              paywall_views: number
              purchase_attempts: number
              purchase_success: number
              reveal_attempts: number
              top_package: string
              top_package_count: number
              total_users: number
            }[]
          }
        | {
            Args: { _since?: string; _variant?: string }
            Returns: {
              click_receive_message: number
              landing_views: number
              package_selected: number
              paywall_views: number
              purchase_attempts: number
              purchase_success: number
              reveal_attempts: number
              top_package: string
              top_package_count: number
              total_users: number
            }[]
          }
      get_funnel_stats_by_variant: {
        Args: { _since?: string }
        Returns: {
          click_receive_message: number
          landing_views: number
          package_selected: number
          paywall_views: number
          purchase_attempts: number
          purchase_success: number
          reveal_attempts: number
          top_package: string
          top_package_count: number
          total_users: number
          variant: string
        }[]
      }
      get_or_create_daily_message: {
        Args: { _user_id: string }
        Returns: {
          content: string
          message_date: string
        }[]
      }
      grant_welcome_credit_if_eligible: {
        Args: { _user_id: string }
        Returns: {
          credits: number
          granted: boolean
          reason: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_order_paid_and_credit: {
        Args: { _ifthenpay_request_id?: string; _order_id: string }
        Returns: number
      }
      next_ifthenpay_reference_number: { Args: never; Returns: number }
      replace_all_messages: { Args: { _rows: Json }; Returns: number }
      reveal_message: {
        Args: { _message_id: number; _user_id: string }
        Returns: {
          already_revealed: boolean
          content: string
          credits: number
          status: string
        }[]
      }
      validate_coupon: {
        Args: { _code: string; _package_id: string; _user_id: string }
        Returns: {
          coupon_id: string
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          final_price: number
          reason: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      analytics_event_name:
        | "landing_view"
        | "click_receive_message"
        | "reveal_attempt"
        | "paywall_view"
        | "package_selected"
        | "purchase_attempt"
        | "purchase_success"
        | "message_revealed"
        | "signup"
      app_role: "admin" | "user"
      coupon_discount_type: "percent" | "fixed"
      credit_tx_type: "purchase" | "usage" | "admin" | "welcome"
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
      analytics_event_name: [
        "landing_view",
        "click_receive_message",
        "reveal_attempt",
        "paywall_view",
        "package_selected",
        "purchase_attempt",
        "purchase_success",
        "message_revealed",
        "signup",
      ],
      app_role: ["admin", "user"],
      coupon_discount_type: ["percent", "fixed"],
      credit_tx_type: ["purchase", "usage", "admin", "welcome"],
    },
  },
} as const
