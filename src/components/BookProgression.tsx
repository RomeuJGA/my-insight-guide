import { BookMarked } from "lucide-react";

const BookProgression = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-soft">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="p-10 md:p-16 rounded-3xl bg-card border border-border/60 shadow-soft text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <BookMarked className="w-6 h-6 text-primary" strokeWidth={1.75} />
            </div>
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Caminho</p>
            <h2 className="font-serif text-3xl md:text-5xl text-balance mb-8 leading-[1.1]">
              Alguns caminhos revelam-se com o tempo.
            </h2>
            <div className="space-y-5 text-lg text-foreground/80 leading-relaxed text-balance max-w-xl mx-auto">
              <p>Cada mensagem conta.</p>
              <p>
                Ao longo do tempo, poderá desbloquear acesso a uma edição especial do livro que reúne estas mensagens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookProgression;
