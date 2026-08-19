import type { ProjetTranslation } from './projetsData';

/**
 * Traductions anglaises des projets, indexées par id. Fusionnées avec les
 * données FR (canoniques) par getProjets('en'). Les champs non textuels
 * (image, galerie, année, urls) restent partagés côté FR.
 */
export const projetsDataEn: Record<string, ProjetTranslation> = {
  mauni: {
    title: 'Mauni',
    subtitle: 'Take back control of your money, without thinking about it.',
    description:
      'A budgeting app designed and built solo — art direction, identity and product. Real bank connections and a clear read of what comes in, goes out and what’s left.',
    tags: ['Product Design', 'UX/UI', 'Art Direction', 'Development'],
    brand: 'Mauni',
    natureProduit: 'Personal finance mobile app',
    utilisateurPrincipal: 'Anyone who wants to track their budget effortlessly',
    objectifProduit:
      'Make it clear at a glance what comes in, what goes out and what’s left — and turn saving into a project rather than a constraint.',
    contexte:
      'A personal project: a finance app I actually wanted to use every day. Designed, art-directed and built solo, connected to real bank accounts and deployed online.\n\nAn overdraft isn’t a lack of money: it’s a lack of visibility. Mauni replaces anxiety with a clear read — what comes in, what goes out, what’s left.',
    problematique:
      'Banking apps drown the essentials under features. The balance and the decision had to come back to the center.\n\nKey points:\n\n• See at a glance what’s really left to spend\n• Understand spending without reading a line-by-line statement\n• Make saving a concrete goal, not a constraint',
    role: 'Running the whole thing, from concept to live product: research, information architecture, UI, component system, brand direction, then building the app itself (real bank connections and authentication).',
    interventions: [
      'Art direction & brand identity',
      'Information architecture & UX',
      'UI and component system',
      'App development (front-end + integrations)',
    ],
    demarche: [
      {
        title: 'Framing',
        content:
          'Define the promise — balance first, decision next — and the screen architecture around it.',
      },
      {
        title: 'Identity',
        content:
          'Create the name, logo and art direction: a calm, legible app, in light and dark.',
      },
      {
        title: 'Design system',
        content:
          'Design the UI and a coherent component system across 18 screens, from budget to breakdown.',
      },
      {
        title: 'Development',
        content:
          'Code the app and wire up the real bank connections and authentication, through to going live.',
      },
    ],
    impact:
      'A concept turned into a working product, used daily.\n\n• A complete 18-screen app, designed and built solo\n• Real bank connections and authentication, deployed online\n• Brand identity created from scratch',
  },
  'onboarding-rh': {
    title: 'HR Onboarding',
    subtitle: 'Turning a first day into a real welcome.',
    description:
      'An HR onboarding platform designed and built solo for SPVIE — two spaces: a guided journey for the newcomer, clear steering for HR. A complete prototype, deployed and validated by HR.',
    tags: ['Product Design', 'UX/UI', 'Development'],
    brand: 'HR Onboarding',
    natureProduit: 'Internal onboarding web platform',
    utilisateurPrincipal: 'HR and new joiners',
    objectifProduit:
      'Structure onboarding: a guided journey for the newcomer, at-a-glance steering for HR.',
    contexte:
      'An internal SPVIE project: onboarding lived in emails and spreadsheets, with no overview for HR and no bearings for the newcomer.\n\nI designed and built a dedicated two-space platform so a first day no longer depends on whoever handles it.',
    problematique:
      'Day one was improvised, for lack of a shared tool.\n\nKey points:\n\n• Give HR an overview and zero forgotten step\n• Guide the newcomer step by step, without overwhelming them\n• Reuse onboarding content and tailor it per role',
    role: 'Running the whole thing, from framing to deployed product: needs framing with HR, architecture of the two spaces, UI and component system, then the development (database, deployment, a first brick connecting to the SPVIE environment).',
    interventions: [
      'Needs framing with HR',
      'Architecture of the two spaces and the journey',
      'UI, component system, prototypes',
      'Development (database, deployment, SSO started)',
    ],
    demarche: [
      {
        title: 'Framing',
        content:
          'Pin down the need with HR and define the two spaces: the newcomer and the steering.',
      },
      {
        title: 'Architecture',
        content:
          'Map the end-to-end journey (D-7 → D+30) and a common trunk that branches per role.',
      },
      {
        title: 'Design system',
        content:
          'Design the UI and a component system shared across both spaces.',
      },
      {
        title: 'Development',
        content:
          'Code the platform, the database and the deployment, through to a public demo.',
      },
    ],
    impact:
      'A complete prototype, presented to and validated by SPVIE HR.\n\n• An internal solution ready to trigger as soon as hiring picks up again\n• Two working spaces: guided newcomer, HR steering\n• Designed and built solo, deployed online',
  },
  syma: {
    title: 'SYMA',
    subtitle: 'Choosing a brand identity, together.',
    description:
      'Brand identity (logo, iconography, typography) for SYMA, a communications agency just getting started — plus a custom web tool to compare the directions and decide together.',
    tags: ['Art Direction', 'Brand Identity', 'Development'],
    brand: 'SYMA',
    natureProduit: 'Brand identity & decision site',
    utilisateurPrincipal: 'A communications agency just getting started (2 founders)',
    objectifProduit:
      'Create SYMA’s identity and a tool to choose it together, on common ground.',
    contexte:
      'SYMA, a communications agency in the making (two founders), needed an identity — and a way to choose it together.\n\nPicking a logo over emails and screenshots scatters the decision. I gathered the directions in one place: compare, rank, decide.',
    problematique:
      'Deciding on an identity together, without getting lost.\n\nKey points:\n\n• Compare directions side by side, not in an email thread\n• Gather clear feedback (accept, reject, request)\n• Decide on common ground',
    role: 'Sole hand on it: art direction (logo, iconography, typography — palette provided) then building a custom site to compare, comment on and validate the directions.',
    interventions: [
      'Art direction (logo, iconography, typography)',
      'Design of the directions comparator',
      'UI and live logo recoloring (SVG)',
      'Development and deployment of the site',
    ],
    demarche: [
      {
        title: 'Art direction',
        content:
          'Create the logo, iconography and type system (palette provided by the agency).',
      },
      {
        title: 'The comparator',
        content:
          'Design a tool that lines the directions up side by side, recolorable live.',
      },
      {
        title: 'The dialogue',
        content:
          'Let them accept, reject with feedback, or request a variant — all in one place.',
      },
      {
        title: 'Development',
        content:
          'Code and deploy the site on Claude Code, with real SVGs recolored live.',
      },
    ],
    impact:
      'A real client project delivered: identity + a tool to choose it.\n\n• A complete identity (logo, iconography, type) for an agency just getting started\n• A custom site to compare and decide together\n• Designed and built solo, online',
  },
  trackit: {
    title: 'TrackIt',
    subtitle: 'Film & TV tracking — TMDB search, episodes, cloud sync.',
    description:
      'A mobile-first web app to track your films and shows: watchlist, episode-by-episode tracking, statuses, history and TV Time import, synced to the cloud. Solo full-stack build.',
    tags: ['Product design', 'React 19', 'Full-stack'],
    brand: 'Trackit',
    natureProduit: 'Web app',
    utilisateurPrincipal: 'Me — and anyone juggling shows across platforms',
    objectifProduit:
      'Centralize tracking of your films and shows: where you are, what to watch next, across all your screens.',
    contexte:
      'One show on Netflix, another on Prime, a third on Crunchyroll — and you lose the thread. I used TV Time, but I wanted my own tool, precise and under my control.\n\nI built TrackIt full-stack, solo, as my daily tracker.',
    problematique:
      'Keeping track of what you watch when everything is scattered.\n\nKey points:\n\n• Know exactly where you are, episode by episode\n• Find what to watch next in one tap\n• Bring your history over (TV Time import) and keep it synced',
    role: 'Sole hand on it, from design to full-stack: dark mobile-first UI, React 19 + Tailwind front-end, Express proxy + TMDB integration, Google auth and Firestore sync, TV Time import.',
    interventions: [
      'Product & UI design (dark, mobile-first)',
      'React 19 front-end + Tailwind, animations',
      'Express proxy + TMDB integration',
      'Google auth & Firestore sync',
      'TV Time import (history migration)',
    ],
    demarche: [
      {
        title: 'Framing',
        content:
          'Define the core: episode-by-episode tracking, mobile first.',
      },
      {
        title: 'Data',
        content:
          'Wire up TMDB through an Express proxy for search and details.',
      },
      {
        title: 'Design & front-end',
        content:
          'Design a dark UI built for the couch, in React 19 + Tailwind.',
      },
      {
        title: 'Account & sync',
        content:
          'Add Google auth, Firestore sync and TV Time import.',
      },
    ],
    impact:
      'My daily tracker, replacing TV Time.\n\n• Precise tracking, synced across all my screens\n• Ad-free, under my control\n• A full-stack project designed and built solo',
  },
  'parcours-spvieassurances': {
    title: 'Redesign of the SPVIE subscription journey',
    subtitle:
      'A strategic digital funnel rethought from information architecture through to signature.',
    description:
      'Transforming a complex subscription funnel to clarify the offers and improve quote generation.',
    tags: [
      'B2B2C',
      'Conversion',
      'UX Strategy',
      'Information Architecture',
      'A/B Testing',
    ],
    brand: 'SPVIE Assurances',
    natureProduit: 'Insurance conversion funnel',
    utilisateurPrincipal: 'Individuals',
    objectifProduit: 'Generate quotes and ease subscription',
    contexte:
      "The SPVIE subscription funnel (comparison, pricing, quote, signature) is the group's most qualified source of leads.\n\nDespite its strategic importance, the journey had not evolved for several years. The dated design, confusing navigation and unclear presentation of the offers harmed both SPVIE's image and the funnel's performance.\n\nBehavioural analysis showed that users frequently hesitated along the way and dropped off at the moment of choosing their plan.\n\nThe goal of the project was therefore to modernise the experience, clarify product understanding and improve conversion up to the quote request.",
    problematique:
      'Matomo analysis identified a major drop-off point at the moment the offers were presented.\n\nSeveral factors explained this behaviour:\n\n• An outdated design that broke trust as soon as users entered the funnel\n• Guarantees presented without hierarchy or explanation\n• Unclear navigation that made decisions difficult\n\nThe funnel also had many steps, giving the impression of a long and complex journey.',
    role: 'UX/UI Designer, paired with an external consultant.\n\nI carried the UX thinking and the user vision throughout the project.',
    interventions: [
      'Competitive benchmark',
      'Structuring user flows',
      'Redesign of the information architecture',
      'Interface design',
      'Direct collaboration with the developers',
      'Final technical and visual QA',
    ],
    demarche: [
      {
        title: 'Audit and framing',
        content:
          'Analysis of user behaviour through ContentSquare and Matomo to identify areas of hesitation and friction along the journey. A competitive benchmark was also carried out to compare offer-presentation logic and the conversion patterns used in other insurance funnels.',
      },
      {
        title: 'Restructuring the journey',
        content:
          'A full redesign of the information architecture to organise the steps in a more logical and progressive way. Questions were grouped and organised in a step-by-step logic that reduced the perceived length of the journey without changing the business logic.',
      },
      {
        title: 'Redesign of the offer presentation',
        content:
          'The offer-selection stage was completely rethought: new visual hierarchy, clearer guarantees, reassurance micro-copy, and "recommended offer" badges. A dynamic final summary was also introduced, inspired by e-commerce cart logic.',
      },
      {
        title: 'Validation',
        content:
          'Two variants of the offer presentation were tested through A/B testing to identify the most effective structure. The project concluded with full technical and visual QA in collaboration with the developers.',
      },
    ],
    impact:
      'Early user and internal feedback highlighted several improvements.\n\n• Perceived journey time halved: an around-30-minute journey now feels like a 10-to-15-minute experience\n• Improved perceived fluidity and better understanding of the offers\n• Removal of the main frictions identified up to the quote request\n• Early internal feedback pointing to an increase in the volume of leads generated through the funnel',
  },
  'crm-bigbroker': {
    title: 'Design of the internal BigBroker CRM',
    subtitle:
      "A business tool built to centralise data, structure advisors' activity and steer sales performance.",
    description:
      "Building a tool that centralises leads and structures the teams' sales activity.",
    tags: [
      'SaaS',
      'Product Design',
      'UX Strategy',
      'Dashboard',
      'Data Visualization',
    ],
    brand: 'BigBroker – SPVIE Group',
    natureProduit: 'Internal SaaS',
    utilisateurPrincipal: 'Phone sales teams',
    objectifProduit: 'Centralise leads and steer sales activity',
    contexte:
      "BigBroker has phone teams tasked with contacting and converting prospects from various acquisition channels.\n\nBefore this project, no centralised tool existed to manage these leads efficiently or to track advisors' activity.\n\nThe goal of the project was to design a fully in-house CRM enabling the sales teams to manage their client portfolio, track their leads, steer their performance and centralise all client information.",
    problematique:
      "The sales teams had to handle a growing volume of leads from different sources.\n\nWithout a dedicated tool, several difficulties arose:\n\n• No centralisation of client data\n• Difficulty tracking advisors' performance\n• Complex lead dispatching\n• Lack of visibility on untreated leads\n\nThe challenge was to design a clear, fast tool suited to the operational constraints of the call teams.",
    role: "UX/UI Designer within the product team.\n\nI took an active part in the business workshops to understand the sales teams' needs and translate them into workable interfaces.",
    interventions: [
      'Structure the data hierarchy',
      'Define lead statuses and transitions',
      'Design the main CRM interfaces',
      'Design the dashboards and management tables',
      'Create the product design system',
      'Work closely with the developers',
    ],
    demarche: [
      {
        title: 'Understanding the business needs',
        content:
          "Workshops were held with the internal teams to understand their daily work and constraints. The goal was to identify the most frequent actions, the essential information to display and the advisors' workflows.",
      },
      {
        title: 'Structuring the data',
        content:
          'Significant work went into organising the information and prioritising client data. Each policyholder record had to bring together, clearly: documents, exchange history, emails, comments and quote follow-ups.',
      },
      {
        title: 'Interface design',
        content:
          'Several key interfaces were designed: a lead-tracking dashboard, portfolio management with filters and alerts, a policyholder record centralising client information, and a pricing module to capture needs and compare offers.',
      },
      {
        title: 'Lead management',
        content:
          'The CRM includes a system to dispatch leads to advisors, set distribution rules based on their origin, track quotas per team and manage unassigned leads.',
      },
    ],
    impact:
      "The CRM now lets the sales teams:\n\n• Centralise all client data\n• Manage incoming leads more efficiently\n• Track their activity and performance\n• Improve the organisation of advisors' work\n\nThe tool is now a structuring part of the internal digital ecosystem.",
  },
  agpt: {
    title: 'Creating the Agir Pour Toutes brand',
    subtitle:
      'Shaping a purpose-driven brand and designing a site to present its world and sell its clubs.',
    description:
      'Launching an identity and a digital platform dedicated to supporting women.',
    tags: ['Branding', 'Web Design', 'Design System', 'Art direction'],
    brand: 'Agir Pour Toutes',
    natureProduit: 'Community and content platform',
    utilisateurPrincipal: 'Women (mothers, mothers-to-be, perimenopause)',
    objectifProduit:
      'Offer support content and programmes through themed clubs',
    contexte:
      'Agir Pour Toutes is an initiative dedicated to supporting women at different stages of their lives: pregnancy, birth, postpartum, wellbeing and personal development.\n\nThe founders wanted to create a site to present their mission and offer themed clubs made up of videos and exclusive content.\n\nThe project started from a blank page: no visual identity, no site and no structured graphic world. The challenge was therefore to create a coherent brand able to embody a world that is at once warm, premium and accessible.',
    problematique:
      "The project required building a complete brand while striking the right balance between:\n\n• The emotional dimension tied to women's themes\n• The credibility and seriousness of a support platform\n• A distinctive visual world without falling into motherhood clichés\n\nIt also required designing a site able to clearly present the content and enable the sale of the clubs.",
    role: "UX/UI Designer and lead for the project's art direction.\n\nI led the whole design dimension and was the founders' main point of contact to translate their vision into a coherent graphic world.",
    interventions: [
      'Creation of the visual identity',
      'Definition of the art direction',
      'Website design',
      'Creation of the associated visual assets',
    ],
    demarche: [
      {
        title: 'Creating the brand identity',
        content:
          'Design of the complete visual identity: logo, colour palette and typography. The goal was to create a warm, modern world while keeping a credible and institutional dimension.',
      },
      {
        title: 'Defining the art direction',
        content:
          "Creation of a coherent graphic world to structure the brand's image across all its digital and event assets.",
      },
      {
        title: 'Designing the platform',
        content:
          "Design of the website to present AGPT's mission, showcase the content on offer and sell the themed clubs.",
      },
      {
        title: 'Supporting the founders',
        content:
          'Working directly with the founders to clarify their ideas, adjust the graphic proposals and evolve the art direction across several iterations.',
      },
    ],
    impact:
      "The project made it possible to:\n\n• Create the complete AGPT brand identity\n• Launch the digital platform\n• Structure the brand's visual world\n\nThe identity is now used across all the brand's communication assets, as well as at its events and community activities.",
  },
  'refonte-spvie': {
    title: 'Strategic visual redesign of the SPVIE website',
    subtitle:
      'Imagining a new web experience able to clarify the offers, improve navigation and support lead generation.',
    description:
      'Imagining a clearer, conversion-oriented site to support digital acquisition.',
    tags: [
      'UX Strategy',
      'Website redesign',
      'Conversion',
      'Information architecture',
      'Product thinking',
    ],
    brand: 'SPVIE Assurances',
    natureProduit: 'Insurance marketing website',
    utilisateurPrincipal: 'Individuals',
    objectifProduit:
      'Generate leads and guide users towards the subscription journeys',
    contexte:
      "The SPVIE website is the group's main showcase for individuals and an important entry point to the subscription journey.\n\nHowever, the site's interface relied on an old design and a complex architecture of nearly 280 product pages.\n\nThis made navigation difficult and limited the site's effectiveness as an acquisition tool.\n\nAmid internal transformation and with a new, growth-focused general management arriving, I took the initiative to propose a redesign vision for the site to modernise SPVIE's image and strengthen its commercial effectiveness.",
    problematique:
      "The site had several limitations:\n\n• A dated design that weakened the perception of credibility\n• Product pages that were hard to understand\n• A complex architecture making navigation unintuitive\n\nThe challenge was to propose a redesign vision that would:\n\n• Modernise the group's image\n• Clarify understanding of the offers\n• Strengthen the site's ability to generate leads",
    role: "UX/UI Designer, at the origin of the project.\n\nI proposed a complete redesign vision including a new navigation architecture, a new content hierarchy, a modernised visual direction and more educational, conversion-oriented product pages.\n\nThe mockups were presented to the CIO to feed the strategic thinking around the site's future evolution.",
    interventions: [
      'New navigation architecture',
      'New content hierarchy',
      'Modernised visual direction',
      'More educational, conversion-oriented product pages',
      'Presentation to the CIO',
    ],
    demarche: [
      {
        title: 'Analysis of the existing site',
        content:
          "A study of the site's architecture and product pages to identify readability and navigation issues within an ecosystem of several hundred pages.",
      },
      {
        title: 'Simplifying the architecture',
        content:
          'A proposal for a new navigation structure providing faster access to the offers and clarifying the information hierarchy.',
      },
      {
        title: 'Redesigning the user experience',
        content:
          'Design of new mockups emphasising offer clarity, reassurance and a clearer visual hierarchy.',
      },
      {
        title: 'An acquisition-oriented vision',
        content:
          'Integration of a more conversion-oriented logic, with a clearer highlight of the quote journeys and a better showcasing of the offers.',
      },
    ],
    impact:
      "The proposal was validated by the CIO and now serves as a basis for thinking about the site's future evolution.\n\nSome ideas from this redesign have already been integrated into the group's digital ecosystem, notably on navigation elements such as the menu and footer.",
  },
  'charte-spvie': {
    title: 'Proposed redesign of the SPVIE brand guidelines',
    subtitle:
      "Rethinking the group's brand guidelines to harmonise its assets and strengthen brand credibility.",
    description:
      "Redefining the group's visual identity to modernise its image and harmonise its assets.",
    tags: [
      'Branding',
      'Art direction',
      'Brand Strategy',
      'Design System',
      'Visual identity',
    ],
    brand: 'SPVIE Assurances',
    natureProduit: 'Brand identity system',
    utilisateurPrincipal: 'SPVIE group and internal teams',
    objectifProduit:
      "Modernise the group's image and harmonise its digital and print assets",
    contexte:
      'SPVIE\'s brand guidelines dated back to 2017. Over the years, communication assets had multiplied and the visual identity was becoming less and less consistent.\n\nThe historical, very "rule-breaking" style was also ageing badly and no longer reflected the seriousness expected in the insurance sector.\n\nThe communications department therefore launched an internal project to challenge the design and communication team to imagine a possible evolution of the group\'s visual identity.',
    problematique:
      "SPVIE's brand guidelines dated back to 2017 and no longer reflected the image the group wanted to project today. With the multiplication of assets and products, the visual identity was becoming increasingly heterogeneous.\n\nThe challenge was to modernise the brand's image while keeping certain landmarks for a historically rather senior audience.\n\nA balance had to be found between:\n\n• Modernity and credibility\n• Brand continuity and visual evolution\n• Consistency across the group's various assets",
    role: "UX/UI Designer involved in the thinking around the evolution of the group's visual identity.\n\nI proposed a complete art direction, formalised in a brand book and presented to the communications department and the co-founder.",
    interventions: [
      'Logo evolution',
      'New colour palette',
      'New typography',
      'Iconography system',
      'Design system foundations',
    ],
    demarche: [
      {
        title: 'Analysis of the existing identity',
        content:
          'A study of the current brand guidelines to identify elements that had become outdated and the inconsistencies that had appeared over time across the various communication assets.',
      },
      {
        title: 'Defining a new visual direction',
        content:
          "A proposal for a more modern and credible art direction, better suited to the insurance world while keeping the brand's historical identity.",
      },
      {
        title: 'Building a brand system',
        content:
          'Creation of a complete proposal including logo, colour palette, typography, iconography and design-system principles to structure all the communication assets.',
      },
      {
        title: 'Presentation and strategic discussions',
        content:
          "Presentation of the proposal to management to feed the thinking about the future evolution of the group's identity.",
      },
    ],
    impact:
      "The project was ultimately not deployed due to major changes within management.\n\nHowever, this proposal made it possible to:\n\n• Open the discussion on the evolution of SPVIE's image\n• Demonstrate the design team's ability to think about the group's identity at a strategic scale",
  },
  'mobile-cgrm': {
    title: 'Redesign of the CGRM mobile app',
    subtitle:
      "Adapting the mobile app to a more modern brand to improve readability and consistency with the group's digital ecosystem.",
    description:
      'Modernising the mobile interface to improve readability and the policyholder experience.',
    tags: [
      'Mobile app',
      'UI redesign',
      'Product design',
      'Accessibility',
      'Design System',
    ],
    brand: 'CGRM – SPVIE Group',
    natureProduit: 'Client mobile app',
    utilisateurPrincipal: 'Policyholders',
    objectifProduit:
      'Enable reimbursement tracking and management of the policyholder account',
    contexte:
      "CGRM is a SPVIE group entity with its own policyholder area available on mobile.\n\nThe mobile app's interface had a dated design and no longer matched the visual standards of the group's digital products.\n\nA visual redesign was therefore launched to modernise the interface and improve readability for users.\n\nThe main actions carried out in the app concern:\n\n• Viewing reimbursements\n• Requesting a reimbursement\n• Downloading certificates\n• Accessing personal information",
    problematique:
      'The mobile app fulfilled its functions correctly, but its interface no longer reflected current standards.\n\nThe main challenge was therefore to modernise the visual experience while keeping a functional structure users had already mastered.\n\nIn particular, it required:\n\n• Improving the readability of information\n• Modernising the visual components\n• Ensuring better accessibility on mobile',
    role: 'UX/UI Designer in charge of the visual redesign of the mobile app.',
    interventions: [
      'Adapt the interface to the existing brand guidelines',
      'Rework the UI components',
      'Improve the information hierarchy',
      'Design the mobile interactions',
      'Work with developers on functional and visual QA',
    ],
    demarche: [
      {
        title: 'Analysis of the existing interface',
        content:
          'A study of the mobile app to identify outdated visual elements and areas for improvement in terms of readability and accessibility.',
      },
      {
        title: 'Adapting to the brand guidelines',
        content:
          "Application of the existing brand guidelines to harmonise the interface with the group's other digital products.",
      },
      {
        title: 'Redesigning the mobile components',
        content:
          'Modernisation of the UI components and improvement of the information hierarchy to ease reading and navigation.',
      },
      {
        title: 'Technical collaboration',
        content:
          'Work with the developers to ensure consistency between the mockups and the final implementation, with full functional and visual QA.',
      },
    ],
    impact:
      "The redesign made it possible to:\n\n• Modernise the mobile interface\n• Improve the readability of information\n• Strengthen consistency with the group's other digital products\n\nInternal feedback was positive, particularly on the clarity and modernisation of the mobile experience.",
  },
};
