"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import {
  PREVIEW_MODE_COOKIE,
  PREVIEW_MODE_COOKIE_MAX_AGE,
  PREVIEW_MUTATION_MESSAGE,
} from "@/lib/previewMode"

interface PreviewModeContextValue {
  enterPreviewMode: () => void
  exitPreviewMode: () => void
  guardMutation: () => boolean
  isPreviewMode: boolean
}

const disabledPreviewMode: PreviewModeContextValue = {
  enterPreviewMode: () => {},
  exitPreviewMode: () => {},
  guardMutation: () => false,
  isPreviewMode: false,
}

const PreviewModeContext = createContext<PreviewModeContextValue>(
  disabledPreviewMode
)

function writePreviewCookie(enabled: boolean) {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = enabled
    ? `${PREVIEW_MODE_COOKIE}=1; Path=/; Max-Age=${PREVIEW_MODE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
    : `${PREVIEW_MODE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
}

export function PreviewModeProvider({
  children,
  initialEnabled,
}: {
  children: ReactNode
  initialEnabled: boolean
}) {
  const [isPreviewMode, setIsPreviewMode] = useState(initialEnabled)
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && isPreviewMode) {
      writePreviewCookie(false)
      setIsPreviewMode(false)
    }
  }, [isPreviewMode, status])

  const enterPreviewMode = useCallback(() => {
    writePreviewCookie(true)
    setIsPreviewMode(true)
    router.push("/dashboard")
  }, [router])

  const exitPreviewMode = useCallback(() => {
    writePreviewCookie(false)
    setIsPreviewMode(false)
    router.push("/")
  }, [router])

  const guardMutation = useCallback(() => {
    if (!isPreviewMode) return false

    toast.info(PREVIEW_MUTATION_MESSAGE)
    return true
  }, [isPreviewMode])

  const value = useMemo(
    () => ({
      enterPreviewMode,
      exitPreviewMode,
      guardMutation,
      isPreviewMode,
    }),
    [enterPreviewMode, exitPreviewMode, guardMutation, isPreviewMode]
  )

  return (
    <PreviewModeContext.Provider value={value}>
      {children}
    </PreviewModeContext.Provider>
  )
}

export function usePreviewMode(): PreviewModeContextValue {
  return useContext(PreviewModeContext)
}
