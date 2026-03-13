# AGENTS.md

## Setup commands
- Install deps: `npm install`
- Start dev server: `npm run start`
- Build production assets: `npm run build`

## Code style
- JS: Use functional patterns where possible
- JS: Use OOP/modules for complex logic
- SASS: Prefer CSS custom properties for theming and spacing
- JS: Favor small, composable modules; avoid heavy dependencies
- HTML: Keep markup semantic and minimal
- avoid deprecated functions and constructions

## Layout
- Use UNDP Design System, main repo with Storybook files: https://github.com/undp/design-system
- Link individual Design System assets from CDN using `src/data/ds.yml` file
- Prefer Design System components and tokens before custom UI

## Code location
- Content strings, yml format, file name = language code: `src/data` (except ds.yml)
- Handlebars style helpers (optional): `src/helpers`
- Global styles: `src/assets/scss`
- Page-level scripts: `src/assets/js`

## Layout requirements
- Responsive design, mobile first
- Web accessibility must be compliant with WCAG 2.2, at least AA
- Support reduced motion with `prefers-reduced-motion`
- Ensure color contrast meets AA for text and UI elements

## Performance and modern static site guidance
- Optimize for fast first load: minimal critical CSS and defer non-critical JS
- Avoid layout shifts: set explicit dimensions for media and use consistent spacing
- Use `loading="lazy"` for below-the-fold images; provide `alt` text for all images
- Keep fonts lean: prefer system fallbacks and limit custom font weights
- Use image formats suitable for the web (SVG for icons, compressed raster for photos)
- Avoid large inline scripts; prefer small modules and event delegation

## Content and localization
- All copy lives in `src/data/<lang>.yml`; do not hardcode strings in templates
- Keep translations in sync when adding or changing content

## QA checklist
- Keyboard navigation for all interactive elements
- Visible focus states that meet contrast requirements
- Validate headings hierarchy and landmark structure
- Test at common breakpoints (mobile, tablet, desktop)