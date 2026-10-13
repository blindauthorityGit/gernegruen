"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { OrderableBakeryCategory } from "@/lib/preorder/products";

import { PreorderDialog } from "./PreorderDialog";
import { ProductWishDialog } from "./ProductWishDialog";

type DialogName = "preorder" | "productWish";

type DialogContextValue = {
  openDialog: (dialog: DialogName) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

type GlobalDialogProviderProps = {
  children: ReactNode;
  pickupAvailability: { minimumDate: string; maximumDate: string; suggestedDate: string; holidayDates: string[] };
  preorderCategories: OrderableBakeryCategory[];
};

export function GlobalDialogProvider({ children, pickupAvailability, preorderCategories }: GlobalDialogProviderProps) {
  const [activeDialog, setActiveDialog] = useState<DialogName | null>(null);
  const closeDialog = useCallback(() => setActiveDialog(null), []);
  const value = useMemo(() => ({ openDialog: setActiveDialog, closeDialog }), [closeDialog]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <PreorderDialog categories={preorderCategories} isOpen={activeDialog === "preorder"} onClose={closeDialog} pickupAvailability={pickupAvailability} />
      <ProductWishDialog isOpen={activeDialog === "productWish"} onClose={closeDialog} />
    </DialogContext.Provider>
  );
}

export function useGlobalDialogs() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useGlobalDialogs must be used within GlobalDialogProvider");
  return context;
}
