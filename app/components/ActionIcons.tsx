interface ActionIconProps {
  readonly className?: string;
}

export function BundleIcon({ className }: ActionIconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M4 11h16M12 6v14M9 3h6v4H9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function UnbundleIcon({ className }: ActionIconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 9h14v11H5zM5 9l3-5h8l3 5M12 9v11" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m8 4 4 5 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function UndoIcon({ className }: ActionIconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M9 8H5V4M5.5 8a8 8 0 1 1-1 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
