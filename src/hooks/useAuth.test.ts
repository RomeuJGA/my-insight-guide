import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// ── Supabase mock ──────────────────────────────────────────────────────────
let authStateCallback: ((event: string, session: unknown) => void) | null = null;

const mockUnsubscribe = vi.fn();
const mockGetSession = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((cb: (event: string, session: unknown) => void) => {
        authStateCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }),
      getSession: mockGetSession,
    },
  },
}));

// ── sonner mock (useAuth importa toast) ───────────────────────────────────
vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));

import { useAuth } from "./useAuth";
import { toast } from "sonner";

const fakeUser = { id: "user-1", email: "test@test.com", email_confirmed_at: "2026-01-01" };
const fakeSession = { user: fakeUser, access_token: "tok" };

beforeEach(() => {
  vi.clearAllMocks();
  authStateCallback = null;
  mockGetSession.mockResolvedValue({ data: { session: null } });
});

describe("useAuth", () => {
  it("começa em loading e sem utilizador", () => {
    mockGetSession.mockReturnValue(new Promise(() => {})); // nunca resolve
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("resolve loading após getSession sem sessão", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("preenche user quando getSession devolve sessão", async () => {
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe("user-1");
    expect(result.current.session).toBe(fakeSession);
  });

  it("actualiza estado quando onAuthStateChange dispara SIGNED_IN", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => authStateCallback?.("SIGNED_IN", fakeSession));

    expect(result.current.user?.id).toBe("user-1");
    expect(result.current.session).toBe(fakeSession);
  });

  it("mostra toast quando sessão expira após ter tido sessão", async () => {
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.user?.id).toBe("user-1"));

    act(() => authStateCallback?.("SIGNED_OUT", null));

    expect(result.current.user).toBeNull();
    expect((toast.info as Mock)).toHaveBeenCalledWith(
      expect.stringContaining("sessão expirou"),
    );
  });

  it("não mostra toast de sessão expirada se nunca houve sessão", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => authStateCallback?.("SIGNED_OUT", null));

    expect((toast.info as Mock)).not.toHaveBeenCalled();
  });

  it("cancela subscrição ao desmontar", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { unmount } = renderHook(() => useAuth());
    await waitFor(() => {});
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });
});
