# harborlight.tech website

Static site served by GitHub Pages. No build step.

- `index.html` — page content, Google Analytics, and schema.org data
- `css/style.css` — all styles (colors and fonts are set as variables at the top)
- `js/main.js` — mobile menu, header, contact form, and the animated hero
- `images/logo.png` — original logo (favicon and social preview)
- `images/logo-mark.png` — logo with a transparent background, used in the header and footer

The contact form posts to Formspree. The hero animation pauses when it's off screen and
shows a still image for visitors who have reduced motion turned on.
