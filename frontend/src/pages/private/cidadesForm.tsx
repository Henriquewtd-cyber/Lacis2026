import React, { useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api/cidades";
const STORAGE_BASE = "http://127.0.0.1:8000/storage/";
const MAX_DIM = 2000;

const CAMPOS_INICIAIS = {
    nome_cidade: "",
    estado: "",
    nome_orgao: "",
    nome_secretario: "",
    cargo: "",
    url: "",
};

type CampoTexto = typeof CAMPOS_INICIAIS;

type FotoKey = "foto_perfil" | "foto_1" | "foto_2";

type FotoState = {
    file: File | null;
    preview: string | null; // preview local (blob:) ou path/URL vindo do backend
};

const FOTOS_INICIAIS: Record<FotoKey, FotoState> = {
    foto_perfil: { file: null, preview: null },
    foto_1: { file: null, preview: null },
    foto_2: { file: null, preview: null },
};

// previews locais (blob:) e URLs completas (http) são usados como estão;
// paths relativos vindos do backend (ex: "cidades/xxx.webp") ganham o prefixo do storage.
function resolveFotoUrl(path: string): string {
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    return `${STORAGE_BASE}${path}`;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Não foi possível ler a imagem."));
        };
        img.src = url;
    });
}

export default function CidadeForm() {
    const [modo, setModo] = useState<"criar" | "editar">("criar");
    const [form, setForm] = useState<CampoTexto>(CAMPOS_INICIAIS);
    const [fotos, setFotos] = useState<Record<FotoKey, FotoState>>(FOTOS_INICIAIS);
    const [buscaEstado, setBuscaEstado] = useState("");
    const [buscaNome, setBuscaNome] = useState("");
    const [status, setStatus] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [imagemAmpliada, setImagemAmpliada] = useState<{ url: string; label: string } | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "estado" ? value.toUpperCase().slice(0, 2) : value,
        }));
    }

    async function handleFotoChange(key: FotoKey, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setStatus({ tipo: "erro", msg: "Selecione um arquivo de imagem válido." });
            e.target.value = "";
            return;
        }

        try {
            const { width, height } = await getImageDimensions(file);
            if (width > MAX_DIM || height > MAX_DIM) {
                setStatus({
                    tipo: "erro",
                    msg: `Imagem muito grande (${width}x${height}px). O máximo permitido é ${MAX_DIM}x${MAX_DIM}px.`,
                });
                e.target.value = "";
                return;
            }

            setFotos((prev) => ({
                ...prev,
                [key]: { file, preview: URL.createObjectURL(file) },
            }));
            setStatus(null);
        } catch (err: any) {
            setStatus({ tipo: "erro", msg: err.message });
            e.target.value = "";
        }
    }

    function removerFoto(key: FotoKey) {
        setFotos((prev) => ({ ...prev, [key]: { file: null, preview: null } }));
    }

    async function buscarCidade() {
        if (!buscaEstado || !buscaNome) {
            setStatus({ tipo: "erro", msg: "Informe estado e nome da cidade para buscar." });
            return;
        }
        setBuscando(true);
        setStatus(null);
        try {
            const params = new URLSearchParams({
                estado: buscaEstado.toUpperCase(),
                nome_cidade: buscaNome,
            });
            const res = await fetch(`${API_BASE}?${params.toString()}`, {
                method: "GET",
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error(`Cidade não encontrada (HTTP ${res.status})`);
            const data = await res.json();
            const cidade = data.data ?? data;

            setForm({
                nome_cidade: cidade.nome_cidade ?? "",
                estado: cidade.estado ?? "",
                nome_orgao: cidade.nome_orgao ?? "",
                nome_secretario: cidade.nome_secretario ?? "",
                cargo: cidade.cargo ?? "",
                url: cidade.url ?? "",
            });

            setFotos({
                foto_perfil: { file: null, preview: cidade.foto_perfil ?? null },
                foto_1: { file: null, preview: cidade.foto_1 ?? null },
                foto_2: { file: null, preview: cidade.foto_2 ?? null },
            });

            setStatus({ tipo: "ok", msg: "Cidade carregada. Edite os campos e salve." });
        } catch (err: any) {
            setStatus({ tipo: "erro", msg: err.message });
        } finally {
            setBuscando(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);
        setStatus(null);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));

            (Object.keys(fotos) as FotoKey[]).forEach((key) => {
                if (fotos[key].file) {
                    formData.append(key, fotos[key].file as File);
                }
            });

            if (modo === "editar") {
                if (!buscaEstado || !buscaNome) {
                    throw new Error("Busque uma cidade antes de atualizar.");
                }
                formData.append("_method", "PUT");
            }

            const res = await fetch(API_BASE, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData,
            });

            if (!res.ok) {
                const erro = await res.json().catch(() => null);
                throw new Error(erro?.message || `Erro ao salvar (HTTP ${res.status})`);
            }

            const salvo = await res.json();
            const cidadeSalva = salvo.data ?? salvo;

            // atualiza os previews com o que o backend efetivamente salvou
            // (limpa os "file" locais já que agora são URLs persistidas)
            setFotos({
                foto_perfil: { file: null, preview: cidadeSalva.foto_perfil ?? fotos.foto_perfil.preview },
                foto_1: { file: null, preview: cidadeSalva.foto_1 ?? fotos.foto_1.preview },
                foto_2: { file: null, preview: cidadeSalva.foto_2 ?? fotos.foto_2.preview },
            });

            setStatus({
                tipo: "ok",
                msg: modo === "criar" ? "Cidade criada com sucesso." : "Cidade atualizada com sucesso.",
            });

            if (modo === "criar") {
                setForm(CAMPOS_INICIAIS);
            }
        } catch (err: any) {
            setStatus({ tipo: "erro", msg: err.message });
        } finally {
            setCarregando(false);
        }
    }

    function trocarModo(novoModo: "criar" | "editar") {
        setModo(novoModo);
        setForm(CAMPOS_INICIAIS);
        setFotos(FOTOS_INICIAIS);
        setStatus(null);
        setBuscaEstado("");
        setBuscaNome("");
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-xl font-semibold text-gray-900 mb-1">Cadastro de cidades</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Preencha os dados para criar uma nova cidade ou busque uma existente para editar.
                </p>

                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => trocarModo("criar")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${modo === "criar"
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Criar nova
                    </button>
                    <button
                        type="button"
                        onClick={() => trocarModo("editar")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${modo === "editar"
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Editar existente
                    </button>
                </div>

                {modo === "editar" && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Buscar cidade por estado e nome
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="UF (ex: SP)"
                                value={buscaEstado}
                                onChange={(e) => setBuscaEstado(e.target.value.toUpperCase().slice(0, 2))}
                                maxLength={2}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                            <input
                                type="text"
                                placeholder="nome da cidade"
                                value={buscaNome}
                                onChange={(e) => setBuscaNome(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                            <button
                                type="button"
                                onClick={buscarCidade}
                                disabled={buscando}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                            >
                                {buscando ? "Buscando..." : "Buscar"}
                            </button>
                        </div>
                    </div>
                )}

                {status && (
                    <div
                        className={`mb-6 px-4 py-3 rounded-lg text-sm ${status.tipo === "ok"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                    >
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Campo
                            label="Nome da cidade"
                            name="nome_cidade"
                            value={form.nome_cidade}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Campo
                            label="Estado (UF)"
                            name="estado"
                            value={form.estado}
                            onChange={handleChange}
                            maxLength={2}
                            required
                            disabled={modo === "editar"}
                        />
                        <Campo
                            label="Nome do órgão"
                            name="nome_orgao"
                            value={form.nome_orgao}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Campo
                            label="Nome do secretário"
                            name="nome_secretario"
                            value={form.nome_secretario}
                            onChange={handleChange}
                            required
                        />
                        <Campo
                            label="Cargo"
                            name="cargo"
                            value={form.cargo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Campo label="URL" name="url" value={form.url} onChange={handleChange} />

                    <div className="grid grid-cols-3 gap-4">
                        <CampoFoto
                            label="Foto perfil"
                            fotoKey="foto_perfil"
                            estado={fotos.foto_perfil}
                            onChange={handleFotoChange}
                            onRemover={removerFoto}
                            onAmpliar={setImagemAmpliada}
                        />
                        <CampoFoto
                            label="Foto 1"
                            fotoKey="foto_1"
                            estado={fotos.foto_1}
                            onChange={handleFotoChange}
                            onRemover={removerFoto}
                            onAmpliar={setImagemAmpliada}
                        />
                        <CampoFoto
                            label="Foto 2"
                            fotoKey="foto_2"
                            estado={fotos.foto_2}
                            onChange={handleFotoChange}
                            onRemover={removerFoto}
                            onAmpliar={setImagemAmpliada}
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        Imagens de até {MAX_DIM}x{MAX_DIM}px. Clique numa foto para ver em tamanho maior.
                        Redimensionamento e conversão para WebP são feitos no backend.
                    </p>

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full mt-2 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                        {carregando ? "Salvando..." : modo === "criar" ? "Criar cidade" : "Salvar alterações"}
                    </button>
                </form>
            </div>

            {imagemAmpliada && (
                <Lightbox
                    url={resolveFotoUrl(imagemAmpliada.url)}
                    label={imagemAmpliada.label}
                    onClose={() => setImagemAmpliada(null)}
                />
            )}
        </div>
    );
}

function Campo({
    label,
    name,
    value,
    onChange,
    required = false,
    disabled = false,
    maxLength,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
    maxLength?: number;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                maxLength={maxLength}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
            />
        </div>
    );
}

function CampoFoto({
    label,
    fotoKey,
    estado,
    onChange,
    onRemover,
    onAmpliar,
}: {
    label: string;
    fotoKey: FotoKey;
    estado: FotoState;
    onChange: (key: FotoKey, e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemover: (key: FotoKey) => void;
    onAmpliar: (imagem: { url: string; label: string }) => void;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>

            {estado.preview ? (
                <div className="relative group">
                    <img
                        src={resolveFotoUrl(estado.preview)}
                        alt={label}
                        onClick={() => onAmpliar({ url: estado.preview as string, label })}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300 cursor-zoom-in"
                    />
                    <button
                        type="button"
                        onClick={() => onRemover(fotoKey)}
                        className="absolute top-1 right-1 bg-white/90 border border-gray-300 rounded-full w-5 h-5 text-xs leading-none text-gray-600 hover:bg-white"
                        title="Remover foto"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <label className="flex items-center justify-center h-24 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 cursor-pointer hover:bg-gray-50">
                    Selecionar
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onChange(fotoKey, e)}
                    />
                </label>
            )}
        </div>
    );
}

function Lightbox({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={onClose}
        >
            <div className="relative max-w-3xl max-h-full" onClick={(e) => e.stopPropagation()}>
                <img
                    src={url}
                    alt={label}
                    className="max-w-full max-h-[85vh] rounded-lg object-contain"
                />
                <p className="text-center text-white text-sm mt-2">{label}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 text-gray-700 text-sm hover:bg-gray-100"
                    title="Fechar"
                >
                    ×
                </button>
            </div>
        </div>
    );
}