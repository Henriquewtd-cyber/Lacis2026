"use client";

import { useIsMobile } from "./home-components";
import HomeDesktop from "./home-desktop";
import HomeMobile from "./home-mobile";

export default function Home() {
    const isMobile = useIsMobile(900);

    // Enquanto não sabemos o tamanho da tela, renderiza um fundo neutro
    // (evita "piscar" o layout errado e evita erro de hidratação).
    if (isMobile === null) {
        return <div style={{ minHeight: "100vh", background: "#001800" }} />;
    }

    return isMobile ? <HomeMobile /> : <HomeDesktop />;
}