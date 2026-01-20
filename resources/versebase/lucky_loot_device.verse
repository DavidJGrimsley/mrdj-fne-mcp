
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }
# using { /Verse.org/Simulation/Text }


# A verse device that must be placed in a level for it to work
# This device will grant a random item to the player when the button is interacted with
# The item that is granted is chosen in the editor
# The button can only be interacted with once every 'CoolDownTime' seconds, this time is chosen in the editor
# The button will show a message to the player when they can interact with it, this message is chosen in the 
# The buttons will chosen based on a custom tag
lucky_loot_device := class(creative_device):
       
    # An item granter that will grant an item to the player when the button is interacted with - this is chosen in the editor
    @editable
    LuckyGranter: item_granter_device = item_granter_device{}
  
    # The amount of time to wait before the button can be interacted with again
    @editable
    CoolDownTime: float = 2.0

    # The message to show when the player can interact with the button
    @editable
    StringToShow: string = ""

    OnBegin<override>()<suspends>:void=
        # Convert the string to a message
        messageToShow: message = StringToMessage(StringToShow)
        # Find all the buttons in the level that have the snowButton tag
        FoundButtons := FindCreativeObjectsWithTag(snowButton{})
        # For each button, subscribe to the InteractedWithEvent and set the interaction text
        for (Button : FoundButtons, ButtonDevice := button_device[Button]):
            ButtonDevice.SetInteractionText(messageToShow)
            spawn:
                HandleButton(ButtonDevice)
                
    # Function to convert a string to a 'message'
    StringToMessage<localizes>(value:string) : message = "{value}"
            
    HandleButton(ButtonDevice:button_device)<suspends>:void=
        # Loop to handle the button being interacted with - essentially a 'while true' loop
        loop:
            Agent := ButtonDevice.InteractedWithEvent.Await()
            GrantItem(Agent)
            # set snowAmount = 1.0
            ButtonDevice.Disable()
            Cooldown()
            ButtonDevice.Enable()
    
    GrantItem(Agent:agent):void=
        # Grant a random item to the player
        LuckyGranter.CycleToRandomItem(Agent)
    
    Cooldown()<suspends>:void=
        # Wait for the cooldown time
        Sleep(CoolDownTime)
