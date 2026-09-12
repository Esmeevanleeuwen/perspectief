export type WorkspaceIconName =
  | "overview"
  | "library"
  | "bookmark"
  | "profile"
  | "research"
  | "users"
  | "write"
  | "globe"
  | "panel"
  | "arrow"
  | "lock";
const paths: Record<WorkspaceIconName, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  library: (
    <>
      <path d="M5 4h4v16H5zM12 4h3v16h-3zM18 5l3 14" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4-6 4z" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0116 0v2" />
    </>
  ),
  research: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="M14.5 14.5L21 21M7 10h6M10 7v6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 21v-2a7 7 0 0114 0v2M16 5a3 3 0 010 6M19 15a5 5 0 013 4v2" />
    </>
  ),
  write: (
    <>
      <path d="M15 5l4 4M4 20l5-1L21 7l-4-4L5 15zM13 21h8" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  panel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5l5 5-5 5" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3M12 14v3" />
    </>
  ),
};
export default function WorkspaceIcon({ name }: { name: WorkspaceIconName }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
