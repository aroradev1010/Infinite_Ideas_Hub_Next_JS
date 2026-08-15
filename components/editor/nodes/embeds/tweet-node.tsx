import * as React from "react"
import { JSX, Suspense } from "react"
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode"
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from "lexical"

const TweetComponent = React.lazy(
  () => import("../../editor-ui/tweet-component")
)

function assertTweetId(id: string): void {
  if (!/^\d{1,30}$/.test(id)) {
    throw new Error("Invalid tweet ID")
  }
}

function $convertTweetElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const id = domNode.getAttribute("data-lexical-tweet-id")
  if (id) {
    const node = $createTweetNode(id)
    return { node }
  }
  return null
}

export type SerializedTweetNode = Spread<
  {
    id: string
  },
  SerializedDecoratorBlockNode
>

export class TweetNode extends DecoratorBlockNode {
  __id: string

  static getType(): string {
    return "tweet"
  }

  static clone(node: TweetNode): TweetNode {
    return new TweetNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedTweetNode): TweetNode {
    const node = $createTweetNode(serializedNode.id)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON(): SerializedTweetNode {
    return {
      ...super.exportJSON(),
      id: this.getId(),
      type: "tweet",
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap<HTMLElement> | null {
    return {
      blockquote: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-tweet-id")) {
          return null
        }
        return {
          conversion: $convertTweetElement,
          priority: 2,
        }
      },
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-tweet-id")) {
          return null
        }
        return {
          conversion: $convertTweetElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("blockquote")
    element.className = "twitter-tweet"
    element.setAttribute("data-lexical-tweet-id", this.__id)

    const link = document.createElement("a")
    link.setAttribute("href", this.getTextContent())
    link.setAttribute("target", "_blank")
    link.setAttribute("rel", "noopener noreferrer")
    link.textContent = "View post on X"
    element.append(link)
    return { element }
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key)
    assertTweetId(id)
    this.__id = id
  }

  getId(): string {
    return this.__id
  }

  getTextContent(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _includeInert?: boolean | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _includeDirectionless?: false | undefined
  ): string {
    return `https://x.com/i/web/status/${this.__id}`
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || "",
    }
    return (
      <Suspense fallback={null}>
        <TweetComponent
          className={className}
          format={this.__format}
          loadingComponent="Loading..."
          nodeKey={this.getKey()}
          tweetID={this.__id}
        />
      </Suspense>
    )
  }
}

export function $createTweetNode(tweetID: string): TweetNode {
  return new TweetNode(tweetID)
}

export function $isTweetNode(
  node: TweetNode | LexicalNode | null | undefined
): node is TweetNode {
  return node instanceof TweetNode
}
