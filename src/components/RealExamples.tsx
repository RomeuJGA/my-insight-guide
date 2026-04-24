import { useState } from "react";
import { ArrowRight, ChevronDown, Quote } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Example = {
  situation: string;
  number: number;
  message: string;
  interpretation: string;
};

const examples: Example[] = [
  {
    situation:
      "Sinto que tenho de tomar uma decisão importante na minha vida, mas estou bloqueado. Dou voltas e mais voltas e acabo sempre por não avançar.",
    number: 84,
    message:
      "A perfeição, minha amiga, é apenas uma ilusão. Tenho certeza de que já ouviste isto antes, até mesmo que desejas ser perfeita. No entanto, devo te dizer que jamais alcançarás a perfeição, nem encontrarás a perfeição aqui embaixo. Enquanto estiveres neste mundo, viverás, sentirás e amarás sob o manto da imperfeição. E sabes porquê? Porque esse é o teu maior desafio, um desafio que vem de vidas passadas. Agora é o momento certo para que essa realidade deixe de te definir, para que a tua alma finalmente seja libertada de todos os dogmas e crenças que adquiriste ao longo do tempo e que ainda governam a tua vida, atraindo perdas, desilusões e frustrações. Deixa a culpa ir embora, aprende a ser como as crianças, a brincar, a errar com amor. Aprende a errar com classe. Errar é a única maneira na matéria de nos fazer ver a Luz. Errar é e sempre será o maior desafio de qualquer ser vivente ou não, aí em baixo na terra.",
    interpretation:
      "Esta mensagem não responde diretamente à decisão. Mas aponta para um padrão claro: a procura pela perfeição pode estar a impedir qualquer avanço. O tom pode parecer direto — e isso acontece muitas vezes quando a mensagem toca num ponto importante. A questão não é concordar ou discordar de imediato, mas refletir: onde é que a necessidade de fazer tudo 'certo' pode estar a bloquear a sua vida?",
  },
  {
    situation:
      "Há uma relação na minha vida que me está a desgastar. Não sei se devo insistir ou se já devia ter seguido em frente.",
    number: 312,
    message:
      "Sim, eu sei que sofres e sofres muito. Reconheço que não mereces esse sofrimento, mas é importante que compreendas que és tu quem te priva demasiado e te maltratas. Compreendo que não te perdoes, que haja algo no teu passado que te atormente. Hoje, liberta-te aqui, fala sobre isso, sem medo ou julgamento, e verás a tua Alma e vida renascerem das cinzas. Não te condeno, apenas amo, mas também sei que enquanto não soltares essa culpa, tudo ficará distorcido e aprisionado. Este é o grande objetivo deste ano na tua vida. Renascerás das cinzas, perdoa-te a ti mesmo e recriarás a tua história, a tua vida. Tudo será novo. Estás preparado para isso?",
    interpretation:
      "Esta mensagem não fala diretamente da outra pessoa — fala de si. Aponta para algo mais profundo: culpa, dificuldade em perdoar-se, ou algo não resolvido. Quando isso está presente, todas as relações ficam distorcidas. A mensagem não pede uma decisão imediata. Pede primeiro um trabalho interno: o que ainda não foi perdoado dentro de si?",
  },
  {
    situation:
      "Sinto-me insatisfeito com o meu trabalho, mas também tenho medo de mudar. Parece que estou preso entre o conforto e a vontade de fazer algo diferente.",
    number: 149,
    message:
      "“Ai meu Deus”, dizes tu em voz alta, “o que se passa comigo? Com a minha vida?”. Não imaginas o quanto eu desejo ver-te bem, feliz e realizada. Vejo o teu esforço, a tua tentativa de melhorar as coisas e, então, a vida vem e para-te, para-te porque, como já ouviste, por alguma razão, algo muito maior do que poderias imaginar. Isso pode ser por uma boa razão, uma comunicação entre nós, o universo e a tua Alma. Pensa nisso.",
    interpretation:
      "Esta mensagem não fala de mudar ou não mudar — fala de pausa. Às vezes, quando tudo parece parado, não é bloqueio, é preparação. A mensagem sugere algo importante: e se este momento não for um erro, mas uma fase necessária? Antes de agir, pode ser essencial compreender o que esta fase lhe está a tentar mostrar.",
  },
];

const ExampleCard = ({ example, index }: { example: Example; index: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-3xl bg-gradient-card border border-border/60 shadow-soft hover:shadow-elegant transition-smooth overflow-hidden">
      <div className="p-7 md:p-9">
        <div className="flex items-start justify-between gap-4 mb-6">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            Exemplo {index + 1}
          </span>
          <span className="font-serif text-3xl text-primary leading-none">{example.number}</span>
        </div>

        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Situação
          </p>
          <p className="text-foreground/85 leading-[1.7] italic">"{example.situation}"</p>
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="w-full group flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-background/60 border border-border/60 hover:border-primary/40 transition-smooth">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Quote className="w-4 h-4 text-primary/60" strokeWidth={1.75} />
              {open ? "Ocultar mensagem" : "Ler mensagem"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="mt-4 p-6 rounded-2xl bg-gradient-message border border-border/50">
              <p className="font-serif text-base md:text-lg leading-[1.8] text-foreground/90 whitespace-pre-line">
                {example.message}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-6 pt-6 border-t border-border/60">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
            Interpretação
          </p>
          <p className="text-foreground/80 leading-[1.75]">{example.interpretation}</p>
        </div>
      </div>
    </article>
  );
};

const RealExamples = () => {
  return (
    <section id="examples" className="py-24 md:py-32 bg-gradient-soft">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">
            Exemplos reais
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-4 leading-[1.1]">
            Um exemplo real de como funciona
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Estas mensagens não dão respostas diretas. Funcionam como um espelho para ajudar a ver
            com mais clareza.
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid gap-6 md:gap-8">
          {examples.map((ex, i) => (
            <ExampleCard key={ex.number} example={ex} index={i} />
          ))}
        </div>

        <div className="mt-14 md:mt-16 text-center">
          <p className="font-serif text-2xl md:text-3xl text-foreground/90 mb-6">
            Agora é a sua vez.
          </p>
          <a
            href="#experience"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium shadow-elegant hover:shadow-glow transition-smooth"
          >
            Receber a minha mensagem
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default RealExamples;
