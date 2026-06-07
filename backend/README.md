# Backend

This folder contains the Appwrite Functions backend for the app.

## Functions

- Existing entrypoint: `functions/anime-api`
- Optional split-out stubs: `search`, `series`, and `episode`

## Contract

The frontend is already wired to call one backend base URL with these query modes, which matches the existing `anime-api` function:

- `?method=search`
- `?method=series`
- `?method=episode`

The same function also accepts `POST` requests on those routes to upsert cached records into Appwrite Database.
Search `GET` requests are cache-first: Appwrite is checked first, and only a cache miss calls the configured fresh search source.

## Project details

- Appwrite project ID: `6a251baf00130dde2cdf`
- Appwrite API key: keep this out of source control and set it locally or in Appwrite CLI when deploying
- Appwrite endpoint: `https://cloud.appwrite.io/v1`

## Fresh search source

Set `ANIME_SOURCE_SEARCH_URL` to the function or API endpoint that fetches fresh anime results. The URL can either contain `{query}` as a placeholder, or the backend will append `ANIME_SOURCE_SEARCH_QUERY_PARAM` as a query parameter.

Examples:

```env
ANIME_SOURCE_SEARCH_URL=https://example.com/search
ANIME_SOURCE_SEARCH_QUERY_PARAM=query
```

```env
ANIME_SOURCE_SEARCH_URL=https://example.com/search/{query}
```

## Schema design

See [appwrite-schema.md](appwrite-schema.md) for the database layout, collection fields, and caching rules.

## Next step

Use `anime-api` as the cache-first entrypoint: read from Appwrite on `GET`, and sync records into Appwrite on `POST`.
