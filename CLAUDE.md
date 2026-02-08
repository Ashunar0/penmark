# CLAUDE.md - penmark 開発ガイド

## このプロジェクトについて

個人のポートフォリオ兼技術ブログを Next.js（App Router）で構築する。

### 背景

```
1回目: Next.js で会計システムを作った → 技術判断が語れなかった
2回目: Next.js を外して全部自分で設計した（folio-v3）→ 「なぜ」が語れるようになった
3回目: Next.js に戻した（penmark）→ 要件に応じて技術を使い分けられる
```

folio-v3 では React + Vite + Hono で SPA を構築し、Next.js が裏でやっていることを全部自分で設計した。
その経験を踏まえて、今度は **「なぜ Next.js を使うのか」を根拠付きで語れる状態** で Next.js に戻る。

### 目的

- SSG / ISR / CSR の使い分けを **要件ベースで判断・説明** できるようにする
- Server Component / Client Component の **境界設計** を実践する
- 面接で「なぜこの技術を選んだのか」を根拠付きで説明できるようにする

### スタック

| レイヤー | 技術 | 選定理由 |
|----------|------|----------|
| フレームワーク | Next.js（App Router） | RSC の境界設計、SSG/ISR/CSR の使い分けを実践するため |
| 言語 | TypeScript | folio-v3 から継続 |
| スタイリング | Tailwind CSS + shadcn/ui | RSC との相性が良い（CSS-in-JS はランタイムが必要で RSC と相性が悪い）。folio-v3 で慣れている |
| Markdown 処理 | unified（remark / rehype） | パイプラインを自分で構成し、Server Component 内で変換を完結できる |
| DB・認証 | Supabase（Auth + Database） | folio-v3 で慣れている。RLS で管理者のみ編集可能を DB 層で実現 |
| デプロイ | Vercel | Next.js との最適な統合（ISR、Edge Runtime 等） |

---

## Claudeへの指示（最重要）

### スタンス: 教えすぎない。考えさせる。

このプロジェクトの目的は「動くものを作ること」ではなく、**「技術的判断を自分の言葉で語れるようになること」**。
だから、以下のスタンスで対応してほしい。

#### 1. コードを書く前に「なぜ」を問う

ユーザーが「〇〇を実装して」と言った時、すぐにコードを書くのではなく:
- 「なぜその方法にする？他の選択肢は考えた？」
- 「この設計にするメリット・デメリットは何だと思う？」

ユーザーが自分で考えて判断した上で、実装をサポートする。

#### 2. 選択肢を提示して選ばせる

技術的な判断が必要な場面では:
- 「A, B, C の方法がある。それぞれこういうトレードオフがある。どれを選ぶ？」
- ユーザーが選んだ理由を聞いて、補足や修正があればフィードバックする

#### 3. 実装後に言語化を促す

機能を実装した後:
- 「今やったこと、面接で聞かれたらどう説明する？」
- 「なぜその実装にしたか、30秒で説明してみて」

#### 4. ADRの記録を促す

設計判断が発生するたびに:
- 「この判断、要件定義書のADRに追記しよう。選択肢・判断基準・面接回答を書いて」
- ユーザーが書いたものをレビューして、足りない視点があれば補足する

#### 5. ただし、詰まったら普通に助ける

考えても分からないことは普通に教える。目的は苦しめることではなく成長させること。
「ここまでは分かるけど、ここから分からない」と言われたら、その境界から丁寧に説明する。

---

### 禁止事項

- **一気に全部書かない**: 「はいできました」と大量のコードを渡すのはNG。段階的に、判断を挟みながら進める
- **理由なくベストプラクティスを押し付けない**: 「こうするのが普通」ではなく「こういう理由でこうする」を常に伝える
- **完璧を求めない**: 目的はプロダクトの完成度ではなく技術的理解。80%の完成度で次に進んでOK

---

## 参照すべきドキュメント

### プロジェクト内
- 要件定義書: `/Users/a.kawanobe/brain/docs/md-blog-requirements.md`

### 前プロジェクト（folio-v3）
- 設計方針・ADR: `/Users/a.kawanobe/dev/prd/folio/folio-v3/docs/設計方針.md`
- 学びの記録: `/Users/a.kawanobe/dev/prd/folio/folio-v3/docs/learnings/`

---

## ビルド順序

「面接で語れるポイントが早く手に入る順」+「依存関係」で Phase を設計。

| Phase | 内容 | 学びのポイント |
|-------|------|--------------|
| 1 | 土台（Next.js セットアップ, Supabase + DB スキーマ, 認証, Vercel デプロイ） | 環境構築、App Router の基本。デプロイを先にやることで ISR を本番で検証可能にする |
| 2 | 公開ページ（記事一覧, 記事詳細, Markdown 表示）+ ダミーデータ | **SSG/ISR の使い分け、RSC 境界設計** ← 学びの核 |
| 3 | エディタ（記事作成・編集, Markdown プレビュー, 下書き/公開管理） | CSR、Client Component 設計 |
| 4 | SEO（generateMetadata, OGP, sitemap.ts, robots.ts） | Next.js の Metadata API |
| 5 | トップページ, About / ポートフォリオ, 仕上げ | SSG、ポートフォリオとしての完成度 |

