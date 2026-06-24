import { Player } from "@minecraft/server";

interface DataBase {
  settings: {
    maxPlayers: number;
    werewolvesCount: number;
    gameTime: number;
    borderMaxRay: number;
    borderMinRay: number;
    borderReduceRate: number;
    borderEnabled: boolean;
    chatDelayEnabled: boolean;
    chatDelay: number;
    totalDays: number;
  };
  game: {
    players: PlayerLG[];
    isActive: boolean;
    isEnded: boolean;
    timer: number;
    phase: "day" | "night";
    borderRay: number;
    dayCount: number;
    kills: {
      killerName: string;
      killerRole: string;
      targetName: string;
      targetRole: string;
      time: number;
    }[]
  } | null;
}

interface PlayerLG {
  name: string;
  id: string;
  isAlive: boolean;
  isOnline: boolean;
  role: GameRole;
  kills: number;
  deaths: number;
  timeLived: number;
  powerUsed: {
    id: string;
    usageRemaining: number;
  }[]
}

interface RolePower {
  id: string;
  name: string;
  description: string;
  usageCount: number;
  iconTexture?: string;
  use(player: Player): void;
}

interface RolePowers {
  [role: string]: RolePower[];
}

type GameRole = "werewolf" | "villager" | "seer" | "witch" | "hunter" | "little_girl"