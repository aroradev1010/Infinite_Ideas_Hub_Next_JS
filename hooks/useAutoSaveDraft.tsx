// hooks/useAutoSaveDraft.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { saveDraft } from "@/lib/draftService";

/**
 * useAutoSaveDraft
 * - Debounced localStorage autosave
 * - Best-effort server backup when draftId or blogId present
 *
 * Returned API:
 *  - scheduleAutosave(payload)  // schedule local save + optional server save
 *  - clearLocalDraft(blogId?)    // remove local autosave (optionally delete server draft)
 *  - loadLocalDraft()            // parse and return local draft payload
 *  - currentDraftId              // current draft id (if any)
 *  - setCurrentDraftId(id)       // set draft id
 *  - isSyncing                   // boolean while talking to server
 */
type AutosavePayload = {
    title?: string;
    category?: string;
    image?: string;
    status?: string;
    description?: string;
    blogId?: string | null;
    draftId?: string | undefined;
};

export function useAutoSaveDraft(opts: { autosaveKey?: string; initialBlogId?: string | null } = {}) {
    const AUTOSAVE_KEY = opts.autosaveKey ?? "ii_hub_local_draft_v1";
    const AUTOSAVE_DEBOUNCE = 1500;

    const timerRef = useRef<number | null>(null);
    const serverTimerRef = useRef<number | null>(null);
    const mountedRef = useRef(true);

    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (timerRef.current) clearTimeout(timerRef.current);
            if (serverTimerRef.current) clearTimeout(serverTimerRef.current);
        };
    }, []);

    // load local draft from storage
    const loadLocalDraft = useCallback(() => {
        try {
            const raw = localStorage.getItem(AUTOSAVE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            // if draftId persisted locally, keep it
            if (parsed?.draftId) setCurrentDraftId(parsed.draftId);
            return parsed;
        } catch {
            return null;
        }
    }, [AUTOSAVE_KEY]);

    // clear local draft (and optionally return)
    const clearLocalDraft = useCallback(
        async (blogId?: string | null) => {
            try {
                localStorage.removeItem(AUTOSAVE_KEY);
            } catch { }
            // note: we do not attempt server delete here; caller can call deleteDraftAPI if desired
            setCurrentDraftId(null);
        },
        [AUTOSAVE_KEY]
    );

    // schedule local + server autosave
    const scheduleAutosave = useCallback(
        (payload: AutosavePayload) => {
            if (!mountedRef.current) return;

            // debounce local save
            if (timerRef.current) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                try {
                    const toStore = { ...payload, updatedAt: Date.now(), draftId: payload.draftId ?? currentDraftId ?? null };
                    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(toStore));
                } catch { /* ignore */ }
            }, AUTOSAVE_DEBOUNCE);

            // server backup: if we have a blogId (editing existing blog) or existing draftId, sync to server
            const shouldServerSync = Boolean(payload.blogId) || Boolean(payload.draftId) || Boolean(currentDraftId);
            if (!shouldServerSync) return;

            if (serverTimerRef.current) window.clearTimeout(serverTimerRef.current);
            serverTimerRef.current = window.setTimeout(async () => {
                setIsSyncing(true);
                try {
                    // call saveDraft API; uses draftId if provided to update
                    const resp = await saveDraft({
                        draftId: payload.draftId ?? currentDraftId ?? undefined,
                        title: payload.title ?? "",
                        description: payload.description ?? "",
                        image: payload.image ?? "",
                        category: payload.category ?? "",
                        status: (payload.status as any) ?? "draft",
                        blogId: payload.blogId ?? null,
                    });
                    if (resp?.ok && resp.draft?.id) {
                        setCurrentDraftId(resp.draft.id);
                        // persist returned draftId in local storage so future autosaves update same draft
                        try {
                            const raw = localStorage.getItem(AUTOSAVE_KEY);
                            const parsed = raw ? JSON.parse(raw) : {};
                            parsed.draftId = resp.draft.id;
                            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(parsed));
                        } catch { }
                    }
                } catch (err) {
                    // ignore network autosave failures
                } finally {
                    if (mountedRef.current) setIsSyncing(false);
                }
            }, AUTOSAVE_DEBOUNCE + 200);
        },
        [AUTOSAVE_KEY, AUTOSAVE_DEBOUNCE, currentDraftId]
    );

    return {
        scheduleAutosave,
        clearLocalDraft,
        loadLocalDraft,
        currentDraftId,
        setCurrentDraftId,
        isSyncing,
    };
}
