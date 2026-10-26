# PD Clothes

A responsive bag storefront with search, category filters, sorting, favorites, individual product pages, a saved shopping bag, and WhatsApp ordering. There is no online payment or checkout account. Customers choose bags on the site, then tap **Order on WhatsApp** to send the items, quantities, and estimated subtotal to **+94 71 989 1483**. The owner confirms availability, delivery, and payment in the chat.

## Run locally

No packages or build step are needed. From the repository directory, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Keep all HTML pages, CSS and JavaScript files, and `assets/` together. The theme, layout, navigation, and font definitions are in `design.css`; the catalog and its prices stay in `products.js`. Each product automatically gets a detail URL such as `product.html?id=weekend-carryall`.

## Publish with GitHub Pages

Push these files to the repository’s `main` branch. The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml` that deploys the site. In GitHub, open **Settings → Pages**, choose **GitHub Actions** as the source, and save. GitHub will show the public site address there once the first deployment finishes. Later product edits committed to `main` will trigger a new deployment. You can use another static host if preferred.

## Add or update products on GitHub

The animated “Fresh perspectives” gallery on the home page automatically selects five products. By default, append a new product to the end of `PD_PRODUCTS` to make it the newest. You can also set `addedAt: '2026-10-24'` (an ISO date) on products: dated items are sorted newest first, followed by undated items in reverse catalog order. To use dates consistently, add this field to all products. The gallery shows fewer cards when fewer than five products exist, pauses during interaction, and starts paused when the visitor prefers reduced motion.

1. Add the product photograph to `assets/` in the GitHub repository. Use a square WebP or JPG image; 1000 × 1000 px is the required source size. Do not reuse another product's image unless it is the same bag.
2. Open [`products.js`](products.js) on GitHub, click the pencil icon, and add an object inside the `window.PD_PRODUCTS` array. Put a comma after the preceding product. For example:

   ```js
   {
     id: 'weekend-carryall',
     name: 'Weekend Carryall',
     category: 'Tote Bags',
     price: 9800,
     image: 'assets/weekend-carryall.webp',
     images: ['assets/weekend-carryall-side.webp'], // optional extra gallery photos
     color: 'Sand',
     badge: 'NEW ARRIVAL',
     description: 'A roomy bag for days away.',
     featured: true
   }
   ```

3. Commit the image and `products.js`. Your hosting service will publish the changes according to its deployment setup. Reload the site to see the new bag.

`id` must be unique and should stay the same after publishing, because product links and saved shopping bags use it. `price` is a number of Sri Lankan rupees without commas or a currency symbol. `image` is a path relative to the site root. `images` is optional; add extra photo paths there for thumbnail selection on the detail page, or omit the field when you have one photo. Upload those images to `assets/` too. `category` creates a filter automatically; reuse an existing category name to keep items together. `badge` can be an empty string (`''`) for no label. Set `featured: true` to prioritize a product in the homepage selection and the shop’s “Featured” sort. Products with the same featured status keep their catalog order. The homepage shows the first four products in featured order; the Shop page always offers the complete catalog. Edit or remove an object to update or remove a product. The sample products and prices are placeholders: replace them with your real inventory and prices before selling.

To change the WhatsApp recipient, search for `94719891483` across the HTML and JavaScript files and replace every occurrence with the new number in international format, without `+`, spaces, or a leading zero.

## Validate changes

### Discounts, availability, and saved bags

Keep `price` as the amount the customer pays. To show a discount, add `originalPrice` with the real previous price, greater than `price`. For example, `price: 6000, originalPrice: 7500` shows **20% OFF**, a crossed-out Rs. 7,500, and a current price of Rs. 6,000. Percentages are calculated automatically; the catalog, latest gallery, detail pages, related bags, cart, and WhatsApp totals use the current price. The cart also shows the total saved. Remove `originalPrice` to stop showing a sale. An equal, lower, or invalid original price is ignored. Existing product prices have not been changed or discounted automatically.

Set `inStock: false` to mark a product sold out. It stays visible, but cannot be added to the bag; its detail page offers an availability inquiry on WhatsApp. Previously saved sold-out items are removed from the cart when a page loads. Remove the field or set it to `true` to allow ordering again. This is a manually managed catalog, not a live inventory system; confirm stock in chat.

Shoppers can filter by **On sale**, **My favorites**, and **Available only**, and sort by **Biggest discount**. Favorites are saved in that browser. These filters combine with category and search; “Show all bags” resets them when there are no matches.

Run the local server, load the shop page, search or filter for the new product, choose **Buy**, and review the prepared WhatsApp request. Check that the WhatsApp message names the right product, quantity, and price. The site stores the bag and favorites in the visitor’s browser. Checkout details are held in the form only, then included in the WhatsApp link when the customer continues. They are not stored in localStorage or sent to the presence service.

Images in `assets/` are illustrative generated artwork. Product details and availability must be confirmed by the shop owner before publication.

The bundled sample catalog images are stored as square 1000 × 1000 WebP files (for example, `assets/solstice-1000.webp`). Keep the original source files if you need to edit them later. For a new product, upload a square 1000 × 1000 image, reference that file in `products.js`, and use `object-fit: cover` only for display cropping.

## Pages and fonts

- `index.html`: editorial home, four selected products, automatic latest-five gallery, and category shortcuts.
- `shop.html`: full collection with search, sorting, sale and stock filters.
- `favorites.html`: saved bags for the current browser, with search and filtering.
- `product.html?id=...`: product details and WhatsApp ordering.
- `about.html`: shop introduction and how shopping works.
- `contact.html`: FAQs and a form that opens a prepared WhatsApp message for the visitor to send. Form entries are not stored by this website.

Navigation and the cart work across all pages. `pages.js` handles navigation state, the mobile More dialog, category shortcuts, and the contact form. Headings and the wordmark use self-hosted Outfit. Manrope body text is self-hosted in `assets/fonts/`, with its font license included; visitors do not need to connect to a font service. `design.css` provides shared component structure; `reference.css` loads last on all six pages and supplies the current mint-and-white palette, deep green actions, rounded cards, and responsive app-inspired layout. Earlier theme files are retained but are no longer loaded. The homepage selection uses four columns on desktop and two on phones; the full shop uses four on wide desktops, three on smaller desktops, and two on phones.

At widths of 760px or less, the top header is hidden and the only navigation bar is a fixed bottom dock: **Home, Shop, Saved, Bag, More**. More opens the About and Contact links. The dock reserves space below the page and respects the device’s bottom safe area. The Bag button opens the shared cart, with the same item count as desktop. Search stays visible in the shop and saved-products pages. Desktop uses a centered wordmark, page links on the left, and search and a shopping-bag button on the right. The homepage links to the full shop for search, filters, and sorting. Navigation markup is repeated in all six HTML pages; update each copy together when adding pages.

The header search opens `shop.html?q=search-term`; category shortcuts open `shop.html?category=Tote%20Bags`. Categories and their product counts come directly from `products.js`. Search text is displayed safely as text, and an unknown category falls back to all bags. The shop retains filters and sorting. Both the home selection and shop retain favorites, stock handling, real discount calculations, and WhatsApp ordering. The design does not add fabricated ratings, sales, or shipping promises.

## Visual effects and Buy buttons

The current reference-inspired styling is in `reference.css`. The homepage places search and category shortcuts above a compact campaign and four popular picks. Copy and controls sit beside the photograph, never over it. Gentle product-image zoom, fades between arrivals, hover transitions, and short entrance animations provide restrained motion. The navigation and product-image controls retain a subtle blur. Decorative motion respects the visitor’s reduced-motion setting. Catalog Buy buttons open a one-item WhatsApp order form directly. The product-page Buy button uses the selected quantity. Stock checks still prevent buying sold-out products.

## Detailed WhatsApp orders and messages

`messaging.js` contains the shared message templates and order-details dialog. The catalog’s Buy buttons, the product’s Buy button, and cart checkout open a form for name, phone, and city, plus optional address and notes. Customers can expand **Preview your WhatsApp message** before continuing. Messages contain product IDs, style/color, product links, quantity, unit and line prices, discounts, savings, item count, estimated subtotal, and delivery details. Delivery fees and the final total remain unconfirmed until agreed in chat. No payment is collected on the site.

Each dialog creates a short **request reference**, such as `PD-1234ABCD`, for discussing that request. It is not a confirmed order number and does not create a server-side order record. WhatsApp still requires the customer to send the prepared message. The contact form also supports a phone number, request reference, and product name/link; sold-out bags send a detailed availability inquiry.

`loading.js` shows a branded loading screen while the page and fonts load, dismisses immediately when ready, and has a 2.8-second timeout. It supports reduced motion and dismisses on keyboard interaction. There is no simulated loading percentage or mandatory delay, and disabling JavaScript never leaves an overlay in place.

## Activate the real live visitor count (Cloudflare)

GitHub Pages cannot maintain a shared live count on its own. A deployable Cloudflare Worker with a SQLite Durable Object is included in `presence-worker/`. **The service is not deployed by the GitHub Pages workflow.** Until you deploy it and configure its URL, the storefront honestly shows “Live visitors · unavailable.”

1. Create or sign in to your Cloudflare account. On your computer, install Node.js 22.13+ (Node.js 24 recommended), then run from this repository:

   ```sh
   cd presence-worker
   npm ci
   npx wrangler login
   npm test
   npm run deploy
   ```

2. Copy the HTTPS Workers URL printed by deployment (for example, `https://pd-clothes-presence.YOUR-SUBDOMAIN.workers.dev`). Open `site-config.js` on GitHub and set:

   ```js
   window.PD_CONFIG = {
     presenceEndpoint: 'https://pd-clothes-presence.YOUR-SUBDOMAIN.workers.dev'
   };
   ```

