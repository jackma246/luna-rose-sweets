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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Customer photo retention

Inspiration photos belong to the customer and are only needed while an order is being made. They are deleted automatically.

- **Finished orders**: photos deleted **7 days** after the order reaches a terminal status (`completed` / `cancelled`).
- **Abandoned orders**: if an order never reaches a terminal status, photos are deleted **30 days** after its pickup date - so a forgotten order doesn't keep someone's photos forever.
- Orders with no pickup date that were never completed are left alone deliberately; they need a human, not a timer.

Both the database rows and the files on disk are removed (`purgeOrderImages`).

Endpoint: `GET /api/cron/purge-images` (add `?dry=1` to report without deleting).
Auth: `Authorization: Bearer $CRON_SECRET`, same as the reminders cron.
Tuning: `PHOTO_RETENTION_DAYS` (default 7), `PHOTO_STALE_DAYS` (default 30).

Schedule it on Railway as a cron service hitting the endpoint daily. Run it once with `?dry=1` first and read the `detail` array before letting it delete anything.
