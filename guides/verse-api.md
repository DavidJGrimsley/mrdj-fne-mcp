# Verse API Reference

## Core Modules

### /Fortnite.com/Devices

Common devices used in Fortnite Creative.

#### button_device

Interactive button that players can press.

```verse
using { /Fortnite.com/Devices }

my_device := class(creative_device):
    @editable
    MyButton:button_device = button_device{}
    
    OnBegin<override>()<suspends>:void=
        MyButton.InteractedWithEvent.Subscribe(OnButtonPressed)
    
    OnButtonPressed(Agent:agent):void=
        Print("Button pressed by {Agent}")
```

**Events:**
- `InteractedWithEvent:listenable(agent)` - Triggered when button is pressed

**Methods:**
- `Enable():void` - Enable the button
- `Disable():void` - Disable the button
- `Reset():void` - Reset button state

#### trigger_device

Area trigger that detects when agents enter/exit.

```verse
using { /Fortnite.com/Devices }

my_device := class(creative_device):
    @editable
    MyTrigger:trigger_device = trigger_device{}
    
    OnBegin<override>()<suspends>:void=
        MyTrigger.TriggeredEvent.Subscribe(OnTriggerEntered)
        MyTrigger.EndedEvent.Subscribe(OnTriggerExited)
    
    OnTriggerEntered(Agent:agent):void=
        Print("Agent entered trigger")
    
    OnTriggerExited(Agent:agent):void=
        Print("Agent exited trigger")
```

**Events:**
- `TriggeredEvent:listenable(agent)` - Agent enters trigger
- `EndedEvent:listenable(agent)` - Agent exits trigger

#### timer_device

Timer that counts down or up.

```verse
my_device := class(creative_device):
    @editable
    MyTimer:timer_device = timer_device{}
    
    OnBegin<override>()<suspends>:void=
        MyTimer.SuccessEvent.Subscribe(OnTimerComplete)
        MyTimer.Start()
    
    OnTimerComplete(Agent:?agent):void=
        Print("Timer completed!")
```

**Methods:**
- `Start():void` - Start the timer
- `Stop():void` - Stop the timer
- `Pause():void` - Pause the timer
- `Resume():void` - Resume the timer
- `Reset():void` - Reset to initial value

**Events:**
- `SuccessEvent:listenable(?agent)` - Timer completes

#### item_granter_device

Grants items to players.

```verse
my_device := class(creative_device):
    @editable
    ItemGranter:item_granter_device = item_granter_device{}
    
    GrantItemToPlayer(Agent:agent):void=
        ItemGranter.GrantItem(Agent)
```

**Methods:**
- `GrantItem(Agent:agent):void` - Grant item to agent

#### mutator_zone_device

Area that modifies player stats.

```verse
my_device := class(creative_device):
    @editable
    MutatorZone:mutator_zone_device = mutator_zone_device{}
    
    OnBegin<override>()<suspends>:void=
        MutatorZone.Enable()
```

**Methods:**
- `Enable():void` - Enable the zone
- `Disable():void` - Disable the zone

### /Fortnite.com/Characters

Character and player-related APIs.

#### fort_character

Represents a player's character in the game.

```verse
using { /Fortnite.com/Characters }

GetPlayerCharacter(Player:player):?fort_character=
    Player.GetFortCharacter[]

DamageCharacter(Character:fort_character)<transacts>:void=
    Character.Damage(25.0)

HealCharacter(Character:fort_character)<transacts>:void=
    Character.Heal(50.0)
```

**Methods:**
- `Damage(Amount:float)<transacts>:void` - Damage the character
- `Heal(Amount:float)<transacts>:void` - Heal the character
- `GetHealth():int` - Get current health
- `GetMaxHealth():int` - Get maximum health
- `EliminatePlayer()<transacts>:void` - Eliminate the player

#### agent

Represents any entity that can act (player, NPC, etc.).

```verse
ProcessAgent(Agent:agent):void=
    if (Character := Agent.GetFortCharacter[]):
        Print("Agent has character")
    
    if (Player := player[Agent]):
        Print("Agent is a player")
```

**Methods:**
- `GetFortCharacter():?fort_character` - Get character if exists

### /Fortnite.com/Game

Game management and playspace APIs.

#### creative_device

Base class for all Verse devices.

