import { GameMode, ItemStack, world } from "@minecraft/server";
import { DB } from "misc/database";
import { initPlayer } from "./onStart";
import { getGameInfos, setMenuItem, teleportPlayerToSpawn } from "misc/utils";

world.afterEvents.playerSpawn.subscribe(e => {
  if (!e.initialSpawn) return;

  const game = DB.game;
  const player = e.player;

  initPlayer(player);

  setMenuItem(player);

  if (!DB.game) {
    world.gameRules.pvp = false;
  };

  if (!game) {
    player.sendFormatedMessage("Bienvenue dans un loup garou! La partie n'est pas encore commencée.");
    teleportPlayerToSpawn(player);
    player.setGameMode(GameMode.Adventure);
    return;
  }

  const playerGameInfos = getGameInfos(player);

  if (!playerGameInfos) {
    player.setGameMode(GameMode.Spectator);
    teleportPlayerToSpawn(player);
    player.sendFormatedMessage("La partie est déja commencée. Tu est donc spectateur de la partie");
  } else {
    player.sendFormatedMessage("Bon retour dans le jeu!");
    
    playerGameInfos.isOnline = true;
  };
});