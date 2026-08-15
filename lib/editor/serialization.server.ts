import "server-only"

import { createHeadlessEditor } from "@lexical/headless"
import { $generateHtmlFromNodes } from "@lexical/html"
import { JSDOM } from "jsdom"
import {
  $getRoot,
  type EditorState,
  type LexicalEditor,
  type SerializedEditorState,
} from "lexical"
import sanitizeHtml, { type IOptions } from "sanitize-html"

import { editorNodes } from "@/lib/editor/nodes"

const YOUTUBE_EMBED_URL =
  /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}$/
const SAFE_IMAGE_URL =
  /^(?:https?:\/\/|\/(?!\/)|data:image\/(?:gif|jpeg|png|webp);base64,)/i
const SAFE_INLINE_STYLES = {
  "background-color": [
    /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i,
  ],
  color: [/^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i],
  "font-family": [/^[-a-z0-9 ,'\"]+$/i],
  "font-size": [/^\d+(?:\.\d+)?(?:em|px|rem|%)$/],
  "text-transform": [/^(?:capitalize|lowercase|none|uppercase)$/],
  "white-space": [/^pre-wrap$/],
}
const SAFE_BLOCK_STYLES = {
  "text-align": [/^(?:center|justify|left|right|start)$/],
}

const PUBLICATION_SANITIZER_OPTIONS: IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "figcaption",
    "figure",
    "hr",
    "iframe",
    "img",
    "mark",
    "sub",
    "sup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
  ]),
  allowedAttributes: {
    "*": ["dir", "style"],
    a: ["href", "rel", "target", "title"],
    blockquote: ["class", "data-lexical-tweet-id", "style"],
    div: [
      "class",
      "data-lexical-layout-container",
      "data-lexical-layout-template",
      "style",
    ],
    figure: ["class", "data-lexical-image"],
    iframe: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "height",
      "src",
      "title",
      "width",
    ],
    img: ["alt", "height", "loading", "src", "style", "width"],
    li: ["aria-checked", "role", "style", "tabindex", "value"],
    ol: ["start", "style"],
    p: ["style"],
    pre: [
      "data-highlight-language",
      "data-language",
      "data-theme",
      "spellcheck",
      "style",
    ],
    span: ["data-lexical-mention", "data-lexical-token", "style"],
    table: ["style"],
    td: ["colspan", "rowspan", "style"],
    th: ["colspan", "rowspan", "style"],
    ul: ["data-list-type", "style"],
  },
  allowedClasses: {
    blockquote: ["twitter-tweet"],
    div: ["blog-layout", "blog-layout-item"],
    figure: ["blog-image"],
  },
  allowedSchemesByTag: {
    a: ["http", "https", "mailto"],
    iframe: ["https"],
    img: ["data", "http", "https"],
  },
  allowedStyles: {
    b: SAFE_INLINE_STYLES,
    blockquote: SAFE_BLOCK_STYLES,
    code: SAFE_INLINE_STYLES,
    div: {
      display: [/^grid$/],
      gap: [/^0\.625rem$/],
      "grid-template-columns": [
        /^(?:1fr 1fr|1fr 3fr|1fr 1fr 1fr|1fr 2fr 1fr|1fr 1fr 1fr 1fr)$/,
      ],
    },
    img: {
      "max-width": [/^\d{1,4}px$/],
    },
    em: SAFE_INLINE_STYLES,
    h1: SAFE_BLOCK_STYLES,
    h2: SAFE_BLOCK_STYLES,
    h3: SAFE_BLOCK_STYLES,
    h4: SAFE_BLOCK_STYLES,
    h5: SAFE_BLOCK_STYLES,
    h6: SAFE_BLOCK_STYLES,
    i: SAFE_INLINE_STYLES,
    li: SAFE_BLOCK_STYLES,
    ol: SAFE_BLOCK_STYLES,
    p: SAFE_BLOCK_STYLES,
    pre: SAFE_BLOCK_STYLES,
    mark: SAFE_INLINE_STYLES,
    s: SAFE_INLINE_STYLES,
    span: SAFE_INLINE_STYLES,
    strong: SAFE_INLINE_STYLES,
    sub: SAFE_INLINE_STYLES,
    sup: SAFE_INLINE_STYLES,
    table: {
      "border-collapse": [/^collapse$/],
      ...SAFE_BLOCK_STYLES,
    },
    td: {
      "background-color": [/^#[0-9a-f]{3,8}$/i],
      border: [/^1px solid black$/],
      "text-align": [/^(?:center|justify|left|right|start)$/],
      "vertical-align": [/^(?:bottom|middle|top)$/],
      width: [/^\d+(?:\.\d+)?px$/],
    },
    th: {
      "background-color": [/^#[0-9a-f]{3,8}$/i],
      border: [/^1px solid black$/],
      "text-align": [/^(?:center|justify|left|right|start)$/],
      "vertical-align": [/^(?:bottom|middle|top)$/],
      width: [/^\d+(?:\.\d+)?px$/],
    },
    ul: SAFE_BLOCK_STYLES,
    u: SAFE_INLINE_STYLES,
  },
  exclusiveFilter(frame) {
    if (frame.tag === "iframe") {
      return !YOUTUBE_EMBED_URL.test(frame.attribs.src ?? "")
    }

    if (frame.tag === "img") {
      return !SAFE_IMAGE_URL.test(frame.attribs.src ?? "")
    }

    return false
  },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
    iframe: (_tagName, attribs) => ({
      tagName: "iframe",
      attribs: {
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: "true",
        frameborder: "0",
        height: "315",
        src: attribs.src,
        title: "YouTube video",
        width: "560",
      },
    }),
    ul: (tagName, attribs) => {
      const { __lexicallisttype: listType, ...safeAttributes } = attribs

      if (listType === "check") {
        safeAttributes["data-list-type"] = "check"
      }

      return { tagName, attribs: safeAttributes }
    },
  },
}

