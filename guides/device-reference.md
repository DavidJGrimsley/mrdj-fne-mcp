# Device Reference Guide

## Common Devices in Fortnite Creative

This guide covers the most commonly used devices in Fortnite Creative and how to use them with Verse.

## Interaction Devices

### button_device

A button that players can interact with.

```verse
using { /Fortnite.com/Devices }

button_example := class(creative_device):

    @editable
    MyButton:button_device = button_device{}

    OnBegin<override>()<suspends>:void=
        MyButton.InteractedWithEvent.Subscribe(OnButtonPressed)

    OnButtonPressed(Agent:agent):void=
        Print("Button pressed!")

        # Disable button temporarily
        MyButton.Disable()

        # Re-enable after delay
        spawn:
            Sleep(2.0)
            MyButton.Enable()
```

**Common Use Cases:**
- Start game buttons
- Activate special abilities
- Open doors/gates
- Trigger events

### trigger_device

Detects when agents enter/exit an area.

```verse
trigger_example := class(creative_device):

    @editable
    AreaTrigger:trigger_device = trigger_device{}

    @editable
    ExitTrigger:trigger_device = trigger_device{}

    OnBegin<override>()<suspends>:void=
        AreaTrigger.TriggeredEvent.Subscribe(OnEnterArea)
        AreaTrigger.EndedEvent.Subscribe(OnExitArea)

    OnEnterArea(Agent:agent):void=
        Print("Agent entered the area")
        # Grant speed boost, etc.

    OnExitArea(Agent:agent):void=
        Print("Agent left the area")
        # Remove effects
```

**Common Use Cases:**
- Zone-based effects
- Checkpoint systems
- Area-of-effect abilities
- Spawn zones

## Time and Sequence

### timer_device

Counts down or up for a specified duration.

```verse
timer_example := class(creative_device):

    @editable
    GameTimer:timer_device = timer_device{}

    @editable
    CountdownTimer:timer_device = timer_device{}

    OnBegin<override>()<suspends>:void=
        GameTimer.SuccessEvent.Subscribe(OnGameTimerComplete)
        CountdownTimer.SuccessEvent.Subscribe(OnCountdownComplete)

        # Start timers
        GameTimer.Start()
        CountdownTimer.Start()

    OnGameTimerComplete(Agent:?agent):void=
        Print("Game timer completed!")
        EndGame()

    OnCountdownComplete(Agent:?agent):void=
        Print("Countdown finished!")
        StartAction()

    EndGame():void=
        Print("Ending game...")

    StartAction():void=
        Print("Starting action...")
```

**Common Use Cases:**
- Game duration timers
- Countdown to events
- Respawn timers
- Round timers

### cinematic_sequence_device

Plays cinematic sequences.

```verse
cinematic_example := class(creative_device):

    @editable
    IntroSequence:cinematic_sequence_device = cinematic_sequence_device{}

    @editable
    OutroSequence:cinematic_sequence_device = cinematic_sequence_device{}

    PlayIntro():void=
        IntroSequence.Play()

    PlayOutro():void=
        OutroSequence.Play()

    StopCinematic():void=
        IntroSequence.Stop()
```

**Common Use Cases:**
- Game intro/outro
- Story cutscenes
- Victory sequences
- Tutorial sequences

## Items and Inventory

### item_granter_device

Grants items, weapons, or resources to players.

```verse
item_granter_example := class(creative_device):

    @editable
    WeaponGranter:item_granter_device = item_granter_device{}

    @editable
    ResourceGranter:item_granter_device = item_granter_device{}

    @editable
    SpawnTrigger:trigger_device = trigger_device{}

    OnBegin<override>()<suspends>:void=
        SpawnTrigger.TriggeredEvent.Subscribe(OnPlayerSpawn)

    OnPlayerSpawn(Agent:agent):void=
        # Grant starting items
        WeaponGranter.GrantItem(Agent)
        ResourceGranter.GrantItem(Agent)
        Print("Items granted to player")
```

**Common Use Cases:**
- Starting loadouts
- Reward systems
- Power-up pickups
- Resource distribution

### item_spawner_device

Spawns items in the world.

```verse
spawner_example := class(creative_device):

    @editable
    WeaponSpawner:item_spawner_device = item_spawner_device{}

    SpawnWeapon():void=
        WeaponSpawner.Enable()

    DisableSpawner():void=
        WeaponSpawner.Disable()
```

**Common Use Cases:**
- Weapon spawns
- Collectible spawning
- Periodic item drops

## Player Effects

### mutator_zone_device

Modifies player stats within a zone.

