# GaffDesk blog — how posts are made

The blog is plain static HTML on gaffdesk.com/blog. There is no CMS. Posts are
written as HTML fragments and built by `node scripts/build-blog.mjs`
(no dependencies), which generates each post page, the blog index and
`sitemap.xml`. Never hand-edit the generated `blog/<slug>.html`,
`blog/index.html` or `sitemap.xml`.

## Adding a post

1. Write the body as an HTML fragment in `blog/_src/<slug>.html`
   (paragraphs, `<h2>`/`<h3>`, lists, tables, `<figure>` images). No `<h1>`;
   the template adds the title.
2. Add the post to `blog/posts.json`:
   ```json
   {
     "slug": "av-crew-overtime-calculation",
     "title": "How to calculate overtime for AV crew calls",
     "description": "Under 160 characters, includes the keyword, says what the reader gets.",
     "keyword": "av crew overtime",
     "date": "YYYY-MM-DD",
     "published": true,
     "readMinutes": 6,
     "image": "optional-file-in-blog-img.jpg",
     "imageAlt": "What the image shows",
     "imageWidth": 1600, "imageHeight": 900,
     "related": ["other-slug"],
     "faq": [{ "q": "Question?", "a": "Answer." }],
     "cta": "Optional one-line call to action shown above the trial button."
   }
   ```
3. Run `node scripts/build-blog.mjs`. It fails loudly on missing fields,
   duplicate slugs or descriptions over 160 characters.
4. Open a pull request. The Vercel preview is the review. Merging publishes.

## Rules for every post

- **One target keyword per post, never reused.** Check `posts.json` first.
- **Audience:** AV company owners, technical directors, project managers,
  AV freelancers, install companies. Write like an AV pro talking to another.
- **Accuracy over volume.** Only describe GaffDesk features that exist in the
  app (avland-app/av-land-quote-builder). If unsure, leave the feature out.
  Never invent customers, quotes, statistics or testimonials.
- **Prices:** Basic $9.99, Pro $19.99 ($29.99 both workspaces), Team $39.99
  ($59.99 both), QuickBooks add-on $9.99, monthly. 7-day free trial with full
  Pro access, no card. Basic: 10 saved quotes, 25 library items, 5 saved
  clients, unlimited invoices.
- **Mark the spot for a real detail.** Each post includes at least one
  placeholder `<!-- REAL DETAIL: ... -->` asking Kambiz for a specific job,
  number or photo. The PR description lists them.
- **Length:** 900–1,600 words. Short paragraphs. Use a table where numbers help.
- **Structure:** intro that answers the question in the first 2–3 sentences,
  3–6 `<h2>` sections, an FAQ section (also put the Q&As in `faq`), and one
  natural mention of GaffDesk where it genuinely helps. No hard sell.
- **Links:** 1 link to an authoritative outside source where useful, 1–2 links
  to other GaffDesk posts or the homepage sections (`/#pricing`,
  `/#freelancers`).
- **Images:** compressed JPG/WebP under 200 KB, 1600×900, real photos or app
  screenshots with demo data only. No AI-generated images. No real client
  names.
- **Voice:** plain verbs, sentence case, no filler, no "In today's fast-paced
  world". US English.

## Pull request description

Include: target keyword, the REAL DETAIL questions for Kambiz, and two
LinkedIn post drafts (one for Kambiz's personal profile, one for the GaffDesk
page), each under 1,300 characters, written for LinkedIn rather than copied
from the post.