```verse
using { /Fortnite.com/Devices }
using { /Fortnite.com/Game }

my_device := class(creative_device):
    
    # Automatically called when device is initialized
    OnBegin<override>()<suspends>:void=
        AllPlayers := GetPlayspace().GetPlayers()
        Print("Found {AllPlayers.Length} players")
```

**Methods:**
- `GetPlayspace():fort_playspace` - Get the playspace

#### fort_playspace

Represents the game playspace.

```verse
GetAllPlayers():[]player=
    Playspace := GetPlayspace()
    Playspace.GetPlayers()

PlayerCount():int=
    GetPlayspace().GetPlayers().Length
```

**Methods:**
- `GetPlayers():[]player` - Get all players in the game

#### player

Represents a player in the game.

```verse
ProcessPlayer(Player:player):void=
    # Get player's character
    if (Character := Player.GetFortCharacter[]):
        Health := Character.GetHealth()
        Print("Player health: {Health}")
    
    # Eliminate player
    if:
        Character := Player.GetFortCharacter[]
        Character.EliminatePlayer[]
    then:
        Print("Player eliminated")
```

**Methods:**
- `GetFortCharacter():?fort_character` - Get player's character
- `Eliminate()<transacts>:void` - Eliminate the player

### /Verse.org/Simulation

Core Verse simulation APIs.

#### Time and Delays

```verse
using { /Verse.org/Simulation }

# Sleep for seconds
WaitTwoSeconds()<suspends>:void=
    Sleep(2.0)

# Game time vs real time
GetCurrentTime():float=
    GetSimulationElapsedTime()
```

**Functions:**
- `Sleep(Seconds:float)<suspends>:void` - Pause execution
- `GetSimulationElapsedTime():float` - Time since simulation start

#### Events

```verse
using { /Verse.org/Simulation }

# Create event
MyEvent:event(agent) = event(agent){}

# Subscribe to event
SubscribeToEvent()<suspends>:void=
    MyEvent.Subscribe(OnEventFired)

OnEventFired(Agent:agent):void=
    Print("Event fired!")

# Await event
WaitForEvent()<suspends>:void=
    Agent := MyEvent.Await()
    Print("Event received")
```

**Types:**
- `event(T)` - Event type
- `listenable(T)` - Read-only event

**Methods:**
- `Subscribe(Handler:T->void):void` - Subscribe to event
- `Await()<suspends>:T` - Wait for event
- `Unsubscribe(Handler:T->void):void` - Unsubscribe from event

### /UnrealEngine.com/Temporary/Diagnostics

Debugging and logging utilities.

#### Print

```verse
using { /UnrealEngine.com/Temporary/Diagnostics }

DebugLog():void=
    Print("Simple message")
    
    Name := "Alice"
    Score := 100
    Print("Player {Name} scored {Score} points")
    
    # Print numbers
    Print("Health: {Character.GetHealth()}")
```

**Functions:**
- `Print(Message:string):void` - Log message to console

## Common Patterns

### Device Initialization

```verse
my_device := class(creative_device):
    
    @editable
    Button1:button_device = button_device{}
    
    @editable
    Button2:button_device = button_device{}
    
    OnBegin<override>()<suspends>:void=
        # Subscribe to events
        Button1.InteractedWithEvent.Subscribe(OnButton1Pressed)
        Button2.InteractedWithEvent.Subscribe(OnButton2Pressed)
        
        # Initial setup
        StartGame()
    
    OnButton1Pressed(Agent:agent):void=
        Print("Button 1 pressed")
    
    OnButton2Pressed(Agent:agent):void=
        Print("Button 2 pressed")
    
    StartGame()<suspends>:void=
        Sleep(3.0)
        Print("Game started!")
```

### Player Loop

```verse
ProcessAllPlayers()<suspends>:void=
    AllPlayers := GetPlayspace().GetPlayers()
    
    for (Player : AllPlayers):
        if (Character := Player.GetFortCharacter[]):
            Health := Character.GetHealth()
            Print("Player health: {Health}")
            
            # Heal if low health
            if (Health < 50):
                Character.Heal(25.0)
```

### Async Game Loop

```verse
GameLoop()<suspends>:void=
    loop:
        # Run every second
        Sleep(1.0)
        
        # Update game state
        UpdateGame()
        
        # Check win condition
        if (CheckWinCondition()):
            break
    
    EndGame()

UpdateGame():void=
    Print("Game tick")

CheckWinCondition():logic=
    # Check if someone won
    false

EndGame():void=
    Print("Game over!")
```

### Respawn System

