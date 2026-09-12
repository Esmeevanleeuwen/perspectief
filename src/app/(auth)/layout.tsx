import Link from "next/link";
import "@/app/member.css";
export const metadata = { robots: { index: false, follow: false } };
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="member-shell auth-shell">
      <header className="member-header">
        <Link href="/" className="member-brand">
          MERIDIAN<span>Ruimte voor perspectief.</span>
        </Link>
        <Link href="/">← Terug naar de site</Link>
      </header>
      <div className="auth-grid">
        <div className="auth-story">
          <p className="member-eyebrow">Meer ruimte om te lezen</p>
          <h2>
            Een eigen plek.
            <br />
            Een breder perspectief.
          </h2>
          <p>
            Met een gratis account vind je extra artikelen, teksten van de
            redactie en publicaties die persoonlijk met jou worden gedeeld.
          </p>
          <div className="auth-benefits">
            <span>
              01 <strong>Lees verder</strong>
            </span>
            <span>
              02 <strong>Bewaar voor later</strong>
            </span>
            <span>
              03 <strong>Houd zelf de regie</strong>
            </span>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
