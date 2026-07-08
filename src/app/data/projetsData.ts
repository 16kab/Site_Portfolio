import agptFullImage from 'figma:asset/088cdfc8fdbed01ed4d8b0093cb743cd250909a9.webp';
import agptGalleryImage from 'figma:asset/a2f33af00d3e3e6aa3ea96e3a84107f561cb220e.webp';
import charteSPVIEHeroImage from 'figma:asset/2ac0a31040f8e832c0797427d83142e2224f7fbe.webp';
import charteSPVIEFullImage from 'figma:asset/6c44ee628816da5a7350bb76d11a35f0e80809e1.webp';
import spvieHeroImage from 'figma:asset/398e9c461c5979e6f004593bfa76a4a7e1b2dc79.webp';
import spviePreoffreImage from 'figma:asset/0d928552e969fcac485d34a3d6f15ee964935e31.webp';
import spvieOffreImage from 'figma:asset/1730dac34628c04f84ee8a1877681909e6845865.webp';
import spviePostoffreImage from 'figma:asset/f3718612005ba2b3d95a1872ddce85660439134b.webp';
import spvieMobileImage from 'figma:asset/7a56c25206dc63daa132aa1c6fa0ba8d346d7796.webp';
import cgrmHeroImage from 'figma:asset/f443b2a2b02b367bf523b33d84b0cb2315038a78.webp';
import cgrmScreensImage from 'figma:asset/bdf67a8a10e5f9a15c5a214ddcc3d0fd15f96839.webp';
import refonteSiteHeroImage from 'figma:asset/89a2b71b88620b2f445d74ac6a7eb076e12697e1.webp';
import refonteSiteFullImage from 'figma:asset/757ee9914eb93d187ed398303b571c38964f5a5a.webp';
import crmBBScreensImage from 'figma:asset/83b3683a5d5bcebec542073ac4a14544cc8fb248.webp';
import crmBBHeroImage from 'figma:asset/5d851b07767ac527e2d425c5b16fb04013d6005c.webp';

export interface Projet {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  description: string;
  tags: string[];
  contexte: string;
  problematique: string;
  role: string;
  interventions: string[];
  demarche?: { title: string; content: string }[];
  impact: string;
  image: string;
  gallery: string[];
  brand?: string;
  natureProduit?: string;
  utilisateurPrincipal?: string;
  objectifProduit?: string;
  websiteUrl?: string;
  pdfUrl?: string;
}

