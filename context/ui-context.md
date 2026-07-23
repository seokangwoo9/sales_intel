# SalesIntel CRM - UI Context

## Theme

Light mode by default with optional dark mode support (future enhancement). The visual language is a clean, professional workspace — white/light gray backgrounds, layered surfaces with subtle shadows, and vivid accent colors for interactive elements and status indicators.

All colors are defined as CSS custom properties in `globals.css` following shadcn/ui conventions. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

### Light Mode (Default)

| Role                | CSS Variable           | Tailwind Token      | Value                     |
| ------------------- | ---------------------- | ------------------- | ------------------------- |
| Page background     | `--background`         | `bg-background`     | `hsl(0 0% 100%)`          |
| Card/Surface        | `--card`               | `bg-card`           | `hsl(0 0% 100%)`          |
| Popover             | `--popover`            | `bg-popover`        | `hsl(0 0% 100%)`          |
| Primary             | `--primary`            | `bg-primary`        | `hsl(222.2 47.4% 11.2%)`  |
| Primary foreground  | `--primary-foreground` | `text-primary-foreground` | `hsl(210 40% 98%)` |
| Secondary           | `--secondary`          | `bg-secondary`      | `hsl(210 40% 96.1%)`      |
| Muted               | `--muted`              | `bg-muted`          | `hsl(210 40% 96.1%)`      |
| Accent              | `--accent`             | `bg-accent`         | `hsl(210 40% 96.1%)`      |
| Default text        | `--foreground`         | `text-foreground`   | `hsl(222.2 47.4% 11.2%)`  |
| Muted text          | `--muted-foreground`   | `text-muted-foreground` | `hsl(215.4 16.3% 46.9%)` |
| Border              | `--border`             | `border-border`     | `hsl(214.3 31.8% 91.4%)`  |
| Input border        | `--input`              | `border-input`      | `hsl(214.3 31.8% 91.4%)`  |
| Ring/Focus          | `--ring`               | `ring-ring`         | `hsl(222.2 47.4% 11.2%)`  |
| Destructive         | `--destructive`        | `bg-destructive`    | `hsl(0 84.2% 60.2%)`      |
| Success             | `--success`            | `text-success`      | `hsl(142 71% 45%)`        |
| Warning             | `--warning`            | `text-warning`      | `hsl(38 92% 50%)`         |
| Info/Brand          | `--brand`              | `text-brand`        | `hsl(221 83% 53%)`        |

### Component-Specific Colors

| Component           | CSS Variable           | Usage                                  |
| ------------------- | ---------------------- | -------------------------------------- |
| AI Assistant        | `--accent-ai`          | AI chat interface, suggestions         |
| Ownership indicator | `--owner-badge`        | Owner badges on contacts/companies     |
| Email status        | `--email-sent`         | Sent email indicators                  |
| Email status        | `--email-received`     | Received email indicators              |
| Activity indicator  | `--activity-active`    | Recent activity badges                 |

## Typography

| Role          | Font       | CSS Variable        | Usage                              |
| ------------- | ---------- | ------------------- | ---------------------------------- |
| UI text       | Inter      | `--font-sans`       | All interface text, forms, labels  |
| Headings      | Inter Bold | `--font-sans`       | Page titles, section headers       |
| Code/mono     | Fira Code  | `--font-mono`       | Code snippets, email headers, IDs  |

Both fonts are loaded via `next/font/google` and applied as CSS variables on the `<html>` element. The base `body` uses Inter with `antialiased`.

## Spacing & Layout

### Container Sizes
- **Max width:** `1400px` for main content area
- **Sidebar width:** `280px` (collapsible to `64px` icon-only mode)
- **Detail panel:** `400px` (slide-over from right)

### Padding Scale
| Context              | Class      |
| -------------------- | ---------- |
| Page container       | `p-6`      |
| Card content         | `p-4`      |
| Dense lists          | `p-2`      |
| Modal content        | `p-6`      |
| Form sections        | `space-y-4`|

## Border Radius

Consistent radius scale following shadcn/ui conventions:

| Context              | Class         |
| -------------------- | ------------- |
| Buttons, inputs      | `rounded-md`  |
| Cards, panels        | `rounded-lg`  |
| Modals, dialogs      | `rounded-xl`  |
| Avatar, badges       | `rounded-full`|

## Component Patterns

### Cards
- White background with subtle border (`border-border`)
- Shadow on hover: `hover:shadow-md transition-shadow`
- Padding: `p-4` or `p-6` depending on content density
- Border radius: `rounded-lg`

