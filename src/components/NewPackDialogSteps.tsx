import { useEffect, useRef } from "react";

export function DialogHeader({ step, total }: { step: number; total: number }) {
  const segments = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">
        Nouveau pack <span className="text-fg-muted">({step}/{total})</span>
      </h3>
      <div className="flex gap-1">
        {segments.map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 ${step >= n ? "bg-accent" : "bg-surface-elevated"}`}
          />
        ))}
      </div>
    </div>
  );
}

type NameStepProps = {
  name: string;
  onNameChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  error: string | null;
};

export function NameStep({ name, onNameChange, onSubmit, onCancel, error }: NameStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-3"
    >
      <label className="text-xs text-fg-muted">Nom du pack</label>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="ex: cinematic"
        className="h-9 bg-base px-3 text-sm outline-none transition-colors focus:bg-surface-elevated"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3 text-xs text-fg-muted transition-colors hover:text-fg"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="h-8 bg-accent px-3 text-xs font-medium text-black transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </form>
  );
}

type EnbChoiceStepProps = {
  busy: boolean;
  error: string | null;
  onChoose: (withEnb: boolean) => void;
};

export function EnbChoiceStep({ busy, error, onChoose }: EnbChoiceStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Ce pack utilise-t-il un ENB ?</p>
      <p className="text-xs text-fg-muted">
        L'ENB ajoute des effets graphiques supplementaires a cote de GTA5.exe.
      </p>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onChoose(false)}
          className="h-9 flex-1 bg-base text-sm transition-colors hover:bg-surface-elevated disabled:opacity-50"
        >
          {busy ? "..." : "Non"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onChoose(true)}
          className="h-9 flex-1 bg-accent text-sm font-medium text-black transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          {busy ? "..." : "Oui"}
        </button>
      </div>
    </div>
  );
}

type FolderStepProps = {
  title: string;
  instruction: string;
  buttonLabel: string;
  onOpenFolder: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
  nextLabel: string;
};

export function FolderStep({
  title,
  instruction,
  buttonLabel,
  onOpenFolder,
  onNext,
  nextLabel,
}: FolderStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-fg-muted">{instruction}</p>
      <button
        type="button"
        onClick={onOpenFolder}
        className="h-9 bg-base px-3 text-sm transition-colors hover:bg-surface-elevated hover:text-accent"
      >
        {buttonLabel}
      </button>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="h-8 bg-accent px-3 text-xs font-medium text-black transition-colors hover:bg-accent-hover"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

export function validateName(name: string): string | null {
  if (!name) return "Le nom est obligatoire";
  if (/[\\/:*?"<>|]/.test(name)) {
    return "Caracteres interdits : \\ / : * ? \" < > |";
  }
  if (name.length > 64) return "Nom trop long (max 64 caracteres)";
  return null;
}
