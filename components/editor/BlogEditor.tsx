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
 * - Listens for serialized state changes from Editor
 * - Converts the serialized state to sanitized-ish HTML (structure only)
 * - Calls onUpdate(html) with the generated HTML string
 *
 * Note: final sanitization must still be done server-side (you already sanitize in route).
 */
export default function BlogEditor({ initialHtml = "", onUpdate, className = "" }: Props) {
    // initialize with a minimal lexical serialized state if needed
    const [editorState, setEditorState] = useState<SerializedEditorState | null>(null);

    useEffect(() => {
        // If initialHtml provided, create a very small textual state.
        // Preferably you'd rehydrate from serialized state, but this is a safe default.
        const seedText = initialHtml
            ? stripHtmlToText(initialHtml)
            : "Start writing your blog…";

        const defaultState = {
            root: {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: seedText,
                                type: "text",
                                version: 1,
                            },
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "root",
                version: 1,
            },
        } as unknown as SerializedEditorState;

        setEditorState(defaultState);
    }, [initialHtml]);

    // Convert serialized state -> HTML and emit to parent
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
        return <div className="p-4 text-gray-400">Loading editor…</div>;
    }

    return (
        <div className={`border border-gray-800 rounded-lg bg-gray-900 p-3 ${className}`}>
            <Editor editorSerializedState={editorState} onSerializedChange={handleSerializedChange} />
        </div>
    );
}

/* -------------------------
   Helper utilities
   ------------------------- */

/** Very small HTML stripper for seeding text */
function stripHtmlToText(html: string) {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Serialize a Lexical-like serialized state to HTML.
 * This is intentionally forgiving and covers the node shapes you posted.
 */
function serializeLexicalToHtml(state: any): string {
    if (!state || !state.root || !Array.isArray(state.root.children)) return "";

    function renderNodes(nodes: any[]): string {
        return nodes.map(renderNode).join("");
    }

    function renderNode(node: any): string {
        if (!node) return "";

        const type = node.type;

        // ✅ Handle lists
        if (type === "list" || type === "ul" || type === "unordered_list") {
            const items = (node.children || []).map(renderNode).join("");
            return `<ul>${items}</ul>`;
        }

        if (type === "ol" || type === "ordered_list" || type === "numbered_list") {
            const items = (node.children || []).map(renderNode).join("");
            return `<ol>${items}</ol>`;
        }

        // ✅ Handle list items
        if (type === "listitem" || type === "list_item" || type === "li") {
            const inner = renderNodes(node.children || []);
            return `<li>${inner}</li>`;
        }

        // ✅ Handle text inside paragraphs, headings, etc.
        if (type === "text") {
            const text = escapeHtml(node.text ?? "");
            const style = node.style ? ` style="${escapeHtmlAttr(node.style)}"` : "";
            return `<span${style}>${text}</span>`;
        }

        if (type === "linebreak") return "<br/>";

        // ✅ Paragraphs
        if (type === "paragraph") {
            const inner = renderNodes(node.children || []);
            return inner.trim() ? `<p>${inner}</p>` : "";
        }

        // ✅ Headings
        if (type === "heading") {
            const tag = node.tag || "h2";
            const inner = renderNodes(node.children || []);
            return `<${tag}>${inner}</${tag}>`;
        }

        // ✅ Links
        if (type === "link") {
            const url = node.url || node.attrs?.url || "#";
            const inner = renderNodes(node.children || []);
            return `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
        }

        // ✅ HR
        if (type === "horizontalrule" || type === "hr") return "<hr/>";

        // ✅ Table
        if (type === "table") {
            const rows = renderNodes(node.children || []);
            return `<table>${rows}</table>`;
        }

        if (type === "tablerow" || type === "tr") {
            const cells = renderNodes(node.children || []);
            return `<tr>${cells}</tr>`;
        }

        if (type === "tablecell" || type === "td" || type === "th") {
            const inner = renderNodes(node.children || []);
            const isHeader = type === "th" || node.headerState >= 2;
            return isHeader ? `<th>${inner}</th>` : `<td>${inner}</td>`;
        }

        // ✅ Default fallback: just render children
        if (Array.isArray(node.children)) return renderNodes(node.children);
        if (typeof node.text === "string") return escapeHtml(node.text);
        return "";
    }

    const root = state.root || state;
    return renderNodes(root.children || []);
}




/* -------------------------
   XSS / escaping helpers
   (we still sanitize server-side with sanitize-html)
   ------------------------- */
function escapeHtml(s: string) {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtmlAttr(s: string) {
    if (!s) return "";
    return escapeHtml(s).replace(/"/g, "&quot;");
}
