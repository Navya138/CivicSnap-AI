---
name: Civic Emerald Public Interface
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: '0'
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: '0'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an authoritative, accountable, and high-legibility civic infrastructure interface. Built for municipal oversight, field operations, and direct citizen reporting, the aesthetic balances modern public-sector professionalism with mission-critical clarity. 

The stylistic direction blends **Corporate / Modern** precision with **High-Contrast Data Architecture**. It prioritizes immediate spatial orientation, scannable priority tiers, and high-visibility status indicators. Visual noise is minimized to ensure rapid comprehension under high-stress field conditions, outdoor sun glare, and bilingual usage where script density varies between Latin and Telugu typography.

## Colors

The palette establishes an immediate operational hierarchy anchored by civic legitimacy, alert legibility, and high contrast against structural white and slate surfaces:

- **Primary (`#059669` Emerald Green):** Represents resolution, civic health, verified actions, and primary user tasks. Used on primary buttons, verified audit badges, and active civic resolution states.
- **Secondary (`#0F172A` Deep Navy):** Represents administrative governance and institutional permanence. Serves as high-contrast structural framing, primary typography, deep header banners, and heavy anchor buttons.
- **Tertiary (`#F59E0B` Warning Amber):** Designated strictly for triage warnings, moderate infrastructure risk, pending department handoffs, and SLA threshold warnings.
- **Severity Alert (`#EF4444` Deep Danger):** Reserved exclusively for Severity 5 hazards, structural collapse notices, hazardous waste spills, and live emergency field dispatches.
- **Neutral & Slate Scales (`#0F172A`, `#334155`, `#64748B`, `#E2E8F0`, `#F8FAFC`):** Ground the application in architectural contrast. Backgrounds remain crisp (`#F8FAFC` to `#FFFFFF`), while borders use structural slate outlines (`#E2E8F0` to `#CBD5E1`) to maintain separation without heavy shadows.

## Typography

**Public Sans** provides neutral, institutional weight with broad Unicode coverage and optical clarity across small handheld devices and desktop dispatch consoles. **JetBrains Mono** is utilized strictly for system metadata: ticket tracking IDs, coordinate lat/long positions, dispatch timestamps, and severity metric indices.

### Bilingual Handling (English / Telugu)
Telugu script possesses taller loop descenders and stacked conjuncts requiring intentional baseline accommodations:
- When Telugu is active, augment body line-height by `+4px` (e.g., `body-md` increases from `24px` to `28px`) to prevent ascender clipping.
- Pair Telugu body type with standard systemic fallbacks (such as Noto Sans Telugu) rendered at equal visual mass without weight distortion.
- Do not apply all-caps transformations to mixed-language strings.

## Layout & Spacing

The layout is built upon a responsive 12-column grid for desktop dashboards and a 4-column column structure for mobile field operations.

- **Breakpoints:**
  - **Mobile (`< 640px`):** 4 columns, `margin-sm` (1rem / 16px), `gutter-sm` (1rem / 16px). Critical action buttons stick to bottom safe zones.
  - **Tablet (`640px - 1024px`):** 8 columns, `margin` (2rem / 32px), `gutter` (1.5rem / 24px). Split incident review cards side-by-side.
  - **Desktop (`> 1024px`):** 12 columns, fixed container max-width at `1440px`, `gutter` (1.5rem / 24px). Accommodates spatial mapping, GIS telemetry, and queue panels concurrently.

Spacing scales operate on an authoritative 4px/8px baseline rhythm. Component padding avoids ambiguous whitespace: actionable elements are padded generously (`space-md` on buttons) to adhere to accessible touch targets (minimum 44x44px for field workers wearing gloves).

## Elevation & Depth

This system avoids soft, floating aesthetics in favor of structured architectural depth using **low-contrast structural outlines** combined with **subtle, high-density ambient floor shadows**:

- **Level 0 (Base Canvas):** `#F8FAFC`. Completely flat canvas base.
- **Level 1 (Card & Module Surfaces):** Surface `#FFFFFF`, bordered with a crisp `1px solid #E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hover & Active Triage Panels):** Surface `#FFFFFF`, border `1px solid #CBD5E1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)`.
- **Level 3 (Modal Alerts & Severity 5 Prompts):** Surface `#FFFFFF`, border `1px solid #94A3B8`. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`.

Elevations are reinforced through high-contrast border states rather than blur radii alone, ensuring that critical triage elements remain crisp even in sunlight or on low-contrast civic terminals.

## Shapes

The interface uses a **Soft (Level 1)** geometric standard. Containers utilize `0.25rem` (4px) to `0.5rem` (8px) corner radials, maintaining a structured, municipal feel that rejects casual or overly playful rounded styling.

- **Badges, Tags & Severity Chips:** `0.25rem` (4px) corner radius. Avoid full-pill borders for status tags to reinforce technical credibility.
- **Inputs & Standard Buttons:** `0.375rem` (6px) corner radius.
- **Panels, Modals & Data Cards:** `0.5rem` (8px) corner radius.

## Components

### Buttons
- **Primary:** Background `#059669`, text `#FFFFFF`, border `1px solid #047857`. Hover state transitions to `#047857`. Focus state rings with a `2px` offset in `#059669`.
- **Secondary (Administrative):** Background `#0F172A`, text `#FFFFFF`, border `1px solid #020617`. Hover transitions to `#1E293B`.
- **Outline / Neutral:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #CBD5E1`. Hover transitions to `#F1F5F9`.
- **Danger (Severity Trigger):** Background `#EF4444`, text `#FFFFFF`, border `1px solid #DC2626`.

### Badges & Severity Indicators
Crisp, square-cornered labels utilizing `label-mono`:
- **Severity 1-2 (Normal/Low):** Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`.
- **Severity 3-4 (Moderate/Amber):** Background `#FFFBEB`, text `#92400E`, border `1px solid #FCD34D`.
- **Severity 5 (Critical Risk):** Background `#FEF2F2`, text `#991B1B`, border `1px solid #F87171`. A pulsing indicator dot (`#EF4444`) accompanies the text badge.

### Incident Cards
Constructed using high-contrast white containers with a `1px solid #E2E8F0` border. For high-urgency reports, the left edge features a solid `4px` vertical accent stripe denoting priority color (`#EF4444` for Severity 5, `#F59E0B` for Amber, `#059669` for Resolved). Card headers feature bilingual titles (English primary, Telugu subtitle in `body-sm` muted text).

### Input Fields & Controls
- **Text Inputs:** Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, placeholder `#94A3B8`. Focused states display border `#059669` with `0 0 0 3px rgba(5, 150, 105, 0.15)`.
- **Checkboxes & Radios:** Solid square and circular forms with `2px` borders in `#64748B`. Selected state fills with `#059669` using high-contrast white glyph indicators.

### Bilingual Toggle Bar
A compact segmented switch pinned to the utility navigation. Rendered in a high-contrast container with `#0F172A` as the active segment background and crisp `#FFFFFF` labels to facilitate seamless switching between English and తెలుగు.