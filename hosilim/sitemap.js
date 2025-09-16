const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const fetch = require('node-fetch');

(async () => {
  const smStream = new SitemapStream({ hostname: 'https://hosilim.uz' });

  // Asosiy ochiq sahifalar
  smStream.write({ url: '/', changefreq: 'weekly', priority: 1.0 });
  smStream.write({ url: '/market', changefreq: 'daily', priority: 0.9 });

  // 1) API’dan active offers olish
  const offersRes = await fetch('https://api.hosilim.uz/api/v1/offers?status=active&limit=100&sort=-createdAt');
  const offersData = await offersRes.json();

  if (offersData?.data) {
    offersData.data.forEach(p => {
      if (p.slug) {
        smStream.write({
          url: `/product/${p.slug}`,
          changefreq: 'weekly',
          priority: 0.8
        });
      }
    });
  }


  smStream.end();

  const sitemap = await streamToPromise(smStream);
  createWriteStream('./public/sitemap.xml').write(sitemap);
})();
