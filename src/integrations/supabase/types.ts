type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_config_history: {
        Row: {
          action: string
          admin_user_id: string | null
          change_reason: string | null
          config_id: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          timestamp: string
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          change_reason?: string | null
          config_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          change_reason?: string | null
          config_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_config_history_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "ai_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_configurations: {
        Row: {
          config_level: string
          created_at: string
          frequency_penalty: number | null
          id: string
          is_active: boolean | null
          level_identifier: string | null
          max_tokens: number | null
          model_id: string | null
          presence_penalty: number | null
          system_prompt: string | null
          temperature: number | null
          top_p: number | null
          updated_at: string
        }
        Insert: {
          config_level: string
          created_at?: string
          frequency_penalty?: number | null
          id?: string
          is_active?: boolean | null
          level_identifier?: string | null
          max_tokens?: number | null
          model_id?: string | null
          presence_penalty?: number | null
          system_prompt?: string | null
          temperature?: number | null
          top_p?: number | null
          updated_at?: string
        }
        Update: {
          config_level?: string
          created_at?: string
          frequency_penalty?: number | null
          id?: string
          is_active?: boolean | null
          level_identifier?: string | null
          max_tokens?: number | null
          model_id?: string | null
          presence_penalty?: number | null
          system_prompt?: string | null
          temperature?: number | null
          top_p?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_configurations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          api_endpoint: string | null
          api_version: string | null
          auth_type: string | null
          configuration_json: Json | null
          cost_per_token: number | null
          created_at: string
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model_name: string
          model_type: string
          provider: string
          supports_streaming: boolean | null
        }
        Insert: {
          api_endpoint?: string | null
          api_version?: string | null
          auth_type?: string | null
          configuration_json?: Json | null
          cost_per_token?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_name: string
          model_type: string
          provider: string
          supports_streaming?: boolean | null
        }
        Update: {
          api_endpoint?: string | null
          api_version?: string | null
          auth_type?: string | null
          configuration_json?: Json | null
          cost_per_token?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_name?: string
          model_type?: string
          provider?: string
          supports_streaming?: boolean | null
        }
        Relationships: []
      }
      ai_usage_metrics: {
        Row: {
          estimated_cost: number | null
          id: string
          model_name: string
          response_time_ms: number | null
          service_type: string
          success: boolean | null
          timestamp: string
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
        }
        Insert: {
          estimated_cost?: number | null
          id?: string
          model_name: string
          response_time_ms?: number | null
          service_type: string
          success?: boolean | null
          timestamp?: string
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Update: {
          estimated_cost?: number | null
          id?: string
          model_name?: string
          response_time_ms?: number | null
          service_type?: string
          success?: boolean | null
          timestamp?: string
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      alert_configurations: {
        Row: {
          alert_name: string
          comparison_operator: string
          created_at: string
          id: string
          is_active: boolean | null
          metric_type: string
          notification_method: string
          notification_target: string
          threshold_value: number
          updated_at: string
        }
        Insert: {
          alert_name: string
          comparison_operator: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metric_type: string
          notification_method: string
          notification_target: string
          threshold_value: number
          updated_at?: string
        }
        Update: {
          alert_name?: string
          comparison_operator?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metric_type?: string
          notification_method?: string
          notification_target?: string
          threshold_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      api_performance_logs: {
        Row: {
          endpoint: string
          error_message: string | null
          id: string
          method: string
          response_time_ms: number
          status_code: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          endpoint: string
          error_message?: string | null
          id?: string
          method: string
          response_time_ms: number
          status_code: number
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string
          response_time_ms?: number
          status_code?: number
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          endpoint: string | null
          error_message: string
          error_type: string
          first_occurrence: string
          frequency: number | null
          id: string
          last_occurrence: string
          resolved: boolean | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          endpoint?: string | null
          error_message: string
          error_type: string
          first_occurrence?: string
          frequency?: number | null
          id?: string
          last_occurrence?: string
          resolved?: boolean | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          endpoint?: string | null
          error_message?: string
          error_type?: string
          first_occurrence?: string
          frequency?: number | null
          id?: string
          last_occurrence?: string
          resolved?: boolean | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      history_items: {
        Row: {
          content: string
          created_at: string
          id: string
          input_data: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          input_data?: Json | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          input_data?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      prompt_test_results: {
        Row: {
          actual_output: string | null
          created_at: string
          expected_output: string | null
          id: string
          prompt_version_id: string
          status: string
          test_input: string
        }
        Insert: {
          actual_output?: string | null
          created_at?: string
          expected_output?: string | null
          id?: string
          prompt_version_id: string
          status: string
          test_input: string
        }
        Update: {
          actual_output?: string | null
          created_at?: string
          expected_output?: string | null
          id?: string
          prompt_version_id?: string
          status?: string
          test_input?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_test_results_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          content: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          prompt_name: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          prompt_name: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          prompt_name?: string
          version?: string
        }
        Relationships: []
      }
      provider_configurations: {
        Row: {
          api_endpoint: string | null
          api_key_name: string | null
          auth_type: string | null
          configuration: Json | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean | null
          provider_name: string
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          api_key_name?: string | null
          auth_type?: string | null
          configuration?: Json | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean | null
          provider_name: string
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          api_key_name?: string | null
          auth_type?: string | null
          configuration?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean | null
          provider_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          is_active: boolean
          name: string
          price_monthly: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_monthly: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          timestamp: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          timestamp?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          timestamp?: string
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_type: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metric_type: string
          metric_value?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metric_type?: string
          metric_value?: number
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          count: number
          created_at: string
          feature_type: string
          id: string
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          feature_type: string
          id?: string
          period_end: string
          period_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          feature_type?: string
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_subscriptions_profiles"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_feature_usage: {
        Args: { user_uuid: string; feature: string }
        Returns: {
          current_usage: number
          limit_value: number
          can_use: boolean
        }[]
      }
      get_prompt_versions: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          prompt_name: string
          version: string
          content: string
          description: string
          is_active: boolean
          created_at: string
          created_by: string
        }[]
      }
      get_user_subscription: {
        Args: { user_uuid: string }
        Returns: {
          plan_name: string
          features: Json
          status: string
          current_period_end: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "USER" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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

type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

const Constants = {
  public: {
    Enums: {
      user_role: ["USER", "ADMIN"],
    },
  },
} as const