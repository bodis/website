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
   - Post assets (images, thumbnails) stored in same directory
   - Automatically processed by Jekyll
   - Published at: `/blog/YYYY/MM/DD/title/`
   - Use `post` layout
   - **Thumbnail support**: Add `thumbnail.jpg` to post directory for blog listing page
   - Images referenced in posts use relative paths (e.g., `![Alt](image.webp)`)

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
- Include directives for post assets (`_posts/*/*.webp`, `_posts/*/*.jpg`, `_posts/*/*.png`)

### URL Structure

All internal links must use `{{ site.baseurl }}` to work correctly:
- Home: `/website/`
- Blog listing: `/website/blog/`
- Blog posts: `/website/blog/YYYY/MM/DD/title/`
- Presentations: `/website/presentations/folder-name/index.html`
- Docs: `/website/docs/filename.html`

## Creating New Content

### New Blog Post

1. Create directory: `_posts/YYYY-MM-DD-descriptive-title/`
2. Create `index.md` in that directory with YAML front matter:
   ```markdown
   ---
   layout: post
   title: "Your Post Title"
   date: 2025-11-01 12:00:00 +0000
   categories: category1 category2
   ---

   Content here...
   ```
3. Add `thumbnail.jpg` (recommended) for blog listing page display
4. Add any post-specific images to the same directory
5. Reference images in markdown using relative paths: `![Description](image.webp)`
6. Update home page listing count if needed in `index.html`

### New Presentation

1. Create directory: `presentations/YYYYMMDD-presentation-name/`
2. Add self-contained `index.html` with all CSS/JS embedded
3. Update `index.html` to add link in presentations section
4. Ensure presentation directory is excluded from Jekyll processing

### New Documentation

1. Add markdown file to `docs/`
2. Update `index.html` to link to it in documentation section
3. Update section count in `index.html`

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
