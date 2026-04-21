This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://your-database-url
JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_APP_NAME=IPT One Telecoms
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For Coolify deployment, set these environment variables in your Coolify project settings:

- `DATABASE_URL`: Your PostgreSQL database connection string (must include SSL parameters for Neon)
- `JWT_SECRET`: A secure JWT secret key (use a long random string)
- `NEXT_PUBLIC_APP_NAME`: "IPT One Telecoms"
- `NEXT_PUBLIC_APP_URL`: Your Coolify deployment URL (e.g., `https://your-app.coolify.io`)
- `NODE_ENV`: production

## Deploy on Coolify

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. In your Coolify dashboard at `http://102.130.127.191:8000/`, create a new project
3. Add your Git repository as a source
4. Coolify will automatically detect the Dockerfile and build the application
5. Set the following environment variables in Coolify:
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `JWT_SECRET`: A secure JWT secret key
   - `NEXT_PUBLIC_APP_NAME`: "IPT One Telecoms"
   - `NEXT_PUBLIC_APP_URL`: Your deployment URL
   - `NODE_ENV`: production

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
