
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

# See https://dev.epicgames.com/documentation/en-us/uefn/create-your-own-device-in-verse for how to create a verse device.

custom_granter_device := class(creative_device):

    @editable
    GoldButton: button_device = button_device{}

    @editable
    Granter: item_granter_device = item_granter_device{}


    OnBegin<override>()<suspends>:void=
        GoldButton.InteractedWithEvent.Subscribe(GrantItem)

    GrantItem(Agent:agent):void=
        Granter.GrantItem(Agent)
