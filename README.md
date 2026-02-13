# TestimonialsLo Backend

Backend repository for [TestimonialsLo](https://github.com/SiddhantKanawade30/testimonialslo) - a testimonial collection platform that helps businesses gather, manage, and showcase customer testimonials.

## Features

- User authentication with Google OAuth
- Campaign and testimonial management
- RESTful API with JWT authentication
- PostgreSQL database with Prisma ORM

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Frontend application URL
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Tech Stack

- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Google OAuth 2.0
