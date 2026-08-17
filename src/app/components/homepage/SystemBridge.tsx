import Link from "next/link";
import styles from "./SystemBridge.module.css";

const layers = [
  {
    number: "01",
    title: "Gebeurtenis",
    text: "Wat is er gebeurd en welke feiten zijn aantoonbaar?",
    href: "/artikelen",
  },
  {
    number: "02",
    title: "Perspectieven",
    text: "Wie ervaart de gevolgen, en welke informatie wordt vanuit iedere positie zichtbaar?",
    href: "/systeem/perspectieven-en-journalistiek",
  },
  {
    number: "03",
    title: "Structuren",
    text: "Welke relaties, oorzaken en mechanismen verbinden losse gebeurtenissen?",
    href: "/systeem/kennisgraaf",
  },
  {
    number: "04",
    title: "Bronnen",
    text: "Waar komt de informatie vandaan, wat weten we en waar blijft onzekerheid bestaan?",
    href: "/systeem/informatie-en-betekenis",
  },
];

export default function SystemBridge() {
  return (
    <section id="ontdek" className={styles.section}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Hoe Meridian kijkt</p>
        <h2>Een gebeurtenis is nooit één pagina.</h2>
        <p className={styles.description}>
          Meridian verbindt wat er gebeurt met de mensen die het ervaren,
          de structuren eronder en de bronnen waarop het beeld rust. Zo kun je
          vanuit actualiteit steeds dieper het systeem in bewegen.
        </p>
      </div>

      <div className={styles.flow} aria-label="De informatielagen van Meridian">
        {layers.map((layer, index) => (
          <Link href={layer.href} className={styles.layer} key={layer.title}>
            <div className={styles.layerTop}>
              <span>{layer.number}</span>
              <span aria-hidden="true">→</span>
            </div>
            <h3>{layer.title}</h3>
            <p>{layer.text}</p>
            {index < layers.length - 1 && (
              <span className={styles.connector} aria-hidden="true" />
            )}
          </Link>
        ))}
      </div>

      <div className={styles.footer}>
        <p>
          Je hoeft het systeem niet eerst te begrijpen om Meridian te gebruiken.
          Iedere route kan beginnen bij een artikel en eindigen bij de
          onderliggende theorie — of andersom.
        </p>
        <Link href="/systeem">Bekijk het volledige systeem →</Link>
      </div>
    </section>
  );
}
