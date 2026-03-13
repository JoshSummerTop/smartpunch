# SmartPunch API

REST API for the SmartPunch construction punch list manager. Built with Laravel 11 and PHP 8.4.

## Stack

- **Framework**: Laravel 11
- **PHP**: 8.4
- **Database**: PostgreSQL 16
- **AI**: Anthropic Claude API (image analysis + report generation)
- **PDF**: Barryvdh DomPDF

## Setup

```bash
# From the monorepo root:
docker compose up -d
docker compose exec api php artisan migrate

# Copy environment config
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY for AI features (optional)
```

The API runs at **http://localhost:8000**.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_CONNECTION` | Yes | `pgsql` |
| `DB_URL` | Yes | PostgreSQL connection string (or set `DB_HOST`/`DB_PORT`/etc. individually) |
| `ANTHROPIC_API_KEY` | No | Enables AI image analysis and report generation. Without it, reports use a static fallback. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-4-20250514` |
| `FRONTEND_URL` | No | Frontend origin for CORS (e.g. `http://localhost:4200`) |

## Architecture

```
app/
  Enums/          ProjectStatus, PunchItemStatus (state machine), Severity, Trade
  Models/         Project, PunchItem (soft deletes), ActivityLog (immutable audit trail)
  Observers/      PunchItemObserver — auto-logs field changes to ActivityLog
  Services/       AnthropicService (AI), PunchItemNumberGenerator (sequential PLI-###)
  Http/
    Controllers/  ProjectController, PunchItemController, AIAnalysisController,
                  ReportController, PhotoController
    Requests/     Form request validation (7 request classes)
    Resources/    JSON API resources with computed fields
    Middleware/    CorsMiddleware (origin whitelist + wildcard fallback)
```

### Key Patterns

- **UUID primary keys** on all models
- **Enum-based state machine** — `PunchItemStatus::allowedTransitions()` enforces Open -> In Progress -> Resolved -> Verified
- **Observer pattern** — every tracked field change on a punch item is logged to `activity_logs`
- **Graceful AI degradation** — no API key = fallback static report, image analysis returns error

## API Endpoints

```
GET    /api/health                                    Health check
GET    /api/projects                                  List (search, status filter)
POST   /api/projects                                  Create
GET    /api/projects/:id                              Show with counts
PUT    /api/projects/:id                              Update
DELETE /api/projects/:id                              Delete

GET    /api/projects/:id/punch-items                  List (trade, severity, status, search filters)
POST   /api/projects/:id/punch-items                  Create (auto item number)
GET    /api/projects/:id/punch-items/:itemId          Show with activity log
PUT    /api/projects/:id/punch-items/:itemId          Update (validates status transitions)
DELETE /api/projects/:id/punch-items/:itemId          Soft delete
PUT    /api/projects/:id/punch-items/:itemId/status   Status transition
POST   /api/projects/:id/punch-items/bulk-status      Bulk status update

GET    /api/projects/:id/report                       Generate AI report
GET    /api/projects/:id/report/pdf                   Export PDF

POST   /api/ai/analyze                                AI image analysis
POST   /api/photos/:itemId                            Upload photo (base64)
GET    /api/photos/:itemId/:type                      Serve photo (deficiency|resolution)
```

## Tests

```bash
# Run all 157 tests
docker compose exec api php artisan test

# With coverage
docker compose exec api php -dpcov.enabled=1 vendor/bin/phpunit --coverage-html coverage-report
```

### Test Structure

```
tests/
  Unit/
    Enums/        PunchItemStatus (transitions), ProjectStatus, Severity, Trade
    Models/       Project, PunchItem, ActivityLog (UUID, casts, relationships, computed attrs)
    Observers/    PunchItemObserver (created/updated logging, tracked vs untracked fields)
    Resources/    ProjectResource, PunchItemResource, ActivityLogResource
    Services/     AnthropicService (mime detection, API mocking), PunchItemNumberGenerator
  Feature/
    Api/          Full CRUD tests for all controllers + photo upload/serve
    Middleware/   CORS headers, OPTIONS preflight
    Models/       Cascade delete behavior
    Validation/   All 7 form request classes
```
