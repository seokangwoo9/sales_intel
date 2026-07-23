Read `AGENTS.md`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **analytics dashboard frontend**: visual overview of CRM metrics (contacts, companies,
activity, emails, AI usage) with charts and KPIs. Managers/Admins see org-wide data; reps see
their own.

## Scope of this unit

- Dashboard page with key metrics and charts.
- Time-range selector (7 days, 30 days, all time).
- Charts: line (trends), bar (breakdowns), pie (distributions).
- Do not build advanced BI or custom reports (defer to post-MVP).

## Prerequisite

Specs 03, 10, 32 done. Analytics-service is active. The user is authenticated and has an active org.

## Implementation

### Dashboard page

Create `app/(workspace)/dashboard/page.tsx`:

- Fetch overview metrics (`GET /api/analytics/overview?range=30d`) with React Query.
- Display as a grid of KPI cards and charts.

### KPI cards

At the top, show high-level metrics in cards (shadcn `Card`):

- **Contacts**: total count, +X new this period.
- **Companies**: total count, +X new.
- **Activity**: total posts + comments.
- **Emails**: sent vs. received counts, avg response time.
- **AI Usage**: messages sent, tokens used.

Each card: icon (lucide-react), metric value (large text), change indicator (e.g. "+12 this month"
in green if positive).

### Charts

Use **Recharts** (already planned in the stack):

- **Contacts over time** (line chart): x-axis = date, y-axis = cumulative count or daily new.
  Fetch `GET /api/analytics/contacts?range=30d`; backend returns time series.
- **Activity by type** (bar chart): posts vs. comments count.
- **Top contact owners** (bar chart or pie chart): contacts grouped by owner. Show top 5.
- **Email stats** (line chart): sent/received over time.

Keep charts simple and readable. Use the neutral palette from `ui-context.md` (gray/blue tones).

### Time-range selector

At the top of the page:

- Shadcn `Select` or tabs: "Last 7 Days" | "Last 30 Days" | "All Time".
- On change, refetch all metrics with the new `range` param.

### RBAC

- If the user is `SALES_REP` or `VIEWER`, show only their own metrics (backend filters by user).
- If `MANAGER`/`ADMIN`, show org-wide metrics and add an optional "View my data only" toggle.

### Styling & UX

- Use shadcn components: `Card`, `Select`, `Tabs`.
- Follow `ui-context.md`: clean layout, Inter font, neutral palette.
- Loading states (React Query's `isLoading`) for each chart/card.
- Empty states if no data (e.g. "No activity yet").

### Optional: drill-down

- Clicking a chart segment (e.g. a contact owner bar) navigates to a filtered view (e.g.
  `/contacts?ownerId=<id>`). Defer if time-constrained.

## Scope Limits

- No custom reports or saved dashboards (defer to post-MVP).
- No real-time updates (refresh on page load; no WebSocket).
- No data exports (CSV/PDF) from the dashboard (defer to post-MVP).

## Check When Done

- Dashboard page displays KPI cards (contacts, companies, activity, emails, AI).
- Charts show trends and breakdowns (line, bar) with Recharts.
- Time-range selector filters data (7d/30d/all).
- RBAC: reps see their own data, managers/admins see org-wide. `npm run build` passes.