export const projetsData: Projet[] = [
  {
    id: 'parcours-spvieassurances',
    title: 'Refonte du parcours de souscription SPVIE',
    subtitle: 'Un tunnel digital stratégique repensé de l\'architecture d\'information jusqu\'à la signature.',
    year: '2024-2025',
    description: 'Transformer un tunnel de souscription complexe afin de clarifier les offres et améliorer la génération de devis.',
    tags: ['B2B2C', 'Conversion', 'UX Strategy', 'Information Architecture', 'A/B Testing'],
    brand: 'SPVIE Assurances',
    natureProduit: 'Tunnel de conversion assurance',
    utilisateurPrincipal: 'Particuliers',
    objectifProduit: 'Générer des devis et faciliter la souscription',
    contexte: 'Le tunnel de souscription SPVIE (comparatif, tarification, devis, signature) constitue l\'entrée de leads la plus qualifiée du groupe.\n\nMalgré son importance stratégique, le parcours n\'avait pas évolué depuis plusieurs années. Le design vieillissant, la navigation confuse et une présentation des offres peu pédagogique nuisaient autant à l\'image de SPVIE qu\'à la performance du tunnel.\n\nLes analyses comportementales montraient que les utilisateurs hésitaient fréquemment dans le parcours et abandonnaient au moment de choisir leur offre.\n\nL\'objectif du projet était donc de moderniser l\'expérience, clarifier la compréhension des produits et améliorer la conversion jusqu\'à la demande de devis.',
    problematique: 'Les analyses Matomo ont permis d\'identifier un point de drop majeur au moment de la présentation des offres.\n\nPlusieurs facteurs expliquaient ce comportement :\n\n• Un design obsolète qui cassait la confiance dès l\'entrée dans le tunnel\n• Des garanties présentées sans hiérarchie ni pédagogie\n• Une navigation peu claire rendant les décisions difficiles\n\nLe tunnel comportait également de nombreuses étapes, donnant l\'impression d\'un parcours long et complexe.',
    role: 'UX/UI Designer, en binôme avec un consultant externe.\n\nJ\'ai porté la réflexion UX et la vision utilisateur tout au long du projet.',
    interventions: [
      'Benchmark concurrentiel',
      'Structuration des user flows',
      'Refonte de l\'architecture d\'information',
      'Conception des interfaces',
      'Collaboration directe avec les développeurs',
      'Recette technique et visuelle finale'
    ],
    demarche: [
      {
        title: 'Audit et cadrage',
        content: 'Analyse des comportements utilisateurs via ContentSquare et Matomo afin d\'identifier les zones d\'hésitation et les points de friction dans le parcours. Un benchmark concurrentiel a également été réalisé pour comparer les logiques de présentation des offres et les patterns de conversion utilisés dans d\'autres tunnels d\'assurance.'
      },
      {
        title: 'Restructuration du parcours',
        content: 'Refonte complète de l\'architecture d\'information afin de structurer les étapes de manière plus logique et progressive. Les questions ont été regroupées et organisées selon une logique step-by-step permettant de réduire la perception de longueur du parcours sans modifier la logique métier.'
      },
      {
        title: 'Refonte de la présentation des offres',
        content: 'La phase de choix des offres a été entièrement repensée : nouvelle hiérarchie visuelle, clarification des garanties, introduction de micro-copy de réassurance, ajout de badges « offre recommandée ». Un récapitulatif final dynamique a également été introduit, inspiré des logiques de panier e-commerce.'
      },
      {
        title: 'Validation',
        content: 'Deux variantes de la présentation des offres ont été testées via A/B testing afin d\'identifier la structure la plus efficace. Le projet s\'est conclu par une recette technique et visuelle complète en collaboration avec les développeurs.'
      }
    ],
    impact: 'Les premiers retours utilisateurs et internes ont mis en évidence plusieurs améliorations.\n\n• Temps perçu du parcours divisé par deux : un parcours d\'environ 30 minutes est ressenti comme une expérience de 10 à 15 minutes\n• Amélioration de la fluidité perçue et meilleure compréhension des offres\n• Suppression des principales frictions identifiées jusqu\'à la demande de devis\n• Premiers retours internes indiquant une augmentation du volume de leads générés via le tunnel',
    image: spvieHeroImage,
    gallery: [
      spviePreoffreImage,
      spvieOffreImage,
      spviePostoffreImage,
      spvieMobileImage,
    ]
  },
  {
    id: 'crm-bigbroker',
    title: 'Conception du CRM interne BigBroker',
    subtitle: 'Un outil métier conçu pour centraliser les données, structurer l\'activité des conseillers et piloter la performance commerciale.',
    year: '2024',
    description: 'Créer un outil centralisant les leads et structurant l\'activité commerciale des équipes.',
    tags: ['SaaS', 'Product Design', 'UX Strategy', 'Dashboard', 'Data Visualization'],
    brand: 'BigBroker – SPVIE Groupe',
    natureProduit: 'SaaS interne',
    utilisateurPrincipal: 'Équipes commerciales téléphoniques',
    objectifProduit: 'Centraliser les leads et piloter l\'activité commerciale',
    contexte: 'BigBroker dispose d\'équipes téléphoniques chargées de contacter et convertir des prospects issus de différents canaux d\'acquisition.\n\nAvant ce projet, aucun outil centralisé ne permettait de gérer efficacement ces leads ni de suivre l\'activité des conseillers.\n\nL\'objectif du projet était de concevoir un CRM interne entièrement développé en interne, permettant aux équipes commerciales de gérer leur portefeuille de clients, suivre leurs leads, piloter leurs performances et centraliser l\'ensemble des informations clients.',
    problematique: 'Les équipes commerciales devaient gérer un volume croissant de leads provenant de différentes sources.\n\nSans outil dédié, plusieurs difficultés apparaissaient :\n\n• Absence de centralisation des données clients\n• Difficulté à suivre les performances des conseillers\n• Gestion complexe du dispatch des leads\n• Manque de visibilité sur les leads non traités\n\nL\'enjeu était de concevoir un outil clair, rapide à utiliser et adapté aux contraintes métier des équipes d\'appel.',
    role: 'UX/UI Designer au sein de l\'équipe produit.\n\nJ\'ai participé activement aux ateliers métiers afin de comprendre les besoins des équipes commerciales et traduire ces besoins en interfaces exploitables.',
    interventions: [
      'Structurer la hiérarchie des données',
      'Définir les statuts et transitions des leads',
      'Concevoir les interfaces principales du CRM',
      'Concevoir les dashboards et tableaux de gestion',
      'Créer le design system du produit',
      'Collaborer étroitement avec les développeurs'
    ],
    demarche: [
      {
        title: 'Compréhension des besoins métier',
        content: 'Des ateliers ont été organisés avec les équipes internes afin de comprendre leur fonctionnement quotidien et leurs contraintes. L\'objectif était d\'identifier les actions les plus fréquentes, les informations essentielles à afficher et les flux de travail des conseillers.'
      },
      {
        title: 'Structuration des données',
        content: 'Un travail important a été réalisé pour organiser les informations et hiérarchiser les données clients. Chaque fiche assuré devait regrouper de manière claire : documents, historique des échanges, emails, commentaires et relances de devis.'
      },
      {
        title: 'Conception des interfaces',
        content: 'Plusieurs interfaces clés ont été conçues : dashboard de suivi des leads, gestion du portefeuille avec filtres et alertes, fiche assuré centralisant les informations clients, ainsi qu\'un module de tarification permettant de recueillir les besoins et comparer les offres.'
      },
      {
        title: 'Pilotage des leads',
        content: 'Le CRM intègre un système permettant de dispatcher les leads aux conseillers, définir des règles de distribution selon leur origine, suivre les quotas par équipe et gérer les leads non attribués.'
      }
    ],
    impact: 'La mise en place du CRM permet désormais aux équipes commerciales de :\n\n• Centraliser l\'ensemble des données clients\n• Gérer plus efficacement les leads entrants\n• Suivre leur activité et leurs performances\n• Améliorer l\'organisation du travail des conseillers\n\nL\'outil constitue aujourd\'hui un élément structurant de l\'écosystème digital interne.',
    image: crmBBHeroImage,
    gallery: [
      crmBBScreensImage,
    ]
  },
  {
    id: 'agpt',
    title: 'Création de la marque Agir Pour Toutes',
    subtitle: 'Structurer une marque engagée et concevoir un site permettant de présenter son univers et commercialiser ses clubs.',
    year: '2024',
    description: 'Lancer une identité et une plateforme digitale dédiée à l\'accompagnement des femmes.',
    tags: ['Branding', 'Web Design', 'Design System', 'Direction artistique'],
    brand: 'Agir Pour Toutes',
    natureProduit: 'Plateforme communautaire et de contenus',
    utilisateurPrincipal: 'Femmes (mamans, futures mamans, périménopause)',
    objectifProduit: 'Proposer des contenus et programmes d\'accompagnement via des clubs thématiques',
    contexte: 'Agir Pour Toutes est une initiative dédiée à l\'accompagnement des femmes à différentes étapes de leur vie : grossesse, naissance, post-partum, bien-être et développement personnel.\n\nLes fondatrices souhaitaient créer un site permettant de présenter leur mission et de proposer des clubs thématiques composés de vidéos et de contenus exclusifs.\n\nLe projet partait d\'une feuille blanche : aucune identité visuelle, aucun site et aucun univers graphique structuré. L\'enjeu était donc de créer une marque cohérente capable d\'incarner un univers à la fois chaleureux, premium et accessible.',
    problematique: 'Le projet nécessitait de construire une marque complète tout en trouvant le bon équilibre entre :\n\n• Dimension émotionnelle liée aux thématiques féminines\n• Crédibilité et sérieux d\'une plateforme d\'accompagnement\n• Univers visuel différenciant sans tomber dans les clichés de la maternité\n\nIl fallait également concevoir un site capable de présenter clairement les contenus et de permettre la vente des clubs.',
    role: 'UX/UI Designer et responsable de la direction artistique du projet.\n\nJ\'ai piloté l\'ensemble de la dimension design et j\'étais l\'interlocuteur principal des fondatrices pour traduire leur vision en univers graphique cohérent.',
    interventions: [
      'Création de l\'identité visuelle',
      'Définition de la direction artistique',
      'Conception du site web',
      'Création des supports visuels associés'
    ],
    demarche: [
      {
        title: 'Création de l\'identité de marque',
        content: 'Conception de l\'identité visuelle complète : logo, palette de couleurs et typographies. L\'objectif était de créer un univers chaleureux et moderne tout en conservant une dimension crédible et institutionnelle.'
      },
      {
        title: 'Définition de la direction artistique',
        content: 'Création d\'un univers graphique cohérent permettant de structurer l\'image de la marque sur l\'ensemble de ses supports digitaux et événementiels.'
      },
      {
        title: 'Conception de la plateforme',
        content: 'Design du site web permettant de présenter la mission d\'AGPT, valoriser les contenus proposés et commercialiser les clubs thématiques.'
      },
      {
        title: 'Accompagnement des fondatrices',
        content: 'Travail en collaboration directe avec les fondatrices pour clarifier leurs idées, ajuster les propositions graphiques et faire évoluer la direction artistique à travers plusieurs itérations.'
      }
    ],
    impact: 'Le projet a permis de :\\n\\n• Créer l\'identité complète de la marque AGPT\\n• Lancer la plateforme digitale\\n• Structurer l\'univers visuel de la marque\\n\\nL\'identité est aujourd\'hui utilisée sur l\'ensemble des supports de communication de la marque, ainsi que lors de ses événements et activités communautaires.',
    image: agptFullImage,
    gallery: [
      agptGalleryImage,
    ],
    websiteUrl: 'https://www.agirpourtoutes.com'
  },
  // ─ Autres Projets (avec pages détail) ─────────────────────────
  {
    id: 'refonte-spvie',
    title: 'Refonte visuelle stratégique du site SPVIE',
    subtitle: 'Imaginer une nouvelle expérience web capable de clarifier les offres, améliorer la navigation et soutenir la génération de leads.',
    year: '2025',
    description: 'Imaginer un site plus clair et orienté conversion pour soutenir l\'acquisition digitale.',
    tags: ['UX Strategy', 'Website redesign', 'Conversion', 'Information architecture', 'Product thinking'],
    brand: 'SPVIE Assurances',
    natureProduit: 'Site vitrine d\'assurance',
    utilisateurPrincipal: 'Particuliers',
    objectifProduit: 'Générer des leads et orienter vers les parcours de souscription',
    contexte: 'Le site de SPVIE constitue la vitrine principale du groupe auprès des particuliers et un point d\'entrée important vers le parcours de souscription.\n\nCependant, l\'interface du site reposait sur un design ancien et une architecture complexe comprenant près de 280 pages produits.\n\nCette situation rendait la navigation difficile et limitait l\'efficacité du site comme outil d\'acquisition.\n\nDans un contexte de transformation interne et avec l\'arrivée d\'une nouvelle direction générale orientée croissance, j\'ai pris l\'initiative de proposer une vision de refonte du site afin de moderniser l\'image de SPVIE et renforcer son efficacité commerciale.',
    problematique: 'Le site présentait plusieurs limites :\n\n• Un design vieillissant qui affaiblissait la perception de crédibilité\n• Des pages produits difficiles à comprendre\n• Une architecture complexe rendant la navigation peu intuitive\n\nL\'enjeu était de proposer une vision de refonte permettant de :\n\n• Moderniser l\'image du groupe\n• Clarifier la compréhension des offres\n• Renforcer la capacité du site à générer des leads',
    role: 'UX/UI Designer à l\'initiative du projet.\n\nJ\'ai proposé une vision complète de refonte comprenant une nouvelle architecture de navigation, une nouvelle hiérarchie de contenu, une direction visuelle modernisée et des pages produits plus pédagogiques et orientées conversion.\n\nLes maquettes ont été présentées au DSI afin d\'alimenter la réflexion stratégique autour de l\'évolution future du site.',
    interventions: [
      'Nouvelle architecture de navigation',
      'Nouvelle hiérarchie de contenu',
      'Direction visuelle modernisée',
      'Pages produits plus pédagogiques et orientées conversion',
      'Présentation au DSI'
    ],
    demarche: [
      {
        title: 'Analyse du site existant',
        content: 'Étude de l\'architecture du site et de ses pages produits afin d\'identifier les problèmes de lisibilité et de navigation dans un écosystème comprenant plusieurs centaines de pages.'
      },
      {
        title: 'Simplification de l\'architecture',
        content: 'Proposition d\'une nouvelle structure de navigation permettant d\'accéder plus rapidement aux offres et de clarifier la hiérarchie des informations.'
      },
      {
        title: 'Refonte de l\'expérience utilisateur',
        content: 'Conception de nouvelles maquettes mettant l\'accent sur la pédagogie des offres, la réassurance et une hiérarchie visuelle plus claire.'
      },
      {
        title: 'Vision orientée acquisition',
        content: 'Intégration d\'une logique plus orientée conversion avec une mise en avant plus claire des parcours de devis et une meilleure valorisation des offres.'
      }
    ],
    impact: 'La proposition a été validée par le DSI et constitue aujourd\'hui une base de réflexion pour l\'évolution future du site.\n\nCertaines idées issues de cette refonte ont déjà été intégrées dans l\'écosystème digital du groupe, notamment sur des éléments de navigation comme le menu et le footer.',
    image: refonteSiteHeroImage,
    gallery: [
      refonteSiteFullImage, // Temporairement utiliser l'image hero car refonteSiteFullImage ne charge pas
    ]
  },
  {
    id: 'charte-spvie',
    title: 'Proposition de refonte de la charte graphique SPVIE',
    subtitle: 'Repenser la charte graphique du groupe afin d\'harmoniser les supports et renforcer la crédibilité de la marque.',
    year: '2024',
    description: 'Redéfinir l\'identité visuelle du groupe pour moderniser son image et harmoniser ses supports.',
    tags: ['Branding', 'Direction artistique', 'Brand Strategy', 'Design System', 'Identité visuelle'],
    brand: 'SPVIE Assurances',
    natureProduit: 'Système d\'identité de marque',
    utilisateurPrincipal: 'Groupe SPVIE et équipes internes',
    objectifProduit: 'Moderniser l\'image du groupe et harmoniser les supports digitaux et print',
    contexte: 'La charte graphique de SPVIE datait de 2017. Avec les années, les supports de communication s\'étaient multipliés et l\'identité visuelle devenait de moins en moins cohérente.\n\nLe style historique, très "casseur de codes", vieillissait également mal et ne reflétait plus l\'image de sérieux attendue dans le secteur de l\'assurance.\n\nLa direction de la communication a donc lancé un projet interne visant à challenger l\'équipe design et communication afin d\'imaginer une évolution possible de l\'identité visuelle du groupe.',
    problematique: 'La charte graphique de SPVIE datait de 2017 et ne reflétait plus l\'image que le groupe souhaitait projeter aujourd\'hui. Avec la multiplication des supports et des produits, l\'identité visuelle devenait de plus en plus hétérogène.\n\nL\'enjeu était de moderniser l\'image de la marque tout en conservant certains repères pour une cible historiquement plutôt senior.\n\nIl fallait trouver un équilibre entre :\n\n• Modernité et crédibilité\n• Continuité de marque et évolution visuelle\n• Cohérence entre les différents supports du groupe',
    role: 'UX/UI Designer impliqué dans la réflexion sur l\'évolution de l\'identité visuelle du groupe.\n\nJ\'ai proposé une direction artistique complète, formalisée dans un brand book et présentée à la direction de la communication et au cofondateur.',
    interventions: [
      'Évolution du logo',
      'Nouvelle palette de couleurs',
      'Nouvelle typographie',
      'Système d\'iconographie',
      'Base de design system'
    ],
    demarche: [
      {
        title: 'Analyse de l\'identité existante',
        content: 'Étude de la charte graphique actuelle afin d\'identifier les éléments devenus obsolètes et les incohérences apparues avec le temps entre les différents supports de communication.'
      },
      {
        title: 'Définition d\'une nouvelle direction visuelle',
        content: 'Proposition d\'une direction artistique plus moderne et plus crédible, capable de mieux s\'inscrire dans l\'univers de l\'assurance tout en conservant l\'identité historique de la marque.'
      },
      {
        title: 'Construction d\'un système de marque',
        content: 'Création d\'une proposition complète incluant logo, palette de couleurs, typographies, iconographie et principes de design system pour structurer l\'ensemble des supports de communication.'
      },
      {
        title: 'Présentation et échanges stratégiques',
        content: 'Présentation de la proposition à la direction afin de nourrir la réflexion sur l\'évolution future de l\'identité du groupe.'
      }
    ],
    impact: 'Le projet n\'a finalement pas été déployé en raison de changements importants au sein de la direction.\n\nCependant, cette proposition a permis de :\n\n• Ouvrir la réflexion sur l\'évolution de l\'image de SPVIE\n• Démontrer la capacité de l\'équipe design à penser l\'identité du groupe à une échelle stratégique',
    image: charteSPVIEFullImage,
    gallery: [
      charteSPVIEHeroImage,
    ],
    pdfUrl: 'https://www.dropbox.com/scl/fi/3a4ngxrs8rm9imyi0nx1q/Charte-Graphique_wm.pdf?rlkey=w9c7jseefqxuc374hvs70f30r&st=ru0u4817&dl=1'
  },
  {
    id: 'mobile-cgrm',
    title: 'Refonte de l\'application mobile CGRM',
    subtitle: 'Adapter l\'application mobile à une charte plus moderne afin d\'améliorer la lisibilité et la cohérence avec l\'écosystème digital du groupe.',
    year: '2024',
    description: 'Moderniser l\'interface mobile afin d\'améliorer la lisibilité et l\'expérience assurée.',
    tags: ['Mobile app', 'UI redesign', 'Product design', 'Accessibility', 'Design System'],
    brand: 'CGRM – SPVIE Groupe',
    natureProduit: 'Application mobile client',
    utilisateurPrincipal: 'Assurés',
    objectifProduit: 'Permettre la consultation des remboursements et la gestion du dossier assuré',
    contexte: 'CGRM est une entité du groupe SPVIE disposant de son propre espace assuré accessible sur mobile.\n\nL\'interface de l\'application mobile présentait un design vieillissant et ne correspondait plus aux standards visuels des produits digitaux du groupe.\n\nUne refonte visuelle a donc été lancée afin de moderniser l\'interface et améliorer la lisibilité pour les utilisateurs.\n\nLes principales actions réalisées dans l\'application concernent :\n\n• La consultation des remboursements\n• La demande de remboursement\n• Le téléchargement d\'attestations\n• L\'accès aux informations personnelles',
    problematique: 'L\'application mobile remplissait correctement ses fonctions mais son interface ne reflétait plus les standards actuels.\n\nLe principal enjeu était donc de moderniser l\'expérience visuelle tout en conservant une structure fonctionnelle déjà maîtrisée par les utilisateurs.\n\nIl fallait notamment :\n\n• Améliorer la lisibilité des informations\n• Moderniser les composants visuels\n• Garantir une meilleure accessibilité sur mobile',
    role: 'UX/UI Designer en charge de la refonte visuelle de l\'application mobile.',
    interventions: [
      'Adapter l\'interface à la charte graphique existante',
      'Retravailler les composants UI',
      'Améliorer la hiérarchisation des informations',
      'Concevoir les interactions mobiles',
      'Collaborer avec les développeurs pour la recette fonctionnelle et visuelle'
    ],
    demarche: [
      {
        title: 'Analyse de l\'interface existante',
        content: 'Étude de l\'application mobile afin d\'identifier les éléments visuels obsolètes et les points d\'amélioration en termes de lisibilité et d\'accessibilité.'
      },
      {
        title: 'Adaptation à la charte graphique',
        content: 'Application de la charte graphique existante afin d\'harmoniser l\'interface avec les autres produits digitaux du groupe.'
      },
      {
        title: 'Refonte des composants mobiles',
        content: 'Modernisation des composants UI et amélioration de la hiérarchisation des informations pour faciliter la lecture et la navigation.'
      },
      {
        title: 'Collaboration technique',
        content: 'Travail en collaboration avec les développeurs afin d\'assurer la cohérence entre les maquettes et l\'implémentation finale, avec une recette fonctionnelle et visuelle complète.'
      }
    ],
    impact: 'La refonte a permis de :\n\n• Moderniser l\'interface mobile\n• Améliorer la lisibilité des informations\n• Renforcer la cohérence avec les autres produits digitaux du groupe\n\nLes retours internes ont été positifs, notamment sur la clarté et la modernisation de l\'expérience mobile.',
    image: cgrmHeroImage,
    gallery: [
      cgrmScreensImage,
    ]
  }
];

// Number of "projets principaux" (first N in the array)
const PROJETS_PRINCIPAUX_COUNT = 3;

// Tous les projets (plus de séparation)
export const tousProjets = projetsData.map((projet, index) => ({
  link: `/projets/${projet.id}`,
  text: projet.title,
  year: projet.year,
  description: projet.description,
  tags: projet.tags,
  image: projet.image,
  brand: projet.brand,
  number: String(index + 1).padStart(3, '0')
}));

// Projets principaux (les 3 premiers) - conservé pour compatibilité
export const projetsPrincipaux = projetsData.slice(0, PROJETS_PRINCIPAUX_COUNT).map(projet => ({
  link: `/projets/${projet.id}`,
  text: projet.title,
  year: projet.year,
  description: projet.description,
  tags: projet.tags,
  image: projet.image,
  brand: projet.brand
}));

// Autres projets (tous les suivants) - conservé pour compatibilité
export const autresProjets = projetsData.slice(PROJETS_PRINCIPAUX_COUNT).map(projet => ({
  link: `/projets/${projet.id}`,
  text: projet.title,
  year: projet.year,
  description: projet.description,
  tags: projet.tags,
  image: projet.image,
  brand: projet.brand
}));