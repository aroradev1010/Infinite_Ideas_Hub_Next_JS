"use client";

import React, { useEffect, useState } from "react";
import { SerializedEditorState } from "lexical";
import { Editor } from "../blocks/editor-x/editor";

type Props = {
  initialHtml?: string;
  onUpdate?: (html: string) => void;
  className?: string;
};

/**
 * BlogEditor using @shadcn-editor/editor-x
 *
 * FIX: Instead of stripping HTML to plain text (which lost all structure),
 * we now parse the HTML back into proper Lexical serialized nodes,
 * preserving headings, lists, bold/italic, links, etc.
 */
export default function BlogEditor({
  initialHtml = "",
  onUpdate,
  className = "",
}: Props) {
  const [editorState, setEditorState] =
    useState<SerializedEditorState | null>(null);

  useEffect(() => {
    const nodes =
      initialHtml
        ? parseHtmlToLexicalNodes(initialHtml)
        : [makeParagraph([makeText("Start writing your blog\u2026")])];

    const defaultState = {
      root: {
        children: nodes,
        direction: "ltr" as const,
        format: "" as const,
        indent: 0,
        type: "root",
        version: 1,
      },
    } as unknown as SerializedEditorState;

    setEditorState(defaultState);
  }, [initialHtml]);

  const handleSerializedChange = (value: SerializedEditorState) => {
    setEditorState(value);
    try {
      const html = serializeLexicalToHtml(value);
      onUpdate?.(html);
    } catch (err) {
      console.error("Failed to serialize editor state to HTML:", err);
      onUpdate?.("");
    }
  };

  if (!editorState) {
    return <div className="p-4 text-gray-400">Loading editor\u2026</div>;
  }

  return (
    <div className={`border border-gray-800 rounded-lg bg-gray-900 p-3 ${className}`}>
      <Editor
        editorSerializedState={editorState}
        onSerializedChange={handleSerializedChange}
      />
    </div>
  );
}

// ─── Lexical node builder helpers ────────────────────────────────────────────

function makeText(text: string, format = 0, style = ""): Record<string, unknown> {
  return { detail: 0, format, mode: "normal", style, text, type: "text", version: 1 };
}

function makeParagraph(children: Record<string, unknown>[]): Record<string, unknown> {
  return { children, direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1 };
}

function makeHeading(tag: string, children: Record<string, unknown>[]): Record<string, unknown> {
  return { children, direction: "ltr", format: "", indent: 0, type: "heading", version: 1, tag };
}

function makeListItem(children: Record<string, unknown>[], value = 1): Record<string, unknown> {
  return { children, direction: "ltr", format: "", indent: 0, type: "listitem", version: 1, value, checked: undefined };
}

function makeList(listType: "bullet" | "number", children: Record<string, unknown>[]): Record<string, unknown> {
  return { children, direction: "ltr", format: "", indent: 0, type: "list", version: 1, listType, start: 1, tag: listType === "bullet" ? "ul" : "ol" };
}

function makeQuote(children: Record<string, unknown>[]): Record<string, unknown> {
  return { children, direction: "ltr", format: "", indent: 0, type: "quote", version: 1 };
}

function makeHorizontalRule(): Record<string, unknown> {
  return { type: "horizontalrule", version: 1 };
}

// ─── HTML → Lexical parser ───────────────────────────────────────────────────
// Uses the browser DOMParser to walk the tree and build proper Lexical nodes.
// This replaces the old stripHtmlToText() which destroyed all structure.

