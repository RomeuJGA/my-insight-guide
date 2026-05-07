// Edge Middleware: serves static HTML to bots that cannot execute JavaScript.
// Normal browser traffic passes through untouched.

const BOT_UA =
  /bot|spider|crawl|perplexity|gptbot|chatgpt-user|claudebot|anthropic|bingbot|googlebot|slurp|duckduckbot|facebot|ia_archiver|semrushbot|ahrefsbot|mj12bot|screaming.frog/i;

const STATIC_HTML = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ponto Cego — Ver com mais clareza por dentro</title>
  <meta name="description" content="Baseado no trabalho real de uma terapeuta que acompanha diariamente processos de mudança profunda. Escolha um número e receba uma mensagem que o ajuda a ver com clareza aquilo que tem evitado." />
  <link rel="canonical" href="https://www.pontocego.pt/" />
  <meta property="og:title" content="Ponto Cego — Ver com mais clareza por dentro" />
  <meta property="og:description" content="Mensagens de reflexão baseadas em prática terapêutica real. Não dão respostas — dão clareza." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.pontocego.pt/" />
</head>
<body>

<header>
  <nav>
    <a href="/">Ponto Cego</a>
    <ul>
      <li><a href="/#how">Como funciona</a></li>
      <li><a href="/#experience">Experiência</a></li>
      <li><a href="/#pricing">Preços</a></li>
    </ul>
  </nav>
</header>

<main>

  <section id="hero">
    <p>Ver com mais clareza por dentro</p>
    <h1>Nem tudo o que evita pensar… é por acaso.</h1>
    <p>Baseado no trabalho real de uma terapeuta que acompanha diariamente processos de mudança profunda.</p>
    <p>Escolha um número entre 1 e 534 e receba uma mensagem que pode ajudá-lo a ver com mais clareza aquilo que tem evitado.</p>
    <p>Algumas mensagens podem ser diretas ou desafiantes. O objetivo não é agradar, mas ajudar a ver com honestidade.</p>
    <p><em>Baseado no livro "Eu Sei o que Estás a Pensar"</em></p>
    <a href="/#experience">Receber uma mensagem</a>
    <a href="/#how">Como funciona</a>
  </section>

  <section id="how">
    <h2>Como funciona</h2>
    <h3>Três passos simples para uma nova perspetiva</h3>
    <ol>
      <li>
        <h4>Pense numa situação da sua vida</h4>
        <p>Centre-se naquilo que está a viver, a evitar ou a tentar compreender.</p>
      </li>
      <li>
        <h4>Escolha um número</h4>
        <p>Confie na sua intuição. Não existe escolha certa ou errada.</p>
      </li>
      <li>
        <h4>Receba uma mensagem</h4>
        <p>Leia com calma. Deixe-a assentar antes de tirar conclusões.</p>
      </li>
    </ol>
    <p><em>Não é uma resposta direta. É um espelho.</em></p>
  </section>

  <section id="experience">
    <h2>Experiência</h2>
    <p>Pause por um momento. Pense numa questão. Escolha o número que sentir.</p>
    <p>534 mensagens únicas, escritas a partir de prática terapêutica real. Cada mensagem foi criada para provocar reflexão honesta.</p>
    <p>Pode também formular a questão que quer ver respondida antes de escolher o número. Fica guardada em privado, apenas para si.</p>
  </section>

  <section id="pricing">
    <h2>Preços</h2>
    <p>Sem subscrições. Adquira créditos quando precisar.</p>
    <ul>
      <li>Cada crédito permite revelar uma mensagem à sua escolha.</li>
      <li>As mensagens reveladas ficam guardadas no seu histórico, sem prazo.</li>
      <li>Pode rever qualquer mensagem do histórico sem gastar créditos.</li>
      <li>A primeira mensagem é gratuita após confirmação de email.</li>
    </ul>
  </section>

  <section id="about">
    <h2>Quem está por detrás</h2>
    <p>O Ponto Cego é uma ferramenta de reflexão baseada no trabalho real de uma terapeuta com anos de consulta ativa. As mensagens não são aforismos genéricos — emergem de padrões reais observados em processos de mudança profunda.</p>
    <p>Esta ferramenta destina-se a reflexão pessoal e não substitui aconselhamento profissional psicológico, médico, jurídico ou financeiro.</p>
  </section>

  <section id="trust">
    <h2>O que dizem quem já experimentou</h2>
    <p>Utilizadores partilham que o Ponto Cego os ajuda a ganhar clareza sobre situações que tinham dificuldade em ver com objetividade.</p>
  </section>

  <section id="faq">
    <h2>Perguntas frequentes</h2>
    <dl>
      <dt>O que é o Ponto Cego?</dt>
      <dd>Uma ferramenta de reflexão pessoal com 534 mensagens únicas, baseadas em prática terapêutica real. Escolhe um número e recebe uma mensagem que pode ajudá-lo a ver com mais clareza aquilo que tem evitado.</dd>

      <dt>Como funcionam os créditos?</dt>
      <dd>Cada crédito permite revelar uma mensagem. Recebe um crédito gratuito ao confirmar o seu email. Pode adquirir créditos adicionais sem subscrição.</dd>

      <dt>As minhas questões são privadas?</dt>
      <dd>Sim. As questões que escreve antes de revelar uma mensagem são guardadas apenas para si. Nenhum colaborador ou administrador consegue consultá-las através da plataforma.</dd>

      <dt>Posso rever mensagens que já revelei?</dt>
      <dd>Sim, sem gastar créditos. Todas as suas mensagens reveladas ficam guardadas no histórico.</dd>

      <dt>Isto substitui terapia ou aconselhamento profissional?</dt>
      <dd>Não. O Ponto Cego é uma ferramenta de reflexão pessoal e não substitui qualquer tipo de aconselhamento profissional.</dd>

      <dt>Posso revelar a mesma mensagem mais de uma vez?</dt>
      <dd>Sim, mas gasta um crédito adicional. Se pretende reler, use o histórico em "As minhas mensagens" — gratuito.</dd>
    </dl>
  </section>

</main>

<footer>
  <p>Ponto Cego &mdash; Ver com mais clareza por dentro</p>
  <nav>
    <a href="/termos">Termos</a>
    <a href="/privacidade">Privacidade</a>
    <a href="/reembolsos">Reembolsos</a>
  </nav>
  <p>Esta ferramenta destina-se a reflexão pessoal e não substitui aconselhamento profissional.</p>
</footer>

</body>
</html>`;

export const config = {
  matcher: ["/"],
};

export default function middleware(request: Request): Response | undefined {
  const ua = request.headers.get("user-agent") ?? "";
  if (!BOT_UA.test(ua)) return undefined;

  return new Response(STATIC_HTML, {
    status: 200,
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "public, max-age=3600",
      "x-robots-tag": "index, follow",
    },
  });
}
