# Ingredient QR stickers

Print assets for the "scan for ingredients" stickers that go on packaging.
Each sticker points at a real page on the live site: `https://dipsprinkle.com/ingredients/<slug>`.

## Files

| File | Use |
| --- | --- |
| `sticker-cake-pop-print.html` | Open in a browser and print. Six 3in stickers per US Letter sheet, everything inlined. |
| `sticker-cake-pop.svg` | The full sticker (cocoa ring, curved text, QR) for a sticker printer or a designer. |
| `qr-cake-pop-ingredients.svg` | The bare QR on its cream field, if you want to place it in your own layout. |
| `qr-cake-pop-ingredients.png` | Same thing as a 984px raster, for anything that will not take an SVG. |

Print at 100% scale.
"Fit to page" shrinks the code below the size it was verified at.
Cut outside the cocoa ring, and keep the cream centre light and matte.
A glossy or dark laminate over the code is the usual reason a sticker stops scanning.

## Regenerating

```
npm i --no-save qrcode jsqr
node scripts/qr/generate-ingredient-qr.mjs
```

The script rasterises the exact geometry it is about to write and decodes it back with jsQR at seven resolutions.
If a styling change would make the sticker unscannable, it throws instead of writing files.
Two constraints in there are load-bearing rather than cosmetic, and both are commented at the top of the script:
the finder and alignment patterns stay solid, and the data dots stay at r = 0.5 cells so neighbours touch.

## Adding another flavour

1. Add an entry to `ingredientPages` in `src/data/ingredients.ts`.
   That publishes `https://dipsprinkle.com/ingredients/<slug>` on the next deploy.
2. Add the matching `{ slug, label, ring }` entry to `targets` in `scripts/qr/generate-ingredient-qr.mjs` and rerun it.
