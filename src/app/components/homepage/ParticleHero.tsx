"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./ParticleHero.module.css";

type Point = {
  x: number;
  y: number;
};

type MaskData = {
  points: Point[];
  aspectRatio: number;
};

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
  idleStrength: number;
  isMapParticle: boolean;
};

type ParticlePosition = {
  x: number;
  y: number;
  progress: number;
};

const PARTICLE_COUNT = 1200;
const MAP_PARTICLE_SHARE = 0.84;

const HOLD_TIME = 500;
const MORPH_TIME = 6800;
const MAX_PARTICLE_DELAY = 850;

const COLORS = [
  "14,38,55",
  "23,51,67",
  "54,74,82",
  "82,94,96",
  "154,104,72",
  "184,113,69",
  "201,142,101",
];

function createConnectionsFromPoints(
  points: Point[],
  maxDistance: number,
  triesPerPoint = 10
) {
  const connections: [number, number][] = [];
  const random = seededRandom(45291);

  for (let i = 0; i < points.length; i++) {
    if (random() > 0.42) continue;

    let bestIndex = -1;
    let bestDistance = Infinity;

    for (let t = 0; t < triesPerPoint; t++) {
      const j = Math.floor(random() * points.length);
      if (i === j) continue;

      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      const distance = Math.hypot(dx, dy);

      if (distance < bestDistance && distance < maxDistance) {
        bestDistance = distance;
        bestIndex = j;
      }
    }

    if (bestIndex >= 0) {
      connections.push([i, bestIndex]);
    }
  }

  return connections;
}

function seededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value: number) {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("SVG-afbeelding kon niet worden verwerkt."));

    image.src = source;
  });
}

/**
 * Laadt public/nl.svg, pakt alleen #features (de provincievormen)
 * en zet die om naar een verzameling punten binnen Nederland.
 */
