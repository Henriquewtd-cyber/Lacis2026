export function RightSidebar() {
    return (
        <aside
            className="
        relative z-20
        flex flex-col
        bg-cream border-l border-sand
        overflow-hidden
      "
            style={{ width: 'var(--right-w, 260px)', padding: '52px 32px 40px' }}
        >
            {/* Eyebrow */}
            <div
                className="eyebrow-line flex items-center gap-2 font-sans font-light uppercase text-terra"
                style={{ fontSize: '0.58rem', letterSpacing: '0.22em', marginBottom: 24 }}
            >
                Identidade
            </div>

            {/* Title */}
            <h2
                className="font-serif font-normal text-ink leading-[1.15]"
                style={{ fontSize: '1.65rem', letterSpacing: '-0.01em', marginBottom: 20 }}
            >
                O que é o LACIS?
            </h2>

            {/* Rule */}
            <div
                className="bg-terra opacity-50 flex-shrink-0"
                style={{ width: 24, height: 1, marginBottom: 28 }}
            />

            {/* Body */}
            <div
                className="font-sans font-light text-umber flex-1 overflow-hidden"
                style={{ fontSize: '0.81rem', lineHeight: '1.85' }}
            >
                <p style={{ marginBottom: 16 }}>
                    O LACIS é um laboratório de pesquisa dedicado às{' '}
                    <em className="font-serif not-italic text-bark" style={{ fontSize: '0.86rem', fontStyle: 'italic' }}>
                        intersecções entre arte, cultura e imaginário social
                    </em>
                    . Nascido no interior de uma universidade pública, funciona como espaço
                    de produção crítica, criação experimental e reflexão coletiva.
                </p>
                <p style={{ marginBottom: 16 }}>
                    Reunimos pesquisadores, artistas e estudantes em projetos que interrogam
                    como a cultura constitui identidades, territórios e subjetividades
                    contemporâneas.
                </p>
                <p>
                    Nossa prática sustenta-se no rigor acadêmico e na abertura estética —
                    compreendendo que{' '}
                    <em className="font-serif text-bark" style={{ fontSize: '0.86rem', fontStyle: 'italic' }}>
                        pensamento e forma são inseparáveis
                    </em>
                    .
                </p>
            </div>

            {/* Meta */}
            <div
                className="flex-shrink-0 border-t border-sand"
                style={{ marginTop: 36, paddingTop: 28 }}
            >
                {[
                    { key: 'Área', val: 'Estudos Culturais' },
                    { key: 'Vínculo', val: 'Fac. de Comunicação' },
                    { key: 'Projetos', val: '12 em andamento' },
                    { key: 'Fundado', val: '2018' },
                ].map(({ key, val }, i, arr) => (
                    <div
                        key={key}
                        className="flex flex-col"
                        style={{ marginBottom: i < arr.length - 1 ? 18 : 0 }}
                    >
                        <span
                            className="font-sans font-light uppercase text-warm"
                            style={{ fontSize: '0.54rem', letterSpacing: '0.2em', marginBottom: 3 }}
                        >
                            {key}
                        </span>
                        <span
                            className="font-serif italic text-bark leading-snug"
                            style={{ fontSize: '0.88rem' }}
                        >
                            {val}
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    )
}