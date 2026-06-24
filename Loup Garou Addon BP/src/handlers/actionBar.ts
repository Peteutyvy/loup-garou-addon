import { Player, system, world } from "@minecraft/server";
import { DB } from "misc/database";
import { formatDuration, formatPhase, formatRoleName, getGameInfos } from "misc/utils";

system.runInterval(() => {
  world.getAllPlayers().forEach(player => {
    showActionbar(player);
  });
}, 20)

function showActionbar(player: Player) {
  const playerGameInfos = getGameInfos(player);

  const actionBarLines = [];

  if (DB.game && DB.game.isActive && playerGameInfos) {
    actionBarLines.push(`Jour ${DB.game.dayCount} (${formatPhase(DB.game.phase)})`);
    actionBarLines.push(`Rôle: ${formatRoleName(playerGameInfos.role)}`);
    actionBarLines.push(`Temps restant: ${formatDuration((DB.settings.gameTime * 60) - DB.game.timer)}`)
  } else if (DB.game && !playerGameInfos && DB.game.isActive) {
    actionBarLines.push(`Partie en cours...`);
  } else if (DB.game && !DB.game.isActive && DB.game.isEnded) {
    actionBarLines.push(`Partie terminée...`);
  } else if (DB.game && !DB.game.isActive && !DB.game.isEnded) {
  } else if (!DB.game) {
    actionBarLines.push(`§cAucune partie en cours...`);
  }
  
  const actionBarMessage = actionBarLines.join("\n");
  player.onScreenDisplay.setActionBar(actionBarMessage);
}