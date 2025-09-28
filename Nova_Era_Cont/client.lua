--[[
MTA:SA Client-side Script for NovaEraShop Activation Mod
Handles client-side notifications and UI for product activations.

This script listens for server events when products are activated and shows notifications to the player.

--]]

-- Event handler for product activation notification
addEvent("onProductActivated", true)
addEventHandler("onProductActivated", root, function(productId, message)
    -- Show chat box notification
    outputChatBox(message or ("Product " .. productId .. " activated!"), 0, 255, 0)
    
    -- Optional: Show a more advanced notification using dxDraw or a GUI
    -- For now, use built-in chat box
end)

-- Optional: Handle expiration notifications
addEvent("onActivationExpired", true)
addEventHandler("onActivationExpired", root, function(productId)
    outputChatBox("Your activation for " .. productId .. " has expired.", 255, 100, 100)
end)

-- Example: Show welcome message on join if VIP or special products active
addEventHandler("onClientPlayerJoin", localPlayer, function()
    triggerServerEvent("requestActivations", localPlayer)
end)

outputDebugString("NovaEraShop Client Activation Mod loaded!")
