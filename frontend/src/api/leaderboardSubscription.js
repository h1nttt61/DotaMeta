
import cable from "./cable";

export function subscribeToLeaderboard(onUpdate, onStatus) {
    return cable.subscriptions.create("LeaderboardChannel", {
        connected() {
            console.log("Connected to LeaderboardChannel");
            onStatus?.(true);
        },

        disconnected() {
            console.log("Disconnected from LeaderboardChannel");
            onStatus?.(false);
        },

        rejected() {
            console.log("LeaderboardChannel subscription rejected");
            onStatus?.(false);
        },

        received(data) {
            onUpdate(data.players);
        },
    });
}
