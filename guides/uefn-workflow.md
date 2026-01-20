# UEFN Workflow (Verse)

A lightweight workflow for building and testing Verse devices in UEFN.

## Typical loop
1. Create or edit a Verse file in your project.
2. Bind devices in the UEFN editor (place devices, set @editable references).
3. Run a session and validate behavior.
4. Iterate: tighten logic, add logs, and refine device setup.

## Editor wiring
- `@editable` fields appear in the editor details panel.
- Use descriptive property names so designers understand what to set.
- Prefer narrow device types (e.g., `button_device`) over generic `creative_device` for safety.

## Tags and discovery
- Use tags to locate groups of devices or props at runtime.
- Pattern: `FindCreativeObjectsWithTag(MyTag{})` and then cast to device types.

## Debugging
- Use `Print("...")` to verify events fire.
- Validate `@editable` references are set (they default to empty devices if not configured).
- Keep cooldowns short during iteration and tune later.

## Helpful links
- Programming with Verse (UEFN): https://dev.epicgames.com/documentation/en-us/fortnite/programming-with-verse-in-unreal-editor-for-fortnite
- Best practices thread: https://forums.unrealengine.com/t/how-to-write-verse-the-correct-way-best-practices/2116958
