import LegalLayout from "@/components/LegalLayout";
import Disclaimer from "@/components/Disclaimer";

const cellCls = "border border-border/60 p-2 text-left align-top";
const headCls = "border border-border/60 p-2 text-left align-top font-medium";

const Privacy = () => (
  <LegalLayout title="Política de Privacidade" updated="27 de abril de 2026">
    <Disclaimer />

    <section>
      <h2 className="font-serif text-2xl mt-2 mb-3">1. Responsável pelo Tratamento</h2>
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
      <p className="mt-3">
        O responsável pelo tratamento não designou Encarregado de Proteção de Dados
        (DPO), por não preencher os critérios de obrigatoriedade previstos no artigo 37.º
        do RGPD. Para qualquer questão relativa à privacidade, contactar o endereço acima
        indicado.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">2. Dados Pessoais Recolhidos</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className={headCls}>Categoria</th>
              <th className={headCls}>Dados concretos</th>
              <th className={headCls}>Origem</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cellCls}><strong>Identificação e contacto</strong></td>
              <td className={cellCls}>Nome (opcional), endereço de email</td>
              <td className={cellCls}>Fornecidos pelo utilizador no registo</td>
            </tr>
            <tr>
              <td className={cellCls}><strong>Autenticação</strong></td>
              <td className={cellCls}>Hash de password (nunca em texto claro); tokens de sessão Google OAuth (se utilizado)</td>
              <td className={cellCls}>Gerados automaticamente</td>
            </tr>
            <tr>
              <td className={cellCls}><strong>Dados de utilização</strong></td>
              <td className={cellCls}>Histórico de mensagens reveladas, saldo de créditos, histórico de transações</td>
              <td className={cellCls}>Gerados pela utilização do serviço</td>
            </tr>
            <tr>
              <td className={cellCls}><strong>Dados de pagamento</strong></td>
              <td className={cellCls}>Referência Multibanco gerada, montante, data e estado do pagamento</td>
              <td className={cellCls}>Gerados pelo processo de compra</td>
            </tr>
            <tr>
              <td className={cellCls}><strong>Dados de navegação</strong></td>
              <td className={cellCls}>Variante A/B armazenada em localStorage; eventos de analytics internos (tipo de evento, timestamp, metadados de interação)</td>
              <td className={cellCls}>Gerados automaticamente</td>
            </tr>
            <tr>
              <td className={cellCls}><strong>Logs de infraestrutura</strong></td>
              <td className={cellCls}>Endereços IP e logs de acesso ao servidor</td>
              <td className={cellCls}>Registados automaticamente pela infraestrutura</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        <strong>Não são recolhidos</strong> dados de categorias especiais (artigo 9.º do
        RGPD), dados de crianças com menos de 16 anos, nem dados bancários do utilizador
        (os pagamentos são processados diretamente pela IfthenPay).
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">3. Finalidades e Bases Legais</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className={headCls}>Finalidade</th>
              <th className={headCls}>Base legal (RGPD, art. 6.º)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cellCls}>Prestação do serviço (autenticação, gestão de créditos, revelação de mensagens)</td>
              <td className={cellCls}>Execução de contrato — al. b)</td>
            </tr>
            <tr>
              <td className={cellCls}>Processamento de pagamentos e emissão de comprovativos</td>
              <td className={cellCls}>Execução de contrato — al. b)</td>
            </tr>
            <tr>
              <td className={cellCls}>Cumprimento de obrigações legais (fiscais, contabilísticas)</td>
              <td className={cellCls}>Obrigação legal — al. c)</td>
            </tr>
            <tr>
              <td className={cellCls}>Segurança, prevenção de fraude e logs de infraestrutura</td>
              <td className={cellCls}>Interesse legítimo — al. f)</td>
            </tr>
            <tr>
              <td className={cellCls}>Analytics interno de comportamento na Plataforma (eventos anónimos/pseudonimizados)</td>
              <td className={cellCls}>Interesse legítimo — al. f)</td>
            </tr>
            <tr>
              <td className={cellCls}>Envio de comunicações transacionais (confirmações de compra, verificação de email)</td>
              <td className={cellCls}>Execução de contrato — al. b)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">4. Prazos de Conservação</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className={headCls}>Dados</th>
              <th className={headCls}>Prazo de conservação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cellCls}>Dados de conta (email, saldo, histórico)</td>
              <td className={cellCls}>Enquanto a conta estiver ativa + 3 anos após encerramento</td>
            </tr>
            <tr>
              <td className={cellCls}>Registos de pagamento e transações</td>
              <td className={cellCls}>10 anos (obrigação legal fiscal — artigo 123.º do CIRC)</td>
            </tr>
            <tr>
              <td className={cellCls}>Logs de infraestrutura (IPs, logs)</td>
              <td className={cellCls}>30 dias</td>
            </tr>
            <tr>
              <td className={cellCls}>Eventos de analytics internos</td>
              <td className={cellCls}>24 meses</td>
            </tr>
            <tr>
              <td className={cellCls}>Dados de sessão / tokens de autenticação</td>
              <td className={cellCls}>Até expiração da sessão ou revogação</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">5. Subprocessadores</h2>
      <p>
        O responsável recorre aos seguintes subprocessadores para a prestação do serviço:
      </p>
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className={headCls}>Subprocessador</th>
              <th className={headCls}>Função</th>
              <th className={headCls}>Localização</th>
              <th className={headCls}>Garantias</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cellCls}><strong>Lovable</strong></td>
              <td className={cellCls}>Hosting da aplicação web</td>
              <td className={cellCls}>UE/EEE</td>
              <td className={cellCls}>Contrato de subprocessamento</td>
            </tr>
            <tr>
              <td className={cellCls}><strong>Supabase, Inc.</strong></td>
              <td className={cellCls}>Base de dados, autenticação, funções serverless</td>
              <td className={cellCls}>UE (região escolhida)</td>
              <td className={cellCls}>DPA disponível; cláusulas contratuais-tipo UE</td>
            </tr>
            <tr>
              <td className={cellCls}><strong>IfthenPay, Lda.</strong></td>
              <td className={cellCls}>Processamento de pagamentos (Multibanco / MBWay)</td>
              <td className={cellCls}>Portugal</td>
              <td className={cellCls}>Entidade regulada pelo Banco de Portugal</td>
            </tr>
            <tr>
              <td className={cellCls}><strong>Google LLC</strong></td>
              <td className={cellCls}>Autenticação OAuth (opcional, só se o utilizador optar)</td>
              <td className={cellCls}>EUA</td>
              <td className={cellCls}>Cláusulas contratuais-tipo; EU-US Data Privacy Framework</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        Nenhum dos subprocessadores acima é autorizado a utilizar os dados pessoais dos
        utilizadores para fins próprios.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">6. Transferências Internacionais</h2>
      <p>
        6.1 Os dados são tratados preferencialmente dentro do Espaço Económico Europeu
        (EEE).
      </p>
      <p className="mt-3">
        6.2 No caso da Google LLC (autenticação OAuth), os dados podem ser transferidos
        para os EUA ao abrigo do <strong>EU-US Data Privacy Framework</strong> (Decisão de
        Adequação da Comissão Europeia, julho de 2023), que assegura um nível de proteção
        equivalente ao do RGPD.
      </p>
      <p className="mt-3">
        6.3 Não são efetuadas outras transferências internacionais de dados pessoais.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">7. Cookies e Armazenamento Local</h2>
      <p>
        7.1 A Plataforma <strong>não utiliza cookies de rastreamento ou publicidade de
        terceiros</strong>.
      </p>
      <p className="mt-3">7.2 São utilizados os seguintes mecanismos de armazenamento local:</p>
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className={headCls}>Mecanismo</th>
              <th className={headCls}>Finalidade</th>
              <th className={headCls}>Duração</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cellCls}><strong>localStorage</strong> — variante A/B</td>
              <td className={cellCls}>Manter consistência da experiência de utilizador entre visitas</td>
              <td className={cellCls}>Até limpeza manual pelo utilizador</td>
            </tr>
            <tr>
              <td className={cellCls}>Cookies de sessão de autenticação</td>
              <td className={cellCls}>Autenticação e manutenção de sessão</td>
              <td className={cellCls}>Duração da sessão / conforme configuração de expiração</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        7.3 Por não serem utilizados cookies de terceiros nem cookies de rastreamento,
        não é apresentado banner de consentimento de cookies, em conformidade com as
        orientações da CNPD e da Lei n.º 41/2004 (com as alterações introduzidas pela Lei
        n.º 46/2012).
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">8. Direitos do Titular dos Dados</h2>
      <p>
        Nos termos dos artigos 15.º a 22.º do RGPD, o utilizador tem direito a:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li><strong>Acesso</strong> — obter confirmação sobre os dados tratados e cópia dos mesmos;</li>
        <li><strong>Retificação</strong> — corrigir dados inexatos ou incompletos;</li>
        <li><strong>Apagamento («direito a ser esquecido»)</strong> — solicitar a eliminação dos dados, salvo obrigações legais de conservação;</li>
        <li><strong>Limitação do tratamento</strong> — em determinadas circunstâncias previstas no artigo 18.º do RGPD;</li>
        <li><strong>Portabilidade</strong> — receber os dados num formato estruturado e legível por máquina;</li>
        <li><strong>Oposição</strong> — opor-se ao tratamento baseado em interesse legítimo;</li>
        <li><strong>Não sujeição a decisões automatizadas</strong> — o serviço não utiliza tomada de decisão automatizada com efeitos jurídicos significativos.</li>
      </ul>
      <p className="mt-3">
        Para exercer qualquer destes direitos, o utilizador deve enviar pedido para{" "}
        <a href="mailto:suporte@umavatar.pt" className="underline hover:text-foreground">
          suporte@umavatar.pt
        </a>
        , identificando-se e indicando o direito que pretende exercer. O responsável
        responderá no prazo de <strong>30 dias</strong> (prorrogável por mais 60 dias em
        casos complexos, com notificação ao titular).
      </p>
      <p className="mt-3">
        O utilizador tem ainda o direito de apresentar reclamação à autoridade de
        controlo competente, a <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong>:{" "}
        <a
          href="https://www.cnpd.pt"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          www.cnpd.pt
        </a>
        .
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">9. Segurança</h2>
      <p>
        O responsável adota medidas técnicas e organizativas adequadas para proteger os
        dados pessoais, incluindo:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>Comunicações cifradas via HTTPS/TLS;</li>
        <li>Passwords armazenadas exclusivamente sob hash (bcrypt via sistema de autenticação);</li>
        <li>Controlo de acesso por Row Level Security (RLS) na base de dados;</li>
        <li>Acesso administrativo restrito a utilizadores com role <code>admin</code>.</li>
      </ul>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">10. Alterações à Política de Privacidade</h2>
      <p>
        Alterações materiais a esta Política serão comunicadas por email com antecedência
        mínima de 15 dias. A versão em vigor é sempre a publicada na Plataforma com a
        data de atualização indicada no topo.
      </p>
    </section>
  </LegalLayout>
);

export default Privacy;
