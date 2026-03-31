interface HistoryButtonProps {
  onClick: () => void;
  itemCount: number;
}

export function HistoryButton({ onClick, itemCount }: HistoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2.5 bg-tokyo-bg-primary/50 hover:bg-tokyo-bg-primary text-tokyo-text-muted hover:text-tokyo-accent-blue border border-tokyo-border hover:border-tokyo-accent-blue/30 rounded-xl transition-all"
      title="Transcription History"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-tokyo-accent-blue text-tokyo-bg-primary text-[10px] font-bold rounded-full px-1">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
