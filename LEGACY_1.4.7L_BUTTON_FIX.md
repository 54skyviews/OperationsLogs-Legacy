# OperationsLogs Legacy v1.4.7L — Button Reliability

Legacy-only maintenance release.

Ported from the proven Standard v1.4.7 button fixes:

- Flight-entry TAKE OFF NOW now fills the current take-off time.
- Flight-entry LAND NOW now fills the current landing time and recalculates duration.
- Ready Queue TAKE OFF NOW stores AIRBORNE locally first, then uploads/synchronises.
- Airborne LAND NOW uses robust button detection.
- Airborne ENTER TIME uses robust button detection.
- Old-Safari-safe parent traversal is used instead of relying on modern event-target behaviour.

The working custom full-screen list picker and SOLO dialog fixes are retained.

Standard OperationsLogs v1.4.8 is completely unaffected.
No Supabase SQL change is required.
