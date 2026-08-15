"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection"
import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from "@lexical/utils"
import {
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  type NodeKey,
} from "lexical"
import { useEffect } from "react"

interface HorizontalRuleComponentProps {
  nodeKey: NodeKey
}

export default function HorizontalRuleComponent({
  nodeKey,
}: HorizontalRuleComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)

  useEffect(
    () =>
      editor.registerCommand(
        CLICK_COMMAND,
        (event) => {
          const element = editor.getElementByKey(nodeKey)
          if (event.target !== element) return false
          if (!event.shiftKey) clearSelection()
          setSelected(!isSelected)
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
    [clearSelection, editor, isSelected, nodeKey, setSelected]
  )

  useEffect(() => {
    const element = editor.getElementByKey(nodeKey)
    if (!element) return

    const selectedClass = editor._config.theme.hrSelected ?? "selected"
    if (isSelected) {
      addClassNamesToElement(element, selectedClass)
    } else {
      removeClassNamesFromElement(element, selectedClass)
    }
  }, [editor, isSelected, nodeKey])

  return null
}
