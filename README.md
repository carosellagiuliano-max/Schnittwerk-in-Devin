# Schnittwerk Your Style - Admin Dashboard

## Project info

**URL**: https://lovable.dev/projects/af61227d-37d6-4d60-be1b-2001fe1ba413

Ein vollständiges Salon-Management-System mit Multi-Tenant-Backend und modernem Frontend.

## DEV Setup & Start

### Backend & Database Setup

```bash
# Dependencies installieren
npm install

# Datenbank migrieren
npx prisma migrate dev --name init

# Test-Daten erstellen
npx tsx prisma/seed.ts

# Backend API starten (Port 3000)
npm run dev:server

# Frontend starten (Port 5173) 
npm run dev

# Oder beide gleichzeitig
npm run dev:all
```

### DEV Authentication

Für API-Calls im Admin-Bereich werden diese Header verwendet:
- `x-user-role: admin`
- `x-user-email: admin@dev.local`

Diese werden automatisch vom Frontend hinzugefügt.

### Environment Variables

**`.env.local`** (Development):
```env
DEV_MODE=1
TZ=Europe/Zurich
DATABASE_URL="file:./dev.db"
```

### API Testing

**Lokaler Ping:** 
```bash
# Server starten
npm run dev:server

# Health Check
curl http://127.0.0.1:3000/api/ping
```

**In der Sandbox/CI:** Kein echter Server nötig – Tests nutzen supertest.

```bash
# Services laden (Admin)
curl -H "x-user-role: admin" -H "x-user-email: admin@dev.local" http://localhost:3000/api/admin/services

# Service erstellen
curl -X POST -H "Content-Type: application/json" -H "x-user-role: admin" -H "x-user-email: admin@dev.local" \
  -d '{"name":"Haarschnitt","durationMin":45,"priceCents":6500}' \
  http://localhost:3000/api/admin/services
```

## Technologie Stack

**Frontend:**
- Vite + React + TypeScript
- shadcn/ui + Tailwind CSS
- React Router + TanStack Query

**Backend:**
- Express.js + TypeScript
- Prisma + SQLite (DEV) / PostgreSQL (PROD)
- Multi-Tenant Architektur

**Testing:**
- Vitest + Supertest

## API Endpoints

### Public Routes
- `GET /api/services` - Aktive Services
- `GET /api/staff` - Aktives Personal
- `POST /api/bookings` - Termine buchen
- `DELETE /api/bookings/:id` - Termine stornieren

### Admin Routes
- `GET/POST/PUT/DELETE /api/admin/services` - Service Management
- `GET/POST/PUT/DELETE /api/admin/staff` - Personal Management
- `GET/POST/PUT/DELETE /api/admin/staff/:staffId/schedules` - Arbeitszeiten
- `GET/POST/PUT/DELETE /api/admin/staff/:staffId/timeoff` - Urlaub/Auszeiten
- `GET/POST/DELETE /api/admin/bookings` - Termine verwalten
- `GET /api/admin/customers` - Kunden suchen
- `POST/DELETE /api/admin/customers/ban` - Kunden sperren/entsperren

## PRODUCTION Setup (Notizen)

### Database
- **Provider:** PostgreSQL (Supabase empfohlen)
- **Migration:** `npx prisma migrate deploy`
- **Environment:** `DATABASE_URL="postgresql://..."`

### Authentication
- **DEV:** Header-basiert (`x-user-role`, `x-user-email`)
- **PROD:** JWT-basiert (Supabase Auth empfohlen)

### Email
- **DEV:** Console-Output (No-Op)
- **PROD:** SMTP (nodemailer + Environment Vars)

### Deployment
- **Frontend:** Netlify/Vercel
- **Backend:** Netlify Functions, Render, oder separater Service

## Testing

```bash
# Alle Tests
npm run test

# Tests im Watch-Mode
npm run test:watch
```

## Development Workflow

1. **Feature Branch erstellen:** `git checkout -b feature-name`
2. **Backend + Frontend implementieren**
3. **Tests schreiben und ausführen:** `npm run test`
4. **API manuell testen**
5. **Commit & Push:** `git push origin feature-name`
6. **Pull Request erstellen**

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/af61227d-37d6-4d60-be1b-2001fe1ba413) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/af61227d-37d6-4d60-be1b-2001fe1ba413) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
