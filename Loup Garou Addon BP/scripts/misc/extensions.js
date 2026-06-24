import { Player } from "@minecraft/server";
;
Player.prototype.sendFormatedMessage = function (message, type, error) {
    switch (type) {
        case "warn":
            this.sendMessage(`[§cAttention§r] ${message}`);
            break;
        case "success":
            this.sendMessage(`[§aSuccès§r] ${message}`);
            break;
        case "error":
            this.sendMessage(`[§c§lErreur§r] ${message}\n§7§o${error}`);
            break;
        default:
            this.sendMessage(`[§1Loup Garou§r] ${message}`);
            break;
    }
    ;
};
