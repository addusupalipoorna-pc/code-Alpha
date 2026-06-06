import LogoSrc from '../assets/logo.svg';

const links = [
  { label: 'Translate', href: '#translator' },
  { label: 'Features', href: '#features' },
  { label: 'Sign in', href: '#/signin' },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#" className="site-brand" aria-label="Code Alpha home">
          <img src={LogoSrc} alt="" className="site-logo" />
          <span className="site-brand-text">
            <span className="site-brand-name">Code Alpha</span>
            <span className="site-brand-tag">AI Translator</span>
          </span>
        </a>
        <nav className="site-nav" aria-label="Main">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="site-nav-link">
              {link.label}
            </a>
          ))}
          <a href="#/signup" className="site-nav-cta btn btn-primary">
            Get started
          </a>
        </nav>
      </div>
    </header>
  );
}
