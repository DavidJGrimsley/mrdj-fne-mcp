    ManageGrinding(Agent: agent)<suspends>:void=
        race:
            # Wait for the agent to stop grinding or the health to be fully regenerated
            AwaitGrindingStopped(Agent)
            PeriodicallyGrantHealth(Agent)

    AwaitGrindingStopped(Agent: agent)<suspends>:void=
        # Equivalent to while true
        loop:
            # Wait for the agent to stop grinding
            Inst := GrindingRail.EndedGrindingEvent.Await()
            # If the agent is the same as the one that was grinding, break the loop
            if (Inst = Agent):
                break

    PeriodicallyGrantHealth(Agent: agent)<suspends>:void=
        # Get the FortCharacter of the agent
        if (FC := Agent.GetFortCharacter[]):
            loop:
                # Get the health of the Fortnite character and make sure it is not full
                if(FC.GetHealth() < FC.GetMaxHealth()):    
                    # Store current health plus regen rate variable in a new constant
                    NewHealth := FC.GetHealth() + HealthRegenRate
                    # Set the player's health to the new health
                    FC.SetHealth(NewHealth)
                    # Wait for the cooldown period
                    Sleep(Cooldown)
