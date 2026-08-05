# OperationsLogs Legacy v1.3.0 — iOS 10.3.4

This is a separate legacy build for old Apple devices.

## Address

Publish this build at a separate GitHub Pages path, for example:

`https://YOUR-USERNAME.github.io/OperationsLogs-Legacy/`

Do not overwrite the standard OperationsLogs repository.

## Sign-in and approval

Normal launch-point operators do not sign in.

On first opening, the device creates its own background Supabase session and asks
for a device name. An administrator approves it in the normal OperationsLogs
Administration screen.

Administrator sign-in uses the same email address and password as the standard app.

## Synchronisation

iOS 10 does not support the modern browser facilities used by the standard build.
The Legacy edition checks Supabase periodically instead of receiving instant
Realtime events. Allow up to approximately 30 seconds for changes from another
device to appear.

## Offline use

The Legacy edition uses the older HTML Application Cache supported by iOS 10.
Open the site online at least once and leave it open for one minute before adding
it to the Home Screen.

## Installation on iOS 10

1. Open the Legacy GitHub Pages address in Safari.
2. Wait until the app displays and shows its connection status.
3. Tap Share.
4. Tap Add to Home Screen.
5. Open the new OperationsLogs Legacy icon.
6. Give the device a friendly name.
7. Approve it from an administrator device.

## Limitations

- Synchronisation is periodic, not instant.
- The legacy browser does not support service workers.
- Excel export depends on the older SheetJS library loading successfully.
- The device must still support the current HTTPS certificates used by GitHub and Supabase.
- iOS 10 is no longer security-supported by Apple; use the device only as a
  dedicated club terminal and do not store unrelated sensitive information on it.
