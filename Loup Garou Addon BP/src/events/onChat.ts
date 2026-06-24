import { system, world } from "@minecraft/server";
import { DB } from "misc/database";

const chatCooldownDateTime = new Map();

world.beforeEvents.chatSend.subscribe(e => {
  const now = Date.now();
  const cooldown = chatCooldownDateTime.get(e.sender.id) ?? 0;

  if (DB.settings.chatDelayEnabled && cooldown > now) {
    e.cancel = true;

    const remainingMs = cooldown - now;
    const remainingSec = (remainingMs / 1000).toFixed(1);

    e.sender.sendMessage(`§cTu peux reparler dans ${remainingSec} seconde(s).`);
    return;
  }

  const delay = DB.settings.chatDelay * 1000;
  chatCooldownDateTime.set(e.sender.id, now + delay);

  if (DB.game) {
    e.cancel = true;
    e.sender.sendMessage("§cLe chat est désactivé.");
  }
});