export default function Header() {
    return (
        <header className="bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 shadow-2xl">
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight">
                    LACIS
                </h1>
                <p className="text-xl md:text-2xl text-white/95 font-medium mb-2">
                    LABORATÓRIO DE CULTURA, INFORMAÇÃO E SOCIEDADE
                </p>
                <p className="text-base md:text-lg text-white/90 font-light">
                    UNIVERSIDADE DE SÃO PAULO – DEPARTAMENTO DE INFORMAÇÃO E CULTURA
                </p>
            </div>
        </header>
    );
}