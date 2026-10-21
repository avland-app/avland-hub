// Builds the GaffDesk blog from blog/posts.json + blog/_src/<slug>.html.
// Usage: node scripts/build-blog.mjs   (no dependencies)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SITE = 'https://gaffdesk.com';
const HEAD_FONTS = "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link href=\"https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap\" rel=\"stylesheet\">\n<link rel=\"stylesheet\" href=\"/blog/blog.css\">\n<link rel=\"icon\" href=\"/favicon.png\">\n<link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png\">";
const NAV = "<header class=\"nav\">\n  <div class=\"wrap\">\n    <a class=\"nav-logo\" href=\"/\" aria-label=\"GaffDesk home\"><img src=\"/gaffdesk-logo.png\" alt=\"GaffDesk\" width=\"148\" height=\"50\"></a>\n    <nav class=\"nav-links\" aria-label=\"Main\">\n      <a href=\"/#how\">How it works</a>\n      <a href=\"/#freelancers\">Freelancers</a>\n      <a href=\"/#pricing\">Pricing</a>\n      <a href=\"/blog\"{BLOG_CUR}>Blog</a>\n    </nav>\n    <div class=\"nav-actions\">\n      <a class=\"btn btn-quiet nav-login\" href=\"https://app.gaffdesk.com/\">Log in</a>\n      <a class=\"btn btn-primary\" href=\"https://app.gaffdesk.com/?signup=1\"><span class=\"lbl-long\">Start free trial</span><span class=\"lbl-short\">Free trial</span></a>\n    </div>\n  </div>\n</header>";
const FOOTER = "<footer>\n  <div class=\"wrap\">\n    <p>GaffDesk is a product of AV Land Production LLC.</p>\n    <nav aria-label=\"Footer\">\n      <a href=\"/blog\">Blog</a>\n      <a href=\"https://app.gaffdesk.com/\">Log in</a>\n      <a href=\"mailto:support@gaffdesk.com\">support@gaffdesk.com</a>\n      <a href=\"https://app.gaffdesk.com/terms\">Terms</a>\n      <a href=\"https://app.gaffdesk.com/privacy\">Privacy</a>\n    </nav>\n  </div>\n</footer>";

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const manifest = JSON.parse(readFileSync('blog/posts.json', 'utf8'));
const posts = (manifest.posts || []).filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));

