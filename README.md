# Hunt Hub — Backend

A hunting estate event management platform built with **Node.js**, **TypeScript**, **Express**, and **Drizzle ORM** with a **PostgreSQL** database (local via Docker or cloud via Neon).

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Docker locally, Neon in production) |
| Templating | EJS |
| Auth | Session-based (connect-pg-simple) |
| Email | Nodemailer + Mailgun (EU) |
| Security | Helmet, bcrypt, rate limiting |
| Validation | Zod |

---

## 📋 Prerequisites

- **Node.js** v18 or higher
- **npm**
- **Docker** (for local database)
- **Git**

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/carl-castell/hunt-hub_backend.git
cd hunt-hub_backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env` — see the [Environment Variables](#-environment-variables) section below.

### 4. Start the local database

```bash
docker compose up -d
```

### 5. Push the schema to the database

```bash
npm run db:push
```

### 6. Seed the database

```bash
npm run db:seed
```

> ⚠️ You will be prompted to confirm before any data is deleted.

### 7. Start the development server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`.

---

## 🌍 Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description |
|---|---|
| `DB_PROVIDER` | `local` for Docker, `neon` for Neon cloud |
| `LOCAL_DATABASE_URL` | PostgreSQL connection string for local Docker |
| `NEON_DATABASE_URL` | PostgreSQL connection string for Neon |
| `NODE_ENV` | `development` or `production` |
| `SESSION_SECRET` | Strong random string for session encryption |
| `DOMAIN` | Base URL of the app (used for activation links) |
| `MAILGUN_SMTP_USER` | Mailgun SMTP username |
| `MAILGUN_SMTP_PASSWORD` | Mailgun SMTP password |
| `MAIL_FROM` | From address for outgoing emails |
| `ADMIN_FIRST_NAME` | Admin user first name (used by seeder) |
| `ADMIN_LAST_NAME` | Admin user last name (used by seeder) |
| `ADMIN_EMAIL` | Admin user email (used by seeder) |
| `ADMIN_PASSWORD` | Admin user password (used by seeder) |
| `SEED_MOCK_DATA` | `true` to seed mock data, `false` to skip |

---

## 🧑‍💻 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run db:push` | Push schema to local database |
| `npm run db:push:neon` | Push schema to Neon database |
| `npm run db:gen` | Generate a new migration from schema changes |
| `npm run db:seed` | Seed the database (with confirmation prompt) |
| `npm run db:clear` | Clear all data from the database |
| `npm run db:reset` | Full reset: restart Docker, push schema, seed |
| `npm run studio` | Open Drizzle Studio (database GUI) |

---

## 🗄️ Database

### Dual database support

| Environment | Driver | Variable |
|---|---|---|
| Local (Docker) | `pg` | `LOCAL_DATABASE_URL` |
| Production (Neon) | `@neondatabase/serverless` | `NEON_DATABASE_URL` |

Switch between them by setting `DB_PROVIDER=local` or `DB_PROVIDER=neon` in `.env`.

### ERD

```mermaid
erDiagram
    ESTATES {
        int id PK
        varchar name
    }
    USERS {
        int id PK
        int estate_id FK
        varchar first_name
        varchar last_name
        varchar email
        varchar password
        enum role
        boolean active
    }
    GUESTS {
        int id PK
        int estate_id FK
        varchar first_name
        varchar last_name
        varchar email
        varchar phone
    }
    EVENTS {
        int id PK
        int estate_id FK
        varchar event_name
        date date
        time time
    }
    DRIVES {
        int id PK
        int event_id FK
        time start_time
        time end_time
    }
    GROUPS {
        int id PK
        int drive_id FK
        int leader_id FK
        varchar group_name
    }
    AREAS {
        int id PK
        int estate_id FK
        varchar area_name
    }
    STANDS {
        int id PK
        int area_id FK
        varchar number
        point location
    }
    INVITATIONS {
        int id PK
        int event_id FK
        int guest_id FK
        enum status
        date rsvp_date
    }
    LICENSES {
        int id PK
        int guest_id FK
        boolean checked
        date expiry_date
        timestamp upload_date
    }
    TRAINING_CERTIFICATES {
        int id PK
        int guest_id FK
        boolean checked
        date issue_date
        timestamp upload_date
    }
    STANDS_DRIVE {
        int id PK
        int stand_id FK
        int drive_id FK
    }
    STANDS_GROUP {
        int id PK
        int stand_id FK
        int group_id FK
    }
    STANDS_GUEST {
        int id PK
        int stand_id FK
        int guest_id FK
    }
    USER_AUTH_TOKENS {
        int id PK
        int user_id FK
        varchar token
        enum type
        timestamp expires_at
    }
    AUDIT_LOGS {
        int id PK
        int user_id FK
        varchar event
        varchar ip
        json metadata
        timestamp created_at
    }

    ESTATES ||--o{ USERS : "has"
    ESTATES ||--o{ GUESTS : "has"
    ESTATES ||--o{ EVENTS : "has"
    ESTATES ||--o{ AREAS : "has"
    AREAS ||--o{ STANDS : "has"
    EVENTS ||--o{ INVITATIONS : "has"
    EVENTS ||--o{ DRIVES : "has"
    DRIVES ||--o{ GROUPS : "has"
    DRIVES ||--o{ STANDS_DRIVE : "has"
    GROUPS ||--o{ STANDS_GROUP : "has"
    USERS ||--o{ GROUPS : "leads"
    USERS ||--o{ USER_AUTH_TOKENS : "has"
    USERS ||--o{ AUDIT_LOGS : "performs"
    GUESTS ||--o{ INVITATIONS : "receives"
    GUESTS ||--o{ LICENSES : "has"
    GUESTS ||--o{ TRAINING_CERTIFICATES : "has"
    GUESTS ||--o{ STANDS_GUEST : "assigned to"
    STANDS ||--o{ STANDS_DRIVE : "used in"
    STANDS ||--o{ STANDS_GROUP : "used in"
    STANDS ||--o{ STANDS_GUEST : "used in"
```

---

## 🔐 Roles

| Role | Access |
|---|---|
| `admin` | Full access — manages estates and users |
| `manager` | Estate-scoped access |
| `staff` | Limited estate-scoped access |

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Can't connect to database | Make sure Docker is running: `docker compose up -d` |
| Session not persisting | Check `NODE_ENV` — use `development` locally |
| Email not sending | Check `MAILGUN_SMTP_USER` and `MAILGUN_SMTP_PASSWORD` in `.env` |
| Port already in use | Run `lsof -i :3000` and kill the process |
| Schema out of sync | Run `npm run db:push` |
