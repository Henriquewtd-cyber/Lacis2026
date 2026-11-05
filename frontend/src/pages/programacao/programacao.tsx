import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarX, Clock, ExternalLink, MapPin } from "lucide-react";

// ---------- configuração ----------

// Ajuste para o endereço do seu backend Laravel.
// Vite: VITE_API_URL=http://localhost:8000  |  Next.js: troque por process.env.NEXT_PUBLIC_API_URL
const API_URL: string = import.meta.env?.VITE_API_URL ?? "";
const ENDPOINT = `${API_URL}/api/eventos/all`;

// ---------- tipo (modelo vindo do Laravel) ----------

export type Evento = {
  id: number;
  titulo: string;
  descricao: string | null;
  inicio: string; // "2026-11-10 09:00:00"
  termino: string | null; // "2026-11-12 18:00:00"
  modalidade: string; // "Presencial" | "Online" | "Híbrido"
  local: string | null;
  cidade: string | null;
  uf: string | null;
  link: string | null;
  imagem_capa: string | null;
  publicado: boolean;
  created_at: string;
  updated_at: string;
};

// ---------- requisição ----------

// Aceita tanto um array puro quanto o formato paginado/Resource do Laravel ({ data: [...] })
async function buscarEventos(sinal: AbortSignal): Promise<Evento[]> {
  const resposta = await fetch(ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: sinal,
  });
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar a programação (erro ${resposta.status}).`);
  }
  const corpo = await resposta.json();
  const lista: Evento[] = Array.isArray(corpo) ? corpo : corpo?.data ?? [];
  return lista.filter((e) => e.publicado !== false);
}

// ---------- utilitários de data ----------

// "2026-11-10 09:00:00" (ou ISO com T) -> Date no fuso local
function paraData(valor: string) {
  const [dia, hora = ""] = valor.split(/[T ]/);
  const [ano, mes, d] = dia.split("-").map(Number);
  const [h = 0, min = 0] = hora.split(":").map(Number);
  return new Date(ano, mes - 1, d, h, min);
}

const mesmoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function fimDoEvento(e: Evento) {
  return paraData(e.termino ?? e.inicio);
}

function formatarPeriodo(e: Evento) {
  const ini = paraData(e.inicio);
  const fim = e.termino ? paraData(e.termino) : null;
  const dia = (d: Date) => d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  const semana = (d: Date) => d.toLocaleDateString("pt-BR", { weekday: "long" });

  if (!fim || mesmoDia(ini, fim)) return `${dia(ini)} (${semana(ini)})`;
  return `${dia(ini)} a ${dia(fim)}`;
}

function formatarHorario(e: Evento) {
  const hora = (d: Date) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).replace(":00", "h").replace(":", "h");
  const ini = paraData(e.inicio);
  const fim = e.termino ? paraData(e.termino) : null;
  return fim ? `${hora(ini)} às ${hora(fim)}` : hora(ini);
}

function formatarLocal(e: Evento) {
  const cidade = [e.cidade, e.uf].filter(Boolean).join("/");
  return [e.local, cidade].filter(Boolean).join(" · ");
}

// ---------- estilos reutilizados ----------

const foco = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9be39b]";

// Rótulo preto com texto branco espaçado, igual a "HISTÓRICO" e "COORDENAÇÃO" da página Sobre
function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-block bg-black px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">
      {children}
    </h2>
  );
}

// ---------- card ----------

function Cartao({ evento }: { evento: Evento }) {
  const agora = new Date();
  const emAndamento = paraData(evento.inicio) <= agora && fimDoEvento(evento) >= agora;
  const local = formatarLocal(evento);

  return (
    <article className="flex flex-col overflow-hidden bg-[#0f3d2e] sm:flex-row">
      <div className="relative aspect-3/2 shrink-0 bg-[#0a2a20] sm:aspect-auto sm:w-56">
        {evento.imagem_capa ? (
          <img
            src={evento.imagem_capa}
            alt={`Imagem de divulgação: ${evento.titulo}`}
            loading="lazy"
            className="size-full object-cover sm:absolute sm:inset-0"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[#9be39b]/70">
            <CalendarDays size={40} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-black px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white">
            {evento.modalidade}
          </span>
          {emAndamento && (
            <span className="bg-[#9be39b] px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-[#00150a]">
              Em andamento
            </span>
          )}
        </div>

        <h3 className="mt-3 text-2xl font-bold leading-snug text-white">{evento.titulo}</h3>

        <p className="mt-1 font-semibold text-[#9be39b]">
          <time dateTime={evento.inicio}>{formatarPeriodo(evento)}</time>
        </p>

        {evento.descricao && (
          <p className="mt-3 max-w-prose text-base leading-relaxed text-white/80">{evento.descricao}</p>
        )}

        <ul className="mt-4 space-y-1.5 text-sm text-white/75">
          <li className="flex items-start gap-2">
            <Clock size={16} className="mt-0.5 shrink-0 text-[#9be39b]" aria-hidden="true" />
            {formatarHorario(evento)}
          </li>
          {local && (
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#9be39b]" aria-hidden="true" />
              {local}
            </li>
          )}
        </ul>

        {evento.link && (
          <div className="mt-auto pt-5">
            <a
              href={evento.link}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 bg-black px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#9be39b] hover:text-[#00150a] ${foco}`}
            >
              Saiba mais
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

