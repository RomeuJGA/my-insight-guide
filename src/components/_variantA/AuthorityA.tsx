const AuthorityA = () => {
  return (
    <section className="py-24 md:py-32 border-y border-border/60 bg-card/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-medium text-[hsl(165_35%_28%)] mb-4 uppercase tracking-wider">Autoridade</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-8 leading-[1.1]">
            Isto não é entretenimento.
          </h2>
          <div className="space-y-6 text-lg md:text-xl text-foreground/80 leading-relaxed text-balance">
            <p>Estas mensagens não foram criadas para serem bonitas ou reconfortantes.</p>
            <p>
              Foram desenvolvidas com base na experiência real de Mónica Dell Rey, que já acompanhou milhares de pessoas.
            </p>
            <p className="font-serif italic text-foreground">
              Quando alguém quer realmente mudar, nem sempre precisa de conforto.
              <br />
              Precisa de clareza.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorityA;
