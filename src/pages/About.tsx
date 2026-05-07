import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => (
  <main className="min-h-screen bg-gradient-soft flex flex-col">
    <Navbar />
    <div className="flex-1 pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-foreground mb-3">
          Quem está por detrás do Um Ävatar
        </h1>
        <p className="text-muted-foreground text-sm mb-8">Mónica Dell Rey</p>

        <div className="mb-12 rounded-2xl overflow-hidden">
          <img
            src="/monica-praia.jpg"
            alt="Mónica Dell Rey numa praia, de braços abertos"
            className="w-full object-cover max-h-[420px]"
          />
        </div>

        <div className="prose-custom space-y-6 text-foreground/80 leading-relaxed text-base md:text-lg font-sans">
          <p>
            Hoje entendo o motivo e o tempo certo para todas as coisas. Desde criança que sempre soube que não estava só, que algo falava comigo, apenas sabia que era bom, muito gratificante, uma força que me dava poder, proteção e coragem.
          </p>
          <p>
            A minha história é igual a tantas outras histórias que conheci ao longo da vida. Conforme fui conhecendo pessoas, outras verdades, senti que era uma sortuda. Aquela história horrível de infância, afinal, era apenas mais uma história semelhante a tantas outras. Isso fez-me entender que somos programados para acreditar na perfeição, e com isto vitimizamo-nos, e não estou com isto a dizer que o sofrimento não existe, pois eu tenho uma história, uma dura história, que me levou até ao sucesso.
          </p>
          <p>
            Quando entendi que somos nós que nos prendemos ao sofrimento, comecei a ensinar grupos enormes de pessoas durante mais de 17 anos. Conheci tanto sofrimento que percebi o quanto eu era feliz e rica, o quanto tinha sido abençoada.
          </p>
          <p>
            Quanto mais gratidão sentia, mais me fiz grata, isso foi abrindo o coração e as portas para a vida.
          </p>
          <p>
            Vi muitos milagres acontecerem, que é o mesmo que dizer mudanças. Mudanças e conquistas que pareciam impossíveis aos olhos comuns. Hoje compreendo que o impossível está apenas nos nossos limites.
          </p>
          <p>
            Ao longo do tempo canalizei textos através da intuição e fui entregando a cada pessoa que se cruzou no meu caminho, e foram muitas, centenas estas que me procuraram. Compreendi que as mensagens sempre se concretizavam ou serviam de orientação.
          </p>
          <p>
            Nunca me quis expor, não por medo, mas apenas porque nunca senti essa necessidade, aliás, uma das minhas condições sempre foi muito peculiar - "se é para mim, se é o meu caminho, então que as pessoas me encontrem". E elas encontraram-me.
          </p>
          <p>
            E de lá para cá já passaram uns milhares, muita gente já passou pela minha vida e por este projeto, entre consultas médicas e de orientação. Ganhei amigos, inimigos e tudo aquilo a que tenho direito e sou rica e grata por isso.
          </p>
          <p>
            Aprendi que os outros não nos definem e assumi o comando da minha vida. Hoje, passados 20 anos, decidi finalmente partilhar essas mensagens que acalentaram corações, responsabilizaram, mas também orientaram - e são muitas, tenho centenas. Aqui decidi partilhar apenas algumas nesta fase. A ideia é usá-las através de um algoritmo potenciado pela lei da sincronicidade.
          </p>
          <p>
            Tu pensas e eu sei aquilo que tu estás a pensar, e isto pode ser uma metáfora ou não, tu decides.
          </p>
          <p className="font-serif text-xl text-foreground">
            Desafio-te a experienciar sem dependências nem expectativas, que a força que há em mim possa continuar a escrever para o mundo.
          </p>
          <p className="font-serif text-2xl text-foreground tracking-wide">Efatá.</p>
        </div>
      </div>
    </div>
    <Footer />
  </main>
);

export default About;
