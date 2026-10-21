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
3. Make the title card: `python3 scripts/make-card.py <slug> "<title>"`
   (writes `blog/img/<slug>.jpg`; set `"image": "<slug>.jpg"` in posts.json).
   The title card is used only for the blog index thumbnail and social
   sharing, never at the top of the post (the page already shows the title).
   To show a real photo at the top of a post, set `"photo"` (plus
   `photoAlt`, `photoWidth`, `photoHeight`).
4. Run `node scripts/build-blog.mjs`. It fails loudly on missing fields,
   duplicate slugs or descriptions over 160 characters.
5. Open a pull request. The Vercel preview is the review. Merging publishes.

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
- **Outside source link (required):** every post links to at least 1
  authoritative outside source that backs up a specific claim in the post,
  e.g. U.S. Department of Labor (dol.gov), IRS (irs.gov), a state labor or tax
  agency, AVIXA (avixa.org), or a manufacturer's official spec page. Link the
  page that supports the claim, not a homepage. No competitors, no
  Wikipedia, no blogs or forums, no affiliate links. Open it in a new tab:
  `<a href="https://..." target="_blank" rel="noopener">`. Never invent a
  URL: only use a page you have actually loaded and checked supports the
  claim. The build fails if a post has no outside link.
- **Internal links:** 1–2 links to other GaffDesk posts or the homepage
  sections (`/#pricing`, `/#freelancers`).
- **Images:** compressed JPG/WebP under 200 KB, 1600×900, real photos or app
  screenshots with demo data only. No AI-generated images. No real client
  names.
- **Voice:** plain verbs, sentence case, no filler, no "In today's fast-paced
  world". US English.

## Kambiz's ideas (Blog Desk `ideas` collection)

Kambiz drops topics, titles, keywords or client questions into the "Your
ideas" box in Blog Desk. Every run, evaluate each idea with status `new`
before doing anything else, and give it a verdict. An idea is a suggestion,
not an order: judge it honestly, the way an SEO editor would.

**1. Turn it into a post.** Rewrite the idea as one working title and one
target keyword: a specific 2–6 word phrase an AV pro would type into Google
(fix spelling, drop filler). Pick the audience (O / F / I / A).

**2. Check it.** Use WebSearch to see what ranks for the keyword today and
what people ask about it. There is no search-volume data, so judge from
evidence: real questions on forums or "People also ask", how specific the
results are, and whether a 900–1,600 word how-to can genuinely answer it.
Then test these, in order:

- **Off-topic:** not useful to AV company owners, AV freelancers or install
  companies → skip.
- **Duplicate:** the keyword (or a near-identical one that would compete for
  the same searches) is already in BLOG_TOPICS.md or posts.json → do not add
  a second post. If the idea adds a good angle, add a line for that row
  under "Idea notes" in BLOG_TOPICS.md and mark the idea `merged`;
  otherwise skip.
- **Too broad:** one or two generic words ("audio", "lighting", "AV tips"),
  or search results dominated by big general sites for a different intent →
  skip, and suggest a narrower angle in the note.
- **Too thin:** the full answer fits in a paragraph or two → skip, or fold
  it into a related topic as an FAQ item (mark `merged`).
- **Not true for GaffDesk:** needs a feature that doesn't exist → write the
  post without that claim if it still helps readers; otherwise skip.
- **Risky:** tax, legal or competitor claims → allowed only on the same
  terms as topics #17, #24 and #31.

**3. Decide when.** Give it a "When" value:
- `next` — strong, timely or clearly better than the planned topics: write
  it at the next matching slot, ahead of the plan.
- a window like `Nov 15–Dec 20` — seasonal (year-end budgets, holiday
  parties, tax time, conference season). Publish inside the window, early
  enough for Google to pick it up (aim 2–4 weeks before the peak).
- `after #N` — builds on another post; write it after that one is live.
- `anytime` — good but not urgent: it joins the plan in normal order.

