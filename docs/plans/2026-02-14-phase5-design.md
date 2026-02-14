# Phase 5: トップページ, About, 仕上げ — 設計書

## 概要

技術ブログがメインのランディングページ型トップページと、簡潔な自己紹介 + プロジェクト一覧の About ページを実装する。共通ヘッダー・フッターも追加。

## トップページ（`/`）— SSG

- ヒーローセクション: 名前 + 一言プロフィール + About リンク
- 最新記事セクション: 公開記事を3件表示（カード形式）+ /articles リンク
- ビルド時に Supabase から取得。記事更新時は revalidatePath("/") で再生成

## About ページ（`/about`）— SSG

- 自己紹介: 名前 + 一言 + 技術スタック
- プロジェクト一覧（ハードコード、カード形式）:
  - 会計システム folio
  - folio-v3
  - penmark
  - 2sec LP
  - Slack Stamp Studio

## 共通レイアウト

- ヘッダー: サイト名（Penmark）+ ナビ（Articles, About）
- フッター: コピーライト + GitHub リンク等
- `src/app/layout.tsx` に追加

## 技術方針

| 項目 | 方針 |
|------|------|
| トップの最新記事 | `createPublicClient()` でビルド時取得 |
| ISR 連携 | editor の actions.ts に `revalidatePath("/")` を追加 |
| プロジェクトデータ | `src/lib/projects.ts` に配列で定義（DB 不要、YAGNI） |
| レンダリング | トップ・About ともに SSG（動的関数なし） |
