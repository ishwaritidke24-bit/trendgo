# TrendGo Foundation

Build only the global frontend foundation for my web app "TrendGo" — a modern personalized event and experience discovery platform.

Do NOT build the hero, event cards, recommendation feed, dashboards, or other sections yet. Focus only on the navbar and the global visual system.

Design direction:

- Premium dark-mode aesthetic

- Background: near-black / deep charcoal (#0B0B0F range)

- Primary accent: vivid electric purple / violet (#B83DFF to #C84CFF range)

- White primary text with softer gray secondary text

- Very subtle purple gradients/glows

- Clean, modern, slightly futuristic but NOT overly cyberpunk

- Rounded corners, polished spacing, subtle borders

- Strong visual hierarchy

- Responsive on desktop, tablet, and mobile

Navbar:

- Left: TrendGo logo/wordmark

- Center navigation:

  Discover

  Explore

  Trending

  Friends

- Right:

  location indicator

  notification icon

  profile/avatar

  prominent "Get Started" or "Sign In" CTA depending on authentication state

- Navbar should feel lightweight and premium rather than like a traditional corporate website.

- Use a dark translucent/glass-like navbar with a subtle border.

- On scroll, the navbar should remain sticky and slightly increase its background opacity.

- Mobile should collapse into a clean hamburger menu.

Branding:

- Make "TrendGo" visually distinctive.

- Use the purple accent strategically rather than coloring everything purple.

- Logo can have a subtle abstract "discovery / location / spark" symbol beside the wordmark.

Create reusable components for:

- Navbar

- Button variants

- Icon button

- Avatar

- Badge/chip

- Container/layout

- Section heading

Set up the global typography, spacing, border radius, shadows, hover states, transitions, and color tokens so the rest of the application can consistently use the same design system.

Use React + Tailwind and keep the implementation clean, reusable, and production-quality.

IMPORTANT:

Do not add unnecessary sections or placeholder content.

Do not redesign this into a generic event-booking website.

TrendGo should feel like a social discovery product, not an Eventbrite/BookMyShow clone.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/233892bb-3b09-407f-95d7-3df29ccd1436).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
