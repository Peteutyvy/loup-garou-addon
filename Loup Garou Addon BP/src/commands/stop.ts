import { CommandPermissionLevel, Player, system } from "@minecraft/server";
import { startStopGameTimeout, stopGame } from "core";
import { DB } from "misc/database";

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  customCommandRegistry.registerCommand(
    {
      name: "lg:stop",
      description: "Arrête la partie de loup garou",
      permissionLevel: CommandPermissionLevel.GameDirectors,
    },
    (origin) => {
      const player = origin.sourceEntity as Player;
      if (origin.sourceBlock || player.typeId != "minecraft:player") return { status: 1 };

      if (!DB.game) {
        player.sendFormatedMessage("§cAucune partie n'est en cours.", "warn");
        return { status: 1 }
      } else if (!DB.game.isActive) {
        player.sendFormatedMessage("§cLa partie est déja terminée.", "warn");
        return { status: 1 }
      }

      system.run(() => {
        startStopGameTimeout("La partie a été stoppée par un admin.", true);
      });

      return { status: 0 };
    }
  );
});
