import { GameMode, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { manageKill } from "events/onKill";
import { DB } from "misc/database";
import { getGameInfos, teleportPlayerToSpawn } from "misc/utils";
export const roleMessages = {
    werewolf: "Tu est un §l§cLoup garou§r!\n§o§8Tue tous les villageois sans qu'ils s'en rendent compte.§r",
    villager: "Tu est un §l§aVillageois§r!\n§o§8Essaie de survivre et de trouver les loups garous.§r",
    seer: "Tu est la voyante!\n§o§8Essaie de démasquer les loups garous.§r",
    witch: "Tu est la sorcière\n§o§8Tu peut jeter des sort puissant sur qui tu veut.§r",
    hunter: "Tu est le chasseur\n",
    little_girl: "Tu est la petite fille\n",
    ryan: "Tu est Ryan\n"
};
export const rolePowers = {
    werewolf: [
        {
            id: "deadly_attack",
            name: "Attaque sanglante",
            description: "Donne l'effet force II pendant 15 secondes.\n§o§8L'effet est démarré quand tu clique sur ce bouton.§r",
            usageCount: 2,
            iconTexture: "textures/items/diamond_sword",
            use(player) {
                player.addEffect("minecraft:strength", 15 * 20, {
                    amplifier: 1,
                    showParticles: false
                });
            }
        }
    ],
    villager: [],
    seer: [
        {
            id: "crystal_ball",
            name: "Boule de crystal",
            description: "Active un pouvoir qui permet de connaitre le rôle d'un joueur.\n§o§8Click droit sur le joueur.§r",
            iconTexture: "textures/items/ender_pearl",
            usageCount: 1,
            use(player) {
                player.setDynamicProperty("power", "seer:see_role");
            }
        }
    ],
    witch: [
        {
            id: "critical_descision",
            name: "Décision critique",
            description: "Une interface apparait pour jeter un sort à un joueur qui le tuera ou le rammenera à la vie.\n§o§8Ouverture d'une interface.§r",
            iconTexture: "textures/item/redstone",
            usageCount: 10,
            use(player) {
                const playerGameInfos = getGameInfos(player);
                const form = new ActionFormData()
                    .title("Décision critique")
                    .body("Que veut-tu faire?")
                    .button("§cTuer instantanément")
                    .button("§aRammener à la vie");
                // @ts-ignore
                form.show(player).then(r => {
                    if (r.canceled) {
                        playerGameInfos.powerUsed[0].usageRemaining++;
                        return;
                    }
                    const isReviving = r.selection;
                    const globalPlayers = world.getAllPlayers();
                    const onlineGamePlayers = DB.game.players.filter(p => globalPlayers.some(gp => gp.id == p.id) && p.id != player.id);
                    const alivePlayers = onlineGamePlayers.filter(p => p.isAlive);
                    const deadPlayers = onlineGamePlayers.filter(p => !p.isAlive);
                    const concernedPlayersNameList = ["§cAucun§r", ...(isReviving ? deadPlayers.map(p => p.name) : alivePlayers.map(p => p.name))];
                    const selectPlayerForm = new ModalFormData()
                        .title("Choisir un joueur")
                        .label(`${isReviving ? "§aRammener un joueur à la vie" : "§cTuer un joueur immédiatement"}`)
                        .dropdown("Joueur sélectionné", concernedPlayersNameList, { defaultValueIndex: 0 })
                        .submitButton(isReviving ? "Donner la vie" : "Enlever la vie");
                    // @ts-ignore
                    selectPlayerForm.show(player).then(r => {
                        const selectedIndex = Number(r.formValues[1]) - 1;
                        if (r.canceled || selectedIndex == -1) {
                            playerGameInfos.powerUsed[0].usageRemaining++;
                            return;
                        }
                        ;
                        const globalPlayers = world.getAllPlayers();
                        const concernedPlayers = isReviving ? deadPlayers : alivePlayers;
                        const selectedPlayerId = concernedPlayers[selectedIndex].id;
                        const selectedPlayerInfos = DB.game.players.find(p => p.id == selectedPlayerId);
                        const selectedPlayerInstance = globalPlayers.find(p => p.id == selectedPlayerId);
                        if (!selectedPlayerInstance) {
                            player.sendFormatedMessage("§cCe joueur n'est plus trouvable.", "warn");
                            return;
                        }
                        if (isReviving) {
                            selectedPlayerInfos.isAlive = true;
                            selectedPlayerInfos.timeLived = null;
                            teleportPlayerToSpawn(selectedPlayerInstance);
                            selectedPlayerInstance.setGameMode(GameMode.Survival);
                            player.sendFormatedMessage(`§aTu as bien redonné la vie à ${selectedPlayerInfos.name}.`);
                            selectedPlayerInstance.sendFormatedMessage("§aTu as été rammené à la vie par la sorcière grâce à sa magie.");
                        }
                        else {
                            manageKill(player, selectedPlayerInstance);
                            selectedPlayerInstance.sendFormatedMessage("§cTu as été tué par la sorcière grâce à sa magie.");
                        }
                    });
                });
            }
        }
    ],
    hunter: [
        {
            id: "crystal_ball",
            name: "Boule de crystal",
            description: "Active un pouvoir qui permet de connaitre le rôle d'un joueur.\n§o§8Click droit sur le joueur.§r",
            iconTexture: "textures/items/ender_pearl",
            usageCount: 1,
            use(player) {
            }
        }
    ],
    little_girl: [
        {
            id: "crystal_ball",
            name: "Boule de crystal",
            description: "Active un pouvoir qui permet de connaitre le rôle d'un joueur.\n§o§8Click droit sur le joueur.§r",
            iconTexture: "textures/items/ender_pearl",
            usageCount: 1,
            use(player) {
            }
        }
    ],
    ryan: [
        {
            id: "steal",
            name: "Vol sournois",
            description: "Active un pouvoir qui permet de voler un item random d'un joueur.\n§o§8Click droit sur le joueur.§r",
            iconTexture: "textures/items/feather",
            usageCount: 5,
            use(player) {
                player.setDynamicProperty("power", "ryan:steal");
            }
        }
    ]
};
