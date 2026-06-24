import { system, world } from "@minecraft/server";
let defaultSpawnLocation = null;
system.run(() => {
    defaultSpawnLocation = world.getDefaultSpawnLocation();
});
system.runInterval(() => {
    const spawnPoint = { x: defaultSpawnLocation.x, y: defaultSpawnLocation.y + 1, z: defaultSpawnLocation.z };
    const players = world.getAllPlayers();
    players.forEach(player => {
        const playerSpawnPoint = player.getSpawnPoint();
        if (playerSpawnPoint &&
            playerSpawnPoint.x == spawnPoint.x &&
            playerSpawnPoint.y == spawnPoint.y &&
            playerSpawnPoint.z == spawnPoint.z)
            return;
        const dimensionSpawnPoint = { ...spawnPoint, dimension: world.getDimension("minecraft:overworld") };
        player.setSpawnPoint(dimensionSpawnPoint);
    });
}, 100);
