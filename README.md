# My Purchase Fund

A local-first purchase planner for tracking products, allocating a personal fund, setting savings goals, and recording purchases. The app is a static React web app; it does not connect to a server, bank, or account system.

## Requirements

- Node.js 20.19+ or 22.12+ (required by the Vite 8 toolchain)
- npm

## Run locally

```sh
npm ci
npm run dev
```

The landing page opens first. Choose **Open App** to enter the planner. The planner can also be opened with `/#app`.

## Build, test, and preview

```sh
npm test
npm run build
npm run preview
```

The production site is generated in `dist/`. The build runs the TypeScript compiler before creating the Vite production bundle and service worker. Automated tests cover balance changes, purchase and restore accounting, goal contributions and withdrawals, and backup restore validation. They do not replace browser or device testing.

## Deploy

The repository includes `vercel.json` with a single-page-app rewrite to `index.html`. For Vercel, use the project root as the build root, `npm run build` as the build command, and `dist` as the output directory.

For another static host, publish the contents of `dist/` and configure unknown app paths to fall back to `index.html`. Keep generated production service-worker files available at the site root so PWA installation and caching can work. The app expects to be hosted at `/` as configured in the manifest.

There is no backend, server environment configuration, database, or authentication setup in this project.

## Data storage and backups

- Products, goals, purchases, transactions, and display preferences are stored in this browser's `localStorage` for this site origin.
- Data is not synchronized between browsers or devices. Clearing site data, changing browser profiles, or losing access to the browser can remove access to the local copy.
- Transaction history is retained in full; the app does not automatically delete older entries. This preserves the planner's audit trail, but browser storage has a finite, browser-dependent quota. Export a backup periodically, especially after substantial use. If a browser refuses a save, the app displays a warning and offers the backup tools. A failed save may not survive refresh or closing the app.
- Use **More → Backup & Export** to download a JSON backup. Store that file somewhere safe; it contains the planner data in readable form and is not encrypted.
- Use **Restore from Backup** to move data to another browser or restore it. Restore replaces the current planner data only after the file passes validation. Keep a separate backup before restoring.
- Product and transaction CSV exports are available in the same dialog.
- Product images entered as URLs load directly from their hosting websites. Those websites can receive your network address when an image is shown. Shopping links only contact third-party websites when you open them.

JSON exports use backup schema version 1. Older exports without a version marker are read as version 1; unsupported future versions are rejected. When the data shape changes, increment the schema version and add a migration before accepting the new format.

This app records a personal plan; it does not read balances from a bank or verify that the recorded fund represents money held in an account.

## Checks before release

1. Run `npm ci`, `npm test`, and `npm run build`.
2. Run `npm run preview` and exercise product creation/editing, fund additions and adjustments, allocation, goal contributions/withdrawals, purchase and restore, and transaction history.
3. Export a populated JSON backup, restore it into a clean browser profile, and compare products, goals, balances, and history. Confirm malformed or inconsistent files are rejected without replacing existing data.
4. Check the landing page and planner at phone, tablet, and desktop widths. Complete key flows using only the keyboard and confirm focus remains visible and dialogs can be opened, navigated, and closed.
5. Verify the deployed site fallback, PWA install, offline launch, and service-worker update behavior on the browsers and devices you support.

## Known limitations

- Data is local to one browser profile and one site origin; there is no account, synchronization, server backup, or multi-user support.
- JSON backups are not encrypted and should be protected like other personal financial planning files.
- History is retained without automatic pruning; users should export backups periodically because browser storage is finite.
- Automated unit tests cover key store and backup flows; browser-based end-to-end and real-device testing remain release checks.
- PWA behavior and accessibility should be checked on the actual target browsers and devices before making release claims.
