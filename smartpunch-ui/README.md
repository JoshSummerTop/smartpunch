# SmartPunch UI

Angular 19 single-page application for the SmartPunch construction punch list manager.

## Stack

- **Framework**: Angular 19 (standalone components, signals)
- **Styling**: Tailwind CSS v4
- **Design System**: "Dark Forge" — dark-mode-first with orange (#F97316) brand accent
- **Fonts**: JetBrains Mono (headings), DM Sans (body)
- **Testing**: Jasmine + Karma

## Setup

```bash
npm install
npx ng serve
```

The app runs at **http://localhost:4200** and expects the API at **http://localhost:8000**.

## Architecture

```
src/app/
  core/
    models/         Project, PunchItem, ActivityLog, AIAnalysisResponse interfaces
    services/       ProjectService, PunchItemService, AIService, PhotoService,
                    NotificationService (signal-based), ReportService
    interceptors/   apiInterceptor — URL prefixing, headers, error handling
  shared/
    components/     StatusBadge, SeverityBadge, PhotoUpload, DatePicker, ConfirmModal
    pipes/          DaysOpenPipe
  features/
    landing/        Marketing landing page (hero, how-it-works, features grid)
    dashboard/      Project list with search, create modal, health-color cards
    punch-list/     Item grid with filters, bulk actions, AI capture integration
    punch-item-detail/  Detail view with inline editing, status transitions, activity log
    ai-capture/     3-step modal: upload photo -> AI analysis -> review & save
    report/         AI-generated report with stats, markdown rendering, PDF export
  app.component.ts  App shell: header, mobile bottom nav, notifications, AI capture modal
```

### Key Patterns

- **Standalone components** — no NgModules, explicit imports
- **Signals** — preferred over traditional properties for reactive state
- **Mobile-first responsive** — bottom nav on mobile, header nav on desktop
- **Cards over tables** — grid layouts at all breakpoints (1 -> 2 -> 3 columns)
- **Global error handling** — interceptor catches all HTTP errors and shows notifications

## Environment

Development and production API URLs are configured in:

- `src/environments/environment.ts` — `apiUrl: 'http://localhost:8000/api'`
- `src/environments/environment.prod.ts` — `apiUrl: '/api'` (relative, nginx proxies to API)

## Tests

```bash
# Run all 186 tests
npx ng test --no-watch --browsers=ChromeHeadless

# With coverage report
npx ng test --no-watch --code-coverage
# Open coverage/smartpunch-ui/index.html
```

### Test Structure

```
testing/
  test-helpers.ts       Mock factories (createMockProject, createMockPunchItem, etc.)
core/
  services/*.spec.ts    HTTP tests with HttpTestingController (6 service specs)
  interceptors/*.spec.ts  URL prefixing, header injection, error handling per status code
shared/
  pipes/*.spec.ts       DaysOpenPipe (Today, 1 day, N days)
  components/*.spec.ts  StatusBadge, SeverityBadge, ConfirmModal, PhotoUpload, DatePicker
features/
  */*.spec.ts           All 6 feature components + app.component (service mocking, routing)
```

## Production Build

```bash
npx ng build --configuration=production
# Output: dist/smartpunch-ui/browser/
```

The production Docker image uses nginx to serve the built files and reverse-proxy `/api` requests to the API service:

```bash
docker build -f Dockerfile.prod -t smartpunch-ui .
docker run -p 80:80 -e API_URL=https://your-api-url.com smartpunch-ui
```
