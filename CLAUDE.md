# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Jekyll-based GitHub Pages site hosting technical documentation, blog posts, and interactive presentations. The site uses a hybrid architecture: Jekyll processes blog posts and layouts, while presentations are served as static HTML files.

## Build & Deployment

### Local Development

```bash
# Install dependencies (if Gemfile exists)
bundle install

# Serve site locally
bundle exec jekyll serve

# Access at http://localhost:4000/website/
```

### Deployment

GitHub Pages automatically builds and deploys on push to `main` branch. Check the Actions tab for build status.

## Site Architecture

### Content Types

1. **Blog Posts** (`_posts/`)
   - Each post has its own subdirectory: `_posts/YYYY-MM-DD-title/`
   - Post content in `index.md` with YAML front matter
   - Post assets stored separately in `assets/images/posts/YYYY-MM-DD-title/`
   - Automatically processed by Jekyll
   - Published at: `/blog/YYYY/MM/DD/title/`
   - Use `post` layout
   - **Thumbnail support**: Add `thumbnail.jpg` to `assets/images/posts/YYYY-MM-DD-title/` for blog listing
   - Images referenced using: `![Alt]({{ site.baseurl }}/assets/images/posts/YYYY-MM-DD-title/image.webp)`

2. **Presentations** (`presentations/`)
   - Self-contained HTML files with embedded CSS/JS
   - NOT processed by Jekyll (served as static files)
   - Must be excluded from Jekyll processing in `_config.yml`
   - Store each presentation in its own directory with `index.html`

3. **Documentation** (`docs/`)
   - Markdown files for long-form technical guides
   - Referenced directly from `index.html`

### Layouts

- `_layouts/default.html`: Main site layout with custom dark theme CSS
  - Includes header, navigation, and footer
  - All styles embedded (no external CSS files)
  - Uses Liquid template variables for site configuration

- `_layouts/post.html`: Blog post layout
  - Extends default layout
  - Adds post-specific formatting

### Configuration

`_config.yml` contains:
- Site metadata (title, description, author)
- URL configuration (`baseurl: /website`)
- Permalink structure for blog posts
- Jekyll processing exclusions (`.vscode/`, `.claude/`, `README.md`)
- Layout defaults for posts and presentations

### URL Structure

All internal links must use `{{ site.baseurl }}` to work correctly:
- Home: `/website/`
- Blog listing: `/website/blog/`
- Blog posts: `/website/blog/YYYY/MM/DD/title/`
- Presentations: `/website/presentations/folder-name/index.html`
- Docs: `/website/docs/filename.html`

## Creating New Content

### New Blog Post

1. **Create the post structure:**
   - Create post directory: `_posts/YYYY-MM-DD-descriptive-title/`
   - Create `index.md` in that directory with YAML front matter:
     ```markdown
     ---
     layout: post
     title: "Your Post Title"
     date: 2025-11-01 12:00:00 +0000
     categories: category1 category2
     ---

     Content here...
     ```

2. **Create assets:**
   - Create assets directory: `assets/images/posts/YYYY-MM-DD-descriptive-title/`
   - Add `thumbnail.jpg` (recommended) to assets directory for blog listing page
   - Add any post-specific images to the assets directory
   - Reference images using: `![Description]({{ site.baseurl }}/assets/images/posts/YYYY-MM-DD-descriptive-title/image.webp)`

3. **Update listings (IMPORTANT - Read carefully):**
   - ✅ **Automatic**: `blog/index.html` - Jekyll automatically lists all posts via `{% for post in site.posts %}`
   - ✅ **Automatic**: Home page blog section (`index.html`) - Uses Jekyll templating to show latest posts
   - ❌ **No updates needed** - Blog posts are fully automated!

**Notes:**
- Blog posts appear automatically when Jekyll builds - no manual listing updates required
- The blog count is also automatic via `{{ site.posts.size }}`
- Just create the post files and assets - Jekyll handles the rest

