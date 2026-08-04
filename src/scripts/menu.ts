/**
 * Menu plein écran : ouverture par le burger de l'en-tête, fermeture par le
 * bouton « fermer », par Échap, ou par le lien « accueil » qui remonte en haut.
 */
export function initMenu(): void {
  const menu = document.getElementById('menu');
  const burger = document.getElementById('burger');
  const close = document.getElementById('mclose');
  if (!menu || !burger || !close) return;

  const setOpen = (open: boolean) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
  };

  burger.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => setOpen(false));

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) setOpen(false);
  });

  // Sur l'accueil, « accueil » ferme le menu et remonte en haut sans navigation.
  for (const link of menu.querySelectorAll<HTMLAnchorElement>('a[data-close]')) {
    link.addEventListener('click', (e) => {
      if (location.pathname !== new URL(link.href).pathname) return;
      e.preventDefault();
      setOpen(false);
      scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