3. Commit that change to `main`. Once the Pages deployment finishes, open the site in two separate browsers. The footer should report two active visitors within about 20 seconds. Multiple tabs in the same browser share one ID. Close one browser and wait up to 80 seconds for the visible count to fall.
4. If you use a custom domain, add its exact origin (scheme + hostname, without a path or trailing slash) to the comma-separated `ALLOWED_ORIGINS` in `presence-worker/wrangler.jsonc`, then redeploy the Worker. The default allows `https://pasindudushangana.github.io` plus localhost for development. Remove the localhost entries for production if desired.

For local integration testing, run `npm run dev` inside `presence-worker/`, start the Python storefront server separately, and temporarily set the endpoint to `http://localhost:8787`. Restore the production HTTPS URL before committing.

**How it works:** visible pages send an anonymous heartbeat every 20 seconds. One shared Durable Object counts browser IDs active in the last 60 seconds. An alarm removes expired records even when nobody visits. No names, phone numbers, order information, or page URLs enter this service. A random browser ID is kept locally and renewed on the next page load after 24 hours; clearing browser storage or using another browser creates a new ID. Cloudflare may process connection metadata under its own policies. This is an approximate active-browser count, not verified people or an analytics total; automated clients can affect it. If the service fails, the page shows “unavailable” and retries instead of displaying an old or invented count.

