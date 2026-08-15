"use client"

import { $getRoot, type EditorState, type SerializedEditorState } from "lexical"
import { useCallback, useState } from "react"

import { Editor } from "@/components/blocks/editor-x/editor"
import { createEmptySerializedEditorState } from "@/lib/editor/state"

interface BlogEditorProps {
  initialEditorState?: SerializedEditorState
  onUpdate?: (editorState: SerializedEditorState, plainText: string) => void
  className?: string
}

export default function BlogEditor({
  initialEditorState,
  onUpdate,
  className = "",
}: BlogEditorProps) {
  const [initialState] = useState<SerializedEditorState>(() =>
    initialEditorState ?? createEmptySerializedEditorState()
  )

  const handleChange = useCallback(
    (nextEditorState: EditorState) => {
      const serializedState = nextEditorState.toJSON()
      const plainText = nextEditorState.read(() => $getRoot().getTextContent())
      onUpdate?.(serializedState, plainText)
    },
    [onUpdate]
  )

  return (
    <div
      className={`rounded-lg border border-gray-800 bg-gray-900 p-3 ${className}`}
    >
      <Editor
        editorSerializedState={initialState}
        onChange={handleChange}
      />
    </div>
  )
}