// ---------- página ----------

export default function Programacao() {
  const [lista, setLista] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [passados, setPassados] = useState(false);
  const [modalidade, setModalidade] = useState<string>("Todas");

  useEffect(() => {
    const controle = new AbortController();
    setCarregando(true);
    setErro(null);

    buscarEventos(controle.signal)
      .then(setLista)
      .catch((e: Error) => {
        if (e.name !== "AbortError") {
          setErro(e.message || "Não foi possível carregar a programação.");
        }
      })
      .finally(() => {
        if (!controle.signal.aborted) setCarregando(false);
      });

    return () => controle.abort();
  }, [tentativa]);

  const agora = new Date();

  const modalidades = useMemo(
    () => ["Todas", ...Array.from(new Set(lista.map((e) => e.modalidade).filter(Boolean)))],
    [lista],
  );

  const proximos = useMemo(
    () =>
      lista
        .filter((e) => fimDoEvento(e) >= agora)
        .sort((a, b) => paraData(a.inicio).getTime() - paraData(b.inicio).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lista],
  );

  const visiveis = useMemo(() => {
    const base = lista.filter((e) => (passados ? fimDoEvento(e) < agora : fimDoEvento(e) >= agora));
    const filtrados = modalidade === "Todas" ? base : base.filter((e) => e.modalidade === modalidade);
    return filtrados.sort((a, b) => {
      const diff = paraData(a.inicio).getTime() - paraData(b.inicio).getTime();
      return passados ? -diff : diff;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, passados, modalidade]);

  const destaque = proximos[0];

  const aba = (ativa: boolean) =>
    `px-4 py-2 text-sm font-bold transition-colors ${foco} ${ativa ? "bg-black text-white" : "bg-transparent text-[#9be39b] hover:bg-white/10"
    }`;

  const chip = (ativa: boolean) =>
    `px-3 py-1.5 text-sm font-semibold transition-colors ${foco} ${ativa ? "bg-[#9be39b] text-[#00150a]" : "bg-white/10 text-white hover:bg-white/20"
    }`;

  return (
    <div className="min-h-screen bg-[#00150a] text-white [font-family:'Inter',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)_minmax(0,1fr)]">
        {/* coluna esquerda: título e filtros */}
        <aside className="bg-[#00150a] px-8 py-10">
          <Rotulo>Programação</Rotulo>

          <p className="mt-8 text-lg leading-relaxed text-white/85">
            Atividades e eventos promovidos pelo LACIS — Laboratório de Cultura, Informação e Sociedade.
          </p>

          <div role="group" aria-label="Filtrar por período" className="mt-8 inline-flex border border-[#9be39b]/50">
            <button type="button" aria-pressed={!passados} onClick={() => setPassados(false)} className={aba(!passados)}>
              Próximos
            </button>
            <button
              type="button"
              aria-pressed={passados}
              onClick={() => setPassados(true)}
              className={`${aba(passados)} border-l border-[#9be39b]/50`}
            >
              Anteriores
            </button>
          </div>

          {modalidades.length > 2 && (
            <div className="mt-8">
              <p className="text-sm font-semibold text-[#9be39b]">Modalidade</p>
              <div role="group" aria-label="Filtrar por modalidade" className="mt-3 flex flex-wrap gap-2">
                {modalidades.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={modalidade === m}
                    onClick={() => setModalidade(m)}
                    className={chip(modalidade === m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-12 text-sm text-[#9be39b]">lacis@usp.br</p>
        </aside>

        {/* coluna central: lista de eventos */}
        <main className="bg-[#0a1628] px-6 py-10 sm:px-10">
          <h1 className="sr-only">Programação do LACIS</h1>

          {carregando && (
            <div className="space-y-6" role="status" aria-label="Carregando eventos">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 animate-pulse bg-white/5" />
              ))}
            </div>
          )}

          {erro && (
            <div role="alert" className="bg-[#0f3d2e] p-8 text-center">
              <p className="font-semibold">{erro}</p>
              <button
                type="button"
                onClick={() => setTentativa((t) => t + 1)}
                className={`mt-4 bg-black px-4 py-2 text-sm font-bold text-white hover:bg-[#9be39b] hover:text-[#00150a] ${foco}`}
              >
                Tentar de novo
              </button>
            </div>
          )}

          {!carregando && !erro && visiveis.length === 0 && (
            <div className="flex flex-col items-center border border-dashed border-white/25 px-6 py-16 text-center">
              <CalendarX size={32} className="text-[#9be39b]" aria-hidden="true" />
              <p className="mt-3 font-semibold">
                {passados ? "Nenhum evento anterior encontrado." : "Nenhum evento marcado por enquanto."}
              </p>
              <p className="mt-1 text-sm text-white/70">
                {passados ? "Os eventos já realizados aparecerão aqui." : "Volte em breve para ver as novidades."}
              </p>
            </div>
          )}

          {!carregando && !erro && visiveis.length > 0 && (
            <div className="space-y-6">
              {visiveis.map((e) => (
                <Cartao key={e.id} evento={e} />
              ))}
            </div>
          )}
        </main>

        {/* coluna direita: próximo evento */}
        <aside className="bg-[#0f3d2e] px-8 py-10">
          <Rotulo>Próximo evento</Rotulo>

          {!carregando && !erro && destaque ? (
            <div className="mt-8">
              {destaque.imagem_capa && (
                <img
                  src={destaque.imagem_capa}
                  alt={`Imagem de divulgação: ${destaque.titulo}`}
                  className="aspect-3/2 w-full object-cover"
                />
              )}
              <h3 className="mt-5 text-xl font-bold leading-snug">{destaque.titulo}</h3>
              <p className="mt-2 font-semibold text-[#9be39b]">
                <time dateTime={destaque.inicio}>{formatarPeriodo(destaque)}</time>
              </p>
              <p className="mt-1 text-sm text-white/75">{formatarHorario(destaque)}</p>
              {formatarLocal(destaque) && <p className="mt-1 text-sm text-white/75">{formatarLocal(destaque)}</p>}
              {destaque.link && (
                <a
                  href={destaque.link}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-5 inline-block text-lg font-semibold underline underline-offset-4 hover:text-[#9be39b] ${foco}`}
                >
                  Mais informações
                </a>
              )}
            </div>
          ) : (
            !carregando &&
            !erro && <p className="mt-8 text-white/75">Nenhum evento futuro cadastrado.</p>
          )}
        </aside>
      </div>
    </div>
  );
}