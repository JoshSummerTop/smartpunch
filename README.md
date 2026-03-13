# SmartPunch

AI-powered construction punch list manager. Capture deficiencies with your phone camera, let Claude analyze the image to identify the trade, severity, and recommended fix, then track every item through resolution and verification.

## What It Does

- **AI Photo Analysis** --- Snap a photo of a construction deficiency, and Claude identifies the trade (electrical, plumbing, HVAC, etc.), severity, and suggests a corrective action.
- **Punch List Management** --- Create projects, add items manually or via AI, filter by trade/severity/status, and bulk-update statuses.
- **Status Workflow** --- Items move through Open -> In Progress -> Resolved -> Verified with enforced transition rules and a full activity log.
- **AI Reports** --- Generate executive summary reports with severity breakdowns, critical item callouts, and timeline assessments.
- **PDF Export** --- Download formatted punch list reports as PDF.

## Tech Stack

| Layer | Technology |
|-------|------------|
| API | Laravel 11, PHP 8.4, PostgreSQL 16 |
| Frontend | Angular 19, Tailwind CSS v4, TypeScript |
| AI | Anthropic Claude API (Sonnet) |
| Deployment | Docker, Render |

## Project Structure

```
smartpunch/
  smartpunch-api/      Laravel API
  smartpunch-ui/       Angular SPA
  docker-compose.yml   Local development (PostgreSQL + API)
  render.yaml          Render deployment blueprint
```

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 22+
- An Anthropic API key (optional --- AI features degrade gracefully without it)

### Setup

```bash
# Clone and start the API + database
docker compose up -d
docker compose exec api php artisan migrate

# Copy environment and add your API key
cp smartpunch-api/.env.example smartpunch-api/.env
# Edit smartpunch-api/.env and set ANTHROPIC_API_KEY

# Start the Angular dev server
cd smartpunch-ui
npm install
npx ng serve
```

- **API**: http://localhost:8000
- **UI**: http://localhost:4200

### Running Tests

```bash
# API tests (157 tests)
docker compose exec api php artisan test

# UI tests (186 tests)
cd smartpunch-ui && npx ng test --no-watch --browsers=ChromeHeadless
```

## Deploy to Render

Everything runs as a **single Docker service** — Nginx serves the Angular SPA and reverse-proxies `/api` to Laravel, all in one container.

### One-Click Deploy

1. Push this repo to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com) and click **New > Blueprint**.
3. Connect your repo --- Render reads `render.yaml` and creates the service + database.
4. Set the one required environment variable when prompted:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (optional — AI features degrade gracefully without it) |

5. Deploy. Migrations run automatically on each deploy.

### Architecture

```
Browser  --->  Nginx (port 80)  --/api/-->  Laravel (port 8000)  --->  PostgreSQL
                 Static SPA        Reverse proxy    Same container       Render managed DB
```

Nginx serves the Angular build and proxies `/api/*` to Laravel running on localhost:8000 inside the same container. No CORS needed in production.

### Manual Deploy

```bash
docker build -t smartpunch .
docker run -p 80:80 \
  -e APP_KEY=base64:$(openssl rand -base64 32) \
  -e DB_CONNECTION=pgsql \
  -e DB_URL=postgresql://user:pass@host:5432/smartpunch \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  smartpunch
```

## Key Design Decisions

- **No authentication** --- This is an MVP/demo. All endpoints are open.
- **UUID primary keys** --- All models use UUIDs for portability and merge safety.
- **Enum-based state machine** --- `PunchItemStatus` enforces valid transitions at the model level.
- **Observer pattern** --- `PunchItemObserver` auto-logs all field changes to an activity log.
- **Graceful AI degradation** --- Without an Anthropic API key, image analysis returns an error and reports fall back to a static summary. The core punch list workflow is fully functional without AI.

## API Endpoints

```
GET    /api/health                                    Health check
GET    /api/projects                                  List projects
POST   /api/projects                                  Create project
GET    /api/projects/:id                              Get project
PUT    /api/projects/:id                              Update project
DELETE /api/projects/:id                              Delete project
GET    /api/projects/:id/punch-items                  List items (filterable)
POST   /api/projects/:id/punch-items                  Create item
GET    /api/projects/:id/punch-items/:itemId          Get item with activity log
PUT    /api/projects/:id/punch-items/:itemId          Update item
DELETE /api/projects/:id/punch-items/:itemId          Soft-delete item
PUT    /api/projects/:id/punch-items/:itemId/status   Update status
POST   /api/projects/:id/punch-items/bulk-status      Bulk status update
GET    /api/projects/:id/report                       Generate AI report
GET    /api/projects/:id/report/pdf                   Export PDF
POST   /api/ai/analyze                                AI image analysis
POST   /api/photos/:itemId                            Upload photo
GET    /api/photos/:itemId/:type                      Serve photo
```

## License

MIT
