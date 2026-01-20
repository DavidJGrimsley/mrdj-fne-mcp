# Devices & Gameplay Patterns

Practical patterns for building reusable Verse devices.

## Composition over monoliths
- Build smaller devices that do one thing well.
- Compose behaviors by wiring devices together in the editor.

## Event-driven design
- Subscribe to events rather than polling.
- Use `Await()` for one-off waits and `Subscribe()` for ongoing event handling.

## Cooldowns and timers
- Centralize cooldown logic in a dedicated function.
- Use `Sleep()` in `<suspends>` functions for delay behavior.

## Tags for groups
- Tag devices or props by purpose (e.g., `SnowButton{}` or `LootSpawner{}`).
- Iterate through tagged groups to apply consistent behavior.

## Gameplay safety
- Always check optional values before use.
- Validate `@editable` device references.
- Prefer small, focused helper functions.
