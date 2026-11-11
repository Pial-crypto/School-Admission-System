# School Admission System

A full-stack school admission application built with **ASP.NET Core 8**,
**Entity Framework Core**, **PostgreSQL**, **React**, **TypeScript**,
and **Docker Compose**.

The system allows administrators to create and view classes, while
students can reserve available seats, confirm reservations, and manage
their applications. Seat allocation is protected against concurrent
requests using PostgreSQL transactions and row-level locking.

## Features

### Admin

-   Create classes with a configured seat capacity.
-   View all classes and their seat availability.
-   See held, confirmed, and available seat counts.

### Student

-   Browse available classes.
-   Place a temporary seat hold.
-   View the status and expiry time of a hold.
-   Confirm an active hold or cancel it.
-   View their own applications after refreshing or reopening the
    application.

### Admission and reservation rules

-   A hold temporarily reserves one seat.
-   Expired and cancelled holds release their seats.
-   Only active holds can be confirmed.
-   A student can have only one active hold across all classes.
-   A student can have only one confirmed admission across the system.
-   A student's own hold/application actions are identified using the
    `X-Student-Id` request header.
-   Seat allocation is protected by database transactions and row-level
    locking so concurrent backend instances sharing the same PostgreSQL
    database coordinate through the database.

## Technology stack

  Layer                Technology
  -------------------- -------------------------
  Backend              ASP.NET Core 8 Web API
  ORM / migrations     Entity Framework Core 8
  Database             PostgreSQL 16
  Database provider    Npgsql
  Frontend             React, TypeScript, Vite
  UI styling           Tailwind CSS
  Data fetching        TanStack Query
  Notifications        Sonner
  Containerization     Docker, Docker Compose
  Web server / proxy   Nginx

## Project structure

``` text
.
├── backend/
│   └── SchoolAdmission.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── Migrations/
│       ├── Models/
│       ├── Services/
│       └── Dockerfile
├── frontend/
│   ├── src/
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── ASSUMPTIONS.md
├── AI_USAGE.md
└── README.md
```

> Folder names inside the backend may vary slightly depending on the
> final project organization.

## Run the application with Docker (recommended)

Docker Compose starts PostgreSQL, the backend API, and the frontend.

### Requirements

-   Docker Desktop (with Docker Compose)
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/Pial-crypto/School-Admission-System
cd School-Admission-System
```

### 2. Configure environment variables (optional)

The project has defaults in `docker-compose.yml`. To override them,
create a `.env` file in the repository root:

``` env
POSTGRES_PASSWORD=postgres
HOLD_DURATION_SECONDS=300
```

Use a stronger password for any non-local deployment. Do not commit
secrets or the `.env` file.

### 3. Build and start all services

``` bash
docker compose up -d --build
```

The backend waits for PostgreSQL to become healthy. Pending Entity
Framework migrations are applied by the backend during startup.

### 4. Open the application

-   **Frontend:** http://localhost:8080
-   **Backend API (through the frontend proxy):**
    http://localhost:8080/classes

The frontend's Nginx server proxies API requests to the backend
container. Therefore, the browser can use the same origin
(`localhost:8080`) for the UI and API.

### 5. Check service status and logs

``` bash
docker compose ps
docker compose logs -f
```

To view one service's logs:

``` bash
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f frontend
```

### 6. Stop the application

``` bash
docker compose down
```

This stops and removes the containers but **preserves the PostgreSQL
data volume**.

To delete the database volume as well (destructive; all stored data will
be lost):

``` bash
docker compose down -v
```

## Run locally for development

Local development runs the frontend and backend on the host machine
while PostgreSQL runs in Docker.

### Requirements

-   .NET 8 SDK
-   Node.js (22 recommended)
-   npm
-   Docker Desktop

### 1. Start PostgreSQL only

From the repository root:

``` bash
docker compose up -d postgres
```

The PostgreSQL service publishes port `5432` to the host so the local
backend can connect using `localhost`.

### 2. Run the backend

Open a terminal:

``` powershell
cd backend/SchoolAdmission.Api

$env:ConnectionStrings__DefaultConnection = "Host=localhost;Port=5432;Database=school_admission;Username=postgres;Password=postgres"

