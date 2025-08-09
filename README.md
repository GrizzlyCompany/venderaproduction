n# VENDRA - Real Estate Marketplace

This is a Next.js application built with Firebase Studio, creating a modern and interactive real estate marketplace called VENDRA.

## Overview

VENDRA allows users to browse property listings, create accounts, save their favorite properties, and interact with sellers. It features a clean, responsive design built with ShadCN UI and Tailwind CSS, and leverages Genkit for AI-powered features like property description generation and a chat assistant.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **AI/Generative**: Firebase Genkit
- **Authentication**: Firebase Auth

## Project Structure

Here is a summary of the main files and folders in this project:

- **/src/app/**: The main application directory using Next.js App Router.
  - **/(main)/**: Main application routes that share a common layout (header, footer).
    - **/favorites/**: Page to display the user's saved properties.
    - **/messages/**: Page for users to view and manage their conversations with sellers.
    - **/profile/[id]/**: Dynamic user profile page.
    - **/properties/[id]/**: Dynamic page for viewing property details.
    - **/properties/new/**: Page for users to list a new property.
    - **/search/**: Page to display search results.
    - **page.tsx**: The home page of the application.
    - **layout.tsx**: The shared layout for the main application pages.
  - **/login/**: Page for user login.
  - **/signup/**: Page for user registration.
  - **globals.css**: Global stylesheet and Tailwind CSS theme configuration.
  - **layout.tsx**: The root layout for the entire application.

- **/src/ai/**: Contains all Genkit-related AI flows and configuration.
  - **/flows/**: Holds the specific AI-powered features.
    - `property-description-generator.ts`: Generates property descriptions.
    - `similar-property-suggestions.ts`: Suggests similar properties.
    - `chat-assistant.ts`: Powers the seller-buyer chat.
  - **genkit.ts**: Genkit initialization and configuration.

- **/src/components/**: Reusable React components.
  - **/chat/**: Components for the chat interface.
  - **/layout/**: Components for the overall page structure (Header, Footer, etc.).
  - **/properties/**: Components related to property listings and search.
  - **/ui/**: Core UI components from ShadCN (Button, Card, etc.).
  - **/users/**: Components for displaying user information.

- **/src/context/**: React Context providers for global state management.
  - `AuthContext.tsx`: Manages user authentication state.
  - `FavoritesContext.tsx`: Manages the user's list of favorite properties.
  - `LanguageContext.tsx`: Manages language and translations.

- **/src/hooks/**: Custom React hooks for shared logic.
  - `useAuth.ts`: Simplified access to the AuthContext.
  - `useFavorites.ts`: Simplified access to the FavoritesContext.
  - `usePropertyStore.ts`: Manages property data using Zustand.
  - `useToast.ts`: Hook for displaying notifications.
  - `useTranslation.ts`: Hook for handling app translations.

- **/src/lib/**: Utility functions, Firebase configuration, and mock data.
  - `firebase.ts`: Firebase initialization.
  - `mock-data.ts`: Contains all the sample data for properties, users, and conversations.
  - `utils.ts`: Utility functions, like `cn` for merging CSS classes.

- **/src/locales/**: JSON files for internationalization (i18n).

- **/public/**: Static assets (like images or fonts) would go here.

- **package.json**: Lists all project dependencies and scripts.
- **tailwind.config.ts**: Configuration file for Tailwind CSS.
- **next.config.ts**: Configuration file for Next.js.
