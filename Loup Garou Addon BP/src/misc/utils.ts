import { Dimension, DimensionTypes, ItemLockMode, ItemStack, Player, world } from "@minecraft/server";
import { DB } from "./database";
import { PlayerLG } from "types";

export const formatRoleName = (roleId: string): string => ({
  werewolf: "Loup-garou",
  villager: "Villageois",
  seer: "Voyante",
  witch: "Sorcière",
  hunter: "Chasseur",
  cupid: "Cupidon",
  little_girl: "Petite fille"
}[roleId] ?? "Rôle inconnu");

export const formatPhase = (phase: string): string => ({
  day: "Jour",
  night: "Nuit"
}[phase] ?? "Phase inconnue");

export function sendGlobalFormatedMessage(message: string): void {
  world.sendMessage(`[§1Loup Garou§r] ${message}`)
}

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function setMenuItem(player: Player): void {
  const menuItem = new ItemStack("minecraft:enchanted_book", 1);
  menuItem.setLore([
    "§r §l> §r§aCet item permet d'ouvrir le menu du jeu.§r",
    "§8§oCet item ne peut être utlisé sous aucunes circonstances§r"
  ]);
  menuItem.setDynamicProperty("isMenuItem", true);
  menuItem.lockMode = ItemLockMode.slot;
  menuItem.keepOnDeath = true;
  menuItem.nameTag = "§rMenu du jeu";

  player.getComponent("minecraft:inventory").container.setItem(8, menuItem);
}

export function teleportPlayerToSpawn(player: Player): void {
  const defaultSpawnLocation = world.getDefaultSpawnLocation();
  const {x, y, z} = defaultSpawnLocation;
  const overworld = world.getDimension("minecraft:overworld");

  try {
    overworld.setBlockType({x, y: y + 1, z}, "minecraft:air");
    overworld.setBlockType({x, y: y + 2, z}, "minecraft:air");
  } catch {}

  player.teleport({x, y: y + 1, z}, { dimension: overworld });
}

export function getGameInfos(player: Player): PlayerLG | null {
  if (!DB.game) return null;
  return DB.game.players.find(p => p.id == player.id);
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60

  let result = "";

  if (h > 0) result += `${h}h`;
  if (m > 0 || h > 0) result += `${m}m`;
  result += `${s.toFixed(0)}s`;

  return result;
};

export function chance(percent: number): boolean {
  return Math.random() * 100 < percent;
}