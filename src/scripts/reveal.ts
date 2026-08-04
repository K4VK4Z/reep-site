/** Blocs qui montent de 48px en fondu dès qu'ils entrent dans le viewport. */
export function initReveals(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add('in');
      }
    },
    { threshold: 0.35 },
  );

  for (const el of document.querySelectorAll('.reveal')) observer.observe(el);
}
