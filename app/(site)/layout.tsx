import type { ReactNode } from "react";
import {draftMode} from "next/headers";
import {VisualEditing} from "next-sanity/visual-editing";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { GlobalDialogProvider } from "@/components/dialogs/GlobalDialogProvider";
import { getPickupAvailability } from "@/lib/preorder/availability";
import { toOrderableBakeryCategories } from "@/lib/preorder/products";
import { getCurrentBakeryGroups } from "@/lib/weekly/data";
import {getBusinessSettings} from "@/sanity/lib/businessSettings";
import {getFooterSettings} from "@/sanity/lib/footerSettings";
import {SanityLive} from "@/sanity/lib/live";
import {DisableDraftMode} from "@/components/studio/DisableDraftMode";
import {CookieNotice} from "@/components/layout/CookieNotice";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [categories, availability, business, footer, draft] = await Promise.all([
    getCurrentBakeryGroups(),
    Promise.resolve(getPickupAvailability()),
    getBusinessSettings(),
    getFooterSettings(),
    draftMode(),
  ]);

  return (
    <GlobalDialogProvider
      pickupAvailability={availability}
      preorderCategories={toOrderableBakeryCategories(categories)}
    >
      <Header business={business} />
      {children}
      <Footer business={business} settings={footer} />
      <CookieNotice />
      <SanityLive />
      {draft.isEnabled && <><VisualEditing /><DisableDraftMode /></>}
    </GlobalDialogProvider>
  );
}
