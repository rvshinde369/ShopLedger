# Repository Guidelines

## Project Structure & Module Organization

This is a small CommonJS Node/Express application. The HTTP entry point is `server.js`; API routers live in `routes/`; business logic is in `lib/`; and the browser interface is in `public/` (`index.html`, `css/style.css`, and `js/app.js`). Configuration is in `config.js`. The JSON data store is `data/db.json`. Printable invoices are rendered by `lib/invoice.js` and served by the server. There is no dedicated test directory or build output.

## Build, Test, and Development Commands

- `npm start` — starts the local server with `node server.js` (default port 3000; set `PORT` to override).
- `npm test` — currently a placeholder that exits with “Error: no test specified”; it does not run a test suite.
- No build, lint, or formatting command is configured. For manual development, run the server and exercise the POS, order, Khata, invoice, and report flows in a browser.

## Coding Style & Naming Conventions

Follow the existing JavaScript style: CommonJS `require/module.exports`, `var`, semicolons, and two-space indentation. Use lower camel case for functions and variables, descriptive filenames such as `inventory.js`, and Express route paths consistent with the existing plural resources (for example, `/orders`). Keep route handlers focused on request/response work and place reusable business rules in `lib/`. Preserve the established data field names (product and order-line IDs use `id`; quantities use `qty`).

## Testing Guidelines

There is no configured test framework, test naming pattern, or coverage target. When adding tests, introduce a repeatable framework and document its command; cover business logic such as stock checks, order cancellation, pricing, and Khata updates. Until then, manually verify affected flows and describe the checks performed.

## Commit & Pull Request Guidelines

Recent history uses short, lowercase, descriptive summaries (for example, “customer khata credit ledger and order cancellation”), without a strict conventional-commit prefix. Use a similarly specific subject. PRs should explain behavior changes, list manual or automated checks, link related issues when available, and include screenshots for visible UI changes.

## Security & Data Handling

Treat `data/db.json` as persistent business data; do not replace or reset it casually. Do not commit real customer data or secrets. The current admin key is in `config.js`; deployments should keep credentials out of source control and restrict access to export endpoints.

