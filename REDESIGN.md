# Editorial redesign

The existing static project and catalog remain in place. The active final art direction is `luxury.css`; `editorial.js` adds collections navigation, gallery keyboard/swipe interactions, contextual cursor labels, and restrained magnetic actions.

## Preserved systems

- Catalog: `products.js`; IDs, images, descriptions, prices and optional discounts unchanged.
- Cart: `script.js`, `pd-clothes-cart-v1`; existing quantities and saved contents are retained.
- Wishlist: `pd-clothes-favorites-v1`; existing saves remain valid.
- Commerce: `commerce.js`; availability, discount and subtotal calculations retained.
- Checkout: `messaging.js`; same fields, native validation, encoded WhatsApp destination `94719891483`, and detailed message template.
- References: `PD-` plus eight uppercase UUID characters. Editing customer details does not regenerate the reference. Reopening an unchanged pending request within the same page retains it. No customer details are stored. References are not globally sequential or centrally recorded.
- Routes, product zoom, latest-five carousel, theme preference, motion controls, contact form, banner slot, footer credit and presence integration retained.

## Changes

Black/off-white and silver palettes, serif editorial headings, quieter surfaces, image-led cards, collection dropdown, expanded mobile menu links, gallery keyboard/swipe support, detailed two-column checkout with thumbnails and reference, and back-to-shopping action. Mobile checkout stacks into one column.

## Verification and limits

Browser checks covered six routes in both themes at 390px and 1440px, product navigation, adding products, quantities and subtotal, reference stability while typing, checkout thumbnails and cart persistence. Additional navigation checks covered 820px and keyboard dismissal of collections.

The supplied root `banner.png` remains invalid image data; its slot collapses until replaced by a valid PNG. Product photography and catalog accuracy remain the owner's responsibility. No shipping prices, returns policies, reviews, company history or social accounts were invented. The presence backend remains separately configured. No Lighthouse score or globally unique order references are claimed. Real WhatsApp sending and physical-device tests require customer interaction; automated checks do not submit orders.

Push to `main` to trigger the existing GitHub Pages workflow. The project still requires no framework or build step.
