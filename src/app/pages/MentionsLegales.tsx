import type { ReactNode } from 'react';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import PageMeta from '../components/PageMeta';
import ContactFooter from '../components/ContactFooter';
import { CONTACT_EMAIL_HREF, SITE_CONTACT } from '../config';

/**
 * Mentions légales (obligation légale française pour un site professionnel).
 * Alignée sur la DA des pages de contenu (shell Contact/À propos).
 *
 * ⚠️ Les champs marqués « [À compléter] » nécessitent des informations que
 * seul l'éditeur possède (statut juridique, SIRET, adresse) — à renseigner
 * avant mise en production.
 */
export default function MentionsLegales() {
  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: 'var(--portfolio-bg)' }}
    >
      <PageMeta
        title="Mentions légales — Alexis Kabiche"
        description="Mentions légales du site portfolio d'Alexis Kabiche : éditeur, hébergeur, propriété intellectuelle et protection des données personnelles."
        path="/mentions-legales"
      />

      <section
        style={{ paddingTop: 'var(--page-padding-top)' }}
        className="pb-16 md:pb-24"
      >
        <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
          {/* En-tête */}
          <div className="mb-14 md:mb-20">
            <ScrollRevealTitle delay={0}>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(0.8125rem, 0.75rem + 0.3125vw, 0.9375rem)',
                  lineHeight: '1.6',
                  color: 'var(--portfolio-text-secondary)',
                  letterSpacing: '0.5px',
                }}
              >
                Informations légales
              </p>
            </ScrollRevealTitle>
            <ScrollRevealTitle delay={0.05}>
              <h1
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 1rem + 5vw, 3rem)',
                  lineHeight: '1.1',
                  letterSpacing: '-1.4px',
                  color: 'var(--portfolio-text-primary)',
                }}
              >
                Mentions légales
              </h1>
            </ScrollRevealTitle>
          </div>

          {/* Corps */}
          <ScrollFadeIn delay={0.2}>
            <div className="max-w-3xl space-y-12">
              <LegalSection title="Éditeur du site">
                <p>
                  Le présent site est édité par <strong>Alexis Kabiche</strong>,
                  Product &amp; Brand Designer.
                </p>
                <dl className="mt-4 space-y-1">
                  <LegalRow label="Statut">[À compléter : statut juridique — ex. entrepreneur individuel / micro-entreprise]</LegalRow>
                  <LegalRow label="SIRET">[À compléter : numéro SIRET]</LegalRow>
                  <LegalRow label="Adresse">[À compléter : adresse professionnelle]</LegalRow>
                  <LegalRow label="Localisation">{SITE_CONTACT.location}</LegalRow>
                  <LegalRow label="Email">
                    <a
                      href={CONTACT_EMAIL_HREF}
                      className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                      {SITE_CONTACT.email}
                    </a>
                  </LegalRow>
                  <LegalRow label="Téléphone">
                    <a
                      href={SITE_CONTACT.phoneHref}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {SITE_CONTACT.phoneDisplay}
                    </a>
                  </LegalRow>
                </dl>
              </LegalSection>

              <LegalSection title="Directeur de la publication">
                <p>Alexis Kabiche.</p>
              </LegalSection>

              <LegalSection title="Hébergement">
                <p>Le site est hébergé par&nbsp;:</p>
                <dl className="mt-4 space-y-1">
                  <LegalRow label="Hébergeur">Vercel Inc.</LegalRow>
                  <LegalRow label="Adresse">
                    340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
                  </LegalRow>
                  <LegalRow label="Site web">
                    <a
                      href="https://vercel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                      vercel.com
                    </a>
                  </LegalRow>
                </dl>
                <p className="mt-4">
                  Le nom de domaine <strong>alexiskabiche.com</strong> est
                  enregistré via Squarespace Domains.
                </p>
              </LegalSection>

              <LegalSection title="Propriété intellectuelle">
                <p>
                  L'ensemble des éléments présents sur ce site (textes, visuels,
                  maquettes, projets, identité graphique, code) est la propriété
                  exclusive d'Alexis Kabiche, sauf mention contraire. Certains
                  projets présentés ont été réalisés dans un cadre professionnel
                  et restent la propriété de leurs commanditaires respectifs
                  (notamment les marques du groupe SPVIE) ; ils sont exposés ici
                  à des fins de portfolio, avec l'accord des parties concernées.
                </p>
                <p className="mt-4">
                  Toute reproduction, représentation, modification ou
                  exploitation, totale ou partielle, sans autorisation écrite
                  préalable, est interdite et constituerait une contrefaçon
                  sanctionnée par le Code de la propriété intellectuelle.
                </p>
              </LegalSection>

              <LegalSection title="Données personnelles">
                <p>
                  Le formulaire de contact collecte les données que vous
                  transmettez volontairement (nom, prénom, adresse email, objet
                  et contenu du message), dans l'unique but de traiter votre
                  demande. Ces données ne sont ni cédées ni vendues à des tiers
                  et ne sont conservées que le temps nécessaire au traitement de
                  votre demande.
                </p>
                <p className="mt-4">
                  Conformément au Règlement général sur la protection des
                  données (RGPD) et à la loi « Informatique et Libertés », vous
                  disposez d'un droit d'accès, de rectification, d'opposition et
                  de suppression de vos données. Pour l'exercer, écrivez à{' '}
                  <a
                    href={CONTACT_EMAIL_HREF}
                    className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    {SITE_CONTACT.email}
                  </a>
                  .
                </p>
              </LegalSection>

              <LegalSection title="Cookies et mesure d'audience">
                <p>
                  Ce site n'utilise aucun cookie publicitaire ni traceur
                  tiers. La préférence de thème (clair/sombre) est mémorisée
                  localement dans votre navigateur (stockage local), à des fins
                  purement fonctionnelles.
                </p>
                <p className="mt-4">
                  La fréquentation est mesurée via Vercel Analytics et Vercel
                  Speed Insights, des solutions respectueuses de la vie privée
                  qui ne déposent pas de cookies et n'utilisent pas de données
                  permettant de vous identifier personnellement.
                </p>
              </LegalSection>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      <ContactFooter />
    </div>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 600,
          fontSize: 'clamp(1.125rem, 1rem + 0.5vw, 1.375rem)',
          letterSpacing: '-0.3px',
          color: 'var(--portfolio-text-primary)',
          marginBottom: '12px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(0.9375rem, 0.875rem + 0.3vw, 1.0625rem)',
          lineHeight: '1.7',
          color: 'var(--portfolio-text-description)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

function LegalRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <dt
        className="shrink-0"
        style={{
          fontWeight: 600,
          color: 'var(--portfolio-text-secondary)',
          minWidth: '140px',
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: 0 }}>{children}</dd>
    </div>
  );
}
