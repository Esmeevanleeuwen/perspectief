"use client";

import { useEffect, useRef } from "react";
import styles from "./ParticleHero.module.css";

type Particle = {
  startX: number;
  startY: number;

  targetX: number;
  targetY: number;

  size: number;
  alpha: number;
  color: string;

  delay: number;
  phase: number;
};

const PARTICLE_COUNT = 1050;

/*
  Duur van de intro:

  0 - 1.2 sec    losse stippen
  1.2 - 5.8 sec  stippen bewegen naar Nederland
  daarna         Nederland blijft staan
*/
const HOLD_TIME = 1200;
const MORPH_TIME = 4600;

/*
  Vereenvoudigde vorm van Nederland.

  Dit zijn GEEN scherm-coördinaten.
  Alles zit tussen 0 en 1 zodat de kaart automatisch
  groter/kleiner kan worden op ieder scherm.
*/
const NETHERLANDS_POLYGON: [number, number][] = [
  [0.29, 0.09],
  [0.43, 0.05],
  [0.58, 0.07],
  [0.69, 0.13],
  [0.75, 0.21],
  [0.73, 0.29],
  [0.79, 0.37],
  [0.75, 0.45],
  [0.78, 0.53],
  [0.74, 0.61],
  [0.75, 0.69],
  [0.70, 0.76],
  [0.71, 0.84],

  // Limburg
  [0.67, 0.90],
  [0.65, 1.0],
  [0.59, 0.93],
  [0.57, 0.84],

  // Zuiden
  [0.50, 0.79],
  [0.43, 0.81],
  [0.35, 0.77],
  [0.27, 0.70],

  // Zeeland
  [0.18, 0.72],
  [0.08, 0.65],
  [0.13, 0.60],
  [0.19, 0.56],

  // Westkust
  [0.16, 0.49],
  [0.19, 0.42],
  [0.16, 0.35],
  [0.20, 0.28],
  [0.22, 0.20],
];

