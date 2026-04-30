/**
 * Private Access Gate
 * --------------------
 * Set VITE_PRIVATE_MODE=false in .env to disable the gate.
 * Set VITE_GATE_PASSWORD in .env to change the access password.
 * Bypass via URL: append `?preview=1` to any URL.
 */
export const isPrivateMode = import.meta.env.VITE_PRIVATE_MODE !== "false";
export const GATE_PASSWORD = import.meta.env.VITE_GATE_PASSWORD ?? "";
export const GATE_STORAGE_KEY = "intus_gate_access_v1";
export const GATE_PREVIEW_PARAM = "preview";