### Tables
- Header with muted background: `bg-muted`
- Alternating row colors: `even:bg-muted/50`
- Hover state: `hover:bg-accent/50`
- Sticky header for long lists
- Action buttons appear on row hover

### Forms
- Label: `text-sm font-medium mb-1.5`
- Input: shadcn/ui `<Input>` component with `border-input`
- Error state: `border-destructive` with error message below
- Required fields marked with red asterisk
- Helper text: `text-sm text-muted-foreground mt-1`

### Buttons
- **Primary:** `bg-primary text-primary-foreground hover:bg-primary/90`
- **Secondary:** `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Destructive:** `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **Ghost:** `hover:bg-accent hover:text-accent-foreground`
- **Outline:** `border border-input bg-background hover:bg-accent`

### Badges
- **Default:** Muted background with border
- **Success:** Green background for completed/active status
- **Warning:** Yellow/amber background for pending status
- **Destructive:** Red background for errors/deleted
- **Owner:** Special badge color for ownership indicator
- Size: `text-xs px-2 py-0.5 rounded-md`

### Status Indicators
- **Online/Active:** Green dot (8px) with pulse animation
- **Away:** Yellow dot
- **Offline:** Gray dot
- **Notification:** Red dot with count badge

## Layout Patterns

### Main Application Layout
```
┌─────────────────────────────────────────────────────┐
│ Top Navigation Bar (64px height)                    │
│ Logo | Org Switcher | Search | Notifications | Avatar│
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │  Main Content Area                       │
│ (280px)  │  - Breadcrumbs                           │
│          │  - Page header with actions              │
│ - Home   │  - Content (list/detail/forms)           │
│ - Contacts│                                          │
│ - Companies                                          │
│ - Email  │                                           │
│ - Activity│                                          │
│ - Analytics                                          │
│ - AI Chat│                                           │
│          │                                           │
└──────────┴──────────────────────────────────────────┘
```

