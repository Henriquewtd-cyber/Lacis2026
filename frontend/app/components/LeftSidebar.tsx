export function LeftSidebar() {
    return (
        <aside
            className="
        left-rule
        relative z-20 flex flex-col items-center
        bg-bark
        px-0 py-7
        overflow-hidden
      "
            style={{ width: 'var(--left-w, 180px)' }}
        >
            {/* Logo — mix-blend-mode multiply some o fundo branco */}
            <div
                className="flex-shrink-0 flex items-center justify-center mt-[60px] mb-8"
                style={{ width: 72, height: 72 }}
            >
                <img
                    src="/lacis_logo.png"
                    alt="Logo LACIS"
                    className="w-full h-full object-contain"
                    style={{ mixBlendMode: 'multiply' }}
                />
            </div>

            {/* LACIS — vertical */}
            <div
                className="
          writing-vertical font-serif
          flex flex-1 items-center
          text-cream font-light leading-none
          tracking-[0.3em]
        "
                style={{ fontSize: '3.6rem' }}
            >
                LACIS
            </div>

            {/* Footer label */}
            <span
                className="
          writing-vertical flex-shrink-0
          font-sans font-extralight uppercase tracking-[0.22em]
          text-white/20
        "
                style={{ fontSize: '0.58rem' }}
            >
                Est. 2018 · UFBA
            </span>
        </aside>
    )
}