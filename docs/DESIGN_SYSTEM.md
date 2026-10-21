# GerneGrün — design system

Source: completed desktop screens in the GerneGrün Figma file (Startseite, Über uns, Kontakt, Sortiment, Aktuelles), inspected 2026-09-09. This records what is actually on the canvas, rather than proposing a new system.

## Current implementation direction — 2026-09-17

The current home header and hero follow the latest supplied screenshot. These
rules supersede the extracted Figma dimensions below for those components.
The original palette, Nunito family, illustrations and organic image shapes
remain the brand foundations; the hero's handwritten secondary line uses a
Segoe Script system-font stack. Other Figma components retain their extracted specs.

| Role | Current implementation |
| --- | --- |
| Shared content rail | Up to 1280px below a 1440px viewport; up to 1440px from 1440px onward. Large-screen gutters grow from 48px to 96px. |
| Header | 4px top inset, 40px expandable lime opening-hours strip, 96px desktop navigation row; 72px mobile navigation row. |
| Desktop home hero | Centered single-column copy above the organic store image; content-driven height, 34–46px top inset below the header and 72px bottom padding. |
| Hero display | 56–76px primary line and 34–42px Segoe Script secondary line; mobile primary line 46–62px and secondary 30–39px. |
| Hero lead | 16–17px with 1.6 line height and a 560px maximum measure. |
| Hero controls | 50px minimum height on desktop; 54px on mobile. |
| Hero image | Up to 1128px wide, clipped to the supplied organic vector mask; the photo and focal point are editor-managed. |
| Section heading | Fluid 32–44px on desktop; 30px on mobile. |
| Card heading | 24px, increasing to 28px from 1440px. |
| Section/card body | 17px, increasing to 20px from 1440px; 1.55–1.6 line height. |
| Card supporting copy | 16px, increasing to 18px from 1440px; 1.55–1.6 line height. |
| Section spacing | Fluid 80–136px; assortment bottom adds 24px. Mobile uses 72px top / 80px bottom. |
| Weekly assortment grid | Full shared content rail; three columns, 40–72px column gaps, 64px gap below intro; two columns below 1024px and one below 768px. |

Typography and section-spacing tokens live in `app/globals.css`. Keep text at
a readable size on mobile rather than shrinking all desktop values proportionally.
At tablet widths the hero uses a 680px minimum height; on mobile it stacks and
uses natural content height. Avoid fixed section heights and clipped copy.

## Scope and maturity

- The source contains six completed 1440px-wide desktop artboards (one duplicate `Aktuelles` frame); their heights range from 1,877px to 3,861px.
- There are no local Figma variables, paint styles, text styles, effect styles, grid styles, or mobile artboards. The values below are therefore *extracted conventions*, not named Figma tokens.
- Layout is mostly positioned frames with selected horizontal/vertical auto-layout clusters (navigation, cards, small link rows, footer). Do not read current Figma constraints as a complete responsive specification.

## Foundations

### Sanity Studio

The Studio uses the existing GerneGrün palette and Nunito typeface: deep green
navigation, warm cream surfaces, botanical statistic cards, and lime accents.
Custom Studio tools should use Sanity UI primitives and keep their extra layout
styles in a local CSS Module. The **Bestellungen & Wünsche** tool uses a deep
green welcome panel, pale botanical metric cards, and clear green labels for new
requests; its data view remains read-only.
In custom tools, set explicit line heights on Sanity UI `Text` and `Heading`
elements. Keep at least a 12px vertical gap between a heading and its supporting
copy so the Studio's compact defaults do not make separate lines appear joined.

### Color

| Role | Value | Evidence / use |
| --- | --- | --- |
| Canvas cream | `#FBF5EB` | Main page background; light footer text |
| Card / pale botanical | `#F3F1D7` | Action and assortment cards; decorative organic shapes |
| Soft cream | `#FCF7EE` | Footer body copy and pale decorative areas |
| Deep green | `#08522B` | Primary text, dark badge/background, notice panel |
| Link green | `#2A6A43` | Text links and arrow icons |
| CTA green | `#177142` | Filled primary button |
| Badge green | `#1A693C` | Small uppercase eyebrow/label copy |
| Lime accent | `#97BF4B` | The light-weight final line/word in page H1s |
| Near-black | `#2E2E2E` | Card headings and body text |
| Muted near-black | `rgba(46,46,46,.72)` | Secondary card/body copy |
| Orange callout | `#F1820C` | Tall promotional strip / attention panel |
| Footer purple | `#494260` | Footer field behind the cream copy |

