import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://cmamfntyglctiymqnlfv.supabase.co";
const fallbackAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_iFk8rKQ6q4LhqFEYsu1_YA_cjvodPCG";

export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackAnonKey;

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  });
}
