import { world, system } from "@minecraft/server";
import { DB } from "misc/database";
import { formatRoleName, getGameInfos } from "misc/utils";
world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const player = e.player;
    const target = e.target;
    if (!DB.game || target.typeId != "minecraft:player")
        return;
    system.run(() => {
        const powerName = player.getDynamicProperty("power");
        switch (powerName) {
            case "seer:see_role":
                seeRole(player, target);
                break;
            case "ryan:steal":
                steal(player, target);
                break;
            default: break;
        }
    });
});
function seeRole(player, target) {
    const targetGameInfos = getGameInfos(target);
    player.onScreenDisplay.setTitle("§lBoule de crystal!");
    player.onScreenDisplay.updateSubtitle(`§oLe role de §r${target.name}§o est §r${formatRoleName(targetGameInfos.role)}`);
    player.setDynamicProperty("power", null);
}
;
function steal(player, target) {
    const targetInventory = target.getComponent("minecraft:inventory").container;
    const playerInventory = player.getComponent("minecraft:inventory").container;
    const itemIndexes = [];
    for (let i = 0; i < targetInventory.size; i++) {
        const item = targetInventory.getItem(i);
        if (!item || item.getDynamicProperty("isMenuItem"))
            continue;
        if (item)
            itemIndexes.push(i);
    }
    const randomIndex = itemIndexes[Math.floor(Math.random() * itemIndexes.length)];
    if (!randomIndex)
        return;
    const transferedItem = targetInventory.getItem(randomIndex);
    targetInventory.setItem(randomIndex, null);
    playerInventory.addItem(transferedItem);
    player.onScreenDisplay.setTitle("Vol sournois");
    player.onScreenDisplay.updateSubtitle([{ text: "Vol de " }, { translate: transferedItem.localizationKey }]);
    player.setDynamicProperty("power", null);
}
