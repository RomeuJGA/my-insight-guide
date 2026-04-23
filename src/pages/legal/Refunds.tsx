import LegalLayout from "@/components/LegalLayout";
import Disclaimer from "@/components/Disclaimer";
import { AlertCircle } from "lucide-react";

const Refunds = () => (
  <LegalLayout title="Política de Reembolso">
    <Disclaimer />

    <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 not-prose">
      <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-foreground mb-1">Resumo</p>
        <p className="text-sm text-muted-foreground">
          A Lumen é um produto digital. Os créditos são consumidos no momento da
          utilização. <strong className="text-foreground">Não são efetuados reembolsos
          após a revelação de uma mensagem.</strong>
        </p>
      </div>
    </div>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">1. Natureza Digital do Produto</h2>
      <p>
        Os créditos adquiridos na Lumen destinam-se ao acesso imediato a conteúdo
        digital (mensagens). Trata-se de um produto digital, fornecido em formato
        imaterial e não em suporte físico.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">2. Consumo de Créditos</h2>
      <p>
        Cada mensagem paga revelada consome 1 (um) crédito do saldo do utilizador. O
        consumo ocorre no momento exato da revelação da mensagem.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">3. Renúncia ao Direito de Livre Resolução</h2>
      <p>
        Nos termos do artigo 17.º, n.º 1, alínea m), do Decreto-Lei n.º 24/2014, o
        utilizador <strong>renuncia expressamente ao direito de livre resolução</strong>{" "}
        no momento em que utiliza um crédito para revelar uma mensagem, uma vez que o
        fornecimento de conteúdo digital se inicia com o seu consentimento prévio.
      </p>
      <p className="mt-3">
        <strong className="text-foreground">
          Não são efetuados reembolsos relativos a créditos já consumidos ou a mensagens
          já reveladas.
        </strong>
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">4. Créditos Não Utilizados</h2>
      <p>
        Em situações excecionais (erro técnico comprovado da plataforma que tenha
        impedido a utilização do crédito), podemos avaliar pedidos de reembolso parcial
        relativos a créditos não utilizados, no prazo de 14 dias após a compra.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">5. Pagamentos Duplicados</h2>
      <p>
        Caso seja debitado em duplicado por erro técnico, o utilizador deve contactar-nos
        imediatamente. Após confirmação, será efetuado o reembolso integral do valor
        duplicado.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">6. Como Solicitar</h2>
      <p>
        Pedidos de análise devem ser enviados através dos canais de contacto da
        plataforma, indicando o endereço de email da conta e a referência da transação.
      </p>
    </section>
  </LegalLayout>
);

export default Refunds;
