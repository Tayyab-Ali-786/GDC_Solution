# Hackathon Solution: Founder Brain

This repository contains the hackathon solution aimed at closing the "Coordination Gap" for early-stage founding teams. 

## Project Structure

- `/web` - The Next.js web application containing the frontend and the Gemini API logic.
- `/docs` - (Optional) Documentation, PDFs, and assets.

## Getting Started

1. Navigate to the web directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Ensure you have a `.env.local` file in the `/web` directory with the following variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `GEMINI_API_KEY`