```verse
mutator_example := class(creative_device):

    @editable
    SpeedZone:mutator_zone_device = mutator_zone_device{}

    @editable
    DamageZone:mutator_zone_device = mutator_zone_device{}

    OnBegin<override>()<suspends>:void=
        # Enable zones by default
        SpeedZone.Enable()
        DamageZone.Enable()

    ToggleSpeedZone():void=
        SpeedZone.Disable()

        # Re-enable after delay
        spawn:
            Sleep(10.0)
            SpeedZone.Enable()
```

**Common Use Cases:**
- Speed boost zones
- Low gravity areas
- Damage zones
- Healing areas

## Environmental

### collectible_object_device

Object that can be collected by players.

```verse
collectible_example := class(creative_device):

    @editable
    Coin:collectible_object_device = collectible_object_device{}

    @editable
    PowerUp:collectible_object_device = collectible_object_device{}

    OnBegin<override>()<suspends>:void=
        Coin.CollectedEvent.Subscribe(OnCoinCollected)
        PowerUp.CollectedEvent.Subscribe(OnPowerUpCollected)

    OnCoinCollected(Agent:agent):void=
        Print("Coin collected!")
        # Add score
        if (Player := player[Agent]):
            AddScore(Player, 10)

    OnPowerUpCollected(Agent:agent):void=
        Print("Power-up collected!")
        # Grant ability
        GrantAbility(Agent)

    AddScore(Player:player, Points:int):void=
        # Implementation
        Print("Added {Points} points")

    GrantAbility(Agent:agent):void=
        # Implementation
        Print("Granted ability")
```

**Common Use Cases:**
- Coin collection
- Power-up items
- Quest items
- Collectathon mechanics

## UI and Display

### billboard_device

Displays text or images to players.

```verse
billboard_example := class(creative_device):

    @editable
    ScoreBoard:billboard_device = billboard_device{}

    @editable
    WelcomeSign:billboard_device = billboard_device{}

    ShowWelcome():void=
        WelcomeSign.Enable()

    HideWelcome():void=
        WelcomeSign.Disable()

    UpdateScoreboard():void=
        # Billboard content is typically set in editor
        ScoreBoard.Enable()
```

**Common Use Cases:**
- Scoreboards
- Instructions
- Objective displays
- Welcome messages

## Spawn and Teleport

### spawn_pad_device

Spawns or respawns players at a location.

```verse
spawn_example := class(creative_device):

    @editable
    TeamASpawn:spawn_pad_device = spawn_pad_device{}

    @editable
    TeamBSpawn:spawn_pad_device = spawn_pad_device{}

    EnableTeamSpawns():void=
        TeamASpawn.Enable()
        TeamBSpawn.Enable()

    DisableAllSpawns():void=
        TeamASpawn.Disable()
        TeamBSpawn.Disable()
```

**Common Use Cases:**
- Player respawn points
- Team spawn locations
- Checkpoint spawns

### teleporter_device

Teleports players to another location.

```verse
teleporter_example := class(creative_device):

    @editable
    EntranceTeleporter:teleporter_device = teleporter_device{}

    @editable
    ExitTeleporter:teleporter_device = teleporter_device{}

    EnableTeleporter():void=
        EntranceTeleporter.Enable()

    DisableTeleporter():void=
        EntranceTeleporter.Disable()
```

**Common Use Cases:**
- Fast travel
- Portal systems
- Puzzle solutions
- Arena transitions

## Audio

### audio_player_device

Plays audio files.

```verse
audio_example := class(creative_device):

    @editable
    BackgroundMusic:audio_player_device = audio_player_device{}

    @editable
    VictorySound:audio_player_device = audio_player_device{}

    @editable
    StartButton:button_device = button_device{}

    OnBegin<override>()<suspends>:void=
        # Play background music on start
        BackgroundMusic.Play()

        StartButton.InteractedWithEvent.Subscribe(OnGameStart)

    OnGameStart(Agent:agent):void=
        VictorySound.Play()

    StopMusic():void=
        BackgroundMusic.Stop()
```

**Common Use Cases:**
- Background music
- Sound effects
- Ambient audio
- Event sounds

## Complex Examples

### Multi-Stage Game

```verse
multi_stage_game := class(creative_device):

    # Devices
    @editable
    StartButton:button_device = button_device{}

    @editable
    Stage1Trigger:trigger_device = trigger_device{}

    @editable
    Stage2Trigger:trigger_device = trigger_device{}

    @editable
    RewardGranter:item_granter_device = item_granter_device{}

    @editable
    VictorySound:audio_player_device = audio_player_device{}

    # State
    var CurrentStage:int = 0
    var CompletedStages:[]int = array{}

    OnBegin<override>()<suspends>:void=
        StartButton.InteractedWithEvent.Subscribe(OnStartGame)
        Stage1Trigger.TriggeredEvent.Subscribe(OnStage1Complete)
        Stage2Trigger.TriggeredEvent.Subscribe(OnStage2Complete)

    OnStartGame(Agent:agent)<suspends>:void=
        set CurrentStage = 1
        Print("Game started! Complete stage 1")
        StartButton.Disable()

    OnStage1Complete(Agent:agent)<suspends>:void=
        if (CurrentStage = 1):
            set CompletedStages += array{1}
            set CurrentStage = 2
            Print("Stage 1 complete! Move to stage 2")
            RewardGranter.GrantItem(Agent)

    OnStage2Complete(Agent:agent)<suspends>:void=
        if (CurrentStage = 2):
            set CompletedStages += array{2}
            set CurrentStage = 0
            Print("All stages complete! Victory!")
            VictorySound.Play()
            RewardGranter.GrantItem(Agent)
```

