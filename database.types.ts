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
      users: {
        Row: {
          id: number
          name: string
          email: string
          role: string
          avatarUrl: string
          overtimeBalance: number
        }
        Insert: {
          id?: number
          name: string
          email: string
          role: string
          avatarUrl: string
          overtimeBalance?: number
        }
        Update: {
          id?: number
          name?: string
          email?: string
          role?: string
          avatarUrl?: string
          overtimeBalance?: number
        }
        Relationships: []
      }
      shifts: {
        Row: {
          id: number
          userId: number
          startTime: string 
          endTime: string
          position: string
          overtimeHours: number
        }
        Insert: {
          id?: number
          userId: number
          startTime: string
          endTime: string
          position: string
          overtimeHours?: number
        }
        Update: {
          id?: number
          userId?: number
          startTime?: string
          endTime?: string
          position?: string
          overtimeHours?: number
        }
        Relationships: [
          {
            foreignKeyName: "shifts_userId_fkey"
            columns: ["userId"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      leaves: {
        Row: {
            id: number
            userId: number
            date: string
            type: string
            overtimeCorrection: number
        }
        Insert: {
            id?: number
            userId: number
            date: string
            type: string
            overtimeCorrection?: number
        }
        Update: {
            id?: number
            userId?: number
            date?: string
            type?: string
            overtimeCorrection?: number
        }
        Relationships: [
           {
            foreignKeyName: "leaves_userId_fkey"
            columns: ["userId"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
