# Verse Device Patterns

## 1) One-shot interaction
Use for single-use buttons or triggers.

- Disable device after interaction.
- Optionally re-enable after cooldown.

## 2) Loop with cooldown
Use for repeatable actions.

- `loop:` await an event, handle it, then `Sleep()`.

## 3) Find by tag
Use for bulk wiring or group behavior.

- `FindCreativeObjectsWithTag(MyTag{})`
- Cast to the target device type inside the loop.

## 4) Spawned background task
Use for continuous systems (weather, timed phases).

- Start in `OnBegin` with `spawn:`.
