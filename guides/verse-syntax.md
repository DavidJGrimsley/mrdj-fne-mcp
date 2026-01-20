# Verse Syntax Guide

## Table of Contents

1. [Comments](#comments)
2. [Variables and Constants](#variables-and-constants)
3. [Data Types](#data-types)
4. [Functions](#functions)
5. [Classes and Devices](#classes-and-devices)
6. [Control Flow](#control-flow)
7. [Collections](#collections)
8. [Concurrency](#concurrency)
9. [Error Handling](#error-handling)
10. [Specifiers](#specifiers)

## Comments

```verse
# Single-line comment

#|
   Multi-line comment
   Can span multiple lines
|#
```

## Variables and Constants

### Immutable Values (Constants)

Use `=` for values that won't change:

```verse
MaxHealth:int = 100
GameName:string = "My Game"
Pi:float = 3.14159
```

### Mutable Variables

Use `:=` for variables that can change:

```verse
var CurrentScore:int = 0
var PlayerName:string = "Unknown"
var IsGameActive:logic = false
```

### Variable Assignment

```verse
var Score:int = 0
set Score = 10        # Update the variable
set Score += 5        # Increment
set Score -= 2        # Decrement
set Score *= 2        # Multiply
set Score /= 2        # Divide
```

## Data Types

### Primitive Types

```verse
# Integer
MyInt:int = 42
NegativeInt:int = -10

# Float
MyFloat:float = 3.14
ScientificFloat:float = 1.5e-10

# Logic (boolean)
IsActive:logic = true
IsDisabled:logic = false

# String
MyString:string = "Hello, Verse!"
MultiLine:string = "Line 1\nLine 2"

# Void (no return value)
DoNothing():void = {}
```

### Optional Types

Use `?` to make a type optional:

```verse
# May or may not have a value
MaybePlayer:?player = false  # No value
MaybeScore:?int = option{100}  # Has value

# Unwrapping optionals
if (Player := MaybePlayer?):
    # Player is now unwrapped and usable
    Print("Found player")
```

### Arrays

```verse
# Array of integers
Numbers:[]int = array{1, 2, 3, 4, 5}

# Array of strings
Names:[]string = array{"Alice", "Bob", "Charlie"}

# Empty array
EmptyList:[]int = array{}

# Access elements
FirstNumber:int = Numbers[0]

# Get length
Count:int = Numbers.Length
```

### Maps

```verse
# Map from string to int
Scores:[string]int = map{
    "Player1" => 100,
    "Player2" => 150
}

# Access elements
PlayerScore:?int = Scores["Player1"]
```

### Tuples

```verse
# Tuple with mixed types
PlayerInfo:(string, int, logic) = ("Alice", 100, true)

# Access tuple elements
Name:string = PlayerInfo(0)
Score:int = PlayerInfo(1)
IsActive:logic = PlayerInfo(2)
```

## Functions

### Basic Functions

```verse
# Simple function
Add(A:int, B:int):int=
    A + B

# Function with multiple statements
CalculateTotal(Base:int, Multiplier:int):int=
    Result := Base * Multiplier
    Result + 10

# Function with no return value
PrintMessage(Message:string):void=
    Print(Message)
```

### Function Specifiers

```verse
# Suspending function (can use async operations)
WaitAndExecute()<suspends>:void=
    Sleep(2.0)
    Print("Done waiting")

# Transactional function (can fail)
TryDamagePlayer(Player:player)<transacts>:void=
    # Can fail if player is invalid
    Player.Damage(10)

# Decidable function (always terminates)
IsEven(N:int)<decides>:logic=
    Mod(N, 2) = 0

# Combined specifiers
ProcessPlayer(Player:player)<suspends><transacts>:void=
    Sleep(1.0)
    Player.Damage(5)
```

### Lambda Functions

```verse
# Anonymous function
AddOne := (X:int):int => X + 1

# Used with higher-order functions
Numbers := array{1, 2, 3}
Doubled := for (N : Numbers) yield N * 2
```

## Classes and Devices

### Basic Class

```verse
player_data := class:
    Name:string
    Score:int

    # Constructor is implicit

    GetInfo():string=
        "{Name}: {Score} points"
```

### Creative Device Class

```verse
my_game_device := class(creative_device):

    # Editable properties (visible in UEFN editor)
    @editable
    GameDuration:float = 60.0

    @editable
    StartButton:button_device = button_device{}

    # Private fields
    var GameActive:logic = false

    # OnBegin is called when device is initialized
    OnBegin<override>()<suspends>:void=
        StartButton.InteractedWithEvent.Subscribe(OnStartPressed)

    # Event handler
    OnStartPressed(Agent:agent):void=
        set GameActive = true
        Print("Game started!")

    # Custom method
    EndGame():void=
        set GameActive = false
        Print("Game ended!")
```

### Inheritance

```verse
base_weapon := class:
    Damage:int

    Fire():void=
        Print("Firing weapon")

pistol := class(base_weapon):
    # Override parent method
    Fire<override>():void=
        Print("Firing pistol")
        # Call parent implementation
        super.Fire()
```

## Control Flow

### If Statements

```verse
# Simple if
if (Score > 100):
    Print("High score!")

# If-else
if (Score > 100):
    Print("High score!")
else:
    Print("Keep trying!")

# If with unwrapping
if (Player := GetPlayer[]):
    Print("Player found")
else:
    Print("No player")
```

### For Loops

```verse
# Loop over array
Players := GetPlayers()
for (Player : Players):
    Print(Player.Name)

# Loop with index
for (Index := 0..10):
    Print("Count: {Index}")

# Loop with range
for (I := 1..=5):  # 1 to 5 inclusive
    Print("Number: {I}")

# Loop with step
for (I := 0..10, I += 2):
    Print("Even: {I}")
```

### Comprehensions

```verse
# Array comprehension
Numbers := array{1, 2, 3, 4, 5}
Doubled := for (N : Numbers) yield N * 2

# Filtered comprehension
EvenNumbers := for (N : Numbers, Mod(N, 2) = 0) yield N

# Map comprehension
Scores := map{"Alice" => 100, "Bob" => 150}
Names := for (Key->Value : Scores) yield Key
```

### Block Expressions

```verse
# Block returns the last expression
Result := block:
    X := 10
    Y := 20
    X + Y  # This value is returned

# Conditional blocks
Value := if (Condition):
    then: 100
    else: 200
```

## Collections

### Arrays

```verse
# Create array
Numbers:[]int = array{1, 2, 3}

# Add elements (creates new array)
MoreNumbers:[]int = Numbers + array{4, 5}

# Access elements
First:int = Numbers[0]

# Get optional element
MaybeElement:?int = Numbers[10]  # Out of bounds returns false

# Slice
Subset:[]int = Numbers[1..3]  # Elements 1 and 2

# Length
Size:int = Numbers.Length
```

### Maps

```verse
# Create map
Scores:[string]int = map{
    "Alice" => 100,
    "Bob" => 150
}

# Access (returns optional)
AliceScore:?int = Scores["Alice"]

# Add/update
NewScores:[string]int = Scores + map{"Charlie" => 200}

# Remove
UpdatedScores:[string]int = Scores - array{"Bob"}
```

### Sets (Arrays without duplicates)

```verse
# Create set using array
UniqueNumbers:[]int = array{1, 2, 3, 2, 1}  # Still has duplicates in Verse

# Remove duplicates manually
Numbers := array{1, 2, 3, 2, 1}
var UniqueSet:[]int = array{}
for (N : Numbers):
    if (not HasElement(UniqueSet, N)):
        set UniqueSet += array{N}
```

## Concurrency

### Suspending Functions

```verse
# Basic suspension
DoWork()<suspends>:void=
    Print("Starting")
    Sleep(2.0)
    Print("Done")

# Wait for event
WaitForButton()<suspends>:void=
    ButtonEvent.Await()
    Print("Button pressed!")
```

### Sync and Race

```verse
# sync - wait for all to complete
DoParallel()<suspends>:void=
    sync:
        Task1()
        Task2()
        Task3()
    Print("All tasks done")

# race - first to complete wins
WaitForFirst()<suspends>:void=
    race:
        WaitForButton()
        Sleep(10.0)
    Print("Either button pressed or timeout")

# branch - run in parallel, don't wait
DoBranch()<suspends>:void=
    branch:
        LongRunningTask()
    Print("Continued immediately")
```

### Spawn

```verse
# Spawn detached concurrent task
StartBackgroundTask()<suspends>:void=
    spawn:
        loop:
            Sleep(1.0)
            Print("Background tick")
```

### Loop

```verse
# Infinite loop
RunForever()<suspends>:void=
    loop:
        Sleep(1.0)
        DoSomething()

# Break from loop
FindPlayer()<suspends>:void=
    loop:
        Sleep(0.5)
        if (Player := GetPlayer[]):
            break
    Print("Player found!")
```

## Error Handling

### Failable Context

```verse
# Function that can fail
DamagePlayer(Player:player)<transacts>:void=
    # Fails if player is invalid
    Player.Damage(10)

# Calling failable function
ProcessPlayers(Players:[]player)<transacts>:void=
    for (Player : Players):
        # This can fail
        DamagePlayer(Player)
```

### If-Fails Expression

```verse
# Try operation, use default if fails
GetPlayerHealth(Player:player):int=
    if (Character := Player.GetFortCharacter[]):
        then: Character.GetHealth()
        else: 0
```

### Optionals

```verse
# Use ? for optional returns
FindPlayer(Name:string):?player=
    AllPlayers := GetPlayers()
    for (Player : AllPlayers):
        if (Player.Name = Name):
            return option{Player}
    # Return no value
    false

# Unwrap optional
if (Player := FindPlayer("Alice")?):
    Print("Found: {Player.Name}")
```

## Specifiers

### Function Specifiers

- `<suspends>` - Function can suspend (async operations)
- `<transacts>` - Function can fail
- `<decides>` - Function always terminates and returns logic
- `<computes>` - Function is pure (no side effects)
- `<override>` - Overrides parent class method
- `<final>` - Prevents overriding in subclasses
- `<public>` - Accessible from other modules
- `<private>` - Only accessible within same class
- `<internal>` - Accessible within same module

### Variable Specifiers

- `var` - Mutable variable
- `@editable` - Visible and editable in UEFN editor
- `<public>` - Accessible from outside
- `<private>` - Only accessible within class

## Advanced Features

### String Interpolation

```verse
Name := "Alice"
Score := 100
Message:string = "{Name} scored {Score} points!"
```

### Pattern Matching (Limited)

```verse
# Using if with optional unwrapping for type checking
ProcessValue(Value:?int):void=
    if (IntValue := Value?):
        Print("It's an int: {IntValue}")
    else:
        Print("Not an int or no value")
```

### Modules and Using

```verse
# Import from modules
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

# Import specific items
using { /Fortnite.com/Characters/fort_character }
```

## Best Practices

1. **Use Immutable Values**: Prefer `=` over `:=` when values don't change
2. **Type Annotations**: Always specify types explicitly
3. **Meaningful Names**: Use descriptive variable and function names
4. **Handle Optionals**: Always check optionals before using
5. **Async Properly**: Use `<suspends>` for any async operations
6. **Comment Complex Logic**: Use comments to explain non-obvious code
7. **Keep Functions Small**: Break large functions into smaller ones
8. **Use Specifiers**: Properly mark functions with correct specifiers

## Common Pitfalls

1. **Forgetting <suspends>**: Sleep() and Await() require <suspends>
2. **Not Checking Optionals**: Always unwrap optionals with `?` or `[]`
3. **Mutability Errors**: Using `=` when you need `:=`
4. **Type Mismatches**: Verse is strictly typed - types must match
5. **Infinite Loops**: Make sure loops have exit conditions
6. **Race Conditions**: Be careful with concurrent code
