/**
 * Le lien App Store de reep, en un seul endroit.
 *
 * ⚠️ Toujours passer par ce module, jamais un lien tapé à la main : une autre
 * application s'appelle REEP sur l'App Store (id6739632689). Un chiffre de
 * travers et on envoie les gens chez elle.
 *
 * `ct` est le jeton de campagne remonté dans App Store Connect → Analyses →
 * Sources. Sans lui, impossible de savoir d'où viennent les installations :
 * une par point d'entrée (site, affiche en salle, réseaux…).
 */
export const APP_ID = '6795474077';

const BASE = `https://apps.apple.com/fr/app/id${APP_ID}`;

/** Lien App Store, avec jeton de campagne si le point d'entrée est identifié. */
export function appStoreUrl(ct?: string): string {
  return ct ? `${BASE}?ct=${ct}&mt=8` : BASE;
}

/** Lien nu, sans attribution — pour les mentions non cliquables. */
export const APP_STORE_URL = BASE;
