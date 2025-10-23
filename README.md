# Hunt Hub Backend

## Database

### Setup

### ERD

```mermaid
erDiagram

    GUESTS {
        int id PK
        int estate_id FK
        varchar first_name
        varchar last_name
        varchar email
        string phone
    }

    USERS {
        int id PK
        int estate_id FK
        varchar first_name
        varcahr last_name
        varcahr email
        varcahr password
        enum role
    }

    ESTATES {
        int id PK
        varcahr name
    }

    TERRETORYS {
        int id PK
        varchar name
        int estate_id FK
    }

    EVENTS {
        int id PK
        date date
        time time
        int estate_id FK
    }

    DRIVES {
        int id PK
        int event_id FK
        date date
        time start_time
        time end_time
    }

    GROUPS {
        int id PK
        int drive_id FK
        int leader_id FK
    }

    STANDS {
        int id PK
        varchar number
        int terretory_id
        json location
    }

    INVITATIONS {
        int id PK
        int event_id FK
        enum status
        int guest_id FK
        date rsvp_date
    }

    LICENSES {
        int id PK
        int guest_id FK
        date expiry_date
        blob scan
    }

    TRAINING_CERTIFICATES {
        int id PK
        int guest_id FK
        date training_date
        blob scan
    }

    STANDSDRIVE {
        int id PK
        int drive_id FK
        int stand_id FK
    }

    STANDSGUESTS {
        int id PK
        int stand_id FK
        int guest_id FK
    }

    STANDSGROUPS {
        int id PK
        int stand_id FK
        int group_id FK
    }

    GUESTS ||--o{ INVITATIONS : "id < guest_id"
    GUESTS ||--o{ LICENSES : "id - guest_id"
    GUESTS ||--o{ TRAINING_CERTIFICATES : "id - guest_id"
    USERS ||--o{ GROUPS : "id - leader_id"
    ESTATES ||--o{ USERS : "id < estate_id"
    ESTATES ||--o{ GUESTS : "id < estate_id"
    ESTATES ||--o{ TERRETORYS : "id < estate_id"
    ESTATES ||--o{ EVENTS : "id < estate_id"
    TERRETORYS ||--o{ STANDS : "id < terretory_id"
    EVENTS ||--o{ INVITATIONS : "id < event_id"
    EVENTS ||--o{ DRIVES : "id < event_id"
    DRIVES ||--o{ GROUPS : "id < drive_id"
    STANDS ||--o{ STANDSDRIVE : "id > stand_id"
    STANDS ||--o{ STANDSGUESTS : "id > stand_id"
    STANDS ||--o{ STANDSGROUPS : "id > stand_id"
    DRIVES ||--o{ STANDSDRIVE : "id <> drive_id"
    GUESTS ||--o{ STANDSGUESTS : "id <> guest_id"
    GROUPS ||--o{ STANDSGROUPS : "id <> group_id"


---

# 🚀 Installation Guide

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Docker** (for running the database via docker-compose)
- **PostgreSQL** (if not using Docker)
- **Git** (for cloning the repository)

## 1. Clone the Repository

```bash
git clone https://github.com/carl-castell/hunt-hub_backend.git
cd hunt-hub_backend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory. Example:

```env
DATABASE_URL=postgres://user:password@localhost:5432/hunt_hub
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
```

Adjust the variables to match your local setup.

## 4. Set Up the Database

### Using Docker (Recommended)

```bash
docker compose up -d
```

This will start the PostgreSQL database defined in `docker-compose.yml`.

### Without Docker

Make sure you have a PostgreSQL instance running and update your `.env` accordingly.

## 5. Run Database Migrations & Seed Data

```bash
npm run db:push      # Runs migrations
npm run db:seed      # Seeds initial data
```

Or, to reset everything (drops, recreates, migrates, and seeds):

```bash
npm run db:reset
```

## 6. Start the Backend Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## 7. Drizzle Studio (Optional)

To open Drizzle Studio for database management:

```bash
npm run studio
```

---

## 🧑‍💻 Useful Scripts

- `npm run dev` - Start in development mode (hot reload)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server
- `npm run db:push` - Apply database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset and re-seed the database
- `npm run studio` - Open Drizzle Studio

---

## ❓ Troubleshooting

- Ensure your database connection string in `.env` is correct.
- If you use Docker, make sure it’s running and the containers are healthy.
- For any missing dependencies, run `npm install` again.

---

# Test
## ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    GUESTS {
        int id PK
        int estate_id FK
        varchar first_name
        varchar last_name
        varchar email
        string phone
    }
    USERS {
        int id PK
        int estate_id FK
        varchar first_name
        varchar last_name
        varchar email
        varchar password
        enum role
    }
    ESTATES {
        int id PK
        varchar name
    }
    TERRITORYS {
        int id PK
        varchar name
        int estate_id FK
    }
    EVENTS {
        int id PK
        date date
        time time
        int estate_id FK
    }
    DRIVES {
        int id PK
        int event_id FK
        date date
        time start_time
        time end_time
    }
    GROUPS {
        int id PK
        int drive_id FK
        int leader_id FK
    }
    STANDS {
        int id PK
        varchar number
        int territory_id
        json location
    }
    INVITATIONS {
        int id PK
        int event_id FK
        enum status
        int guest_id FK
        date rsvp_date
    }
    LICENSES {
        int id PK
        int guest_id FK
        date expiry_date
        blob scan
    }
    TRAINING_CERTIFICATES {
        int id PK
        int guest_id FK
        date training_date
        blob scan
    }
    STANDSDRIVE {
        int id PK
        int drive_id FK
        int stand_id FK
    }
    STANDSGUESTS {
        int id PK
        int stand_id FK
        int guest_id FK
    }
    STANDSGROUPS {
        int id PK
        int stand_id FK
        int group_id FK
    }

    GUESTS ||--o{ INVITATIONS : "id < guest_id"
    GUESTS ||--o{ LICENSES : "id - guest_id"
    GUESTS ||--o{ TRAINING_CERTIFICATES : "id - guest_id"
    USERS ||--o{ GROUPS : "id - leader_id"
    ESTATES ||--o{ USERS : "id < estate_id"
    ESTATES ||--o{ GUESTS : "id < estate_id"
    ESTATES ||--o{ TERRITORYS : "id < estate_id"
    ESTATES ||--o{ EVENTS : "id < estate_id"
    TERRITORYS ||--o{ STANDS : "id < territory_id"
    EVENTS ||--o{ INVITATIONS : "id < event_id"
    EVENTS ||--o{ DRIVES : "id < event_id"
    DRIVES ||--o{ GROUPS : "id < drive_id"
    STANDS ||--o{ STANDSDRIVE : "id > stand_id"
    STANDS ||--o{ STANDSGUESTS : "id > stand_id"
    STANDS ||--o{ STANDSGROUPS : "id > stand_id"
    DRIVES ||--o{ STANDSDRIVE : "id <> drive_id"
    GUESTS ||--o{ STANDSGUESTS : "id <> guest_id"
    GROUPS ||--o{ STANDSGROUPS : "id <> group_id"
