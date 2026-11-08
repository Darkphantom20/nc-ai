# JRMSU Narrative Report Generator

This project is a Vercel-ready web app version of the narrative report generator.

## Stack
- Next.js
- TypeScript
- Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

## AI drafting

Use **Draft with AI** to create editable text for the narrative report fields. Drafts are reviewed before they are applied to the form. The app supports Groq, Gemini, DeepSeek, and Cloudflare Workers AI through server-side API routes; provider credentials are never sent to the browser.

Use **Generate with AI** in an individual section editor to create or revise that section. Add an optional focus, choose whether the result should contain 1–10 sentences or paragraphs, generate once, review the result in the editor, and choose **Save** to apply it. Generation uses the weekly journal activities and generated weekly narratives as its primary source for student-experience content, with related user-edited report fields as supporting context. For case analysis, it uses documented issues when available or clearly labels a task-grounded inference as a potential challenge rather than a confirmed event. Unchanged sample text, attachments, and unrelated default data are excluded. Full-report drafting uses the same journal context. Official organization statements still require explicit source details; journal entries alone are not treated as proof of an organization's mission, vision, or services. The AI is instructed to follow the user's actual field and duties rather than assuming an IT placement, and to ask for details instead of guessing. Always review AI-generated text for accuracy before including it in a final report.

When **I continued my OJT in another place** is enabled, the second-placement fields from Introduction through Reflections also provide **Generate with AI**. Their context is isolated to details entered in the second placement and does not reuse the first placement's journal or report fields. The report retains one shared Acknowledgement section.

Add one or more provider keys to `.env.local` (do not commit this file):

```env
GROQ_API_KEY=your-rotated-groq-key
# or
GEMINI_API_KEY=your-rotated-gemini-key
# or
DEEPSEEK_API_KEY=your-rotated-deepseek-key
# or, for Cloudflare Workers AI
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
AI_PROVIDER=cloudflare
```

When multiple providers are configured, generation tries the selected provider first and automatically falls back to the others. Set `AI_PROVIDER` to `groq`, `gemini`, `deepseek`, or `cloudflare` to choose the first provider. Without it, section generation rotates the initial provider, while full-report drafting defaults to Groq, then Gemini, DeepSeek, and Cloudflare. Optional model overrides are `GROQ_MODEL`, `GEMINI_MODEL`, `DEEPSEEK_MODEL`, and `CLOUDFLARE_MODEL` (Cloudflare defaults to `@cf/meta/llama-4-scout-17b-16e-instruct`). If Cloudflare rejects a configured model as deprecated, the AI routes retry with that current Llama model. Restart the development server after changing environment variables. For Vercel, add the same variables under the project's Environment Variables settings and redeploy.

Cloudflare Workers AI requires both the account ID and an API token with Workers AI Read and Edit permissions. Keep both values server-side; never use a `NEXT_PUBLIC_` prefix. Cloudflare's free usage allocation is limited and subject to account and service limits, so generation is not unlimited. The selected provider can fall back to another configured provider if Cloudflare is unavailable.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import it into Vercel.
3. Use the default Next.js settings.

## Groq AI text generation

Set `GROQ_API_KEY` as a server-only environment variable.

```powershell
$env:GROQ_API_KEY="your_groq_api_key"
npm run dev
```

For Vercel, add `GROQ_API_KEY` under **Project Settings → Environment Variables**, then redeploy. Optional `GROQ_MODEL` defaults to `openai/gpt-oss-20b`. Never use a `NEXT_PUBLIC_` prefix for the key.

## Gemini backup text generation

Set `GEMINI_API_KEY` as another server-side environment variable. When a provider is unavailable, rate-limited, or returns unusable text, the API automatically retries with other configured providers.

```powershell
$env:GEMINI_API_KEY="your_gemini_api_key"
npm run dev
```

For Vercel, add the provider keys under **Project Settings → Environment Variables**, then redeploy. Optional `GEMINI_MODEL` defaults to `gemini-flash-latest`. Treat all keys as secrets and rotate any key that has been shared publicly.

## DeepSeek backup text generation

