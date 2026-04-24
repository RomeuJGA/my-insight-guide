import { useMemo } from "react";
import { Compass, HelpCircle } from "lucide-react";

const EMOTIONAL_OPTIONS = [
  "Se esta mensagem lhe parece intensa, pode ser precisamente por tocar num ponto importante.",
  "Se não fizer sentido imediato, pode ser algo que ainda não está totalmente claro.",
  "Algumas mensagens tornam-se mais claras com o tempo e com a experiência.",
  "Nem sempre a compreensão surge no momento. Pode ser útil deixar esta mensagem assentar.",
];

const QUESTIONS = [
  "O que nesta mensagem lhe chama mais a atenção?",
  "Onde é que isto pode fazer sentido na sua vida?",
  "O que pode estar a evitar ver?",
  "Há algum padrão que se repete?",
  "Que parte desta mensagem lhe causa mais resistência?",
  "Se esta mensagem estivesse certa, o que mudaria?",
];

// Deterministic pseudo-random pick based on a seed so the same message
// always shows the same prompts (avoids re-rolls between renders).
const pickIndex = (seed: number, mod: number) => {
  const s = Math.abs(Math.floor(seed)) || 1;
  // simple LCG-ish hash
  return (s * 9301 + 49297) % mod;
};

const pickQuestions = (seed: number, count = 3) => {
  const pool = [...QUESTIONS];
  const out: string[] = [];
  let s = Math.abs(Math.floor(seed)) || 1;
  for (let i = 0; i < count && pool.length; i++) {
    s = (s * 1103515245 + 12345) % 2147483647;
    const idx = s % pool.length;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
};

interface ReflectionGuideProps {
  /** Stable seed (e.g. message id) so the prompts don't reshuffle on re-render. */
  seed?: number | string;
  /** How many reflection questions to show (3 or 4). */
  questionCount?: 3 | 4;
  className?: string;
}

const ReflectionGuide = ({ seed, questionCount = 3, className = "" }: ReflectionGuideProps) => {
  const numericSeed = useMemo(() => {
    if (typeof seed === "number") return seed;
    if (typeof seed === "string") {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
      return h;
    }
    return Math.floor(Math.random() * 1_000_000);
  }, [seed]);

  const emotional = EMOTIONAL_OPTIONS[pickIndex(numericSeed + 7, EMOTIONAL_OPTIONS.length)];
  const questions = useMemo(
    () => pickQuestions(numericSeed + 13, questionCount),
    [numericSeed, questionCount],
  );

  return (
    <section
      aria-labelledby="reflection-guide-title"
      className={`mt-8 p-6 md:p-8 rounded-2xl bg-muted/40 border border-border/60 animate-fade-in-up ${className}`}
    >
      <header className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Compass className="w-4 h-4 text-primary" strokeWidth={1.75} />
        </span>
        <h3
          id="reflection-guide-title"
          className="font-serif text-lg md:text-xl text-foreground"
        >
          Como refletir sobre esta mensagem
        </h3>
      </header>

      <p className="text-sm md:text-[15px] leading-relaxed text-foreground/85">
        Esta mensagem não pretende dar uma resposta direta. Pode estar a apontar para um padrão,
        comportamento ou forma de ver que influencia a sua situação.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground italic">
        {emotional}
      </p>

      <div className="mt-6 pt-5 border-t border-border/60">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Perguntas para refletir
          </p>
        </div>
        <ul className="space-y-2.5">
          {questions.map((q, i) => (
            <li
              key={q}
              className="flex gap-3 text-sm md:text-[15px] leading-relaxed text-foreground/90 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                aria-hidden
                className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0"
              />
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Future feature — intentionally hidden for now.
      <button
        type="button"
        disabled
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs text-muted-foreground opacity-60 cursor-not-allowed"
      >
        Quero ajuda para aprofundar
      </button>
      */}
    </section>
  );
};

export default ReflectionGuide;
