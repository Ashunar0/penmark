"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { createArticle, updateArticle } from "@/app/editor/actions";
import type { Article } from "@/lib/types";

type Props = {
  article?: Article;
};

export default function ArticleEditor({ article }: Props) {
  const isEditing = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [bodyMarkdown, setBodyMarkdown] = useState(
    article?.body_markdown ?? ""
  );
  const [status, setStatus] = useState<"draft" | "published">(
    article?.status ?? "draft"
  );
  const [tagsInput, setTagsInput] = useState(
    article?.tags?.join(", ") ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const formData = { title, body_markdown: bodyMarkdown, status, tags };

    const result = isEditing
      ? await updateArticle(article.id, formData)
      : await createArticle(formData);

    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        {isEditing ? "記事を編集" : "新しい記事"}
      </h1>

      {error && (
        <div className="rounded bg-red-500/10 px-4 py-2 text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          タイトル
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">本文（Markdown）</label>
        <div className="grid grid-cols-2 gap-4">
          <textarea
            id="body"
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            rows={24}
            className="rounded border border-gray-300 bg-transparent px-3 py-2 font-mono text-sm dark:border-gray-700"
          />
          <div className="prose dark:prose-invert overflow-y-auto rounded border border-gray-300 px-4 py-2 dark:border-gray-700">
            {bodyMarkdown ? (
              <ReactMarkdown>{bodyMarkdown}</ReactMarkdown>
            ) : (
              <p className="text-gray-400">プレビュー</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium">
            ステータス
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "draft" | "published")
            }
            className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
          >
            <option value="draft">下書き</option>
            <option value="published">公開</option>
          </select>
        </div>

        <div className="flex-1 space-y-2">
          <label htmlFor="tags" className="block text-sm font-medium">
            タグ（カンマ区切り）
          </label>
          <input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Next.js, React, TypeScript"
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-foreground px-6 py-2 text-background disabled:opacity-50"
      >
        {saving ? "保存中..." : isEditing ? "更新する" : "作成する"}
      </button>
    </form>
  );
}
