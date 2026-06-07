# Appwrite Schema

This schema is built for the pattern where the Appwrite Function fetches once from a source API, stores durable data in Appwrite Database, and serves the frontend from Appwrite on subsequent requests.

## Design Goals

- Keep anime metadata cached in the database
- Keep episode lists cached in the database
- Treat download links as refreshable, not permanent
- Let the frontend read from Appwrite instead of hitting the source directly

## Collections

### `anime`

One document per anime title.

Suggested fields:

- `title` - string
- `slug` - string, unique if possible
- `posterUrl` - string
- `bannerUrl` - string, optional
- `description` - string
- `genres` - array of strings
- `status` - string
- `score` - number, optional
- `year` - number, optional
- `episodeCount` - number, optional
- `sourceId` - string, the upstream source identifier
- `lastSyncedAt` - datetime

### `series`

One document per anime source record or series variant.

Suggested fields:

- `animeId` - relationship to `anime`
- `sourceId` - string, the upstream series identifier
- `subOrDub` - string, values like `sub` or `dub`
- `title` - string
- `posterUrl` - string, optional duplicate for convenience
- `synopsis` - string, optional
- `episodeCount` - number, optional
- `currentPage` - number, optional
- `totalPages` - number, optional
- `lastSyncedAt` - datetime

### `episodes`

One document per episode.

Suggested fields:

- `animeId` - relationship to `anime`
- `seriesId` - relationship to `series`
- `sourceId` - string, the upstream episode identifier
- `episodeNumber` - number or string
- `title` - string
- `snapshotUrl` - string, optional
- `downloadUrl` - string, optional short-lived cache only
- `downloadUrlExpiresAt` - datetime, optional
- `quality` - string, optional
- `subOrDub` - string, optional
- `lastSyncedAt` - datetime

## Download Link Rule

Store a download URL only if you also store an expiration time or refresh it every time the user opens the episode. If the link is temporary, the document should be treated as a cache entry, not a permanent source of truth.

Recommended behavior:

1. Function receives an episode request.
2. Function checks the database for a valid cached download URL.
3. If the cached URL is missing or expired, function fetches a fresh one.
4. Function updates the episode document with the new URL and expiration time.
5. Client receives the fresh or cached URL.

## Indexes

Suggested indexes:

- `anime.slug`
- `anime.sourceId`
- `series.animeId`
- `series.sourceId`
- `episodes.seriesId`
- `episodes.animeId`
- `episodes.sourceId`
- `episodes.episodeNumber`

## Sync Strategy

- Search endpoints can write or update `anime` records.
- Series endpoints can write or update `series` records.
- Episode endpoints can write or update `episodes` records.
- A scheduled function can resync stale records.

The current `anime-api` function supports `GET` for reads and `POST` for sync/upsert operations on the same `?method=search`, `?method=series`, and `?method=episode` routes.

## Practical Recommendation

If you want the safest version, store metadata and episode lists permanently, then treat download links as cached values with a refresh path. That keeps the app fast without depending on stale direct links.