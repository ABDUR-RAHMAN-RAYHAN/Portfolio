# Abdur Rahman — Portfolio

A personal portfolio site built with HTML, CSS, vanilla JS, and a small Python (Flask) backend for the contact form. Themed like a code editor / program, since you're a CSE grad — sections are named like files (`About me`, `skills.json`, `projects/`, `log.txt`, `contact.py`).

## Files

```
index.html       structure/content of the site
style.css        all styling (design tokens at the top)
script.js        typing effect, mobile nav, scroll reveal, contact form logic
app.py           optional Flask backend that emails contact form submissions
requirements.txt Python dependencies for app.py
your-photo.jpg    <- add your own photo here (about section)
resume.pdf        <- add your own résumé here (hero "Download résumé" button)
```

## 1. Add your content

Open `index.html` and replace every placeholder in `[brackets]`:
- Your name (appears in the `<title>`, nav logo, hero, footer)
- About section bio, degree, university, CGPA
- Skills tags (add/remove as needed)
- Projects: name, description, tags, and links to live demo / GitHub repo
- Experience/education timeline entries
- Contact links: email, GitHub, LinkedIn

Drop these two files in the same folder:
- `your-photo.jpg` — your headshot for the about section
- `resume.pdf` — your résumé, linked from the hero button

## 2. Preview without the backend

You can open `index.html` directly in a browser, or serve it with any static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. The contact form will fall back to opening the visitor's email client if no backend is running.

## 3. Run the Python backend (optional, for a working contact form)

```bash
pip install -r requirements.txt

export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=you@example.com
export SMTP_PASS=your-app-password
export CONTACT_TO=you@example.com

python app.py
```

Visit `http://localhost:5000`. Submitting the contact form will now send you a real email.

> Tip: if you use Gmail, you'll need to create an "App Password" rather than using your normal password (Google account settings → Security → App passwords).

## 4. Deploy

- **Static only (no backend):** GitHub Pages, Netlify, or Vercel — just upload `index.html`, `style.css`, `script.js`, your photo, and résumé.
- **With the Flask backend:** Render, Railway, PythonAnywhere, or any host that runs Python. Set the same environment variables there, and update `CONTACT_ENDPOINT` in `script.js` if the frontend and backend end up on different domains.

## Customizing the look

All colors, fonts, and spacing live as CSS custom properties at the top of `style.css` under `:root`. Change `--accent` to switch the whole site's accent color in one place.