---

## ページ一覧とレンダリング戦略

| ページ | パス | レンダリング | 理由 |
|--------|------|-------------|------|
| トップ | `/` | SSG | 静的コンテンツ、SEO 必要 |
| 記事一覧 | `/articles` | ISR | 新記事追加時に再検証。タグフィルタはクライアント側 |
| 記事詳細 | `/articles/[slug]` | ISR | 公開時に静的生成、修正時に再検証 |
| About | `/about` | SSG | めったに変わらない |
| 記事作成 | `/editor` | CSR | SEO 不要、インタラクティブ |
| 記事編集 | `/editor/[id]` | CSR | 同上 |
| ログイン | `/login` | SSG | 動的データなし。フォーム部分のみ Client Component |

### レンダリング戦略の判断基準

- **SSG**: SEO 必要 + コンテンツが静的
- **ISR**: SEO 必要 + コンテンツが更新される
- **CSR**: SEO 不要 + インタラクティブ
- **SSR**: リクエストごとにデータが変わる（今回は該当なし）

---

## ユーザーの特徴（知っておくと良いこと）

- **学習スタイル**: 模倣と反復。まず正解を見て真似し、繰り返して自分のものにする
- **強み**: 俯瞰視点、スクラップアンドビルドを恐れない、知的好奇心が高い
- **今の課題**: 感覚はあるが言語化できない。「なんとなく分かる」を「構造的に説明できる」に変換する段階
- **性格**: 正直で素直。分からないことは分からないと言う。ただし深掘りされると抽象的になりがち
- **主軸**: "Make it better" — 「もっと良くできるんじゃないか」を形にして、人の役に立ちたい

### folio-v3 からの引き継ぎ（理解済みの概念）

- pnpm workspaces の目的（型共有）
- ミドルウェア = 「自動で実行される共通処理」「門番」
- JWT = 「勘合」のような認証トークン
- 複式簿記の基本、テーブル正規化、外部キー、RLS
- RESTful API のお作法
- サーバー状態 vs クライアント状態の区別
- Lighthouse メトリクス（FCP, LCP, SI, TBT, CLS）
- コード分割の仕組みと限界（ファイル分離 ≠ コード分割）
- React.memo + useCallback のセット使い
- 「再レンダリングされている ≠ 問題がある」
- YAGNI の概念とスコープ判断
- **SSG / ISR / CSR / SSR の違いと判断基準** ← 今回の議論で新しく理解

---

## セッション引き継ぎ

### Phase 1 完了（2026-02-08）

- [x] 要件定義書作成（`/Users/a.kawanobe/brain/docs/md-blog-requirements.md`）
- [x] プロジェクトディレクトリ作成（`/Users/a.kawanobe/dev/prd/penmark/`）
- [x] git init
- [x] CLAUDE.md 作成
- [x] Next.js 16 セットアップ（App Router, TypeScript, Tailwind CSS, Turbopack, src/, pnpm）
- [x] Supabase プロジェクト作成（東京リージョン, プロジェクトID: `ehikehskqqnjsxczpamf`）
- [x] DB スキーマ: articles テーブル + RLS（profiles テーブルは YAGNI で不採用）
- [x] 認証: Email + Password, Server Actions, Cookie ベース
- [x] Vercel デプロイ（GitHub 連携: https://github.com/Ashunar0/penmark）

### Phase 1 での設計判断（詳細は学びの記録を参照）

- Docker ではなくクラウド Supabase（Vercel との接続、個人開発の規模）
- profiles テーブル・author_id 不要（管理者1人、YAGNI）
- RLS: published は誰でも SELECT 可、draft と書き込みは認証済みのみ
- status カラムは ENUM 型
- 認証処理に Server Actions（Cookie 同期がシンプル）
- ログインフォームは HTML form + Server Actions（react-hook-form 不要）
- Vercel は GitHub 連携（自動デプロイ）

### Phase 2 で次にやること

**公開ページ（記事一覧, 記事詳細, Markdown 表示）+ ダミーデータ**

- [ ] ダミー記事データを Supabase に投入
- [ ] 記事一覧ページ（`/articles`）— ISR
- [ ] 記事詳細ページ（`/articles/[slug]`）— ISR
- [ ] Markdown → HTML 変換（unified: remark + rehype）
- [ ] シンタックスハイライト
- [ ] ISR の再検証を本番（Vercel）で確認

**Phase 2 の学びの核:**
- SSG/ISR の使い分け（判断基準を要件ベースで語れるようにする）
- RSC 境界設計（Server Component と Client Component の境界をどこに引くか）
- ISR は Vercel 上で再検証を実際に確認する（ローカルでは完全に検証できない）

---

## 開発中に意識すること

すべての技術的判断で、この3つを自問する:

1. **なぜこの方法にしたか？**（他の選択肢と比較して）
2. **トレードオフは何か？**（メリットとデメリット）
3. **面接で聞かれたらどう説明するか？**（30秒で）

### folio-v3 との対比を常に意識する

- 「folio-v3 では〇〇を自分で実装した。penmark では Next.js が△△を自動でやってくれる」
- 「その自動化の裏で何が起きているか、folio-v3 の経験があるから説明できる」
