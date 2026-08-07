# OperationsLogs Legacy v1.4.2L — Master List Fix

This is a Legacy-only maintenance release for iOS 10.3.4.

Changes:
- Reads pilot, glider, tug aircraft, tug pilot and payee lists using a direct
  authenticated Supabase REST request through XMLHttpRequest.
- Refreshes the HTML datalists immediately after the cloud values are received.
- Repeats the list refresh once after Legacy startup/approval.
- Preserves existing local lists if a cloud list is unexpectedly empty.
- Does not change Standard OperationsLogs.
- Does not change flight, Ready Queue, landing or synchronisation behaviour.
- No Supabase SQL changes are required.

Test:
1. Upload all Legacy v1.4.2L files to the Legacy GitHub repository.
2. Open the old iPad in a normal (not Private) Safari session.
3. Wait up to 30 seconds after ONLINE/SYNCED.
4. Open a Winch entry and confirm Glider, P1/P2 and Payee lists appear.
5. Open Aerotow and confirm Tug Aircraft and Tug Pilot lists appear.
