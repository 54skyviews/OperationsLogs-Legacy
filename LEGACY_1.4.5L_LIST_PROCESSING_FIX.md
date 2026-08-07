# OperationsLogs Legacy v1.4.5L — iOS 10 List Processing Fix

This Legacy-only release corrects the root cause of the empty list selectors.

## Root cause

The transpiled Legacy build used:

`__spreadArray([], new Set(...), true)`

to clean and de-duplicate master-list values.

That construct is valid in the modern Standard build, but the ES5 helper generated
for Legacy treats `Set` as though it were an array-like object. On old Safari /
iOS 10 this produces an empty array.

As a result, pilots, gliders, tugs and payees could be present in `data-legacy.js`
and/or IndexedDB but were reduced to empty arrays before being displayed.

## Correction

- Replaced Set/spread de-duplication with a plain ES5 object-and-array routine.
- Retained upper-case normalization and duplicate removal.
- Added a final fallback to the packaged embedded lists if any operational list
  is unexpectedly empty.
- Retained the iOS-10 native selectors.
- Retained the corrected SOLO confirmation dialog.

Standard OperationsLogs v1.4.8 is completely unaffected.
No Supabase SQL change is required.
