import { GameMode, world } from "@minecraft/server";
import { DB } from "misc/database";
import { formatRoleName, getGameInfos } from "misc/utils";
world.afterEvents.entityDie.subscribe(e => {
    const killer = e.damageSource.damagingEntity;
    const target = e.deadEntity;
    if (!DB.game || !killer || !target || killer.typeId != "minecraft:player" || target.typeId != "minecraft:player")
        return;
    manageKill(killer, target);
    endGameIfWin();
});
export function manageKill(killer, target) {
    const killerGameInfos = getGameInfos(killer);
    const targetGameInfos = getGameInfos(target);
    DB.game.kills.push({
        killerName: killer.name,
        killerRole: killerGameInfos.role,
        targetName: target.name,
        targetRole: targetGameInfos.role,
        time: DB.game.timer
    });
    killerGameInfos.kills += 1;
    targetGameInfos.deaths += 1;
    targetGameInfos.isAlive = false;
    targetGameInfos.timeLived = DB.game.timer;
    killer.sendFormatedMessage(`Tu as tué ${target.name}. Son rôle était: ${formatRoleName(targetGameInfos.role)}`);
    target.sendFormatedMessage(`Tu as été tué ${killer.name}.`);
    target.setGameMode(GameMode.Spectator);
}
function endGameIfWin() {
    const gamePlayers = DB.game.players;
    const wolves = gamePlayers.filter(p => p.role == "werewolf");
    const others = gamePlayers.filter(p => p.role != "werewolf");
    if (wolves.length <= 0) {
    }
}
