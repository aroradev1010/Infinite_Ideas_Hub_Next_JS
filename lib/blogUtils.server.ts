// lib/blogUtils.server.ts
import sanitizeHtml from "sanitize-html";
import he from "he";
import type { ApiResponse } from "@/types/db";

/* ------------------ Sanitizer options ------------------ */
export const sanitizerOpts = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "figure",
    "h1",
    "h2",
    "h3",
    "iframe",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "pre",
    "code",
    "details",
    "summary",
    "caption",
    "colgroup",
    "col",
    "section",
    "article",
    "aside",
    "nav",
    "header",
    "footer",
    "ul",
    "ol",
    "li",
    "input",
  ]),
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "width", "height", "loading"],
    iframe: [
      "src",
      "width",
      "height",
      "frameborder",
      "allow",
      "allowfullscreen",
    ],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    input: ["type", "disabled", "checked"],
  },
  transformTags: {
    a: (tagName: string, attribs: Record<string, any>) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
    }),
  },
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
    a: ["http", "https", "mailto"],
    iframe: ["https", "http"],
  },
};

/* ------------------ small helpers ------------------ */
export function escapeHtml(s: string) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
export function escapeHtmlAttr(s: string) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ------------------ Editor state -> HTML converter ------------------ */
/**
 * Defensive converter for typical Lexical/shadcn serialized states -> HTML.
 * This is pragmatic: covers paragraph, heading, link, list, list_item, table, image,
 * youtube, hr, layout-container. Add nodes if your editor emits other types.
 */
export function convertEditorStateToHtml(serialized: any): string {
  if (!serialized || typeof serialized !== "object") return "";

  function isListParentType(type: string) {
    return [
      "bullet_list",
      "unordered_list",
      "ul",
      "list",
      "ordered_list",
      "ol",
      "numbered_list",
      "list_wrapper",
    ].includes(type);
  }
  function isListItemType(type: string) {
    return ["list_item", "li", "listItem", "list-item"].includes(type);
  }

  function nodeToHtml(node: any): string {
    if (!node) return "";
    const type = node.type;

    if (type === "text") {
      const text = node.text ?? "";
      const style = node.style
        ? ` style="${escapeHtmlAttr(String(node.style))}"`
        : "";
      return `<span${style}>${escapeHtml(text)}</span>`;
    }

    if (type === "linebreak") return "<br/>";
    if (type === "horizontalrule" || type === "hr") return "<hr/>";

    if (type === "paragraph") {
      // If paragraph is actually a list item (some serializations embed list metadata)
      if (node.listType || node.tag === "li" || node.list) {
        const liInner =
          (node.children || []).map(nodeToHtml).join("") ||
          escapeHtml(node.text || "");
        return `<li>${liInner}</li>`;
      }
      const inner =
        (node.children || []).map(nodeToHtml).join("") ||
        escapeHtml(node.text || "");
      return `<p>${inner}</p>`;
    }

    if (type === "heading") {
      const tag = node.tag || "h2";
      const inner = (node.children || []).map(nodeToHtml).join("");
      return `<${tag}>${inner}</${tag}>`;
    }

    if (type === "link") {
      const url = node.url || node.attrs?.url || "#";
      const inner = (node.children || []).map(nodeToHtml).join("");
      return `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
    }

    if (type === "image" || node.src) {
      const src = node.src || node.attrs?.src || "";
      const alt = node.alt || node.attrs?.alt || "";
      return `<img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(alt)}" />`;
    }

    if (
      type === "youtube" ||
      type === "video" ||
      node.videoID ||
      node.videoId
    ) {
      const vid = node.videoID || node.videoId || node.attrs?.videoID;
      if (!vid) return "";
      const src = `https://www.youtube.com/embed/${escapeHtmlAttr(String(vid))}`;
      return `<div class="video-wrapper"><iframe src="${src}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen width="560" height="315"></iframe></div>`;
    }

    if (type === "table") {
      const rows = (node.children || []).map(nodeToHtml).join("");
      return `<table>${rows}</table>`;
    }
    if (type === "tablerow" || type === "tr") {
      const cells = (node.children || []).map(nodeToHtml).join("");
      return `<tr>${cells}</tr>`;
    }
    if (type === "tablecell" || type === "td" || type === "th") {
      const inner = (node.children || []).map(nodeToHtml).join("");
      const isHeader = node.type === "th" || node.headerState >= 2;
      return isHeader ? `<th>${inner}</th>` : `<td>${inner}</td>`;
    }

    if (isListParentType(type)) {
      const items = (node.children || []).map(nodeToHtml).join("");
      return `<ul>${items}</ul>`;
    }
    if (["ordered_list", "numbered_list", "ol", "orderedList"].includes(type)) {
      const items = (node.children || []).map(nodeToHtml).join("");
      return `<ol>${items}</ol>`;
    }
    if (isListItemType(type)) {
      const inner =
        (node.children || []).map(nodeToHtml).join("") ||
        escapeHtml(node.text || "");
      return `<li>${inner}</li>`;
    }

    // layout-container
    if (
      type === "layout-container" ||
      type === "layout" ||
      type === "layoutContainer"
    ) {
      const items = (node.children || []).map(
        (c: any) =>
          `<div class="layout-item">${(c.children || []).map(nodeToHtml).join("")}</div>`
      );
      const cols = node.templateColumns || node.columns || "1fr 1fr";
      return `<div class="layout-container" style="display:grid;grid-template-columns:${escapeHtmlAttr(cols)};gap:12px">${items.join("")}</div>`;
    }

    // fallback: children
    if (Array.isArray(node.children))
      return node.children.map(nodeToHtml).join("");
    if (typeof node.text === "string") return escapeHtml(node.text);
    return "";
  }

  const root = serialized.root || serialized;
  if (!root || !Array.isArray(root.children)) return "";
  return (root.children || []).map(nodeToHtml).join("");
}

/* ------------------ Sanitizer wrapper ------------------ */
export function sanitizeHtmlString(html: string) {
  const decoded = he.decode(html || "");
  return sanitizeHtml(decoded, sanitizerOpts);
}

/* ------------------ Response builder using ApiResponse<T> ------------------ */
export function makeJsonResponse<T>(
  payload: ApiResponse<T>,
  status = payload?.status ?? 200
) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
