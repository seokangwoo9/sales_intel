we need the base components that frame every screen — the top navbar and the left sidebar shell. These will be reused and extended in every chapter that follows.

### Editor Navbar

Create `components/workspace/workspace-navbar.tsx`.

Requirements:

- fixed-height top navbar
- left, center, and right sections
- left section contains sidebar toggle button
- use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state
- center section for a searchbar with placeholder `Search...`
- right section contain help (question mark) button.

---

### Project Sidebar

Create `components/workspace/workspace-sidebar.tsx`.

Requirements:

- opening it should not push page content
- slides in from the left
- accepts `isOpen` prop
- when sidebar is open, show icon+description, otherwise, icon.
- navigation for search, settings.
- both navigation button show empty placeholder state

---

### Check when done

- new components compile without TypeScript errors
- no lint errors
