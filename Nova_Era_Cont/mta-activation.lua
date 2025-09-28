--[[
MTA:SA Activation Mod for NovaEraShop
This script polls the shop API for activations based on player serial and activates purchased products in-game.

Configuration:
- Set API_URL to your server URL (e.g., "http://localhost:5000")
- Products should have matching IDs/names in the shop and MTA resources
- Activation data includes productId and expiresAt

Usage:
- Add this to your MTA server resources
- Start the resource
- Players with activations will have products auto-activated on join or periodically

--]]

local API_URL = "http://localhost:5000" -- Change to your shop server URL
local POLL_INTERVAL = 30000 -- Poll every 30 seconds (ms)
local playerActivations = {} -- Cache activations per player serial

-- Function to fetch activations from shop API
function fetchActivations(serial)
    local url = API_URL .. "/api/activations/" .. serial
    fetchRemote(url, function(response, errno)
        if errno == 0 then
            local data = fromJSON(response)
            if data then
                playerActivations[serial] = data
                activateProductsForPlayer(getPlayerFromSerial(serial), data)
            end
        else
            outputDebugString("Failed to fetch activations for serial " .. serial .. ": " .. errno)
        end
    end)
end

-- Function to activate products for a player based on activation data
function activateProductsForPlayer(player, activations)
    if not player or not isElement(player) then return end

    for _, activation in ipairs(activations) do
        local productId = activation.productId
        local expiresAt = activation.expiresAt

        -- Check if expired
        if expiresAt and getRealTime().timestamp * 1000 > expiresAt then
            outputChatBox("Sua ativação para " .. productId .. " expirou.", player, 255, 100, 100)
            triggerClientEvent(player, "onActivationExpired", player, productId)
            -- Remove from cache or handle expiration
            return
        end

        -- Activate product - customize based on your MTA resources/products
        -- Example: Give weapon, vehicle, skin, etc. based on productId
        local success, message = activateProduct(player, productId)

        if success then
            outputChatBox(message, player, 0, 255, 0)
            triggerClientEvent(player, "onProductActivated", player, productId, message)
        else
            outputChatBox("Erro ao ativar produto: " .. message, player, 255, 100, 100)
        end
    end
end

-- Example activation function - replace with your game logic
function activateProduct(player, productId)
    -- Map product names to MTA actions (based on seeded products)
    if productId == "AK-47 Premium" then
        giveWeapon(player, 30, 200) -- AK-47 with 200 ammo
        return true, "AK-47 Premium ativada! Você recebeu uma AK-47 com 200 munições."
    elseif productId == "Lamborghini Facção" then
        local x, y, z = getElementPosition(player)
        local vehicle = createVehicle(560, x + 2, y + 2, z) -- Sultan (Lamborghini style)
        if vehicle then
            warpPedIntoVehicle(player, vehicle)
            return true, "Lamborghini Facção ativado! Veículo spawnado ao seu lado."
        else
            return false, "Erro ao criar veículo."
        end
    elseif productId == "Escritório CEO" then
        -- Set player as having office access (you'd need to implement office system)
        setElementData(player, "has_ceo_office", true)
        return true, "Escritório CEO ativado! Você agora tem acesso ao escritório premium."
    elseif productId == "VIP Ultimate" then
        setElementData(player, "vip", true)
        setPlayerNametagColor(player, 255, 215, 0) -- Gold name
        givePlayerMoney(player, 50000) -- Bonus money for VIP
        return true, "VIP Ultimate ativado! Você recebeu privilégios VIP e R$ 50.000 bônus."
    elseif productId == "Skin Personalizada" then
        -- Set custom skin (you'd need to implement skin system)
        setElementData(player, "custom_skin", true)
        setPlayerNametagColor(player, 138, 43, 226) -- Purple name for custom skin
        return true, "Skin Personalizada ativada! Sua aparência foi atualizada."
    elseif productId == "Casa Premium" then
        -- Set player as having premium house access
        setElementData(player, "premium_house", true)
        return true, "Casa Premium ativada! Você agora tem acesso à casa luxuosa."
    elseif productId == "M4A1 Carbine" then
        giveWeapon(player, 31, 150) -- M4 with 150 ammo
        return true, "M4A1 Carbine ativada! Você recebeu um rifle M4A1 com 150 munições."
    -- Legacy mappings for backward compatibility
    elseif productId == "weapon_ak47" then
        giveWeapon(player, 30, 100)
        return true, "AK-47 ativada!"
    elseif productId == "vehicle_sultan" then
        local vehicle = createVehicle(560, 0, 0, 5)
        warpPedIntoVehicle(player, vehicle)
        return true, "Veículo Sultan ativado!"
    elseif productId == "vip_access" then
        setElementData(player, "vip", true)
        setPlayerNametagColor(player, 255, 215, 0)
        return true, "VIP ativado!"
    else
        outputDebugString("Produto desconhecido: " .. productId)
        return false, "Produto não reconhecido: " .. productId
    end
end

-- Get player by serial
function getPlayerFromSerial(serial)
    for _, player in ipairs(getElementsByType("player")) do
        if getPlayerSerial(player) == serial then
            return player
        end
    end
    return nil
end

-- Event: Player joins - fetch activations
addEventHandler("onPlayerJoin", root, function()
    local serial = getPlayerSerial(source)
    fetchActivations(serial)
end)

-- Periodic poll for existing players
setTimer(function()
    for _, player in ipairs(getElementsByType("player")) do
        local serial = getPlayerSerial(player)
        if serial and not playerActivations[serial] then -- Only if not cached
            fetchActivations(serial)
        end
    end
end, POLL_INTERVAL, 0)

-- Clean up on player quit
addEventHandler("onPlayerQuit", root, function()
    local serial = getPlayerSerial(source)
    playerActivations[serial] = nil
end)

-- Command for manual refresh (admin only)
addCommandHandler("refreshactivations", function(player)
    if hasObjectPermissionTo(player, "general.adminpanel") then
        local serial = getPlayerSerial(player)
        fetchActivations(serial)
        outputChatBox("Activations refreshed!", player, 0, 255, 0)
    end
end)

-- Handle client requests for activation status
addEvent("requestActivations", true)
addEventHandler("requestActivations", root, function()
    local serial = getPlayerSerial(client)
    if serial and playerActivations[serial] then
        -- Re-activate products for the player (useful for checking status)
        activateProductsForPlayer(client, playerActivations[serial])
    end
end)

outputDebugString("NovaEraShop Activation Mod loaded!")
