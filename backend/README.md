# Careerak Backend

Express + MongoDB backend with auth endpoints.

Setup:

1. Copy `.env.example` to `.env` and adjust values.
2. Run `npm install` in `backend`.
3. Start with `npm run dev`.

Note: Do NOT commit your `.env` file or any secrets to source control. Keep credentials private.

Endpoints:
- `POST /api/auth/register` { name, email, password, role, interests }
- `POST /api/auth/login` { email, password }
