# Mary Kathryn Chandler – Portfolio Website

A static website (plain HTML, CSS and a little JavaScript). No server or build step is needed to run it.

**Preview:** double-click `index.html`.
**Publish:** upload this whole folder to any static host, e.g. Netlify (drag the folder onto app.netlify.com/drop), GitHub Pages, or Cloudflare Pages.

## Pages

| File | Page |
| --- | --- |
| `index.html` | About Me |
| `graphics.html` | Graphics index |
| `spartanburg-academic-movement.html`, `meals-on-wheels.html`, `childrens-museum.html`, `the-dress-bridal-sc.html` | Graphics projects |
| `social-media.html` | Social Media |
| `writing.html` | Writing & Email Strategy |
| `coursework.html` | Relevant Coursework |
| `t-shirt-contest.html` | T-shirt Contest |
| `404.html` | Not-found page (used automatically by most hosts) |

## Before you publish

1. **Download the images.** They currently load from Google-hosted Stitch links, which may stop working someday. On a computer with Python 3, run `python3 scripts/localize_images.py` once. It saves them to `assets/images/` and updates every page. Then re-upload the folder.
2. **Set any remaining Google Docs / Drive / Slides links to "Anyone with the link can view"**, or visitors will be asked for access.
3. **Review the new Meals on Wheels caption** for the Volunteer Appreciation Breakfast flyer.

## Editing

- Content lives directly in each `.html` file.
- Styling uses Tailwind CSS. If you change classes in the HTML, rebuild the stylesheet: `npm install` then `npm run build:css` (design colors, fonts and spacing are in `tailwind.config.js`).
- Instagram posts on `social-media.html` are live embeds (`assets/instagram-embeds.js`). To add or swap a post, wrap its link like the others: `<div data-ig-url="https://www.instagram.com/p/POSTCODE/"><a href="...">...</a></div>`. Posts must be public. If Instagram can't load, visitors see the plain "View Post" tile instead.
- Shared behavior (mobile menu, footer year, scroll fade-in) is in `assets/site.js`.
- The header and footer are repeated in each page, so a nav change means editing every file.
