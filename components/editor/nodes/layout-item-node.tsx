import { addClassNamesToElement } from "@lexical/utils"
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  SerializedElementNode,
} from "lexical"
import { ElementNode } from "lexical"

export type SerializedLayoutItemNode = SerializedElementNode

export class LayoutItemNode extends ElementNode {
  static getType(): string {
    return "layout-item"
  }

  static clone(node: LayoutItemNode): LayoutItemNode {
    return new LayoutItemNode(node.__key)
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div")
    if (typeof config.theme.layoutItem === "string") {
      addClassNamesToElement(dom, config.theme.layoutItem)
    }
    return dom
  }

  updateDOM(): boolean {
    return false
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div")
    element.className = "blog-layout-item"
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {}
  }

  static importJSON(json: SerializedLayoutItemNode): LayoutItemNode {
    return $createLayoutItemNode().updateFromJSON(json)
  }

  isShadowRoot(): boolean {
    return true
  }

  exportJSON(): SerializedLayoutItemNode {
    return {
      ...super.exportJSON(),
      type: "layout-item",
      version: 1,
    }
  }
}

export function $createLayoutItemNode(): LayoutItemNode {
  return new LayoutItemNode()
}

export function $isLayoutItemNode(
  node: LexicalNode | null | undefined
): node is LayoutItemNode {
  return node instanceof LayoutItemNode
}
