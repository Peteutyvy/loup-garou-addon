import { system } from "@minecraft/server";
import { startStopGameTimeout } from "core";
import { DB } from "misc/database";

system.runInterval(() => {
  const game = DB.game;

  if (!game || !game.isActive || game.isEnded) return;

  game.timer += 0.25

  if (game.timer >= DB.settings.gameTime * 60) {
    startStopGameTimeout(`Partie terminée à cause de la limite de temps...`);
  }
}, 5)