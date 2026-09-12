"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="member-empty">
      <h1>Laden lukte niet.</h1>
      <p>Probeer de publicatie opnieuw te openen.</p>
      <button className="member-button" onClick={reset}>
        Opnieuw proberen
      </button>
    </div>
  );
}
