import { world } from "@minecraft/server";
import { getGameInfos } from "misc/utils";

world.beforeEvents.playerLeave.subscribe(e => {
  const playerGameInfos = getGameInfos(e.player);

  if (!playerGameInfos) return;

  playerGameInfos.isOnline = false;
})