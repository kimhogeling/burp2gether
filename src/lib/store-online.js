import {readable} from "svelte/store";

export const STATUS = {
    UNKNOWN: "UNKNOWN",
    ONLINE: "ONLINE",
    OFFLINE: "OFFLINE",
    DISCONNECTED: "DISCONNECTED",
    RECONNECTED: "RECONNECTED"
};

let previous = STATUS.UNKNOWN;

export const connectionStatus = readable(null, set => {
    function check() {
        switch (previous) {
            case STATUS.UNKNOWN:
                previous = navigator.onLine ? STATUS.ONLINE : STATUS.OFFLINE;
                break;
            case STATUS.ONLINE:
                previous = navigator.onLine ? STATUS.ONLINE : STATUS.DISCONNECTED;
                break;
            case STATUS.OFFLINE:
                previous = navigator.onLine ? STATUS.RECONNECTED : STATUS.OFFLINE;
                break;
            case STATUS.DISCONNECTED:
                previous = navigator.onLine ? STATUS.RECONNECTED : STATUS.DISCONNECTED;
                break;
            case STATUS.RECONNECTED:
                previous = navigator.onLine ? STATUS.ONLINE : STATUS.DISCONNECTED;
                break;
        }
        set(previous);
    }

    check();

    const interval = setInterval(check, 2000);

    // and check every two seconds
    return () => clearInterval(interval);
});
