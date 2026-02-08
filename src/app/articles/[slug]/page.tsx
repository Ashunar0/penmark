import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { markdownToHtml } from "@/lib/markdown";
import type { Article } from "@/lib/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  // generateStaticParams はビルド時に実行されるため cookies() が使えない
  // cookie 不要の素の Supabase クライアントを使う
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: articles } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published");

  return (articles ?? []).map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) {
    notFound();
  }

  const { title, published_at, tags, body_markdown } = article as Article;
  const contentHtml = await markdownToHtml(body_markdown);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/articles"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        &larr; 記事一覧に戻る
      </Link>

      <article className="mt-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <div className="mt-3 flex items-center gap-4">
            {published_at && (
              <time className="text-sm text-zinc-500">
                {new Date(published_at).toLocaleDateString("ja-JP")}
              </time>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div
          className="prose prose-zinc mt-10 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </main>
  );
}
