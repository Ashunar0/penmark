# Phase 5: トップページ, About, 仕上げ — 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ランディングページ型トップ、Aboutページ、共通レイアウトを実装してポートフォリオを完成させる

**Architecture:** 全ページ SSG（Server Component、動的関数なし）。共通レイアウトは layout.tsx にヘッダー・フッターを追加。プロジェクトデータはハードコード。トップの最新記事は createPublicClient() でビルド時取得し、editor の actions.ts に revalidatePath("/") を追加して on-demand ISR と連携。

**Tech Stack:** Next.js App Router, Tailwind CSS, Supabase (public client)

---

### Task 1: 共通ヘッダーコンポーネント

**Files:**
- Create: `src/components/header.tsx`

**Step 1: ヘッダーコンポーネントを作成**

```tsx
import Link from "next/link";

/** サイト共通ヘッダー: サイト名 + ナビゲーション */
export default function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Penmark
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link
            href="/articles"
            className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Articles
          </Link>
          <Link
            href="/about"
            className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

**Step 2: 目視確認用に layout.tsx にヘッダーを仮配置して dev サーバーで確認**

---

### Task 2: 共通フッターコンポーネント

**Files:**
- Create: `src/components/footer.tsx`

**Step 1: フッターコンポーネントを作成**

```tsx
/** サイト共通フッター: コピーライトと GitHub リンク */
export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Penmark</p>
        <a
          href="https://github.com/Ashunar0/penmark"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
```

---

### Task 3: layout.tsx に共通レイアウトを統合

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Header と Footer を import して body 内に配置**

```tsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <Header />
  <main className="min-h-screen">{children}</main>
  <Footer />
</body>
```

**Step 2: 各既存ページ（articles, editor, login）で表示が壊れてないか確認**

**Step 3: コミット**

```bash
git add src/components/header.tsx src/components/footer.tsx src/app/layout.tsx
git commit -m "feat: 共通ヘッダー・フッターを追加"
```

---

### Task 4: プロジェクトデータ定義

**Files:**
- Create: `src/lib/projects.ts`

**Step 1: プロジェクト型とデータを定義**

```tsx
export type Project = {
  title: string;
  description: string;
  techStack: string[];
  url?: string;
  githubUrl?: string;
};

/** ポートフォリオに表示するプロジェクト一覧 */
export const projects: Project[] = [
  {
    title: "penmark",
    description: "Next.js App Router で構築した技術ブログ兼ポートフォリオ。SSG/ISR/CSR の使い分けと RSC 境界設計を実践。",
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    url: "https://penmark.vercel.app",
    githubUrl: "https://github.com/Ashunar0/penmark",
  },
  {
    title: "folio-v3",
    description: "React + Vite + Hono で SPA を構築。Next.js の裏側を全て自分で設計し「なぜ」を語れるようにした。",
    techStack: ["React", "Vite", "Hono", "TypeScript", "Supabase"],
  },
  {
    title: "会計システム folio",
    description: "Next.js で作った最初のプロジェクト。複式簿記の基本とフルスタック開発を学んだ。",
    techStack: ["Next.js", "TypeScript", "Supabase"],
  },
  {
    title: "2sec LP",
    description: "スマホアプリのランディングページ。",
    techStack: ["TODO"],
  },
  {
    title: "Slack Stamp Studio",
    description: "TODO",
    techStack: ["TODO"],
  },
];
```

※ description と techStack はユーザーに確認して後で差し替える

---

### Task 5: About ページ

**Files:**
- Create: `src/app/about/page.tsx`

**Step 1: About ページを作成（自己紹介 + プロジェクト一覧）**

- 静的 metadata を export（title: "About"）
- 自己紹介セクション: 名前 + 一言 + 技術スタック
- プロジェクト一覧: `projects` 配列を map してカード表示

**Step 2: dev サーバーで /about を確認**

**Step 3: コミット**

```bash
git add src/lib/projects.ts src/app/about/page.tsx
git commit -m "feat: About ページを追加（自己紹介 + プロジェクト一覧）"
```

---

### Task 6: トップページ

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: トップページをランディングページに書き換え**

- ヒーローセクション: 名前 + 一言 + About リンク
- 最新記事セクション: `createPublicClient()` で公開記事3件取得、カード表示
- /articles への「すべての記事を見る」リンク

**Step 2: dev サーバーで / を確認**

---

### Task 7: ISR 連携（revalidatePath を追加）

**Files:**
- Modify: `src/app/editor/actions.ts`

**Step 1: createArticle と updateArticle に revalidatePath("/") を追加**

記事の作成・更新時にトップページのキャッシュも再検証する。

**Step 2: コミット**

```bash
git add src/app/page.tsx src/app/editor/actions.ts
git commit -m "feat: トップページ（ランディング型）を実装し ISR と連携"
```

---

### Task 8: 全体確認とデプロイ

**Step 1: 各ページの表示を dev サーバーで最終確認**
- `/` — ヒーロー + 最新記事
- `/articles` — 記事一覧（ヘッダー・フッター付き）
- `/articles/[slug]` — 記事詳細
- `/about` — 自己紹介 + プロジェクト一覧
- `/editor` — 未認証→リダイレクト確認

**Step 2: push してデプロイ**

```bash
git push
```

**Step 3: 本番で各ページを確認**
