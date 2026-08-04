export interface Feature {
  numero: string;
  /** Titre en deux lignes. */
  titre: [string, string];
  sous: string;
  /** Sous-dossier de public/video/phone-frames/ contenant la séquence. */
  framesDir: string;
  /** Nombre de frames de la séquence. */
  frameCount: number;
}

/** Les 3 sections de présentation du produit, dans l'ordre de scroll. */
export const FEATURES: Feature[] = [
  {
    numero: '01',
    titre: ['Ta séance,', 'guidée.'],
    sous: "Tu ouvres l'app, tout est prêt : les exercices, les charges, le repos chronométré. Chaque série au bon poids, chaque repos à la seconde. Toi, tu n'as plus qu'à pousser.",
    framesDir: 'seance',
    frameCount: 120,
  },
  {
    numero: '02',
    titre: ['Ta progression,', 'noir sur blanc.'],
    sous: "Ta semaine, ta série en cours, tes défis — tout est là dès l'ouverture. Chaque séance nourrit tes stats : records battus, charges qui montent, régularité qui tient. Tu vois que ça paye.",
    framesDir: 'accueil',
    frameCount: 125,
  },
  {
    numero: '03',
    titre: ['Ta salle,', 'ton classement.'],
    sous: 'Rejoins ta salle, vois qui s’entraîne en ce moment, grimpe au classement séance après séance. Deviens king of the gym — et défends ton titre.',
    framesDir: 'masalle',
    frameCount: 108,
  },
];

export interface MoreFeature {
  titre: string;
  sous: string;
}

/** Le bloc « et bien plus encore » : tout ce que l'app fait d'autre. */
export const MORE_FEATURES: MoreFeature[] = [
  {
    titre: 'Programme sur mesure',
    sous: 'Généré selon ton niveau, ton matériel et tes objectifs.',
  },
  {
    titre: 'Repos chronométré',
    sous: 'Le timer tourne tout seul entre les séries.',
  },
  {
    titre: 'Dynamic Island',
    sous: 'Ta séance en direct, même sur l’écran verrouillé.',
  },
  {
    titre: 'Records personnels',
    sous: 'Chaque PR détecté, daté et célébré.',
  },
  {
    titre: 'Statistiques complètes',
    sous: 'Heatmap, évolution par muscle, historique intégral.',
  },
  {
    titre: 'Carte des salles',
    sous: 'Plus de 21 000 salles référencées en France.',
  },
  {
    titre: 'Fil social',
    sous: 'Les séances de tes amis, en temps réel.',
  },
  {
    titre: 'Claps',
    sous: 'Encourage tes potes à chaque séance terminée.',
  },
  {
    titre: 'Missions hebdo',
    sous: 'Des défis chaque semaine qui rapportent des RP.',
  },
  {
    titre: 'Badges',
    sous: 'Tes caps franchis, gravés sur ton profil.',
  },
  {
    titre: 'Partage de stats',
    sous: 'Ta carte de séance, prête à poster où tu veux.',
  },
  {
    titre: 'Profil privé',
    sous: 'C’est toi qui décides qui te suit.',
  },
];
