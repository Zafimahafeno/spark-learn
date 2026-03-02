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
      cart_items: {
        Row: {
          added_at: string
          course_id: number
          id: number
          user_id: string
        }
        Insert: {
          added_at?: string
          course_id: number
          id?: number
          user_id: string
        }
        Update: {
          added_at?: string
          course_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course_id: number
          id: number
          issue_date: string
          user_id: string
          verify_code: string
        }
        Insert: {
          course_id: number
          id?: number
          issue_date?: string
          user_id: string
          verify_code: string
        }
        Update: {
          course_id?: number
          id?: number
          issue_date?: string
          user_id?: string
          verify_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          discount_percent: number | null
          expiry_date: string | null
          id: number
        }
        Insert: {
          active?: boolean | null
          code: string
          discount_percent?: number | null
          expiry_date?: string | null
          id?: number
        }
        Update: {
          active?: boolean | null
          code?: string
          discount_percent?: number | null
          expiry_date?: string | null
          id?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          category_id: number | null
          created_at: string
          description: string | null
          id: number
          instructor_id: string | null
          level: Database["public"]["Enums"]["course_level"] | null
          price: number | null
          slug: string
          status: Database["public"]["Enums"]["course_status"] | null
          subtitle: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          instructor_id?: string | null
          level?: Database["public"]["Enums"]["course_level"] | null
          price?: number | null
          slug: string
          status?: Database["public"]["Enums"]["course_status"] | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          instructor_id?: string | null
          level?: Database["public"]["Enums"]["course_level"] | null
          price?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["course_status"] | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: number
          enrolled_at: string
          id: number
          is_completed: boolean | null
          last_accessed: string | null
          progress_percent: number | null
          user_id: string
        }
        Insert: {
          course_id: number
          enrolled_at?: string
          id?: number
          is_completed?: boolean | null
          last_accessed?: string | null
          progress_percent?: number | null
          user_id: string
        }
        Update: {
          course_id?: number
          enrolled_at?: string
          id?: number
          is_completed?: boolean | null
          last_accessed?: string | null
          progress_percent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string
          lesson_id: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_id: number
          user_id: string
        }
        Update: {
          completed_at?: string
          lesson_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          document_url: string | null
          duration_minutes: number | null
          id: number
          is_preview: boolean | null
          section_id: number
          sort_order: number | null
          text_content: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          content_type?: Database["public"]["Enums"]["content_type"]
          document_url?: string | null
          duration_minutes?: number | null
          id?: number
          is_preview?: boolean | null
          section_id: number
          sort_order?: number | null
          text_content?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          document_url?: string | null
          duration_minutes?: number | null
          id?: number
          is_preview?: boolean | null
          section_id?: number
          sort_order?: number | null
          text_content?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number | null
          course_id: number
          created_at: string
          id: number
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          course_id: number
          created_at?: string
          id?: number
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          course_id?: number
          created_at?: string
          id?: number
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          firstname: string | null
          id: string
          lastname: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          firstname?: string | null
          id: string
          lastname?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          firstname?: string | null
          id?: string
          lastname?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          attempted_at: string
          id: number
          passed: boolean | null
          quiz_id: number
          score: number | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: number
          passed?: boolean | null
          quiz_id: number
          score?: number | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: number
          passed?: boolean | null
          quiz_id?: number
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          id: number
          is_correct: boolean | null
          option_text: string
          question_id: number
        }
        Insert: {
          id?: number
          is_correct?: boolean | null
          option_text: string
          question_id: number
        }
        Update: {
          id?: number
          is_correct?: boolean | null
          option_text?: string
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          id: number
          question_text: string
          quiz_id: number
        }
        Insert: {
          id?: number
          question_text: string
          quiz_id: number
        }
        Update: {
          id?: number
          question_text?: string
          quiz_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          id: number
          passing_percentage: number | null
          section_id: number | null
          title: string
        }
        Insert: {
          id?: number
          passing_percentage?: number | null
          section_id?: number | null
          title: string
        }
        Update: {
          id?: number
          passing_percentage?: number | null
          section_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          course_id: number
          created_at: string
          id: number
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: number
          created_at?: string
          id?: number
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: number
          created_at?: string
          id?: number
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          course_id: number
          id: number
          sort_order: number | null
          title: string
        }
        Insert: {
          course_id: number
          id?: number
          sort_order?: number | null
          title: string
        }
        Update: {
          course_id?: number
          id?: number
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "instructor" | "admin"
      content_type: "video" | "text" | "document"
      course_level: "beginner" | "intermediate" | "advanced" | "all"
      course_status: "draft" | "published" | "archived"
      payment_status: "pending" | "completed" | "refunded"
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
      app_role: ["student", "instructor", "admin"],
      content_type: ["video", "text", "document"],
      course_level: ["beginner", "intermediate", "advanced", "all"],
      course_status: ["draft", "published", "archived"],
      payment_status: ["pending", "completed", "refunded"],
    },
  },
} as const
