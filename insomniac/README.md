# /insomniac

`index.html` is the page. The four directories beside it (`lunaengineio/`,
`suitdamagepatcher/`, `atmosphereslots/`, `dat1gui/`) are link-preview stubs.

## Why the stubs exist

A URL fragment is never sent to the server, and link-preview crawlers
(Discord, Twitter, Slack) don't run JavaScript. So `/insomniac/#dat1gui` can
only ever preview as the whole page — there is no way to change that from the
page itself.

Each stub is a real page with its own `<title>` and Open Graph tags, so it
previews as that one tool. Anyone who actually clicks is sent straight on to
`/insomniac/#dat1gui` via `location.replace`, which leaves no extra history
entry to trip the back button.

The `[#]` button on a card copies the stub URL rather than the fragment, so
what gets shared is the version that previews properly. That link lives in
`data-share-url` on the card; sections without one fall back to the fragment.

## Adding a tool

1. add the card to `index.html` with an `id` and a matching `data-share-url`
2. copy an existing stub directory and change the slug, title and description
3. drop `img/<slug>.webp` in for the card image and the preview
