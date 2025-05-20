import NotificationManager from "./notification/NotificationManager";
import { pubsub } from '../pubsub'

const Header = () => {
    const { publish } = pubsub;

    return (
        <>
            <header className="fixed w-full top-0 h-14 z-[5] bg-violet-900 flex items-center">
                <div
                    className="group flex items-center gap-2 ml-4 cursor-pointer"
                    onClick={() => publish("toggleSideBarEvent", {})}
                >
                    <i className="fa-solid fa-sitemap text-3xl text-white group-hover:scale-105"></i>
                    <h1 className="text-2xl text-white font-semibold select-none group-hover:underline underline-offset-[8px]">
                        Visualizador Jerárquico
                    </h1>
                </div>
            </header>
            <NotificationManager />
        </>
    );
};

export default Header;