function parseHtmlToLexicalNodes(html: string): Record<string, unknown>[] {
  if (!html || typeof window === "undefined") {
    return [makeParagraph([makeText("")])];
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes: Record<string, unknown>[] = [];

  // Parse inline content (text, bold, italic, links, br, etc.)
  function parseInline(el: Element | Node): Record<string, unknown>[] {
    const out: Record<string, unknown>[] = [];
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";
        if (text) out.push(makeText(text));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const elem = child as Element;
        const tag = elem.tagName.toLowerCase();

        // Lexical format bitmask: bold=1, italic=2, strikethrough=4, underline=8, code=16
        let fmt = 0;
        if (tag === "strong" || tag === "b") fmt |= 1;
        if (tag === "em" || tag === "i") fmt |= 2;
        if (tag === "s" || tag === "del") fmt |= 4;
        if (tag === "u") fmt |= 8;
        if (tag === "code") fmt |= 16;

        if (tag === "br") {
          out.push({ type: "linebreak", version: 1 });
        } else if (tag === "a") {
          out.push({
            children: parseInline(elem),
            direction: "ltr", format: "", indent: 0,
            type: "link", version: 1,
            url: elem.getAttribute("href") ?? "#",
            rel: "noopener noreferrer", target: "_blank",
          });
        } else if (fmt > 0) {
          const text = elem.textContent ?? "";
          if (text) out.push(makeText(text, fmt));
        } else {
          out.push(...parseInline(elem));
        }
      }
    });
    return out.length > 0 ? out : [makeText("")];
  }

  // Parse <li> items from a <ul> or <ol>
  function parseListItems(listEl: Element, listType: "bullet" | "number"): Record<string, unknown>[] {
    const items: Record<string, unknown>[] = [];
    let counter = 1;
    listEl.childNodes.forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const li = child as Element;
      if (li.tagName.toLowerCase() !== "li") return;

      // Clone li and remove nested lists so we only parse direct text
      const clone = li.cloneNode(true) as Element;
      clone.querySelectorAll("ul, ol").forEach((n) => n.remove());
      items.push(makeListItem(parseInline(clone), counter++));

      // Recurse into any nested lists
      li.querySelectorAll(":scope > ul").forEach((nested) => {
        const nestedItems = parseListItems(nested, "bullet");
        if (nestedItems.length) items.push(makeList("bullet", nestedItems));
      });
      li.querySelectorAll(":scope > ol").forEach((nested) => {
        const nestedItems = parseListItems(nested, "number");
        if (nestedItems.length) items.push(makeList("number", nestedItems));
      });
    });
    return items;
  }

  // Walk block-level elements
  function walkBlock(el: Element): Record<string, unknown> | Record<string, unknown>[] | null {
    const tag = el.tagName.toLowerCase();

    if (tag === "p") return makeParagraph(parseInline(el));
    if (["h1","h2","h3","h4","h5","h6"].includes(tag)) return makeHeading(tag, parseInline(el));
    if (tag === "ul") {
      const items = parseListItems(el, "bullet");
      return items.length ? makeList("bullet", items) : null;
    }
    if (tag === "ol") {
      const items = parseListItems(el, "number");
      return items.length ? makeList("number", items) : null;
    }
    if (tag === "blockquote") return makeQuote(parseInline(el));
    if (tag === "hr") return makeHorizontalRule();
    if (tag === "pre" || tag === "code") {
      return makeParagraph([makeText(el.textContent ?? "", 16)]);
    }
    if (["div","section","article","main","header","footer","aside"].includes(tag)) {
      // Recurse into container elements and return multiple nodes
      const inner: Record<string, unknown>[] = [];
      el.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const result = walkBlock(child as Element);
          if (!result) return;
          Array.isArray(result) ? inner.push(...result) : inner.push(result);
        } else if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim();
          if (text) inner.push(makeParagraph([makeText(text)]));
        }
      });
      return inner.length ? inner : null;
    }
    // Unknown block — treat as paragraph
    const text = el.textContent?.trim();
    return text ? makeParagraph([makeText(text)]) : null;
  }

  doc.body.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const result = walkBlock(child as Element);
      if (!result) return;
      Array.isArray(result) ? nodes.push(...result) : nodes.push(result);
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) nodes.push(makeParagraph([makeText(text)]));
    }
  });

  return nodes.length > 0 ? nodes : [makeParagraph([makeText("")])];
}

// ─── Lexical serialized state → HTML ─────────────────────────────────────────

function serializeLexicalToHtml(state: any): string {
  if (!state?.root || !Array.isArray(state.root.children)) return "";

  function applyFormat(text: string, format: number): string {
    let r = text;
    if (format & 16) r = `<code>${r}</code>`;
    if (format & 4)  r = `<s>${r}</s>`;
    if (format & 8)  r = `<u>${r}</u>`;
    if (format & 2)  r = `<em>${r}</em>`;
    if (format & 1)  r = `<strong>${r}</strong>`;
    if (format & 32) r = `<sub>${r}</sub>`;
    if (format & 64) r = `<sup>${r}</sup>`;
    return r;
  }

  function renderNodes(nodes: any[]): string {
    return nodes.map(renderNode).join("");
  }

  function renderNode(node: any): string {
    if (!node) return "";
    const { type } = node;

    if (type === "text") {
      const escaped = escapeHtml(node.text ?? "");
      const style = node.style ? ` style="${escapeHtmlAttr(node.style)}"` : "";
      const fmt = applyFormat(escaped, node.format ?? 0);
      return style ? `<span${style}>${fmt}</span>` : fmt;
    }
    if (type === "linebreak")    return "<br/>";
    if (type === "horizontalrule") return "<hr/>";
    if (type === "paragraph")    return `<p>${renderNodes(node.children || [])}</p>`;
    if (type === "heading")      { const t = node.tag || "h2"; return `<${t}>${renderNodes(node.children || [])}</${t}>`; }
    if (type === "quote")        return `<blockquote>${renderNodes(node.children || [])}</blockquote>`;
    if (type === "link")         return `<a href="${escapeHtmlAttr(node.url || "#")}" target="_blank" rel="noopener noreferrer">${renderNodes(node.children || [])}</a>`;
    if (type === "list")         { const t = node.listType === "number" ? "ol" : "ul"; return `<${t}>${renderNodes(node.children || [])}</${t}>`; }
    if (type === "listitem")     return `<li>${renderNodes(node.children || [])}</li>`;
    if (type === "table")        return `<table>${renderNodes(node.children || [])}</table>`;
    if (type === "tablerow")     return `<tr>${renderNodes(node.children || [])}</tr>`;
    if (type === "tablecell")    { const inner = renderNodes(node.children || []); return node.headerState >= 2 ? `<th>${inner}</th>` : `<td>${inner}</td>`; }
    if (type === "image")        return `<img src="${escapeHtmlAttr(node.src || "")}" alt="${escapeHtmlAttr(node.altText || "")}" />`;

    if (Array.isArray(node.children)) return renderNodes(node.children);
    if (typeof node.text === "string") return escapeHtml(node.text);
    return "";
  }

  return renderNodes(state.root.children || []);
}

function escapeHtml(s: string): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtmlAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}