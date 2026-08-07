# OperationsLogs Legacy v1.4.3L

Legacy-only iOS 10 compatibility release.

## List selection

iOS 10 Safari does not reliably support HTML `<datalist>` controls. The Legacy
edition therefore now shows a native drop-down selector below each list-backed
text field:

- Glider
- P1
- P2 (including SOLO)
- Payee
- Tug Aircraft
- Tug Pilot

Selecting a value copies it into the normal text field. The text field remains
editable, so an unlisted/manual value can still be entered.

The existing cloud list download and local list cache remain in place.

## SOLO confirmation

The YES / NO confirmation dialog now uses a very high fixed z-index so it opens
above the flight-entry screen on old Safari.

## Scope

This release changes Legacy only. Standard v1.4.8 is unaffected.
No Supabase SQL change is required.
