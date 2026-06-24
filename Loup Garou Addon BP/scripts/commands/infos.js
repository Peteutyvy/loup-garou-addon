import { system, CommandPermissionLevel } from "@minecraft/server";
system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerCommand({
        name: "lg:infos",
        description: "Obtiens des informations sur l'Addon",
        permissionLevel: CommandPermissionLevel.Any,
    }, (origin) => {
        const player = origin.sourceEntity;
        if (origin.sourceBlock || player.typeId != "minecraft:player")
            return { status: 1 };
        const message = [
            "§l-----------------------§r",
            `§l§1Loup-Garou Addon§r`,
            `§o§1Développé par Peteutyvy`,
            `§o§8Discord: peteutyvy`,
            "§r§l-----------------------§r"
        ].join("\n");
        player.sendMessage(message);
        return { status: 0 };
    });
});
