import { system, CommandPermissionLevel, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { DB } from "misc/database";

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  customCommandRegistry.registerCommand(
    {
      name: "lg:settings",
      description: "Accède aux paramètres du jeu",
      permissionLevel: CommandPermissionLevel.GameDirectors,
    },
    (origin) => {
      const entity = origin.sourceEntity as Player;
      if (origin.sourceBlock || entity.typeId != "minecraft:player") return { status: 1 };
      
      system.run(() => {
        openSettingsForm(entity);
      });

      return { status: 0 };
    }
  );
});

function openSettingsForm(player: Player): void {
  const form = new ModalFormData()
    .title("Paramètres du jeu")
    .slider("Joueurs max", 2, 20, {defaultValue: DB.settings.maxPlayers})
    .toggle("Bordure", {defaultValue: DB.settings.borderEnabled})
    .slider("Diminution de la bordure\n(blocs x10^-1/sec)", 1, 30, {defaultValue: DB.settings.borderReduceRate, valueStep: 1})
    .slider("Rayon bordure min", 1, 500, {defaultValue: DB.settings.borderMinRay})
    .slider("Rayon bordure max", 500, 1000, {defaultValue: DB.settings.borderMaxRay})
    .textField("Temps de la partie (Minutes)", "", {defaultValue: DB.settings.gameTime.toString()})
    .textField("Nombre de loups garous", "", {defaultValue: DB.settings.werewolvesCount.toString()})
    .toggle("Délai de chat", {defaultValue: DB.settings.chatDelayEnabled})
    .slider("Temps du délai de chat (sec)", 1, 20, {defaultValue: DB.settings.chatDelay})
    .textField("Nombre de jours (Durée variable en fonction du temps de la partie)", "", {defaultValue: DB.settings.totalDays.toString()})
    .submitButton("Appliquer")
  // @ts-ignore
  form.show(player as Player).then(r => {
    if (r.canceled) return;

    const s = DB.settings;
    const res = r.formValues;

    try {
      s.maxPlayers = Number(res[0]);
      s.borderEnabled = Boolean(res[1]);
      s.borderReduceRate = (Number(res[2])) * 0.1;
      s.borderMinRay = Number(res[3]);
      s.borderMaxRay = Number(res[4]);
      s.gameTime = Number(res[5]);
      s.werewolvesCount = Number(res[6]);
      s.chatDelayEnabled = Boolean(res[7]);
      s.chatDelay = Number(res[8]);
      s.totalDays = Number(res[9]);

      player.sendFormatedMessage("§aLes modifications ont bien étés appliquées", "success");
    } catch (err) {
      player.sendFormatedMessage("§cLes modifications n'ont pas pu être appliquées", "error", err);
    };
  });
};