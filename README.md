# imjunxian.github.io

A buildless portfolio made with HTML, CSS and JavaScript. The design pairs warm paper and dark ink with a green orbital illustration, large editorial typography and a continuous parallax scroll experience.

## Local preview

Run `python3 -m http.server 4173` from the repository, then open http://localhost:4173. No installation or build is required. VS Code Live Server also works.

## Design and behavior

- A sticky hero gives the background wordmark, text, orbital graphic and floating labels different scroll speeds. A Three.js WebGL sphere carries a curved grid and JaX logo, surrounded by actual 3D ring meshes and spherical satellites. The rings rotate in different depth planes as you scroll. Pointer movement tilts the assembly and moves the lighting and labels; hovering adds a glow. Drag the orb to rotate it with a short inertial coast, or use its arrow-key controls. Satellites circle the rings. AI, Software and Data buttons change the palette, satellite speed and toolbox labels; Reset restores the view. Satellite animation pauses offscreen and when the tab is hidden. Click or tap the orb (or press Enter/Space when focused) to send out a soft pulse and toggle its energized color. Reduced-motion preferences keep the color toggle and disable the motion.
- About and Contact use oversized background lettering with independent parallax depth. Resume has separate Experience and Education rows with compact cards. Each row pins on desktop while vertical scrolling moves through its horizontal strip, and each has its own navigation controls. Work pins its heading while collapsible project cards scroll vertically alongside it. On phones a compact chapter heading stays above the content; short viewports and reduced-motion preferences use ordinary scrolling. Navigation stays available as you scroll, and the top progress line tracks the whole document.
- Work uses rounded, independently collapsible project cards. All projects start collapsed with equal-height summaries; selecting a title expands its description and gallery. Native disclosures support mouse, touch, Enter and Space. Resume uses a grouped arrow navigator and a slim progress indicator; project galleries retain the circular image controls. Each project description and technology stack appears above its image gallery. Cards use a compact desktop width; web-app screenshots fill their preview area with a top-aligned crop, and clicking an image opens the complete original. Resume arrows and keyboard navigation complement its scroll-driven horizontal strip; image arrows control project galleries independently. Confidential company projects use generic illustrations.
- Mobile uses one column with a smaller orbit, compact navigation and separate swipeable Experience and Education rows and vertically stacked project cards. Native scrolling works with touch, wheel and keyboard.
- Reduced-motion preferences disable parallax and rotation and remove the extended hero scroll. The preference updates immediately when changed.
- Light/dark switching preserves the saved preference. The optional 3D orbit uses locally bundled Three.js 0.169.0. If WebGL is unavailable or its context is lost, the CSS orbit remains interactive. Reduced motion renders a still 3D scene with working mode controls.

## Files

- `index.html`: hero, orbital illustration, navigation, metadata and existing Google Analytics configuration.
- `assets/css/glass.css`: active responsive design, themes, galleries and reduced-motion styles.
- `assets/js/portfolio.js`: portfolio content, scroll-driven transforms, section navigation and keyboard-accessible image galleries. Edit experience, projects and gallery captions here.
- `assets/js/horizontal-resume.js`: desktop horizontal resume progression, experience/education navigation, responsive swipe layout and keyboard focus support.
- `assets/js/orbit.js`: drag inertia, pointer tilt, scroll depth, visual modes and accessible orb controls.
- `assets/js/orbit-3d.js`: the WebGL sphere, studio reflections, true ring/satellite geometry and 3D pulse. Rendering pauses offscreen or when the tab is hidden.
- `assets/js/vendor/three.module.min.js`: pinned Three.js 0.169.0, with its MIT license in `three.LICENSE`.
- `assets/js/theme.js`: saved light/dark preference and browser theme color.
- `assets/js/hero-typing.js`: types the two-line Python identity, with syntax colors for both themes and a completed headline for reduced-motion preferences.
- `assets/img/jax-logo.svg`: JaX vector mark. The favicon remains `assets/img/icon.ico`.

The earlier glass renderer remains in the repository as an inactive design experiment; the page no longer loads it. JetBrains Mono and Source Sans Pro load from Google Fonts, with system font fallbacks.

Deploy the repository as a static site using GitHub Pages as before. No deployment settings need changing.

[Live portfolio](https://imjunxian.github.io/) · [GitHub](https://github.com/imjunxian)
