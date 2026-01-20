
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

# See https://dev.epicgames.com/documentation/en-us/uefn/create-your-own-device-in-verse for how to create a verse device.

chest_device := class(creative_device):

    # A button that the player can interact with to grant an item - this is a reference to a button device
    @editable
    ChestSwitch: switch_device = switch_device{}

    # A button that the player can interact with to grant an item - this is a reference to a button device
    @editable
    ChestFVX: vfx_spawner_device = vfx_spawner_device{}

    # An item granter that will grant an item to the player when the button is interacted with - this is chosen in the editor
    @editable
    ChestGranter: item_granter_device = item_granter_device{}

    # The amount of time to wait before the button can be interacted with again
    @editable
    CoolDownTime: float = 5.0

    # When game starts
    OnBegin<override>()<suspends>:void=
        # Subscribe to the button's TurnedOnEvent
        ChestSwitch.TurnedOnEvent.Subscribe(OpenChest)
        

    # When the button is interacted with
    OpenChest(Agent:agent):void=
        # Turn the VFX Off momentarily
        ChestFVX.Disable()
        # Disable switch momentarily
        ChestSwitch.Disable()
        # Grant the item
        ChestGranter.GrantItem(Agent)
        spawn:
            # Wait for the cooldown time
            ResetChest()

    # Reset the chest
    ResetChest()<suspends>:void=
        # Wait for the cooldown time
        Sleep(CoolDownTime)
        # Turn the VFX on
        ChestFVX.Enable()
        # Enable the switch 
        ChestSwitch.Enable()
        # Turn off the chest
        ChestSwitch.SetState(false)