const required = ['slug', 'title', 'description', 'date', 'keyword'];
for (const p of manifest.posts || []) {
  for (const k of required) if (!p[k]) throw new Error(`Post ${p.slug || '?'} is missing "${k}"`);
  if (!/^[a-z0-9-]+$/.test(p.slug)) throw new Error(`Bad slug: ${p.slug}`);
  if (p.description.length > 160) throw new Error(`Description over 160 chars: ${p.slug}`);
  if (!existsSync(`blog/_src/${p.slug}.html`)) throw new Error(`Missing blog/_src/${p.slug}.html`);
  // Every post needs at least one outside source link (see BLOG_GUIDE.md).
  const src = readFileSync(`blog/_src/${p.slug}.html`, 'utf8');
  const outside = [...src.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((u) => !/^https?:\/\/([a-z0-9-]+\.)*(gaffdesk\.com|gaffdesk\.app|gaffquote\.com|av\.land)(\/|$)/i.test(u));
  if (outside.length === 0) throw new Error(`Post ${p.slug} has no outside source link (BLOG_GUIDE.md requires one)`);
}
const slugs = new Set();
for (const p of manifest.posts || []) { if (slugs.has(p.slug)) throw new Error(`Duplicate slug ${p.slug}`); slugs.add(p.slug); }

function page({ title, description, url, ogImage, jsonld = [], body, blogCurrent = false, extraHead = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${jsonld.some((j) => j['@type'] === 'BlogPosting') ? 'article' : 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage || SITE + '/gaffdesk-logo.png'}">
<meta name="twitter:card" content="summary_large_image">
${extraHead}${HEAD_FONTS}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body>
${NAV.replace('{BLOG_CUR}', blogCurrent ? ' aria-current="page"' : '')}
<main>
${body}
</main>
${FOOTER}
</body>
</html>
`;
}

// Posts
for (const p of posts) {
  const url = `${SITE}/blog/${p.slug}`;
  const img = p.image ? `${SITE}/blog/img/${p.image}` : '';
  const content = readFileSync(`blog/_src/${p.slug}.html`, 'utf8');
  const related = (p.related || []).map((s) => posts.find((x) => x.slug === s)).filter(Boolean)
    .concat(posts.filter((x) => x.slug !== p.slug && !(p.related || []).includes(x.slug))).slice(0, 3);
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.updated || p.date, mainEntityOfPage: url,
    ...(img ? { image: img } : {}),
    author: { '@type': 'Organization', name: 'GaffDesk' },
    publisher: { '@type': 'Organization', name: 'GaffDesk', logo: { '@type': 'ImageObject', url: SITE + '/gaffdesk-logo.png' } },
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog' },
      { '@type': 'ListItem', position: 3, name: p.title, item: url },
    ],
  }];
  if (p.faq?.length) jsonld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  const body = `<article class="article">
  <div class="wrap">
    <p class="crumbs"><a href="/">Home</a> / <a href="/blog">Blog</a></p>
    <h1>${esc(p.title)}</h1>
    <p class="meta"><time datetime="${p.date}">${fmtDate(p.date)}</time>${p.readMinutes ? ` · ${p.readMinutes} min read` : ''}</p>
    ${p.photo ? `<img class="hero-img" src="/blog/img/${p.photo}" alt="${esc(p.photoAlt || '')}" width="${p.photoWidth || 1600}" height="${p.photoHeight || 900}">` : ''}
    <div class="prose">
${content}
    </div>
    <div class="cta"><p>${esc(p.cta || 'Build your next AV quote and invoice in GaffDesk. 7 days free, no card needed.')}</p><a class="btn" href="https://app.gaffdesk.com/?signup=1">Start free trial</a></div>
  </div>
</article>
${related.length ? `<section class="related"><div class="wrap"><h2>Keep reading</h2><ul>${related.map((r) => `<li><a href="/blog/${r.slug}">${esc(r.title)}</a></li>`).join('')}</ul></div></section>` : ''}`;
  writeFileSync(`blog/${p.slug}.html`, page({ title: `${p.title} | GaffDesk`, description: p.description, url, ogImage: img, jsonld, body, blogCurrent: true }));
}

// Index
const indexBody = `<section class="blog-head"><div class="wrap">
  <h1>The GaffDesk blog</h1>
  <p>Practical guides for AV companies and freelancers: quoting, crew overtime, rentals, invoicing and running the business side of shows.</p>
</div></section>
<section><div class="wrap">
${posts.length ? `<ul class="post-list">${posts.map((p) => `<li class="post-card"><a href="/blog/${p.slug}">${p.image ? `<img src="/blog/img/${p.image}" alt="" loading="lazy" width="${p.imageWidth || 1600}" height="${p.imageHeight || 900}">` : ''}<div class="body"><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><time datetime="${p.date}">${fmtDate(p.date)}</time></div></a></li>`).join('\n')}</ul>` : '<p style="padding-bottom:88px" class="muted">The first posts are on the way.</p>'}
</div></section>`;
writeFileSync('blog/index.html', page({
  title: 'Blog: AV quoting, crew and invoicing guides | GaffDesk',
  description: 'Practical guides for AV companies and freelancers on quoting, crew overtime, rentals, invoicing and the business side of shows.',
  url: `${SITE}/blog`, body: indexBody, blogCurrent: true,
  extraHead: posts.length ? '' : '<meta name="robots" content="noindex,follow">\n',
}));

// Sitemap
const today = new Date().toISOString().slice(0, 10);
const urls = [{ loc: `${SITE}/`, lastmod: manifest.homeUpdated || today }]
  .concat(posts.length ? [{ loc: `${SITE}/blog`, lastmod: posts[0].updated || posts[0].date }] : [])
  .concat(posts.map((p) => ({ loc: `${SITE}/blog/${p.slug}`, lastmod: p.updated || p.date })));
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log(`Built ${posts.length} post(s), blog index and sitemap.`);
