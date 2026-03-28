# PPAI Member Directory Search

A full-stack Member Directory Search application built for the PPAI take-home assessment. Search, filter, and sort members with a clean, responsive interface styled to match the PPAI brand.

## How to Run

Choose **one** of the two options below depending on your setup.

### Option A: PHP Installed Locally

If you have PHP 8.0+ installed on your machine:

```bash
cd ppai-member-directory
php -S localhost:8000 server.php
```

Then open [http://localhost:8000](http://localhost:8000) in your browser. That's it — one command.

> `server.php` is a unified entry point that serves both the API (`/api/*` routes) and the frontend (static files from `public/`) on a single port. No need to run two servers.

To stop the server, press `Ctrl+C` in the terminal.

### Option B: No PHP? Use Docker

If you don't have PHP installed, you can run it via Docker with zero system changes:

```bash
cd ppai-member-directory
docker run -d --name ppai-directory -p 8000:8000 -v "$(pwd):/app" -w /app php:8.3-cli php -S 0.0.0.0:8000 server.php
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

**What this command does:**
- `docker run -d` — runs a container in the background
- `--name ppai-directory` — gives the container a name for easy management
- `-p 8000:8000` — maps port 8000 on your machine to port 8000 in the container
- `-v "$(pwd):/app"` — mounts the project folder into the container (Windows: use full path like `C:/path/to/ppai-member-directory:/app`)
- `-w /app` — sets the working directory inside the container
- `php:8.3-cli` — uses the official PHP 8.3 Docker image
- `php -S 0.0.0.0:8000 server.php` — starts PHP's built-in server

**To stop and clean up (removes everything, no trace left):**

```bash
docker stop ppai-directory && docker rm ppai-directory
docker rmi php:8.3-cli
```

### No Build Step Required

Both options require **zero** package installs — no `npm install`, no `composer install`. Just start the server and open the browser.

## Features

- **Search** — Real-time search by name or company (debounced, case-insensitive)
- **Filter** — Filter members by membership year
- **Sort** — Sort by name, company, or year (ascending/descending)
- **Detail View** — Click any member to see their full profile in a slide-in panel
- **Loading States** — Skeleton shimmer animation during API calls
- **Error Handling** — User-friendly error messages with retry button
- **Responsive** — Works on desktop, tablet, and mobile

## Technology Choices

- **PHP (no framework):** The job description requires PHP experience. Using plain PHP demonstrates fundamental language proficiency without relying on framework abstractions. The built-in development server (`php -S`) makes setup trivial — no Apache or Nginx configuration needed.

- **Vanilla HTML/CSS/JavaScript:** For a single-page search interface with three API endpoints, a frontend framework (React, Vue, etc.) would add unnecessary complexity, build tooling, and dependencies. Vanilla JS keeps the codebase simple, readable, and easy to review.

- **Zero dependencies:** No npm packages, no Composer packages, no CSS frameworks. Everything is hand-written. The only external resource is Google Fonts (loaded via CDN).

## Assumptions

- Member data is stored in-memory as a PHP array (per assessment instructions — no database required)
- No authentication or authorization is implemented
- CORS is enabled for local development (API and frontend may run on different ports)
- 12 sample members use realistic names and companies relevant to the promotional products industry
- The "2020 & earlier" filter option matches members with `memberSince` year of 2020 or earlier

## Project Structure

```
ppai-member-directory/
├── server.php          # Unified entry point — serves API + frontend on one port
├── api/
│   ├── index.php       # API router — CORS, URL parsing, JSON responses
│   ├── members.php     # Member data + search/filter/sort logic
│   └── .htaccess       # Apache URL rewriting (optional, for Apache)
├── public/
│   ├── index.html      # Single-page frontend
│   ├── css/
│   │   └── style.css   # PPAI brand styling, responsive design
│   └── js/
│       └── app.js      # API integration, DOM rendering, event handlers
└── README.md           # This file
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/members` | List all members. Optional: `?sort=name\|company\|year&order=asc\|desc&year=YYYY` |
| `GET /api/members/search?query=X` | Search by name or company (case-insensitive partial match) |
| `GET /api/members/{id}` | Get a single member by ID |

## Libraries Used

None. Zero external dependencies.
