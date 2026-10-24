import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarX, Clock, MapPin } from "lucide-react";

type Categoria = "Reunião" | "Formação" | "Seminário" | "Cultural";

type Evento = {
  id: number;
  titulo: string;
  data: string; // AAAA-MM-DD
  horario: string;
  local: string;
  categoria: Categoria;
  descricao: string;
  link?: string; // inscrição ou mais informações
};

// Dados de exemplo: substitua por uma API ou arquivo de dados quando houver.
const eventos: Evento[] = [
  {
    id: 1,
    titulo: "Reunião aberta de dirigentes de cultura",
    data: "2026-11-07",
    horario: "19h",
    local: "Online (Google Meet)",
    categoria: "Reunião",
    descricao:
      "Encontro para apresentar o balanço do ano e as prioridades para 2027.",
    link: "https://example.com/inscricao",
  },
  {
    id: 2,
    titulo: "Oficina de elaboração de projetos culturais",
    data: "2026-11-21",
    horario: "14h",
    local: "Auditório principal",
    categoria: "Formação",
    descricao:
      "Passo a passo para escrever e submeter projetos a editais públicos.",
    link: "https://example.com/oficina",
  },
  {
    id: 3,
    titulo: "Seminário Políticas Culturais nos Territórios",
    data: "2026-12-04",
    horario: "9h às 17h",
    local: "Centro de Convenções",
    categoria: "Seminário",
    descricao:
      "Mesas e debates com gestores de todo o país sobre financiamento e participação social.",
  },
  {
    id: 4,
    titulo: "Sarau de fim de ano",
    data: "2026-12-12",
    horario: "18h",
    local: "Praça central",
    categoria: "Cultural",
    descricao:
      "Música, poesia e apresentações dos grupos parceiros. Entrada gratuita.",
  },
  {
    id: 5,
    titulo: "Reunião de planejamento 2027",
    data: "2027-01-23",
    horario: "10h",
    local: "Sede da organização",
    categoria: "Reunião",
    descricao: "Definição do calendário e das metas do próximo ano.",
  },
  {
    id: 6,
    titulo: "Curso de gestão cultural municipal",
    data: "2027-02-06",
    horario: "8h30",
    local: "Online",
    categoria: "Formação",
    descricao:
      "Fundamentos de planos, conselhos e fundos municipais de cultura.",
    link: "https://example.com/curso",
  },
];

const categorias: Categoria[] = ["Reunião", "Formação", "Seminário", "Cultural"];

const corDoPonto: Record<Categoria, string> = {
  Reunião: "bg-teal-500",
  Formação: "bg-amber-500",
  Seminário: "bg-sky-500",
  Cultural: "bg-rose-500",
};

