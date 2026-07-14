# Design — Add "Teaching a Legacy System to Explain Itself" blog series (Part 1)

**Date:** 2026-07-14
**Status:** Approved

## Goal

Publish **Part 1** of a new 7-post blog series and introduce a reusable "series" presentation
to the site — without publishing Parts 2–7 (they remain planned "future CRs").

Source material lives outside this repo at
`/Users/bodist/work/otp/demo/eing/java/otp/docs/blog-series/`:
- `README.md` — the 7-post plan / arc.
- `drafts/post-1-the-system-nobody-can-read.md` — the full, anonymization-scrubbed Part 1 draft.

## Decisions (from brainstorming)

- **Series UI placement:** a banner **section at the top of the blog listing page**
  (`blog/index.html`), above the normal chronological post grid — NOT a per-post component.
- **Roadmap:** list all 7 parts. Part 1 is a live link; Parts 2–7 render greyed-out "coming soon".
- **Thumbnail:** author will supply `thumbnail.jpg` later; until then the auto post-grid card
  shows a broken image (accepted trade-off).
- **Future titles may change** — Parts 2–7 are hardcoded, so re-titling later is a one-line edit each.

## Changes

### 1. New post — `_posts/2026-07-14-the-system-nobody-can-read/index.md`
- Port the draft body verbatim (drop the author-notes HTML comment and the duplicate `# Title`
  h1, since `post.html` renders the title from front matter).
- Front matter: `layout: post`, `title: "The System Nobody Can Read"`,
  `date: 2026-07-14 00:00:00 +0000`, `categories: ai architecture legacy`.
- Keep the "*Post 1 of a series…*" lead line (as `<p class="post-lead">`) and all ` ```text `
  monospace diagrams.
- Append the standard LinkedIn contact footer + the trailing `<style>` block used by recent
  posts (post-lead styling + smaller `pre` font so the ASCII diagrams fit).
- Create `assets/images/posts/2026-07-14-the-system-nobody-can-read/` for the future thumbnail.

### 2. Series banner — top of `blog/index.html`
- New `<section class="series-banner">` inserted after `.blog-header`, before the post grid.
- Shows series name "Teaching a Legacy System to Explain Itself", a tagline, "Part 1 of 7", and
  an ordered roadmap of all 7 parts. Part 1 → live link; Parts 2–7 → greyed "coming soon".
- Data hardcoded in the HTML (matches how presentations are hardcoded on this site; no new
  Jekyll `_data/` pattern introduced). Publishing a later part = flip one entry to a link.
- Styling added to the existing `<style>` block in `blog/index.html`, reusing theme CSS vars.

## Out of scope (YAGNI)
- No separate series landing page.
- No in-post series banner component.
- No `_data/` file / Jekyll collection for series.
- No image generation.
- No changes to Parts 2–7 content or to any existing post.

## The 7-part roadmap (titles from the plan; 2–7 may be revised later)
1. The System Nobody Can Read *(this post)*
2. Why "Just Ask the AI" Breaks at Scale
3. Stop Retrieving. Start Modeling.
4. How You Actually Build the Map
5. Keeping It True When the Code Moves
6. Documentation That Gets Smarter
7. One Model, Many Views — and the Honest Frontier
