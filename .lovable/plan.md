## Atualizar páginas legais com conteúdo definitivo

Substituir o conteúdo das três páginas em `src/pages/legal/` pelos textos finais (já validados juridicamente, com identificação completa do prestador, NIF, morada, contactos e referências legais portuguesas).

### Ficheiros a editar

**1. `src/pages/legal/Terms.tsx`**
- Substituir todo o JSX por 12 secções (Identificação, Objeto, Acesso, Descrição do Serviço, Compra, Livre Resolução, PI, Obrigações, Limitação Responsabilidade, Duração, Alterações, Lei Aplicável).
- Incluir tabela de pacotes (5/10/20 créditos).
- Manter `<LegalLayout>` e `<Disclaimer>`.
- Atualizar `updated="27 de abril de 2026"`.

**2. `src/pages/legal/Privacy.tsx`**
- Substituir por 10 secções com identificação completa do responsável.
- Incluir 4 tabelas (dados recolhidos, finalidades/bases legais, prazos de conservação, subprocessadores).
- Manter `<LegalLayout>` e `<Disclaimer>`.
- Atualizar data.

**3. `src/pages/legal/Refunds.tsx`**
- Substituir por 9 secções com identificação completa do vendedor.
- Manter o bloco de resumo destacado no topo (com `AlertCircle`).
- Manter `<LegalLayout>` e `<Disclaimer>`.
- Atualizar data.

**4. `src/components/LegalLayout.tsx`**
- Alterar o default de `updated` de `"Abril 2026"` para `"27 de abril de 2026"` (consistência caso alguma página não passe a prop).

### Detalhes técnicos

- Usar elementos HTML semânticos (`<section>`, `<h2>`, `<table>`, `<ul>`) com as classes Tailwind já em uso (`font-serif text-2xl mt-6 mb-3`, `list-disc pl-6 space-y-2`).
- Para as tabelas em Privacy: usar `<table className="w-full text-sm border-collapse">` com `<thead>` e `<tbody>`, células com `border border-border/60 p-2 text-left align-top`, dentro de wrapper com `overflow-x-auto` para responsividade.
- Links externos (CNIACC, ODR, CNPD) abrem em nova aba: `target="_blank" rel="noopener noreferrer"` com `className="underline hover:text-foreground"`.
- Email `suporte@pontocego.pt` como `<a href="mailto:...">`.
- Não alterar rotas, navegação, footer nem qualquer outra parte do código.

### O que NÃO é feito neste plano

- Não se altera o texto da checkbox/aceitação no Paywall (mencionado pelo Perplexity como "já contemplado"). Se quiseres rever esse texto, dizes depois.
- Não se cria caixa de email `suporte@pontocego.pt` — isso é configuração externa do teu domínio.
