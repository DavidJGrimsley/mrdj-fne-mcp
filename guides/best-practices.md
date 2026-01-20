# Verse Best Practices

## Code Organization

### Structure Your Device Classes

```verse
# Good: Organized with clear sections
game_manager := class(creative_device):
    
    # ============= EDITABLE PROPERTIES =============
    @editable
    GameDuration:float = 300.0
    
    @editable
    StartButton:button_device = button_device{}
    
    # ============= PRIVATE STATE =============
    var GameActive:logic = false
    var StartTime:float = 0.0
    
    # ============= LIFECYCLE =============
    OnBegin<override>()<suspends>:void=
        Initialize()
    
    # ============= INITIALIZATION =============
    Initialize()<suspends>:void=
        StartButton.InteractedWithEvent.Subscribe(OnStartPressed)
        Print("Game Manager initialized")
    
    # ============= EVENT HANDLERS =============
    OnStartPressed(Agent:agent)<suspends>:void=
        StartGame()
    
    # ============= PUBLIC METHODS =============
    StartGame()<suspends>:void=
        set GameActive = true
        set StartTime = GetSimulationElapsedTime()
        RunGameLoop()
    
    # ============= PRIVATE METHODS =============
    RunGameLoop()<suspends>:void=
        loop:
            Sleep(1.0)
            if (not GameActive): break
            UpdateGame()
    
    UpdateGame():void=
        # Update game state
        {}
```

### Use Meaningful Names

```verse
# Bad: Unclear names
b:button_device = button_device{}
p:[]player = array{}
t:float = 10.0

# Good: Descriptive names
StartButton:button_device = button_device{}
ActivePlayers:[]player = array{}
RespawnDelay:float = 10.0
```

### Keep Functions Small

```verse
# Bad: One giant function
ProcessGame()<suspends>:void=
    AllPlayers := GetPlayspace().GetPlayers()
    for (Player : AllPlayers):
        if (Character := Player.GetFortCharacter[]):
            Health := Character.GetHealth()
            if (Health < 50):
                Character.Heal(25.0)
            else if (Health > 100):
                Character.Damage(10.0)
    Sleep(1.0)
    CheckWinCondition()
    UpdateScores()
    # ... etc

# Good: Break into smaller functions
ProcessGame()<suspends>:void=
    UpdatePlayers()
    Sleep(1.0)
    CheckGameState()

UpdatePlayers()<suspends>:void=
    AllPlayers := GetPlayspace().GetPlayers()
    for (Player : AllPlayers):
        UpdatePlayerHealth(Player)

UpdatePlayerHealth(Player:player)<suspends>:void=
    if (Character := Player.GetFortCharacter[]):
        BalanceHealth(Character)

BalanceHealth(Character:fort_character)<transacts>:void=
    Health := Character.GetHealth()
    if (Health < 50):
        Character.Heal(25.0)
    else if (Health > 100):
        Character.Damage(10.0)

CheckGameState():void=
    CheckWinCondition()
    UpdateScores()
```

## Immutability

### Prefer Immutable Values

```verse
# Good: Use = for constants
MaxPlayers:int = 16
GameName:string = "My Game"
SpawnDelay:float = 3.0

# Only use var when you need to change it
var CurrentRound:int = 0
var IsGameActive:logic = false
```

### Minimize Mutable State

```verse
# Bad: Too much mutable state
score_system := class:
    var Score1:int = 0
    var Score2:int = 0
    var Score3:int = 0
    var TotalScore:int = 0
    
    UpdateTotal():void=
        set TotalScore = Score1 + Score2 + Score3

# Good: Calculate on demand
score_system := class:
    var Score1:int = 0
    var Score2:int = 0
    var Score3:int = 0
    
    GetTotalScore():int=
        Score1 + Score2 + Score3
```

## Error Handling

### Always Check Optionals

```verse
# Bad: Assuming optional has value
ProcessPlayer(Player:player):void=
    Character := Player.GetFortCharacter[]  # Can fail!
    Health := Character.GetHealth()

# Good: Check before using
ProcessPlayer(Player:player):void=
    if (Character := Player.GetFortCharacter[]):
        Health := Character.GetHealth()
        Print("Health: {Health}")
    else:
        Print("Player has no character")
```

### Use Failable Context Appropriately

```verse
# Good: Mark transacts when operations can fail
DamagePlayer(Player:player)<transacts>:void=
    if (Character := Player.GetFortCharacter[]):
        Character.Damage(10.0)

# Call failable functions safely
TryDamageAllPlayers():void=
    AllPlayers := GetPlayspace().GetPlayers()
    for (Player : AllPlayers):
        # This might fail for some players
        DamagePlayer[Player]
```

### Validate Inputs

