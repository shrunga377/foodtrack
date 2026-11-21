# FoodTrack

FoodTrack is a web application prototype for hostel and canteen teams to track food inventory, expiry dates, food waste and donation opportunities.

## Current frontend

This repository currently contains the existing frontend prototype reorganized into separate files. It uses:

- HTML, CSS and JavaScript
- Tailwind CSS CDN for utility styling
- Chart.js for waste reports
- Browser `localStorage` for temporary prototype data

**Important:** This is currently a frontend prototype. Login credentials and sample data are hardcoded, and data is stored only in the browser. Do not use real or sensitive information yet. Supabase authentication and database integration will be added in a later development step.

## Run locally

You can open `index.html` directly, but using a local server is recommended.

With Python installed, open a terminal in this folder and run:

```bash
python -m http.server 5500
```

Then open <http://localhost:5500> in your browser.

## Demo credentials (prototype only)

- Warden: `admin@mess.edu` / `hostel123`
- Staff: `staff@mess.edu` / `staff123`

These are temporary frontend demo credentials, not secure authentication.

## Project structure

```text
FoodTrack/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── core.js
│   ├── seed-data.js
│   ├── auth.js
│   ├── navigation.js
│   ├── dashboard.js
│   ├── inventory.js
│   ├── waste-log.js
│   ├── reports.js
│   ├── donation.js
│   ├── ui.js
│   └── boot.js
├── .gitignore
└── README.md
```

## Next development phase

Replace browser-only storage and demo authentication with Supabase PostgreSQL, Supabase Auth and Row Level Security policies.
