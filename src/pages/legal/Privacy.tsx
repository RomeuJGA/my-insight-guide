import LegalLayout from "@/components/LegalLayout";
import Disclaimer from "@/components/Disclaimer";

const Privacy = () => (
  <LegalLayout title="Política de Privacidade">
    <Disclaimer />

    <section>
      <h2 className="font-serif text-2xl mt-2 mb-3">1. Responsável pelo Tratamento</h2>
      <p>
        A Intus é a entidade responsável pelo tratamento dos dados pessoais recolhidos
        através do Serviço, em conformidade com o Regulamento Geral de Proteção de Dados
        (RGPD).
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">2. Dados Recolhidos</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Dados de conta:</strong> endereço de email e palavra-passe
          (armazenada de forma cifrada).
        </li>
        <li>
          <strong>Dados de utilização:</strong> mensagens reveladas, datas de revelação,
          mensagem do dia atribuída.
        </li>
        <li>
          <strong>Dados de pagamento:</strong> referências de pagamento, montantes e
          estados de transação. Não armazenamos dados completos de cartões de crédito.
        </li>
      </ul>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">3. Finalidades</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Prestação do Serviço e gestão da conta do utilizador.</li>
        <li>Processamento de pagamentos e atribuição de créditos.</li>
        <li>Cumprimento de obrigações legais e fiscais.</li>
      </ul>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">4. Base Legal</h2>
      <p>
        O tratamento dos dados baseia-se na execução do contrato com o utilizador, no
        cumprimento de obrigações legais e, quando aplicável, no consentimento.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">5. Conservação</h2>
      <p>
        Os dados são conservados enquanto a conta estiver ativa e durante os prazos
        legais aplicáveis (nomeadamente fiscais), após o que serão eliminados ou
        anonimizados.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">6. Subcontratantes</h2>
      <p>
        Recorremos a prestadores de serviços que processam dados em nosso nome,
        nomeadamente para alojamento da plataforma e processamento de pagamentos. Esses
        prestadores estão obrigados contratualmente a aplicar medidas técnicas e
        organizativas adequadas.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">7. Direitos do Titular</h2>
      <p>
        O utilizador tem o direito de aceder, retificar, eliminar, opor-se ou limitar o
        tratamento dos seus dados pessoais, bem como o direito à portabilidade. Para
        exercer estes direitos, deve contactar-nos através dos canais indicados na
        plataforma.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">8. Cookies</h2>
      <p>
        Utilizamos cookies estritamente necessários para o funcionamento da sessão. Não
        utilizamos cookies de publicidade nem rastreamento de terceiros sem
        consentimento explícito.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">9. Segurança</h2>
      <p>
        Aplicamos medidas técnicas e organizativas para proteger os dados, incluindo
        cifragem em trânsito (HTTPS) e regras de acesso ao nível da base de dados (RLS).
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">10. Reclamações</h2>
      <p>
        O utilizador pode apresentar reclamações junto da Comissão Nacional de Proteção
        de Dados (CNPD) caso considere que o tratamento dos seus dados viola o RGPD.
      </p>
    </section>
  </LegalLayout>
);

export default Privacy;
