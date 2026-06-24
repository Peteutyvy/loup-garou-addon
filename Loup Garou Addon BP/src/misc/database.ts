import { system, world } from "@minecraft/server"
import { DataBase } from "types";

export let DB = null as DataBase

export const defaultDataBase = {
  settings: {
    maxPlayers: 10,
    werewolvesCount: 1,
    gameTime: 60,
    borderMaxRay: 500,
    borderMinRay: 50,
    borderReduceRate: 10,
    borderEnabled: true,
    chatDelayEnabled: true,
    chatDelay: 3,
    totalDays: 10
  },
  game: null
} as DataBase

function initializeDatabase() {
  try {
    let dbRaw = world.getDynamicProperty("db") as string;
    if (!dbRaw) {
      const newDb = defaultDataBase;
      dbRaw = JSON.stringify(newDb);
      world.setDynamicProperty("db", dbRaw);
    }
    DB = JSON.parse(dbRaw);

    console.warn("[Database] Database initialisée");
  } catch (error) {
    console.warn("[Database] Erreur pendant l'initialisation de la database : " + error);
  }
}

export function saveDatabase() {
  try {
    world.setDynamicProperty("db", JSON.stringify(DB));
    console.warn("[Database] Sauvegarde de la database réussie");
  } catch (error) {
    console.warn("[Database] Erreur pendant la sauvegarde de la database : " + error);
  }
}

export function resetDataBase(onlyGame?: boolean): void {
  DB.game = null;
  if (onlyGame) return;
  DB.settings = defaultDataBase.settings;
}

system.beforeEvents.startup.subscribe(() => {
  system.run(() => initializeDatabase());
})

system.beforeEvents.shutdown.subscribe(() => {
  saveDatabase();
})