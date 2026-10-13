# GerneGrün Website

## Project

GerneGrün is a custom marketing and content website.

The visual design is created separately in Figma and must be implemented faithfully rather than redesigned during development.

Primary stack:

* Next.js with App Router
* TypeScript
* Sanity CMS
* Motion for React
* GSAP
* Vercel
* npm

The project does NOT use a `src/` directory.

---

# Sources of truth

Use the following priority when making implementation decisions:

1. Figma is the source of truth for visual design and layout.
2. Existing project code and design tokens are the source of truth for implementation conventions.
3. Sanity schemas are the source of truth for editable content structure.
4. Documentation in `/docs` defines architectural and project-specific decisions.
5. This `AGENTS.md` defines general implementation rules.

Do not invent new design patterns when an existing pattern already exists.

Do not redesign Figma layouts unless explicitly requested.

---

# Project structure

Use this general structure:

* `app/`

  * routes, layouts and page composition

* `components/ui/`

  * reusable UI primitives
  * buttons, badges, icons, accordions, controls

* `components/layout/`

  * header, footer, navigation, containers and global layout components

* `components/sections/`

  * reusable page sections and larger visual compositions

* `components/motion/`

  * reusable animation primitives and motion utilities

* `sanity/schemaTypes/`

  * Sanity schemas

* `sanity/queries/`

  * GROQ queries

* `sanity/lib/`

  * Sanity clients, helpers and configuration

* `sanity/types/`

  * Sanity-related TypeScript types

* `lib/`

  * generic application utilities

* `public/images/`

  * image assets

* `public/icons/`

  * icon assets

* `public/video/`

  * video assets

* `public/graphics/`

  * illustrations and graphic assets

* `public/fonts/`

  * locally licensed font assets when applicable

* `docs/`

  * durable project documentation

Do not create alternative folders for the same responsibility without a clear reason.

---

# Working principles

Before changing code:

1. Inspect the relevant existing files.
2. Check whether an existing component or utility already solves the problem.
3. Check relevant documentation in `/docs`.
4. When a Figma frame or component is supplied, inspect it before implementing.
5. Keep the scope limited to the requested feature.

Do not refactor unrelated code.

Do not rename or reorganize unrelated files.

Do not introduce new dependencies unless they solve a concrete problem that cannot reasonably be solved with the existing stack.

Prefer straightforward code over clever abstractions.

---

# Next.js and React

Use React Server Components by default.

Only add `"use client"` when client-side functionality is actually required, for example:

* interaction state
* browser APIs
* Motion animations
* GSAP animations
* event listeners
* client-side hooks

Keep client component boundaries as small as practical.

Do not turn an entire page into a Client Component just because one element requires interaction.

Pages should primarily compose existing sections and data.

Avoid large monolithic page components.

Use:

* `next/image` for appropriate images
* `next/link` for internal navigation
* Next.js Metadata APIs for SEO metadata

Avoid unnecessary `useEffect`.

Prefer server-side data fetching when possible.

---

# Components

Components should have a clear responsibility.

Use existing components before creating new ones.

Prefer composition over large configurable components with many unrelated props.

## UI components

`components/ui/` contains generic reusable primitives.

Examples:

* Button
* Badge
* Accordion
* Icon
* Heading
* RichText
* ImageFrame

UI primitives should not contain page-specific business logic.

## Layout components

`components/layout/` contains global structural elements.

Examples:

* Header
* Footer
* Navigation
* Container

## Section components

`components/sections/` contains larger content compositions.

Examples:

* HeroSection
* NewsSection
* AssortmentSection
* StoreIntroSection
* ContactSection

Sections may consume CMS data but should remain presentational where practical.

---

# Sanity

Content that editors are expected to change should normally live in Sanity.

Do not move purely technical configuration into Sanity.

Keep presentation logic separate from Sanity schemas.

Place GROQ queries in:

`sanity/queries/`

Do not scatter large GROQ queries throughout React components.

Place Sanity client configuration and helpers in:

`sanity/lib/`

Place schemas in:

`sanity/schemaTypes/`

Use clear and predictable schema names.

Prefer reusable Sanity objects where the same structured content appears in multiple places.

Do not expose write tokens or secrets to client-side code.

Do not hardcode CMS content in React when the content is intended to be editable.

---

# Design implementation

Figma is the visual source of truth.

When implementing a Figma design:

* preserve hierarchy
* preserve intended spacing
* preserve typography
* preserve proportions
* preserve image treatment
* preserve responsive behavior
* reuse existing design tokens
* reuse existing components

Do not approximate design values when the actual value is available.

At the same time, avoid unnecessary one-off values when an existing project token represents the same visual value.

If Figma and the current implementation conflict, identify the conflict instead of silently creating a third design variant.

---

# Design tokens

