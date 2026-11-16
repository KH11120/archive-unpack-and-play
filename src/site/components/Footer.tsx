import { pagePaths, type Page } from '../page'
import { useLanguage } from './LanguageContext'
import AptcoderLogo from './AptcoderLogo'
import SocialLinks from './SocialLinks'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  OFFICE_ADDRESS_LINES,
  OFFICE_MAPS_URL,
} from '../data/contact'

interface FooterProps {
  navigate: (page: Page) => void
}

export default function Footer({ navigate }: FooterProps) {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            {/* The logo's lettering is dark grey, so it sits on a white panel on the dark footer. */}
            <button
              onClick={() => navigate('home')}
              className="mb-5 inline-flex items-center rounded-xl bg-white px-3 py-2"
              aria-label="APTCODER home"
            >
              <AptcoderLogo className="h-9" />
            </button>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t(
                'Helping children across India explore AI, robotics and coding in a language they understand best.',
                'भारत भर के बच्चों को उनकी सबसे अच्छी समझ वाली भाषा में एआई, रोबोटिक्स और कोडिंग सीखने में मदद करना।',
              )}
            </p>
            <SocialLinks variant="dark" />
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-5">{t('Our Offerings', 'हमारी पेशकश')}</h3>
            <ul className="space-y-3">
              {[
                { label: 'Our Courses' },
                { label: 'Vernatics (Robotics)' },
                { label: 'C-NAT Olympiad', page: 'cnat' as const },
                { label: 'Kids Coding Community' },
                { label: 'School Programs' },
                { label: 'Codely Platform', href: 'https://portal.aptcoder.com/dist/home.html', external: true },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.page ? pagePaths[item.page] : (item.href ?? '#')}
                    onClick={
                      item.page
                        ? (event) => {
                            event.preventDefault()
                            navigate(item.page)
                          }
                        : undefined
                    }
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${item.label} (opens in a new tab)` }
                      : {})}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-5">{t('Company', 'कंपनी')}</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', page: 'about' as Page },
                { label: 'Our Team', page: 'about' as Page },
                { label: 'Partner With Us', page: 'school' as Page },
                { label: 'Contact Us', page: 'contact' as Page },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.page)}
                    className="text-gray-400 text-sm hover:text-white transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              {[
                { label: 'Privacy Policy', page: 'privacy' as Page },
                { label: 'Terms & Conditions', page: 'terms' as Page },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={pagePaths[item.page]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-5">{t('Get In Touch', 'संपर्क करें')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">{CONTACT_EMAIL}</p>
                <a href={CONTACT_PHONE_HREF} className="mt-1 inline-block text-gray-400 text-sm hover:text-white transition-colors">
                  {CONTACT_PHONE}
                </a>
              </div>
              <div>
                <a
                  href={OFFICE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${OFFICE_ADDRESS_LINES.join(', ')} (opens Google Maps in a new tab)`}
                  className="block text-gray-400 text-sm leading-relaxed hover:text-white transition-colors"
                >
                  {OFFICE_ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </a>
              </div>
              <button
                onClick={() => navigate('courses')}
                className="inline-block bg-[#E8401C] text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-[#C73516] transition-colors"
              >
                {t('Book a Free Class →', 'मुफ़्त क्लास बुक करें →')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2024 APTCODER. All rights reserved.</p>
          <p className="text-gray-600 text-sm">Supported & Associated with IIM Lucknow EIC · FITT IIT Delhi · Microsoft · IIT Ropar</p>
        </div>
      </div>
    </footer>
  )
}
