import { system, world, GameMode, EntityComponentTypes } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { roleMessages, rolePowers } from "CONFIG";
import { setupBorder } from "handlers/border";
import { DB } from "misc/database";
import { formatDuration, formatRoleName, getGameInfos, sendGlobalFormatedMessage, setMenuItem, shuffleArray, teleportPlayerToSpawn } from "misc/utils";
export function setupGame(force, forceRole) {
    const set = DB.settings;
    const playersRandomized = shuffleArray(world.getAllPlayers());
    const playersGameList = [];
    for (const player of playersRandomized) {
        const index = playersRandomized.indexOf(player);
        let role = null;
        const werewolfCount = set.werewolvesCount;
        const playerCount = playersGameList.length;
        if (forceRole) {
            role = forceRole;
        }
        else {
            if (index < werewolfCount) {
                role = "werewolf";
            }
            else if (index == werewolfCount && playerCount > 3) {
                role = "hunter";
            }
            else if (index == werewolfCount + 1 && playerCount > 4) {
                role = "witch";
            }
            else if (index == werewolfCount + 2 && playerCount > 5) {
                role = "seer";
            }
            else if (index == werewolfCount + 4 && playerCount > 6) {
                role = "little_girl";
            }
            else {
                role = "villager";
            }
        }
        playersGameList.push({
            name: player.name,
            id: player.id,
            isAlive: true,
            isOnline: true,
            role,
            kills: 0,
            deaths: 0,
            timeLived: null,
            powerUsed: rolePowers[role].map(power => {
                return {
                    id: power.id,
                    usageRemaining: power.usageCount
                };
            })
        });
    }
    ;
    DB.game = {
        players: playersGameList,
        isActive: false,
        isEnded: false,
        timer: 0,
        phase: "day",
        borderRay: set.borderMaxRay,
        dayCount: 0,
        kills: []
    };
    sendGlobalFormatedMessage("§aPartie de loup garou démarrée! Préparez vous!");
    if (force) {
        startGame();
        return;
    }
    ;
    sendGlobalFormatedMessage("Début de la partie dans 2 minutes");
    system.runTimeout(() => {
        sendGlobalFormatedMessage("Une minute restante...");
    }, 20 * 60);
    system.runTimeout(() => {
        startGame();
    }, 20 * 60 * 2);
}
function startGame() {
    sendGlobalFormatedMessage("§aPartie de loup garou lancée! Téléportation des joueurs...");
    setupBorder();
    const game = DB.game;
    const globalPlayers = world.getAllPlayers();
    const gamePlayers = globalPlayers.filter(player => game.players.find(p => p.id == player.id));
    game.isActive = true;
    for (const player of globalPlayers) {
        system.run(() => {
            teleportPlayerToSpawn(player);
            player.setGameMode(GameMode.Spectator);
            player.getComponent("minecraft:inventory").container.clearAll();
            player.getComponent(EntityComponentTypes.Hunger).resetToDefaultValue();
            setMenuItem(player);
        });
    }
    ;
    for (const player of gamePlayers) {
        system.run(() => {
            player.setGameMode(GameMode.Survival);
        });
        const playerGameInfos = getGameInfos(player);
        const message = [
            "\n§l-----------------------§r",
            roleMessages[playerGameInfos.role],
            "§l-----------------------§r"
        ].join("\n");
        player.sendMessage(message);
    }
}
export function startStopGameTimeout(message, forceStop) {
    const gamePlayers = DB.game.players;
    for (const player of gamePlayers) {
        if (!player.isAlive)
            continue;
        player.timeLived = DB.game.timer;
    }
    ;
    DB.game.isActive = false;
    world.setAbsoluteTime(0);
    if (forceStop) {
        stopGame();
        return;
    }
    sendGlobalFormatedMessage(`§aLa partie est terminée§r\n§o§8Les résultats seront diffusés dans 30 secondes...§r\n\n${message}`);
    system.runTimeout(() => {
        stopGame();
    }, 20 * 30);
}
export function stopGame() {
    const game = DB.game;
    if (!game)
        return;
    game.isEnded = true;
    world.gameRules.pvp = false;
    const players = world.getAllPlayers();
    for (const player of players) {
        teleportPlayerToSpawn(player);
        player.setGameMode(GameMode.Adventure);
        setMenuItem(player);
        openResultForm(player);
    }
}
export function openResultForm(player) {
    const game = DB.game;
    const gamePlayers = game.players;
    const playerRoles = gamePlayers.map(p => ` - ${p.name} : ${formatRoleName(p.role)}`);
    const playerKills = [...gamePlayers].sort((a, b) => b.kills - a.kills).map((p, i) => ` ${i + 1} - ${p.name} : ${p.kills}`);
    const playerDeaths = [...gamePlayers].sort((a, b) => b.deaths - a.deaths).map((p, i) => ` ${i + 1} - ${p.name} : ${p.deaths}`);
    const alivePlayers = gamePlayers.filter(p => p.isAlive == true);
    const playerAliveStr = alivePlayers.map(p => ` - ${p.name} : ${formatDuration(p.timeLived)}`);
    const werewolves = alivePlayers.filter(p => p.role == "werewolf");
    let winner = null;
    const nonWolfPlayersCount = alivePlayers.length - werewolves.length;
    if (werewolves.length > nonWolfPlayersCount) {
        winner = "§cLoups-Garous§r";
    }
    else if (werewolves.length < nonWolfPlayersCount) {
        winner = "§aVillageois§r";
    }
    else {
        winner = "§8Égalité§r";
    }
    ;
    const killListSorted = game.kills.sort((a, b) => a.time - b.time);
    const killList = killListSorted.map(k => ` - ${formatDuration(k.time)} : ${k.killerName} (${formatRoleName(k.killerRole)}) => ${k.targetName} (${formatRoleName(k.targetRole)})`);
    const body = [
        `Temps total de la partie : ${formatDuration(game.timer)}`,
        `Rôle gagnant : ${winner}\n(${werewolves.length} Loups-Garou & ${alivePlayers.length - werewolves.length} Villageois)`,
        `Survivants :\n§o§8 - Joueur : Temps total§r\n\n${playerAliveStr.join("\n")}`,
        `Joueurs & Rôles:\n§o§8 - Joueur : Rôle§r\n\n${playerRoles.join("\n")}`,
        `Top Kills :\n§o§8 Position - Joueur : Kills§r\n\n${playerKills.join("\n")}`,
        `Top Morts :\n§o§8 Position - Joueur : Morts§r\n\n${playerDeaths.join("\n")}`,
        `Liste des élimitations :\n§o§8 Position - Temps :\n Tueur (role) => Victime (role)§r\n\n${killList.join("\n\n")}${killList.length ? "" : " §cAucuns Kills"}`,
        "§o§8Fait /results pour revoir cette interface ou clique sur le menu du jeu."
    ].join("\n\n");
    const form = new ActionFormData()
        .title("Résultats de la dernière partie")
        .body(body)
        .button("§cFermer");
    // @ts-ignore
    form.show(player).then();
}
