import type { Step } from "./types";

type SetupWizardHeaderProps = {
  step: Step;
};

export function SetupWizardHeader({ step }: SetupWizardHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold tracking-tight">Bienvenue</h2>
      <p className="text-xs text-fg-muted">Configuration rapide. Etape {step} sur 3 max.</p>
      <div className="mt-1 flex gap-1">
        <div className="h-1 flex-1 bg-accent" />
        <div className={`h-1 flex-1 ${step >= 2 ? "bg-accent" : "bg-surface-elevated"}`} />
        <div className={`h-1 flex-1 ${step >= 3 ? "bg-accent" : "bg-surface-elevated"}`} />
      </div>
    </header>
  );
}