### Zone Control Game

```verse
zone_control := class(creative_device):

    @editable
    ControlZone:trigger_device = trigger_device{}

    @editable
    ZoneMutator:mutator_zone_device = mutator_zone_device{}

    @editable
    ControlTimer:timer_device = timer_device{}

    var ControllingTeam:?team_type = false
    var ControlProgress:float = 0.0

    OnBegin<override>()<suspends>:void=
        ControlZone.TriggeredEvent.Subscribe(OnEnterZone)
        ControlZone.EndedEvent.Subscribe(OnExitZone)
        ControlTimer.SuccessEvent.Subscribe(OnControlComplete)

        ZoneMutator.Enable()

    OnEnterZone(Agent:agent):void=
        # Start capturing zone
        if (not ControllingTeam?):
            ControlTimer.Start()
            Print("Zone capture started")

    OnExitZone(Agent:agent):void=
        # Stop capturing
        ControlTimer.Pause()
        Print("Zone capture paused")

    OnControlComplete(Agent:?agent):void=
        Print("Zone captured!")
        # Award points to team
        ControlTimer.Reset()

team_type := enum:
    team_a
    team_b
```

### Collectible Hunt

```verse
collectible_hunt := class(creative_device):

    @editable
    Collectibles:[]collectible_object_device = array{}

    @editable
    VictoryTrigger:trigger_device = trigger_device{}

    @editable
    RewardGranter:item_granter_device = item_granter_device{}

    var CollectedCount:int = 0
    RequiredCount:int = 10

    OnBegin<override>()<suspends>:void=
        # Subscribe to all collectibles
        for (Collectible : Collectibles):
            Collectible.CollectedEvent.Subscribe(OnCollected)

        VictoryTrigger.Disable()

    OnCollected(Agent:agent):void=
        set CollectedCount += 1
        Print("Collected {CollectedCount}/{RequiredCount}")

        if (CollectedCount >= RequiredCount):
            CompleteHunt(Agent)

    CompleteHunt(Agent:agent):void=
        Print("Hunt complete! All collectibles found!")
        VictoryTrigger.Enable()
        RewardGranter.GrantItem(Agent)
```

## Tips for Using Devices

1. **Always check device references** - Ensure devices are set in the editor
2. **Subscribe in OnBegin** - Set up event handlers during initialization
3. **Enable/Disable strategically** - Control when devices are active
4. **Test thoroughly** - Place devices in the level and test in play mode
5. **Use @editable** - Make device references editable for flexibility
6. **Combine devices** - Create complex systems by combining simple devices
7. **Handle edge cases** - Consider what happens with no players, etc.
8. **Clean up** - Disable devices when they're no longer needed

## Common Patterns

### Device State Management

```verse
device_manager := class(creative_device):

    @editable
    GameDevices:[]button_device = array{}

    EnableAll():void=
        for (Device : GameDevices):
            Device.Enable()

    DisableAll():void=
        for (Device : GameDevices):
            Device.Disable()
```

### Delayed Activation

```verse
delayed_device := class(creative_device):

    @editable
    Device:button_device = button_device{}

    @editable
    ActivationDelay:float = 5.0

    OnBegin<override>()<suspends>:void=
        Sleep(ActivationDelay)
        Device.Enable()
```

### Sequential Events

```verse
sequence_device := class(creative_device):

    @editable
    Step1:trigger_device = trigger_device{}

    @editable
    Step2:trigger_device = trigger_device{}

    @editable
    Step3:trigger_device = trigger_device{}

    OnBegin<override>()<suspends>:void=
        Step1.TriggeredEvent.Subscribe(OnStep1)
        Step2.Disable()
        Step3.Disable()

    OnStep1(Agent:agent):void=
        Step1.Disable()
        Step2.Enable()
        Step2.TriggeredEvent.Subscribe(OnStep2)

    OnStep2(Agent:agent):void=
        Step2.Disable()
        Step3.Enable()
        Step3.TriggeredEvent.Subscribe(OnStep3)

    OnStep3(Agent:agent):void=
        Print("Sequence complete!")
```
