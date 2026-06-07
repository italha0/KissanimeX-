# Anime Downloader - Appwrite Backend Architecture

This Next.js app now targets an Appwrite-backed API instead of the dead third-party worker. The frontend stays simple, while Appwrite can handle the backend endpoint, database, storage, and optional auth.

---

## Backend Shape

The UI talks to one backend base URL. That backend can be an Appwrite Function, an Appwrite-hosted service, or a thin API layer behind Appwrite.

```
User searches for anime
  ↓
Appwrite backend endpoint
  → Search results with title, poster, rating, synopsis
  ↓
User selects an anime
  ↓
Appwrite backend endpoint
  → Episode list
  ↓
User selects an episode
  ↓
Appwrite backend endpoint
  → Download link(s) with quality options
```

---

## What Appwrite Should Handle

- Anime metadata and search results
- Episode lists and pagination
- Download link records or generated links
- Poster and banner assets through Appwrite Storage
- Optional favorites, watch history, and authentication

---

## Frontend Contract

The app expects these environment variables:

```env
NEXT_PUBLIC_APPWRITE_BACKEND_URL=https://your-appwrite-backend.example.com
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
```

`NEXT_PUBLIC_APPWRITE_BACKEND_URL` is the base URL used in [lib/api.ts](lib/api.ts). `NEXT_PUBLIC_APPWRITE_ENDPOINT` is optional, but it lets Next.js allow Appwrite Storage hosts for remote poster images.

---

## Recommended Setup

1. Create an Appwrite project.
2. Expose the anime search, episode list, and download endpoints through Appwrite Functions or a service behind Appwrite.
3. Return the same response shapes the UI already expects.
4. Store poster images in Appwrite Storage if you want to avoid third-party image hosts.
5. Set `NEXT_PUBLIC_APPWRITE_BACKEND_URL` in the Next.js app.

---

## Current App Behavior

- Search requests are sent through the backend URL in [lib/api.ts](lib/api.ts).
- Episode lists are loaded from the same backend URL.
- Download links are fetched from the same backend URL.
- Poster images are loaded directly when available, with a placeholder fallback.

---

## Notes

The repo does not yet include the Appwrite SDK or a database schema. The code is now structured so you can wire it to Appwrite without changing the UI contract again.