The endpoint is public, accepts only bounded valid JSON requests from configured browser origins, and stores only anonymous IDs and last-seen times. Origin checks are not authentication or bot protection. Use Cloudflare rate limits if traffic or abuse warrants them, and check your account’s Workers/Durable Objects quotas. No Cloudflare API tokens or account secrets belong in `site-config.js` or GitHub source.

## Customize the design

Edit the color variables near the top of `reference.css` to change the background, text, brass accent, and borders. Both stylesheets contain responsive rules at 1100px and 760px; current visual overrides belong in `reference.css`. Edit the homepage introduction and personal-service copy in `index.html`; gallery content and category shortcuts come from `products.js` automatically. Product images display in square frames without changing their source files. For a cohesive collection, use consistent product photographs with a plain background; promotional text baked into uploaded images will still appear.

The homepage now has a responsive banner area after the category shortcuts. It uses the root `banner.png` file. The current file is only 2 bytes of text, so the site shows a decorative placeholder. To publish your banner, upload a real PNG image to the repository root with the exact name `banner.png` and commit to `main`; the image appears automatically after deployment. A wide image around 2:1 works best. The image is displayed in full with no added text or button overlay.

Liquid-glass surfaces are defined in the final section of `design.css`: translucent product panels, a frosted masthead and mobile dock, carousel panels, and dialogs. Solid backgrounds provide a fallback when backdrop blur is unsupported. Hover movement is limited to pointer devices and respects reduced-motion preferences.

