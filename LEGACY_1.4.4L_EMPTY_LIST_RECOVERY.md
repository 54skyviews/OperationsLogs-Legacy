# OperationsLogs Legacy v1.4.4L — Empty List Cache Recovery

This Legacy-only maintenance release addresses empty list selectors.

Root cause:
- Older Legacy attempts could write empty arrays into IndexedDB `masterLists`.
- Startup treated an existing empty array as authoritative.
- That empty array replaced the complete master lists embedded in `data-legacy.js`.
- The iOS-10-compatible selectors therefore had no options even though the
  application package already contained the lists.

Fix:
- Embedded master lists are copied before IndexedDB loading.
- An empty saved list is treated as invalid.
- Embedded values are restored immediately and written back to IndexedDB.
- A non-empty cloud result can still replace the local list normally.
- Cloud reads use the same Legacy Supabase query facade already used elsewhere.

The SOLO dialog stacking fix and iOS-10 native selectors remain.

Standard OperationsLogs is unaffected.
No Supabase SQL change is required.
