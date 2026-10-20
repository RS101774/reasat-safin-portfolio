REASAT SAFIN — NEW MULTI-PAGE PORTFOLIO

Files:
- index.html: Home
- education.html: Education
- skills.html: Skills
- gallery.html: Gallery (tap an image to enlarge)
- contact.html: Contact
- about.html: About Me
- assets/style.css and assets/app.js
- SUPABASE_MIGRATION.sql

IMPORTANT SETUP
1. Back up your existing GitHub repository first.
2. Run SUPABASE_MIGRATION.sql in Supabase Dashboard → SQL Editor. This adds fields used by the editor and sets the intended RLS policies.
3. Upload/replace the six HTML files, assets folder, and SQL file in your GitHub repository. Keep the folder structure exactly as shown.
4. Vercel should redeploy from GitHub automatically.
5. Open the site, choose Owner Login, then Edit Profile and add your own HTTPS image links, school/college details, skill lines, and social links.
6. Skills format: one per line, for example: HTML & CSS | 90
7. Gallery: one direct HTTPS image URL per line. The URL must point to the image file itself, not an ordinary webpage.
8. Do not put a Supabase service-role/secret key in browser code. The publishable key in assets/app.js is intended for browser use with RLS enabled.

This is a front-end template based on the requested dark design. It does not fabricate your school photos or personal social links; fill those in through Owner Login.
