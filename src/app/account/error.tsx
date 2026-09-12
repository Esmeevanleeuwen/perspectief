"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="member-empty">
      <h1>Even geen verbinding.</h1>
      <p>We konden deze pagina niet laden.</p>
      <button className="member-button" onClick={reset}>
        Opnieuw proberen
      </button>
    </div>
  );
}