async function loadNetherlandsMask(amount: number): Promise<MaskData> {
  const response = await fetch("/nl.svg", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      "Kon /nl.svg niet laden. Controleer of het bestand in public/nl.svg staat."
    );
  }

  const svgText = await response.text();
  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgText, "image/svg+xml");

  const originalSvg = svgDocument.querySelector("svg");
  const features = svgDocument.querySelector("#features");

  if (!originalSvg || !features) {
    throw new Error("nl.svg bevat geen geldige <svg> of #features-groep.");
  }

  const viewBox =
    originalSvg.getAttribute("viewBox") ??
    originalSvg.getAttribute("viewbox") ??
    "0 0 1000 1000";

  const cleanedSvg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${viewBox}"
      width="1000"
      height="1000"
    >
      <g fill="#000" stroke="#000" stroke-width="1">
        ${features.innerHTML}
      </g>
    </svg>
  `;

  const blob = new Blob([cleanedSvg], { type: "image/svg+xml" });
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await loadImage(objectUrl);

    const maskSize = 900;

    // Belangrijk: dit is een echte HTMLCanvasElement.
    const maskCanvas = window.document.createElement("canvas");
    maskCanvas.width = maskSize;
    maskCanvas.height = maskSize;

    const maskContext = maskCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!maskContext) {
      throw new Error("Kon het masker-canvas niet initialiseren.");
    }

    maskContext.clearRect(0, 0, maskSize, maskSize);
    maskContext.drawImage(image, 0, 0, maskSize, maskSize);

    const pixels = maskContext.getImageData(
      0,
      0,
      maskSize,
      maskSize
    ).data;

    let minX = maskSize;
    let minY = maskSize;
    let maxX = 0;
    let maxY = 0;

    const rawPoints: Point[] = [];

    for (let y = 0; y < maskSize; y += 2) {
      for (let x = 0; x < maskSize; x += 2) {
        const index = (y * maskSize + x) * 4;
        const alpha = pixels[index + 3];

        if (alpha > 70) {
          rawPoints.push({ x, y });

          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (rawPoints.length === 0) {
      throw new Error("Er werden geen Nederland-pixels in nl.svg gevonden.");
    }

    const mapWidth = Math.max(1, maxX - minX);
    const mapHeight = Math.max(1, maxY - minY);
    const aspectRatio = mapWidth / mapHeight;

    const random = seededRandom(719382);
    const points: Point[] = [];

    for (let i = 0; i < amount; i++) {
      const source =
        rawPoints[Math.floor(random() * rawPoints.length)];

      const jitterX = (random() - 0.5) * 1.8;
      const jitterY = (random() - 0.5) * 1.8;

      points.push({
        x: (source.x - minX + jitterX) / mapWidth,
        y: (source.y - minY + jitterY) / mapHeight,
      });
    }

    return { points, aspectRatio };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function createOutsideTarget(random: () => number): Point {
  const side = Math.floor(random() * 4);

  if (side === 0) {
    return {
      x: -0.32 + random() * 0.34,
      y: 0.03 + random() * 0.94,
    };
  }

  if (side === 1) {
    return {
      x: 0.98 + random() * 0.33,
      y: 0.03 + random() * 0.94,
    };
  }

  if (side === 2) {
    return {
      x: 0.04 + random() * 0.92,
      y: -0.18 + random() * 0.2,
    };
  }

  return {
    x: 0.04 + random() * 0.92,
    y: 0.98 + random() * 0.22,
  };
}
function createIntroCloudPoint(random: () => number): Point {
  const centerX = 0.74;
  const centerY = 0.44;

  const radiusX = 0.29;
  const radiusY = 0.30;

  const angle = random() * Math.PI * 2;

  // meer punten in het midden, minder aan de buitenkant
  const distance = Math.pow(random(), 1.8);

  const wobble = 0.018 * Math.sin(angle * 3 + random() * 2);

  return {
    x: centerX + Math.cos(angle) * (radiusX * distance + wobble),
    y: centerY + Math.sin(angle) * (radiusY * distance + wobble),
  };
}
function createParticles(mapPoints: Point[]): Particle[] {
  const random = seededRandom(83927);
  let mapIndex = 0;

  return Array.from({ length: PARTICLE_COUNT }, () => {

    
const introPoint = createIntroCloudPoint(random);

const startX = introPoint.x;
const startY = introPoint.y;



    const isMapParticle = random() < MAP_PARTICLE_SHARE;

    const target = isMapParticle
      ? mapPoints[mapIndex++ % mapPoints.length]
      : createOutsideTarget(random);

    const large = random() > 0.965;
    const medium = !large && random() > 0.88;

    const size = large
      ? 2.2 + random() * 2.4
      : medium
        ? 1.15 + random() * 1.25
        : 0.42 + random() * 0.8;

    return {
      startX,
      startY,
      targetX: target.x,
      targetY: target.y,
      size,
      alpha: large
        ? 0.78 + random() * 0.18
        : 0.28 + random() * 0.52,
      color: COLORS[Math.floor(random() * COLORS.length)],
      delay: random(),
      phase: random() * Math.PI * 2,

idleStrength: 0.8 + random() * 1.2,
      isMapParticle,
    };
  });
}

function createConnections(particles: Particle[]) {
  const connections: [number, number][] = [];
  const random = seededRandom(34910);

  const mapIndices = particles
    .map((particle, index) => ({ particle, index }))
    .filter(({ particle }) => particle.isMapParticle);

  for (const current of mapIndices) {
    if (random() > 0.31) continue;

    let bestIndex = -1;
    let bestDistance = Infinity;

    for (let attempt = 0; attempt < 24; attempt++) {
      const candidate =
        mapIndices[Math.floor(random() * mapIndices.length)];

      if (candidate.index === current.index) continue;

      const dx =
        candidate.particle.targetX - current.particle.targetX;

      const dy =
        candidate.particle.targetY - current.particle.targetY;

      const distance = Math.hypot(dx, dy);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = candidate.index;
      }
    }

    if (bestIndex >= 0 && bestDistance < 0.14) {
      connections.push([current.index, bestIndex]);
    }
  }

  return connections;
}

export default function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvasNode = canvasRef.current;
    const heroNode = heroRef.current;

    if (!canvasNode || !heroNode) return;

    const contextNode = canvasNode.getContext("2d");

    if (!contextNode) return;

    /*
      Deze drie aliases zijn bewust expliciet getypeerd.
      Daardoor blijven ze ook binnen nested functions
      gegarandeerd non-null voor TypeScript.
    */
    const canvas: HTMLCanvasElement = canvasNode;
    const hero: HTMLElement = heroNode;
    const context: CanvasRenderingContext2D = contextNode;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let cancelled = false;
    let startedAt = 0;

    let particles: Particle[] = [];
let introConnections: [number, number][] = [];
let mapConnections: [number, number][] = [];
    let mapAspectRatio = 0.78;

const reducedMotion = false;

    function resizeCanvas() {
      const rectangle = hero.getBoundingClientRect();

      width = rectangle.width;
      height = rectangle.height;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function getMapBounds() {
      if (width < 720) {
        const availableWidth = width * 0.76;
        const maxHeight = height * 0.43;

        let mapWidth = availableWidth;
        let mapHeight = mapWidth / mapAspectRatio;

        if (mapHeight > maxHeight) {
          mapHeight = maxHeight;
          mapWidth = mapHeight * mapAspectRatio;
        }

        return {
          left: (width - mapWidth) / 2,
          top: height * 0.47,
          mapWidth,
          mapHeight,
        };
      }

      if (width < 1050) {
        const availableWidth = width * 0.43;
        const maxHeight = height * 0.69;

        let mapWidth = availableWidth;
        let mapHeight = mapWidth / mapAspectRatio;

        if (mapHeight > maxHeight) {
          mapHeight = maxHeight;
          mapWidth = mapHeight * mapAspectRatio;
        }

        return {
          left: width * 0.54,
          top: (height - mapHeight) / 2 + 16,
          mapWidth,
          mapHeight,
        };
      }

      const availableWidth = width * 0.39;
      const maxHeight = height * 0.76;

      let mapWidth = availableWidth;
      let mapHeight = mapWidth / mapAspectRatio;

      if (mapHeight > maxHeight) {
        mapHeight = maxHeight;
        mapWidth = mapHeight * mapAspectRatio;
      }

      return {
        left: width * 0.57,
        top: (height - mapHeight) / 2 + 8,
        mapWidth,
        mapHeight,
      };
    }

    function getPosition(
      particle: Particle,
      now: number
    ): ParticlePosition {
      const bounds = getMapBounds();

      const sourceX = particle.startX * width;
      const sourceY = particle.startY * height;

      const destinationX =
        bounds.left + particle.targetX * bounds.mapWidth;

      const destinationY =
        bounds.top + particle.targetY * bounds.mapHeight;

      const elapsed =
        now -
        startedAt -
        HOLD_TIME -
        particle.delay * MAX_PARTICLE_DELAY;

      const progress = reducedMotion
        ? 1
        : smoothstep(elapsed / MORPH_TIME);


const idleMovement =
  particle.idleStrength;

const introMovement = 3.5;

// Dit blijft ook bestaan wanneer progress 1 is.
// Daardoor blijven de punten na de morph bewegen.
const floatingAmount =
  particle.idleStrength +
  (1 - progress) * introMovement;

const time = now / 1800;

const floatX =
  Math.sin(
    time + particle.phase
  ) * floatingAmount;

const floatY =
  Math.cos(
    time * 0.73 + particle.phase
  ) *
  floatingAmount *
  0.65;


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

    function draw(now: number) {
      const globalProgress = reducedMotion
  ? 1
  : smoothstep(
      (now - startedAt - HOLD_TIME) /
      (MORPH_TIME + MAX_PARTICLE_DELAY)
    );

const introStrength = 1 - globalProgress;
const mapStrength = globalProgress;
      context.clearRect(0, 0, width, height);

      if (particles.length === 0) return;

      const positions = particles.map((particle) =>
        getPosition(particle, now)
      );

// BEGINNETWERK
for (const [firstIndex, secondIndex] of introConnections) {
  const firstParticle = particles[firstIndex];
  const secondParticle = particles[secondIndex];

  const firstX = firstParticle.startX * width;
  const firstY = firstParticle.startY * height;

  const secondX = secondParticle.startX * width;
  const secondY = secondParticle.startY * height;

  const distance = Math.hypot(secondX - firstX, secondY - firstY);
  if (distance > 120) continue;

  const opacity = 0.02 + introStrength * 0.08;

  context.beginPath();
  context.moveTo(firstX, firstY);
  context.lineTo(secondX, secondY);
  context.strokeStyle = `rgba(42,61,69,${opacity})`;
  context.lineWidth = 0.5;
  context.stroke();
}

// NEDERLAND-NETWERK
for (const [firstIndex, secondIndex] of mapConnections) {
  const first = positions[firstIndex];
  const second = positions[secondIndex];

  const distance = Math.hypot(
    second.x - first.x,
    second.y - first.y
  );

  if (distance > 105) continue;

  const opacity = 0.015 + mapStrength * 0.07;

  context.beginPath();
  context.moveTo(first.x, first.y);
  context.lineTo(second.x, second.y);
  context.strokeStyle = `rgba(42,61,69,${opacity})`;
  context.lineWidth = 0.55;
  context.stroke();
}

      particles.forEach((particle, index) => {
        const position = positions[index];

        const outsideFactor = particle.isMapParticle ? 1 : 0.62;

        const fadeOutside = particle.isMapParticle
          ? 1
          : 1 - position.progress * 0.18;

        const finalAlpha =
          particle.alpha * outsideFactor * fadeOutside;

        context.beginPath();

        context.arc(
          position.x,
          position.y,
          particle.size,
          0,
          Math.PI * 2
        );

        context.fillStyle =
          `rgba(${particle.color},${finalAlpha})`;

        context.fill();
      });
    }

    function animate(now: number) {
      draw(now);

      if (reducedMotion) return;

      animationFrame = requestAnimationFrame(
        animate
      );
    }

    async function start() {
      try {
        const mapCount = Math.ceil(
          PARTICLE_COUNT * MAP_PARTICLE_SHARE
        );

        const mask = await loadNetherlandsMask(mapCount);

        if (cancelled) return;

        mapAspectRatio = mask.aspectRatio;
        particles = createParticles(mask.points);

        const introPoints = particles.map((particle) => ({
  x: particle.startX,
  y: particle.startY,
}));

const mapPointsForConnections = particles.map((particle) => ({
  x: particle.targetX,
  y: particle.targetY,
}));

introConnections = createConnectionsFromPoints(introPoints, 0.09, 14);
mapConnections = createConnectionsFromPoints(mapPointsForConnections, 0.08, 18);

        resizeCanvas();

        startedAt = performance.now();

        if (reducedMotion) {
          draw(startedAt + HOLD_TIME + MORPH_TIME + MAX_PARTICLE_DELAY);
          return;
        }

        animationFrame = requestAnimationFrame(animate);
      } catch (error) {
        console.error("ParticleHero:", error);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();

      if (reducedMotion && particles.length > 0) {
        draw(
          performance.now() +
            HOLD_TIME +
            MORPH_TIME +
            MAX_PARTICLE_DELAY
        );
      }
    });

    resizeObserver.observe(hero);

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-hidden="true"
      />

      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>

          <span>perspectief</span>
        </Link>

        <nav
          className={styles.navigation}
          aria-label="Hoofdnavigatie"
        >
          <Link href="/onderwerpen">Onderwerpen</Link>
          <Link href="/artikelen">Artikelen</Link>
          <Link href="/perspectieven">Perspectieven</Link>
          <Link href="/methode">Onze methode</Link>
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.search}
            aria-label="Zoeken"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="10.8"
                cy="10.8"
                r="6.4"
                stroke="currentColor"
                strokeWidth="1.45"
              />

              <path
                d="M15.6 15.6L21 21"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <Link href="/inloggen" className={styles.login}>
            Inloggen
          </Link>
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

          <Link href="#ontdek" className={styles.discover}>
            <span>Ontdek meer</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className={styles.scrollIndicator} aria-hidden="true">
        <span />
      </div>
    </section>
  );
}