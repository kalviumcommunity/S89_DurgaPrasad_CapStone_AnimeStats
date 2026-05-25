# Responsive Guide

This file documents the responsive tokens, breakpoints and where to tweak layout for the project.

Breakpoints
- `--bp-sm` (480px) — small phones
- `--bp-md` (768px) — tablets / small laptops
- `--bp-lg` (992px) — desktop
- `--bp-xl` (1200px) — large desktop

Where to tweak
- Global tokens: `frontend/src/index.css` — change spacing, container width and base font sizes.
- Navbar: `frontend/src/Navbar.css` — mobile toggle and drawer styles live here.
- Home page carousel: `frontend/src/components/HomePage.css` — arrow placement, wrapper padding, and card sizing.

Notes
- Carousels are keyboard accessible (focus and use ArrowLeft/ArrowRight).
- Arrows overlay the carousel area and carousel wrappers have horizontal padding so items aren't covered.
- To enable or tune hamburger behavior, adjust the `max-width` values in the media queries in `Navbar.css`.

Quick test commands
```bash
cd frontend
npm run dev
```

Report any pages that still look off and I'll refine the relevant CSS.
