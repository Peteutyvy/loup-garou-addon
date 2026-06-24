import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { rolePowers } from "CONFIG";
import { openResultForm } from "core";
import { DB } from "misc/database";
import { getGameInfos } from "misc/utils";
world.afterEvents.itemUse.subscribe(e => {
    const item = e.itemStack;
    const player = e.source;
    const game = DB.game;
    if (!item || !item.getDynamicProperty("isMenuItem"))
        return;
    if (!game) {
        openPreGameForm(player);
    }
    else if (!game.isActive && !game.isEnded) {
    }
    else if (!game.isActive && game.isEnded) {
        openResultForm(player);
    }
    else {
        openGameForm(player);
    }
});
function openPreGameForm(player) {
    const body = [
        "§cLa partie n'est pas encore commencée...\n",
        "§o§8Tu y retrouvera tes pouvoirs uniques liées à ton rôle dans le jeu ici.",
        "Des boutons seront à ta disposition pour activer l'un de tes pouvoirs."
    ].join("\n");
    const form = new ActionFormData()
        .title("Menu du jeu")
        .body(body)
        .button("Compris!")
        .button("§8Fonctionnement du jeu");
    // @ts-ignore
    form.show(player).then(r => {
        if (r.canceled || r.selection == 0)
            return;
        openGameExplanationForm(player);
    });
}
;
function openGameExplanationForm(player) {
    const body = [
        " - Tu meurt dans le jeu seulement si tu est tué par un joueur",
        ""
    ].join("\n");
    const form = new ActionFormData()
        .title("Explication du jeu")
        .body(body)
        .button("Compris!");
    // @ts-ignore
    form.show(player).then();
}
function openGameForm(player) {
    const playerGameInfos = getGameInfos(player);
    const playerPowers = rolePowers[playerGameInfos.role];
    const body = [
        "Voici tes pouvoirs:"
    ].join("\n");
    const form = new ActionFormData()
        .title("Menu du jeu")
        .body(body);
    for (const power of playerPowers) {
        form.button(`${power.name}\n§7Clique ici`, power.iconTexture);
    }
    // @ts-ignore
    form.show(player).then(r => {
        if (r.canceled)
            return;
        const selectedPower = playerPowers[r.selection];
        if (!selectedPower)
            return;
        openPowerForm(player, selectedPower);
    });
}
;
function openPowerForm(player, power) {
    const playerGameInfos = getGameInfos(player);
    const playerPowerUsage = playerGameInfos.powerUsed.find(p => p.id == power.id);
    const body = [
        `Nom du pouvoir: ${power.name}`,
        `Description: ${power.description}`,
        `Nombre d'utilisation max: ${power.usageCount}`,
        `Nombre d'utilisation restantes: ${playerPowerUsage.usageRemaining}`
    ].join("\n\n");
    const form = new ActionFormData()
        .title("Menu du jeu")
        .body(body)
        .button("Utiliser")
        .button("§cRetour");
    // @ts-ignore
    form.show(player).then(r => {
        if (r.canceled)
            return;
        if (r.selection == 1) {
            openGameForm(player);
            return;
        }
        if (playerPowerUsage.usageRemaining <= 0) {
            player.sendFormatedMessage("§cIl ne te reste plus aucunes utilisations.", "warn");
            return;
        }
        power.use(player);
        playerPowerUsage.usageRemaining--;
        player.sendFormatedMessage(`§a${power.name} activé!`);
        player.playSound("random.orb");
    });
}
;
