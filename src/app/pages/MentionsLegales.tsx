import type { ReactNode } from 'react';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import PageMeta from '../components/PageMeta';
import ContactFooter from '../components/ContactFooter';
import { CONTACT_EMAIL_HREF, ROUTES, SITE_CONTACT } from '../config';
import { ROUTE_META } from '../config/seo';
import { useT } from '../i18n';

const STRINGS = {
  fr: {
    eyebrow: 'Informations légales',
    title: 'Mentions légales',
    editor: 'Éditeur du site',
    editorIntroBefore:
      'Le présent site est un portfolio personnel édité à titre non professionnel par ',
    editorIntroAfter: ', Product & Brand Designer.',
    rowLocation: 'Localisation',
    rowEmail: 'Email',
    rowPhone: 'Téléphone',
    editorNote:
      "Ce site est un portfolio personnel, sans activité commerciale. En tant qu'éditeur non professionnel (particulier), les informations d'entreprise (SIRET, adresse professionnelle) ne s'appliquent pas. Conformément à l'article 6 III 2 de la loi pour la confiance dans l'économie numérique (LCEN), mon adresse personnelle n'est pas rendue publique ; elle est communiquée à l'hébergeur du site.",
    director: 'Directeur de la publication',
    directorValue: 'Alexis Kabiche.',
    hosting: 'Hébergement',
    hostingIntro: 'Le site est hébergé par :',
    rowHost: 'Hébergeur',
    rowHostAddress: 'Adresse',
    hostAddress: '340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis',
    rowWebsite: 'Site web',
    domainBefore: 'Le nom de domaine ',
    domainAfter: ' est enregistré via Squarespace Domains.',
    ip: 'Propriété intellectuelle',
    ipP1: "L'ensemble des éléments présents sur ce site (textes, visuels, maquettes, projets, identité graphique, code) est la propriété exclusive d'Alexis Kabiche, sauf mention contraire. Certains projets présentés ont été réalisés dans un cadre professionnel et restent la propriété de leurs commanditaires respectifs (notamment les marques du groupe SPVIE) ; ils sont exposés ici à des fins de portfolio, avec l'accord des parties concernées.",
    ipP2: 'Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite et constituerait une contrefaçon sanctionnée par le Code de la propriété intellectuelle.',
    data: 'Données personnelles',
    dataP1:
      "Le formulaire de contact collecte les données que vous transmettez volontairement (nom, prénom, adresse email, objet et contenu du message), dans l'unique but de traiter votre demande. Ces données ne sont ni cédées ni vendues à des tiers et ne sont conservées que le temps nécessaire au traitement de votre demande.",
    dataP2Before:
      "Conformément au Règlement général sur la protection des données (RGPD) et à la loi « Informatique et Libertés », vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression de vos données. Pour l'exercer, écrivez à ",
    dataP2After: '.',
    cookies: "Cookies et mesure d'audience",
    cookiesP1:
      "Ce site n'utilise aucun cookie publicitaire ni traceur tiers. La préférence de thème (clair/sombre) est mémorisée localement dans votre navigateur (stockage local), à des fins purement fonctionnelles.",
    cookiesP2:
      "La fréquentation est mesurée via Vercel Analytics et Vercel Speed Insights, des solutions respectueuses de la vie privée qui ne déposent pas de cookies et n'utilisent pas de données permettant de vous identifier personnellement.",
  },
  en: {
    eyebrow: 'Legal information',
    title: 'Legal notice',
    editor: 'Site publisher',
    editorIntroBefore:
      'This site is a personal portfolio published on a non-professional basis by ',
    editorIntroAfter: ', Product & Brand Designer.',
    rowLocation: 'Location',
    rowEmail: 'Email',
    rowPhone: 'Phone',
    editorNote:
      'This is a personal portfolio with no commercial activity. As a non-professional (private individual) publisher, business details (company number, business address) do not apply. Under Article 6 III 2 of the French Digital Economy Act (LCEN), my personal address is not made public; it is provided to the site host.',
    director: 'Publication director',
    directorValue: 'Alexis Kabiche.',
    hosting: 'Hosting',
    hostingIntro: 'The site is hosted by:',
    rowHost: 'Host',
    rowHostAddress: 'Address',
    hostAddress: '340 S Lemon Ave #4133, Walnut, CA 91789, USA',
    rowWebsite: 'Website',
    domainBefore: 'The domain name ',
    domainAfter: ' is registered through Squarespace Domains.',
    ip: 'Intellectual property',
    ipP1: 'All content on this site (text, visuals, mockups, projects, graphic identity, code) is the exclusive property of Alexis Kabiche, unless otherwise stated. Some featured projects were produced in a professional context and remain the property of their respective clients (notably the SPVIE group brands); they are shown here for portfolio purposes, with the agreement of the parties involved.',
    ipP2: 'Any reproduction, representation, modification or use, in whole or in part, without prior written authorisation, is prohibited and would constitute infringement punishable under the French Intellectual Property Code.',
    data: 'Personal data',
    dataP1:
      'The contact form collects the data you voluntarily provide (last name, first name, email address, subject and message content), for the sole purpose of handling your request. This data is neither shared nor sold to third parties and is kept only for as long as needed to handle your request.',
    dataP2Before:
      'In accordance with the General Data Protection Regulation (GDPR) and the French Data Protection Act, you have the right to access, rectify, object to and delete your data. To exercise it, write to ',
    dataP2After: '.',
    cookies: 'Cookies and analytics',
    cookiesP1:
      'This site uses no advertising cookies or third-party trackers. Your theme preference (light/dark) is stored locally in your browser (local storage), for purely functional purposes.',
    cookiesP2:
      'Traffic is measured via Vercel Analytics and Vercel Speed Insights, privacy-friendly solutions that set no cookies and use no personally identifying data.',
  },
};