```verse
# Good: Validate before using
SetPlayerScore(Player:player, Score:int):void=
    # Validate score is reasonable
    if (Score >= 0, Score <= 10000):
        UpdateScore(Player, Score)
    else:
        Print("Invalid score: {Score}")

TeleportPlayer(Player:player, Position:vector3):void=
    # Validate player exists
    if (Character := Player.GetFortCharacter[]):
        # Teleport logic
        Print("Teleporting player")
```

## Concurrency

### Use Appropriate Concurrency Patterns

```verse
# sync: Wait for all tasks
RunParallelTasks()<suspends>:void=
    sync:
        Task1()
        Task2()
        Task3()
    Print("All tasks complete")

# race: First to complete
WaitForEvent()<suspends>:void=
    race:
        MyButton.InteractedWithEvent.Await()
        Sleep(10.0)
    Print("Button pressed or timeout")

# branch: Fire and forget
StartBackgroundTask()<suspends>:void=
    branch:
        RunInBackground()
    Print("Continued immediately")

# spawn: Detached task
StartIndependentTask()<suspends>:void=
    spawn:
        loop:
            Sleep(1.0)
            BackgroundWork()
```

### Avoid Race Conditions

```verse
# Bad: Potential race condition
game_manager := class(creative_device):
    var Score:int = 0
    
    IncrementScore()<suspends>:void=
        CurrentScore := Score
        Sleep(0.1)  # Oops! Another task might modify Score here
        set Score = CurrentScore + 1

# Good: Minimize time window
game_manager := class(creative_device):
    var Score:int = 0
    
    IncrementScore():void=
        set Score += 1  # Atomic operation
```

### Clean Up Async Tasks

```verse
# Good: Track and clean up tasks
task_manager := class(creative_device):
    var RunningTasks:[]task = array{}
    
    StartTask()<suspends>:void=
        NewTask := spawn:
            RunLongTask()
        set RunningTasks += array{NewTask}
    
    StopAllTasks():void=
        # Cleanup logic would go here
        set RunningTasks = array{}

task := class:
    ID:string
```

## Performance

### Avoid Unnecessary Loops

```verse
# Bad: Nested loops
FindPlayerPair(Target:player):void=
    AllPlayers := GetPlayspace().GetPlayers()
    for (Player1 : AllPlayers):
        for (Player2 : AllPlayers):
            # This is O(n²)
            CompareePlayers(Player1, Player2)

# Good: Single pass when possible
ProcessPlayers():void=
    AllPlayers := GetPlayspace().GetPlayers()
    for (Player : AllPlayers):
        ProcessPlayer(Player)
```

### Cache Expensive Operations

```verse
# Bad: Repeated expensive calls
UpdateGame()<suspends>:void=
    loop:
        # Gets players every frame
        if (GetPlayspace().GetPlayers().Length > 0):
            Process1(GetPlayspace().GetPlayers())
            Process2(GetPlayspace().GetPlayers())
        Sleep(0.1)

# Good: Cache result
UpdateGame()<suspends>:void=
    loop:
        Players := GetPlayspace().GetPlayers()
        if (Players.Length > 0):
            Process1(Players)
            Process2(Players)
        Sleep(0.1)
```

### Use Appropriate Sleep Durations

```verse
# Bad: Too frequent updates
FastLoop()<suspends>:void=
    loop:
        UpdateGame()
        Sleep(0.01)  # 100 FPS - probably too fast

# Good: Reasonable update rate
ReasonableLoop()<suspends>:void=
    loop:
        UpdateGame()
        Sleep(0.1)  # 10 FPS - good for most game logic
```

## Code Clarity

### Use Comments Wisely

```verse
# Bad: Obvious comments
# Increment score by 1
set Score += 1

# Get the player
Player := GetPlayer()

# Good: Explain why, not what
# Give bonus points for perfect completion
set Score += PerfectBonus

# Player must exist for next operation
if (Player := GetPlayer[]):
    # Complex logic requires character to be alive
    ProcessCharacter(Player)
```

### Avoid Magic Numbers

```verse
# Bad: What do these numbers mean?
if (Score > 1000):
    Reward(Player, 50)

Sleep(3.0)
Character.Damage(25.0)

# Good: Named constants
WinningScore:int = 1000
PerfectCompletionReward:int = 50
RespawnDelay:float = 3.0
StandardDamage:float = 25.0

if (Score > WinningScore):
    Reward(Player, PerfectCompletionReward)

Sleep(RespawnDelay)
Character.Damage(StandardDamage)
```

### Use Type Aliases for Clarity

```verse
# Define semantic types
player_id := string
score := int
team_name := string

# Use in functions
GetPlayerScore(PlayerID:player_id):score=
    # Implementation
    100

AssignToTeam(PlayerID:player_id, Team:team_name):void=
    # Implementation
    {}
```

## Testing and Debugging

### Use Print Statements