dotnet run
```

The connection string must match the credentials configured for the
PostgreSQL service in `docker-compose.yml` or the root `.env` file.

The backend applies pending migrations during startup. The local API URL
depends on the launch profile / configured ASP.NET Core URL. The
frontend's default development API base URL is `http://localhost:5229`;
if your backend starts on a different port, set `VITE_API_BASE_URL` in
the frontend environment to the correct API origin.

### 3. Run the frontend

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the Vite development URL shown in the terminal (normally
http://localhost:5173).

### 4. Run both modes

Docker mode and local development mode can both use the same PostgreSQL
database, provided they use the same database name and credentials.
Avoid running duplicate test data creation against the same database
while comparing the two modes.

## API overview

The API uses JSON request and response bodies. Student-specific
endpoints require the `X-Student-Id` header.

  Method     Endpoint                     Description
  ---------- ---------------------------- ----------------------------------
  `POST`     `/classes`                   Create a class
  `GET`      `/classes`                   List classes with seat counts
  `GET`      `/classes/{classId}`         Get one class with seat counts
  `POST`     `/classes/{classId}/holds`   Create a temporary hold
  `GET`      `/holds/{holdId}`            Get hold details
  `POST`     `/holds/{holdId}/confirm`    Confirm a hold
  `DELETE`   `/holds/{holdId}`            Cancel a hold
  `GET`      `/me/holds`                  List the current student's holds

### Create a class

``` http
POST /classes
Content-Type: application/json
```

``` json
{
  "name": "Class 6 - Morning Shift",
  "totalSeats": 40
}
```

Class names follow the agreed format `Class {Number} - {Shift} Shift`.
Supported shifts are Morning, Day, and Evening. Class numbers and seat
capacity must be positive.

### Create a hold

``` http
POST /classes/{classId}/holds
X-Student-Id: student-001
```

A successful request returns a hold with status `HELD` and an expiry
time. If no seat is available, the API returns `409 Conflict`.

### Confirm a hold

``` http
POST /holds/{holdId}/confirm
X-Student-Id: student-001
```

Only the student who owns the hold can confirm it, and the hold must
still be active.

### Cancel a hold

``` http
DELETE /holds/{holdId}
X-Student-Id: student-001
```

A successful cancellation returns `204 No Content`.

### Hold statuses

-   `HELD`
-   `CONFIRMED`
-   `EXPIRED`
-   `CANCELLED`

## Configuration

  Variable                  Purpose                        Default
  ------------------------- ------------------------------ ------------
  `POSTGRES_PASSWORD`       PostgreSQL password            `postgres`
  `HOLD_DURATION_SECONDS`   Duration of a temporary hold   `300`

The hold duration is configurable. The default configured for Docker
Compose is **300 seconds (5 minutes)**.

The backend database connection is configured through
`ConnectionStrings__DefaultConnection`. In Docker Compose, the database
host is `postgres` (the Compose service name). When running the backend
directly on the host, the database host is `localhost`.

## Tests

### Backend automated tests

Run the backend test project using the .NET test runner:

``` bash
dotnet test <path-to-backend-test-project.csproj>
```

Replace the placeholder with the actual test project path in the
repository. If a solution file is provided, you can run
`dotnet test <path-to-solution.sln>` instead.

### Frontend automated tests

From the frontend directory:

``` bash
npm install
npm test
```

If the frontend test script is configured as a Vitest script, this runs
the frontend test suite.

### Concurrency verification

The backend uses PostgreSQL transactions and row-level locking for seat
allocation. A concurrency check was also performed with two
independently running backend instances connected to the same PostgreSQL
database. Ten simultaneous hold requests were sent for a class with
three available seats; the observed result was:

-   `201 Created`: 3 requests
-   `409 Conflict`: 7 requests

The class then reported three held seats and zero available seats. This
verifies the tested scenario; it is not a formal proof of every possible
concurrency interleaving.

## Assumptions and AI usage

-   See [`ASSUMPTIONS.md`](ASSUMPTIONS.md) for business rules and
    requirements that needed interpretation.
-   See [`AI_USAGE.md`](AI_USAGE.md) for disclosure of AI tools used,
    the areas where they assisted, identified mistakes, and the human
    review/fixes.

## Notes

-   This project is intended to run locally for evaluation and
    development.
-   Do not use the default database password for a public or production
    deployment.
-   The `X-Student-Id` header is a simple student identity mechanism for
    this assessment; it is not a substitute for production
    authentication and authorization.
