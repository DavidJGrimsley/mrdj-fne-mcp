# Troubleshooting Verse in UEFN

## Event doesn’t fire
- Confirm the device is placed in the level.
- Ensure `@editable` references are assigned in the editor.
- Use `Print()` early in the handler to verify the subscription is wired.

## Device reference is empty
- Check the editor field is set.
- Prefer strongly typed fields (e.g., `button_device`) to avoid silent casts.

## Suspends errors
- Any function that calls `Sleep()` or `Await()` needs `<suspends>`.
- Keep async logic in separate helper functions when possible.

## Logic runs only once
- A `race` block ends when the first branch completes.
- Replace `race` with a `loop:` if you need continuous behavior.

## Helpful tools
- Childlike Verse playground: https://childlike-verse-lang.web.app/
- Epic Verse docs: https://dev.epicgames.com/documentation/en-us/fortnite/verse-language-reference
