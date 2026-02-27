import { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteContextType {
  confirmDelete: (onConfirm: () => void | Promise<void>, title?: string, description?: string) => void;
}

const ConfirmDeleteContext = createContext<ConfirmDeleteContextType | null>(null);

export const useConfirmDelete = () => {
  const ctx = useContext(ConfirmDeleteContext);
  if (!ctx) {
    // Fallback: if outside provider, just call directly (no confirmation)
    return {
      confirmDelete: (onConfirm: () => void | Promise<void>) => { onConfirm(); },
    };
  }
  return ctx;
};

export const ConfirmDeleteProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("ডিলিট নিশ্চিত করুন");
  const [description, setDescription] = useState("এটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।");
  const callbackRef = useRef<(() => void | Promise<void>) | null>(null);

  const confirmDelete = useCallback((onConfirm: () => void | Promise<void>, customTitle?: string, customDesc?: string) => {
    callbackRef.current = onConfirm;
    setTitle(customTitle || "ডিলিট নিশ্চিত করুন");
    setDescription(customDesc || "এটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।");
    setOpen(true);
  }, []);

  const handleConfirm = async () => {
    setOpen(false);
    if (callbackRef.current) {
      await callbackRef.current();
      callbackRef.current = null;
    }
  };

  const handleCancel = () => {
    setOpen(false);
    callbackRef.current = null;
  };

  return (
    <ConfirmDeleteContext.Provider value={{ confirmDelete }}>
      {children}
      <AlertDialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              হ্যাঁ, ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDeleteContext.Provider>
  );
};
