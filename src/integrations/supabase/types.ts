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
      bans: {
        Row: {
          banned_until: string
          created_at: string
          device_id: string
          id: string
          reason: string
        }
        Insert: {
          banned_until: string
          created_at?: string
          device_id: string
          id?: string
          reason?: string
        }
        Update: {
          banned_until?: string
          created_at?: string
          device_id?: string
          id?: string
          reason?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_device_id: string
          blocker_device_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_device_id: string
          blocker_device_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_device_id?: string
          blocker_device_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          device_id: string
          id: string
          nickname: string
          room_id: string
        }
        Insert: {
          content: string
          created_at?: string
          device_id: string
          id?: string
          nickname: string
          room_id: string
        }
        Update: {
          content?: string
          created_at?: string
          device_id?: string
          id?: string
          nickname?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
          message_id: string | null
          nicknames: string[]
          participants: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          message_id?: string | null
          nicknames: string[]
          participants: string[]
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string | null
          nicknames?: string[]
          participants?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          device_id: string
          id: string
          nickname: string
          post_id: string
        }
        Insert: {
          content: string
          created_at?: string
          device_id: string
          id?: string
          nickname: string
          post_id: string
        }
        Update: {
          content?: string
          created_at?: string
          device_id?: string
          id?: string
          nickname?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          device_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          from_device_id: string
          from_nickname: string
          id: string
          post_id: string
          status: string
          to_device_id: string
          to_nickname: string
        }
        Insert: {
          content: string
          created_at?: string
          from_device_id: string
          from_nickname: string
          id?: string
          post_id: string
          status?: string
          to_device_id: string
          to_nickname: string
        }
        Update: {
          content?: string
          created_at?: string
          from_device_id?: string
          from_nickname?: string
          id?: string
          post_id?: string
          status?: string
          to_device_id?: string
          to_nickname?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          device_id: string
          id: string
          read: boolean
          related_id: string | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          device_id: string
          id?: string
          read?: boolean
          related_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          device_id?: string
          id?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          device_id: string
          id: string
          image_url: string | null
          nickname: string
        }
        Insert: {
          content: string
          created_at?: string
          device_id: string
          id?: string
          image_url?: string | null
          nickname: string
        }
        Update: {
          content?: string
          created_at?: string
          device_id?: string
          id?: string
          image_url?: string | null
          nickname?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          device_id: string
          id: string
          nickname: string
          tendency: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          nickname: string
          tendency?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          nickname?: string
          tendency?: string | null
        }
        Relationships: []
      }
      reel_comments: {
        Row: {
          content: string
          created_at: string
          device_id: string
          id: string
          nickname: string
          reel_id: string
        }
        Insert: {
          content: string
          created_at?: string
          device_id: string
          id?: string
          nickname: string
          reel_id: string
        }
        Update: {
          content?: string
          created_at?: string
          device_id?: string
          id?: string
          nickname?: string
          reel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_comments_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      reels: {
        Row: {
          content: string
          created_at: string
          device_id: string
          expires_at: string
          id: string
          image_url: string | null
          nickname: string
        }
        Insert: {
          content: string
          created_at?: string
          device_id: string
          expires_at: string
          id?: string
          image_url?: string | null
          nickname: string
        }
        Update: {
          content?: string
          created_at?: string
          device_id?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          nickname?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          related_id: string | null
          report_type: string
          reported_device_id: string
          reporter_device_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          related_id?: string | null
          report_type: string
          reported_device_id: string
          reporter_device_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          related_id?: string | null
          report_type?: string
          reported_device_id?: string
          reporter_device_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
