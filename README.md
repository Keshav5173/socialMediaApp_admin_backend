# Admin Service — Creator Contest Platform

Part of a 2-microservice submission for the EMILO take-home assignment. This service pulls contest data from the User Service over HTTP, persists winners, and manages winner-facing KYC communication and the admin dashboard view.

## Features Implemented
- Admin account system, fully separate from end-user auth (own JWT, own Postgres table)
- Live contest sync — pulls real winner data from the deployed User Service over HTTP and persists it, no manual data entry
- Automated KYC-request emails to every stored winner via Nodemailer, with per-recipient success/failure reporting in the response (so a partial send never fails silently)
- Admin dashboard endpoint listing all winners, ordered by category and rank, ready for a table UI

## Tech Stack
- **Runtime:** Node.js + Express 
- **Database:** PostgreSQL, accessed via raw SQL through `pg` (`node-postgres`).
- **Auth:** JWT + HTTP-only cookie, bcrypt password hashing (admin accounts, separate from end-user accounts)
- **Email:** Nodemailer via Gmail SMTP
- **Service-to-service calls:** Axios, calling the User Service's REST API

## Architecture Role
Independent Postgres database — no direct access to the User Service's MongoDB. All contest data (posts, likes, comments, eligibility) is pulled via HTTP from the User Service's `/api/contest/*` endpoints.

## Data Model (raw SQL tables — no migration files currently checked in)

### `admins`
| Column | Notes |
|---|---|
| `id` | primary key |
| `name` | |
| `email` | unique |
| `password` | bcrypt-hashed |

### `winner`
| Column | Notes |
|---|---|
| `winnername` | plain text, copied from the User Service response at sync time |
| `winneremail` | plain text, same |
| `winnercategory` | plain text label, e.g. `"Top Active Contributer"` |
| `kycstatus` | text, currently only ever set to `"PENDING"` on insert — no code path updates it |
| `rank_in_category` | integer |

> There is no foreign key back to the User Service's `userId` — winners are stored by name/email only. There's also no separate table or enum for the assignment's 6 prize tiers; `winnercategory` is a free-text label populated per contest sync call.

## API Endpoints

All routes are mounted under `/adminapi`.

### Admin Auth — `/adminapi/user`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | `{ name, email, password }` |
| POST | `/login` | — | `{ email, password }` → sets `token` cookie |
| GET | `/viewprofile` | ✅ | returns the logged-in admin |
| POST | `/logout` | ✅ | clears the auth cookie |

### Contest Sync & KYC Email — `/adminapi/contest`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/getContent` | — | calls the User Service's `most-active-contributer` endpoint and inserts each returned user into `winner` with `kycstatus = "PENDING"` |
| POST | `/sendEmail` | — | sends a "please complete KYC" email to every row currently in `winner` |

### Dashboard — `/adminapi/dashboard`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/getWinnersList` | ✅ | all winners, ordered by category then rank |



## Running Locally
```bash
npm install
npm start        
# Requires the `admins` and `winner` tables to already exist in Postgres —
# no migration script is included in this repo yet, so they must be created manually.
```

