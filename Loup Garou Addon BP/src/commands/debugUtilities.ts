import { system, CommandPermissionLevel, Player, CustomCommandParamType } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { DB, defaultDataBase, resetDataBase } from "misc/database";
import { setupGame } from "core";

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  customCommandRegistry.registerCommand(
    {
      name: "lg:debug_reset",
      description: "Réinitialise la database (dev)",
      permissionLevel: CommandPermissionLevel.GameDirectors,
    },
    (origin) => {
      const player = origin.sourceEntity as Player
      if (origin.sourceBlock || player.typeId != "minecraft:player") return { status: 1 }
      
      resetDataBase()

      player.sendFormatedMessage("§aDatabase réinitialisée avec succès!", "success")

      return { status: 0 }
    }
  );
  
  customCommandRegistry.registerCommand(
    {
      name: "lg:log_database",
      description: "Renvoie la database (dev)",
      permissionLevel: CommandPermissionLevel.GameDirectors,
    },
    (origin) => {
      const entity = origin.sourceEntity as Player
      if (origin.sourceBlock || entity.typeId != "minecraft:player") return { status: 1 }
      
      console.warn(JSON.stringify(DB));

      return { status: 0 }
    }
  );

  customCommandRegistry.registerCommand(
    {
      name: "lg:set_border_ray",
      description: "Définis le rayon de la bordure (dev)",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      mandatoryParameters: [
        {
          name: "Rayon",
          type: CustomCommandParamType.Integer
        }
      ]
    },
    (origin, ray) => {
      const player = origin.sourceEntity as Player
      if (origin.sourceBlock || player.typeId != "minecraft:player") return { status: 1 }
      
      DB.game.borderRay = ray

      player.sendFormatedMessage(`§aRayon définis sur ${ray} bloc(s)!`, "success")

      return { status: 0 }
    }
  );

  customCommandRegistry.registerEnum("lg:roles", ["werewolf", "villager", "seer", "witch", "hunter", "cupid", "little_girl"]);
  customCommandRegistry.registerCommand(
    {
      name: "lg:force_start",
      description: "Lance la partie immédiatement (dev)",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      optionalParameters: [
        {
          name: "lg:roles",
          type: CustomCommandParamType.Enum
        }
      ]
    },
    (origin, role) => {
      const player = origin.sourceEntity as Player
      if (origin.sourceBlock || player.typeId != "minecraft:player") return { status: 1 }
      
      setupGame(true, role)

      return { status: 0 }
    }
  );

  customCommandRegistry.registerCommand(
    {
      name: "lg:set_game_time",
      description: "Définis le timer de la partie (dev)",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      mandatoryParameters: [
        {
          name: "Minutes",
          type: CustomCommandParamType.Integer
        },
        {
          name: "Secondes",
          type: CustomCommandParamType.Integer
        }
      ]
    },
    (origin, m, s) => {
      const player = origin.sourceEntity as Player
      if (origin.sourceBlock || player.typeId != "minecraft:player") return { status: 1 }
      
      DB.game.timer = m * 60 + s

      return { status: 0 }
    }
  );
});