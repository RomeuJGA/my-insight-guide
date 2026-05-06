# Análise de Marketing — Ponto Cego
*Data: 7 de Maio de 2026*

## O produto em resumo

Escolher um número → receber uma mensagem de reflexão pessoal, baseada no livro de uma terapeuta. Tier gratuito (1 mensagem aleatória/dia) + créditos para escolher o número.

---

## O que está a funcionar bem

**1. Pratfall Effect ativo** — "Isto não é entretenimento", "algumas mensagens podem ser diretas ou desafiantes" é honestidade desarmante que aumenta credibilidade. Maioria das apps promete conforto; esta promete desconforto útil. Diferenciador real.

**2. Zeigarnik Effect no mecanismo central** — escolher um número cria um loop aberto. A pessoa fica a pensar "o que me diria o número 73?". Muito bem explorado na ExperiencePreview com a mensagem desfocada.

**3. Exemplos reais com interpretação** — o RealExamples é o melhor componente do site. Mostrar a mensagem completa + contexto + interpretação é o melhor argumento de venda. Desmistifica e converte.

**4. Sem subscrição** — reduz Regret Aversion e Status-Quo Bias. Créditos sem validade é a decisão certa para este produto.

**5. Free tier como Endowment Effect** — a mensagem diária gratuita cria hábito e investimento emocional antes da conversão paga.

---

## Problemas por ordem de impacto

### 1. A autoridade é anónima — o maior problema

"Baseado no trabalho real de **uma terapeuta**" — quem? Sem nome, sem foto, sem credenciais. O Authority Bias só funciona com identidade. Uma linha como:

> *"Criado pela terapeuta [Nome], com 12 anos de prática clínica e autora do livro 'Eu Sei o que Estás a Pensar'"*

transforma completamente a percepção do produto. Se a terapeuta não quer aparecer por razões pessoais, isso é uma restrição real — mas se puder aparecer, é o leverage de conversão mais alto do site.

### 2. Inconsistência nos números — sinal de falta de cuidado

- **HeroA**: "entre 1 e 534"
- **ValueProps**: "564 mensagens únicas"

Dois números diferentes no mesmo site. Para um utilizador que está a avaliar se confia no produto, esta inconsistência é um sinal de alerta. Escolher um número e corrigir em todo o código.

### 3. FinalCta quebra o tom

A secção tem uma copy belíssima: *"Pause. Respire. Escolha um número."* — e depois o botão diz **"Adquirir créditos"**. É uma quebra brusca de atmosfera. O utilizador está num estado contemplativo e a CTA é transacional.

Sugestão: **"Escolher o meu número"** ou **"Receber a mensagem que sinto"**.

### 4. BookProgression é vago ao ponto de ser inútil

> *"Ao longo do tempo, poderá desbloquear acesso a uma edição especial do livro."*

Sem target concreto, não existe Goal-Gradient Effect. A pessoa não sabe se falta 1 mensagem ou 100. Proposta concreta:

> *"Após revelar 10 mensagens, desbloqueia a edição especial do livro."*

Com uma barra de progresso para utilizadores autenticados. Isto transforma um componente decorativo num mecanismo de retenção real.

### 5. Bridge free → paid é demasiado suave

Depois de ler a mensagem diária gratuita, o utilizador vê um box cinzento pequeno em baixo: *"Quer receber uma mensagem específica?"*. Devia aproveitar o momento de maior engagement. Exemplo:

> *"A sua mensagem de hoje foi aleatória. Há um número que sente chamar? Use 1 crédito para o descobrir."*

Com CTA bem visível, não discreto.

### 6. "Inspiração" devalida o produto

No DailyMessage: *"Receba uma **inspiração** gratuita para o seu dia."* — o resto do site fala de clareza, de enfrentar o que se evita, de processo terapêutico. "Inspiração" é o vocabulário de app de frases motivacionais. Devia ser: *"Receba uma reflexão gratuita para o seu dia."*

### 7. Cupões de desconto criam espera

Na Pricing: *"Cupões de desconto disponíveis no checkout"* — diz ao utilizador que pode obter desconto, logo ele espera por um cupão em vez de comprar já. Se os cupões são para parceiros/influencers, não os mencionar publicamente. Se são para todos, aplicá-los directamente nos preços.

---

## Resumo de prioridades

| Impacto | Esforço | Acção |
|---------|---------|-------|
| Alto | Baixo | Corrigir número (534 vs 564) em todo o código |
| Alto | Baixo | "Adquirir créditos" → "Escolher o meu número" no FinalCta |
| Alto | Baixo | "inspiração" → "reflexão" na DailyMessage |
| Alto | Médio | Nomear + foto da terapeuta no Authority/Hero |
| Alto | Médio | BookProgression com target concreto + barra de progresso |
| Médio | Baixo | Remover menção a cupões da secção pública de preços |
| Médio | Médio | Fortalecer bridge free→paid pós-mensagem diária |

---

## Conclusão

O produto tem uma proposta genuinamente diferente e o tom está bem calibrado. Os problemas são maioritariamente de execução — não de conceito. As três correcções de baixo esforço (número, CTA, "inspiração") podem ser implementadas em menos de uma hora e têm impacto imediato na percepção de qualidade e na taxa de conversão.
