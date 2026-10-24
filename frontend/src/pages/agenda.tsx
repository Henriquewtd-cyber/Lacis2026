type Evento = {
  id: number;
  titulo: string;
  data: string; // formato AAAA-MM-DD
  horario: string;
  local: string;
  descricao: string;
};

const eventos: Evento[] = [
  {
    id: 1,
    titulo: "Reunião aberta da organização",
    data: "2026-11-07",
    horario: "19:00",
    local: "Sede / Online",
    descricao: "Encontro para apresentar as atividades do período.",
  },
  {
    id: 2,
    titulo: "Workshop de capacitação",
    data: "2026-11-21",
    horario: "14:00",
    local: "Auditório principal",
    descricao: "Formação para novos participantes.",
  },
];

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC", // evita mostrar um dia a menos por causa do fuso (UTC-3)
  });
}

export default function Agenda() {
  const ordenados = [...eventos].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">Agenda</h1>
      <p className="mt-1 text-gray-600">Próximos eventos da organização</p>

      <ul className="mt-6 grid gap-4">
        {ordenados.map((e) => (
          <li key={e.id} className="rounded-lg border border-gray-200 p-4">
            <time dateTime={e.data} className="text-sm font-semibold text-gray-500">
              {formatarData(e.data)}
            </time>
            <h2 className="mt-1 text-xl font-semibold">{e.titulo}</h2>
            <p className="text-sm text-gray-600">
              {e.horario} · {e.local}
            </p>
            <p className="mt-2">{e.descricao}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}