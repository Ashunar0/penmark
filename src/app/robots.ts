import type { MetadataRoute } from "next";

/** クローラー制御: 公開ページのみインデックス許可、エディタ・ログインは除外 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/editor", "/login"],
    },
    sitemap: "https://penmark.vercel.app/sitemap.xml",
  };
}
