const STORAGE_KEY = "varejao_ai_access_token";

function readToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function askForToken(): string {
  const token = (window.prompt("Informe o código de acesso da IA (AI_ACCESS_TOKEN):") || "").trim();
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage indisponível: o código vale só para esta chamada.
  }
  return token;
}

// POST to an AI endpoint with the operator's access code, asking for it once on 401.
export async function postToAiEndpoint(url: string, body: unknown): Promise<Response> {
  const send = (token: string) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

  const token = readToken();
  const response = token ? await send(token) : null;
  if (response && response.status !== 401) return response;

  const newToken = askForToken();
  return newToken ? send(newToken) : response ?? send("");
}
