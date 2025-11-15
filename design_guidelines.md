# College Organizer - Design Enhancement Guidelines

## Design Approach
**Utility-Focused Enhancement**: Maintain the existing minimalist, professional aesthetic while improving functionality. The current design successfully balances visual appeal with productivity tools - enhance rather than redesign.

## Typography Hierarchy

**Primary System**: Continue using "Segoe UI Emoji" with sans-serif fallback
- **Page Headers**: text-4xl, font-semibold
- **Section Titles**: text-2xl, font-semibold  
- **Subsections**: text-xl, font-medium
- **Body Text**: text-base, font-normal
- **Metadata/Labels**: text-sm, text-xs for dense information
- **Interactive Elements**: font-medium for buttons, font-normal for links

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12
- **Component Padding**: p-6 (mobile), p-8 (desktop)
- **Section Gaps**: gap-8 for major divisions, gap-4 for related items
- **List Spacing**: space-y-3 for task items, space-y-4 for larger cards
- **Margins**: mb-4 for section headers, mb-8 for major sections

**Grid Systems**:
- **Dashboard Layout**: 3-column grid on desktop (md:w-1/3), stack on mobile
- **Calendar Grid**: 7-column fixed (grid-cols-7)
- **Statistics Dashboard**: 2-4 column responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)

## Component Library

### Core Components

**Card Structure**:
- Rounded corners: rounded-xl
- Consistent padding: p-6 sm:p-8
- Subtle elevation with existing shadow patterns
- Maintain existing purple card backgrounds

**Task Items**:
- Fixed height containers for consistency
- Icon-first layout (28px fixed width for alignment)
- Checkbox + content + metadata horizontal flow
- Track color backgrounds override text colors (white text on colored backgrounds)

**Priority Indicators**:
- High: Vertical accent bar (4px width, left border)
- Medium: Subtle background tint
- Low: Standard styling
- Position: Left edge of task cards

**New Feature Components**:

**Recurring Task Badge**: Small pill badge (text-xs, rounded-full, px-2 py-1) in task header showing frequency (Daily/Weekly/Monthly)

**Notification Toast**: Fixed position (top-right), rounded-lg, p-4, max-w-sm, slide-in animation, auto-dismiss after 5s

**Pomodoro Timer**: Circular progress indicator, centered text showing time, control buttons below (Start/Pause/Reset), session counter

**Priority Filter Chips**: Horizontal row of rounded-full buttons (px-4 py-2), active state with subtle background change

**Statistics Cards**: 
- Grid layout (2-4 columns)
- Large numeric display (text-4xl, font-bold)
- Label below (text-sm)
- Icon above number
- Min height for alignment

**Export Dialog**: Modal overlay with centered card, form inputs stacked vertically (space-y-4), action buttons at bottom (space-x-4)

**Search Bar**: Full-width input with leading icon, rounded-lg, sticky positioning option for calendar view

**Theme Toggle**: Icon button (sun/moon), fixed position (top-right), smooth transition on theme change

### Navigation & Controls

**Back/Home Button**: Maintain absolute positioning (top-8 left-8), consistent sizing (p-3)

**Filter Buttons**: Horizontal scrollable row (flex-wrap gap-2), pill-shaped buttons

**Action Buttons**: 
- Primary: Full width on mobile, auto width on desktop
- Secondary: Outlined variant
- Icon buttons: Square (p-3), rounded-lg

### Forms & Inputs

**Task Creation Form**:
- Vertical layout (space-y-4)
- Full-width inputs (w-full)
- Label above input pattern
- Multi-select for tracks/courses with tags display
- Date range picker for multi-day tasks
- Time picker for scheduled tasks

**Priority Dropdown**: Inline with task title input, icon + text options

**Recurring Options**: Expandable section, checkbox grid for days of week

## Time Blocking Enhancements

**Hour Blocks**: Maintain 60px height, add half-hour subdivisions (30px) with lighter borders

**Task Overlap Handling**: 
- Side-by-side when possible (split width)
- Slight offset when overlapping (z-index stacking)
- Hover reveals full details

**Current Time Indicator**: Horizontal line across blocks, animated pulse

## Drag & Drop Visual Feedback

**Dragging State**: opacity-0.5, 2px dashed border
**Drop Zone**: Subtle scale transformation (scale-1.02), background shift
**Invalid Drop**: Red dashed border, shake animation

## Animations (Minimal Use)

**Allowed Animations**:
- Fade-in for new tasks (0.2s)
- Slide-in for notifications (0.3s)
- Smooth height transitions for expanding sections
- Subtle hover transformations (translateY -1px, 0.2s)

**Avoid**: Continuous animations, complex transitions, parallax effects

## Responsive Behavior

**Breakpoints**:
- Mobile: Single column stacking
- Tablet (md:): 2-column layouts
- Desktop (lg:): 3-4 column layouts

**Touch Targets**: Minimum 44px height for interactive elements on mobile

**Horizontal Scrolling**: Only for timeline and time-blocking views

## Keyboard Shortcuts Overlay

**Display**: Modal triggered by "?" key
**Layout**: Two-column table, keyboard combo on left, action on right
**Styling**: Monospace font for keyboard keys (font-mono), rounded key badges

## Accessibility

- Maintain focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Keyboard navigation through all features
- Screen reader announcements for notifications
- Color contrast maintained for all text (AAA standard)

## No Images Required

This is a productivity tool - no hero images or decorative photography needed. Focus on clear, functional interface elements and data visualization.