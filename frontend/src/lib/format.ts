export function formatPrix(valeur: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(valeur);
}

export function formatJour(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function formatHeure(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDateCourte(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function dateLocale(valeur: Date): string {
  const decalage = valeur.getTimezoneOffset() * 60_000;
  return new Date(valeur.getTime() - decalage).toISOString().slice(0, 10);
}

export function plageParDefaut(jours = 7): { du: string; au: string } {
  const maintenant = new Date();
  const fin = new Date(maintenant);
  fin.setDate(fin.getDate() + jours);
  return { du: dateLocale(maintenant), au: dateLocale(fin) };
}

export function initiales(titre: string): string {
  return titre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? "")
    .join("");
}
