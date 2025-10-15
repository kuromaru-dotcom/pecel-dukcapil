# Design Guidelines: Aplikasi Manajemen Dokumen Kependudukan - Kotamobagu

## Design Approach: Natural & Trustworthy Government Service Design

**Rationale**: A public-facing government service requiring trust, professionalism, and accessibility. Drawing inspiration from modern gov.uk patterns and Notion's clarity, we combine official credibility with natural warmth through forest green palette and generous spacing.

## Core Design Elements

### A. Color Palette - Natural Forest Green

**Primary Colors**:
- Primary Green: 155 65% 45% (Forest emerald - primary actions, headers, official elements)
- Primary Deep: 155 70% 35% (Deep forest - hover states, emphasis)
- Background: 145 20% 97% (Soft sage cream - main background)
- Surface: 0 0% 100% (Pure white - cards, elevated surfaces)
- Surface Secondary: 145 15% 93% (Subtle sage - secondary backgrounds)

**Status Colors** (Natural Palette):
- Status Diterima: 155 55% 50% (Fresh green - received)
- Status Diproses: 45 85% 55% (Amber yellow - in progress)
- Status Selesai: 145 65% 45% (Success green - completed)
- Status Ditunda: 10 70% 55% (Coral red - on hold/rejected)

**Text Colors**:
- Primary: 150 25% 15% (Deep forest text)
- Secondary: 150 15% 45% (Muted forest)
- Tertiary: 145 10% 60% (Light sage)

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
- Clean white cards with rounded-xl borders
- Soft shadows: shadow-sm hover:shadow-md
- Column headers: bg-sage-50 (145 15% 93%) with semibold text
- Row hover: bg-sage-25 (subtle green tint)
- Status badges: rounded-full px-4 py-1.5 with matching soft backgrounds
- Mobile: Horizontal scroll with sticky first column

**Cards & Containers**:
- Background: white
- Border: 1px solid sage-200 (145 15% 88%)
- Border radius: rounded-xl (12px)
- Padding: p-6 md:p-8
- Soft shadow elevation: shadow-sm

**Buttons**:
- Primary: bg-forest-500 hover:bg-forest-600 text-white rounded-lg px-6 py-3
- Secondary: border-2 border-sage-200 text-forest-700 hover:bg-sage-50
- Outline on images: backdrop-blur-md bg-white/80 border border-white/60
- Icon buttons: Soft hover states with green tint
- Touch-friendly: minimum 44px height

**Forms**:
- Input fields: border-2 border-sage-300 focus:border-forest-500 rounded-lg bg-white
- Labels: font-medium text-forest-800 mb-2
- Helper text: text-sm text-sage-600
- Success feedback: Soft green toast with checkmark
- Error states: Soft coral borders with gentle shake animation

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
