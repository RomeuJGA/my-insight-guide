import { Info } from "lucide-react";

interface DisclaimerProps {
  variant?: "default" | "compact" | "inline";
  className?: string;
}

const TEXT =
  "Esta é uma ferramenta de reflexão e inspiração pessoal. Não fornece previsões nem substitui aconselhamento profissional (médico, psicológico, financeiro ou legal).";

const Disclaimer = ({ variant = "default", className = "" }: DisclaimerProps) => {
  if (variant === "inline") {
    return (
      <p className={`text-[11px] text-muted-foreground italic leading-relaxed ${className}`}>
        {TEXT}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={`flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/60 ${className}`}
      >
        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">{TEXT}</p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl bg-muted/40 border border-border/60 ${className}`}
    >
      <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-relaxed">{TEXT}</p>
    </div>
  );
};

export default Disclaimer;
