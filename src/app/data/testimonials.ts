export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Sarah Chen',
    role: 'VP of Product',
    company: 'Nexus Financial',
    content: 'Collaboration exceptionnelle. La refonte de notre app a dépassé toutes nos attentes. L\'approche stratégique combinée à l\'excellence en exécution nous a permis de tripler notre engagement utilisateur.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
  },
  {
    id: 'test-2',
    name: 'Marcus Rivera',
    role: 'Founder & CEO',
    company: 'Aurora Luxury',
    content: 'Rare capacité à comprendre notre vision de marque et la traduire en expérience digitale premium. Le site a transformé notre présence en ligne et nos ventes ont explosé.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  {
    id: 'test-3',
    name: 'Emily Thompson',
    role: 'Head of Design',
    company: 'Pulse Inc.',
    content: 'Expertise UX/UI de niveau international. Le design system créé pour nous a unifié nos produits et accéléré drastiquement notre vélocité de développement.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
  },
  {
    id: 'test-4',
    name: 'David Kim',
    role: 'CTO',
    company: 'Zen Digital',
    content: 'Maîtrise technique impressionnante. Au-delà du design, la compréhension des enjeux tech et performance fait toute la différence. Notre app est dans le top 10 grâce à ce travail.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
  },
  {
    id: 'test-5',
    name: 'Sophie Martin',
    role: 'CMO',
    company: 'Vertex Corp',
    content: 'Vision stratégique remarquable. Chaque décision design était justifiée par des insights utilisateur et des objectifs business. Un vrai partenaire, pas juste un exécutant.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop'
  }
];
