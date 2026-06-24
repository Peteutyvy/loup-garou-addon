import { system, CommandPermissionLevel, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { setupGame } from "core";
import { DB } from "misc/database";
system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerCommand({
        name: "lg:start",
        description: "Démarre la partie de loup garou",
        permissionLevel: CommandPermissionLevel.GameDirectors,
    }, (origin) => {
        const player = origin.sourceEntity;
        if (origin.sourceBlock || player.typeId != "minecraft:player")
            return { status: 1 };
        if (DB.game) {
            player.sendFormatedMessage("§cUne partie est déja en cours.", "warn");
            return { status: 1 };
        }
        system.run(() => {
            openStartGameValidationForm(player);
        });
        return { status: 0 };
    });
});
function openStartGameValidationForm(player) {
    const players = world.getAllPlayers();
    const set = DB.settings;
    const infos = [
        `Joueurs en ligne (${players.length}): \n  - ${players.map(p => p.name).join("\n  - ")}`,
        `Temps de la partie: ${set.gameTime} minute(s)`,
        `Nombre de loups garous: ${set.werewolvesCount}`
    ].join("\n");
    const form = new ActionFormData()
        .title("Démarrer la partie")
        .body("§lEst-tu sûr de vouloir lancer la partie?§r\n§o§8La partie sera lancée dans 2 minutes et les joueurs qui rejoingent entre temps ne seront pas dans la partie.§r\n\n" + infos)
        .button("§aLancer la partie")
        .button("§cRetour");
    // @ts-ignore
    form.show(player).then(r => {
        if (r.canceled || r.selection == 1)
            return;
        setupGame();
    });
}
