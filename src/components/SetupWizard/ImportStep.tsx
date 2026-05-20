type ImportStepProps = {
  importName: string;
  onImportNameChange: (value: string) => void;
  busy: boolean;
};

export function ImportStep({ importName, onImportNameChange, busy }: ImportStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">
        Pack actuel <span className="text-accent">detecte</span>.
      </p>
      <p className="text-xs text-fg-muted">
        Choisis un nom pour le sauvegarder.
      </p>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-fg-muted">Nom du pack</label>
        <input
          type="text"
          value={importName}
          disabled={busy}
          onChange={(e) => onImportNameChange(e.target.value)}
          className="h-9 bg-surface px-3 text-sm outline-none transition-colors focus:bg-surface-elevated disabled:opacity-50"
        />
      </div>
    </div>
  );
}