Set `DEEPSEEK_API_KEY` as a server-only environment variable. DeepSeek is used as a fallback when earlier configured providers are unavailable; set `AI_PROVIDER=deepseek` to try it first. Optional `DEEPSEEK_MODEL` defaults to `deepseek-flash`.

For Vercel, add `DEEPSEEK_API_KEY` under **Project Settings → Environment Variables**, then redeploy. Never use a `NEXT_PUBLIC_` prefix for the key. If a key has been pasted into chat, a screenshot, or source control, revoke it and configure a replacement.

## Cloudflare Workers AI (Llama)

Create a Cloudflare API token with Workers AI Read and Edit permissions and find your account ID in the Cloudflare dashboard. Add both as server-only environment variables:

```env
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
AI_PROVIDER=cloudflare
# Optional model override:
CLOUDFLARE_MODEL=@cf/meta/llama-4-scout-17b-16e-instruct
```

Both AI routes use Cloudflare's chat-completions API. `AI_PROVIDER=cloudflare` prioritizes Cloudflare; other configured providers remain available as fallbacks. Cloudflare Workers AI has a limited free usage allocation and may impose additional limits; check Cloudflare's current pricing and account terms. For Vercel, add these values under **Project Settings → Environment Variables** and redeploy. Do not expose either credential to client-side code.

## Multiple API keys and automatic fallback

To cycle through several keys for Groq, Gemini, or section generation with DeepSeek and Cloudflare, add comma-, semicolon-, or newline-separated keys to `GROQ_API_KEYS`, `GEMINI_API_KEYS`, `DEEPSEEK_API_KEYS`, or `CLOUDFLARE_API_TOKENS`. The existing singular variables also remain supported.

```powershell
$env:GROQ_API_KEYS="groq_key_1,groq_key_2,groq_key_3"
$env:GEMINI_API_KEYS="gemini_key_1,gemini_key_2"
$env:DEEPSEEK_API_KEYS="deepseek_key_1,deepseek_key_2"
$env:CLOUDFLARE_API_TOKENS="cloudflare_token_1,cloudflare_token_2"
npm run dev
```

The section-generation API rotates provider priority when `AI_PROVIDER` is unset, tries each available key once, and puts a key temporarily on cooldown when a provider reports a rate limit. Provider timeouts, account balance/credential errors, and output-validation failures are reported separately; a rate limit in one provider does not mean every provider is busy. Generation checks requested sentence/paragraph counts and constrains action fields to documented steps, but generated content should still be reviewed against the source journal. Full-report drafting uses one key per configured provider; plural key settings are currently supported only for section generation.

## Notes

Narratives are saved automatically in this browser using IndexedDB, which supports much more data than `localStorage` and is better suited to reports with attached images. Existing drafts from the earlier `localStorage` format are migrated automatically after the first successful save. Use **New narrative** to start a separate report, then use **Current narrative** to switch between reports. Browser-local drafts are not shared across browsers or devices, and the browser can still enforce storage limits, so generate/download a copy to keep a separate backup.

When creating a narrative, choose **Import complete narrative DOCX** to read and preview an existing report before importing it. Recognized headings throughout the report are mapped into their matching editable fields, including organization analysis, tasks, case analysis, reflections, the PRIME narrative, and Daily Journal tables. Fields without a match start blank. The original DOCX and its full extracted text are saved with the narrative in this browser and can be reopened with **View imported DOCX**; content without a matching editor field remains available there. Imports are limited to 25 MB.

In **Page Layout Style**, use **Report Template** to choose either **Current System Layout** or **narrative-report.docx Layout**. The DOCX-based option uses the template's cover, acknowledgement, table of contents, organization sections, appendices, one-inch page margins, and Times New Roman structure while retaining the report data entered in the system.

In **Appendices → Daily Journal**, use **Import DOCX** to read journal tables with date and accomplishment columns. The import review matches any embedded documentation photo to the day row containing it; days without a photo stay unattached. Confirming replaces only that report's Daily Journal entries and keeps the selected journal output layout and other report sections unchanged. Hours are left blank when the source table has no hours column.
