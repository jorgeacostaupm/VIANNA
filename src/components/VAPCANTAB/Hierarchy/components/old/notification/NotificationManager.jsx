import { useState } from "react";
import { pubsub } from "../../pubsub";
import { motion } from "framer-motion";

const AlertNotification = ({ alert, close, click}) => {
    const { id, type, msg } = alert;
    const tcolor =
        type == "error"
            ? "text-red-500"
            : type == "info"
            ? "text-green-500"
            : "text-amber-400";
    const bcolor =
        type == "error"
            ? "border-red-400"
            : type == "info"
            ? "border-green-400"
            : "border-amber-500";
    const title =
        type === "error"
            ? "Error"
            : type == "info"
            ? "Información"
            : "Advertencia";

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layoutId={id}
            onClick={ click }
            className={`bg-white ${bcolor} border-2 border-solid rounded-lg p-2 max-h-[8.1rem] ease-in-out mb-1 cursor-pointer`}
        >
            <div className="flex items-center">
                <h4 className={`font-semibold text-lg mr-auto ${tcolor} select-none`}>
                    {title}
                </h4>
                <button
                    type="button"
                    onClick={() => close(id)}
                    className="mr-2 justify-self-end"
                >
                    <i
                        className={`fa-solid fa-xmark text-red-600 font-semibold text-2xl `}
                    ></i>
                </button>
            </div>
            <div className="max-h-28 overflow-auto text-[15px] mt-1">{msg}</div>
        </motion.div>
    );
};

let currentAlert = 0;
const MAX_SHOW = 3;
const INFO_DURATION = 1500;
const WARN_DURATION = 30000;
const NotificationManager = () => {
    const [alerts, setAlerts] = useState([]);
    const { subscribe } = pubsub;

    subscribe("addAlertNotification", (alertMsg) => {
        alertMsg.id = currentAlert;
        currentAlert += 1;

        setAlerts((prev) => {
            const newAlerts = [...prev, alertMsg];
            newAlerts.sort((a, b) => {
                // Error messages first
                if (a.type === "error" && b.type !== "error") return -1;
                if (b.type === "error" && a.type !== "error") return 1;
                // Then warn messages
                if (a.type === "warn" && b.type !== "warn") return -1;
                if (b.type === "warn" && a.type !== "warn") return 1;

                if (a.type === "warning" && b.type !== "warning") return -1;
                if (b.type === "warning" && a.type !== "warning") return 1;

                // Finally info messages
                if (a.type === "info" && b.type !== "info") return -1;
                if (b.type === "info" && a.type !== "info") return 1;
                return 0;
            });
            return newAlerts;
        });

        if (alertMsg.type !== "error") {
            setTimeout(() => {
                setAlerts((prevAlerts) =>
                    prevAlerts.filter((alert) => alert.id !== alertMsg.id)
                );
            }, alertMsg.type === 'info' || alertMsg.type === 'warning'? INFO_DURATION : WARN_DURATION);
        }
    });

    const removeAlert = (id) => {
        setAlerts((prevAlerts) =>
            prevAlerts.filter((alert) => alert.id !== id)
        );
    };

    return (
        <div className="fixed top-6 left-[50vw] translate-x-[-50%] flex flex-col w-[26rem] z-30 gap-2 ">
            {alerts.slice(0, MAX_SHOW).map((a) => {
                return (
                    <AlertNotification
                        key={a.id}
                        alert={a}
                        close={removeAlert}
                        click={a.click != null ? a.click : () => {} }
                    />
                );
            })}
        </div>
    );
};

export default NotificationManager;