Global design values should be centralized where practical.

Examples:

* colors
* typography
* spacing conventions
* container widths
* radii
* shadows
* breakpoints
* animation timings

Prefer CSS custom properties for global design-system values where appropriate.

Avoid duplicating the same literal values across many components.

Do not create new global tokens for values that are genuinely unique to one component.

---

# Responsive design

Desktop and mobile layouts are intentional designs, not merely scaled versions of each other.

When responsive Figma designs are available, use them as the source of truth.

Responsive behavior should be deliberate.

Do not rely on accidental wrapping to create mobile layouts.

Check:

* spacing
* typography
* navigation
* image cropping
* stacking order
* alignment
* touch targets
* overflow

Intermediate viewport widths should behave naturally between defined layouts.

---

# Motion

Use Motion for React for normal interface animation.

Examples:

* entrances
* hover interactions
* accordion transitions
* navigation transitions
* card animation
* layout transitions
* simple staggered reveals

Use GSAP for animation that genuinely benefits from timeline or scroll orchestration.

Examples:

* complex timelines
* ScrollTrigger sequences
* coordinated multi-element animation
* advanced SVG animation
* complex parallax
* scroll-driven storytelling

Do not use GSAP when a simple CSS or Motion animation is sufficient.

Do not use Motion and GSAP to animate the same property on the same element.

Keep animation logic isolated from content logic where practical.

Animations should support the design rather than distract from it.

Avoid excessive movement.

Always respect `prefers-reduced-motion`.

GSAP effects must be properly cleaned up when components unmount.

---

# Motion character

The general GerneGrün motion language should feel:

* friendly
* natural
* calm
* organic
* slightly playful
* high quality

It should NOT feel:

* aggressive
* overly technical
* flashy
* gimmicky
* excessively bouncy

Detailed animation conventions live in:

`docs/MOTION.md`

---

# Assets

Prefer provided project assets over placeholders.

Do not replace supplied custom artwork with generic icons or stock imagery.

Reuse existing assets instead of creating duplicate copies.

Keep asset paths predictable.

Optimize large assets appropriately for web delivery.

Use SVG for vector graphics when appropriate.

Use descriptive filenames.

Do not modify original artwork unless explicitly requested.

---

# Fonts

Follow the font configuration already defined by the project.

For genuinely self-hosted fonts with the required license, prefer `next/font/local`.

Do not introduce a different fallback typeface simply because it is easier to implement.

Typography must follow the Figma design and `docs/DESIGN_SYSTEM.md`.

---

# Accessibility

Implement semantic HTML.

Interactive elements must be keyboard accessible.

Use actual buttons for actions and links for navigation.

Maintain visible focus states.

Use meaningful alt text where images communicate information.

Decorative images should not create unnecessary screen-reader noise.

Maintain sufficient contrast.

Respect `prefers-reduced-motion`.

Avoid unnecessary ARIA when native HTML semantics already provide the correct behavior.

Aim for WCAG 2.2 AA.

---

# Performance

Keep client-side JavaScript reasonable.

Prefer Server Components where possible.

Avoid unnecessarily shipping large libraries to the client.

Lazy-load heavy functionality when it improves performance.

Optimize large images and video.

Avoid layout shifts.

Do not sacrifice maintainability for insignificant micro-optimizations.

---

# SEO

Use semantic document structure.

Each page should have one meaningful primary heading.

Use Next.js metadata APIs.

CMS-driven pages should expose meaningful titles and descriptions.

Important textual content should exist as actual HTML text rather than being embedded only inside images.

Structured data may be added where it provides a concrete SEO benefit.

---

# Verification

After meaningful implementation changes:

* run lint
* run TypeScript checks when available
* run a production build when relevant

For UI work additionally verify:

* desktop layout
* mobile layout
* responsive behavior
* overflow
* interaction states
* reduced motion behavior
* visual consistency with the supplied Figma design

Do not spend time fixing unrelated warnings or unrelated legacy issues unless explicitly requested.

Do not create extensive automated test infrastructure for simple visual changes.

---

# Documentation

Relevant durable decisions belong in `/docs`.

Use:

* `docs/DESIGN_SYSTEM.md`
* `docs/ARCHITECTURE.md`
* `docs/CONTENT_MODEL.md`
* `docs/MOTION.md`
* `docs/ROUTES.md`

Do not duplicate the same information across multiple documentation files.

Update documentation when an architectural or design-system decision materially changes.

Do not update documentation for trivial implementation changes.

---

# Task completion

When finishing a task:

1. Ensure the requested functionality is complete.
2. Check for obvious regressions in touched areas.
3. Run the relevant validation commands.
4. Briefly summarize what changed.
5. Mention important assumptions or unresolved issues.

Do not claim something was tested if it was not actually tested.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
