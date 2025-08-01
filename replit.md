# ZyloEstates: AI-First Direct-to-Builder Real Estate Platform

## Overview

ZyloEstates is an AI-powered real estate platform designed for the Indian market that connects buyers directly with builders, eliminating information asymmetry and reducing transaction friction. The platform focuses on verified listings, transparent pricing, and intelligent property recommendations while providing comprehensive market intelligence and legal due diligence tools.

The application serves as a unified marketplace that aggregates property data from multiple sources, applies AI-driven credibility scoring, and offers direct-to-builder transactions with reduced brokerage fees. It targets tier-1 Indian cities and emphasizes trust, transparency, and speed in real estate transactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js server providing RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon Database for serverless hosting
- **AI Integration**: OpenAI GPT-4o for property recommendations, market analysis, and conversational AI

### Data Layer Design
- **Schema-First Approach**: Shared TypeScript schemas between client and server using Zod
- **Database Schema**: Comprehensive real estate data model including users, builders, projects, units, offers, market stats, legal docs, leads, and AI chat history
- **Data Validation**: Drizzle-Zod integration for runtime type checking and validation
- **Migration Management**: Drizzle Kit for database schema migrations and versioning

### AI and Intelligence Layer
- **Conversational AI**: Multi-turn conversations with context preservation and session management
- **Property Matching**: AI-driven property recommendations based on user preferences and behavior
- **Market Intelligence**: Automated market trend analysis and forecasting
- **Credibility Scoring**: Algorithm-based scoring system for property and builder verification
- **Legal Analysis**: Document parsing and risk assessment for due diligence

### Authentication and Security
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Data Protection**: HTTPS enforcement and secure cookie handling
- **Input Validation**: Comprehensive validation using Zod schemas at API boundaries

### Development and Build System
- **Build Tool**: Vite for fast development server and optimized production builds
- **TypeScript Configuration**: Strict typing with path mapping for clean imports
- **Code Quality**: ESBuild for server-side bundling and optimization
- **Development Tools**: Replit integration with runtime error overlay and cartographer plugins

### UI/UX Architecture
- **Design System**: Consistent component library with variant-based styling
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts
- **Accessibility**: ARIA-compliant components with keyboard navigation support
- **Internationalization**: Multi-language support for English, Hindi, and Hinglish
- **Dark Mode**: CSS variable-based theming system for light/dark mode support

## External Dependencies

### Database and Hosting
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit**: Development environment and deployment platform

### AI and Machine Learning
- **OpenAI API**: GPT-4o model for natural language processing and property intelligence
- **Custom AI Services**: Property query processing, comparison analysis, and market insights generation

### UI Component Libraries
- **Radix UI**: Headless UI primitives for accessible component foundation
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Touch-friendly carousel component for property galleries
- **React Day Picker**: Calendar component for appointment scheduling

### Development Tools
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **Class Variance Authority**: Utility for creating variant-based component APIs
- **Date-fns**: Date manipulation and formatting utilities

### Real Estate Data Sources
- **RERA Portals**: Government registry data for project verification
- **Builder APIs**: Direct integration with builder inventory systems
- **Market Data Providers**: External services for pricing and trend analysis
- **Legal Document Services**: Third-party integrations for document verification

### Communication and Notifications
- **WhatsApp Business API**: Property inquiry and appointment notifications
- **SMS Gateway**: Backup communication channel for critical updates
- **Email Services**: Property alerts and document delivery

The architecture prioritizes scalability, type safety, and user experience while maintaining compliance with Indian real estate regulations and RERA requirements.