# Vercel Free-Access Text-to-Video Starter

A Next.js app with a server-side API route that calls a public Hugging Face Gradio Space. It does **not** include a paid provider or automatic paid fallback.

## Reality check: free does not mean unlimited

- There is no guaranteed unlimited free hosted text-to-video API.
- Public Spaces can sleep, queue requests, change hardware, require a token, or disable access.
- The Space owner controls its usage policy. Verify that it explicitly permits your intended free use.
- This project does not automatically switch to a paid API. It can still incur infrastructure costs from your own hosting/provider plan; check Vercel's current limits.
- Do not advertise unlimited generation unless you actually have capacity and permission to provide it.

## 1. Find a compatible Space

1. Browse Hugging Face Spaces for text-to-video demos.
2. Open a candidate Space and verify that it is running and that its terms permit your use.
3. Click **Use via API** on that Space.
4. Record:
   - Space ID, usually `owner/space-name`
   - API endpoint name, such as `/predict`
   - Exact input parameters and their order
   - The output schema, including how video files are returned
5. This starter assumes the endpoint takes exactly one string input (the prompt). If the Space's API panel shows additional inputs, edit `app/api/generate-video/route.js` to match them.

A Space's endpoint may not be named `/predict`, and not every Space supports text-to-video.

## 2. Run locally

Requires a supported Node.js LTS version and npm.

```bash
npm install
cp .env.example .env.local
```

On Windows PowerShell, use this instead of `cp` if needed:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local`:

```dotenv
VIDEO_SPACE_ID=owner/your-text-to-video-space
VIDEO_API_NAME=/the-endpoint-from-use-via-api
HF_TOKEN=
MAX_PROMPT_LENGTH=1000
```

`HF_TOKEN` is optional. Only use a token if the Space requires it. Keep it server-side; do not name it `NEXT_PUBLIC_HF_TOKEN`.

Then run:

```bash
npm run dev
```

Open http://localhost:3000.

## 3. Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. In Vercel, import that repository as a Next.js project.
3. In **Project → Settings → Environment Variables**, add:
   - `VIDEO_SPACE_ID`
   - `VIDEO_API_NAME`
   - `HF_TOKEN` only if required
   - `MAX_PROMPT_LENGTH` (optional)
4. Do not prefix secrets with `NEXT_PUBLIC_`.
5. Redeploy after changing environment variables.

## 4. Test the API

```bash
curl -X POST http://localhost:3000/api/generate-video ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\":\"A small red balloon floating over a quiet seaside town at sunrise\"}"
```

PowerShell curl syntax may differ; the UI is the easiest first test.

## 5. Adapt the response for video playback

Gradio Spaces may return a URL, a file object, a temporary file path, a gallery list, or a structured object. This app displays video URLs it can recognize; otherwise it shows the raw response so you can map the actual output. Some Spaces return temporary URLs that expire.

If the Space accepts a negative prompt, duration, resolution, seed, or other options, update the backend inputs to match its API schema.

## Security and production notes

- Never commit `.env.local` or publish your Hugging Face token.
- Add authentication and per-user rate limiting before opening the endpoint to the public.
- Consider background jobs and object storage for longer videos. Vercel functions have execution limits; a synchronous generation request may time out.
- Treat provider outputs as untrusted input and avoid logging secrets.
- Free Space availability and quotas can change at any time.

## Files

- `app/page.jsx`: user interface
- `app/api/generate-video/route.js`: server-side generation endpoint
- `.env.example`: safe environment-variable template
