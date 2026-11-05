import { useEffect, useState } from "react";
import { CalendarDays, CalendarX, Clock, MapPin, Play } from "lucide-react";
import type { Evento } from "./evento/tipoevento";
import { buscarEventos } from "./evento/eventos";

// ---------- utilitários ----------

// "2026-11-07" -> Date no fuso local (evita voltar um dia por causa do UTC-3)
function paraData(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function diasAte(iso: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((paraData(iso).getTime() - hoje.getTime()) / 86_400_000);
}

// Só aceita YouTube e Vimeo; qualquer outro endereço vira null (sem player)
function urlDoPlayer(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") return `https://player.vimeo.com/video/${u.pathname.slice(1)}`;
  } catch {
    // URL inválida
  }
  return null;
}

const foco =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c3b2e]";

// ---------- card ----------

function Cartao({
  evento,
  tocando,
  aoTocar,
}: {
  evento: Evento;
  tocando: boolean;
  aoTocar: () => void;
}) {
  const player = urlDoPlayer(evento.videoUrl);
  const data = paraData(evento.data);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#0c3b2e]/15 bg-white">
      <div className="relative aspect-3/2 shrink-0 bg-[#e3ece4]">
        {tocando && player ? (
          <iframe
            src={player}
            title={`Vídeo: ${evento.titulo}`}
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="size-full"
          />
        ) : (
          <>
            {evento.imagemUrl ? (
              <img
                src={evento.imagemUrl}
                alt={`Imagem de divulgação: ${evento.titulo}`}
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[#0c3b2e]">
                <CalendarDays size={40} strokeWidth={1.5} aria-hidden="true" />
              </div>
            )}
            {player && (
              <button
                type="button"
                onClick={aoTocar}
                className={`absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-md bg-white/95 px-3 py-1.5 text-sm font-semibold text-[#0c3b2e] shadow-sm transition-colors hover:bg-white ${foco}`}
              >
                <Play size={14} aria-hidden="true" />
                Assistir vídeo
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold text-[#0c3b2e]">
          <time dateTime={evento.data}>
            {data.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "long" })}
          </time>
        </p>

        <h3 className="mt-1 text-xl font-bold leading-snug text-[#1b2f25]">{evento.titulo}</h3>

        <p className="mt-2 leading-relaxed text-[#3d5648]">{evento.resumo}</p>

        <ul className="mt-4 space-y-1.5 text-sm text-[#3d5648]">
          <li className="flex items-start gap-2">
            <Clock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {evento.horario}
          </li>
          <li className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {evento.local}
          </li>
        </ul>

        {evento.link && (
          <div className="mt-auto pt-5">
            <a
              href={evento.link}
              target="_blank"
              rel="noreferrer"
              className={`inline-block rounded-md bg-[#0c3b2e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#164d3c] ${foco}`}
            >
              Saiba mais
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
  const [tocandoId, setTocandoId] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    buscarEventos()
      .then((dados) => {
        if (ativo) setLista(dados);
      })
      .catch((e: Error) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const visiveis = lista
    .filter((e) => (passados ? diasAte(e.data) < 0 : diasAte(e.data) >= 0))
    .sort((a, b) => (passados ? b.data.localeCompare(a.data) : a.data.localeCompare(b.data)));

  const aba = (ativa: boolean) =>
    `px-4 py-2 text-sm font-semibold transition-colors ${foco} ${ativa ? "bg-[#0c3b2e] text-white" : "bg-white text-[#0c3b2e] hover:bg-[#e3ece4]"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[#0c3b2e] text-[#1b2f25] [font-family:'Inter',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <main className="mx-auto mb-10 w-full max-w-6xl flex-1 rounded-2xl bg-[#eef5ee] px-5 py-10 sm:px-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0c3b2e] sm:text-4xl">Programação</h1>
            <p className="mt-2 max-w-xl text-[#3d5648]">
              Atividades e eventos promovidos pelo LACIS.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filtrar eventos"
            className="flex overflow-hidden rounded-md border border-[#0c3b2e]"
          >
            <button type="button" aria-pressed={!passados} onClick={() => setPassados(false)} className={aba(!passados)}>
              Próximos
            </button>
            <button
              type="button"
              aria-pressed={passados}
              onClick={() => setPassados(true)}
              className={`${aba(passados)} border-l border-[#0c3b2e]`}
            >
              Anteriores
            </button>
          </div>
        </header>

        {carregando && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando eventos">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl bg-white">
                <div className="aspect-3/2 bg-[#0c3b2e]/10" />
                <div className="h-40" />
              </div>
            ))}
          </div>
        )}

        {erro && (
          <div role="alert" className="mt-8 rounded-xl border border-[#0c3b2e]/30 bg-white p-8 text-center">
            <p className="font-semibold">{erro}</p>
            <button
              type="button"
              onClick={() => {
                setErro(null);
                setCarregando(true);
                setTentativa((t) => t + 1);
              }}
              className={`mt-4 rounded-md bg-[#0c3b2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#164d3c] ${foco}`}
            >
              Tentar de novo
            </button>
          </div>
        )}

        {!carregando && !erro && visiveis.length === 0 && (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-[#0c3b2e]/30 px-6 py-14 text-center">
            <CalendarX size={32} className="text-[#0c3b2e]/60" aria-hidden="true" />
            <p className="mt-3 font-semibold">
              {passados ? "Nenhum evento anterior encontrado." : "Nenhum evento marcado por enquanto."}
            </p>
            <p className="mt-1 text-sm text-[#3d5648]">
              {passados ? "Os eventos já realizados aparecerão aqui." : "Volte em breve para ver as novidades."}
            </p>
          </div>
        )}

        {!carregando && !erro && visiveis.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visiveis.map((e) => (
              <Cartao
                key={e.id}
                evento={e}
                tocando={tocandoId === e.id}
                aoTocar={() => setTocandoId(e.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}