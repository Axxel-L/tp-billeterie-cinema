import type {
  ApiErrorBody,
  Film,
  FilmMedia,
  FilmPayload,
  Me,
  Reservation,
  ReservationPayload,
  Salle,
  SallePayload,
  Seance,
  SeancePayload,
} from "./types";

let authorization: string | null = null;

const encoder = new TextEncoder();

function base64(value: string): string {
  let binaire = "";
  for (const octet of encoder.encode(value)) {
    binaire += String.fromCharCode(octet);
  }
  return btoa(binaire);
}

export function setAuthorization(username: string, password: string): void {
  authorization = `Basic ${base64(`${username}:${password}`)}`;
}

export function clearAuthorization(): void {
  authorization = null;
}

export function hasAuthorization(): boolean {
  return authorization !== null;
}

export class ApiException extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers, credentials: "omit" });
  } catch {
    throw new ApiException(0, "RESEAU_INDISPONIBLE", "Le serveur est injoignable.");
  }

  if (!response.ok) {
    let corps: Partial<ApiErrorBody> = {};
    try {
      corps = (await response.json()) as Partial<ApiErrorBody>;
    } catch {
      corps = {};
    }
    throw new ApiException(
      response.status,
      corps.code ?? "ERREUR",
      corps.message ?? `Erreur HTTP ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(params)) {
    if (valeur) {
      search.set(cle, valeur);
    }
  }
  const resultat = search.toString();
  return resultat ? `?${resultat}` : "";
}

export const api = {
  me: () => request<Me>("/api/auth/me"),

  films: (params: { titre?: string; genre?: string } = {}) =>
    request<Film[]>(`/api/films${query(params)}`),

  filmMedia: (id: number) => request<FilmMedia>(`/api/films/${id}/media`),

  seances: (params: { du: string; au: string }) =>
    request<Seance[]>(`/api/seances${query(params)}`),

  salles: () => request<Salle[]>("/api/salles"),

  reserver: (payload: ReservationPayload) =>
    request<Reservation>("/api/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  annuler: (code: string) =>
    request<void>(`/api/reservations/${encodeURIComponent(code)}`, {
      method: "DELETE",
    }),

  creerFilm: (payload: FilmPayload) =>
    request<Film>("/api/programmation/films", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  creerSeance: (payload: SeancePayload) =>
    request<Seance>("/api/programmation/seances", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  creerSalle: (payload: SallePayload) =>
    request<Salle>("/api/admin/salles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