### New Presentation

1. **Create the presentation:**
   - Create directory: `presentations/YYYYMMDD-presentation-name/`
   - Add self-contained `index.html` with all CSS/JS embedded
   - Ensure presentation directory is excluded from Jekyll processing in `_config.yml`

2. **Update ALL listing pages (CRITICAL - Must update manually):**

   **File: `index.html` (Home page)**
   - Update presentation count in section header (e.g., "1 presentation" → "2 presentations")
   - Add new presentation entry to the `<ul class="content-list">` at the TOP (newest first)
   - Format:
     ```html
     <li>
       <a href="{{ site.baseurl }}/presentations/YYYYMMDD-name/index.html" class="content-link">
         <span class="content-title">Presentation Title</span>
         <span class="content-date">Mon DD, YYYY</span>
       </a>
     </li>
     ```

   **File: `presentations/index.html` (Presentations listing page)**
   - Add new presentation article at the TOP of `<div class="presentations-list">` (newest first)
   - Format:
     ```html
     <article class="presentation-item">
       <div class="presentation-meta">
         <span class="presentation-date">Month DD, YYYY</span>
         <span class="presentation-type">Type (e.g., Technical Deep Dive, Interactive Demo)</span>
       </div>
       <h2>
         <a href="{{ site.baseurl }}/presentations/YYYYMMDD-name/index.html">
           Presentation Title
         </a>
       </h2>
       <p class="presentation-description">
         Brief description of what the presentation covers...
       </p>
       <a href="{{ site.baseurl }}/presentations/YYYYMMDD-name/index.html" class="view-presentation">
         View Presentation →
       </a>
     </article>
     ```

**Checklist for adding a presentation:**
- [ ] Create presentation files in `presentations/YYYYMMDD-name/`
- [ ] Update count in `index.html` presentations section
- [ ] Add presentation entry to `index.html` content list (top of list)
- [ ] Add presentation article to `presentations/index.html` (top of list)
- [ ] Verify both pages use correct date format and `{{ site.baseurl }}` in URLs

### New Documentation

1. Add markdown file to `docs/`
2. Update `index.html` to link to it in documentation section
3. Update section count in `index.html`

## Content Update Quick Reference

When adding new content, here's what needs updating:

| Content Type | Automatic Listings | Manual Updates Required |
|--------------|-------------------|-------------------------|
| **Blog Post** | • `blog/index.html`<br>• `index.html` blog section<br>• Post counts | None - fully automated! |
| **Presentation** | None | • `index.html` (count + entry)<br>• `presentations/index.html` (full article) |
| **Documentation** | None | • `index.html` (count + entry) |

**Why the difference?**
- Blog posts use Jekyll's dynamic `site.posts` collection - fully automated
- Presentations are static HTML files excluded from Jekyll processing - require manual listing
- Documentation is minimal and rarely updated - manual listing is acceptable

## Design System

The site uses a custom dark theme defined in `_layouts/default.html`:

**CSS Variables:**
- Primary: `#60a5fa` (blue)
- Secondary: `#8b5cf6` (purple)
- Background: `#0f172a` (dark slate)
- Card background: `#1e293b`
- Text colors: `#f1f5f9` (primary), `#cbd5e1` (secondary), `#94a3b8` (muted)

**Design Patterns:**
- Card-based layouts with hover effects
- Gradient accents on headings and interactive elements
- Sticky navigation with backdrop blur
- Responsive breakpoint at 768px
- Consistent spacing and typography scale

## Important Notes

- **Always use `{{ site.baseurl }}`** in URLs for correct path resolution
- Presentations must be completely self-contained (no external dependencies)
- Home page (`index.html`) has hardcoded content counts that need manual updates
- No external CSS/JS files - all styles are embedded in layouts
- The site uses Inter font loaded from Google Fonts
- Jekyll permalink pattern: `/blog/:year/:month/:day/:title/`
