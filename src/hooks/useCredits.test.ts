import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// ── Supabase mock ──────────────────────────────────────────────────────────
let realtimeCallback: ((payload: { new?: { credits?: number } }) => void) | null = null;

const mockInvoke = vi.fn();
const mockRemoveChannel = vi.fn();
const mockSubscribe = vi.fn().mockReturnValue({});
const mockOn = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: mockInvoke },
    channel: vi.fn(() => ({
      on: mockOn.mockImplementation((_event: string, _filter: unknown, cb: typeof realtimeCallback) => {
        realtimeCallback = cb;
        return { subscribe: mockSubscribe };
      }),
      subscribe: mockSubscribe,
    })),
    removeChannel: mockRemoveChannel,
  },
}));

// ── useAuth mock ───────────────────────────────────────────────────────────
const mockUser = { id: "user-abc", email: "u@test.com", email_confirmed_at: "2026-01-01" };

vi.mock("./useAuth", () => ({
  useAuth: vi.fn(() => ({ user: mockUser, loading: false })),
}));

import { useCredits } from "./useCredits";
import { useAuth } from "./useAuth";

beforeEach(() => {
  vi.clearAllMocks();
  realtimeCallback = null;
  mockSubscribe.mockReturnValue({});
  mockOn.mockImplementation((_e: string, _f: unknown, cb: typeof realtimeCallback) => {
    realtimeCallback = cb;
    return { subscribe: mockSubscribe };
  });
});

describe("useCredits", () => {
  it("começa em loading com credits null", () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCredits());
    expect(result.current.loading).toBe(true);
    expect(result.current.credits).toBeNull();
  });

  it("carrega créditos do servidor", async () => {
    mockInvoke.mockResolvedValue({ data: { credits: 7 }, error: null });
    const { result } = renderHook(() => useCredits());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.credits).toBe(7);
  });

  it("mantém credits null quando servidor falha", async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: "erro" } });
    const { result } = renderHook(() => useCredits());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.credits).toBeNull();
  });

  it("credits null quando não há utilizador", async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null, loading: false });
    const { result } = renderHook(() => useCredits());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.credits).toBeNull();
  });

  it("setLocal actualiza credits sem chamada ao servidor", async () => {
    mockInvoke.mockResolvedValue({ data: { credits: 3 }, error: null });
    const { result } = renderHook(() => useCredits());
    await waitFor(() => expect(result.current.credits).toBe(3));

    act(() => result.current.setLocal(10));
    expect(result.current.credits).toBe(10);
  });

  it("actualiza credits via realtime quando chega payload", async () => {
    mockInvoke.mockResolvedValue({ data: { credits: 5 }, error: null });
    const { result } = renderHook(() => useCredits());
    await waitFor(() => expect(result.current.credits).toBe(5));

    act(() => realtimeCallback?.({ new: { credits: 12 } }));
    expect(result.current.credits).toBe(12);
  });

  it("ignora payload realtime sem campo credits", async () => {
    mockInvoke.mockResolvedValue({ data: { credits: 5 }, error: null });
    const { result } = renderHook(() => useCredits());
    await waitFor(() => expect(result.current.credits).toBe(5));

    act(() => realtimeCallback?.({ new: {} }));
    expect(result.current.credits).toBe(5);
  });

  it("cancela subscrição realtime ao desmontar", async () => {
    mockInvoke.mockResolvedValue({ data: { credits: 2 }, error: null });
    const { unmount } = renderHook(() => useCredits());
    await waitFor(() => {});
    unmount();
    expect(mockRemoveChannel).toHaveBeenCalledOnce();
  });
});
