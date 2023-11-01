import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export const user = await supabase.auth.getUser();
export const session = await supabase.auth.getSession();
