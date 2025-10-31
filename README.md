# Bodist's Documentation & Blog

This repository hosts documentation, blog posts, and presentations using GitHub Pages with Jekyll.

## Structure

```
website/
├── _config.yml              # Jekyll configuration
├── _layouts/                # Custom HTML layouts
│   ├── default.html         # Main site layout
│   └── post.html           # Blog post layout
├── _posts/                  # Blog posts (Jekyll managed)
│   └── YYYY-MM-DD-title.md
├── index.html               # Landing page
├── blog/                    # Blog listing page
│   └── index.html
├── presentations/           # Static HTML presentations (not processed by Jekyll)
│   └── 20251031-ai-coding-mitigation-presentation/
│       └── index.html
├── large_contents/          # Large markdown documents
│   └── *.md
└── blogs/                   # (Reserved for future use)
```

## Content Types

### 1. Blog Posts (Jekyll)
- Location: `_posts/`
- Format: Markdown with YAML front matter
- Naming: `YYYY-MM-DD-title.md`
- Automatically processed by Jekyll
- Published at: `/blog/YYYY/MM/DD/title/`

Example post:
```markdown
---
layout: post
title: "My Post Title"
date: 2025-10-31 23:00:00 +0000
categories: technology coding
---

Your content here in Markdown...
```

### 2. Presentations (Static HTML)
- Location: `presentations/`
- Format: Self-contained HTML files
- NOT processed by Jekyll (served as-is)
- Accessible at: `/presentations/folder-name/index.html`

### 3. Large Content (Documentation)
- Location: `large_contents/`
- Format: Markdown files
- Excluded from Jekyll processing
- Direct file access

## Setting Up GitHub Pages

### Step 1: Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section (left sidebar)
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

### Step 2: Update Configuration

Edit `_config.yml` and update:
```yaml
url: https://YOUR-USERNAME.github.io
baseurl: /REPOSITORY-NAME
```

For example:
- If your repo is at `github.com/bodist/website`
- Set `url: https://bodist.github.io`
- Set `baseurl: /website`

### Step 3: Wait for Deployment

GitHub will automatically build your site. Check the **Actions** tab to monitor the build progress.

Your site will be live at: `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`

## Local Development

### Prerequisites
- Ruby (2.7+)
- Bundler gem

### Setup
```bash
# Install Jekyll and dependencies
gem install bundler jekyll

# Create Gemfile (if needed)
bundle init
bundle add jekyll
bundle add minima  # or your chosen theme

# Serve locally
bundle exec jekyll serve

# Access at http://localhost:4000/website/
```

### Quick Local Preview (No Ruby Install)
```bash
# Use Docker
docker run --rm \
  --volume="$PWD:/srv/jekyll" \
  -p 4000:4000 \
  jekyll/jekyll \
  jekyll serve
```

## Creating New Content

### New Blog Post

1. Create file: `_posts/2025-11-01-my-new-post.md`
2. Add front matter:
```markdown
---
layout: post
title: "My New Post"
date: 2025-11-01 12:00:00 +0000
categories: tech tutorial
---

Your content...
```
3. Commit and push - GitHub Pages will auto-deploy

### New Presentation

1. Create folder: `presentations/my-presentation/`
2. Add your HTML: `presentations/my-presentation/index.html`
3. Update `index.html` to link to it
4. Commit and push

## Key Features

- **Mixed Content**: Jekyll blog posts + static HTML presentations
- **Clean URLs**: `/blog/2025/11/01/title/` for posts
- **Auto-deployment**: Push to GitHub, site updates automatically
- **No Build Required**: GitHub Pages builds Jekyll automatically
- **Responsive Design**: Mobile-friendly layout

## URLs

After deployment:
- Home: `https://YOUR-USERNAME.github.io/website/`
- Blog: `https://YOUR-USERNAME.github.io/website/blog/`
- Post: `https://YOUR-USERNAME.github.io/website/blog/YYYY/MM/DD/title/`
- Presentation: `https://YOUR-USERNAME.github.io/website/presentations/folder-name/`

## Troubleshooting

### Site not updating?
- Check **Actions** tab for build errors
- Verify `_config.yml` has correct `url` and `baseurl`
- Clear browser cache

### 404 errors?
- Ensure `baseurl` in `_config.yml` matches repository name
- Check all internal links use `{{ site.baseurl }}`

### Presentation styles broken?
- Check if CSS/JS paths in HTML are relative or absolute
- Ensure all assets are in the presentation folder

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Themes](https://jekyllrb.com/docs/themes/)
