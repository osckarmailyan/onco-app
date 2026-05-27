import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://cmamfntyglctiymqnlfv.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_iFk8rKQ6q4LhqFEYsu1_YA_cjvodPCG";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
