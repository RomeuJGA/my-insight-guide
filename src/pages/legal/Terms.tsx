import LegalLayout from "@/components/LegalLayout";
import Disclaimer from "@/components/Disclaimer";

const Terms = () => (
  <LegalLayout title="Termos e Condições de Utilização" updated="27 de abril de 2026">
    <Disclaimer />

    <section>
      <h2 className="font-serif text-2xl mt-2 mb-3">1. Identificação do Prestador de Serviço</h2>
      <p>
        O website <strong>pontocego.pt</strong> (doravante «Plataforma») é operado por:
      </p>
      <p className="mt-3">
        <strong>Romeu Jorge Gomes Abreu</strong>
        <br />
        NIF: 227 456 483
        <br />
        Rua Cristóvão Pinho Queimado 33, P3, E12 – 3800-012 Aveiro, Portugal
        <br />
        Email:{" "}
        <a href="mailto:suporte@pontocego.pt" className="underline hover:text-foreground">
          suporte@pontocego.pt
        </a>
        <br />
        Telefone: 234 386 003
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">2. Objeto e Âmbito</h2>
      <p>
        Os presentes Termos e Condições regulam o acesso e a utilização da Plataforma{" "}
        <strong>pontocego.pt</strong>, bem como a aquisição de créditos e a revelação de
        mensagens de orientação e reflexão (doravante «Conteúdo»), em conformidade com o
        Decreto-Lei n.º 7/2004, de 7 de janeiro (Comércio Eletrónico), e o Decreto-Lei n.º
        24/2014, de 14 de fevereiro (Contratos Celebrados à Distância).
      </p>
      <p className="mt-3">
        Ao registar-se e/ou utilizar a Plataforma, o utilizador declara ter lido,
        compreendido e aceite integralmente estes Termos.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">3. Condições de Acesso</h2>
      <p>
        3.1 A utilização da Plataforma está reservada a pessoas singulares com{" "}
        <strong>idade igual ou superior a 16 anos</strong>, em conformidade com o artigo
        16.º do Regulamento (UE) 2016/679 (RGPD) e a Lei n.º 58/2019.
      </p>
      <p className="mt-3">
        3.2 O registo exige a criação de conta com endereço de email válido e verificação
        do mesmo, ou autenticação via Google OAuth.
      </p>
      <p className="mt-3">
        3.3 O utilizador é responsável pela confidencialidade das suas credenciais de
        acesso e por toda a atividade realizada na sua conta.
      </p>
      <p className="mt-3">
        3.4 A Plataforma destina-se exclusivamente a consumidores finais no âmbito de
        relações B2C (business-to-consumer).
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">4. Descrição do Serviço</h2>
      <p>
        4.1 <strong>Mensagem diária gratuita:</strong> Cada utilizador autenticado tem
        direito a revelar uma mensagem de reflexão por dia, sem qualquer custo.
      </p>
      <p className="mt-3">
        4.2 <strong>Sistema de créditos:</strong> Para revelar mensagens adicionais além
        da mensagem diária gratuita, o utilizador adquire pacotes de créditos. Cada
        mensagem revelada consome 1 (um) crédito do saldo disponível.
      </p>
      <p className="mt-3">
        4.3 <strong>Pacotes disponíveis:</strong>
      </p>
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-border/60 p-2 text-left">Pacote</th>
              <th className="border border-border/60 p-2 text-left">Preço (IVA incluído)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border/60 p-2 align-top">5 créditos</td>
              <td className="border border-border/60 p-2 align-top">4,90 €</td>
            </tr>
            <tr>
              <td className="border border-border/60 p-2 align-top">10 créditos</td>
              <td className="border border-border/60 p-2 align-top">8,90 €</td>
            </tr>
            <tr>
              <td className="border border-border/60 p-2 align-top">20 créditos</td>
              <td className="border border-border/60 p-2 align-top">14,90 €</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        4.4 Os créditos adquiridos ficam associados à conta do utilizador e não têm prazo
        de validade, salvo encerramento da conta ou cessação do serviço nos termos da
        cláusula 10.
      </p>
      <p className="mt-3">
        4.5 As mensagens já reveladas ficam guardadas no histórico «As minhas mensagens»,
        podendo ser relidas sem consumo adicional de créditos.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">5. Processo de Compra</h2>
      <p>
        5.1 O processo de compra de créditos decorre integralmente online, através da
        Plataforma, nos termos do DL 7/2004 e do DL 24/2014.
      </p>
      <p className="mt-3">
        5.2 Antes de finalizar a compra, o utilizador visualiza o resumo do pedido
        (pacote, preço total com IVA incluído) e deve aceitar expressamente os presentes
        Termos, a Política de Privacidade e a Política de Reembolsos.
      </p>
      <p className="mt-3">
        5.3 Os pagamentos são processados via <strong>IfthenPay</strong> (Multibanco e,
        brevemente, MBWay). O prestador não armazena dados bancários do utilizador.
      </p>
      <p className="mt-3">
        5.4 A confirmação da compra é efetuada automaticamente após receção do pagamento,
        com atribuição imediata dos créditos à conta do utilizador.
      </p>
      <p className="mt-3">5.5 Todos os preços indicados incluem IVA à taxa legal em vigor.</p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">
        6. Direito de Livre Resolução — Conteúdo Digital
      </h2>
      <p>
        6.1 Nos termos do artigo 10.º do DL 24/2014, o utilizador dispõe, em regra, de um
        prazo de 14 dias para exercer o direito de livre resolução do contrato.
      </p>
      <p className="mt-3">
        6.2 <strong>Perda do direito de livre resolução:</strong> Em conformidade com o
        artigo 17.º, n.º 2, alínea m) do DL 24/2014, o utilizador reconhece expressamente,
        no momento da revelação de cada mensagem, que:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>solicita o início imediato da execução do contrato de fornecimento de conteúdo digital;</li>
        <li>perde o direito de livre resolução relativamente ao(s) crédito(s) utilizados nessa revelação.</li>
      </ul>
      <p className="mt-3">
        6.3 Esta perda aplica-se exclusivamente aos créditos efetivamente utilizados em
        revelações. Os créditos adquiridos e ainda não utilizados continuam a ser
        reembolsáveis nos termos da Política de Reembolsos.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">7. Propriedade Intelectual</h2>
      <p>
        7.1 Todo o Conteúdo disponibilizado na Plataforma — incluindo, sem limitação, as
        mensagens de orientação e reflexão, textos, design, logótipos e elementos
        gráficos — é propriedade intelectual de <strong>Romeu Jorge Gomes Abreu e
        cônjuge</strong>, coautores, protegida pelo Código do Direito de Autor e dos
        Direitos Conexos (CDADC) e demais legislação aplicável.
      </p>
      <p className="mt-3">
        7.2 É expressamente proibido ao utilizador reproduzir, distribuir, transmitir,
        publicar, modificar, criar obras derivadas ou explorar comercialmente qualquer
        elemento da Plataforma ou do seu Conteúdo sem autorização escrita prévia.
      </p>
      <p className="mt-3">
        7.3 É permitida a utilização pessoal e não comercial das mensagens reveladas,
        nomeadamente para fins de reflexão individual.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">8. Obrigações e Responsabilidades do Utilizador</h2>
      <p>O utilizador compromete-se a:</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>Utilizar a Plataforma exclusivamente para fins lícitos e pessoais;</li>
        <li>Não tentar aceder a áreas restritas ou contornar mecanismos de segurança;</li>
        <li>Não partilhar as suas credenciais com terceiros;</li>
        <li>Não utilizar sistemas automatizados (bots, scrapers) para aceder ao serviço;</li>
        <li>Não reproduzir nem distribuir o Conteúdo sem autorização.</li>
      </ul>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">9. Limitação de Responsabilidade</h2>
      <p>
        9.1 O prestador envidará todos os esforços razoáveis para assegurar a
        disponibilidade contínua da Plataforma, mas não garante a ausência de
        interrupções, erros ou falhas técnicas.
      </p>
      <p className="mt-3">
        9.2 O prestador não é responsável por danos indiretos, perda de dados ou lucros
        cessantes resultantes da utilização ou impossibilidade de utilização da
        Plataforma.
      </p>
      <p className="mt-3">
        9.3 O Conteúdo disponibilizado tem natureza reflexiva e de desenvolvimento
        pessoal, não constituindo aconselhamento médico, psicológico, jurídico ou
        financeiro. O utilizador utiliza-o sob sua exclusiva responsabilidade.
      </p>
      <p className="mt-3">
        9.4 A responsabilidade máxima do prestador perante o utilizador, em qualquer
        circunstância, não excederá o valor pago pelo utilizador nos 12 meses anteriores
        ao facto gerador de responsabilidade.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">10. Duração, Suspensão e Encerramento</h2>
      <p>
        10.1 O contrato de utilização vigora por tempo indeterminado a partir do momento
        do registo.
      </p>
      <p className="mt-3">
        10.2 O utilizador pode encerrar a sua conta a qualquer momento, através de pedido
        enviado para{" "}
        <a href="mailto:suporte@pontocego.pt" className="underline hover:text-foreground">
          suporte@pontocego.pt
        </a>
        .
      </p>
      <p className="mt-3">
        10.3 O prestador reserva-se o direito de suspender ou encerrar contas que violem
        os presentes Termos, sem obrigação de reembolso dos créditos utilizados, sem
        prejuízo dos direitos legais do consumidor.
      </p>
      <p className="mt-3">
        10.4 Em caso de cessação do serviço por iniciativa do prestador, os utilizadores
        serão notificados com antecedência mínima de 30 dias e os créditos não utilizados
        serão reembolsados nos termos da Política de Reembolsos.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">11. Alterações aos Termos</h2>
      <p>
        11.1 O prestador pode alterar os presentes Termos a qualquer momento, publicando a
        versão atualizada na Plataforma com indicação da data de revisão.
      </p>
      <p className="mt-3">
        11.2 O utilizador será notificado por email com antecedência de 15 dias em caso de
        alterações materiais.
      </p>
      <p className="mt-3">
        11.3 A continuação da utilização da Plataforma após a entrada em vigor das
        alterações constitui aceitação das mesmas.
      </p>
    </section>

    <section>
      <h2 className="font-serif text-2xl mt-6 mb-3">12. Lei Aplicável e Foro</h2>
      <p>12.1 Os presentes Termos são regidos pelo direito português.</p>
      <p className="mt-3">
        12.2 Para resolução de litígios de consumo, o utilizador pode recorrer às
        entidades de resolução alternativa de litígios (RAL) competentes, nomeadamente:
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
          <strong>Plataforma europeia de resolução de litígios em linha:</strong>{" "}
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
      <p className="mt-3">
        12.3 Na impossibilidade de resolução extrajudicial, é competente o tribunal da
        comarca do domicílio do consumidor, nos termos do artigo 71.º do Código de
        Processo Civil.
      </p>
    </section>
  </LegalLayout>
);

export default Terms;
