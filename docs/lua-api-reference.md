# Lua API Reference

## Overview

The GameEngine Runtime exposes a Lua API that allows scripts to interact with game objects, physics, input, and more. This document describes all available functions and classes.

## Script Lifecycle

Every script can implement these optional callback functions:

### `Start()`
Called once when the game starts or when the entity is spawned.

```lua
function Start()
    print("Entity initialized!")
end
```

### `Update(deltaTime)`
Called every frame. `deltaTime` is the time elapsed since the last frame in seconds.

```lua
function Update(deltaTime)
    -- Move object forward
    local pos = self:GetPosition()
    pos.z = pos.z + 5 * deltaTime
    self:SetPosition(pos)
end
```

### `FixedUpdate()`
Called at fixed time intervals (50 times per second). Use for physics calculations.

```lua
function FixedUpdate()
    -- Apply forces, check collisions
end
```

### `OnCollisionEnter(other)`
Called when this entity begins colliding with another.

```lua
function OnCollisionEnter(other)
    print("Collision with: " .. other.name)
end
```

### `OnCollisionExit(other)`
Called when this entity stops colliding with another.

```lua
function OnCollisionExit(other)
    print("Stopped colliding with: " .. other.name)
end
```

## GameObject API

Access the current entity with `self`.

### Transform

#### `GetPosition()`
Returns the position as a table `{x, y, z}`.

```lua
local pos = self:GetPosition()
print(pos.x, pos.y, pos.z)
```

#### `SetPosition(x, y, z)` or `SetPosition(position)`
Sets the position.

```lua
self:SetPosition(0, 5, 0)
-- or
self:SetPosition({x = 0, y = 5, z = 0})
```

#### `GetRotation()`
Returns rotation as Euler angles `{x, y, z}` in degrees.

```lua
local rot = self:GetRotation()
```

#### `SetRotation(x, y, z)` or `SetRotation(rotation)`
Sets rotation.

```lua
self:SetRotation(0, 90, 0)  -- Rotate 90 degrees around Y axis
```

#### `GetScale()`
Returns scale `{x, y, z}`.

```lua
local scale = self:GetScale()
```

#### `SetScale(x, y, z)` or `SetScale(scale)`
Sets scale.

```lua
self:SetScale(2, 2, 2)  -- Double size
```

#### `Translate(x, y, z)`
Moves the entity relative to current position.

```lua
self:Translate(0, 0, 1)  -- Move forward 1 unit
```

#### `Rotate(x, y, z)`
Rotates the entity relative to current rotation.

```lua
self:Rotate(0, 45, 0)  -- Rotate 45 degrees around Y
```

### Hierarchy

#### `GetParent()`
Returns the parent GameObject or `nil`.

```lua
local parent = self:GetParent()
if parent then
    print("Parent: " .. parent.name)
end
```

#### `GetChildren()`
Returns array of child GameObjects.

```lua
local children = self:GetChildren()
for i, child in ipairs(children) do
    print("Child " .. i .. ": " .. child.name)
end
```

### Properties

#### `name`
The entity's name (read/write).

```lua
print(self.name)
self.name = "Player"
```

#### `id`
The entity's unique ID (read-only).

```lua
print(self.id)
```

### Finding Objects

#### `GameObject.Find(name)`
Finds a GameObject by name.

```lua
local player = GameObject.Find("Player")
if player then
    player:SetPosition(0, 0, 0)
end
```

#### `GameObject.FindByTag(tag)`
Finds all GameObjects with a specific tag.

```lua
local enemies = GameObject.FindByTag("Enemy")
for i, enemy in ipairs(enemies) do
    -- Process each enemy
end
```

### Destruction

#### `Destroy()`
Destroys this GameObject.

```lua
function OnCollisionEnter(other)
    if other.name == "Bullet" then
        self:Destroy()
    end
end
```

## Input API

### Keyboard

#### `Input.GetKey(keyCode)`
Returns `true` if the key is currently pressed.

```lua
if Input.GetKey(Input.KEY_W) then
    self:Translate(0, 0, -speed * deltaTime)
end
```

#### `Input.GetKeyDown(keyCode)`
Returns `true` on the frame the key was pressed.

```lua
if Input.GetKeyDown(Input.KEY_SPACE) then
    Jump()
end
```

#### `Input.GetKeyUp(keyCode)`
Returns `true` on the frame the key was released.

```lua
if Input.GetKeyUp(Input.KEY_SPACE) then
    StopJump()
end
```

#### Key Codes
```lua
Input.KEY_A through Input.KEY_Z
Input.KEY_0 through Input.KEY_9
Input.KEY_SPACE
Input.KEY_ENTER
Input.KEY_ESCAPE
Input.KEY_SHIFT
Input.KEY_CTRL
Input.KEY_ALT
Input.KEY_UP, Input.KEY_DOWN, Input.KEY_LEFT, Input.KEY_RIGHT
```

### Mouse

#### `Input.GetMousePosition()`
Returns mouse position as `{x, y}` in screen coordinates.

```lua
local mousePos = Input.GetMousePosition()
print(mousePos.x, mousePos.y)
```

#### `Input.GetMouseButton(button)`
Returns `true` if mouse button is pressed.

```lua
if Input.GetMouseButton(Input.MOUSE_LEFT) then
    Fire()
end
```

