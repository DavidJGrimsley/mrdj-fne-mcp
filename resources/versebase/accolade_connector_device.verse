using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

# See https://dev.epicgames.com/documentation/en-us/uefn/create-your-own-device-in-verse for how to create a verse device.

# A Verse-authored creative device that can be placed in a level
accolade_connector_device := class(creative_device):

    # Coin accolade granter
    @editable
    CoinAccolade: accolades_device = accolades_device{}

    # VendingMachine accolade granter
    @editable
    VendingAccolade: accolades_device = accolades_device{}

    # Vending machines in the level.
    var VendingMachines : []vending_machine_device = array{}

    # Runs when the device is started in a running game
    OnBegin<override>()<suspends>:void=
        # Find all the vending machines in the level
        FoundVend := FindCreativeObjectsWithTag(Vend{})
        # Cast and populate SnowButtons
        for (VendingMachine : FoundVend, CastedItem := vending_machine_device[VendingMachine]):
            set VendingMachines = VendingMachines + array{CastedItem}
            CastedItem.ItemSpawnedEvent.Subscribe(GrantVendXP)
        
        # NOTE The following code does not working, it is tied to the function below but for some reason it isn't working.
        # Session := GetSession()
        # for (Coin : AllCoins[Session]):
        #     Coin.CollectedEvent.Subscribe(GrantCoinXP)
    
    
    # GrantCoinXP(Agent: agent):void=
    #     CoinAccolade.Award(Agent)
    #     Print("Coin accolade granted from accolade connector device", ?Duration:=6.0)

    GrantVendXP(Agent: agent):void=
        VendingAccolade.Award(Agent)
        Print("Vending accolade granted", ?Duration:=6.0)
