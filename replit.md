# College Organizer

## Overview

College Organizer is a full-stack productivity application designed to help students manage their academic life. It provides comprehensive task management, time blocking, Pomodoro timer functionality, and multiple calendar views to organize assignments, exams, events, and other academic activities. 

**Key Features**:
- Multiple task types: assignments, exams, events, deadlines, meetings, projects, and reminders
- Projects and subtasks for hierarchical task organization
- Visual time-block calendar with hour-by-hour schedule display and PNG export
- Horizontal timeline showing 2 weeks of upcoming tasks with track filtering
- Drag-and-drop task rearrangement for easy scheduling
- Data import/export (JSON, CSV, TXT formats)
- Pomodoro timer integration with task tracking
- Track (category/course) organization with color coding

The application features a minimalist, professional design with a purple and yellow color scheme, built with modern web technologies for a seamless user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## Replit Environment Setup (November 15, 2025)

**Current Configuration**:
- Server runs on port 5000 (both frontend and backend on same port)
- Frontend served via Vite dev server in development mode
- Backend Express API handles `/api/*` routes
- Vite configured with `allowedHosts: true` for Replit proxy support
- In-memory storage (MemStorage) currently active for development

**Deployment Configuration**:
- Target: Autoscale (stateless deployment)
- Build: `npm run build` (Vite + esbuild)
- Run: `npm start` (production mode)

**Active Workflow**:
- "Start application": `npm run dev` (development mode with tsx)

**Known Issues**:
- Some minor TypeScript type errors exist (non-blocking for runtime)
- Database schema defined but not actively used (in-memory storage instead)

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using functional components and hooks for state management.

**Routing**: Wouter for lightweight client-side routing. Currently implements a single-page dashboard application with view switching handled internally.

**UI Component Library**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components with consistent styling through Tailwind CSS.

**State Management**: 
- TanStack Query (React Query) for server state management with automatic caching, refetching, and background updates
- Local React state (useState, useEffect) for UI-specific state like dialog visibility and view modes
- Custom hooks for reusable stateful logic (e.g., `useIsMobile`, `useToast`)

**Styling Strategy**:
- Tailwind CSS for utility-first styling with custom design system
- CSS custom properties for theme variables supporting light/dark modes
- Design system defined in `design_guidelines.md` with consistent spacing, typography, and component patterns
- Color scheme: Purple primary (#8b5cf6), Yellow accent (#fde047) with supporting colors for different task types

**Key Design Patterns**:
- Component composition with clear separation between presentational and container components
- Dialog/modal pattern for task and track creation/editing
- Toast notifications for user feedback
- Keyboard shortcut system for power users
- Responsive design with mobile-first approach
- Drag-and-drop interfaces using @dnd-kit for intuitive task management
- PNG export using html2canvas for schedule sharing

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**API Design**: RESTful API with conventional HTTP methods:
- GET for retrieving tasks, tracks, projects, subtasks, and Pomodoro sessions
- POST for creating new resources
- PATCH for partial updates
- DELETE for removing resources
- Full CRUD operations for all resource types

**Validation**: Zod schemas for runtime type validation of incoming data, integrated with Drizzle ORM schemas.

**Data Storage Strategy**: 
- In-memory storage implementation (`MemStorage` class) for development
- Interface-based design (`IStorage`) allows easy swapping to database-backed storage
- Seeded with sample data for development purposes

**Request/Response Flow**:
1. Client makes API request through `apiRequest` utility
2. Express middleware handles JSON parsing and logging
3. Route handlers validate input using Zod schemas
4. Storage layer performs CRUD operations
5. Response sent with appropriate status codes and JSON data

**Development Setup**:
- Vite for frontend development server with HMR (Hot Module Replacement)
- Middleware mode integration between Vite and Express
- Development-only plugins for error overlay and debugging tools

### Data Model

**Schema Design** (Drizzle ORM with PostgreSQL):

**Tasks Table**:
- Support for multiple task types: assignment, exam, event, deadline, reminder, meeting, project
- Date-based organization with optional time blocking (start/end times)
- Priority levels (high, medium, low) and completion status
- Track and project associations for hierarchical organization
- Recurring task support with configurable frequency and end dates
- Multi-day task support with separate start and end dates

**Tracks Table**:
- Simple categorization system with name and color coding
- Used to organize tasks and projects by course or category
- Color-coded for visual distinction in UI

**Projects Table** (November 2025):
- Hierarchical organization under tracks
- Name, description, and optional color coding
- Can contain multiple tasks and subtasks
- Track association for course/category grouping

**Subtasks Table** (November 2025):
- Linked to parent tasks for detailed task breakdown
- Title and completion status
- Full CRUD API support

**Pomodoro Sessions Table**:
- Records completed focus sessions
- Optional task association to track time spent on specific tasks
- Timestamp and duration tracking for productivity analytics

**Schema Features**:
- UUID primary keys for all tables
- Automatic timestamp tracking for creation dates
- Nullable foreign keys for optional relationships
- Text fields for flexible date/time storage (ISO format strings)

### External Dependencies

**Database**:
- PostgreSQL (configured via `@neondatabase/serverless`)
- Drizzle ORM for type-safe database queries and schema management
- Connection pooling through Neon serverless driver
- Migrations managed in `/migrations` directory via drizzle-kit

**UI Components**:
- Radix UI primitives (@radix-ui/*) for accessible, unstyled component primitives
- Extensive component library including dialogs, dropdowns, popovers, tooltips, etc.
- All components styled through shadcn/ui pattern

**Form Management**:
- React Hook Form for form state and validation
- Hookform Resolvers for Zod schema integration

**Utility Libraries**:
- date-fns for date manipulation and formatting
- clsx and tailwind-merge for conditional className construction
- class-variance-authority for component variant management
- nanoid for unique ID generation

**Development Tools**:
- Vite for build tooling and development server
- esbuild for production server bundling
- TypeScript for static type checking
- Replit-specific plugins for development environment integration

**Session Management**:
- connect-pg-simple for PostgreSQL session storage (configured but not actively used in current implementation)

**API Client**:
- Native Fetch API wrapped in custom `apiRequest` utility
- TanStack Query for request deduplication, caching, and background refetching