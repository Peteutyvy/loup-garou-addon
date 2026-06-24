import { system, CommandPermissionLevel } from "@minecraft/server";
import { openResultForm } from "core";
import { DB } from "misc/database";
system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerCommand({
        name: "lg:results",
        description: "Obtiens les résultats de la partie",
        permissionLevel: CommandPermissionLevel.Any,
    }, (origin) => {
        const player = origin.sourceEntity;
        if (origin.sourceBlock || player.typeId != "minecraft:player")
            return { status: 1 };
        if (!DB.game) {
            player.sendFormatedMessage("§cAucune partie antérieure trouvée.", "warn");
            return { status: 1 };
        }
        else if (!DB.game.isEnded) {
            player.sendFormatedMessage("§cCette partie n'est pas encore terminée.", "warn");
            return { status: 1 };
        }
        system.run(() => {
            openResultForm(player);
        });
        return { status: 0 };
    });
});
