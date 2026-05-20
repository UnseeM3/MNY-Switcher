import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  File as FileIcon,
  Folder,
  Loader2,
  Trash2,
} from "lucide-react";
import { useConfigStore } from "../stores/config";
import { api, type GtaModEntry } from "../api/tauri";

type CleanupGtaDialogProps = {
  onClose: () => void;
};

type Status = "scanning" | "ready" | "cleaning" | "done" | "error";

export function CleanupGtaDialog({ onClose }: CleanupGtaDialogProps) {
  const gta5Dir = useConfigStore((state) => state.gta5Dir);
  const [status, setStatus] = useState<Status>("scanning");
  const [items, setItems] = useState<GtaModEntry[]>([]);
  const [removedCount, setRemovedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const found = await api.scanGtaMods(gta5Dir);
        if (cancelled) return;
        setItems(found);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(String(err));
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gta5Dir]);

  async function confirmClean() {
    setStatus("cleaning");
    try {
      const count = await api.cleanGtaMods(gta5Dir);
      setRemovedCount(count);
      setStatus("done");
    } catch (err) {
      setErrorMessage(String(err));
      setStatus("error");
    }
  }

  return (
    <Backdrop onClose={status === "cleaning" ? undefined : onClose}>
      <Container>
        <DialogHeader />
        <DialogBody
          status={status}
          items={items}
          removedCount={removedCount}
          errorMessage={errorMessage}
        />
        <DialogFooter status={status} onClose={onClose} onConfirm={confirmClean} />
      </Container>
    </Backdrop>
  );
}

function Backdrop({
  onClose,
  children,
}: {
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      {children}
    </div>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex w-80 flex-col gap-3 bg-surface p-4 shadow-xl"
    >
      {children}
    </div>
  );
}

function DialogHeader() {
  return (
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-danger" strokeWidth={2.5} />
      <h2 className="text-sm font-semibold text-fg">Nettoyer GTA V</h2>
    </div>
  );
}

type DialogBodyProps = {
  status: Status;
  items: GtaModEntry[];
  removedCount: number;
  errorMessage: string;
};

function DialogBody({ status, items, removedCount, errorMessage }: DialogBodyProps) {
  if (status === "scanning") return <Centered icon="spin" label="Analyse en cours..." />;
  if (status === "error") return <ErrorView message={errorMessage} />;
  if (status === "done") return <DoneView count={removedCount} />;
  if (status === "cleaning") return <Centered icon="spin" label="Suppression en cours..." />;
  if (items.length === 0) return <EmptyView />;
  return <ItemList items={items} />;
}

function ItemList({ items }: { items: GtaModEntry[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs leading-relaxed text-fg-muted">
        {items.length} element{items.length > 1 ? "s" : ""} non vanilla detecte
        {items.length > 1 ? "s" : ""}. Tout sera supprime definitivement.
      </p>
      <ul className="max-h-44 overflow-y-auto bg-surface-elevated p-2 text-[11px] text-fg">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-1.5 truncate py-0.5"
            title={item.name}
          >
            {item.isDir ? (
              <Folder className="h-3 w-3 shrink-0 text-accent" strokeWidth={2.5} />
            ) : (
              <FileIcon className="h-3 w-3 shrink-0 text-fg-muted" strokeWidth={2.5} />
            )}
            <span className="truncate">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyView() {
  return (
    <div className="flex items-center gap-2 py-2">
      <CheckCircle2 className="h-4 w-4 text-accent" strokeWidth={2.5} />
      <p className="text-xs text-fg-muted">
        Rien a nettoyer, ton install GTA est vanilla.
      </p>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <p className="text-xs leading-relaxed text-danger">
      Erreur : {message}
    </p>
  );
}

function DoneView({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <CheckCircle2 className="h-4 w-4 text-accent" strokeWidth={2.5} />
      <p className="text-xs text-fg-muted">
        {count} element{count > 1 ? "s" : ""} supprime{count > 1 ? "s" : ""}. GTA V est
        revenu a sa version de base.
      </p>
    </div>
  );
}

function Centered({ icon, label }: { icon: "spin"; label: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      {icon === "spin" && (
        <Loader2 className="h-4 w-4 animate-spin text-fg-muted" strokeWidth={2.5} />
      )}
      <p className="text-xs text-fg-muted">{label}</p>
    </div>
  );
}

type DialogFooterProps = {
  status: Status;
  onClose: () => void;
  onConfirm: () => void;
};

function DialogFooter({ status, onClose, onConfirm }: DialogFooterProps) {
  if (status === "ready") {
    return <ReadyFooter onClose={onClose} onConfirm={onConfirm} />;
  }
  if (status === "cleaning") return null;
  return (
    <div className="flex justify-end pt-1">
      <button
        type="button"
        onClick={onClose}
        className="h-7 bg-surface-elevated px-3 text-[11px] font-medium text-fg-muted transition-colors hover:text-fg"
      >
        Fermer
      </button>
    </div>
  );
}

function ReadyFooter({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button
        type="button"
        onClick={onClose}
        className="h-7 bg-surface-elevated px-3 text-[11px] font-medium text-fg-muted transition-colors hover:text-fg"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex h-7 items-center gap-1.5 bg-danger px-3 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
      >
        <Trash2 className="h-3 w-3" strokeWidth={2.5} />
        Tout supprimer
      </button>
    </div>
  );
}
