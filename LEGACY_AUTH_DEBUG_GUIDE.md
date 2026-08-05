# OperationsLogs Legacy v1.3.2 — Authentication Debug

This build replaces the Legacy anonymous sign-in with a direct XMLHttpRequest
call to Supabase and displays the full HTTP status and response.

## Test

1. Upload all files over the existing Legacy GitHub Pages files.
2. Open the Legacy URL in Safari.
3. Wait for the diagnostic panel to stop.
4. Select **SHOW TECHNICAL DETAILS**.
5. Send screenshots showing:
   - the startup steps;
   - the red error box, if shown;
   - the HTTP request and response text.

Look for entries such as:

- `GET .../auth/v1/settings | HTTP ...`
- `POST .../auth/v1/signup | HTTP ...`
- `RESPONSE: {...}`

No Supabase SQL change is required.