function randomGenerator(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pointInsidePolygon(
  x: number,
  y: number,
  polygon: [number, number][]
) {
  let inside = false;

  for (
    let i = 0, j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];

    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function randomPointInNetherlands(random: () => number) {
  /*
    Klein deel van de punten wordt gebruikt voor de
    Waddeneilanden.
  */
  if (random() < 0.045) {
    return {
      x: 0.23 + random() * 0.49,
      y: 0.005 + random() * 0.035,
    };
  }

  let x = 0;
  let y = 0;

  do {
    x = random();
    y = random();
  } while (!pointInsidePolygon(x, y, NETHERLANDS_POLYGON));

  return { x, y };
}

function clamp(number: number, min: number, max: number) {
  return Math.min(Math.max(number, min), max);
}

function smoothstep(value: number) {
  const x = clamp(value, 0, 1);

  return x * x * (3 - 2 * x);
}

function createParticles(): Particle[] {
  /*
    Vaste seed betekent dat de verdeling bij iedere
    reload hetzelfde blijft.
  */
  const random = randomGenerator(83927);

  const colors = [
    "15, 37, 53", // donker marine
    "20, 48, 65",
    "55, 72, 78",
    "165, 91, 49", // warm roest/oranje
    "186, 121, 78",
    "117, 91, 72",
  ];

  return Array.from({ length: PARTICLE_COUNT }, () => {
    /*
      De meeste stippen beginnen rechts.
      Een kleiner gedeelte zweeft richting het midden,
      zoals in jouw ontwerp.
    */
    let startX: number;

    if (random() < 0.22) {
      startX = 0.30 + random() * 0.37;
    } else {
      startX = 0.50 + Math.pow(random(), 0.38) * 0.52;
    }

    const startY =
      0.12 +
      random() * 0.72 +
      Math.sin(startX * 8) * 0.035;

const mapTarget = randomPointInNetherlands(random);

const staysOutside = random() < 0.60;

const target = staysOutside
  ? {
      x: mapTarget.x + (random() - 0.5) * 0.45,
      y: mapTarget.y + (random() - 0.5) * 0.30,
    }
  : mapTarget;

    const important = random() > 0.93;

    return {
      startX,
      startY,

      targetX: target.x,
      targetY: target.y,

 size: important
  ? 1.7 + random() * 2.2
  : 0.4 + random() * 0.95,

      alpha: important
        ? 0.75 + random() * 0.2
        : 0.28 + random() * 0.55,

      color:
        colors[Math.floor(random() * colors.length)],

      delay: random(),
      phase: random() * Math.PI * 2,
    };
  });
}

export default function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;

    if (!canvas || !hero) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const particles = createParticles();

    const random = randomGenerator(9981);

    /*
      Sommige punten krijgen een subtiele verbinding.
      Zo ontstaat aan het begin dat netwerkgevoel.
    */
    const connections: [number, number][] = [];

    for (let i = 0; i < 150; i++) {
      const a = Math.floor(random() * particles.length);

      const jump =
        1 + Math.floor(random() * 22);

      const b =
        (a + jump) % particles.length;

      connections.push([a, b]);
    }

    let width = 0;
    let height = 0;

    let animationFrame = 0;
    let finished = false;

    const startedAt = performance.now();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function resizeCanvas() {
      if (!canvas || !hero || !context) return;

      const rectangle = hero.getBoundingClientRect();

      width = rectangle.width;
      height = rectangle.height;

      /*
        Max 2x pixel density.
        Nog steeds scherp op Retina-schermen zonder
        het canvas onnodig zwaar te maken.
      */
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
      );

      if (finished) {
        draw(performance.now(), 1);
      }
    }

    function getMapBounds() {
      /*
        Desktop:
        Nederland staat rechts.

        Mobiel:
        Nederland komt onder de tekst te staan.
      */
      if (width < 720) {
        return {
          left: width * 0.13,
          top: height * 0.39,
          mapWidth: width * 0.75,
          mapHeight: height * 0.49,
        };
      }

      if (width < 1000) {
        return {
          left: width * 0.48,
          top: height * 0.18,
          mapWidth: width * 0.45,
          mapHeight: height * 0.67,
        };
      }

 return {
  left: width * 0.54,
  top: height * 0.11,
  mapWidth: width * 0.42,
  mapHeight: height * 0.72,
};
    }

    function getParticlePosition(
      particle: Particle,
      now: number,
      forceProgress?: number
    ) {
      const bounds = getMapBounds();

      /*
        Beginpositie gebruikt volledige canvasruimte.
      */
      const sourceX =
        particle.startX * width;

      const sourceY =
        particle.startY * height;

      /*
        Eindpositie gebruikt de responsive kaartzone.
      */
      const destinationX =
        bounds.left +
        particle.targetX * bounds.mapWidth;

      const destinationY =
        bounds.top +
        particle.targetY * bounds.mapHeight;

      let progress: number;

      if (forceProgress !== undefined) {
        progress = forceProgress;
      } else if (reducedMotion) {
        progress = 1;
      } else {
        const elapsed =
          now -
          startedAt -
          HOLD_TIME -
          particle.delay * 700;

        progress = smoothstep(
          elapsed / MORPH_TIME
        );
      }

      /*
        Voor de transformatie bewegen de punten heel
        licht alsof het netwerk leeft.
      */
      const floatingAmount =
        (1 - progress) * 5;

      const time = now / 1500;

      const floatX =
        Math.sin(time + particle.phase) *
        floatingAmount;

      const floatY =
        Math.cos(
          time * 0.8 + particle.phase
        ) *
        floatingAmount *
        0.7;

      return {
        x:
          sourceX +
          (destinationX - sourceX) * progress +
          floatX,

        y:
          sourceY +
          (destinationY - sourceY) * progress +
          floatY,

        progress,
      };
    }

    function draw(
      now: number,
      forceProgress?: number
    ) {
      if (!context) return;

      context.clearRect(
        0,
        0,
        width,
        height
      );

      const positions = particles.map(
        (particle) =>
          getParticlePosition(
            particle,
            now,
            forceProgress
          )
      );

      /*
        Verbindingslijnen.
      */
      for (const [a, b] of connections) {
        const first = positions[a];
        const second = positions[b];

        const distance = Math.hypot(
          second.x - first.x,
          second.y - first.y
        );

        if (distance > 105) continue;

        const averageProgress =
          (first.progress +
            second.progress) /
          2;

        /*
          Lijnen worden tijdens Nederland iets
          subtieler zodat vooral de punten zichtbaar zijn.
        */
        const opacity =
          0.075 -
          averageProgress * 0.035;

        context.beginPath();

        context.moveTo(
          first.x,
          first.y
        );

        context.lineTo(
          second.x,
          second.y
        );

        context.strokeStyle =
          `rgba(42, 61, 69, ${opacity})`;

        context.lineWidth = 0.55;

        context.stroke();
      }

      /*
        Deeltjes.
      */
      particles.forEach(
        (particle, index) => {
          const position =
            positions[index];

          context.beginPath();

          context.arc(
            position.x,
            position.y,
            particle.size,
            0,
            Math.PI * 2
          );

          context.fillStyle =
            `rgba(${particle.color}, ${particle.alpha})`;

          context.fill();
        }
      );
    }

    function animate(now: number) {
      draw(now);

      const animationLength =
        HOLD_TIME +
        MORPH_TIME +
        1200;

      if (
        reducedMotion ||
        now - startedAt >
          animationLength
      ) {
        finished = true;

        draw(now, 1);

        return;
      }

      animationFrame =
        requestAnimationFrame(animate);
    }

    resizeCanvas();

    const observer = new ResizeObserver(
      resizeCanvas
    );

    observer.observe(hero);

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={styles.hero}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-hidden="true"
      />

      <header className={styles.header}>
        <a
          href="/"
          className={styles.brand}
        >
          <span
            className={styles.brandMark}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>

          <span>perspectief</span>
        </a>

        <nav
          className={styles.navigation}
          aria-label="Hoofdnavigatie"
        >
          <a href="/onderwerpen">
            Onderwerpen
          </a>

          <a href="/artikelen">
            Artikelen
          </a>

          <a href="/perspectieven">
            Perspectieven
          </a>

          <a href="/methode">
            Onze methode
          </a>
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.search}
            aria-label="Zoeken"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />

              <path
                d="M16 16L21 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <a
            href="/inloggen"
            className={styles.login}
          >
            Inloggen
          </a>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.copy}>
          <h1>
            Wat als niemand
            <br />
            het volledige
            <br />
            verhaal kent?
          </h1>

          <a
            href="#ontdek"
            className={styles.discover}
          >
            <span>Ontdek meer</span>
            <span aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>

      <div
        className={styles.scrollIndicator}
        aria-hidden="true"
      >
        <span />
      </div>
    </section>
  );
}