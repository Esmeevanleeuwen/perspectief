import Link from "next/link";
export default function NotFound() {
  return (
    <div className="member-empty">
      <h1>Deze publicatie is niet beschikbaar.</h1>
      <p>
        De tekst is verwijderd, staat nog in concept of is niet met jouw account
        gedeeld.
      </p>
      <Link href="/account/bibliotheek">Terug naar mijn bibliotheek →</Link>
    </div>
  );
}
