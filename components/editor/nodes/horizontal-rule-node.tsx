import * as React from "react"
import { Suspense, type JSX } from "react"
import {
  $applyNodeReplacement,
  createCommand,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type LexicalCommand,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical"

const HorizontalRuleComponent = React.lazy(
  () => import("../editor-ui/horizontal-rule-component")
)

export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void> =
  createCommand("INSERT_HORIZONTAL_RULE_COMMAND")

function $convertHorizontalRuleElement(): DOMConversionOutput {
  return { node: $createHorizontalRuleNode() }
}

export class HorizontalRuleNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return "horizontalrule"
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key)
  }

  static importJSON(serializedNode: SerializedLexicalNode): HorizontalRuleNode {
    return $createHorizontalRuleNode().updateFromJSON(serializedNode)
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: $convertHorizontalRuleElement,
        priority: 0,
      }),
    }
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement("hr") }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement("hr")
    const className = config.theme.hr
    if (typeof className === "string") element.className = className
    return element
  }

  updateDOM(): false {
    return false
  }

  getTextContent(): string {
    return "\n"
  }

  isInline(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <HorizontalRuleComponent nodeKey={this.getKey()} />
      </Suspense>
    )
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode())
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}
