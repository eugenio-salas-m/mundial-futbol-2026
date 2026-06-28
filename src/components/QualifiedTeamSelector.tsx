"use client";

type Props = {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  selectedTeamId: string | null;
  disabled?: boolean;
  onChange: (teamId: string) => void;
};

export default function QualifiedTeamSelector({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  selectedTeamId,
  disabled = false,
  onChange,
}: Props) {
  return (
    <div className="mt-2 flex overflow-hidden rounded-lg border border-gray-300">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(homeTeamId)}
        className={[
          "flex-1 px-3 py-2 text-sm font-medium transition-colors",
          disabled
            ? "cursor-default"
            : "hover:bg-blue-50",
          selectedTeamId === homeTeamId
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700",
        ].join(" ")}
      >
        ✓ {homeTeamName}
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(awayTeamId)}
        className={[
          "border-l border-gray-300",
          "flex-1 px-3 py-2 text-sm font-medium transition-colors",
          disabled
            ? "cursor-default"
            : "hover:bg-blue-50",
          selectedTeamId === awayTeamId
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700",
        ].join(" ")}
      >
        ✓ {awayTeamName}
      </button>
    </div>
  );
}