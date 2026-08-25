const TOKEN_KEY = "token";
const EXPIRES_AT_KEY = "token_expires_at";

export function salvarSessao(token: string, expiresAt: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt);
}

export function limparSessao() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Checa validade só pela data (client-side, sem bater no servidor).
 * Cobre o caso comum: token expirado enquanto a aba ficou aberta.
 * A validação de verdade continua sendo feita pelo backend a cada
 * requisição — isso aqui é só pra evitar mostrar a tela admin com
 * uma sessão que o usuário já sabe que vai falhar.
 */
export function tokenValido(): boolean {
    const token = getToken();
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);

    if (!token || !expiresAt) {
        return false;
    }

    return new Date(expiresAt).getTime() > Date.now();
}

/**
 * Wrapper de fetch que:
 * - adiciona o header Authorization automaticamente
 * - em caso de 401 (token inválido/expirado pelo backend), limpa a
 *   sessão local e manda pro login
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const token = getToken();

    const res = await fetch(input, {
        ...init,
        headers: {
            ...(init.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (res.status === 401) {
        limparSessao();
        window.location.href = "/login";
    }

    return res;
}