"use client"

import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents"
import type { ElementFormatType, NodeKey } from "lexical"
import type { JSX } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

const WIDGET_SCRIPT_URL = "https://platform.twitter.com/widgets.js"

interface TweetComponentProps {
  className: Readonly<{
    base: string
    focus: string
  }>
  format: ElementFormatType | null
  loadingComponent?: JSX.Element | string
  nodeKey: NodeKey
  onError?: (error: string) => void
  onLoad?: () => void
  tweetID: string
}

let isTwitterScriptLoading = true

export default function TweetComponent({
  className,
  format,
  loadingComponent,
  nodeKey,
  onError,
  onLoad,
  tweetID,
}: TweetComponentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousTweetIDRef = useRef("")
  const [isTweetLoading, setIsTweetLoading] = useState(false)

  const createTweet = useCallback(async () => {
    try {
      // @ts-expect-error Twitter adds its widget API to window at runtime.
      await window.twttr.widgets.createTweet(tweetID, containerRef.current)
      setIsTweetLoading(false)
      isTwitterScriptLoading = false
      onLoad?.()
    } catch (error) {
      onError?.(String(error))
    }
  }, [onError, onLoad, tweetID])

  useEffect(() => {
    if (tweetID === previousTweetIDRef.current) return

    setIsTweetLoading(true)
    if (isTwitterScriptLoading) {
      const script = document.createElement("script")
      script.src = WIDGET_SCRIPT_URL
      script.async = true
      document.body?.appendChild(script)
      script.onload = createTweet
      script.onerror = () => onError?.("Unable to load the X embed script")
    } else {
      void createTweet()
    }

    previousTweetIDRef.current = tweetID
  }, [createTweet, onError, tweetID])

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      {isTweetLoading ? loadingComponent : null}
      <div
        ref={containerRef}
        style={{ display: "inline-block", width: "550px" }}
      />
    </BlockWithAlignableContents>
  )
}
