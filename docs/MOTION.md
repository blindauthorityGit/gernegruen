<!-- Placeholder: Motion documentation will be added here. -->

# Motion

## Character

GerneGrün animations should feel:

- organic
- calm
- friendly
- slightly playful
- polished

Avoid flashy or exaggerated animation.

## Standard reveal

Typical content entrance:

- opacity: 0 → 1
- y: 16–24px → 0
- duration: roughly 0.5–0.7s
- smooth easing

Exact values may vary by composition.

## Stagger

Use subtle stagger for related card groups.

Avoid long cascading sequences.

## Hover

Hover animation should be subtle.

Typical techniques:

- small translate
- small image scale
- icon movement
- background transition

Avoid large scale effects.

## Motion vs GSAP

Motion:

- UI interactions
- card reveals
- navigation
- accordion
- hover
- layout transitions

GSAP:

- ScrollTrigger
- complex timelines
- coordinated compositions
- advanced parallax
- special hero animation

## Scroll behavior

Do not introduce scroll-jacking.

Scroll-based animation must not make content harder to access.

## Accessibility

Respect prefers-reduced-motion.

Decorative motion must be removable.
