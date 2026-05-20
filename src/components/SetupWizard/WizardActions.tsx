import type { Step } from "./types";

type WizardActionsProps = {
  step: Step;
  canAdvance: boolean;
  busy: boolean;
  onBack: () => void;
  onNext: () => void;
  onImport: () => void;
  onSkipImport: () => void;
};

export function WizardActions({
  step,
  canAdvance,
  busy,
  onBack,
  onNext,
  onImport,
  onSkipImport,
}: WizardActionsProps) {
  if (step === 3) {
    return (
      <div className="mt-auto flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkipImport}
          disabled={busy}
          className="h-9 px-3 text-xs text-fg-muted transition-colors hover:text-fg disabled:opacity-50"
        >
          Ignorer
        </button>
        <button
          type="button"
          onClick={onImport}
          disabled={!canAdvance || busy}
          className="h-9 bg-accent px-4 text-sm font-medium text-black transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          {busy ? "..." : "Importer"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-auto flex items-center justify-between gap-2">
      {step === 2 ? (
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="h-9 px-3 text-sm text-fg-muted transition-colors hover:text-fg disabled:opacity-50"
        >
          ← Retour
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!canAdvance || busy}
        className="h-9 bg-accent px-4 text-sm font-medium text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "..." : step === 1 ? "Suivant →" : "Continuer"}
      </button>
    </div>
  );
}
