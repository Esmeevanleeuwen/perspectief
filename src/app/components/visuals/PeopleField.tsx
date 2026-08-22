import type { CSSProperties } from "react";

import styles from "./PeopleField.module.css";

export type PeopleFieldPerson = {
  left: number;
  top: number;
  scale?: number;
  opacity?: number;
  shadowAngle?: number;
  shadowLength?: number;
};

type PeopleFieldProps = {
  className?: string;
  people?: PeopleFieldPerson[];
  showConnections?: boolean;
};

export const defaultPeopleField: PeopleFieldPerson[] = [
  { left: 4, top: 76, scale: 0.62, opacity: 0.52, shadowAngle: 20, shadowLength: 40 },
  { left: 12, top: 68, scale: 0.68, opacity: 0.72, shadowAngle: 20, shadowLength: 42 },
  { left: 20, top: 56, scale: 0.7, opacity: 0.66, shadowAngle: 22, shadowLength: 44 },
  { left: 30, top: 44, scale: 0.72, opacity: 0.62, shadowAngle: 22, shadowLength: 46 },
  { left: 40, top: 34, scale: 0.68, opacity: 0.58, shadowAngle: 22, shadowLength: 46 },
  { left: 50, top: 58, scale: 0.82, opacity: 0.8, shadowAngle: 23, shadowLength: 50 },
  { left: 60, top: 30, scale: 0.72, opacity: 0.64, shadowAngle: 22, shadowLength: 48 },
  { left: 69, top: 49, scale: 0.78, opacity: 0.74, shadowAngle: 23, shadowLength: 52 },
  { left: 78, top: 22, scale: 0.67, opacity: 0.6, shadowAngle: 21, shadowLength: 46 },
  { left: 86, top: 42, scale: 0.76, opacity: 0.71, shadowAngle: 22, shadowLength: 50 },
  { left: 94, top: 18, scale: 0.64, opacity: 0.57, shadowAngle: 20, shadowLength: 44 },

  { left: 45, top: 78, scale: 0.86, opacity: 0.82, shadowAngle: 24, shadowLength: 54 },
  { left: 63, top: 74, scale: 0.9, opacity: 0.86, shadowAngle: 24, shadowLength: 58 },
  { left: 80, top: 79, scale: 0.94, opacity: 0.88, shadowAngle: 25, shadowLength: 60 },
  { left: 98, top: 73, scale: 0.78, opacity: 0.74, shadowAngle: 23, shadowLength: 52 },
];

export default function PeopleField({
  className = "",
  people = defaultPeopleField,
  showConnections = true,
}: PeopleFieldProps) {
  return (
    <div className={`${styles.field} ${className}`} aria-hidden="true">
      {showConnections && (
        <svg
          className={styles.connections}
          viewBox="0 0 1000 260"
          preserveAspectRatio="none"
        >
          <path d="M40 205 C180 158 267 191 365 142 C468 90 555 126 655 84 C749 43 836 70 973 32" />
          <path d="M158 242 C273 211 357 229 451 185 C538 145 620 171 710 132 C798 93 864 104 986 73" />
          <path
            className={styles.warmConnection}
            d="M103 210 C212 244 313 216 386 170 C453 129 518 143 590 171 C658 197 732 184 814 136"
          />
        </svg>
      )}

      {people.map((person, index) => {
        const style = {
          left: `${person.left}%`,
          top: `${person.top}%`,
          opacity: person.opacity ?? 1,
          "--person-scale": person.scale ?? 1,
          "--shadow-angle": `${person.shadowAngle ?? 22}deg`,
          "--shadow-length": `${person.shadowLength ?? 50}px`,
        } as CSSProperties;

        return (
          <span
            className={styles.person}
            style={style}
            key={`${person.left}-${person.top}-${index}`}
          >
            <span className={styles.shadow} />
            <span className={styles.head} />
            <span className={styles.torso} />
            <span className={styles.leftArm} />
            <span className={styles.rightArm} />
            <span className={styles.leftLeg} />
            <span className={styles.rightLeg} />
          </span>
        );
      })}

      <span className={`${styles.node} ${styles.nodeOne}`} />
      <span className={`${styles.node} ${styles.nodeTwo}`} />
      <span className={`${styles.node} ${styles.nodeThree}`} />
      <span className={`${styles.node} ${styles.nodeFour}`} />
    </div>
  );
}
