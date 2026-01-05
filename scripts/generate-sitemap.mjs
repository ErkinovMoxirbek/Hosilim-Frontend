// Node 18+ (Vercel default) – global fetch bor
import { SitemapStream, streamToPromise } from 'sitemap';
import fs from 'fs/promises';

const HOST = 'https://hosilim.uz';

async function fetchAllOffers() {
  const limit = 100;
  let page = 1;
  const slugs = [];

  while (true) {
    const url = `https://api.hosilim.uz/api/v1/offers?status=active&limit=${limit}&sort=-createdAt&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) break;

    const json = await res.json();
    const items = json?.data ?? [];

    for (const p of items) {
      if (p?.slug) slugs.push(p.slug);
    }

    if (items.length < limit) break; // oxirgi sahifa
    page += 1;
  }

  return slugs;
}

async function buildSitemap() {
  const sm = new SitemapStream({ hostname: HOST });

  // Asosiy sahifalar
  sm.write({ url: '/', changefreq: 'weekly', priority: 1.0 });
  sm.write({ url: '/market', changefreq: 'daily', priority: 0.9 });

  // Dinamik offerlar
  const slugs = await fetchAllOffers();
  for (const slug of slugs) {
    sm.write({
      url: `/${slug}`,
      changefreq: 'weekly',
      priority: 0.8
    });
  }

  sm.end();

  const xml = await streamToPromise(sm);
  await fs.mkdir('public', { recursive: true });
  await fs.writeFile('public/sitemap.xml', xml.toString(), 'utf8');

  // robots.txt ham shu yerda
  const robots = [
    'User-agent: *',
    'Disallow:',
    `Sitemap: ${HOST}/sitemap.xml`
  ].join('\n');

  await fs.writeFile('public/robots.txt', robots, 'utf8');

  console.log('✅ Generated public/sitemap.xml and public/robots.txt');
}

buildSitemap().catch(err => {
  console.error('Sitemap build failed:', err);
  process.exit(1);
});
