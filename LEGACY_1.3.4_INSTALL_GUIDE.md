# OperationsLogs Legacy v1.3.4

This is the clean iOS 10.3.4 release.

## Installation

1. Upload all files to the separate OperationsLogs-Legacy GitHub Pages repository.
2. Open the Legacy address in a normal Safari tab.
3. Do not use Private Browsing.
4. Add the page to the Home Screen.
5. Open the Home Screen icon.
6. Give the device a friendly name.
7. Approve it from a modern administrator device.

## Behaviour

- Operators do not sign in.
- The device creates and stores its own anonymous Supabase session.
- Administrator sign-in uses the same credentials as the standard app.
- Synchronisation uses periodic checks and may take up to about 30 seconds.
- The same Supabase project and database are used.

## Private Browsing

If Safari storage is unavailable, the app displays:

`PRIVATE BROWSING IS ENABLED OR SAFARI STORAGE IS UNAVAILABLE.`

Open OperationsLogs in a normal Safari tab and add it to the Home Screen again.

No Supabase SQL changes are required.
