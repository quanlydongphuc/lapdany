# Lap Dan Y

AI writing assistant for grade 4 and grade 5 students.

## Run locally

Install dependencies with `npm install`, then start the development server with `npm run dev`.

## Vercel deployment

The app builds with `npm run build`. Configure these server-side environment variables in Vercel:

- `OPENAI_API_KEY`
- `AI_MODEL`
- `APP_ACCESS_PASSWORD`
- `APP_ACCESS_SECRET`
- `BLOB_READ_WRITE_TOKEN` (connect the `lapdany-essays` Blob store)

The Blob store keeps saved writing and generated illustrations available across browsers.
