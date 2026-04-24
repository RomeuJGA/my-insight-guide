const Authority = () => {
  return (
    <section className="relative py-28 md:py-36 border-y border-border/60 bg-card/40 bg-noise overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[20rem] rounded-full bg-accent/[0.05] blur-3xl" />
      </div>
      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium text-accent mb-4 uppercase tracking-[0.18em]">Autoridade</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-10 leading-[1.1]">
            Isto não é entretenimento.
          </h2>
          <div className="space-y-7 text-lg md:text-xl text-foreground/80 leading-[1.7] text-balance">
            <p>
              Estas mensagens não foram criadas para serem bonitas ou reconfortantes.
            </p>
            <p>
              Foram desenvolvidas com base na experiência real de uma terapeuta que já acompanhou milhares de pessoas.
            </p>
            <p className="font-serif italic text-foreground text-xl md:text-2xl pt-4">
              Quando alguém quer realmente mudar, nem sempre precisa de conforto.
              <br />
              Precisa de <span className="text-accent">clareza</span>.
            </p>
          </div>
          <p className="mt-12 text-xs italic text-muted-foreground/80">
            Baseado no livro <span className="text-foreground/70">"Eu Sei o que Estás a Pensar"</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Authority;
