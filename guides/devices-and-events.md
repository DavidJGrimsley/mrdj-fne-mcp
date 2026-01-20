# Devices & Events Checklist

Use this as a quick checklist when building Verse devices.

## Checklist
- [ ] Device class extends `creative_device`.
- [ ] All `@editable` fields are wired in the editor.
- [ ] Event subscriptions are set in `OnBegin`.
- [ ] Any `Sleep()` / `Await()` is inside `<suspends>`.
- [ ] Cooldown logic uses `Sleep()` to avoid hot loops.
- [ ] Debug `Print()` is removed or gated when shipping.

## Common event patterns
- `Button.InteractedWithEvent.Subscribe(Handler)`
- `Switch.TurnedOnEvent.Subscribe(Handler)`
- `Device.SpawnedEvent.Subscribe(Handler)`
