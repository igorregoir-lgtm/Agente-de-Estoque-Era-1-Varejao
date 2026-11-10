import { createHash, timingSafeEqual } from "crypto";

// Shared guard for every endpoint that spends the server's GEMINI_API_KEY.
// Files under api/_lib are not exposed as Vercel functions.

type HeaderValue = string | string[] | undefined;

export interface GuardRequest {
  headers: Record<string, HeaderValue>;
  socket?: { remoteAddress?: string | null };
}

export interface GuardResponse {
  setHeader(name: string, value: string): unknown;
}

export interface GuardError {
  status: number;
  error: string;
}

export type GuardResult<T> = { ok: true; value: T } | ({ ok: false } & GuardError);

export const MAX_SKUS = 200;
export const MAX_SAIDAS_POR_SKU = 36;
export const MAX_TEXT_FIELD_LENGTH = 120;
// Vercel caps request bodies at 4.5 MB; ~4M base64 chars ≈ 3 MB of file.
export const MAX_FILE_BASE64_CHARS = 4_000_000;
export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "text/csv",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const DEFAULT_RATE_LIMIT_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MIN_ACCESS_TOKEN_LENGTH = 16;

export function applyCors(res: GuardResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

function firstHeader(value: HeaderValue): string {
  return (Array.isArray(value) ? value[0] : value) || "";
}

export function getClientIp(req: GuardRequest): string {
  const forwarded = firstHeader(req.headers["x-forwarded-for"]).split(",")[0].trim();
  return forwarded || firstHeader(req.headers["x-real-ip"]).trim() || req.socket?.remoteAddress || "unknown";
}

// Best-effort, per-instance limiter. Pair it with a spending cap on the Gemini key.
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

function rateLimitPerMinute(): number {
  const parsed = Number(process.env.AI_RATE_LIMIT_PER_MINUTE);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_RATE_LIMIT_PER_MINUTE;
}

function consumeRateLimit(key: string, now = Date.now()): boolean {
  if (rateBuckets.size > 10_000) {
    for (const [k, bucket] of rateBuckets) {
      if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) rateBuckets.delete(k);
    }
  }
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= rateLimitPerMinute();
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function tokenMatches(provided: string, expected: string): boolean {
  return timingSafeEqual(sha256(provided), sha256(expected));
}

export function authorizeAiRequest(req: GuardRequest, res: GuardResponse): GuardResult<null> {
  const ip = getClientIp(req);
  if (!consumeRateLimit(ip)) {
    res.setHeader("Retry-After", String(RATE_LIMIT_WINDOW_MS / 1000));
    return { ok: false, status: 429, error: "Muitas requisições. Aguarde um minuto e tente novamente." };
  }

  const expected = (process.env.AI_ACCESS_TOKEN || "").trim();
  if (expected.length < MIN_ACCESS_TOKEN_LENGTH) {
    return {
      ok: false,
      status: 503,
      error: `AI_ACCESS_TOKEN não configurado no servidor (mínimo de ${MIN_ACCESS_TOKEN_LENGTH} caracteres). Os endpoints de IA ficam desativados até que ele seja definido.`,
    };
  }

  const match = /^Bearer\s+(.+)$/i.exec(firstHeader(req.headers["authorization"]).trim());
  if (!match || !tokenMatches(match[1].trim(), expected)) {
    res.setHeader("WWW-Authenticate", "Bearer");
    return { ok: false, status: 401, error: "Código de acesso da IA ausente ou inválido." };
  }

  return { ok: true, value: null };
}

export interface DocumentPayload {
  fileBase64: string;
  mimeType: string;
}

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export function validateDocumentPayload(body: unknown): GuardResult<DocumentPayload> {
  const { fileBase64, mimeType } = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  if (typeof fileBase64 !== "string" || !fileBase64 || typeof mimeType !== "string" || !mimeType) {
    return { ok: false, status: 400, error: "Parâmetros inválidos. 'fileBase64' e 'mimeType' são obrigatórios." };
  }
  if (fileBase64.length > MAX_FILE_BASE64_CHARS) {
    return { ok: false, status: 413, error: "Arquivo muito grande. O limite é de aproximadamente 3 MB." };
  }
  const normalizedMime = mimeType.trim().toLowerCase();
  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(normalizedMime)) {
    return { ok: false, status: 415, error: "Tipo de arquivo não suportado. Envie PDF, CSV, TXT, PNG, JPEG ou WEBP." };
  }
  if (fileBase64.length % 4 !== 0 || !BASE64_PATTERN.test(fileBase64)) {
    return { ok: false, status: 400, error: "'fileBase64' não é um conteúdo base64 válido." };
  }
  return { ok: true, value: { fileBase64, mimeType: normalizedMime } };
}

export interface SkuInput {
  sku: string;
  nome: string;
  categoria: string;
  estoqueAtual: number;
  saidas: number[];
  custo: number;
  preco: number;
  leadTimeDias: number;
  moq: number;
  nivelServicoAlvo?: number;
  custoArmazenagemPercentual?: number;
  desvioPrazoEntrega?: number;
}

function text(value: unknown): string {
  return String(value ?? "").slice(0, MAX_TEXT_FIELD_LENGTH);
}

function num(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function optionalNum(value: unknown): number | undefined {
  return value === null || value === undefined || value === "" ? undefined : num(value) ?? undefined;
}

export function validateSkusPayload(body: unknown): GuardResult<SkuInput[]> {
  const { skus } = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  if (!Array.isArray(skus) || skus.length === 0) {
    return { ok: false, status: 400, error: "Parâmetros inválidos. 'skus' deve ser um array não vazio." };
  }
  if (skus.length > MAX_SKUS) {
    return { ok: false, status: 413, error: `Muitos SKUs na requisição. O limite é de ${MAX_SKUS} por análise.` };
  }

  const sanitized: SkuInput[] = [];
  for (const raw of skus) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { ok: false, status: 400, error: "Cada item de 'skus' deve ser um objeto." };
    }
    const s = raw as Record<string, unknown>;
    const saidasRaw = Array.isArray(s.saidas) ? s.saidas : [];
    if (saidasRaw.length > MAX_SAIDAS_POR_SKU) {
      return { ok: false, status: 413, error: `Cada SKU pode ter no máximo ${MAX_SAIDAS_POR_SKU} valores em 'saidas'.` };
    }
    const fields = {
      estoqueAtual: num(s.estoqueAtual),
      custo: num(s.custo),
      preco: num(s.preco),
      leadTimeDias: num(s.leadTimeDias),
      moq: num(s.moq),
    };
    const saidas = saidasRaw.map(num);
    if (Object.values(fields).some((v) => v === null) || saidas.some((v) => v === null)) {
      return { ok: false, status: 400, error: "Campos numéricos inválidos em 'skus'." };
    }
    sanitized.push({
      sku: text(s.sku),
      nome: text(s.nome),
      categoria: text(s.categoria),
      estoqueAtual: fields.estoqueAtual!,
      saidas: saidas as number[],
      custo: fields.custo!,
      preco: fields.preco!,
      leadTimeDias: fields.leadTimeDias!,
      moq: fields.moq!,
      nivelServicoAlvo: optionalNum(s.nivelServicoAlvo),
      custoArmazenagemPercentual: optionalNum(s.custoArmazenagemPercentual),
      desvioPrazoEntrega: optionalNum(s.desvioPrazoEntrega),
    });
  }
  return { ok: true, value: sanitized };
}