```verse
respawn_system := class(creative_device):
    
    @editable
    RespawnTrigger:trigger_device = trigger_device{}
    
    @editable
    RespawnDelay:float = 3.0
    
    OnBegin<override>()<suspends>:void=
        RespawnTrigger.TriggeredEvent.Subscribe(OnPlayerDeath)
    
    OnPlayerDeath(Agent:agent)<suspends>:void=
        Print("Player died, respawning in {RespawnDelay} seconds")
        Sleep(RespawnDelay)
        RespawnPlayer(Agent)
    
    RespawnPlayer(Agent:agent)<transacts>:void=
        if (Character := Agent.GetFortCharacter[]):
            Character.Heal(100.0)
            Print("Player respawned")
```

### Scoring System

```verse
score_manager := class(creative_device):
    
    var PlayerScores:[player]int = map{}
    
    @editable
    ScoreButton:button_device = button_device{}
    
    OnBegin<override>()<suspends>:void=
        ScoreButton.InteractedWithEvent.Subscribe(OnScorePoint)
    
    OnScorePoint(Agent:agent):void=
        if (Player := player[Agent]):
            AddScore(Player, 10)
    
    AddScore(Player:player, Points:int):void=
        CurrentScore := if (Score := PlayerScores[Player]):
            then: Score
            else: 0
        
        NewScore := CurrentScore + Points
        set PlayerScores[Player] = NewScore
        Print("Player score: {NewScore}")
    
    GetScore(Player:player):int=
        if (Score := PlayerScores[Player]):
            Score
        else:
            0
```

### Team System

```verse
team_manager := class(creative_device):
    
    @editable
    TeamATrigger:trigger_device = trigger_device{}
    
    @editable
    TeamBTrigger:trigger_device = trigger_device{}
    
    var TeamA:[]player = array{}
    var TeamB:[]player = array{}
    
    OnBegin<override>()<suspends>:void=
        TeamATrigger.TriggeredEvent.Subscribe(OnJoinTeamA)
        TeamBTrigger.TriggeredEvent.Subscribe(OnJoinTeamB)
    
    OnJoinTeamA(Agent:agent):void=
        if (Player := player[Agent]):
            JoinTeam(Player, team_a)
    
    OnJoinTeamB(Agent:agent):void=
        if (Player := player[Agent]):
            JoinTeam(Player, team_b)
    
    JoinTeam(Player:player, Team:team_type):void=
        if (Team = team_a):
            set TeamA += array{Player}
            Print("Joined Team A")
        else if (Team = team_b):
            set TeamB += array{Player}
            Print("Joined Team B")

team_type := enum:
    team_a
    team_b
```

### Round System

```verse
round_manager := class(creative_device):
    
    var CurrentRound:int = 0
    var RoundActive:logic = false
    
    @editable
    RoundDuration:float = 120.0
    
    @editable
    StartButton:button_device = button_device{}
    
    OnBegin<override>()<suspends>:void=
        StartButton.InteractedWithEvent.Subscribe(OnStartRound)
    
    OnStartRound(Agent:agent)<suspends>:void=
        if (not RoundActive):
            StartNewRound()
    
    StartNewRound()<suspends>:void=
        set CurrentRound += 1
        set RoundActive = true
        Print("Round {CurrentRound} started!")
        
        # Wait for round to end
        Sleep(RoundDuration)
        
        EndRound()
    
    EndRound():void=
        set RoundActive = false
        Print("Round {CurrentRound} ended!")
```

## API Best Practices

1. **Always Check Optionals**: Use `[]` or `?` to unwrap optionals safely
2. **Use Transacts**: Mark functions that can fail with `<transacts>`
3. **Subscribe Early**: Set up event subscriptions in `OnBegin`
4. **Handle All Players**: Use `GetPlayspace().GetPlayers()` to get all players
5. **Use Sleep for Delays**: Use `Sleep()` for time-based delays
6. **Clean Up**: Unsubscribe from events when done
7. **Type Safety**: Always specify types explicitly
8. **Error Handling**: Use failable context for operations that might fail

## Common Gotchas

1. **Character Can Be Null**: Always check `GetFortCharacter()` returns a value
2. **Events Need Subscription**: Events don't fire unless subscribed
3. **Devices Need Placement**: Devices must be placed in the level to work
4. **Async Operations**: Use `<suspends>` for any async code
5. **Type Conversions**: Use `[]` syntax for type conversions (e.g., `player[Agent]`)
