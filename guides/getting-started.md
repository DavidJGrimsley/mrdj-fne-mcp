# Getting Started with Verse

## What is Verse?

Verse is a programming language developed by Epic Games for creating gameplay experiences in Fortnite Creative and Unreal Editor for Fortnite (UEFN). It's designed to be:

- **Safe**: Prevents common programming errors at compile time
- **Concurrent**: Built-in support for async/parallel execution
- **Functional**: Supports functional programming paradigms
- **Accessible**: Easy to learn for beginners while powerful for experts

## Prerequisites

Before you start with Verse, you'll need:

1. **Unreal Editor for Fortnite (UEFN)** - Download from Epic Games Launcher
2. **Epic Games Account** - Required to publish experiences
3. **Basic Programming Knowledge** - Helpful but not required

## Your First Verse Project

### 1. Create a New Project

1. Open UEFN
2. Click "Create New Project"
3. Choose a template or start blank
4. Name your project

### 2. Create a Verse Device

1. In the Content Browser, right-click in your project folder
2. Select "Verse" → "Add Verse File"
3. Name your file (e.g., `my_device.verse`)

### 3. Write Your First Code

```verse
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

my_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        Print("Hello, Verse!")
```

### 4. Compile and Test

1. Save your file (Ctrl+S)
2. UEFN will automatically compile your code
3. Check the Output Log for errors
4. Place your device in the level
5. Play your game to see the output

## Basic Concepts

### Variables

Verse uses `:=` for mutable variables and `=` for immutable values:

```verse
# Mutable variable (can be changed)
var MyScore:int = 0

# Immutable value (cannot be changed)
MaxPlayers:int = 16
```

### Functions

Functions in Verse use `<>` for specifiers and `():returnType=` syntax:

```verse
# Simple function
GetPlayerScore(Player:player):int=
    100

# Suspending function (can wait/async)
WaitAndPrint()<suspends>:void=
    Sleep(2.0)
    Print("2 seconds have passed!")
```

### Classes and Devices

Devices are classes that inherit from `creative_device`:

```verse
my_game := class(creative_device):
    
    # Device properties
    @editable
    StartDelay:float = 3.0
    
    # Called when the device is initialized
    OnBegin<override>()<suspends>:void=
        Sleep(StartDelay)
        Print("Game started!")
```

## Common Patterns

### Using Devices

```verse
using { /Fortnite.com/Devices }

my_device := class(creative_device):
    
    @editable
    MyButton:button_device = button_device{}
    
    OnBegin<override>()<suspends>:void=
        MyButton.InteractedWithEvent.Subscribe(OnButtonPressed)
    
    OnButtonPressed(Agent:agent):void=
        Print("Button was pressed!")
```

### Player Management

```verse
using { /Fortnite.com/Characters }
using { /Fortnite.com/Game }

my_device := class(creative_device):
    
    OnBegin<override>()<suspends>:void=
        AllPlayers := GetPlayspace().GetPlayers()
        for (Player : AllPlayers):
            if (FortCharacter := Player.GetFortCharacter[]):
                Print("Found player character")
```

### Async Operations

```verse
# Suspending function
DoSequence()<suspends>:void=
    Print("Step 1")
    Sleep(1.0)
    Print("Step 2")
    Sleep(1.0)
    Print("Step 3")

# Using race (first to complete wins)
WaitForEvent()<suspends>:void=
    race:
        MyButton.InteractedWithEvent.Await()
        Sleep(10.0)
    Print("Either button was pressed or 10 seconds passed")
```

## Next Steps

1. Read the **Verse Syntax Guide** for detailed language features
2. Check **Verse API Reference** for available APIs
3. Review **Best Practices** for writing clean code
4. Explore **Device Reference** for common devices

## Useful Resources

- Official Verse Documentation: https://dev.epicgames.com/documentation/verse
- Fortnite Creative Documentation: https://dev.epicgames.com/documentation/fortnite-creative
- UEFN Documentation: https://dev.epicgames.com/documentation/uefn

## Common Issues

### Compilation Errors

- Check for syntax errors (missing colons, parentheses)
- Ensure all imports are correct
- Verify device references are set in the editor

### Runtime Issues

- Use `Print()` for debugging
- Check the Output Log in UEFN
- Ensure devices are placed in the level
- Verify event subscriptions are set up correctly

## Tips for Success

1. **Start Small**: Begin with simple scripts and gradually add complexity
2. **Use Print()**: Debug by printing values and execution flow
3. **Read Errors**: Verse has helpful error messages - read them carefully
4. **Experiment**: The best way to learn is by trying things out
5. **Ask for Help**: Join the UEFN community forums and Discord
