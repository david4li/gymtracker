# RLS regression check

Row-level security is the security boundary of this app: the API relies on it entirely
instead of hand-written `where user_id = ...` clauses. This script proves it still holds.

It creates two throwaway users, asserts they cannot see or modify each other's data, checks
that global exercises are readable but not writable, confirms the one-active-workout
constraint, and deletes the users afterwards.

Run it after any change to `supabase/migrations/`.

```
SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... SUPABASE_SECRET_KEY=... npm run verify -w @gymtracker/verify-rls
```

Requires the secret key, because it uses the auth admin API to create and delete test users.
