import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import ScrollFadeIn from './ScrollFadeIn';
import ScrollRevealTitle from './ScrollRevealTitle';
import { Link } from 'react-router';
import RollingText from './RollingText';
import { CONTACT_EMAIL_HREF, ROUTES, SITE_CONTACT } from '../config';
import { useT } from '../i18n';

const STRINGS = {
  fr: { contactCta: 'Entrer en contact', mentions: 'Mentions légales' },
  en: { contactCta: 'Get in touch', mentions: 'Legal notice' },
};

export default function ContactFooter() {
  const t = useT(STRINGS);
  const contactTextRef = useRef(null);
  const isContactTextInView = useInView(contactTextRef, {
    once: true,
    amount: 0.3,
  });
  const [isContactButtonHovered, setIsContactButtonHovered] = useState(false);

  return (
    <footer
      className="relative w-full px-[0px] pt-[0px]"
      style={{ paddingBottom: '50px' }}
    >
      <div className="mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 w-full max-w-[1920px] mx-[0px] mt-[0px] mb-[50px]">
        <div
          className="relative overflow-hidden h-[220px] md:h-[350px]"
          style={{
            backgroundColor: 'var(--portfolio-card-bg)',
            border: '1px solid var(--portfolio-card-border)',
            borderRadius: '16px',
          }}
        >
          {/* Email and Phone - Centered on mobile, Top Left on desktop */}
          <ScrollRevealTitle delay={0}>
            <div
              className="absolute left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 flex flex-col gap-[7px] items-center md:items-start z-10 top-[32px] md:top-[45px] md:-translate-y-1/2"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 400,
                fontSize: '14.2px',
                lineHeight: '20.25px',
                letterSpacing: '0.038px',
              }}
            >
              <a
                href={CONTACT_EMAIL_HREF}
                className="flex items-center gap-2 transition-colors cursor-pointer"
                style={{
                  color: 'var(--portfolio-text-secondary)',
                }}
              >
                <Mail size={16} />
                <p>{SITE_CONTACT.email}</p>
              </a>
              <a
                href={SITE_CONTACT.phoneHref}
                className="flex items-center gap-2 transition-colors cursor-pointer"
                style={{
                  color: 'var(--portfolio-text-description)',
                }}
              >
                <Phone size={16} />
                <p>{SITE_CONTACT.phoneDisplay}</p>
              </a>
            </div>
          </ScrollRevealTitle>

          {/* Separator Line */}
          <div
            className="absolute left-8 right-8 top-[110px] md:top-[90px]"
            style={{
              height: '1px',
              backgroundColor: 'var(--portfolio-card-border)',
            }}
          />

          {/* Contact Button - Centered below separator on mobile, Top Right above separator on desktop */}
          <ScrollFadeIn delay={0.2}>
            <Link
              to={ROUTES.CONTACT}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-auto md:translate-x-0 md:right-8 px-6 py-3 flex items-center gap-2 transition-colors duration-300 top-[165px] md:top-[45px] whitespace-nowrap z-10 cursor-pointer"
              style={{
                backgroundColor: isContactButtonHovered
                  ? 'var(--portfolio-button-bg-hover)'
                  : 'var(--portfolio-button-bg)',
                color: 'var(--portfolio-button-text)',
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                borderRadius: '5px',
              }}
              onMouseEnter={() => setIsContactButtonHovered(true)}
              onMouseLeave={() => setIsContactButtonHovered(false)}
              onFocus={() => setIsContactButtonHovered(true)}
              onBlur={() => setIsContactButtonHovered(false)}
            >
              <MessageCircle size={18} />
              <RollingText
                text={t.contactCta}
                inView={isContactButtonHovered}
                transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }}
              />
            </Link>
          </ScrollFadeIn>

          {/* Large CONTACT Text - Center, Cut off - Hidden on mobile */}
          <motion.div
            aria-hidden="true"
            ref={contactTextRef}
            initial={{ filter: 'blur(20px)', opacity: 0 }}
            animate={
              isContactTextInView
                ? { filter: 'blur(0px)', opacity: 1 }
                : { filter: 'blur(20px)', opacity: 0 }
            }
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
            className="hidden md:flex absolute left-0 right-0 items-center justify-center whitespace-nowrap"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(140px, 21vw, 400px)',
              lineHeight: '1',
              letterSpacing: '-0.05em',
              color: 'var(--portfolio-text-large)',
              bottom: 'clamp(-82px, -11vw, -205px)',
              overflow: 'visible',
              pointerEvents: 'none',
              position: 'relative',
            }}
          >
            <p>CONTACT</p>
          </motion.div>
        </div>

        {/* Barre légale */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 400,
            fontSize: '13px',
            color: 'var(--portfolio-text-muted)',
          }}
        >
          <p>© {new Date().getFullYear()} Alexis Kabiche</p>
          <Link
            to={ROUTES.MENTIONS}
            className="hover:opacity-70 transition-opacity cursor-pointer"
          >
            {t.mentions}
          </Link>
        </div>
      </div>
    </footer>
  );
}
