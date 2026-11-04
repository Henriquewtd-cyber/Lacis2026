import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarX, MapPin, Play } from "lucide-react";
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

// Foco visível: um para fundos escuros e outro para o painel claro
const focoEscuro =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ccff00]";
const focoClaro =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

// Links da barra do topo. Para incluir uma página nova, adicione uma linha aqui.
// pronto: false deixa o link desativado (cinza, sem clique). Quando a página
// existir, troque para true e crie a rota no App.tsx.
const links = [
  { rotulo: "Home", para: "/", pronto: true },
  { rotulo: "Sobre o LACIS", para: "/sobre", pronto: true },
  { rotulo: "Programação", para: "/programacao", pronto: true },
  { rotulo: "Cursos de Extensão", para: "/cursos-de-extensao", pronto: false },
  { rotulo: "Textos", para: "/textos", pronto: false },
  { rotulo: "Pesquisas", para: "/pesquisas", pronto: false },
  { rotulo: "Dirigentes de Cultura", para: "/dirigentes-de-cultura", pronto: true },
];

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
    <article className="flex h-full flex-col overflow-hidden bg-[#0c3b2e] shadow-md">
      <div className="relative aspect-3/2 shrink-0 overflow-hidden bg-[#163828]">
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
              <div className="flex size-full items-end gap-2 p-5 text-[#ccff00]">
                <span className="text-8xl font-black leading-none">{data.getDate()}</span>
                <span className="pb-1 text-2xl font-black uppercase">
                  {data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                </span>
              </div>
            )}
            {player && (
              <button
                type="button"
                onClick={aoTocar}
                className={`absolute bottom-3 left-3 inline-flex items-center gap-2 rounded bg-black px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-[#ccff00] hover:text-black ${focoEscuro}`}
              >
                <Play size={14} aria-hidden="true" />
                Assistir vídeo
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <h3 className="text-2xl font-black uppercase leading-tight tracking-tight text-[#ccff00]">
          {evento.titulo}
        </h3>
        <p className="mt-3 font-medium text-[#eef5ee]">
          <time dateTime={evento.data}>
            {data.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
          </time>
          {" | "}
          {evento.horario}
        </p>
        <p className="mt-2 leading-relaxed text-[#9fb8a8]">{evento.resumo}</p>
        <p className="mt-4 inline-flex items-start gap-2 text-sm text-[#90ee90]">
          <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {evento.local}
        </p>

        {evento.link && (
          <div className="mt-auto pt-6">
            <a
              href={evento.link}
              target="_blank"
              rel="noreferrer"
              className={`inline-block rounded-tl-2xl bg-[#ccff00] px-5 py-2 text-sm font-extrabold text-black transition-colors hover:bg-white ${focoEscuro}`}
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

  // Mesmo estilo das etiquetas pretas das páginas Home e Sobre
  const aba = (ativa: boolean) =>
    `rounded px-4 py-2 text-sm font-extrabold uppercase tracking-widest transition-colors ${focoClaro} ${
      ativa ? "bg-black text-white" : "text-[#0c3b2e] ring-1 ring-[#0c3b2e] hover:bg-[#0c3b2e] hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[#0c3b2e] text-[#eef5ee] [font-family:'Inter',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      <header>
        {/* Barra clara: dá contraste para a logo escura */}
        <div className="border-b-4 border-[#ccff00] bg-[#eef5ee]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-3 sm:px-10">
            <nav aria-label="Principal">
              <ul className="flex flex-wrap gap-2">
                {links.map((l) => {
                  const base =
                    "inline-block rounded px-3 py-1.5 text-sm font-extrabold uppercase tracking-wide";

                  if (!l.pronto) {
                    return (
                      <li key={l.para}>
                        <span
                          aria-disabled="true"
                          className={`${base} cursor-default select-none bg-[#d5dfd8] text-[#5f7468]`}
                        >
                          {l.rotulo}
                          <span className="sr-only"> (em breve)</span>
                        </span>
                      </li>
                    );
                  }

                  const atual = l.para === "/programacao";
                  return (
                    <li key={l.para}>
                      <Link
                        to={l.para}
                        aria-current={atual ? "page" : undefined}
                        className={`${base} transition-colors ${focoClaro} ${
                          atual
                            ? "bg-[#ccff00] text-black ring-2 ring-black"
                            : "bg-black text-white hover:text-[#ccff00]"
                        }`}
                      >
                        {l.rotulo}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <Link to="/" className={`shrink-0 ${focoClaro}`}>
              <img
                src="/logo_semfundo.webp"
                alt="LACIS, página inicial"
                className="size-16 object-contain sm:size-20"
              />
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-10 sm:px-10">
          <h1 className="text-5xl font-black uppercase tracking-tight text-[#ccff00] sm:text-7xl">
            Programação
          </h1>
        </div>
      </header>

      <main className="mx-auto mb-10 w-full max-w-6xl flex-1 rounded-3xl bg-[#eef5ee] px-5 py-12 text-[#1b2f25] sm:px-12">
        <p className="max-w-3xl text-lg leading-relaxed text-[#3d5648]">
          Próximas atividades e eventos promovidos pelo LACIS.
          Confira a programação e participe.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-4xl font-black uppercase tracking-tight text-[#0c3b2e] sm:text-6xl">
            {passados ? "Eventos anteriores" : "Próximos eventos"}
          </h2>
          <div className="flex gap-2">
            <button type="button" aria-pressed={!passados} onClick={() => setPassados(false)} className={aba(!passados)}>
              Próximos
            </button>
            <button type="button" aria-pressed={passados} onClick={() => setPassados(true)} className={aba(passados)}>
              Anteriores
            </button>
          </div>
        </div>

        {carregando && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando eventos">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-3/2 bg-[#0c3b2e]/20" />
                <div className="h-40 bg-[#0c3b2e]/10" />
              </div>
            ))}
          </div>
        )}

        {erro && (
          <div role="alert" className="mt-10 rounded-2xl border-2 border-[#0c3b2e] p-8 text-center">
            <p className="text-lg font-bold">{erro}</p>
            <button
              type="button"
              onClick={() => {
                setErro(null);
                setCarregando(true);
                setTentativa((t) => t + 1);
              }}
              className={`mt-4 rounded bg-black px-5 py-2 text-sm font-extrabold uppercase tracking-widest text-white hover:bg-[#0c3b2e] ${focoClaro}`}
            >
              Tentar de novo
            </button>
          </div>
        )}

        {!carregando && !erro && visiveis.length === 0 && (
          <div className="mt-10 flex flex-col items-center rounded-2xl border-2 border-dashed border-[#0c3b2e]/30 px-6 py-16 text-center">
            <CalendarX size={36} className="text-[#0c3b2e]/50" aria-hidden="true" />
            <p className="mt-3 text-lg font-bold">
              {passados ? "Nenhum evento anterior encontrado." : "Nenhum evento marcado por enquanto."}
            </p>
            <p className="mt-1 text-[#3d5648]">Volte em breve para conferir as novidades.</p>
          </div>
        )}

        {!carregando && !erro && visiveis.length > 0 && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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