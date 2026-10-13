import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { GlobalDialogProvider } from "@/components/dialogs/GlobalDialogProvider";
import { getPickupAvailability } from "@/lib/preorder/availability";
import { toOrderableBakeryCategories } from "@/lib/preorder/products";
import { getCurrentBakeryCategories } from "@/lib/weekly/data";
import {getBusinessSettings} from "@/sanity/lib/businessSettings";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [categories, availability, business] = await Promise.all([
    getCurrentBakeryCategories(),
    Promise.resolve(getPickupAvailability()),
    getBusinessSettings(),
  ]);

  return (
    <GlobalDialogProvider
      pickupAvailability={availability}
      preorderCategories={toOrderableBakeryCategories(categories)}
    >
      <Header business={business} />
      {children}
      <Footer business={business} />
    </GlobalDialogProvider>
  );
}