```verse
DebugMode:logic = true

DebugPrint(Message:string):void=
    if (DebugMode):
        Print("[DEBUG] {Message}")

ProcessPlayer(Player:player):void=
    DebugPrint("Processing player")
    
    if (Character := Player.GetFortCharacter[]):
        Health := Character.GetHealth()
        DebugPrint("Player health: {Health}")
```

### Add Assertions

```verse
# Validate assumptions
ValidateGameState():void=
    if (CurrentRound < 0):
        Print("[ERROR] Invalid round number: {CurrentRound}")
    
    if (ActivePlayers.Length > MaxPlayers):
        Print("[ERROR] Too many players: {ActivePlayers.Length}")
```

### Test Edge Cases

```verse
# Test with no players
TestEmptyGame():void=
    if (GetPlayspace().GetPlayers().Length = 0):
        Print("Handles empty game correctly")

# Test with maximum players
TestFullGame():void=
    if (GetPlayspace().GetPlayers().Length = MaxPlayers):
        Print("Handles full game correctly")
```

## Device Setup

### Use Editable Properties

```verse
# Good: Expose important values
game_config := class(creative_device):
    
    @editable
    GameDuration:float = 300.0
    
    @editable
    MinPlayers:int = 2
    
    @editable
    MaxPlayers:int = 16
    
    @editable
    RespawnDelay:float = 5.0
```

### Provide Defaults

```verse
# Good: Reasonable defaults
spawn_manager := class(creative_device):
    
    @editable
    SpawnPoints:[]spawn_pad_device = array{}
    
    @editable
    DefaultSpawnDelay:float = 3.0
    
    @editable
    EnableRespawn:logic = true
```

### Validate Device References

```verse
OnBegin<override>()<suspends>:void=
    # Validate devices are set
    if (StartButton = button_device{}):
        Print("[ERROR] Start button not set!")
        return
    
    if (SpawnPoints.Length = 0):
        Print("[WARNING] No spawn points configured")
    
    Initialize()
```

## Common Patterns

### Singleton Pattern

```verse
# Global game state
game_state := class(creative_device):
    var Instance:?game_state = false
    
    var CurrentScore:int = 0
    var IsActive:logic = false
    
    OnBegin<override>()<suspends>:void=
        set Instance = option{Self}
    
    GetInstance():?game_state=
        Instance
```

### Event-Driven Architecture

```verse
game_events := class(creative_device):
    
    # Define custom events
    PlayerScoredEvent:event(player, int) = event(player, int){}
    GameStartedEvent:event() = event(){}
    GameEndedEvent:event() = event(){}
    
    OnBegin<override>()<suspends>:void=
        # Subscribe to events
        PlayerScoredEvent.Subscribe(OnPlayerScored)
        GameStartedEvent.Subscribe(OnGameStarted)
        GameEndedEvent.Subscribe(OnGameEnded)
    
    OnPlayerScored(Player:player, Points:int):void=
        Print("Player scored {Points} points")
    
    OnGameStarted():void=
        Print("Game started")
    
    OnGameEnded():void=
        Print("Game ended")
    
    # Trigger events
    TriggerScore(Player:player, Points:int):void=
        PlayerScoredEvent.Signal(Player, Points)
```

### State Machine

```verse
game_state_enum := enum:
    waiting
    playing
    ended

state_machine := class(creative_device):
    
    var CurrentState:game_state_enum = game_state_enum.waiting
    
    OnBegin<override>()<suspends>:void=
        GameLoop()
    
    GameLoop()<suspends>:void=
        loop:
            if (CurrentState = game_state_enum.waiting):
                WaitingState()
            else if (CurrentState = game_state_enum.playing):
                PlayingState()
            else if (CurrentState = game_state_enum.ended):
                EndedState()
            
            Sleep(0.1)
    
    WaitingState()<suspends>:void=
        # Check if ready to start
        if (CheckStartConditions()):
            set CurrentState = game_state_enum.playing
    
    PlayingState()<suspends>:void=
        # Check if game should end
        if (CheckEndConditions()):
            set CurrentState = game_state_enum.ended
    
    EndedState()<suspends>:void=
        # Game over logic
        Sleep(5.0)
        set CurrentState = game_state_enum.waiting
    
    CheckStartConditions():logic=
        GetPlayspace().GetPlayers().Length >= 2
    
    CheckEndConditions():logic=
        false  # Implement win condition
```

## Summary

1. **Organize code clearly** with sections and meaningful names
2. **Prefer immutability** - use `=` over `:=` when possible
3. **Handle errors** - always check optionals and use `<transacts>`
4. **Think concurrent** - use appropriate async patterns
5. **Optimize wisely** - avoid premature optimization, but don't be wasteful
6. **Write clear code** - avoid magic numbers, add helpful comments
7. **Test thoroughly** - test edge cases and error conditions
8. **Configure properly** - use `@editable` for important values
9. **Follow patterns** - use established patterns for common tasks
10. **Keep it simple** - simpler code is easier to maintain and debug