**4. Record the verdict** (ArtifactData `update` on the idea, with if_version):
- Added → add a row to the "Added from Kambiz's ideas" table in
  BLOG_TOPICS.md (on main) and set the idea to `status: "added"`,
  `topic: <row #>`, `keyword`, `title`, `when`, and `note`: one plain line,
  e.g. "Added as #37 'av load in fee' — good, specific; planned for early
  Nov (Wed freelancer slot)."
- Merged → `status: "merged"`, `note` naming the row it was folded into.
- Skipped → `status: "skipped"`, `note`: why, in plain words, plus a better
  angle if there is one, e.g. "Too broad — 'lighting' can't rank. Try
  'how to quote uplighting for a wedding'."

When a row that came from an idea gets written, set that idea to
`status: "used"`, `usedFor: <slug>`, `note: "Post #<n> for <Day Mon DD>"`.

## Picking the next topic

When a slot needs a new post, choose from rows in both tables of
BLOG_TOPICS.md that have no status, in this order:

1. A row whose "When" window would close before the following matching slot.
2. A row marked `next`.
3. Otherwise the lowest-numbered row whose audience fits the slot
   (Mon: O; Wed: F; Fri: I or A). If none fits, the lowest-numbered row.

Skip rows marked `after #N` until post #N is live, and rows whose window
hasn't started. Never write a row whose keyword is already used.

## Discarded posts

Kambiz can tap **Discard** on a post in Blog Desk (status `discard`; his
reason, if any, is in `changeNotes`). On the next run: close its pull
request (REST: PATCH repos/avland-app/avland-hub/pulls/<n>, state "closed"),
leave the branch (Kambiz deletes branches), delete the database doc, and
mark its BLOG_TOPICS.md row `discarded` on main so the keyword is not
written again. If the reason shows a general rule, add it to this guide.
The freed date is then filled like any empty slot. If the post came from an
idea, set that idea back to `skipped` with the reason.

## Instagram and Facebook set (every post)

Freelancers and crews scroll Instagram and Facebook on standby, so every
post also gets a social set, made from the post's own content.

- **Slides:** 6–8 carousel slides via
  `python3 scripts/make-slides.py <slug> <slides.json>` (format in the
  script). Slide 1 `cover` (title + who it's for), then `tip` slides (one
  idea each: heading under 10 words, body under 30 words, taken from the
  post), last slide `cta` ("Link in bio · gaffdesk.com/blog"). Text and
  brand only: no AI-generated images, no stock photos, no invented numbers.
  `blog/social/` is git-ignored; the slides live only in Blog Desk.
- **Upload the slides** to Blog Desk collection `slides`: one doc per slide,
  doc id `<slug>-<n>`, from the `blog/social/<slug>/db/<n>.json` files
  (ArtifactData batch with file_path). Delete any old `<slug>-<n>` docs
  beyond the new count.
- **Caption** (`socialCaption` on the post doc): one plain-text caption that
  works on both Instagram and Facebook. First line is a hook a freelancer or
  owner would stop for (under 125 characters). Then 3–5 short lines with the
  main takeaways, then "Full guide: link in bio" (never a URL; Instagram
  captions can't link). End with 4–6 relevant hashtags such as #avtech
  #livesound #eventprofs #productionlife #avfreelancer #corporateevents.
  Under 1,500 characters. No emoji walls; at most 2 emoji.
- When a revision changes the post's main points, remake the slides and
  caption so they still match.
- **Storage:** slides sit in the Blog Desk database (100 MB cap). Delete
  the `slides` docs of any post published more than 30 days ago; the post
  doc keeps its caption.

## Pull request description

Include: target keyword, the REAL DETAIL questions for Kambiz, and two
LinkedIn post drafts (one for Kambiz's personal profile, one for the GaffDesk
page), each under 1,300 characters, written for LinkedIn rather than copied
from the post.
