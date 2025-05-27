# Lakers Project

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

## Deployment

The application is configured for deployment on Vercel: