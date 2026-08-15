import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { HashtagNode } from "@lexical/hashtag"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import { OverflowNode } from "@lexical/overflow"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import type { Klass, LexicalNode, LexicalNodeReplacement } from "lexical"
import { ParagraphNode, TextNode } from "lexical"

import { TweetNode } from "@/components/editor/nodes/embeds/tweet-node"
import { YouTubeNode } from "@/components/editor/nodes/embeds/youtube-node"
import { EmojiNode } from "@/components/editor/nodes/emoji-node"
import { ImageNode } from "@/components/editor/nodes/image-node"
import { HorizontalRuleNode } from "@/components/editor/nodes/horizontal-rule-node"
import { KeywordNode } from "@/components/editor/nodes/keyword-node"
import { LayoutContainerNode } from "@/components/editor/nodes/layout-container-node"
import { LayoutItemNode } from "@/components/editor/nodes/layout-item-node"
import { MentionNode } from "@/components/editor/nodes/mention-node"

export type EditorNodeRegistration =
  | Klass<LexicalNode>
  | LexicalNodeReplacement

/**
 * The persisted blog-content node registry. Keep this browser-safe so it can be
 * shared by LexicalComposer and the server-side headless editor.
 *
 * AutocompleteNode is intentionally absent: it represents a transient inline
 * suggestion and must never become part of persisted blog content.
 */
export const editorNodes: ReadonlyArray<EditorNodeRegistration> = [
  HeadingNode,
  ParagraphNode,
  TextNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  OverflowNode,
  HashtagNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeNode,
  CodeHighlightNode,
  HorizontalRuleNode,
  MentionNode,
  ImageNode,
  EmojiNode,
  KeywordNode,
  LayoutContainerNode,
  LayoutItemNode,
  AutoLinkNode,
  TweetNode,
  YouTubeNode,
]
