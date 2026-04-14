interface TimelineItemProps {
    date: string;
    title: string;
}

function TimelineItem({ date, title }: TimelineItemProps) {
    return (
        <div className="group relative pl-8 pb-6 last:pb-0">
            {/* Linha vertical */}
            <div className="absolute left-2 top-0 h-full w-0.5 bg-gradient-to-b from-teal-400 to-transparent group-last:hidden" />

            {/* Ponto */}
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-teal-400 ring-4 ring-teal-400/20 group-hover:scale-125 transition-transform" />

            {/* Conteúdo */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-all duration-300 border border-white/10">
                <div className="text-teal-300 font-semibold text-sm mb-1">
                    {date}
                </div>
                <div className="text-gray-200 text-sm leading-relaxed">
                    {title}
                </div>
            </div>
        </div>
    );
}

export default function TimelineSection() {
    const timelineEvents = [
        { date: '10-09-2022', title: 'SARAU DA PRIMAVERA EM OSASCO' },
        { date: '12-09-2022', title: 'EXPOSIÇÃO SER ARQUITETO – SANTO ANDRÉ' },
        { date: '15-09-2022', title: 'SER JORNALISTA - ARARAQUARA' },
        { date: '16-09-2022', title: 'DEFESA DE TESE SOBRE POLÍTICAS CULTURAIS' },
        { date: '18-09-2022', title: 'INÍCIO DO CURSO DE MÚSICA' },
    ];

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl sticky top-4">
            <div className="mb-6">
                <h2 className="text-3xl font-black text-white mb-2">
                    LINHA DO TEMPO
                </h2>
                <p className="text-teal-300 font-medium">
                    TEXTOS – FOTOS - VÍDEOS
                </p>
            </div>

            <div className="space-y-0">
                {timelineEvents.map((event, index) => (
                    <TimelineItem
                        key={index}
                        date={event.date}
                        title={event.title}
                    />
                ))}
            </div>
        </div>
    );
}