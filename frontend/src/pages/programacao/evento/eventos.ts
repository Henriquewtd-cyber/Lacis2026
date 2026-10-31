import type { Evento } from "./tipoevento";

const usarApi = import.meta.env.VITE_EVENTOS_API === "true";
const API_URL = import.meta.env.VITE_API_URL as string | undefined;

const eventosExemplo: Evento[] = [
  {
    id: 1,
    titulo: "Reunião aberta de dirigentes de cultura",
    resumo: "Balanço do ano e prioridades para 2027.",
    data: "2026-11-07",
    horario: "19h",
    local: "Online",
    link: "https://example.com/",
  },
  {
    id: 2,
    titulo: "Oficina de elaboração de projetos culturais",
    resumo: "Passo a passo para escrever e submeter projetos a editais.",
    data: "2026-11-21",
    horario: "14h",
    local: "Auditório principal",
  },
  {
    id: 3,
    titulo: "Seminário Políticas Culturais nos Territórios",
    resumo: "Mesas e debates sobre financiamento e participação social.",
    data: "2026-12-04",
    horario: "9h às 17h",
    local: "Centro de Convenções",
    link: "https://example.com/",
  },
  {
    id: 4,
    titulo: "Sarau de fim de ano",
    resumo: "Música, poesia e apresentações dos grupos parceiros.",
    data: "2026-12-12",
    horario: "18h",
    local: "Praça central",
  },
  {
    id: 5,
    titulo: "Encontro regional de gestores",
    resumo: "Troca de experiências entre gestores culturais da região.",
    data: "2026-10-10",
    horario: "10h",
    local: "Sede da organização",
  },
  {
    id: 6,
    titulo: "ablubluble",
    resumo: "vai ter ablublbeubebe",
    data: "2050-50-50",
    horario: "09h",
    local: "joao xxiii",
    imagemUrl: "https://i.imgur.com/twHLTEB.jpeg",
    videoUrl: "https://www.youtube.com/watch?v=qg2xE2GizNk",
  }
];

export async function buscarEventos(): Promise<Evento[]> {
  if (!usarApi || !API_URL) return eventosExemplo;
  const resposta = await fetch(`${API_URL}/eventos`);
  if (!resposta.ok) throw new Error("Não foi possível carregar a programção agora.");
  return resposta.json();
}