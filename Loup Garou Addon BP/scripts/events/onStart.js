import { system, world } from "@minecraft/server";
system.run(() => {
    world.getAllPlayers().forEach(p => {
        initPlayer(p);
    });
    const gr = world.gameRules;
    gr.showDeathMessages = false;
    gr.doImmediateRespawn = true;
    gr.doLimitedCrafting = false;
    gr.locatorBar = false;
    gr.recipesUnlock = false;
    gr.showCoordinates = true;
    gr.showDaysPlayed = false;
    gr.showRecipeMessages = false;
    gr.spawnRadius = 0;
    gr.showTags = false;
    gr.sendCommandFeedback = false;
    gr.doDayLightCycle = false;
});
export function initPlayer(player) {
    try {
        console.warn(`[Info] Initialisation de ${player.name} réussi`);
    }
    catch (error) {
        console.warn(`[Erreur] Erreur durant l'initialisation de ${player.name} : ${error}`);
    }
    ;
}
;
