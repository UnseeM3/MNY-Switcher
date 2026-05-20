import { useState } from "react";
import { useConfigStore } from "../stores/config";
import { usePacksStore } from "../stores/packs";
import { useNotificationStore } from "../stores/notification";
import { api } from "../api/tauri";
import {
  DialogHeader,
  EnbChoiceStep,
  FolderStep,
  NameStep,
  validateName,
} from "./NewPackDialogSteps";

type NewPackDialogProps = {
  onClose: () => void;
};

type Layout = { enb: number; mods: number; plugins: number };

export function NewPackDialog({ onClose }: NewPackDialogProps) {
  const { gameDir, packsDir } = useConfigStore();
  const { refresh } = usePacksStore();
  const notify = useNotificationStore((state) => state.show);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [createdName, setCreatedName] = useState("");
  const [withEnb, setWithEnb] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const totalSteps = withEnb === true ? 5 : 4;
  const layout = buildLayout(withEnb === true);

  async function tryOpenFolder(sub: "enb" | "mods" | "plugins") {
    const path = `${packsDir}\\${createdName}\\${sub}`;
    try {
      await api.openFolder(path);
    } catch (err) {
      notify(`Impossible d'ouvrir ${path} : ${err}`, 6000);
    }
  }

  function confirmName() {
    const trimmed = name.trim();
    const validation = validateName(trimmed);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setStep(2);
  }

  async function confirmEnbChoice(enb: boolean) {
    setBusy(true);
    setError(null);
    try {
      const trimmed = name.trim();
      await api.createPack(packsDir, trimmed, enb);
      setCreatedName(trimmed);
      setWithEnb(enb);
      setStep(3);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    await refresh(gameDir, packsDir);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
      onClick={step === 1 ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-80 flex-col gap-3 bg-surface p-4 shadow-xl"
      >
        <DialogHeader step={step} total={totalSteps} />
        {step === 1 && (
          <NameStep
            name={name}
            onNameChange={setName}
            onSubmit={confirmName}
            error={error}
            onCancel={onClose}
          />
        )}
        {step === 2 && (
          <EnbChoiceStep busy={busy} error={error} onChoose={confirmEnbChoice} />
        )}
        {step === layout.enb && (
          <FolderStep
            title={`Pack "${createdName}" cree !`}
            instruction="Place tes fichiers ENB (DLL, .ini, dossiers) ici."
            buttonLabel="Ouvrir le dossier enb"
            onOpenFolder={() => tryOpenFolder("enb")}
            onNext={() => setStep(layout.mods)}
            nextLabel="Suivant →"
          />
        )}
        {step === layout.mods && (
          <FolderStep
            title={withEnb ? "Dossier mods" : `Pack "${createdName}" cree !`}
            instruction="Place tes fichiers mods dans le dossier ci-dessous."
            buttonLabel="Ouvrir le dossier mods"
            onOpenFolder={() => tryOpenFolder("mods")}
            onNext={() => setStep(layout.plugins)}
            nextLabel="Suivant →"
          />
        )}
        {step === layout.plugins && (
          <FolderStep
            title="Derniere etape"
            instruction="Place tes fichiers plugins dans le dossier ci-dessous."
            buttonLabel="Ouvrir le dossier plugins"
            onOpenFolder={() => tryOpenFolder("plugins")}
            onNext={finish}
            nextLabel="Terminer"
          />
        )}
      </div>
    </div>
  );
}

function buildLayout(withEnb: boolean): Layout {
  if (withEnb) return { enb: 3, mods: 4, plugins: 5 };
  return { enb: -1, mods: 3, plugins: 4 };
}
