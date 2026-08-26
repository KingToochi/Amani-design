# Backend

The backend is an Express application using ES modules and MongoDB.

## Run locally

1. Copy `.env.example` to `.env` and provide the required values.
2. Install dependencies with `npm install`.
3. Start the API with `npm run dev` or `npm start`.

The HTTP and Socket.IO server listens on port `4000` by default. Set `PORT` to override it.

## Layout

- `src/app.js`: Express middleware and routes.
- `src/server.js`: database connection and HTTP server startup.
- `src/models`: Mongoose models.
- `src/modules`: domain-specific application logic.
- `src/integrations`: external payment and media providers.
- `src/config`: infrastructure configuration.
- `src/middleware`: reusable request middleware.
- `tests`: automated tests.