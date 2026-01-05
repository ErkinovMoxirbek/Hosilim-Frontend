import { SitemapStream, streamToPromise } from "sitemap";
import fs from "fs/promises";

const HOST = "https://hosilim.uz";
const API = "https://api.hosilim.uz";

async function fetchAllOffersSafe() {
  const limit = 100;
  let page = 1;
  const slugs = [];

  try {
    while (true) {
      const url = `${API}/api/v1/offers?status=active&limit=${limit}&sort=-createdAt&page=${page}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "vercel-sitemap/1.0",
          "Accept": "application/json",
        },
        // cache: "no-store", // ixtiyoriy
      });

      if (!res.ok) break;

      const json = await res.json();
      const items = Array.isArray(json?.data) ? json.data : [];

      for (const p of items) {
        if (p?.slug) slugs.push(p.slug);
      }

      if (items.length < limit) break;
      page += 1;
    }
  } catch (err) {
    // MUHIM: build yiqilmasin
    console.error("[sitemap] API fetch failed, continuing without offers:", err?.message || err);
    return [];
  }

  return slugs;
}

async function buildSitemap() {
  const sm = new SitemapStream({ hostname: HOST });

  sm.write({ url: "/", changefreq: "weekly", priority: 1.0 });
  sm.write({ url: "/market", changefreq: "daily", priority: 0.9 });

  const slugs = await fetchAllOffersSafe();
  for (const slug of slugs) {
    sm.write({ url: `/${slug}`, changefreq: "weekly", priority: 0.8 });
  }

  sm.end();

  const xml = await streamToPromise(sm);

  await fs.mkdir("public", { recursive: true });
  await fs.writeFile("public/sitemap.xml", xml.toString(), "utf8");

  const robots = [
    "User-agent: *",
    "Disallow:",
    `Sitemap: ${HOST}/sitemap.xml`,
  ].join("\n");

  await fs.writeFile("public/robots.txt", robots, "utf8");

  console.log(`✅ Generated sitemap. Offers: ${slugs.length}`);
}

// MUHIM: build fail qilmang
buildSitemap()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Sitemap build failed (soft):", err);
    process.exit(0);
  });
