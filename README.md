# hk-portfolio

Portfolio for **Harshith K**, showcasing work across data engineering, AI/ML, and analytics.

## Getting Started

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

## Available Scripts

- `npm run dev` – start the Vite dev server.
- `npm run lint` – run TypeScript/ESLint checks.
- `npm run build` – type-check and generate the production bundle.
- `npm run preview` – preview the production build locally (after `npm run build`).

## Editing Content

- **Hero / Highlights / Skills / Experience / About sections** – located under `src/sections/`.
- **Project cards & case study links** – edit `src/sections/Projects.tsx`.
- **Case study pages** – each lives in `src/routes/case/`. Replace TODO placeholders and update the detailed `VIGraphRAG.tsx` example as a reference.
- **One-pager PDFs** – drop files into `public/pdfs/` and update the corresponding `pdf` field in `src/sections/Projects.tsx`.

## SEO Notes

- Shared meta handling resides in `src/components/layout/SEO.tsx`.
- Home page injects Person + WebSite JSON-LD; case pages emit `BreadcrumbList` schema via `CaseLayout`.
- Update canonical URLs or social handles in `SEO.tsx` / `App.tsx` when publishing to a new domain.

## EmailJS Setup (Contact Form)

The contact form uses EmailJS to send emails directly. To set it up:

1. **Sign up** for a free account at [https://www.emailjs.com/](https://www.emailjs.com/)
2. **Add Email Service:**
   - Go to Dashboard > Email Services
   - Click "Add New Service"
   - Choose Gmail (or your email provider)
   - Connect your email account (hk17@bu.edu)
3. **Create Email Template:**
   - Go to Dashboard > Email Templates
   - Click "Create New Template"
   - Use this template structure:
     ```
     From: {{from_name}} <{{from_email}}>
     To: hk17@bu.edu
     Reply-To: {{reply_to}}
     Subject: Portfolio Contact: {{from_name}}
     
     Message:
     {{message}}
     ```
   - Save and note your Template ID
4. **Get API Keys:**
   - Go to Dashboard > Account > API Keys
   - Copy your Public Key
5. **Set Environment Variables:**
   - Create a `.env` file in the project root
   - Add:
     ```
     VITE_EMAILJS_SERVICE_ID=your_service_id_here
     VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
     VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
     ```
   - For GitHub Pages, you'll need to hardcode these in `src/sections/Contact.tsx` (public keys are safe to expose)

> Note: If EmailJS isn't configured, the form will fall back to opening the user's email client.

## Deployment Guide (Vercel)

1. `npm run build` – ensure the production bundle is healthy.
2. `npx vercel login` – authenticate with Vercel (GitHub or email).
3. `npx vercel link` – inside the project root, link to an existing project or create a new one.
4. Add EmailJS environment variables in Vercel dashboard (Settings > Environment Variables).
5. `npx vercel --prod` – trigger the production deployment.

> Tip: The rewrite in `vercel.json` routes all paths to `/index.html` so client-side routing works out of the box.


