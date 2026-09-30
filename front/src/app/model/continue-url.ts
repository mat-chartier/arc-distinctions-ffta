// URL de retour des mails d'action Firebase (reset / invitation, #41).
//
// L'« action URL » Firebase est unique pour tout le projet : en multi-clubs (#45)
// elle pointe vers un domaine neutre (app.distinctarc.fr/auth/action). Pour savoir
// de quel club vient l'archer, l'app joint à chaque envoi une `continueUrl` (celle
// du club émetteur) ; Firebase la transmet à la page d'action, qui y renvoie
// l'archer une fois son mot de passe enregistré.

/** Domaine dont tous les sous-domaines (clubs, app) sont des retours légitimes. */
export const TRUSTED_DOMAIN = 'distinctarc.fr';

/** `continueUrl` à joindre à un envoi : la page de connexion du site courant. */
export function buildContinueUrl(origin: string): string {
  return `${origin}/login`;
}

/**
 * Valide une `continueUrl` reçue en paramètre (donc manipulable) avant d'y
 * rediriger, pour éviter une redirection ouverte. Acceptée si elle est sur le
 * même origin que la page courante, ou en https sur distinctarc.fr / un de ses
 * sous-domaines. Renvoie l'URL normalisée, ou null si refusée / invalide.
 */
export function safeContinueUrl(raw: string | null | undefined, currentOrigin: string): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.origin === currentOrigin) return url.href;
  const host = url.hostname;
  const trusted = host === TRUSTED_DOMAIN || host.endsWith('.' + TRUSTED_DOMAIN);
  return url.protocol === 'https:' && trusted ? url.href : null;
}
