## Problema

Todos os botões da landing page que deveriam levar à **aquisição de créditos** (`Hero`, `FinalCta`, `Pricing` e respetivas variantes A) apontam atualmente para `href="#experience"`.

A secção `#experience` (`src/components/Experience.tsx`) é o ecrã de **escolher / receber a mensagem do dia** — só revela o `Paywall` *depois* do utilizador ter tentado destrancar uma mensagem sem créditos. Por isso, ao clicar em "Adquirir créditos" o utilizador é levado para o seletor de mensagem, não para o paywall.

O `Paywall` real (com pacotes 5/10/20) já vive em dois sítios:
- Embebido em `Experience.tsx` (atrás do fluxo de revelar mensagem)
- Em `/credits` (`src/pages/Credits.tsx`), através do botão **"Comprar"** que faz `setShowPaywall(true)`

## Solução

Encaminhar os CTAs de compra para `/credits` e abrir o paywall automaticamente.

### 1. Página `/credits` — abrir paywall via query string

Em `src/pages/Credits.tsx`:
- Ler `?buy=1` (ou hash `#comprar`) no `useEffect` inicial.
- Se presente e o utilizador estiver autenticado, fazer `setShowPaywall(true)` e fazer scroll suave até ao paywall.
- Se não autenticado, redirecionar para `/auth?redirect=/credits?buy=1` (padrão já usado no projeto, confirmar em `Auth.tsx`).

### 2. Atualizar todos os CTAs de "adquirir créditos"

Trocar `href="#experience"` por `to="/credits?buy=1"` (usando `Link` do `react-router-dom`) nos seguintes ficheiros, **apenas** nos botões cuja intenção textual é comprar créditos (manter `#experience` em CTAs cuja intenção é "experimentar a mensagem grátis"):

- `src/components/Pricing.tsx` (linha 82)
- `src/components/_variantA/PricingA.tsx` (linha 82)
- `src/components/FinalCta.tsx` (linha 18) — rever copy do botão
- `src/components/_variantA/FinalCtaA.tsx` (linha 18) — rever copy do botão
- `src/components/Hero.tsx` / `HeroA.tsx` — **manter** `#experience` (CTA primário continua a ser "receber mensagem grátis"), só alterar se houver botão secundário de compra

Para cada alteração, trocar `<a href=...>` por `<Link to=...>` e remover/ajustar o evento `track("click_receive_message", ...)` para `track("click_buy_credits", { source: ... })` quando aplicável.

### 3. Confirmação visual

Após mudança, ao clicar em qualquer CTA de "Adquirir créditos" / "Comprar" na landing:
- Utilizador autenticado → vai direto para `/credits` com o paywall já aberto e scrollado.
- Utilizador não autenticado → passa por `/auth` e regressa a `/credits?buy=1`.

## Notas técnicas

- `Link` de `react-router-dom` já é usado em `Navbar.tsx`, mantendo consistência.
- O parâmetro `?buy=1` é limpo do URL com `navigate("/credits", { replace: true })` após abrir o paywall, para evitar reabrir em refresh.
- Não são necessárias alterações no backend nem no `Paywall.tsx`.
