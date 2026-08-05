# OperationsLogs Legacy v1.3.3 — Startup Fix

Version 1.3.2 proved that the old iPad can create an anonymous Supabase session.
The HTTP 200 response and access token confirm that authentication works.

Version 1.3.3 removes the diagnostic variable error that stopped startup after
authentication and allows the app to continue to:

1. device registration;
2. device approval checking;
3. cloud data download;
4. sync queue processing.

No Supabase SQL change is required.

Upload all files over the existing Legacy GitHub Pages files, then reopen the app
on the iPad. If the device is new, give it a friendly name and approve it from a
modern administrator device.
