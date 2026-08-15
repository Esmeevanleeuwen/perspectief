// app/components/layout/Navigation.tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <header className="header">
      <Link href="/" className="brand">
        {/* Je logo SVG of image_5f4680.jpg kan hier */}
        <span className="brandName">PERSPECTIEF</span>
      </Link>

      <nav className="navigation">
        <Link href="/atlas">De Atlas</Link>
        <Link href="/theorie">Theorie & Evolutie</Link>
        <Link href="/documentatie">Data Documentatie</Link>
      </nav>

      <div className="actions">
        <button className="search">Zoeken</button>
        <Link href="/login" className="login">Log in</Link>
        <button className="menuButton">
          <span></span><span></span>
        </button>
      </div>
    </header>
  );
}