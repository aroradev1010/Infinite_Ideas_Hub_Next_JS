// hooks/useAutosaveDraft.tsx
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { saveDraft as saveDraftAPI } from "@/lib/draftService";

type Draft = {
    title?: string;
    description?: string;
    image?: string;
    category?: string;
    status?: string;
    updatedAt?: number;
    blogId?: string | null;
};

const AUTOSAVE_KEY = "ii_hub_local_draft_v1";
const DEFAULT_DEBOUNCE = 1500;

export function useAutosaveDraft(opts?: { initialBlogId?: string | null; debounceMs?: number }) {
    const { initialBlogId = null, debounceMs = DEFAULT_DEBOUNCE } = opts || {};
    const [isSyncing, setIsSyncing] = useState(false);
    const autosaveTimer = useRef<number | null>(null);
    const serverSyncTimer = useRef<number | null>(null);

    // get local draft
    const loadLocalDraft = useCallback((): Draft | null => {
        try {
            const raw = localStorage.getItem(AUTOSAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as Draft;
        } catch {
            localStorage.removeItem(AUTOSAVE_KEY);
            return null;
        }
    }, []);

    // store local draft
    const saveLocalDraft = useCallback((draft: Draft) => {
        try {
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ ...draft, updatedAt: Date.now() }));
        } catch {
            /* ignore storage errors */
        }
    }, []);

    const clearLocalDraft = useCallback(() => {
        try { localStorage.removeItem(AUTOSAVE_KEY); } catch { }
    }, []);

    // debounced autosave (call this from component when state changes)
    const scheduleAutosave = useCallback((draft: Draft) => {
        if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
        autosaveTimer.current = window.setTimeout(() => saveLocalDraft(draft), debounceMs);
        // if blogId present, sync to server as well (best-effort backup)
        if (initialBlogId || draft.blogId) {
            if (serverSyncTimer.current) window.clearTimeout(serverSyncTimer.current);
            serverSyncTimer.current = window.setTimeout(async () => {
                if (!navigator.onLine) return;
                setIsSyncing(true);
                try {
                    await saveDraftAPI({ 
                        ...draft, 
                        blogId: draft.blogId ?? initialBlogId,
                        status: draft.status === "draft" || draft.status === "published" ? draft.status : undefined
                    });
                } finally {
                    setIsSyncing(false);
                }
            }, debounceMs + 200);
        }
    }, [debounceMs, initialBlogId, saveLocalDraft]);

    const saveNowToServer = useCallback(async (draft: Draft) => {
        try {
            setIsSyncing(true);
            const res = await saveDraftAPI({
                ...draft,
                status: draft.status === "draft" || draft.status === "published" ? draft.status : undefined
            });
            return res;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    // cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
            if (serverSyncTimer.current) window.clearTimeout(serverSyncTimer.current);
        };
    }, []);

    return {
        loadLocalDraft,
        saveLocalDraft,
        clearLocalDraft,
        scheduleAutosave,
        saveNowToServer,
        isSyncing,
    };
}