The mobile navigation follows the supplied raised-tab reference: a circular selected icon sits above a curved cutout. `pages.js` tracks the current page and open Bag/More dialogs, restoring the page selection when dialogs close. Shop filters, checkboxes, gallery controls, and quantity controls use the supplied soft-shadow UI treatment, adapted to the dark palette.

Desktop navigation (above 760px) uses a rounded, floating glass header. Its entrance, subtle border glow, link underlines, and hover effects live in `reference.css`; reduced-motion preferences disable animation. Mobile retains its bottom navigation.

## Light and dark appearance

Use the sun/moon button in the desktop header, or use the sun/moon button beside the PD Clothes wordmark at the top of each mobile page. The first visit follows the device color preference; choosing a mode saves it in `pd-clothes-appearance` in localStorage and applies across pages and tabs. Without a saved choice, changes to the device preference are followed automatically. `appearance.js` runs in the head before styles render to prevent a theme flash, and `appearance.css` provides the coordinated forest-dark palette and toggle styling. Light palette rules remain in `reference.css`. Both themes include forms, order dialogs, loading, cards, and navigation.

## Cart and footer credit

Each product card has **Buy** for a single WhatsApp request and **Add to cart** for a combined order. On a product page, select a quantity before choosing **Add to cart**. The bag icon opens the saved cart; its WhatsApp checkout includes all items, quantities, discounts, and the estimated subtotal. Sold-out products cannot be added. The footer on every page displays “Made By Pasindu Dushangana.”

The homepage top section uses the final polish rules in `reference.css`: a floating desktop header with a service line, larger search field, animated category chips, and a spacious campaign hero. The mobile layout keeps the compact app style.

The storefront now has a motion system in `reference.css`: first-screen entrance transitions, staggered category and product cards, animated hero rings, drifting banner outlines, image hover movement, button sheen, and a softly pulsing footer mark. The `prefers-reduced-motion` media query disables these effects and keeps controls usable.

The full site refresh applies the shared page treatment in `reference.css`: framed collection headers, soft mint panels, redesigned about and contact sections, raised product detail imagery, and coordinated related-product cards. `appearance.css` keeps the same structure readable in dark mode.

## Neon and ambient effects

`effects.css` and `effects.js` add a desktop mouse halo, drifting background light, glass-edge highlights, scroll reveals (including filtered products), and dialog entrances. The native cursor remains visible; the halo is decorative and cannot intercept clicks. Touch devices and reduced-motion preferences disable the cursor effect. Background animation pauses while the tab is hidden, and pointer updates only run when the mouse moves.

The footer's **Pause visual effects** button turns off decorative motion across the site and saves that choice in `pd-effects-paused`. Device reduced-motion settings take priority. Adjust the `--effect-accent`, `--effect-line`, and `--effect-glow` variables in `effects.css` to change light and dark effect colors.
