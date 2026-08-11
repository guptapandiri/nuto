import { Link } from 'react-router';
import { business, whatsappLink } from '@/data/business';
import { flavours } from '@/data/range';

const policyLinks = [
  { to: '/policies/shipping', label: 'Shipping' },
  { to: '/policies/returns', label: 'Returns & refunds' },
  { to: '/policies/privacy', label: 'Privacy' },
  { to: '/policies/terms', label: 'Terms' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-sand">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/nuto-logo.svg"
              alt="Nuto — Flavor in every fold"
              className="h-14 w-auto"
              width={474}
              height={255}
            />
            <p className="mt-4 max-w-xs text-sm text-ink-soft">
              Premium flavoured cashews, roasted in {business.city} and shipped across
              India.
            </p>
          </div>

          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className="text-sm font-semibold">
              Shop
            </h2>
            <ul className="mt-4 space-y-2.5">
              {flavours.map((flavour) => (
                <li key={flavour.slug}>
                  <Link
                    to={`/p/${flavour.slug}`}
                    className="text-sm text-ink-soft transition-colors hover:text-cashew-deep"
                  >
                    {flavour.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-help">
            <h2 id="footer-help" className="text-sm font-semibold">
              Help
            </h2>
            <ul className="mt-4 space-y-2.5">
              {policyLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-soft transition-colors hover:text-cashew-deep"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-ink-soft transition-colors hover:text-cashew-deep"
                >
                  Contact us
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">Get in touch</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="transition-colors hover:text-cashew-deep"
                >
                  {business.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink('Hi Nuto, I have a question about my order.')}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-cashew-deep"
                >
                  WhatsApp us
                </a>
              </li>
              <li>
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-cashew-deep"
                >
                  @nutoproducts
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-xs text-ink-muted">
          <p>
            {business.legalName} &middot; {business.address.line1}, {business.address.line2},{' '}
            {business.address.city} {business.address.pincode}, {business.address.state}
          </p>
          {/* Displaying the FSSAI licence number is a legal requirement for food sellers in India. */}
          <p className="mt-1">FSSAI Licence No. {business.fssaiLicence}</p>
          <p className="mt-3">
            &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
