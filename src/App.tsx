import "./App.css";
import { Titlebar } from "./components/Titlebar";
import { SetupWizard } from "./components/SetupWizard";
import { PackList } from "./components/PackList";
import { SettingsPanel } from "./components/SettingsPanel";
import { Toast } from "./components/Toast";
import { useApplyTheme } from "./hooks/useApplyTheme";
import { useBlockDevtools } from "./hooks/useBlockDevtools";
import { useBlockContextMenu } from "./hooks/useBlockContextMenu";
import { useConfigStore } from "./stores/config";
import { useUiStore } from "./stores/ui";

function App() {
  useApplyTheme();
  useBlockDevtools();
  useBlockContextMenu();
  const setupComplete = useConfigStore((state) => state.setupComplete);
  const settingsOpen = useUiStore((state) => state.settingsOpen);

  return (
    <div className="flex h-screen w-screen flex-col bg-base text-fg">
      <Titlebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {renderMain({ setupComplete, settingsOpen })}
      </main>
      <Toast />
    </div>
  );
}

function renderMain({
  setupComplete,
  settingsOpen,
}: {
  setupComplete: boolean;
  settingsOpen: boolean;
}) {
  if (!setupComplete) return <SetupWizard />;
  if (settingsOpen) return <SettingsPanel />;
  return <PackList />;
}

export default App;
