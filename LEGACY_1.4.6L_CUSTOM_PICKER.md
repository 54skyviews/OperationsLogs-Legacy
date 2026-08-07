# OperationsLogs Legacy v1.4.6L — Custom List Picker

The master-list data is now confirmed present, but iOS 10 Safari's native
`<select>` popup closes almost immediately in the OperationsLogs layout.

This Legacy-only release replaces the visible native selectors with a custom
full-screen picker:

1. Tap CHOOSE GLIDER / CHOOSE P1 / CHOOSE P2 / CHOOSE PAYEE / CHOOSE TUG /
   CHOOSE TUG PILOT.
2. A large scrollable list opens and remains on screen.
3. Tap the required value.
4. The chosen value is copied into the normal text field.
5. Press CANCEL to close without changing the field.

The original text boxes remain editable for manual or unlisted entries.

The hidden native selects remain populated only as a fallback.

Standard OperationsLogs v1.4.8 is untouched.
No Supabase SQL change is required.
