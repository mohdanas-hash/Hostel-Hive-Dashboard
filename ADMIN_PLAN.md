# Hostel Hive – Admin Dashboard Plan

Scope is derived from `hostel-hive-backend` (FastAPI). There is exactly one admin (`central_admin`, bootstrapped from
`ADMIN_EMAIL`/`ADMIN_PASSWORD`); the dashboard only lets that role sign in.

## Modules → backend endpoints

| Page | Route | What the admin does | Endpoints |
|---|---|---|---|
| Dashboard | `/` | KPIs, bed occupancy, review queue, low-bed alerts, on/off-campus rent gap | aggregates `GET /colleges /hostels /messes /cafeterias /admissions /posts/today` |
| Admissions | `/admissions` | Filter by status, view the 4 private documents, approve / reject (reason required) | `GET /admissions`, `GET /admissions/{id}/documents/{type}` (blob), `POST /admissions/{id}/review` |
| Daily posts | `/posts` | Publish menu / update / notice (optionally linked to a listing, with image), delete | `GET/POST /posts`, `DELETE /posts/{id}`, `POST /images` |
| Reviews | `/reviews` | Read reviews per listing | `GET /reviews?target_type&target_id` |
| Colleges | `/colleges` | List, create | `GET/POST /colleges` |
| Hostels / Messes / Cafeterias | `/hostels` `/messes` `/cafeterias` | Search, filter, create, edit (full PUT), deactivate (soft delete), amenities, photo | `GET/POST/PUT/DELETE` on each, `GET /amenities`, `POST /images` |
| Amenities | `/amenities` | Manage catalog by category | `GET/POST/DELETE /amenities` |
| Price insights | `/insights` | On vs off campus price stats per college | `GET /compare/prices/{college_id}` |

## Backend additions (all admin-only, in `hostel-hive-backend`)

| Former gap | Now |
|---|---|
| No payments list | `GET /admin/payments` (filters `status`, `kind`, `user_id`, `q`; paged; returns `total` and `total_amount` of paid) -> **Payments** page |
| No users / student names | `GET /admin/users` (search, role, paged, with admission/payment/review counts) -> **Users** page; `AdmissionOut` now includes `student_name` / `student_email` |
| No review moderation | `GET /admin/reviews` (type, rating, paged, with user + listing names), `DELETE /admin/reviews/{id}` -> **Reviews** page |
| Colleges not editable | `PUT /colleges/{id}`, `DELETE /colleges/{id}` (409 while listings, posts or users reference it) |
| Posts not editable | `PUT /posts/{id}` |
| Deactivated listings invisible | `GET /admin/listings/{hostels|messes|cafeterias}?state=active|inactive|all`, `POST /admin/listings/{kind}/{id}/restore` -> **Deactivated** tab on listing pages |
| No totals | `GET /admin/stats` (counts, beds, admissions by status, revenue, monthly revenue); admin lists return `{items, total}` with server-side paging and search |
| No `messes` image folder | `POST /images` accepts `folder=messes` |

No database schema change, so no migration is needed.

## Still not available
- Refunds, invoices, and real payment-gateway confirmation (confirm is still the mock endpoint).
- Creating/editing/disabling users, resetting passwords.
- Old public pages (`Register`, `Feed`, `Compare`, `HomeOverview`, `ReviewSection`, `Navbar`, `App.css`, and the old `Payments`/`Admissions` code is replaced) – the unrouted leftovers can be deleted.
