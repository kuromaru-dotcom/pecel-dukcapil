# Design Guidelines: Aplikasi Manajemen Dokumen Kependudukan - Kotamobagu

## Design Approach: Clean & Professional Government Service Design

**Rationale**: A public-facing government service requiring trust, professionalism, and accessibility. Drawing inspiration from modern gov.uk patterns and Notion's clarity, we combine official credibility with fresh, clean aesthetics through a vibrant green and white palette with generous spacing for optimal readability.

## Core Design Elements

### A. Color Palette - Fresh Green & White

**Primary Colors**:
- Primary Green: 145 70% 40% (Fresh forest green - primary actions, headers, official elements)
- Primary Hover: 145 75% 35% (Deeper green - hover states, emphasis)
- Background: 0 0% 100% (Pure white - main background, clean and professional)
- Surface: 0 0% 100% (Pure white - cards, elevated surfaces)
- Surface Secondary: 145 30% 95% (Very light green tint - secondary backgrounds)
- Sidebar: 145 50% 96% (Soft green tint - sidebar background)

**Status Colors** (Fresh Green Palette):
- Status Diterima: 145 60% 50% (Fresh green - received)
- Status Diproses: 45 90% 55% (Bright amber - in progress)
- Status Selesai: 145 70% 45% (Success green - completed)
- Status Ditunda: 0 70% 55% (Bright red - on hold/rejected)

**Text Colors**:
- Primary: 150 30% 20% (Dark green text - excellent readability on white, WCAG AA compliant)
- Secondary: 150 40% 30% (Medium-dark green - secondary information, WCAG AA compliant)
- Muted: 150 25% 40% (Medium green - hints and metadata, WCAG AA compliant)

### B. Typography

**Font Stack**: 'Plus Jakarta Sans' (modern, friendly humanist sans-serif) via Google Fonts, fallback: 'Inter', system-ui

**Type Scale**:
- H1: text-4xl font-bold (36px) - Page titles
- H2: text-2xl font-semibold (24px) - Section headers
- H3: text-lg font-semibold (18px) - Card titles
- Body: text-base (16px) - General content
- Small: text-sm (14px) - Table data, captions
- Tiny: text-xs (12px) - Metadata, badges

### C. Layout System

**Spacing Primitives**: Tailwind units of 3, 4, 6, 8, 12, 16, 20

- Page padding: p-4 md:p-6 lg:p-8
- Card padding: p-6 md:p-8
- Section gaps: gap-8 md:gap-12
- Component spacing: space-y-4 to space-y-6
- Generous whitespace for breathing room

**Container Widths**:
- Dashboard: max-w-7xl mx-auto
- Forms: max-w-2xl
- Tables: Full width with responsive scroll

### D. Component Library

**Navigation Bar**:
- Clean white background with subtle shadow
- Height: 72px (h-18) for touch-friendly mobile
- Logo left (Dinas Kependudukan Kotamobagu with emblem)
- Role badge: soft pill shape with sage background
- User menu: right-aligned with avatar
- Mobile: Hamburger menu, full-screen drawer

**Hero Section** (Public Dashboard):
- Welcoming header with city emblem illustration
- Natural gradient background: from sage cream to white
- Headline: "Layanan Dokumen Kependudukan Kotamobagu"
- Subtext explaining service accessibility
- Quick status check search bar (large, rounded-2xl)
- Illustration: Abstract document/family icons in forest green tones

**Data Tables**:
- Pure white background with clean borders
- Subtle shadows: shadow-sm for depth
- Column headers: Light green background (145 30% 95%) with semibold green text
- Row hover: Very subtle green tint (145 25% 97%) for interaction feedback
- Status badges: rounded-full px-4 py-1.5 with green-based color coding
- Borders: Light green-gray borders (145 20% 90%) for clean separation
- Mobile: Horizontal scroll with sticky first column

**Cards & Containers**:
- Background: Pure white (0 0% 100%)
- Border: 1px solid light green-gray (145 20% 90%)
- Border radius: rounded-xl (12px)
- Padding: p-6 md:p-8
- Soft shadow elevation: shadow-sm for subtle depth
- Hover: Subtle green tint overlay

**Buttons**:
- Primary: Fresh green (145 70% 40%) with white text, hover darkens slightly
- Secondary: Light green background (145 30% 95%) with dark green text
- Outline: Green border with transparent background, green text
- Outline on images: backdrop-blur-md bg-white/80 border border-white/60
- Icon buttons: Subtle green hover states
- Touch-friendly: minimum 44px height

**Forms**:
- Input fields: Light green-gray border (145 20% 88%), focus: bright green ring (145 70% 40%), rounded-lg on pure white background
- Labels: font-medium dark green text (150 30% 20%)
- Helper text: text-sm medium green (150 20% 50%)
- Success feedback: Fresh green toast with checkmark
- Error states: Red borders with gentle shake animation

### E. Mobile-First Responsive Design

**Breakpoint Strategy**:
- Mobile (base): Single column, stacked navigation, full-width tables with scroll
- Tablet (md: 768px): Two-column dashboard, expanded navigation
- Desktop (lg: 1024px): Three-column status view, full feature set

**Touch Targets**:
- Minimum 44x44px for all interactive elements
- Increased padding on mobile buttons: py-3 px-6
- Larger form inputs on mobile: text-lg
- Bottom navigation on mobile for key actions

### F. Accessibility & Performance

**Accessibility**:
- WCAG AA contrast minimum (4.5:1 for text)
- All status information includes text labels + icons
- Keyboard navigation with visible focus rings (ring-2 ring-forest-400)
- Screen reader labels for all table columns
- Skip navigation link
- Touch-friendly spacing throughout

**Performance & Simplicity**:
- Minimal animations: gentle fades and slides only
- Lazy load tables and images
- Optimized font loading (swap strategy)
- Progressive enhancement
- Lightweight icon set: Lucide React (outline style)

### G. Role-Specific Adaptations

**Public View**:
- Prominent search functionality
- Clear status indicators with natural color coding
- Helpful tooltips explaining each status

**CS (Customer Service)**:
- "Tambah Dokumen Baru" prominent action (top-right, forest green button)
- Quick entry form modal: clean, welcoming design
- Recently added list for reference

**Operator**:
- "Update Status" action buttons on each row (amber)
- Bulk update capability
- Activity log sidebar

**Super Admin**:
- User management dashboard: clean table layout
- Role assignment with visual indicators
- Analytics dashboard with forest green accents
- System settings: organized sections

This design creates a government service that feels professional, trustworthy, and natural - leveraging forest green tones to build confidence while maintaining excellent functionality and accessibility for all users.