The illustrated assortment artwork additionally uses a dedicated green/yellow palette (`#2B824D`, `#225A37`, `#87BB58`, `#B1D46C`, `#D6E49C`, `#F3B131`). Treat those as illustration colors, not general UI status colors. No shadows or other effects were found on the sampled core components.

### Typography

The single typeface is **Nunito**, with real file weights Regular 400, SemiBold 600, Bold 700, and ExtraBold 800. Almost all text uses `letter-spacing: -1%`; labels are the exception at `+3%`.

| Role | Size / line height | Weight | Color / notes |
| --- | --- | --- | --- |
| Display / H1 | 80px / 91% (72.8px) | ExtraBold then Regular | First line deep green; final line/word lime. Explicit two-line composition. |
| Hero lead | 20px / 140% (28px) | Regular with Bold emphasis | Deep green; used just below H1. |
| Section heading / H2 | 36px / 122% (43.9px) | ExtraBold | Deep green. |
| Feature heading | 24px / 110% (26.4px) | Bold | White over illustrated/color field. |
| Body / intro | 16px / 122–150% (19.5–24px) | Regular, selectively Bold | Green for hero intro; near-black for normal prose. |
| Nav | 15px / 140% (21px) | SemiBold; active item ExtraBold | Deep green. |
| Footer heading | 16px / 122% (19.5px) | ExtraBold | Uppercase, cream. |
| Card title / category | 16px / 140% (22.4px) | Bold | Near-black, or deep green for category labels. |
| Footer copy | 14px / 122% (17.1px) | Regular | Cream. |
| Inline link | 14px / 111% (15.5px) | Bold / ExtraBold | Link green with arrow. |
| Card body | 12px / 111% (13.3px) | Regular | Near-black, often 72% opacity. |
| Eyebrow / badge | 12px / 140% (16.8px) | ExtraBold | `+3%` tracking; badge copy in white or label copy in badge green. |

Use rich-text emphasis inside otherwise regular copy rather than introducing extra heading levels. The display treatment depends on a weight/color switch inside one H1, not a different font.

## Layout and spacing

### Desktop rail and alignment

The implementation uses one shared responsive `Container` for the header,
hero, and page sections. Its content width is capped at **1280px**, increasing
to **1440px** at viewport widths of 1440px and above, with gutters of 24px on
mobile, 32px on tablet, and 48–96px on large screens. Decorative fields
may extend beyond this rail, but page content does not introduce local width
overrides.

- Desktop canvas: **1440px**.
- Main content consistently begins at about **x=175–200px** and ends near **x=1,279–1,311px**, yielding an approximately **1100px content rail** with 160–175px side margins.
- Hero H1 has an 888px measure, while hero leads are narrower (about 394–604px). Standard section headings also use the 888px measure even when their visible text is short.
- Header logo sits at x=83, y=9 and is 255×92px; the nav begins around x=472, y=34. Navigation is a horizontal auto-layout row with roughly 48px gaps.
- The repeated active-nav underline is 3px high and usually 82px wide (144px under the longer Kontakt item).

### Extracted spacing rhythm

The source is not tokenized, but repeated values indicate a practical scale: **3, 8, 12, 16, 21, 24, 27–32, 37–40, 48, 51, 62, 64, 80, 112px**. Prefer this cadence for future work rather than arbitrary one-off gaps.

Notable anchors:

- Header nav at y=34–55; hero begins at y=175.
- H1-to-lead gap: about 25px (H1 ends at y=321; lead begins y=346–350).
- Hero CTA begins around y=453 and is followed by a secondary text link near y=536.
- Standard sections generally return to the x≈200 rail; large vertical breaks are content-specific rather than a consistent section-padding token.

### Grids

