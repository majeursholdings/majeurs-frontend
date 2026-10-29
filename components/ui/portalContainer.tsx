"use client"

import * as React from "react"

type Container = React.RefObject<HTMLElement | null>

const PortalContainerContext = React.createContext<Container | undefined>(undefined)

/**
 * Where Select, Combobox and Popover render their popups. Wrap the content of a modal <dialog> (opened with
 * showModal()) in this, pointing at the dialog: the dialog sits in the browser's top layer and makes the rest
 * of the page inert, so popups portalled to <body> would open behind it and couldn't be clicked.
 */
export function PortalContainer({ value, children }: { value: Container; children: React.ReactNode }) {
  return <PortalContainerContext.Provider value={value}>{children}</PortalContainerContext.Provider>
}

/** The nearest PortalContainer, or undefined for the default (<body>) */
export function usePortalContainer() {
  return React.useContext(PortalContainerContext)
}
