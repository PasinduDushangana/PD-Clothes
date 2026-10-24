# PD Clothes

A responsive bag storefront with search, category filters, sorting, favorites, individual product pages, a saved shopping bag, and WhatsApp ordering. There is no online payment or checkout account. Customers choose bags on the site, then tap **Order on WhatsApp** to send the items, quantities, and estimated subtotal to **+94 71 989 1483**. The owner confirms availability, delivery, and payment in the chat.

## Run locally

No packages or build step are needed. From the repository directory, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Keep `index.html`, `product.html`, the CSS and JavaScript files, and `assets/` together. The dark visual theme is in `theme.css`; the catalog and its prices stay in `products.js`. Each product automatically gets a detail URL such as `product.html?id=weekend-carryall`.

## Publish with GitHub Pages

Push these files to the repository’s `main` branch. The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml` that deploys the site. In GitHub, open **Settings → Pages**, choose **GitHub Actions** as the source, and save. GitHub will show the public site address there once the first deployment finishes. Later product edits committed to `main` will trigger a new deployment. You can use another static host if preferred.

## Add or update products on GitHub

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

`id` must be unique and should stay the same after publishing, because product links and saved shopping bags use it. `price` is a number of Sri Lankan rupees without commas or a currency symbol. `image` is a path relative to the site root. `images` is optional; add extra photo paths there for thumbnail selection on the detail page, or omit the field when you have one photo. Upload those images to `assets/` too. `category` creates a filter automatically; reuse an existing category name to keep items together. `badge` can be an empty string (`''`) for no label. `featured` is reserved for future merchandising; the default order follows the order in this file. Edit or remove an object to update or remove a product. The sample products and prices are placeholders: replace them with your real inventory and prices before selling.

To change the WhatsApp recipient, search for `94719891483` in `script.js`, `product.js`, `index.html`, and `product.html` and replace every occurrence with the new number in international format, without `+`, spaces, or a leading zero.

## Validate changes

Run the local server, load the home page, search or filter for the new product, add it to the bag, and tap **Order on WhatsApp**. Check that the WhatsApp message names the right product, quantity, and price. The site stores the bag and favorites in the visitor's browser; no customer data is sent to the site itself.

Images in `assets/` are illustrative generated artwork. Product details and availability must be confirmed by the shop owner before publication.
