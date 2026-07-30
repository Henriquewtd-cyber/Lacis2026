

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Navbar from "../../components/navbar";

interface ErroImportacao {
    linha?: number;
    mensagem: string;
}

interface ResultadoImportacao {
    message: string;
    criadas: number;
    atualizadas: number;
    ignoradas: number;
    erros: ErroImportacao[];
}

type Status = "idle" | "uploading" | "success" | "error";

const EXTENSOES_ACEITAS = [".xlsx", ".csv"];
const API_URL = "http://127.0.0.1:8000/api/cidades/importar";

export default function ImportarCidades() {
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
    const [erroGeral, setErroGeral] = useState<string | null>(null);
    const [arrastando, setArrastando] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function extensaoValida(nome: string) {
        return EXTENSOES_ACEITAS.some((ext) => nome.toLowerCase().endsWith(ext));
    }

    function selecionarArquivo(novoArquivo: File | undefined | null) {
        if (!novoArquivo) return;

        if (!extensaoValida(novoArquivo.name)) {
            setErroGeral("Formato inválido. Envie um arquivo .xlsx ou .csv");
            return;
        }

        setErroGeral(null);
        setResultado(null);
        setStatus("idle");
        setArquivo(novoArquivo);
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        selecionarArquivo(e.target.files?.[0]);
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setArrastando(false);
        selecionarArquivo(e.dataTransfer.files?.[0]);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setArrastando(true);
    }

    function handleDragLeave() {
        setArrastando(false);
    }

    function removerArquivo() {
        setArquivo(null);
        setResultado(null);
        setErroGeral(null);
        setStatus("idle");
        if (inputRef.current) inputRef.current.value = "";
    }

    async function enviarImportacao() {
        if (!arquivo) return;

        setStatus("uploading");
        setErroGeral(null);
        setResultado(null);

        const formData = new FormData();
        formData.append("arquivo", arquivo);

        try {
            const resposta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: formData,
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                if (resposta.status === 422 && dados.errors) {
                    const primeiraMensagem = Object.values(dados.errors)
                        .flat()
                        .join(" ");
                    throw new Error(primeiraMensagem || "Arquivo inválido");
                }
                throw new Error(dados.message || "Erro ao importar arquivo");
            }

            setResultado(dados as ResultadoImportacao);
            setStatus("success");
        } catch (err) {
            setErroGeral(err instanceof Error ? err.message : "Erro inesperado");
            setStatus("error");
        }
    }

    return (
        <>    <Navbar />
            <div className="mx-auto w-full max-w-2xl p-6">

                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-slate-900">
                        Importar cidades
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Envie uma planilha .xlsx ou .csv para criar ou atualizar cidades em
                        lote.
                    </p>
                </div>

                {/* Área de upload */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => inputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${arrastando
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400"
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx,.csv"
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    <svg
                        className="mb-3 h-8 w-8 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 16.5V9m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                        />
                    </svg>

                    {arquivo ? (
                        <p className="text-sm font-medium text-slate-700">{arquivo.name}</p>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-slate-700">
                                Arraste o arquivo aqui ou clique para selecionar
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Formatos aceitos: .xlsx, .csv
                            </p>
                        </>
                    )}
                </div>

                {/* Arquivo selecionado + ações */}
                {arquivo && (
                    <div className="mt-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-2">
                        <span className="truncate text-sm text-slate-600">
                            {arquivo.name} · {(arquivo.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                            onClick={removerArquivo}
                            className="ml-3 shrink-0 text-xs font-medium text-slate-500 hover:text-red-600"
                        >
                            Remover
                        </button>
                    </div>
                )}

                {erroGeral && (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {erroGeral}
                    </div>
                )}

                <button
                    onClick={enviarImportacao}
                    disabled={!arquivo || status === "uploading"}
                    className="mt-5 w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {status === "uploading" ? "Importando..." : "Importar planilha"}
                </button>

                {/* Resultado */}
                {resultado && (
                    <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-sm font-medium text-slate-800">
                            {resultado.message}
                        </p>

                        <div className="mt-3 grid grid-cols-3 gap-3">
                            <div className="rounded-md bg-emerald-50 px-3 py-2 text-center">
                                <p className="text-lg font-semibold text-emerald-700">
                                    {resultado.criadas}
                                </p>
                                <p className="text-xs text-emerald-600">Criadas</p>
                            </div>
                            <div className="rounded-md bg-blue-50 px-3 py-2 text-center">
                                <p className="text-lg font-semibold text-blue-700">
                                    {resultado.atualizadas}
                                </p>
                                <p className="text-xs text-blue-600">Atualizadas</p>
                            </div>
                            <div className="rounded-md bg-blue-50 px-3 py-2 text-center">
                                <p className="text-lg font-semibold text-blue-700">
                                    {resultado.ignoradas}
                                </p>
                                <p className="text-xs text-blue-600">Ignoradas</p>
                            </div>
                            <div className="rounded-md bg-red-50 px-3 py-2 text-center">
                                <p className="text-lg font-semibold text-red-700">
                                    {resultado.erros?.length ?? 0}
                                </p>
                                <p className="text-xs text-red-600">Erros</p>
                            </div>
                        </div>

                        {resultado.erros && resultado.erros.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Detalhes dos erros
                                </p>
                                <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                                    {resultado.erros.map((erro, i) => (
                                        <li
                                            key={i}
                                            className="rounded bg-red-50 px-3 py-1.5 text-red-700"
                                        >
                                            {erro.linha ? `Linha ${erro.linha}: ` : ""}
                                            {erro.mensagem}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}