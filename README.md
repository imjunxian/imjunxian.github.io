# Lee Jun Xian — Portfolio

A buildless portfolio made with HTML, CSS and JavaScript, inspired by the Motionsites “Designed in glass” prompt. The smoked-glass hero uses Three.js 0.169.0, code-drawn text textures, extruded shards, cursor lighting and a scroll-driven shatter/reassembly transition.

The portfolio includes selected projects, experience, education, research, certifications and contact links. Reduced-motion preferences or unavailable WebGL retain a styled HTML introduction and the same portfolio navigation.

## Local preview

Install [Live Server by Ritwick Dey](https://ritwickdey.github.io/vscode-live-server/) in VS Code Extension, then open http://127.0.0.1:5500/

or

Run `python3 -m http.server 4173` from the repository, then open http://localhost:4173. No installation or build is required.

- `index.html`: introduction, navigation, metadata and existing Google Analytics configuration.
- `assets/css/glass.css`: responsive layout and static fallback.
- `assets/js/hero-typing.js`: types the two-line Python identity with theme-matched VS Code Light+ / Dark+ syntax colors and automatic indentation. The completed snippet holds and replays when returning to the hero; reduced motion shows the final state.
- `assets/js/theme.js`: light/dark switching, saved preference and browser theme color. Light mode uses warm ivory with pale mineral-gray glass; dark mode retains smoked glass.
- `assets/js/glass.js`: optional WebGL enhancement. Three.js is loaded from jsDelivr; JetBrains Mono and Source Sans Pro are loaded from Google Fonts. If these services are unavailable, the HTML and system font fallback remain usable.
- `assets/js/portfolio.js`: portfolio content, continuous scrolling with section anchors, and image galleries with arrow, image-selector and keyboard controls. Edit your experience, projects and gallery captions here.

Deploy the repository as a static site using GitHub Pages as before. No deployment settings need changing.

[Live portfolio](https://imjunxian.github.io/) · [GitHub](https://github.com/imjunxian)

Scroll down from the sticky hero to break the glass and reveal About, Resume, Work and Contact. Scroll back up to reassemble it. The navigation links scroll to the same sections; galleries retain their state as you explore. The navigation uses a traced JaX vector mark, also available as `assets/img/jax-logo.svg`; it follows the light/dark text color. The favicon remains `assets/img/icon.ico`.

Hero links resolve pointer hits against the printed texture on each moving shard, so their clickable areas track the lift and rotation. The chamfered navigation highlight supports pointer hover and keyboard focus.