| Pattern | Geometry |
| --- | --- |
| Action-card row | Three 257px cards at x≈502/781/1060: 22px gaps. The text/image split is 32px inset with a 193×175px image panel. |
| Assortment/category grid | Three columns, about 362–363px wide, at x=200/574/949: 12px gaps. |
| Offer cards | Three 257px columns at x≈195/474/753/1032, depending on the row. Column pitch is 279px (22px gap). Cards grow in height with copy (335–417px) rather than using a forced equal row height. |
| Timeline cards | Two wide cards, 486–496px wide, separated by about 106px; year pill overlaps above each. |
| Image-pair module | Two 516×476px panels separated by 43px. |
| Document previews | 529px and 550px wide, with a 25px gap. |

The card grids are desktop composition evidence. They are not auto-layout grids with Figma breakpoint behavior.

## Components

### Buttons and links

| Pattern | Spec |
| --- | --- |
| Primary CTA | 263×51px in the hero, `#177142` fill, 14px radius, centered cream 16px ExtraBold label. |
| Outline/select button | 161×51px, 14px radius, 1px deep-green stroke, centered 14px/20px text and a 11px arrow. |
| Text link | 12–14px Bold/ExtraBold link-green text followed by an approximately 11px arrow; no container. |
| Secondary hero link | Plain 16px text below CTA; no filled container. |
| Badge | 72×21px dark-green pill, 17px radius, white 12px ExtraBold text with +3% tracking. Timeline year pills use the same green and radius at 109×32px. |

No interaction states (hover, focus, disabled, pressed) are defined in the finished screens.

### Cards and panels

- **Action / offer card:** pale botanical `#F3F1D7`, 16px corner radius, no stroke/shadow. Default is 257px wide and content-driven in height. Image panel is approximately 193×175px; content uses 32px side insets. Card structure: image, 12px uppercase eyebrow, 16px title, 12px body, optional text link, plus top-right pill badge.
- **Assortment card:** about 362px wide, pale botanical base, 16px radius, large lifestyle/illustration visual and green copy. Keep copy and visual in the card; avoid detached overlays unless matching an existing composition.
- **Timeline card:** about 486–496×221px, pale botanical, 16px radius, 32px inner inset, image block on the right, and overlapping 109×32px year pill.
- **Dark notice panel:** 1100×155px, deep-green fill, 30px radius. Uses pale bold heading, white supporting text, left 96px icon, and right decorative/brand image.
- **Orange information strip:** `#F1820C`, 276px wide with a 21px radius; it functions as a colored vertical accompaniment to the offer-card grid.
- **Footer:** broad decorative purple field with three information columns. Footer cards begin with a 16px uppercase heading plus icon, then 14px regular lines. Common inner padding is 16px; opening-hours row spacing is 27px.

## Image and illustration treatment

- All raster fills use Figma image modes `FILL`, `CROP`, or `FIT`; there are no visible filters or adjustments on the sampled images.
- Standard product/category thumbnails are near-square (roughly 147–150px) and contain no applied corner radius in the file.
- Action-card art sits in a fixed 193×175px visual zone, often cropped or fitted; it should retain its image-first, editorial-card role.
- Large editorial images include 516×476px paired panels and a 779×779px hero/feature visual. The prominent 516×476 image has a 36px radius—the largest image radius observed.
- Organic vector fields and illustrated leaves are an intentional brand device. They overflow the visual background/section rather than acting as UI decoration inside controls.

## Responsive evidence and implementation implications

Only desktop screens exist. The Figma constraints make most page-level elements `MIN`-anchored; several text blocks use `CENTER`, but there are no mobile frames, breakpoint variants, or reflow prototypes. Consequently, the following are safe deductions, not source-defined breakpoint specs:

1. Center desktop content using the shared responsive rail defined above.
2. Convert three-column grids to fewer columns as available width declines; the current home assortment uses the larger gaps defined above, while other source components retain their extracted geometry.
3. Stack two-column editorial panels and timeline cards before forcing them below their intended readable measures.
4. Collapse or replace the fixed desktop nav intentionally on small screens; its x-positioned implementation does not define a mobile behavior.
5. Retain content-driven offer-card heights—do not crop product descriptions simply to equalize rows.

Before implementation, define explicit responsive breakpoints, mobile type sizes, navigation behavior, focus states, and token names; none are present in the supplied design file.
