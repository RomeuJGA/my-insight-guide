import LegalLayout from "@/components/LegalLayout";
import Disclaimer from "@/components/Disclaimer";
import { AlertCircle } from "lucide-react";

const Refunds = () => (
  <LegalLayout title="Política de Reembolsos" updated="27 de abril de 2026">
    <Disclaimer />

    <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 not-prose">
      <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-foreground mb-1">Resumo</p>
        <p className="text-sm text-muted-foreground">
          A Um Ävatar é um produto digital. Os créditos são consumidos no momento da
          revelação da mensagem.{" "}
          <strong className="text-foreground">
            Créditos já utilizados não são reembolsáveis. Créditos não utilizados são
            reembolsáveis nos 14 dias após a compra.
          </strong>
        </p>
      </div>
    </div>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">1. Identificação do Vendedor</h2>
      <p>
        <strong>Romeu Jorge Gomes Abreu</strong>
        <br />
        NIF: 227 456 483
        <br />
        Rua Cristóvão Pinho Queimado 33, P3, E12 – 3800-012 Aveiro, Portugal
        <br />
        Email:{" "}
        <a href="mailto:suporte@umavatar.pt" className="underline hover:text-foreground">
          suporte@umavatar.pt
        </a>
        <br />
        Telefone: 234 386 003
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">2. Natureza do Produto</h2>
      <p>
        O serviço <strong>umavatar.pt</strong> fornece <strong>conteúdo digital</strong>{" "}
        (mensagens de orientação e reflexão) entregue imediatamente em ambiente online,
        mediante a utilização de créditos previamente adquiridos. Não existe subscrição
        periódica — os pagamentos são avulsos, por pacote de créditos.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">3. Direito de Livre Resolução — Regra Geral</h2>
      <p>
        Nos termos do artigo 10.º do Decreto-Lei n.º 24/2014, de 14 de fevereiro, o
        consumidor dispõe, em regra, de <strong>14 dias</strong> a contar da data de
        celebração do contrato para exercer o direito de livre resolução, sem
        necessidade de indicar qualquer motivo e sem penalização.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">
        4. Perda do Direito de Livre Resolução — Conteúdo Digital Executado
      </h2>
      <p>
        4.1 Em conformidade com o <strong>artigo 17.º, n.º 2, alínea m) do DL 24/2014</strong>,
        o direito de livre resolução <strong>não se aplica</strong> quando:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>o fornecimento de conteúdo digital não seja efetuado num suporte material;</li>
        <li>a execução tenha sido iniciada com o <strong>consentimento prévio e expresso</strong> do consumidor; e</li>
        <li>o consumidor tenha <strong>reconhecido que perde o direito de livre resolução</strong>.</li>
      </ul>
      <p className="mt-3">
        4.2 No <strong>umavatar.pt</strong>, cada vez que o utilizador clica para
        revelar uma mensagem paga, é apresentada uma confirmação explícita de que:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>está a iniciar imediatamente o acesso ao conteúdo digital;</li>
        <li>reconhece a perda do direito de livre resolução relativamente a esse crédito.</li>
      </ul>
      <p className="mt-3">
        4.3 Por conseguinte, <strong>os créditos já utilizados em revelações de mensagens
        não são reembolsáveis</strong>, exceto nos casos previstos na cláusula 6 (falha
        técnica imputável ao serviço).
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">5. Reembolso de Créditos Não Utilizados</h2>
      <p>
        5.1 Os créditos adquiridos e <strong>ainda não utilizados</strong> (não aplicados
        em nenhuma revelação de mensagem) podem ser reembolsados mediante pedido enviado
        para{" "}
        <a href="mailto:suporte@umavatar.pt" className="underline hover:text-foreground">
          suporte@umavatar.pt
        </a>
        , nas seguintes condições:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>O pedido deve ser apresentado <strong>no prazo de 14 dias</strong> a contar da data de compra do pacote;</li>
        <li>O utilizador deve indicar o email associado à conta e o pacote que pretende reembolsar.</li>
      </ul>
      <p className="mt-3">
        5.2 O reembolso será efetuado pelo <strong>mesmo meio de pagamento utilizado na
        compra</strong> (transferência para a conta bancária associada ao pagamento
        Multibanco / MBWay, consoante o caso), no prazo máximo de <strong>14 dias</strong>{" "}
        após a confirmação do pedido.
      </p>
      <p className="mt-3">
        5.3 Findo o prazo de 14 dias após a compra, os créditos não utilizados não são
        automaticamente reembolsáveis, sem prejuízo do disposto na cláusula 6.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">6. Reembolso por Falha Técnica</h2>
      <p>
        6.1 Se, por motivo técnico imputável ao serviço, o utilizador perder créditos sem
        que a mensagem tenha sido efetivamente revelada e registada no seu histórico, o
        prestador compromete-se a:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>repor os créditos debitados indevidamente; ou</li>
        <li>reembolsar o valor correspondente, a pedido do utilizador.</li>
      </ul>
      <p className="mt-3">
        6.2 Pedidos de reembolso por falha técnica devem ser enviados para{" "}
        <a href="mailto:suporte@umavatar.pt" className="underline hover:text-foreground">
          suporte@umavatar.pt
        </a>
        , descrevendo o problema e indicando a data e hora aproximadas da ocorrência. O
        prestador responderá no prazo de <strong>5 dias úteis</strong>.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">7. Encerramento de Conta e Cessação do Serviço</h2>
      <p>
        7.1 Se o utilizador solicitar o encerramento da sua conta e possuir créditos não
        utilizados, pode solicitar o reembolso do valor correspondente, sem limite de
        prazo, enviando pedido para{" "}
        <a href="mailto:suporte@umavatar.pt" className="underline hover:text-foreground">
          suporte@umavatar.pt
        </a>
        .
      </p>
      <p className="mt-3">
        7.2 Em caso de cessação do serviço por iniciativa do prestador, todos os
        créditos não utilizados serão reembolsados automaticamente no prazo de 30 dias,
        pelo meio de pagamento original ou, se impossível, por transferência bancária.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">8. Como Apresentar um Pedido de Reembolso</h2>
      <ol className="list-decimal pl-6 space-y-2 mt-2">
        <li>
          Envie email para{" "}
          <a href="mailto:suporte@umavatar.pt" className="underline hover:text-foreground">
            suporte@umavatar.pt
          </a>{" "}
          com o assunto «Pedido de Reembolso»;
        </li>
        <li>Indique o email associado à sua conta no umavatar.pt;</li>
        <li>Descreva o motivo do pedido (resolução no prazo legal, falha técnica, encerramento de conta);</li>
        <li>Aguarde resposta no prazo de <strong>5 dias úteis</strong>.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">9. Resolução Alternativa de Litígios</h2>
      <p>
        Em caso de litígio relativo a esta Política, o consumidor pode recorrer às
        seguintes entidades de resolução alternativa de litígios (RAL):
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>
          <strong>CNIACC</strong> — Centro Nacional de Informação e Arbitragem de
          Conflitos de Consumo:{" "}
          <a
            href="https://www.arbitragemdeconsumo.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            www.arbitragemdeconsumo.org
          </a>
        </li>
        <li>
          <strong>Plataforma europeia de resolução de litígios em linha (ODR):</strong>{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            https://ec.europa.eu/consumers/odr
          </a>
        </li>
      </ul>
    </section>
  </LegalLayout>
);

export default Refunds;
