export type Evento = {
  id: number;
  titulo: string;
  resumo: string;
  data: string; // AAAA-MM-DD
  horario: string;
  local: string;
  imagemUrl?: string | null;
  videoUrl?: string | null; // link do YouTube
  link?: string | null; // inscrição ou mais informações
};