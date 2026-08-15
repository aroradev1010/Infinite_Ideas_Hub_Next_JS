import type { SerializedEditorState } from "lexical"

interface PreviewResponse {
  contentHtml?: string
  error?: string
}

function isPreviewResponse(value: unknown): value is PreviewResponse {
  return typeof value === "object" && value !== null
}

export async function generateBlogPreview(
  editorState: SerializedEditorState
): Promise<string> {
  const response = await fetch("/api/blog/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ editorState }),
  })

  let result: unknown
  try {
    result = await response.json()
  } catch {
    throw new Error("The preview server returned an invalid response")
  }

  if (!response.ok) {
    throw new Error(
      isPreviewResponse(result) && typeof result.error === "string"
        ? result.error
        : "Unable to generate preview"
    )
  }

  if (
    !isPreviewResponse(result) ||
    typeof result.contentHtml !== "string"
  ) {
    throw new Error("The preview server did not return rendered content")
  }

  return result.contentHtml
}
