import Image from "next/image";
import Link from "next/link";
import MeridianMark from "@/components/brand/MeridianMark";
import "@/app/member.css";
import "./auth.css";

export const metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-screen">
      <a className="member-skip" href="#auth-content">
        Naar het formulier
      </a>

      <section className="auth-visual-panel" aria-label="Meridian">
        <Image
          src="/artikelsad.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 100vw, 53vw"
          className="auth-visual-image"
        />
        <div className="auth-visual-shade" aria-hidden="true" />

        <Link
          className="auth-visual-brand"
          href="/"
          aria-label="Meridian homepage"
        >
          <MeridianMark className="auth-visual-mark" />
          <span>MERIDIAN</span>
        </Link>

        <div className="auth-visual-copy">
          <p>Alles hangt samen.</p>
          <h2>Bewaar wat je ontdekt. Ga verder waar je gebleven bent.</h2>
          <span>
            Je account is jouw rustige plek binnen Meridian om publicaties te
            bewaren en later verder te lezen.
          </span>
        </div>
      </section>

      <section className="auth-form-panel" id="auth-content" tabIndex={-1}>
        <header className="auth-panel-header">
          <Link href="/" className="auth-back-link">
            Terug naar de site
          </Link>
        </header>

        <div className="auth-form-shell">
          {children}
          <p className="auth-privacy">
            Je profiel is standaard privé. Een pseudoniem gebruiken mag.
          </p>
        </div>

        <footer className="auth-footer">
          <Link href="/">← Terug naar Meridian</Link>
        </footer>
      </section>
    </main>
  );
}
