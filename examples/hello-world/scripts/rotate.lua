-- Simple rotation script for Hello World example
-- This script makes the cube rotate continuously

local rotationSpeed = 45  -- Degrees per second

function Start()
    print("Hello World! Cube rotation started.")
    print("Rotation speed: " .. rotationSpeed .. " degrees/second")
end

function Update(deltaTime)
    -- Get current rotation
    local rotation = self:GetRotation()
    
    -- Rotate around Y axis
    rotation.y = rotation.y + rotationSpeed * deltaTime
    
    -- Keep rotation in 0-360 range
    if rotation.y >= 360 then
        rotation.y = rotation.y - 360
    end
    
    -- Apply new rotation
    self:SetRotation(rotation)
end