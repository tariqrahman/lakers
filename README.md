# NBA Stats Application

A web application for viewing NBA draft picks and team information, built with React, Express, and PostgreSQL.

## Project Structure

- `frontend/`: React application built with Vite
- `backend/`: Express.js API server
- Database: PostgreSQL hosted on Neon

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (Neon)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=your_neon_database_url
   PORT=3001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Backend runs on: http://localhost:3001
- Frontend runs on: http://localhost:5173

## API Endpoints

- `GET /api/draft-picks`: Get all draft picks
- `GET /api/draft-picks/team/:teamId`: Get draft picks for a specific team
- `GET /api/team/:name`: Get team information by name

## Deployment

The application is configured for deployment on Vercel:

- Frontend: Static site deployment
- Backend: Serverless functions
- Database: Neon PostgreSQL 