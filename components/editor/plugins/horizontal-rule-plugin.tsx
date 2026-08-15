"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $insertNodeToNearestRoot } from "@lexical/utils"
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from "lexical"
import { useEffect } from "react"

import {
  $createHorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from "@/components/editor/nodes/horizontal-rule-node"

export function HorizontalRulePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(
    () =>
      editor.registerCommand(
        INSERT_HORIZONTAL_RULE_COMMAND,
        () => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) return false
          $insertNodeToNearestRoot($createHorizontalRuleNode())
          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),
    [editor]
  )

  return null
}
