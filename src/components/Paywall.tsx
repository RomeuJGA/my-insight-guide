import { useState } from "react";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Pkg = { id: "one" | "five" | "ten" | "twenty"; credits: number; label: string; price: string; popular?: boolean };

const PACKAGES: Pkg[] = [
  { id: "one", credits: 1, label: "1 mensagem", price: "1,00 €" },
  { id: "five", credits: 5, label: "5 créditos", price: "4,00 €", popular: true },
  { id: "ten", credits: 10, label: "10 créditos", price: "7,00 €" },
  { id: "twenty", credits: 20, label: "20 créditos", price: "12,00 €" },
];

interface PaywallProps {
  onPurchased: (newBalance: number) => void;
}

const Paywall = ({ onPurchased }: PaywallProps) => {
  const [busy, setBusy] = useState<string | null>(null);

  const buy = async (pkg: Pkg) => {
    if (busy) return;
    setBusy(pkg.id);
    try {
      const { data, error } = await supabase.functions.invoke("buy-credits", {
        body: { package: pkg.id },
      });
      if (error) throw error;
      if (typeof data?.credits !== "number") throw new Error("Resposta inválida");
      toast.success(`${pkg.credits} crédito${pkg.credits > 1 ? "s" : ""} adicionado${pkg.credits > 1 ? "s" : ""}.`);
      onPurchased(data.credits);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao processar compra.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl mb-2">Sem créditos disponíveis</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Escolha um pacote para continuar a receber as suas mensagens.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {PACKAGES.map((pkg) => {
          const isBusy = busy === pkg.id;
          return (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border p-5 transition-smooth ${
                pkg.popular ? "border-primary/60 bg-primary/5" : "border-border bg-background"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium uppercase tracking-wider">
                  Mais popular
                </span>
              )}
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-serif text-2xl">{pkg.credits}</span>
                <span className="text-sm font-medium">{pkg.price}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{pkg.label}</p>
              <button
                type="button"
                onClick={() => buy(pkg)}
                disabled={!!busy}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-60"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    A processar…
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Comprar
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Pagamentos simulados — para fins de demonstração.
      </p>
    </div>
  );
};

export default Paywall;