const CORE_NODE_TYPES = new Set(["linebreak", "root", "tab"])
const TRANSIENT_NODE_TYPES = new Set(["autocomplete"])
const PERSISTABLE_NODE_TYPES = new Set([
  ...CORE_NODE_TYPES,
  ...editorNodes.map((registration) =>
    typeof registration === "function"
      ? registration.getType()
      : registration.replace.getType()
  ),
])

let serverDom: JSDOM | undefined

export class InvalidSerializedEditorStateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidSerializedEditorStateError"
  }
}

export type SerializedEditorStateInput = SerializedEditorState | string

export interface ParsedSerializedEditorState {
  editor: LexicalEditor
  editorState: EditorState
  serializedState: SerializedEditorState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function ensureServerDom(): void {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return
  }

  serverDom ??= new JSDOM("<!doctype html><html><body></body></html>")
  const domWindow = serverDom.window
  const globals: Record<string, unknown> = {
    DOMParser: domWindow.DOMParser,
    Document: domWindow.Document,
    DocumentFragment: domWindow.DocumentFragment,
    Element: domWindow.Element,
    HTMLAnchorElement: domWindow.HTMLAnchorElement,
    HTMLElement: domWindow.HTMLElement,
    HTMLIFrameElement: domWindow.HTMLIFrameElement,
    HTMLImageElement: domWindow.HTMLImageElement,
    HTMLTableElement: domWindow.HTMLTableElement,
    MutationObserver: domWindow.MutationObserver,
    Node: domWindow.Node,
    Range: domWindow.Range,
    Text: domWindow.Text,
    document: domWindow.document,
    getComputedStyle: domWindow.getComputedStyle.bind(domWindow),
    window: domWindow,
  }

  for (const [name, value] of Object.entries(globals)) {
    if (!(name in globalThis)) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        value,
      })
    }
  }
}

function parseInput(input: SerializedEditorStateInput): unknown {
  if (typeof input !== "string") {
    return input
  }

  try {
    return JSON.parse(input)
  } catch {
    throw new InvalidSerializedEditorStateError(
      "Serialized editor state is not valid JSON"
    )
  }
}

function validateSerializedNode(node: unknown, path: string): void {
  if (!isRecord(node) || typeof node.type !== "string") {
    throw new InvalidSerializedEditorStateError(
      `Serialized editor node at ${path} is invalid`
    )
  }

  if (TRANSIENT_NODE_TYPES.has(node.type)) {
    throw new InvalidSerializedEditorStateError(
      `Transient editor node "${node.type}" cannot be persisted`
    )
  }

  if (!PERSISTABLE_NODE_TYPES.has(node.type)) {
    throw new InvalidSerializedEditorStateError(
      `Unknown editor node type "${node.type}" at ${path}`
    )
  }

  if ("children" in node && !Array.isArray(node.children)) {
    throw new InvalidSerializedEditorStateError(
      `Serialized editor node children at ${path} must be an array`
    )
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child, index) =>
      validateSerializedNode(child, `${path}.children[${index}]`)
    )
  }
}

export function validateSerializedEditorState(
  input: SerializedEditorStateInput
): SerializedEditorState {
  const parsed = parseInput(input)

  if (!isRecord(parsed) || !isRecord(parsed.root)) {
    throw new InvalidSerializedEditorStateError(
      "Serialized editor state must contain a root node"
    )
  }

  if (parsed.root.type !== "root" || !Array.isArray(parsed.root.children)) {
    throw new InvalidSerializedEditorStateError(
      "Serialized editor root node is invalid"
    )
  }

  validateSerializedNode(parsed.root, "root")
  return parsed as unknown as SerializedEditorState
}

function createServerEditor(): LexicalEditor {
  ensureServerDom()

  return createHeadlessEditor({
    namespace: "BlogContentServer",
    nodes: editorNodes,
    onError(error) {
      throw error
    },
  })
}

export function parseSerializedEditorState(
  input: SerializedEditorStateInput
): ParsedSerializedEditorState {
  const serializedState = validateSerializedEditorState(input)
  const editor = createServerEditor()

  try {
    const editorState = editor.parseEditorState(serializedState)
    editor.setEditorState(editorState)

    return { editor, editorState, serializedState }
  } catch (error) {
    const detail = error instanceof Error ? `: ${error.message}` : ""
    throw new InvalidSerializedEditorStateError(
      `Lexical could not restore the serialized editor state${detail}`
    )
  }
}

export function extractPlainText(
  input: SerializedEditorStateInput
): string {
  const { editorState } = parseSerializedEditorState(input)
  return editorState.read(() => $getRoot().getTextContent())
}

export function generateHtml(
  input: SerializedEditorStateInput
): string {
  const { editor, editorState } = parseSerializedEditorState(input)
  return editorState.read(() => $generateHtmlFromNodes(editor))
}

export function sanitizeGeneratedHtml(html: string): string {
  return sanitizeHtml(html, PUBLICATION_SANITIZER_OPTIONS)
}

export function renderSerializedEditorStateToHtml(
  input: SerializedEditorStateInput
): string {
  return sanitizeGeneratedHtml(generateHtml(input))
}
