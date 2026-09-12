import Link from "next/link";
import WorkspaceShell from "@/components/account/WorkspaceShell";
import WorkspaceIcon from "@/components/account/WorkspaceIcon";
import "@/app/member.css";
export const metadata = { robots: { index: false, follow: false } };
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      mode="welcome"
      items={[
        { href: "/artikelen", label: "Artikelen", icon: "library" },
        { href: "/themas", label: "Thema’s", icon: "overview" },
        { href: "/onderzoek", label: "Onderzoeken", icon: "research" },
        { href: "/systeem", label: "Systeemkaart", icon: "globe" },
      ]}
    >
      <div className="auth-workspace">
        <div className="auth-main">{children}</div>
        <aside
          className="workspace-context auth-context"
          aria-label="Over je account"
        >
          <p className="member-eyebrow">Met een gratis account</p>
          <h2>Meer te ontdekken.</h2>
          <div className="workspace-feature">
            <span className="workspace-feature-icon violet">
              <WorkspaceIcon name="library" />
            </span>
            <div>
              <h3>Je eigen bibliotheek</h3>
              <p>Extra artikelen en teksten, overzichtelijk bij elkaar.</p>
            </div>
          </div>
          <div className="workspace-feature">
            <span className="workspace-feature-icon orange">
              <WorkspaceIcon name="write" />
            </span>
            <div>
              <h3>Persoonlijk gedeeld</h3>
              <p>Lees wat de redactie speciaal voor jou klaarzet.</p>
            </div>
          </div>
          <div className="workspace-feature">
            <span className="workspace-feature-icon teal">
              <WorkspaceIcon name="bookmark" />
            </span>
            <div>
              <h3>Bewaren voor later</h3>
              <p>Ga snel terug naar publicaties die je wilt onthouden.</p>
            </div>
          </div>
          <div className="workspace-context-note">
            <WorkspaceIcon name="lock" />
            <div>
              <strong>Jij bepaalt wat je deelt</strong>
              <p>
                Je profiel is standaard privé. Een pseudoniem gebruiken mag.
              </p>
            </div>
          </div>
          <Link href="/artikelen" className="workspace-context-link">
            Eerst rondkijken
            <WorkspaceIcon name="arrow" />
          </Link>
        </aside>
      </div>
    </WorkspaceShell>
  );
}
