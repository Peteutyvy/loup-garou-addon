import { Player } from "@minecraft/server";
import { DB } from "./database";
import { PlayerLG } from "types";

declare module "@minecraft/server" {
  interface Player {
    sendFormatedMessage(message: string, type?: "info" | "warn" | "error" | "success", error?: string): void;
  }
};

Player.prototype.sendFormatedMessage = function(message, type?: "info" | "warn" | "error" | "success", error?) { 
  switch (type) {
    case "warn": this.sendMessage(`[§cAttention§r] ${message}`); break;
    case "success": this.sendMessage(`[§aSuccès§r] ${message}`); break;
    case "error": this.sendMessage(`[§c§lErreur§r] ${message}\n§7§o${error}`); break;
    default: this.sendMessage(`[§1Loup Garou§r] ${message}`); break;
  };
};