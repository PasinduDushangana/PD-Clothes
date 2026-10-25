# PD Clothes

A responsive bag storefront with search, category filters, sorting, favorites, individual product pages, a saved shopping bag, and WhatsApp ordering. There is no online payment or checkout account. Customers choose bags on the site, then tap **Order on WhatsApp** to send the items, quantities, and estimated subtotal to **+94 71 989 1483**. The owner confirms availability, delivery, and payment in the chat.

## Run locally

No packages or build step are needed. From the repository directory, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Keep all HTML pages, CSS and JavaScript files, and `assets/` together. The latest colors and typography are in `studio.css`; the catalog and its prices stay in `products.js`. Each product automatically gets a detail URL such as `product.html?id=weekend-carryall`.

## Publish with GitHub Pages

Push these files to the repository’s `main` branch. The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml` that deploys the site. In GitHub, open **Settings → Pages**, choose **GitHub Actions** as the source, and save. GitHub will show the public site address there once the first deployment finishes. Later product edits committed to `main` will trigger a new deployment. You can use another static host if preferred.

## Add or update products on GitHub

The animated gallery at the top automatically selects five products. By default, append a new product to the end of `PD_PRODUCTS` to make it the newest. You can also set `addedAt: '2026-10-24'` (an ISO date) on products: dated items are sorted newest first, followed by undated items in reverse catalog order. To use dates consistently, add this field to all products. The gallery shows fewer cards when fewer than five products exist, pauses during interaction, and starts paused when the visitor prefers reduced motion.

1. Add the product photograph to `assets/` in the GitHub repository. Use a square WebP or JPG image; around 1000 × 1000 px is a good size. Do not reuse another product's image unless it is the same bag.
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

`id` must be unique and should stay the same after publishing, because product links and saved shopping bags use it. `price` is a number of Sri Lankan rupees without commas or a currency symbol. `image` is a path relative to the site root. `images` is optional; add extra photo paths there for thumbnail selection on the detail page, or omit the field when you have one photo. Upload those images to `assets/` too. `category` creates a filter automatically; reuse an existing category name to keep items together. `badge` can be an empty string (`''`) for no label. Set `featured: true` for home-page recommendations. The home page shows up to three featured bags, filling any remaining spaces from the catalog. The shop’s default order follows the catalog. Edit or remove an object to update or remove a product. The sample products and prices are placeholders: replace them with your real inventory and prices before selling.

To change the WhatsApp recipient, search for `94719891483` across the HTML and JavaScript files and replace every occurrence with the new number in international format, without `+`, spaces, or a leading zero.

## Validate changes

### Discounts, availability, and saved bags

Keep `price` as the amount the customer pays. To show a discount, add `originalPrice` with the real previous price, greater than `price`. For example, `price: 6000, originalPrice: 7500` shows **20% OFF**, a crossed-out Rs. 7,500, and a current price of Rs. 6,000. Percentages are calculated automatically; the catalog, latest gallery, detail pages, related bags, cart, and WhatsApp totals use the current price. The cart also shows the total saved. Remove `originalPrice` to stop showing a sale. An equal, lower, or invalid original price is ignored. Existing product prices have not been changed or discounted automatically.

Set `inStock: false` to mark a product sold out. It stays visible, but cannot be added to the bag; its detail page offers an availability inquiry on WhatsApp. Previously saved sold-out items are removed from the cart when a page loads. Remove the field or set it to `true` to allow ordering again. This is a manually managed catalog, not a live inventory system; confirm stock in chat.

Shoppers can filter by **On sale**, **My favorites**, and **Available only**, and sort by **Biggest discount**. Favorites are saved in that browser. These filters combine with category and search; “Show all bags” resets them when there are no matches.

Run the local server, load the shop page, search or filter for the new product, add it to the bag, and tap **Order on WhatsApp**. Check that the WhatsApp message names the right product, quantity, and price. The site stores the bag and favorites in the visitor’s browser. Checkout details are held in the form only, then included in the WhatsApp link when the customer continues. They are not stored in localStorage or sent to the presence service.

Images in `assets/` are illustrative generated artwork. Product details and availability must be confirmed by the shop owner before publication.

## Pages and fonts

- `index.html`: home, automatic latest-five gallery, and featured bags.
- `shop.html`: full collection with search, sorting, sale and stock filters.
- `favorites.html`: saved bags for the current browser, with search and filtering.
- `product.html?id=...`: product details and WhatsApp ordering.
- `about.html`: shop introduction and how shopping works.
- `contact.html`: FAQs and a form that opens a prepared WhatsApp message for the visitor to send. Form entries are not stored by this website.

Navigation and the cart work across all pages. `pages.js` handles featured bags and the contact form. Outfit headings and Manrope body text are self-hosted in `assets/fonts/`, with their font licenses included; visitors do not need to connect to a font service. `studio.css` is loaded last to apply the dark plum and champagne theme consistently. Large italic accents use the system Georgia serif alongside self-hosted Outfit and Manrope.

## Detailed WhatsApp orders and messages

`messaging.js` contains the shared message templates and order-details dialog. Both cart checkout and the product’s order button open a form for name, phone, and city, plus optional address and notes. Customers can expand **Preview your WhatsApp message** before continuing. Messages contain product IDs, style/color, product links, quantity, unit and line prices, discounts, savings, item count, estimated subtotal, and delivery details. Delivery fees and the final total remain unconfirmed until agreed in chat. No payment is collected on the site.

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
