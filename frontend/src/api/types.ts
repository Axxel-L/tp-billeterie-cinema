export type StatutReservation = "CONFIRMEE" | "ANNULEE";

export interface Film {
  id: number;
  titre: string;
  genre: string;
  dureeMinutes: number;
  dateSortie: string;
}

export interface FilmMedia {
  afficheUrl?: string;
  bandeauUrl?: string;
  bandeAnnonceCle?: string;
  synopsis?: string;
  note?: number;
}

export interface FilmRecherche {
  tmdbId: number;
  titre: string;
  annee?: number;
  afficheUrl?: string;
  synopsis?: string;
}

export interface ReservationClient {
  code: string;
  filmTitre: string;
  salleNom: string;
  debut: string;
  nombrePlaces: number;
  montantTotal: number;
  statut: StatutReservation;
}

export interface Seance {
  id: number;
  filmId: number;
  filmTitre: string;
  salleId: number;
  salleNom: string;
  debut: string;
  prixUnitaire: number;
  placesRestantes: number;
}

export interface Salle {
  id: number;
  nom: string;
  capacite: number;
}

export interface Reservation {
  code: string;
  statut: StatutReservation;
  nombrePlaces: number;
  montantTotal: number;
  seanceId: number;
  emailClient: string;
  creeeLe: string;
}

export interface Me {
  username: string;
  roles: string[];
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}

export interface FilmPayload {
  titre: string;
  genre: string;
  dureeMinutes: number;
  dateSortie: string;
}

export interface SeancePayload {
  filmId: number;
  salleId: number;
  debut: string;
  prixUnitaire: number;
}

export interface SallePayload {
  nom: string;
  capacite: number;
}

export interface ReservationPayload {
  seanceId: number;
  emailClient: string;
  nombrePlaces: number;
}
