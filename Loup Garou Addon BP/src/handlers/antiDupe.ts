import { system, world } from '@minecraft/server'

world.afterEvents.playerInventoryItemChange.subscribe(({ player: p, beforeItemStack: bi, itemStack: i, slot: s }) => {
  try {
    if (bi?.amount === 1 && i?.amount === 64 && !p.getDynamicProperty('join')) {
      p.getComponent('minecraft:inventory')?.container?.setItem(s, bi);
      console.warn("dupe activated");
    }

    return;
  } catch (error) {
    world.sendMessage('Error fun playerInventoryItemChange3: ' + error);
  }
});

world.afterEvents.playerSpawn.subscribe(({ player: p }) => {
  p.setDynamicProperty('join', Date.now());
});

world.beforeEvents.playerLeave.subscribe(({ player: p }) => {
  p.setDynamicProperty('join', undefined);
});

// bundles

const bundlesId = [
    "minecraft:bundle",
    "minecraft:black_bundle",
    "minecraft:blue_bundle",
    "minecraft:brown_bundle",
    "minecraft:cyan_bundle",
    "minecraft:gray_bundle",
    "minecraft:green_bundle",
    "minecraft:light_blue_bundle",
    "minecraft:light_gray_bundle",
    "minecraft:lime_bundle",
    "minecraft:magenta_bundle",
    "minecraft:orange_bundle",
    "minecraft:pink_bundle",
    "minecraft:purple_bundle",
    "minecraft:red_bundle",
    "minecraft:white_bundle",
    "minecraft:yellow_bundle"
];
system.run(() => {
    if (!world.getDynamicProperty("hoppers")) {
        world.setDynamicProperty("hoppers", JSON.stringify([]));
    }
});
function getClosestPlayer(dimensionId, targetPos) {
    const dimension = world.getDimension(dimensionId);
    const players = dimension.getPlayers();
    let closestPlayer = null;
    let minDistance = 10;
    for (const player of players) {
        const playerPos = player.location;
        const dx = playerPos.x - targetPos.x;
        const dy = playerPos.y - targetPos.y;
        const dz = playerPos.z - targetPos.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < minDistance) {
            minDistance = distance;
            closestPlayer = player;
        }
    }
    return closestPlayer;
}
world.afterEvents.playerPlaceBlock.subscribe((e) => {
    if (e.block.typeId === "minecraft:hopper") {
        const dataStr = world.getDynamicProperty("hoppers");
        if (typeof dataStr != "string")
            return;
        const data = JSON.parse(dataStr);
        const loc = e.block.location;
        data.push({
            x: loc.x,
            y: loc.y,
            z: loc.z,
            dimension: e.block.dimension.id
        });
        world.setDynamicProperty("hoppers", JSON.stringify(data));
        console.warn(`[Ajout] Hopper en ${loc.x} ${loc.y} ${loc.z} dans la dimension ${e.block.dimension.id}`);
    }
});
world.beforeEvents.playerBreakBlock.subscribe((e) => {
    if (e.block.typeId === "minecraft:hopper") {
        const dataStr = world.getDynamicProperty("hoppers");
        if (typeof dataStr != "string")
            return;
        const data = JSON.parse(dataStr);
        const loc = {
            x: Math.floor(e.block.location.x),
            y: Math.floor(e.block.location.y),
            z: Math.floor(e.block.location.z)
        };
        const dimensionId = e.dimension.id;
        const foundHopperIndex = data.findIndex(item => Math.floor(item.x) === loc.x &&
            Math.floor(item.y) === loc.y &&
            Math.floor(item.z) === loc.z &&
            item.dimension === dimensionId);
        if (foundHopperIndex != -1) {
            const foundHopper = data[foundHopperIndex];
            data.splice(foundHopperIndex);
            world.setDynamicProperty("hoppers", JSON.stringify(data));
            console.warn(`[Retrait] Hopper en ${foundHopper.x} ${foundHopper.y} ${foundHopper.z} dans la dimension ${foundHopper.dimension}`);
        }
        else {
            console.warn(`[Erreur] Aucun hopper trouvé à ${loc.x} ${loc.y} ${loc.z} dans la dimension ${dimensionId}`);
        }
    }
});
world.afterEvents.playerInteractWithBlock.subscribe((e) => {
    if (e.block.typeId === "minecraft:hopper" && e.isFirstEvent) {
        const dataStr = world.getDynamicProperty("hoppers");
        if (typeof dataStr != "string")
            return;
        const data = JSON.parse(dataStr);
        const loc = {
            x: Math.floor(e.block.location.x),
            y: Math.floor(e.block.location.y),
            z: Math.floor(e.block.location.z)
        };
        const dimensionId = e.player.dimension.id;
        const foundHopperIndex = data.findIndex(item => Math.floor(item.x) === loc.x &&
            Math.floor(item.y) === loc.y &&
            Math.floor(item.z) === loc.z &&
            item.dimension === dimensionId);
        if (foundHopperIndex != -1)
            return;
        data.push({
            x: loc.x,
            y: loc.y,
            z: loc.z,
            dimension: e.block.dimension.id
        });
        world.setDynamicProperty("hoppers", JSON.stringify(data));
        console.warn(`[Ajout] Hopper en ${loc.x} ${loc.y} ${loc.z} dans la dimension ${e.block.dimension.id}`);
    }
});
system.runInterval(() => {
    const dataStr = world.getDynamicProperty("hoppers");
    if (typeof dataStr != "string")
        return;
    const data = JSON.parse(dataStr);
    for (let i = 0; i < data.length; i++) {
        const hopperData = data[i];
        const block = world.getDimension(hopperData.dimension).getBlock({
            x: hopperData.x,
            y: hopperData.y,
            z: hopperData.z
        });
        if (!block || !block.isValid)
            continue;
        const closestPlayer = getClosestPlayer(hopperData.dimension, {
            x: hopperData.x,
            y: hopperData.y,
            z: hopperData.z
        });
        if (!closestPlayer)
            continue;
        const closestPlayerInv = closestPlayer.getComponent("minecraft:inventory").container;
        if (block.typeId == "minecraft:hopper") {
            const blockInv = block.getComponent("minecraft:inventory").container;
            for (let j = 0; j < blockInv.size; j++) {
                const item = blockInv.getItem(j);
                if (item && bundlesId.includes(item.typeId)) {
                    blockInv.transferItem(j, closestPlayerInv);
                }
            }
        }
    }
});