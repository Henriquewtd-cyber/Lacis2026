import { useEffect, useState } from "react";
import { Clock, MapPin, Play, ArrowUpRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

type Evento = {
  id: number;
  titulo: string;
  resumo: string;
  data: string; // "2026-11-25"
  horario: string;
  local: string;
  imagemUrl: string | null;
  videoUrl: string | null;
  link: string | null;
};

// "2026-11-25" -> Date local (evita voltar um dia por causa do fuso)
function paraData(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function Cartao({ evento, passado }: { evento: Evento; passado: boolean }) {
  const data = paraData(evento.data);
  const dia = data.getDate();
  const mes = data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const ano = data.getFullYear();
  const semana = data.toLocaleDateString("pt-BR", { weekday: "long" });

  return (
    <article className={`flex flex-col overflow-hidden bg-[#0a1628] sm:flex-row ${passado ? "opacity-70" : ""}`}>
      {/* bloco da data */}
      <div className="flex shrink-0 flex-row items-baseline gap-3 bg-[#0f3d2e] px-6 py-4 sm:w-32 sm:flex-col sm:items-center sm:justify-center sm:gap-0 sm:py-6">
        <time dateTime={evento.data} className="flex items-baseline gap-2 sm:flex-col sm:items-center sm:gap-0">
          <span className="text-4xl font-extrabold leading-none text-white sm:text-5xl">{dia}</span>
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#9be39b]">{mes}</span>
          <span className="text-xs text-white/60">{ano}</span>
        </time>
        <span className="text-xs capitalize text-white/60 sm:mt-2">{semana}</span>
      </div>

      {/* imagem opcional */}
      {evento.imagemUrl && (
        <img
          src={evento.imagemUrl}
          alt={`Divulgação: ${evento.titulo}`}
          loading="lazy"
          className="aspect-video w-full object-cover sm:aspect-auto sm:w-48"
        />
      )}

      {/* conteúdo */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold leading-snug text-white">{evento.titulo}</h3>
        <p className="mt-2 leading-relaxed text-white/80">{evento.resumo}</p>

        <ul className="mt-4 space-y-1.5 text-sm text-white/70">
          <li className="flex items-center gap-2">
            <Clock size={15} className="shrink-0 text-[#9be39b]" aria-hidden="true" />
            {evento.horario}
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0 text-[#9be39b]" aria-hidden="true" />
            {evento.local}
          </li>
        </ul>

        {(evento.link || evento.videoUrl) && (
          <div className="mt-5 flex flex-wrap gap-3">
            {evento.link && (
              <a
                href={evento.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-black px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#9be39b] hover:text-[#00150a] focus-visible:outline-2 focus-visible:outline-[#9be39b]"
              >
                Saiba mais
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            {evento.videoUrl && (
              <a
                href={evento.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-[#9be39b]/60 px-4 py-2 text-sm font-bold text-[#9be39b] transition-colors hover:bg-[#9be39b] hover:text-[#00150a] focus-visible:outline-2 focus-visible:outline-[#9be39b]"
              >
                <Play size={14} aria-hidden="true" />
                Assistir vídeo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-block bg-black px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">
      {children}
    </h2>
  );
}

export default function Programacao() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/eventos/`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setEventos)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, []);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const proximos = eventos
    .filter((e) => paraData(e.data) >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data));
  const anteriores = eventos
    .filter((e) => paraData(e.data) < hoje)
    .sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="grid min-h-screen bg-[#00150a] text-white lg:grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)] [font-family:'Inter',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* coluna institucional */}
      <aside className="px-8 py-10 lg:sticky lg:top-0 lg:h-screen">
        <Rotulo>Programação</Rotulo>
        <p className="mt-8 text-lg leading-relaxed text-white/85">
          Atividades e eventos promovidos pelo LACIS.
        </p>

        <div className="mt-10 space-y-2 text-[#9be39b]">
          <p><b>USP</b> Universidade de São Paulo</p>
          <p><b>ECA</b> Escola de Comunicações e Artes</p>
          <p><b>CBD</b> Departamento de Informação e Cultura</p>
        </div>

        <p className="mt-10 text-[#9be39b]">
          <b>LACIS</b> Laboratório de Cultura, Informação e Sociedade
        </p>
        <p className="mt-2 text-[#c6ff3d]">lacis@usp.br</p>
      </aside>

      {/* lista */}
      <main className="bg-[#0f3d2e]/40 px-6 py-10 sm:px-10">
        {carregando && (
          <div className="space-y-6" role="status" aria-label="Carregando eventos">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse bg-white/5" />
            ))}
          </div>
        )}

        {erro && (
          <p role="alert" className="bg-[#0a1628] p-6 font-semibold">
            Não foi possível carregar a programação. Tente novamente em instantes.
          </p>
        )}

        {!carregando && !erro && eventos.length === 0 && (
          <p className="border border-dashed border-white/25 p-10 text-center text-white/80">
            Nenhum evento marcado por enquanto. Volte em breve.
          </p>
        )}

        {proximos.length > 0 && (
          <section>
            <Rotulo>Próximos</Rotulo>
            <div className="mt-6 space-y-6">
              {proximos.map((e) => (
                <Cartao key={e.id} evento={e} passado={false} />
              ))}
            </div>
          </section>
        )}

        {anteriores.length > 0 && (
          <section className={proximos.length > 0 ? "mt-14" : ""}>
            <Rotulo>Anteriores</Rotulo>
            <div className="mt-6 space-y-6">
              {anteriores.map((e) => (
                <Cartao key={e.id} evento={e} passado />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}