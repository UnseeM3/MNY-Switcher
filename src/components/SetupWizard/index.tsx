import { useEffect, useState } from "react";
import { dirname } from "@tauri-apps/api/path";
import { useConfigStore } from "../../stores/config";
import { api } from "../../api/tauri";
import type { SetupInfo } from "../../types";
import { DEFAULT_PACK_NAME } from "../../constants";
import type { Step } from "./types";
import { canAdvance, ensureDefaultPack, pickExe, pickPacksDir } from "./helpers";
import { SetupWizardHeader } from "./SetupWizardHeader";
import { FilePickerField } from "./FilePickerField";
import { ImportStep } from "./ImportStep";
import { WizardActions } from "./WizardActions";

export function SetupWizard() {
  const [step, setStep] = useState<Step>(1);
  const [fivemExe, setFivemExe] = useState("");
  const [gta5Exe, setGta5Exe] = useState("");
  const [packsDir, setPacksDir] = useState("");
  const [gameDir, setGameDir] = useState("");
  const [detectedGameDir, setDetectedGameDir] = useState("");
  const [setupInfo, setSetupInfo] = useState<SetupInfo | null>(null);
  const [importName, setImportName] = useState("current");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setConfig, markSetupComplete } = useConfigStore();

  useEffect(() => {
    if (!fivemExe) {
      setDetectedGameDir("");
      setSetupInfo(null);
      return;
    }
    api
      .detectGameDir(fivemExe)
      .then(async (detected) => {
        setDetectedGameDir(detected);
        const info = await api.checkSetup(detected);
        setSetupInfo(info);
      })
      .catch(() => {
        setDetectedGameDir("");
        setSetupInfo(null);
      });
  }, [fivemExe]);

  async function finalize(activeDir: string) {
    const parentDir = await dirname(fivemExe);
    if (parentDir !== activeDir) {
      await api.cleanupJunctions(parentDir);
    }
    const gta5Dir = await dirname(gta5Exe);
    await ensureDefaultPack(packsDir);
    const active = await api.activePack(activeDir, packsDir);
    if (!active) {
      await api.switchPack(activeDir, packsDir, DEFAULT_PACK_NAME, gta5Dir).catch(() => undefined);
    }
    setConfig({ fivemExe, gta5Exe, gta5Dir, gameDir: activeDir, packsDir });
    markSetupComplete();
  }

  async function continueFromStep2() {
    setError(null);
    setBusy(true);
    try {
      setGameDir(detectedGameDir);
      if (setupInfo && (setupInfo.hasRealMods || setupInfo.hasRealPlugins)) {
        setStep(3);
      } else {
        await finalize(detectedGameDir);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function importAndFinish() {
    setError(null);
    setBusy(true);
    try {
      await api.importCurrentSetup(gameDir, packsDir, importName.trim() || "current");
      await finalize(gameDir);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function skipAndFinish() {
    setError(null);
    setBusy(true);
    try {
      await finalize(gameDir);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 px-5 pt-4 pb-5">
      <SetupWizardHeader step={step} />
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <FilePickerField
            label="Ou se trouve FiveM.exe ?"
            value={fivemExe}
            onPick={() => pickExe(setFivemExe)}
            placeholder="Aucun fichier selectionne"
          />
          <FilePickerField
            label="Ou se trouve GTA5.exe ?"
            value={gta5Exe}
            onPick={() => pickExe(setGta5Exe)}
            placeholder="Aucun fichier selectionne"
            hint="Necessaire pour le support ENB. Assure-toi que GTA5 n'a pas d'ENB deja installe."
          />
        </div>
      )}
      {step === 2 && (
        <FilePickerField
          label="Ou stocker tes packs ?"
          value={packsDir}
          onPick={() => pickPacksDir(setPacksDir)}
          placeholder="Aucun dossier selectionne"
          hint="Un pack 'default' vide sera cree."
        />
      )}
      {step === 3 && (
        <ImportStep
          importName={importName}
          onImportNameChange={setImportName}
          busy={busy}
        />
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
      <WizardActions
        step={step}
        canAdvance={canAdvance({ step, fivemExe, gta5Exe, packsDir, importName })}
        busy={busy}
        onBack={() => setStep(step === 3 ? 2 : 1)}
        onNext={step === 1 ? () => setStep(2) : continueFromStep2}
        onImport={importAndFinish}
        onSkipImport={skipAndFinish}
      />
    </div>
  );
}
