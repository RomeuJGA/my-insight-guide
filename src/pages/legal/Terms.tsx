import LegalLayout from "@/components/LegalLayout";
import Disclaimer from "@/components/Disclaimer";

const Terms = () => (
  <LegalLayout title="Termos e Condições">
    <Disclaimer />

    <section>
      <h2 className="font-serif text-2xl mt-2 mb-3">1. Aceitação dos Termos</h2>
      <p>
        Ao aceder e utilizar a Ponto Cego ("Serviço"), o utilizador aceita estes Termos e
        Condições. Se não concordar, não deve utilizar o Serviço.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">2. Natureza do Serviço</h2>
      <p>
        A Ponto Cego é uma ferramenta digital de reflexão pessoal que disponibiliza mensagens
        inspiracionais. O Serviço{" "}
        <strong>não constitui aconselhamento médico, psicológico, financeiro ou legal</strong>,
        nem oferece previsões ou diagnósticos. As mensagens devem ser interpretadas
        exclusivamente como apoio a reflexão pessoal.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">3. Conta e Elegibilidade</h2>
      <p>
        Para usufruir das funcionalidades pagas, o utilizador deve criar uma conta com um
        endereço de email válido e confirmar esse email. O utilizador é responsável por
        manter a confidencialidade das suas credenciais.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">4. Créditos e Mensagens</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Cada mensagem paga revelada consome 1 (um) crédito.</li>
        <li>
          Após a primeira revelação, a mesma mensagem pode ser visualizada novamente sem
          custo adicional, através da página "As minhas mensagens".
        </li>
        <li>
          A "Mensagem do Dia" é uma funcionalidade gratuita, atribuída uma vez por dia
          civil, e não consome créditos.
        </li>
        <li>
          Os créditos não têm valor monetário, não são transferíveis, nem reembolsáveis
          após utilização.
        </li>
      </ul>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">5. Pagamentos</h2>
      <p>
        Os pagamentos são processados através de prestadores externos. Os créditos são
        adicionados ao saldo do utilizador após confirmação do pagamento pelo banco ou
        prestador de serviços.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">6. Utilização Aceitável</h2>
      <p>
        O utilizador compromete-se a não utilizar o Serviço para fins ilícitos, a não
        tentar aceder a contas de terceiros, e a não interferir com o funcionamento da
        plataforma.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">7. Propriedade Intelectual</h2>
      <p>
        Todos os conteúdos, incluindo textos, design e marcas, são propriedade da Ponto Cego
        ou dos seus licenciadores. É proibida a reprodução não autorizada.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">8. Limitação de Responsabilidade</h2>
      <p>
        Na máxima extensão permitida por lei, a Ponto Cego não se responsabiliza por
        decisões tomadas pelo utilizador com base nos conteúdos disponibilizados. O
        Serviço é fornecido "tal como está", sem garantias de qualquer natureza.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">9. Alterações aos Termos</h2>
      <p>
        Estes Termos podem ser atualizados a qualquer momento. As alterações entram em
        vigor após publicação nesta página.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">10. Lei Aplicável</h2>
      <p>
        Estes Termos regem-se pela lei portuguesa. Qualquer litígio será dirimido pelos
        tribunais competentes em Portugal.
      </p>
    </section>
  </LegalLayout>
);

export default Terms;
