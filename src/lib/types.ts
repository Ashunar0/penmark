export type Article = {
  id: string;
  slug: string;
  title: string;
  body_markdown: string;
  status: "draft" | "published";
  published_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};
