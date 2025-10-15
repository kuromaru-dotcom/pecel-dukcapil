# Design Guidelines: Aplikasi Manajemen Dokumen Kependudukan - Kotamobagu

## Design Approach: Warm & Accessible Government Service Design

**Rationale**: A public-facing government service requiring trust, warmth, and accessibility. Drawing inspiration from modern gov.uk patterns and Notion's clarity, we combine professional credibility with approachable warmth through natural color palette and generous spacing.

## Core Design Elements

### A. Color Palette

**Primary Colors**:
- Primary Warm: 25 75% 50% (Warm terracotta - primary actions, headers)
- Primary Deep: 25 65% 35% (Deep terracotta - hover states, emphasis)
- Background: 40 25% 97% (Warm cream - main background)
- Surface: 0 0% 100% (Pure white - cards, elevated surfaces)
- Surface Secondary: 35 30% 95% (Soft peach - subtle backgrounds)

**Status Colors** (Warm Palette):
- Public Indicator: 45 85% 60% (Warm golden yellow)
- Internal Indicator: 150 40% 55% (Soft sage green)
- Status Diterima: 150 45% 50% (Gentle green)
- Status Diproses: 35 80% 60% (Warm amber)
- Status Ditunda/Ditolak: 10 70% 55% (Soft coral red)

**Text Colors**:
- Primary: 25 40% 20% (Warm dark brown)
- Secondary: 25 20% 45% (Muted brown)
- Tertiary: 25 15% 60% (Light brown)

### B. Typography

**Font Stack**: 'Plus Jakarta Sans' (warm, friendly humanist sans-serif) via Google Fonts, fallback: 'Inter', system-ui

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
- Role badge: soft pill shape with warm background
- User menu: right-aligned with avatar
- Mobile: Hamburger menu, full-screen drawer

**Hero Section** (Public Dashboard):
- Welcoming header with city emblem illustration
- Warm gradient background: from 40 35% 96% to 25 25% 98%
- Headline: "Layanan Dokumen Kependudukan Kotamobagu"
- Subtext explaining service accessibility
- Quick status check search bar (large, rounded-2xl)
- Illustration: Abstract document/family icons in warm tones

**Data Tables**:
- Clean white cards with rounded-xl borders
- Soft shadows: shadow-sm hover:shadow-md
- Column headers: bg-warm-50 (35 30% 95%) with semibold text
- Row hover: bg-warm-25 (subtle peach tint)
- Status badges: rounded-full px-4 py-1.5 with matching soft backgrounds
- Public columns: Left border-l-3 border-yellow-400
- Internal columns: Left border-l-3 border-green-400
- Mobile: Horizontal scroll with sticky first column

**Cards & Containers**:
- Background: white
- Border: 1px solid warm-200 (35 25% 90%)
- Border radius: rounded-xl (12px)
- Padding: p-6 md:p-8
- Soft shadow elevation: shadow-sm

**Buttons**:
- Primary: bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg px-6 py-3
- Secondary: border-2 border-terracotta-200 text-terracotta-700 hover:bg-terracotta-50
- Outline on images: backdrop-blur-md bg-white/80 border border-white/60
- Icon buttons: Soft hover states with warm tint
- Touch-friendly: minimum 44px height

**Forms**:
- Input fields: border-2 border-warm-300 focus:border-terracotta-500 rounded-lg bg-white
- Labels: font-medium text-warm-800 mb-2
- Helper text: text-sm text-warm-600
- Success feedback: Soft green toast with checkmark
- Error states: Soft coral borders with gentle shake animation

**Dashboard Auto-Scroll Tables**:
- Three status cards (Diterima, Diproses, Ditunda)
- Each card: white background, top border-t-4 with status color
- Smooth scroll: 25px/second with pause on hover
- Subtle fade gradient at edges
- "Kembali ke atas" button: soft floating action

### E. Images

**Hero Section Image**:
- Location: Top of public dashboard, full-width
- Description: Warm, welcoming illustration of Kotamobagu city landmarks and diverse citizens (families, elderly, young adults) interacting with documents - stylized, friendly art style with terracotta and cream color palette
- Treatment: Subtle gradient overlay from cream to transparent
- Dimensions: 16:9 aspect ratio, max-height 400px

**Supporting Images**:
- Empty state illustrations: Friendly characters holding documents in warm color palette
- Success state: Celebratory illustration with checkmark
- Error state: Gentle, reassuring illustration (not harsh)

### F. Mobile-First Responsive Design

**Breakpoint Strategy**:
- Mobile (base): Single column, stacked navigation, full-width tables with scroll
- Tablet (md: 768px): Two-column dashboard, expanded navigation
- Desktop (lg: 1024px): Three-column status view, full feature set

**Touch Targets**:
- Minimum 44x44px for all interactive elements
- Increased padding on mobile buttons: py-3 px-6
- Larger form inputs on mobile: text-lg
- Bottom navigation on mobile for key actions

### G. Accessibility & Performance

**Accessibility**:
- WCAG AA contrast minimum (4.5:1 for text)
- All status information includes text labels + icons
- Keyboard navigation with visible focus rings (ring-2 ring-terracotta-400)
- Screen reader labels for all table columns
- Skip navigation link
- Touch-friendly spacing throughout

**Performance & Simplicity**:
- Minimal animations: gentle fades and slides only
- Lazy load tables and images
- Optimized font loading (swap strategy)
- Progressive enhancement
- Lightweight icon set: Heroicons (outline style)

### H. Role-Specific Adaptations

**Public View**:
- Prominent search functionality in hero
- Only yellow-bordered public columns visible
- Large, clear status indicators
- Helpful tooltips explaining each status

**CS (Customer Service)**:
- "Tambah Dokumen Baru" prominent action (top-right, terracotta button)
- Quick entry form modal: warm, welcoming design
- Recently added list for reference

**Operator**:
- "Update Status" action buttons on each row (soft amber)
- Bulk update capability
- Activity log sidebar

**Super Admin**:
- User management dashboard: clean table layout
- Role assignment with visual indicators
- System settings: organized accordion sections

### I. Special Features & Interactions

**Status Tracking**:
- Public can search by NIK or document number
- Results show timeline visualization with warm color coding
- Estimated processing time indicator

**Auto-Refresh**:
- Dashboard tables update every 45 seconds
- Subtle notification badge for new entries
- Manual refresh button available

**Print & Export**:
- Print-friendly layouts with official letterhead
- PDF export with warm branding
- Data export (CSV) for internal use

This design creates a government service that feels professional yet approachable, leveraging warm natural tones to build trust while maintaining excellent functionality and accessibility for all users.