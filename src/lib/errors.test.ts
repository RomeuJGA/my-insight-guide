import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
  it("extrai message de um Error", () => {
    expect(getErrorMessage(new Error("algo correu mal"))).toBe("algo correu mal");
  });

  it("devolve string directamente", () => {
    expect(getErrorMessage("erro de rede")).toBe("erro de rede");
  });

  it("extrai message de um objecto simples", () => {
    expect(getErrorMessage({ message: "erro do servidor" })).toBe("erro do servidor");
  });

  it("devolve fallback para null", () => {
    expect(getErrorMessage(null)).toBe("Ocorreu um erro inesperado.");
  });

  it("devolve fallback para undefined", () => {
    expect(getErrorMessage(undefined)).toBe("Ocorreu um erro inesperado.");
  });

  it("devolve fallback para número", () => {
    expect(getErrorMessage(42)).toBe("Ocorreu um erro inesperado.");
  });

  it("devolve fallback para objecto sem message", () => {
    expect(getErrorMessage({ code: 500 })).toBe("Ocorreu um erro inesperado.");
  });

  it("não aceita message não-string num objecto", () => {
    expect(getErrorMessage({ message: 123 })).toBe("Ocorreu um erro inesperado.");
  });

  it("preserva mensagem vazia de Error", () => {
    expect(getErrorMessage(new Error(""))).toBe("");
  });
});
