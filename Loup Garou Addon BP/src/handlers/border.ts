import { system, world } from "@minecraft/server";
import { DB } from "misc/database";

const borderReduceRate = 0.5;

system.runInterval(() => {
  if (!DB.game || DB.game.borderRay < DB.settings.borderMinRay || !DB.settings.borderEnabled || !DB.game.isActive) return;

  if (DB.game.borderRay < DB.settings.borderMinRay) return;

  DB.game.borderRay -= borderReduceRate;
}, 20)

system.runInterval(() => {
  if (!DB.game || DB.game.borderRay < DB.settings.borderMinRay || !DB.settings.borderEnabled) return;

  const defaultSpawnLocation = world.getDefaultSpawnLocation();
  const center = { x: defaultSpawnLocation.x, z: defaultSpawnLocation.z };
  const r = DB.game.borderRay;

  for (const player of world.getAllPlayers()) {
    const pos = player.location;

    let impulse = { x: 0, y: 0, z: 0 };
    const force = 1.2;

    if (pos.x < center.x - r) impulse.x = force;
    if (pos.x > center.x + r) impulse.x = -force;
    if (pos.z < center.z - r) impulse.z = force;
    if (pos.z > center.z + r) impulse.z = -force;

    if (impulse.x !== 0 || impulse.z !== 0) {
      impulse.y = 0.15;
      player.applyImpulse(impulse);
      player.sendMessage("§cTu es hors de la zone !");
    }

    const overworld = world.getDimension("overworld");

    const distLeft  = Math.abs(pos.x - (center.x - r));
    const distRight = Math.abs(pos.x - (center.x + r));
    const distTop   = Math.abs(pos.z - (center.z - r));
    const distBot   = Math.abs(pos.z - (center.z + r));

    if (
      distLeft  > 2 &&
      distRight > 2 &&
      distTop   > 2 &&
      distBot   > 2
    ) continue;

    let bx = 0, bz = 0;
    let orientation = "";
    let dist = 0;

    if (distLeft <= 2)  { bx = center.x - r; bz = pos.z; orientation = "YZ"; dist = distLeft; }
    if (distRight <= 2) { bx = center.x + r; bz = pos.z; orientation = "YZ"; dist = distRight; }
    if (distTop <= 2)   { bx = pos.x; bz = center.z - r; orientation = "YX"; dist = distTop; }
    if (distBot <= 2)   { bx = pos.x; bz = center.z + r; orientation = "YX"; dist = distBot; }

    const steps = 40;
    const radius = 0.5 + (2 - dist) * 1.0;
    const headY = pos.y + 1.6;

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;

      let x = bx;
      let y = headY + Math.sin(angle) * radius;
      let z = bz;

      if (orientation === "YZ") {
        z = bz + Math.cos(angle) * radius;
      } else {
        x = bx + Math.cos(angle) * radius;
      }

      overworld.runCommand(
        `particle minecraft:basic_flame_particle ${x} ${y} ${z}`
      );
    }
  }
}, 5);

export function setupBorder(): void {
  DB.game.borderRay = DB.settings.borderMaxRay;
}