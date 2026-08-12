# Fonts, for the OG image only

These never reach a browser. `docs/design-handoff.md` §04 specifies system stacks and no
webfonts, and the site still ships none — but `next/og` renders on the server through Satori,
where no system fonts exist, so the OG image and the icon have to be handed real font files.
They are baked into a PNG at build time, so the weight budget in §09 is untouched.

The three faces are the open members of the stacks in §04, not new typefaces:

| File | Stands in for | Stack |
|---|---|---|
| `RobotoSlab-Regular.ttf` | Superclarendon / Rockwell | display (§04) |
| `Roboto-Regular.ttf` | Avenir Next | body (§04) |
| `RobotoMono-Regular.ttf` | SF Mono / Menlo | utility (§04) |

Roboto Slab and Roboto are already named in those stacks, which is why they were chosen: the
OG image is set in a face the page itself may fall back to, rather than in something invented
for the server.

Apache License 2.0, `LICENSE.txt`. Latin subsets pulled from the Google Fonts CSS API.
