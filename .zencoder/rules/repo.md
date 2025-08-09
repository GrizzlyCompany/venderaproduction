---
description: Repository Information Overview
alwaysApply: true
---

# VENDRA - Real Estate Marketplace Information

## Summary
VENDRA is a modern real estate marketplace built with Next.js, allowing users to browse property listings, create accounts, save favorites, and interact with sellers. It features a responsive design with ShadCN UI and Tailwind CSS, and leverages Genkit for AI-powered features like property description generation and chat assistance.

## Structure
- **/src/app/**: Main application using Next.js App Router
- **/src/ai/**: Genkit-related AI flows and configuration
- **/src/components/**: Reusable React components
- **/src/context/**: React Context providers for state management
- **/src/hooks/**: Custom React hooks
- **/src/lib/**: Utility functions and services
- **/src/locales/**: Internationalization files
- **/supabase/**: Database migrations and configuration

## Language & Runtime
**Language**: TypeScript
**Version**: ES2017 target
**Framework**: Next.js 15.x
**Build System**: Next.js built-in
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- Next.js (^15.4.5) - React framework
- React (^18.3.1) - UI library
- Supabase - Backend and authentication
- Genkit (^1.14.1) - AI integration
- Tailwind CSS (^3.4.1) - Styling
- Radix UI - Component primitives
- Zustand (^4.5.4) - State management
- Zod (^3.23.8) - Schema validation
- Mapbox GL (^3.14.0) - Map integration

**Development Dependencies**:
- TypeScript (^5)
- Supabase CLI (^2.31.8)
- Various type definitions

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run AI development server
npm run genkit:dev
```

## Database
**Provider**: Supabase
**Configuration**: Environment variables in .env.local
**Migrations**: Located in /supabase/migrations/
**Schema**: SQL migrations for user profiles, properties, and storage buckets

## Main Files & Resources
**Entry Point**: src/app/layout.tsx (Root layout)
**Main Routes**:
- src/app/(main)/page.tsx (Home page)
- src/app/login/ (Authentication)
- src/app/signup/ (Registration)
- src/app/(main)/properties/ (Property listings)

**Configuration Files**:
- next.config.ts - Next.js configuration
- tailwind.config.ts - Tailwind CSS theme
- tsconfig.json - TypeScript settings

## Progressive Web App
**Enabled**: Yes, using next-pwa
**Configuration**: Service worker with offline caching
**Manifest**: public/manifest.json