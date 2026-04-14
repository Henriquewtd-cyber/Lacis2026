interface EventProps {
    date: string;
    title: string;
}

function EventItem({ date, title }: EventProps) {
    return (
        <div className="flex gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10">
            <div className="flex-shrink-0 text-teal-400 font-mono font-semibold min-w-[110px]">
                {date}
            </div>
            <div className="text-gray-200 flex-1">
                {title}
            </div>
        </div>
    );
}

export default function AgendaSection() {
    const events = [
        { date: '15/10/2022', title: 'SEMINÁRIO CULTURA EM CRISE' },
        { date: '18/10/2022', title: 'ENCONTRO COM O AUTOR EM IEPÊ' },
        { date: '02/11/2022', title: 'ABERTURA EXPOSIÇÃO DE ARTES EM JAÚ' },
        { date: '07/11/2022', title: 'TEATRO EM TAUBATÉ: PLÍNIO MARCOS' },
    ];

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-6">
                <h2 className="text-4xl font-black text-white text-center">
                    AGENDA LACIS
                </h2>
            </div>

            <div className="p-6 space-y-3">
                {events.map((event, index) => (
                    <EventItem key={index} date={event.date} title={event.title} />
                ))}
            </div>

            <div className="p-6">
                <div className="rounded-lg overflow-hidden shadow-xl">
                    <img
                        src="/seminario-cultura.jpg"
                        alt="Seminário Cultura em Crise na USP"
                        className="w-full h-auto"
                    />
                    <div className="bg-black/80 text-white text-center py-3 px-4">
                        <p className="font-semibold">SEMINÁRIO CULTURA EM CRISE NA USP</p>
                    </div>
                </div>
            </div>
        </div>
    );
}