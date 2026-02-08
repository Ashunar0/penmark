import { createClient } from "@supabase/supabase-js";

// 公開ページ用: Cookie 不要の Supabase クライアント
// cookies() を使わないので ISR / generateStaticParams で安全に使える
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
