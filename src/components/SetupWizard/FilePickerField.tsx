type FilePickerFieldProps = {
  label: string;
  value: string;
  onPick: () => void | Promise<void>;
  placeholder: string;
  hint?: string;
};

export function FilePickerField({ label, value, onPick, placeholder, hint }: FilePickerFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <button
        type="button"
        onClick={onPick}
        className="h-9 bg-surface px-3 text-sm transition-colors hover:bg-surface-elevated hover:text-accent"
      >
        Parcourir...
      </button>
      <p className="truncate text-xs text-fg-muted" title={value || placeholder}>
        {value || placeholder}
      </p>
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}