/**
 * Mentions légales — portfolio personnel édité par un particulier
 * (éditeur non professionnel, sans activité commerciale). Pas d'informations
 * d'entreprise (SIRET/adresse pro) : cf. LCEN art. 6 III 2.
 */
export default function MentionsLegales() {
  const t = useT(STRINGS);

  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: 'var(--portfolio-bg)' }}
    >
      <PageMeta {...ROUTE_META[ROUTES.MENTIONS]} />

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
                {t.eyebrow}
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
                {t.title}
              </h1>
            </ScrollRevealTitle>
          </div>

          {/* Corps — `amount="some"` : le bloc est plus haut que l'écran, donc
              on révèle dès qu'une partie est visible (à l'arrivée), sinon le
              seuil de 30 % n'est jamais atteint en haut de page et le contenu
              reste invisible jusqu'au scroll. */}
          <ScrollFadeIn delay={0.2} amount="some">
            <div className="max-w-3xl space-y-12">
              <LegalSection title={t.editor}>
                <p>
                  {t.editorIntroBefore}
                  <strong>Alexis Kabiche</strong>
                  {t.editorIntroAfter}
                </p>
                <dl className="mt-4 space-y-1">
                  <LegalRow label={t.rowLocation}>
                    {SITE_CONTACT.location}
                  </LegalRow>
                  <LegalRow label={t.rowEmail}>
                    <a
                      href={CONTACT_EMAIL_HREF}
                      className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                      {SITE_CONTACT.email}
                    </a>
                  </LegalRow>
                  <LegalRow label={t.rowPhone}>
                    <a
                      href={SITE_CONTACT.phoneHref}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {SITE_CONTACT.phoneDisplay}
                    </a>
                  </LegalRow>
                </dl>
                <p className="mt-4">{t.editorNote}</p>
              </LegalSection>

              <LegalSection title={t.director}>
                <p>{t.directorValue}</p>
              </LegalSection>

              <LegalSection title={t.hosting}>
                <p>{t.hostingIntro}</p>
                <dl className="mt-4 space-y-1">
                  <LegalRow label={t.rowHost}>Vercel Inc.</LegalRow>
                  <LegalRow label={t.rowHostAddress}>{t.hostAddress}</LegalRow>
                  <LegalRow label={t.rowWebsite}>
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
                  {t.domainBefore}
                  <strong>alexiskabiche.com</strong>
                  {t.domainAfter}
                </p>
              </LegalSection>

              <LegalSection title={t.ip}>
                <p>{t.ipP1}</p>
                <p className="mt-4">{t.ipP2}</p>
              </LegalSection>

              <LegalSection title={t.data}>
                <p>{t.dataP1}</p>
                <p className="mt-4">
                  {t.dataP2Before}
                  <a
                    href={CONTACT_EMAIL_HREF}
                    className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    {SITE_CONTACT.email}
                  </a>
                  {t.dataP2After}
                </p>
              </LegalSection>

              <LegalSection title={t.cookies}>
                <p>{t.cookiesP1}</p>
                <p className="mt-4">{t.cookiesP2}</p>
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
