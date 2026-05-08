import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { GrammaticalGender } from "@/hooks/useProfile";

interface Props {
  onSelect: (gender: GrammaticalGender) => Promise<void>;
}

export default function GenderSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<GrammaticalGender | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (gender: GrammaticalGender) => {
    if (saving) return;
    setSelected(gender);
    setSaving(true);
    await onSelect(gender);
    setSaving(false);
  };

  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-sans">
        Uma coisa antes de continuar
      </p>
      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
        Como prefere que me dirija a si?
      </h2>
      <p className="text-sm text-muted-foreground mb-10 max-w-xs">
        Assim as mensagens chegam na forma certa.
      </p>

      <div className="flex gap-4 w-full max-w-xs">
        {(["m", "f"] as GrammaticalGender[]).map((g) => {
          const label = g === "m" ? "No masculino" : "No feminino";
          const isActive = selected === g;
          return (
            <button
              key={g}
              onClick={() => handleSelect(g)}
              disabled={saving}
              className={[
                "flex-1 py-5 rounded-2xl border-2 text-sm font-medium transition-all",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50",
                saving && !isActive ? "opacity-40" : "",
              ].join(" ")}
            >
              {saving && isActive ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                label
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
