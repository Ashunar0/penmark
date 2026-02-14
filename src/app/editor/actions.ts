"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/slug";

type ArticleFormData = {
  title: string;
  body_markdown: string;
  status: "draft" | "published";
  tags: string[];
};

/**
 * 新しい記事を作成する Server Action。
 * - slug はタイトルから自動生成
 * - status が published なら published_at に現在日時をセット
 * - 公開記事の場合、記事一覧と記事詳細の ISR キャッシュを再検証
 */
export async function createArticle(formData: ArticleFormData) {
  const supabase = await createClient();

  const slug = generateSlug(formData.title);
  const published_at =
    formData.status === "published" ? new Date().toISOString() : null;

  const { error } = await supabase.from("articles").insert({
    title: formData.title,
    body_markdown: formData.body_markdown,
    slug,
    status: formData.status,
    published_at,
    tags: formData.tags,
  });

  if (error) {
    return { error: error.message };
  }

  if (formData.status === "published") {
    revalidatePath("/articles");
    revalidatePath(`/articles/${slug}`);
  }

  redirect("/articles");
}

/**
 * 既存の記事を更新する Server Action。
 * - published_at は初回公開時のみセット（下書きに戻しても保持する）
 * - 更新後、記事一覧と記事詳細の ISR キャッシュを再検証
 */
export async function updateArticle(id: string, formData: ArticleFormData) {
  const supabase = await createClient();

  // 既存の記事を取得（published_at の保持判断に必要）
  const { data: existing } = await supabase
    .from("articles")
    .select("status, slug, published_at")
    .eq("id", id)
    .single();

  if (!existing) {
    return { error: "Article not found" };
  }

  // draft → published の時だけ published_at を新しくセット。それ以外は既存値を保持
  const isNewlyPublished =
    existing.status === "draft" && formData.status === "published";
  const published_at = isNewlyPublished
    ? new Date().toISOString()
    : existing.published_at;

  const { error } = await supabase
    .from("articles")
    .update({
      title: formData.title,
      body_markdown: formData.body_markdown,
      status: formData.status,
      published_at,
      tags: formData.tags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/articles");
  revalidatePath(`/articles/${existing.slug}`);

  redirect("/articles");
}
