# AffordMed URL Shortener – Backend

## Quick start
```bash
npm i
cp .env.example .env       # edit MONGO_URI if needed
npm start                  # runs on http://localhost:4000
```

## Endpoints
- **POST /shorturls** → `{ url, validity?, shortcode? }` → `201 { shortLink, expiry }`
- **GET /:code** → 302 redirect (records click)
- **GET /shorturls/:code/stats** → stats JSON
- **GET /shorturls** → list all (for UI)

## Notes
- Default validity = **30 minutes** if not provided.
- Shortcode is globally unique; alphanumeric 3–20 if custom.
- Logging middleware writes to `logs/app.log` and sets `X-Correlation-Id`.