// "2026-11-07" -> Date no fuso local (evita voltar um dia por causa do UTC-3)
function paraData(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatar(iso: string, opcoes: Intl.DateTimeFormatOptions) {
  return paraData(iso).toLocaleDateString("pt-BR", opcoes);
}

function diasAte(iso: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((paraData(iso).getTime() - hoje.getTime()) / 86_400_000);
}

function textoPrazo(dias: number) {
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  return `Em ${dias} dias`;
}

function Detalhes({ evento, claro = false }: { evento: Evento; claro?: boolean }) {
  return (
    <div
      className={`flex flex-wrap gap-x-6 gap-y-2 text-sm ${
        claro ? "text-teal-100" : "text-slate-600"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <Clock size={16} aria-hidden="true" />
        {evento.horario}
      </span>
      <span className="inline-flex items-center gap-2">
        <MapPin size={16} aria-hidden="true" />
        {evento.local}
      </span>
    </div>
  );
}

export default function Agenda() {
  const [filtro, setFiltro] = useState<Categoria | "Todos">("Todos");

  const proximos = eventos
    .filter((e) => diasAte(e.data) >= 0)
    .sort((a, b) => a.data.localeCompare(b.data));

  const [destaque, ...demais] = proximos;
  const visiveis = demais.filter((e) => filtro === "Todos" || e.categoria === filtro);

  const porMes = new Map<string, Evento[]>();
  for (const e of visiveis) {
    const chave = e.data.slice(0, 7);
    porMes.set(chave, [...(porMes.get(chave) ?? []), e]);
  }

  const focoClaro =
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300";
  const focoEscuro =
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-teal-950 text-teal-50">
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-8 sm:px-8">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 rounded text-sm text-teal-200 transition-colors hover:text-white ${focoClaro}`}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar ao início
          </Link>

          <h1 className="mt-10 font-serif text-5xl font-semibold tracking-tight sm:text-6xl">
            Agenda
          </h1>
          <p className="mt-3 max-w-md text-lg text-teal-100/80">
            Encontros, formações e eventos que vêm por aí.
          </p>

          {destaque && (
            <section
              aria-labelledby="proximo-evento"
              className="mt-10 grid gap-6 rounded-2xl bg-teal-900/60 p-6 ring-1 ring-teal-700/50 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-8"
            >
              <time
                dateTime={destaque.data}
                className="flex items-baseline gap-3 sm:flex-col sm:items-start sm:gap-1"
              >
                <span className="font-serif text-7xl font-semibold leading-none text-amber-300 sm:text-8xl">
                  {paraData(destaque.data).getDate()}
                </span>
                <span className="text-lg capitalize text-teal-100">
                  {formatar(destaque.data, { month: "long" })}
                </span>
              </time>

              <div className="flex flex-col items-start gap-3">
                <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-teal-950">
                  Próximo evento: {textoPrazo(diasAte(destaque.data)).toLowerCase()}
                </span>
                <h2
                  id="proximo-evento"
                  className="font-serif text-2xl font-semibold leading-snug sm:text-3xl"
                >
                  {destaque.titulo}
                </h2>
                <p className="max-w-xl text-teal-100/90">{destaque.descricao}</p>
                <Detalhes evento={destaque} claro />
                {destaque.link && (
                  <a
                    href={destaque.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-950 transition-colors hover:bg-amber-200 ${focoClaro}`}
                  >
                    Fazer inscrição
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8">
        <div
          role="group"
          aria-label="Filtrar por categoria"
          className="flex flex-wrap gap-2"
        >
          {(["Todos", ...categorias] as const).map((c) => {
            const ativo = filtro === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={ativo}
                onClick={() => setFiltro(c)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${focoEscuro} ${
                  ativo
                    ? "bg-teal-900 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-teal-600"
                }`}
              >
                {c !== "Todos" && (
                  <span
                    className={`size-2.5 rounded-full ${corDoPonto[c]}`}
                    aria-hidden="true"
                  />
                )}
                {c}
              </button>
            );
          })}
        </div>

        {[...porMes.entries()].map(([mes, lista]) => (
          <section key={mes} className="mt-8">
            <h2 className="sticky top-0 z-10 bg-slate-50/95 py-3 font-serif text-2xl font-semibold capitalize text-teal-950 backdrop-blur">
              {formatar(`${mes}-01`, { month: "long", year: "numeric" })}
            </h2>

            <ol className="divide-y divide-slate-200 border-t border-slate-200">
              {lista.map((e) => (
                <li
                  key={e.id}
                  className="grid grid-cols-[4.5rem_1fr] gap-5 py-7 sm:grid-cols-[6.5rem_1fr] sm:gap-8"
                >
                  <time dateTime={e.data} className="flex flex-col">
                    <span className="text-sm capitalize text-slate-500">
                      {formatar(e.data, { weekday: "short" }).replace(".", "")}
                    </span>
                    <span className="font-serif text-5xl font-semibold leading-none text-teal-900 sm:text-6xl">
                      {paraData(e.data).getDate()}
                    </span>
                  </time>

                  <div className="flex flex-col items-start gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                      <span
                        className={`size-2.5 rounded-full ${corDoPonto[e.categoria]}`}
                        aria-hidden="true"
                      />
                      {e.categoria}
                    </span>
                    <h3 className="text-xl font-semibold leading-snug text-slate-900">
                      {e.titulo}
                    </h3>
                    <p className="max-w-xl text-slate-600">{e.descricao}</p>
                    <Detalhes evento={e} />
                    {e.link && (
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-1 rounded text-sm font-semibold text-teal-800 underline underline-offset-4 transition-colors hover:text-teal-600 ${focoEscuro}`}
                      >
                        Fazer inscrição
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        {visiveis.length === 0 && (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
            <CalendarX size={32} className="text-slate-400" aria-hidden="true" />
            <p className="mt-3 font-medium text-slate-700">
              {proximos.length === 0
                ? "Nenhum evento agendado por enquanto."
                : filtro === "Todos"
                  ? "Não há outros eventos marcados por enquanto."
                  : `Nenhum evento de ${filtro} marcado por enquanto.`}
            </p>
            {filtro !== "Todos" && (
              <button
                type="button"
                onClick={() => setFiltro("Todos")}
                className={`mt-3 rounded text-sm font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-600 ${focoEscuro}`}
              >
                Ver todos os eventos
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}