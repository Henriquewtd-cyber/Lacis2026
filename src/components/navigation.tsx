interface NavigationProps {
    activeSection: string;
    onNavigate: (section: string) => void;
}

interface NavButtonProps {
    label: string;
    section: string;
    isActive: boolean;
    onClick: () => void;
    highlight?: boolean;
}

function NavButton({ label, section, isActive, onClick, highlight }: NavButtonProps) {
    const baseClasses = "w-full text-left px-6 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl";

    if (highlight) {
        return (
            <button
                onClick={onClick}
                className={`${baseClasses} bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 shadow-lg ${isActive ? 'ring-4 ring-yellow-300' : ''
                    }`}
            >
                {label}
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive
                    ? 'bg-teal-500 text-white shadow-lg ring-2 ring-teal-300'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
        >
            {label}
        </button>
    );
}

export default function Navigation({ activeSection, onNavigate }: NavigationProps) {
    const navItems = [
        { label: 'SOBRE O LACIS', section: 'sobre' },
        { label: 'GRUPO DIRETIVO / REGIMENTO', section: 'regimento' },
        { label: 'PROJETOS EM ANDAMENTO', section: 'projetos', highlight: true },
        { label: 'CURSOS DE EXTENSÃO', section: 'cursos' },
        { label: 'REVISTA LACIS: ARTIGOS, RESENHAS, BIBLIOGRAFIA', section: 'revista' },
        { label: 'DIRIGENTES DE CULTURA BRASIL', section: 'dirigentes', highlight: true },
        { label: 'FALE CONOSCO', section: 'contato' },
    ];

    return (
        <nav className="space-y-3 sticky top-4">
            {navItems.map((item) => (
                <NavButton
                    key={item.section}
                    label={item.label}
                    section={item.section}
                    isActive={activeSection === item.section}
                    onClick={() => onNavigate(item.section)}
                    highlight={item.highlight}
                />
            ))}
        </nav>
    );
}