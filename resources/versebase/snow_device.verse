
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }
using { /UnrealEngine.com/Temporary/SpatialMath }

# See https://dev.epicgames.com/documentation/en-us/uefn/create-your-own-device-in-verse for how to create a verse device.

# A Verse-authored creative device that can be placed in a level
snow_device := class(creative_device):

    @editable
    SnowTime: float = 90.0

    @editable
    SnowMeltingTime: float = 5.0

    @editable
    SnowFormingTime: float = 7.0

    @editable_number(float):
        MinValue:=option{30.0}
    MeltedTime: float = 60.0

    
    @editable
    SnowLauncherVendingMachine: vending_machine_device = vending_machine_device{}


    var SnowButtons : []button_device = array{}
    var SnowPiles : []creative_prop = array{}

    var SnowSpawners : []vfx_spawner_device = array{}

    OnBegin<override>()<suspends>:void=
        # Find all the buttons in the level that have the snowButton tag
        FoundSpawners := FindCreativeObjectsWithTag(snowVFX{})
        FoundButtons := FindCreativeObjectsWithTag(snowButton{})
        FoundPiles := FindCreativeObjectsWithTag(snowPile{})

        # Cast and populate SnowButtons
        for (Button : FoundButtons, CastedItem := button_device[Button]):
            set SnowButtons = SnowButtons + array{CastedItem}

        # Cast and populate SnowPiles
        for (Pile : FoundPiles, CastedItem := creative_prop[Pile]):
            set SnowPiles = SnowPiles + array{CastedItem}

        #Print the number of snow piles
        for (Index -> SnowPile : SnowPiles):
            Print("SnowPile found: {Index}")
        

        # Cast and populate SnowSpawners
        for (Spawner : FoundSpawners, CastedItem := vfx_spawner_device[Spawner]):
            set SnowSpawners = SnowSpawners + array{CastedItem}
        
       
        spawn:
            SnowPhase()
            # SnowPhases(FoundSpawners, FoundButtons)
                
            

    SnowPhase()<suspends>:void=
        # Start with the buttons disabled but snow spawners enabled
        DisableSnowButtons()
        # Let it snow
        EnableSnowSpanwers()
        Print("Buttons Disabled")
        loop:
            Print("Snow phase started")
            SnowFormingCooldown()
            Print("Snow forming phase ended")
            
            # Let it snow for a while
            SnowCooldown()
            Print("Snow phase ended, snow melting phase started")
            # Stop the snow and start melting
            SnowMeltingCooldown()
            Print("Snow melting phase ended")
            MeltedCooldown()
            SnowLauncherVendingMachine.CycleToNextItem()
    
   
            
    # Cool Down functions
    SnowCooldown()<suspends>:void=
        Print("SnowCooldown started")
        Sleep(SnowTime)
        DisableSnowSpanwers()
        Print("SnowCooldown ended")

    SnowMeltingCooldown()<suspends>:void=
        Print("SnowMeltingCooldown started")
        Sleep(SnowMeltingTime)
        DisableSnowButtons()
        Print("SnowMeltingCooldown ended")
    
    MeltedCooldown()<suspends>:void=
        Print("MeltedCooldown started")
        Sleep(MeltedTime)
        EnableSnowSpanwers()
        Print("MeltedCooldown ended")

    SnowFormingCooldown()<suspends>:void=
        Print("SnowFormingCooldown started")
        Sleep(SnowFormingTime)
        # Enable snow buttons
        EnableSnowButtons()
        Print("Buttons enabled")
        Print("SnowFormingCooldown ended")


    
    # Enable/Disable functions
    EnableSnowSpanwers():void=
        for (Spawner : SnowSpawners):
            Spawner.Enable()

    DisableSnowSpanwers():void=
        for (Spawner : SnowSpawners):
            Spawner.Disable()

    EnableSnowButtons():void=
        for (Button : SnowButtons):
            Button.Enable()
        for (SnowPile : SnowPiles):
            SnowPile.Show()


    DisableSnowButtons():void=
        
        for (Button : SnowButtons):
            Button.Disable()

        for (SnowPile : SnowPiles):
            SnowPile.Hide()
