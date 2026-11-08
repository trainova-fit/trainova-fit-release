# Muscle map credits

The front and back muscle figures on the Trainova Fit website come from two sources.

**Illustrations:** Ryan Graves, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Source: https://www.figma.com/community/file/1320468164820924031

**SVG structure and muscle ids:** [flutter_body_atlas](https://github.com/kit-g/flutter-body-atlas) by Kit G., BSD 3-Clause.

## Files

| File | What it is |
|---|---|
| `atlas-front.svg` | Front figure for the site. Fills removed, coordinates rounded to 1 decimal, `class="atlas-svg"`, scaled into the back figure's 596 x 1133 frame so both line up. |
| `atlas-back.svg` | Back figure for the site. Fills removed, coordinates rounded to 1 decimal, `class="atlas-svg"`. |
| `src/front.raw.svg` | Unmodified `muscle_layer_front.svg` from flutter_body_atlas. |
| `src/back.raw.svg` | Unmodified `muscle_layer_back.svg` from flutter_body_atlas. |
| `LICENSE-flutter_body_atlas.txt` | CC BY 4.0 notice and the BSD 3-Clause text. |

All element ids are unchanged from the source files.

## Changes made for the website

- Removed the grey fills so the site can colour muscles with CSS.
- Rounded path coordinates to 1 decimal.
- Front figure only: wrapped in a group scaled by 0.99648 and offset 5.5 units so it sits in the same 596 x 1133 frame as the back.

The website footer credits Ryan Graves under CC BY 4.0.
