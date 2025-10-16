"use client";

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
    initialHtml?: string;
    onUpdate?: (html: string) => void;
    className?: string;
};

export default function BlogEditor({ initialHtml = "", onUpdate, className = "" }: Props) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: true,
                HTMLAttributes: { rel: "noopener noreferrer" },
            }),
            Image,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({ placeholder: "Write your story here..." }),
        ],
        content: initialHtml,
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-full focus:outline-none",
            },
        },
    });

    

    // call parent's onUpdate whenever editor content changes
    useEffect(() => {
        if (!editor) return;
        const handler = () => {
            const html = editor.getHTML();
            if (onUpdate) onUpdate(html);
        };
        // Tiptap 'update' event fires on every change
        editor.on("update", handler);
        // call once with initial content
        handler();
        return () => {
            editor.off("update", handler);
        };
    }, [editor, onUpdate]);

    // sync initialHtml if it changes
    useEffect(() => {
        if (!editor) return;
        if (initialHtml && editor.getHTML() !== initialHtml) {
            editor.commands.setContent(initialHtml);
        }
    }, [initialHtml, editor]);

    if (!editor) return <div>Loading editor…</div>;

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="prose prose-invert max-w-full">
                <EditorContent editor={editor} />
            </div>

            {/* Simple toolbar */}
            <div className="flex gap-2 flex-wrap mt-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="px-2 py-1 bg-gray-800 rounded"
                >
                    Bold
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="px-2 py-1 bg-gray-800 rounded"
                >
                    Italic
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className="px-2 py-1 bg-gray-800 rounded"
                >
                    Underline
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const url = window.prompt("Enter image URL");
                        if (url) editor.chain().focus().setImage({ src: url }).run();
                    }}
                    className="px-2 py-1 bg-gray-800 rounded"
                >
                    Insert Image (URL)
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const href = window.prompt("Enter URL");
                        if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
                    }}
                    className="px-2 py-1 bg-gray-800 rounded"
                >
                    Add Link
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    className="px-2 py-1 bg-gray-800 rounded"
                >
                    Undo
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    className="px-2 py-1 bg-gray-800 rounded"
                >
                    Redo
                </button>
            </div>
        </div>
    );
}
