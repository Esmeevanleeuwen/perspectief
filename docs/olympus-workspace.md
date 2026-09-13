# Sidebar shared with Olympus

The admin layout now uses `@olympus/workspace-ui`. Account and public-page layouts keep their existing components. Meridian supplies its own menu, brand and theme in `src/components/admin/SharedAdminShell.tsx` and `src/app/admin/shared-sidebar.css`.

In Olympus, open **Platformfuncties**, sign in with the Meridian owner account, and choose whether Meridian can use sidebar width settings, menu search and personal shortcuts. The switches are read from the existing Supabase project; open admin pages refresh them every 20 seconds and on focus. Database policies reject disabled preference writes immediately, including direct API requests. Enabling a feature never gives a user an editorial role.

## Updating the package

The source lives in `Esmeevanleeuwen/olympus/packages/workspace-ui`. `vendor/olympus-workspace-ui` is an automatically managed package snapshot, with its immutable source commit and file hashes in `SOURCE.json`. Do not edit it by hand.

Run `npm run sync:workspace`, then `npm install`, `npm run test:workspace`, and `npm run build` to update manually. The `Update shared Olympus workspace` GitHub Actions workflow performs the same process on a 15-minute schedule and commits successful updates to main, which triggers the existing Vercel deployment. Scheduled jobs can be delayed by GitHub. Major version changes stop for compatibility review. No force pushes are used.

The new database tables and policies are migrated from Olympus; do not apply a second duplicate migration from Meridian. The registration process for new capabilities and the database access tests live in Olympus `docs/SHARED_WORKSPACE.md`.
