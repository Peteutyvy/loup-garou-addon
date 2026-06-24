import { system, world } from "@minecraft/server";
import { DB } from "misc/database";
import { sendGlobalFormatedMessage } from "misc/utils";

system.runInterval(() => {
  if (!DB || !DB.game || !DB.game.isActive) return;

  const totalGameTime = DB.settings.gameTime * 60;
  const totalDays = DB.settings.totalDays;

  const cycleDuration = totalGameTime / totalDays;
  const cyclePos = DB.game.timer % cycleDuration;

  const half = cycleDuration / 2;
  const newPhase = cyclePos < half ? "day" : "night";

  if (newPhase !== DB.game.phase) {
    DB.game.phase = newPhase;

    if (newPhase === "day") {
      sendGlobalFormatedMessage("§eLe soleil se lève. §6Une nouvelle journée commence.\n\n§o§aPvP entres joueurs désactivé!");

      world.gameRules.pvp = false;
    } else {
      sendGlobalFormatedMessage("§9La nuit tombe. §1Les ombres s'étendent.\n\n§o§cPvP entres joueurs activé!");

      world.gameRules.pvp = true;
    }
  }

  const newDay = Math.min(
    Math.floor(DB.game.timer / cycleDuration) + 1,
    totalDays
  );

  if (newDay !== DB.game.dayCount) {
    DB.game.dayCount = newDay;
    sendGlobalFormatedMessage(`§bLe Jour §3${newDay} §bcommence.`);
  }

  const mcTime = Math.floor((cyclePos / cycleDuration) * 24000);
  world.setTimeOfDay(mcTime);
}, 5);