import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const ConfirmDialogContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const confirmDialog = useCallback((options = {}) => new Promise((resolve) => {
    if (resolverRef.current) resolverRef.current(false);
    resolverRef.current = resolve;
    setDialog({
      title: options.title || "Are you sure?",
      message: options.message || "Please confirm that you want to continue.",
      details: options.details || "",
      confirmLabel: options.confirmLabel || "Confirm",
      cancelLabel: options.cancelLabel || "Cancel",
      tone: options.tone || "danger",
    });
  }), []);

  const resolveDialog = useCallback((confirmed) => {
    setDialog(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(confirmed);
  }, []);

  useEffect(() => () => {
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  return (
    <ConfirmDialogContext.Provider value={confirmDialog}>
      {children}
      <ConfirmDialog dialog={dialog} onResolve={resolveDialog} />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const confirmDialog = useContext(ConfirmDialogContext);
  if (!confirmDialog) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }
  return confirmDialog;
}