### Contact/Company Detail Layout
```
┌─────────────────────────────────────────────────────┐
│ Header: Name | Owner Badge | Edit | Delete          │
├─────────────────────────────────┬───────────────────┤
│                                 │                   │
│ Main Details (2/3)              │ Sidebar (1/3)     │
│ - Contact Info                  │ - Quick Actions   │
│ - Company Links                 │ - Related Items   │
│ - Custom Fields                 │ - Tags            │
│                                 │ - History Summary │
│                                 │                   │
├─────────────────────────────────┴───────────────────┤
│                                                      │
│ Tabs: Activity | Emails | Files | History           │
│                                                      │
│ [Tab Content Area - Full Width]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Email Interface
```
┌─────────────────────────────────────────────────────┐
│ Compose Button | Search | Filters                   │
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ Folder   │  Email List                              │
│ List     │  ┌─────────────────────────────────────┐ │
│          │  │ Subject | Preview | Time            │ │
│ □ Inbox  │  │ [Unread indicator] [Attachment]     │ │
│ □ Sent   │  ├─────────────────────────────────────┤ │
│ □ Drafts │  │ Subject | Preview | Time            │ │
│          │  └─────────────────────────────────────┘ │
│          │                                           │
│          │  [Email Detail View - Opens on click]    │
│          │                                           │
└──────────┴──────────────────────────────────────────┘
```

### AI Chat Interface
```
┌─────────────────────────────────────────────────────┐
│ AI Assistant | Clear Chat | Settings                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Chat Messages Scrollable Area]                    │
│                                                      │
│  User: "What's the status with Acme Corp?"         │
│  ┌──────────────────────────────────────────┐      │
│  │ AI: Based on recent activity...           │      │
│  │ [AI response with context indicators]     │      │
│  │ [Action buttons: Draft Email, View Contact]│     │
│  └──────────────────────────────────────────┘      │
│                                                      │
├─────────────────────────────────────────────────────┤
│ Message input | [Send] | [Attach]                  │
└─────────────────────────────────────────────────────┘
```

## Component Library

**shadcn/ui** on top of Tailwind CSS. Use the shadcn CLI to add components rather than building from scratch.

### Core Components in Use:
- Button, Input, Textarea, Label
- Select, Checkbox, RadioGroup, Switch
- Card, Badge, Avatar
- Dialog, Sheet, Popover, Dropdown Menu
- Table, Tabs, Accordion
- Command (for search/command palette)
- Calendar, DatePicker
- Toast (notifications)
- Skeleton (loading states)

### Custom Components to Build:
- `ContactCard` - Contact list item with avatar, name, company
- `CompanyCard` - Company list item with logo, name, contacts count
- `ActivityFeedItem` - Timeline item for activity feed
- `EmailListItem` - Email inbox item with preview
- `EmailComposer` - Rich email composition interface
- `AIMessage` - Chat message with AI-specific styling
- `OwnerBadge` - Owner indicator with avatar
- `PostCard` - Activity post with comments
- `MentionInput` - Rich text input with @mentions
- `FileUpload` - Drag-drop file upload zone
- `OrgSwitcher` - Organization dropdown selector

## Icons

**Lucide React** - Consistent stroke-based icon set

### Icon Sizing:
| Context                  | Size Class  | Actual Size |
| ------------------------ | ----------- | ----------- |
| Inline text              | `h-4 w-4`   | 16px        |
| Buttons, inputs          | `h-5 w-5`   | 20px        |
| Navigation               | `h-6 w-6`   | 24px        |
| Feature illustrations    | `h-8 w-8`   | 32px        |
| Empty states, placeholders | `h-12 w-12` | 48px      |

### Common Icons:
- `User`, `Users` - Contacts, team
- `Building2` - Companies
- `Mail`, `Send` - Email
- `MessageSquare`, `AtSign` - Posts, mentions
- `FileText`, `Paperclip` - Files, attachments
- `Bot`, `Sparkles` - AI assistant
- `BarChart3`, `TrendingUp` - Analytics
- `Bell`, `BellRing` - Notifications
- `Search` - Search functionality
- `Settings`, `MoreVertical` - Actions, settings

## Empty States

When lists or sections have no data:

```
┌─────────────────────────────────────┐
│         [Large Icon - 48px]          │
│                                      │
│      No contacts found               │
│      Add your first contact or       │
│      import from a file              │
│                                      │
│      [Primary Action Button]         │
│      [Secondary Action Link]         │
└─────────────────────────────────────┘
```

- Center-aligned content
- Muted text for description
- Clear call-to-action button
- Optional secondary action as link

## Loading States

- **Skeleton loaders** for content areas (using shadcn `<Skeleton>`)
- **Spinner** for button actions (`Loader2` icon with `animate-spin`)
- **Progress bar** for long operations (file uploads, imports)
- **Optimistic UI** for mutations (show immediately, rollback on error)

## Responsive Design

### Breakpoints (Tailwind defaults):
- `sm:` 640px (mobile landscape)
- `md:` 768px (tablet)
- `lg:` 1024px (desktop)
- `xl:` 1280px (large desktop)
- `2xl:` 1536px (extra large)

### Mobile Adaptations:
- Sidebar collapses to drawer (hamburger menu)
- Tables convert to stacked cards
- Multi-column layouts become single column
- Detail panels as full-screen modals
- Touch-friendly tap targets (min 44px)

## Accessibility

- **Focus indicators:** Visible focus ring on all interactive elements
- **Color contrast:** WCAG AA compliant (4.5:1 for text)
- **Keyboard navigation:** Full keyboard support for all features
- **Screen readers:** Proper ARIA labels and semantic HTML
- **Form validation:** Clear error messages with `aria-invalid`

## Animations & Transitions

Keep animations subtle and purposeful:

- **Transitions:** `transition-all duration-200 ease-in-out`
- **Hover states:** Scale or background color change
- **Fade in:** New content with `animate-in fade-in`
- **Slide in:** Panels with `animate-in slide-in-from-right`
- **Loading:** Pulse animation for skeletons

## Error States

- **Inline errors:** Below form fields in red text
- **Toast notifications:** For global errors/success messages
- **Error boundaries:** Fallback UI for React errors
- **404 pages:** Custom not found page with navigation
- **Network errors:** Retry button with friendly message

## Best Practices

1. **Use shadcn/ui components** - Don't reinvent the wheel
2. **Follow Tailwind conventions** - Utility classes, no custom CSS unless necessary
3. **Consistent spacing** - Use Tailwind spacing scale (4px increments)
4. **Mobile-first** - Design for mobile, enhance for desktop
5. **Semantic HTML** - Use proper tags (`<button>`, `<nav>`, `<main>`)
6. **Loading feedback** - Always show loading states for async operations
7. **Error handling** - Graceful degradation, clear error messages
8. **Performance** - Lazy load images, code splitting, optimize bundles
