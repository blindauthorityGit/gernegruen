"use client"

import {useGlobalDialogs} from "@/components/dialogs/GlobalDialogProvider"
import {Button} from "@/components/ui/Button"
import type {ReactNode} from "react"

export function ProductWishTrigger({className, children = "Wunsch mitteilen"}: {className?: string; children?: ReactNode}) {
  const {openDialog} = useGlobalDialogs()
  return <Button className={className} onClick={() => openDialog("productWish")}>{children}</Button>
}
