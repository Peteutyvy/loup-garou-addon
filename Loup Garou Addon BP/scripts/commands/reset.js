import { system, CommandPermissionLevel } from "@minecraft/server";
import { DB, resetDataBase } from "misc/database";
system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerCommand({
        name: "lg:reset",
        description: "Réinitialise la partie de loup garou",
        permissionLevel: CommandPermissionLevel.GameDirectors,
    }, (origin) => {
        const player = origin.sourceEntity;
        if (origin.sourceBlock || player.typeId != "minecraft:player")
            return { status: 1 };
        if (!DB.game) {
            player.sendFormatedMessage("§cAucune partie trouvée.", "warn");
            return { status: 1 };
        }
        resetDataBase(true);
        player.sendFormatedMessage("Partie antérieure supprimée.", "success");
        return { status: 1 };
    });
});
