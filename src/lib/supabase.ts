// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define the type for form data that matches your Supabase table
export type ResponseData = {
  id?: string
  feed_type: string
  quantity: number | string // you can use `number` if you convert the input in the form
  unit: string
  created_at?: string
}