# Verse Language Basics

This is a practical, short reference for common Verse language concepts.

## Core syntax
- **Modules**: `using { /Fortnite.com/Devices }`
- **Classes**: `my_device := class(creative_device):`
- **Functions**: `DoThing(Agent: agent):void=`
- **Suspending functions**: `OnBegin<override>()<suspends>:void=`
- **Properties**: `@editable` exposes fields to the UEFN editor.

## Types you’ll see often
- `agent`, `player`, `fort_character`
- Device types like `button_device`, `item_granter_device`, `vfx_spawner_device`
- `string`, `int`, `float`, `logic`, `[]T` (array)

## Control flow
- `if` / `else`
- `loop:` for repeating logic
- `for (Item : Items)` for iteration
- `race:` to run concurrent branches and finish on the first completed branch
- `spawn:` to run concurrent work without blocking

## Events and async
- Most device interactions emit events you can `Subscribe` to or `Await`.
- Example: `Button.InteractedWithEvent.Subscribe(HandlePress)`
- Use `<suspends>` on functions that call `Sleep`, `Await`, or run `race` blocks.

## Strings and localization
- Use `message` for player-facing text when possible.
- Convert with helpers like `StringToMessage` as needed.

## Useful reading
- Verse Language Reference: https://dev.epicgames.com/documentation/en-us/fortnite/verse-language-reference
- Verse Quick Reference: https://dev.epicgames.com/documentation/en-us/fortnite/verse-language-quick-reference
