const express = require('express');
const { SitemapStream, streamToPromise } = require('sitemap');
const fetch = require('node-fetch');

const app = express();

app.get('/sitemap.xml', async (req, res) => {
  try {
    res.header('Content-Type', 'application/xml');

    const smStream = new SitemapStream({ hostname: 'https://hosilim.uz' });

    // Asosiy sahifalar
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

    const sitemapOutput = await streamToPromise(smStream);
    res.send(sitemapOutput.toString());

  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// Serverni ishga tushirish
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Sitemap server running on http://localhost:${PORT}/sitemap.xml`);
});