#### Mouse Buttons
```lua
Input.MOUSE_LEFT
Input.MOUSE_RIGHT
Input.MOUSE_MIDDLE
```

## Physics API

### Rigidbody

Add physics simulation to an entity.

#### `AddRigidbody(mass)`
Adds a rigidbody component.

```lua
self:AddRigidbody(1.0)  -- Mass of 1 kg
```

#### `GetVelocity()`
Returns velocity as `{x, y, z}`.

```lua
local vel = self:GetVelocity()
```

#### `SetVelocity(x, y, z)`
Sets velocity.

```lua
self:SetVelocity(0, 10, 0)  -- Launch upward
```

#### `AddForce(x, y, z)`
Applies a force.

```lua
self:AddForce(0, 100, 0)  -- Apply upward force
```

#### `AddImpulse(x, y, z)`
Applies an instantaneous impulse.

```lua
function OnCollisionEnter(other)
    self:AddImpulse(0, 5, 0)  -- Bounce
end
```

### Colliders

#### `AddBoxCollider(sizeX, sizeY, sizeZ)`
Adds a box-shaped collider.

```lua
self:AddBoxCollider(1, 1, 1)
```

#### `AddSphereCollider(radius)`
Adds a sphere-shaped collider.

```lua
self:AddSphereCollider(0.5)
```

### Raycasting

#### `Physics.Raycast(origin, direction, maxDistance)`
Casts a ray and returns hit information.

```lua
local origin = self:GetPosition()
local direction = {x = 0, y = -1, z = 0}  -- Down
local hit = Physics.Raycast(origin, direction, 10)

if hit then
    print("Hit: " .. hit.object.name)
    print("Distance: " .. hit.distance)
    print("Point: ", hit.point.x, hit.point.y, hit.point.z)
end
```

## Math API

### Vector3

#### `Vector3.New(x, y, z)`
Creates a new vector.

```lua
local forward = Vector3.New(0, 0, 1)
```

#### `Vector3.Distance(a, b)`
Calculates distance between two points.

```lua
local dist = Vector3.Distance(playerPos, enemyPos)
```

#### `Vector3.Normalize(v)`
Returns normalized vector.

```lua
local dir = Vector3.Normalize(targetPos - currentPos)
```

#### `Vector3.Dot(a, b)`
Calculates dot product.

```lua
local dot = Vector3.Dot(forward, toTarget)
```

### Math Utilities

#### `Math.Clamp(value, min, max)`
Clamps value between min and max.

```lua
local health = Math.Clamp(health, 0, 100)
```

#### `Math.Lerp(a, b, t)`
Linear interpolation.

```lua
local pos = Math.Lerp(startPos, endPos, 0.5)  -- Halfway
```

## Time API

#### `Time.GetTime()`
Returns time since game started in seconds.

```lua
local currentTime = Time.GetTime()
```

#### `Time.GetDeltaTime()`
Returns time since last frame in seconds.

```lua
local dt = Time.GetDeltaTime()
```

## Audio API

#### `Audio.Play(audioPath)`
Plays an audio file.

```lua
Audio.Play("assets/audio/explosion.wav")
```

#### `Audio.PlayAtPosition(audioPath, position)`
Plays 3D positional audio.

```lua
local pos = self:GetPosition()
Audio.PlayAtPosition("assets/audio/footstep.wav", pos)
```

## Debug API

#### `Debug.Log(message)`
Prints to console.

```lua
Debug.Log("Player health: " .. health)
```

#### `Debug.DrawLine(start, end, color, duration)`
Draws a debug line in the world.

```lua
local start = self:GetPosition()
local end_ = {x = start.x, y = start.y, z = start.z + 10}
Debug.DrawLine(start, end_, {r=1, g=0, b=0}, 1.0)
```

## Example Scripts

### Simple Movement

```lua
local speed = 5

function Update(deltaTime)
    if Input.GetKey(Input.KEY_W) then
        self:Translate(0, 0, -speed * deltaTime)
    end
    if Input.GetKey(Input.KEY_S) then
        self:Translate(0, 0, speed * deltaTime)
    end
    if Input.GetKey(Input.KEY_A) then
        self:Translate(-speed * deltaTime, 0, 0)
    end
    if Input.GetKey(Input.KEY_D) then
        self:Translate(speed * deltaTime, 0, 0)
    end
end
```

### Jump Mechanic

```lua
local jumpForce = 5
local isGrounded = true

function Start()
    self:AddRigidbody(1.0)
    self:AddBoxCollider(1, 1, 1)
end

function Update(deltaTime)
    if Input.GetKeyDown(Input.KEY_SPACE) and isGrounded then
        self:AddImpulse(0, jumpForce, 0)
        isGrounded = false
    end
end

function OnCollisionEnter(other)
    if other.name == "Ground" then
        isGrounded = true
    end
end
```

### Follow Camera

```lua
local target = nil
local offset = {x = 0, y = 5, z = -10}

function Start()
    target = GameObject.Find("Player")
end

function Update(deltaTime)
    if target then
        local targetPos = target:GetPosition()
        local newPos = {
            x = targetPos.x + offset.x,
            y = targetPos.y + offset.y,
            z = targetPos.z + offset.z
        }
        self:SetPosition(newPos)
    end
end
```

---

For more examples, see the `examples/` directory in the repository.