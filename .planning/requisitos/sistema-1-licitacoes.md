# Sistema 1 — Compras, Licitações e Contratos — Catálogo de Requisitos

> Fonte: Edital retificado Pregão 002/2026, Anexo I, páginas 50–64 (e 65 para os requisitos 378–384).
> ID: REQ-S1-NNN · Status: planejado · PoC: a classificar (definida na Prova de Conceito).
> Total: 384 requisitos.

## Seção: Disposições Gerais e Conformidade

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-001 | Possuir plena conformidade com a nova Lei de Licitações Lei 14.133/2021 e Decreto Municipal 1.606/2023. | 4 |
| REQ-S1-002 | Possuir cadastro único de contratos, de modo que, uma vez registrado, o contrato esteja automaticamente disponível para utilização em todas as rotinas da Contabilidade, sem necessidade de troca de sistema, alteração de entidade ou duplicidade de registros. | 4 |
| REQ-S1-003 | Efetuar automaticamente o bloqueio na dotação orçamentária, quando da emissão de requisição de compras e ordem de compras, devendo o mesmo ser baixado automaticamente quando da emissão do empenho. | 4 |
| REQ-S1-004 | Estornar os itens da ordem de compras quando o empenho for estornado, mantendo assim a integridade das informações. | 4 |
| REQ-S1-005 | Permitir consulta inter-relacionada de empenhos, possibilitando ao usuário acessar, a partir do próprio empenho, todas as informações e documentos correlacionados, incluindo: ordem de compra, contrato, processo licitatório, liquidações, estornos de liquidação, retenções, pagamentos, estornos de pagamento, notas de despesa extra orçamentárias, processo digital, anexos vinculados, assinantes da nota de empenho e respectivos lançamentos contábeis. | 4 |
| REQ-S1-006 | Permitir o cancelamento de Restos a Pagar, apresentando no ato do cancelamento a discriminação dos valores processados e não processados. | 4 |
| REQ-S1-007 | Permitir realizar a consulta da linha do tempo do bem, exibindo desde a sua requisição ao compras. | 4 |
| REQ-S1-008 | Permitir realizar a visualização do cronograma de licitações em forma de calendário, apresentando a agenda de licitações. | 4 |
| REQ-S1-009 | Permitir a integração do sistema de gestão de contratos, compras e licitações com outros, incluindo Contabilidade, Almoxarifado, Patrimônio, Controladoria e Procuradoria, contratados pelo IPASLI, ou que necessitem ser integrados aos sistemas da Prefeitura Municipal de Linhares, além de demais sistemas de controle necessários ao atendimento das normas e legislações vigentes. | 4 |
| REQ-S1-010 | Permitir atualizações periódicas de índices de mercado, tabelas referenciais e legislações correlatas, de forma que os dados do sistema permaneçam atualizados. | 4 |
| REQ-S1-011 | Permitir a Pesquisa e gestão de preços, monitoramento e fiscalização de contratos, gestão de atas de registro de preços, elaboração automatizada de estudos técnicos preliminares, análise e mitigação de riscos e tramitação digital de processos administrativos de contratação pública. A plataforma permite a integração e digitalização integral dos processos administrativos e de compras, melhorando a gestão de contratos e otimizando a formação de preços, garantindo a conformidade com os normativos vigentes e o fortalecimento da governança digital. | 4 |

## Seção: Cadastro de Materiais / Produtos

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-012 | Possuir no cadastro de materiais um campo para a descrição sucinta sem limitação de caracteres, possibilitando organizar os materiais informando a que grupo, classe ou sub-classe o material pertence, bem como relacionar uma ou mais unidades de medida. | 1 |
| REQ-S1-013 | Permitir a identificação de materiais/produtos conforme especificações de classificação, exemplo: Consumo / Permanente / Serviços / Obras, de Categoria, exemplo: Perecível / Não perecível / Estocável / Combustível, entre outros. | 1 |
| REQ-S1-014 | Possibilitar que o usuário possa configurar no cadastro de produtos campos cadastrais de sua escolha desde campos numéricos, textos ou listagem pré-definida; possibilitar o relacionamento do produto com marcas pré-aprovadas. | 1 |
| REQ-S1-015 | Dispor de campo para vínculo do produto/material com seu respectivo CATMAT e CATSER (Catálogo de Materiais e Serviços do Governo Federal). | 1 |
| REQ-S1-016 | Permitir anexar imagens de referência para os produtos. | 1 |
| REQ-S1-017 | Permitir a desabilitação de cadastros de produtos obsoletos, de forma a evitar seu uso indevido, porém mantendo todo seu histórico de movimentações. | 1 |
| REQ-S1-018 | Possibilitar relacionamento com produtos e elementos de despesas, impedindo que determinado produto seja comprado com elemento errado ou não relacionado. | 1 |
| REQ-S1-019 | Permitir por meio da consulta do produto/material, a pesquisa pelo histórico completo de aquisições, permitindo consultar dados como, por exemplo: licitações, ordens de compra, fornecedores e valor unitário. | 1 |
| REQ-S1-020 | Permitir o cadastro de rol de itens, criando previamente listas de produtos que poderão ser utilizadas nas demais rotinas do sistema. | 1 |
| REQ-S1-021 | Dispor de rotina específica para solicitação de cadastro de produtos, com notificação automática ao setor responsável, via sistema e/ou e-mail. Após a análise da solicitação: Em caso de deferimento, o sistema deverá notificar o solicitante, informando que o produto foi cadastrado e indicando o código correspondente; Em caso de indeferimento, o sistema deverá notificar o solicitante, apresentando o motivo da recusa. | 1 |

## Seção: Processos Licitatórios e Contratos (geral)

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-022 | Permitir o registro de agente de contratação, bem como de comissões de licitação: permanente, especial, pregoeiros e leiloeiros, indicando a portaria ou o decreto que as designaram, possibilitando informar também os seus respectivos membros e atribuições designadas, assim como a natureza do cargo. | 4 |
| REQ-S1-023 | Registrar os processos licitatórios, identificando número e ano do processo, objeto, modalidades de licitação e data do processo, bem como dados de requisições de compra, planilhas de preços, procurando, assim, cumprir com o ordenamento determinado no parágrafo único do artigo 4.º da Lei de Licitações e Contratos. No caso de dispensa e inexigibilidade possuir relacionamento com o inciso da lei correspondente com o fundamento legal. | 4 |
| REQ-S1-024 | Recomendar o número da licitação sequencial anual ou por modalidade, possibilitando que o usuário faça sua parametrização. | 4 |
| REQ-S1-025 | Permitir o cadastro do processo licitatório sem indicar a modalidade no sistema, permitindo que ela seja escolhida posteriormente à emissão de parecer jurídico. | 4 |
| REQ-S1-026 | Permitir que o usuário gerencie os processos através de fluxogramas, onde todas as decisões são baseadas nas exigências legais vigentes. Por meio do fluxo, deverá ser possível dar início, julgar e concluir qualquer tipo de processo licitatório ou dispensável, dispensando o acesso a novos sistemas dentro do mesmo sistema. Deve acompanhar em tempo real o andamento do processo, habilitando a próxima etapa posterior à conclusão da etapa anterior. A liberação de etapas deverá ser de fácil visualização, utilização e localização por parte do usuário. A visualização deverá ser identificada por cores específicas para cada etapa do processo. O fluxograma poderá apresentar as possíveis decisões, mostrando o caminho a ser seguido de acordo com a escolha feita. Em cada fase do workflow deve haver um tópico (hint) de ajuda, para auxílio e orientação em caso de dúvidas por parte do usuário. | 4 |
| REQ-S1-027 | Permitir anexar documentos à minuta de edital e possibilitar definir quais anexos são obrigatórios, garantindo que o processo só avance após o envio dos documentos exigidos. | 4 |
| REQ-S1-028 | Permitir a visualização de todos os documentos e anexos da minuta em um lugar único, agrupando-os por classificação. | 4 |
| REQ-S1-029 | Permitir a emissão/visualização de todos os documentos previstos nas etapas do processo licitatório, como editais, avisos de licitação, atas de sessão, termos de homologação e adjudicação, pareceres técnicos, jurídicos e contábeis, além de relatórios de propostas e lances. Todos os documentos gerados devem ser armazenados no banco de dados e o sistema deve possibilitar anexar documentos complementares ou substituir versões anteriores quando necessário. | 4 |
| REQ-S1-030 | Permitir o registro do parecer contábil, no processo de licitação, bem como sua impressão. | 4 |
| REQ-S1-031 | Permitir o registro do parecer jurídico e/ou técnico, no processo de licitação, conforme legislação vigente, bem como sua impressão. | 4 |
| REQ-S1-032 | Registrar a interposição de recurso ou impugnação do processo de licitação, bem como o seu julgamento, com texto referente ao parecer da comissão e/ou jurídico. | 4 |
| REQ-S1-033 | Registrar anulação e/ou revogação do processo de licitação, possibilitando o registro total ou parcial pela quantidade ou valor. | 4 |
| REQ-S1-034 | Possuir integração com plataformas ex.: ComprasNet, Banco de Preços, Portal de Compras, Banco do Brasil, entre outras), permitindo a geração de documentos e relatórios obrigatórios por lei. | 4 |
| REQ-S1-035 | Possuir cadastro e consulta das minutas de editais para processos licitatórios, contendo histórico de versões e permitindo a visualização e download das versões anteriores. | 4 |
| REQ-S1-036 | Dispor de rotina para gerar automaticamente minutas de contratos a partir das informações constantes no processo licitatório, possibilitando edição prévia e ajustes antes de sua finalização. | 4 |
| REQ-S1-037 | Dispor a associação de contratos a fornecedores e processos licitatórios, mantendo o histórico de aditivos, renovações e alterações realizadas no contrato. | 4 |
| REQ-S1-038 | Possuir a emissão de alertas para vencimento e renovações de contratos, notificando setores responsáveis com antecedência parametrizável. | 4 |
| REQ-S1-039 | Possuir o cadastro de ordens de compra vinculadas aos processos licitatórios, permitindo o detalhamento dos itens adquiridos, preços unitários, quantidades e valores totais. | 4 |
| REQ-S1-040 | Dispor de registro de aditivos contratuais, apostilamentos e a emissão de documentos relacionados, como termos aditivos, planilhas de reajuste e outros. | 4 |
| REQ-S1-041 | Permitir a geração de relatórios e gráficos sobre processos licitatórios, contratos e ordens de compra, organizados por período, tipo de aquisição, fornecedor, valor total e outras variáveis parametrizáveis. | 4 |
| REQ-S1-042 | Permitir o acompanhamento em tempo real do status de cada contrato, permitindo a consulta de saldo remanescente, datas de vigência e execução de cláusulas. | 4 |
| REQ-S1-043 | Dispor de rotina que permita a inclusão de sanções administrativas aplicadas a fornecedores e seu registro no cadastro, informando a penalidade aplicada e os fundamentos legais. | 4 |
| REQ-S1-044 | Permitir a emissão de relatórios de fornecedores sancionados, indicando os fundamentos legais e a vigência das penalidades. | 4 |
| REQ-S1-045 | Garantir integração com o sistema de contabilidade para lançamento automático de despesas geradas por contratos, licitações e ordens de compra, reduzindo erros manuais. | 4 |
| REQ-S1-046 | Permitir o cadastro e a gestão de atas de registro de preços, com controle de vigência, itens disponíveis e valores ajustados. | 4 |
| REQ-S1-047 | Possibilitar a emissão de relatórios gerenciais de atas de registro de preços, organizados por fornecedor, item, vigência e valores. | 4 |
| REQ-S1-048 | Permitir o envio de notificações automáticas para setores responsáveis em casos de pendências ou irregularidades identificadas nos processos licitatórios, contratos ou ordens de compra. | 4 |
| REQ-S1-049 | Permitir o cadastro de contratos administrativos com detalhamento de cláusulas contratuais, prazos, vigências, reajustes e penalidades, permitindo ajustes conforme legislação vigente. | 4 |
| REQ-S1-050 | Permitir o acompanhamento detalhado da execução financeira dos contratos, com registro de pagamentos realizados, valores empenhados, liquidados e saldo contratual. | 4 |
| REQ-S1-051 | Dispor de rotina que permita a emissão de notas de empenho diretamente vinculadas aos contratos e processos licitatórios. | 4 |
| REQ-S1-052 | Viabilizar o registro e a consulta de solicitações de reequilíbrio econômico-financeiro nos contratos, com anexação de documentos comprobatórios e emissão de parecer jurídico e técnico. | 4 |
| REQ-S1-053 | Permitir o acompanhamento do saldo disponível nas atas de registro de preços, detalhando a quantidade adquirida e o saldo remanescente. | 4 |
| REQ-S1-054 | Dispor de consulta consolidada sobre processos licitatórios e contratos, organizando por fornecedores, objetos contratados, valores empenhados e status de execução. | 4 |
| REQ-S1-055 | Garantir o controle e a rastreabilidade de todos os aditivos realizados nos contratos, permitindo consulta rápida sobre os valores adicionados ou subtraídos, prorrogações e alterações de cláusulas. | 4 |
| REQ-S1-056 | Permitir a integração do sistema de gestão de compras com sistemas financeiros e orçamentários, automatizando os lançamentos e evitando inconsistências entre áreas. | 4 |
| REQ-S1-057 | Disponibilizar painel de controle gerencial para acompanhamento de processos licitatórios em andamento, contratos vigentes e atas de registro de preços, com alertas para vencimentos ou pendências. | 4 |
| REQ-S1-058 | Disponibilizar painel de controle que consolide informações sobre processos licitatórios, compras, contratos, saldos orçamentários e outras informações relevantes. | 4 |
| REQ-S1-059 | Permitir o cancelamento de contratos ou rescisões contratuais, com registro detalhado de motivos, fundamentação legal e documentos comprobatórios anexados. | 4 |
| REQ-S1-060 | Dispor sobre a emissão de relatório detalhado sobre processos de rescisão contratual, incluindo os impactos financeiros e jurídicos. | 4 |
| REQ-S1-061 | Viabilizar o registro de processos administrativos sancionatórios, permitindo o cadastro de notificações, defesas apresentadas, decisões e sanções aplicadas aos fornecedores. | 4 |
| REQ-S1-062 | Garantir a exportação de dados de processos licitatórios e contratos em formatos como PDF, XLS e CSV para fins de auditoria e prestação de contas. | 4 |
| REQ-S1-063 | Permitir a publicação automática de contratos, editais e atas no Portal da Transparência, atendendo à legislação de acesso à informação. | 5 |
| REQ-S1-064 | Dispor de módulo de consulta pública que permita visualizar processos licitatórios e contratos firmados pela entidade, filtrados por período, fornecedor, objeto e valor. | 5 |
| REQ-S1-065 | Permitir a inclusão de observações e notas explicativas nos registros de contratos e licitações, para maior clareza nas consultas e auditorias. | 4 |
| REQ-S1-066 | Possibilitar a emissão de termos de referência diretamente no sistema, vinculando as especificações técnicas aos itens cadastrados. | 4 |
| REQ-S1-067 | Garantir integração com o sistema de estoque, permitindo controle automático de entrada de materiais adquiridos por meio de processos licitatórios. | 4 |
| REQ-S1-068 | Permitir a realização de comparativos automáticos entre preços registrados em atas de registro de preços e valores cotados em novas licitações. | 4 |
| REQ-S1-069 | Dispor o controle de vigência e validade de seguros e garantias contratuais, com alertas para renovações ou vencimentos. | 4 |
| REQ-S1-070 | Dispor de cadastro de fornecedores, com histórico de participação em licitações, contratos firmados, avaliações de desempenho e sanções aplicadas. | 4 |
| REQ-S1-071 | Possibilitar a avaliação de desempenho de fornecedores, com base em critérios como cumprimento de prazos, qualidade dos produtos/serviços e conformidade contratual. | 4 |
| REQ-S1-072 | Viabilizar a emissão de relatórios consolidados de desempenho de fornecedores, permitindo a identificação de parceiros estratégicos e a mitigação de riscos futuros. | 4 |
| REQ-S1-073 | Dispor de ferramentas para geração automática de comunicados e notificações aos fornecedores, informando sobre pendências, prazos e atualizações contratuais. | 4 |
| REQ-S1-074 | Possibilitar o cadastro de cronogramas físico-financeiros dos contratos, com acompanhamento detalhado de execução e pagamentos. | 4 |
| REQ-S1-075 | Dispor de rotina para negociação do preço com o fornecedor vencedor ao final da rodada de lances de cada item/lote. | 4 |
| REQ-S1-076 | Propiciar o julgamento das propostas em relação a microempresa, empresa de pequeno porte e empresa de médio porte, de acordo com os critérios da Lei Complementar 123/2006. | 4 |
| REQ-S1-077 | Dispor de rotina que propicie o cadastro dos documentos dos fornecedores participantes do certame. | 4 |
| REQ-S1-078 | Dispor de rotina para o registro das propostas dos participantes, com indicação de Valor Unitário e Valor Total, bem como possibilitar a consulta por fornecedor nos quadros comparativos de preços, identificando os vencedores. | 4 |
| REQ-S1-079 | Propiciar o registro da desclassificação do participante, indicando a data e o motivo da desclassificação. | 4 |
| REQ-S1-080 | Propiciar o registro da inabilitação do participante, indicando a data e o motivo da inabilitação. Em se tratando de pregão presencial, caso o vencedor do item seja inabilitado, permitir que o pregoeiro já identifique o remanescente e permita selecioná-lo para negociação e indicação do novo vencedor. | 4 |
| REQ-S1-081 | Propiciar que, na consulta do processo licitatório, seja possível visualizar dados do mesmo, como, por exemplo, lances (nos casos de pregão presencial), requisição(ões) ao compras, vencedor(es), propostas, itens do processo, participantes, dotações utilizadas, ordens de compra emitidas e dados sobre a homologação e adjudicação do certame. | 4 |
| REQ-S1-082 | Propiciar o gerenciamento de processos licitatórios multientidade (onde mais de uma entidade manifesta interesse no objeto ora licitado), permitindo que a licitação ocorra por uma entidade principal, onde será realizado todo o gerenciamento, desde o seu cadastro até contrato e ordens de compra, com a indicação das entidades participantes, permitindo a geração de contratos individuais por entidade, bem como suas solicitações e ordens de compra. | 4 |
| REQ-S1-083 | Dispor de fluxo diferenciado para processos licitatórios de publicidade, propiciando o cadastro das sessões de abertura de envelopes não identificados e cadastro e julgamento das propostas técnicas, de acordo com a legislação vigente. | 4 |
| REQ-S1-084 | Propiciar o registro no sistema da pontuação e índices para os itens das licitações cujo julgamento seja por preço e técnica, permitindo a classificação automática do vencedor de acordo com a pontuação alcançada na soma dos critérios de pontuação futuros. | 4 |
| REQ-S1-085 | Propiciar o relacionamento da comissão de licitação ao processo licitatório, bem como selecionar os membros da respectiva comissão que irão proceder o julgamento do certame. | 4 |
| REQ-S1-086 | Propiciar o registro das publicações dos processos licitatórios, com indicação da data da publicação e do veículo de publicação. | 4 |
| REQ-S1-087 | Propiciar a indicação do recurso orçamentário que será utilizado no processo licitatório, bem como sua respectiva reserva orçamentária, sendo que a cada compra executada deverá ser liberado o respectivo valor da reserva orçamentária. | 4 |
| REQ-S1-088 | Em se tratando de processos licitatórios de registro de preço, propiciar o cadastro dos registros referentes à Ata de Registro de Preço, bem como controlar os respectivos registros e permitir a alteração de quantidades, preços e fornecedores quando necessário. | 4 |
| REQ-S1-089 | Propiciar o registro dos fiscais/gestores do processo licitatório, atribuindo suas funções e vigências de gestão. | 4 |
| REQ-S1-090 | Propiciar que se realize a duplicidade/cópia de processos licitatórios já realizados pela entidade, de modo a otimizar o cadastramento de processos licitatórios similares. | 4 |
| REQ-S1-091 | Propiciar que, em licitações do tipo inexigibilidade ou dispensa de licitação que disponham de características de credenciamento, haja a definição de cotas. | 4 |
| REQ-S1-092 | Propiciar a disponibilidade de publicação de dados e documentos dos processos licitatórios na internet, possibilitando que se escolha o que se deseja ser disponibilizado, como, por exemplo, itens, certidões, documentos exigidos, quadros comparativos de preços, vencedores, contratos, ordens de compra, editais, anexos, pareceres, impugnações, dispensas, atas de abertura de envelope de documento, atas de abertura de envelope de proposta, atas do pregão, atas de registro de preço, termos de homologação, termos de adjudicação e contratos. | 5 |
| REQ-S1-093 | Propiciar a realização de pesquisa de preço/planilha de preço para estimativa de valores para novas aquisições, sejam elas diretas ou por meio de processos licitatórios. | 4 |
| REQ-S1-094 | Propiciar que, a partir da pesquisa de preço/planilha de preço, utilizando como critério de escolha balizador o preço médio, maior preço ou menor preço cotado para o item na coleta de preços, seja possível gerar um processo administrativo ou emitir uma ordem de compra, com base no menor preço cotado. | 4 |
| REQ-S1-095 | Dispor de rotina para cotação de planilhas de preços on-line, permitindo que os fornecedores insiram os preços praticados, possibilitando o cálculo automático dos preços médios, mínimos e máximos, e permitindo o relacionamento dessa planilha aos processos licitatórios para fins de cálculo da cotação máxima dos itens a serem licitados. | 4 |
| REQ-S1-096 | Dispor de integração com o Processo Digital/Protocolo, gerando automaticamente um processo a partir da digitação de uma requisição de compra e/ou solicitação de compra, permitindo monitorar a movimentação do processo entre os setores da entidade. | 4 |
| REQ-S1-097 | Compartilhar automaticamente com o Processo Digital/Protocolo os anexos do processo licitatório, de modo que todos os documentos possam ser visualizados em um único local. | 4 |
| REQ-S1-098 | Dispor de rotina para registro de solicitação de compra dos itens homologados no processo licitatório. | 4 |
| REQ-S1-099 | Dispor de rotina que possibilite pré-autorizar e autorizar as solicitações de compra. | 4 |
| REQ-S1-100 | Dispor de funcionalidade que possibilite o controle do saldo das dotações orçamentárias utilizadas nas solicitações de compras. | 4 |
| REQ-S1-101 | Propiciar o registro e controle dos contratos administrativos celebrados, vinculando-os aos processos licitatórios e/ou compras diretas que os originaram. | 4 |
| REQ-S1-102 | Possibilitar o cadastro dos contratos, contemplando informações como número do contrato, objeto, partes envolvidas, valores, prazos, responsáveis pela fiscalização e gestão, entre outros. | 4 |
| REQ-S1-103 | Propiciar a vinculação de cláusulas padrão aos contratos, permitindo a criação de modelos de documentos que podem ser utilizados para a elaboração e formalização dos contratos administrativos. | 4 |
| REQ-S1-104 | Dispor de rotina que permita o acompanhamento da execução dos contratos, incluindo o registro de medições, reajustes e prorrogações. | 4 |
| REQ-S1-105 | Possibilitar o controle dos prazos contratuais, com notificações automáticas para vencimentos e renovações. | 4 |
| REQ-S1-106 | Dispor de rotina para registro e acompanhamento dos processos de rescisão contratual, informando os motivos e medidas tomadas. | 4 |
| REQ-S1-107 | Permitir o registro e acompanhamento de garantias contratuais, indicando valores, prazos e modalidades. | 4 |
| REQ-S1-108 | Dispor de integração com o sistema financeiro, permitindo o registro automático de pagamentos realizados com base nos contratos administrativos. | 4 |
| REQ-S1-109 | Dispor de rotina para geração de relatórios gerenciais sobre os processos licitatórios, contratos administrativos e compras realizadas, permitindo a utilização de filtros como período, modalidade de licitação, valores, fornecedores, entre outros. | 4 |
| REQ-S1-110 | Possibilitar a emissão de relatórios sobre o cumprimento das obrigações contratuais, destacando pendências e atrasos. | 4 |
| REQ-S1-111 | Possibilitar a exportação de relatórios e informações gerenciais em formatos como PDF, XLS e CSV. | 4 |
| REQ-S1-112 | Propiciar a realização de auditoria interna sobre os registros de compras, licitações e contratos, permitindo o rastreamento de alterações realizadas no sistema. | 4 |
| REQ-S1-113 | Propiciar o controle das Solicitações de Compra autorizadas, pendentes e anuladas. | 4 |
| REQ-S1-114 | Propiciar o controle das Solicitações de Compra por Centro de Custo, impedindo que outros usuários acessem ou registrem solicitações que não pertençam ao seu centro de custo. | 4 |
| REQ-S1-115 | Dispor de rotina para avisar, por meio de notificações e/ou e-mail, sempre que for cadastrada uma nova Solicitação de Compra, com a finalidade de agilizar o processo de compra. | 4 |
| REQ-S1-116 | Dispor de rotina para registro de Requisições ao Compras, permitindo informar itens e recursos orçamentários, por meio do qual será possível executar uma ordem de compra ou formalizar um processo licitatório. | 4 |
| REQ-S1-117 | Dispor de rotina que possibilite pré-autorizar e autorizar a Requisição ao Compras, viabilizando a reserva dos recursos orçamentários e permitindo que compras sejam efetuadas somente após a autorização. | 4 |
| REQ-S1-118 | Propiciar a emissão de relatórios de licitações gerando todos os dados do processo licitatório, desde a abertura até a conclusão. | 4 |
| REQ-S1-119 | Propiciar a geração de uma relação mensal de todas as compras executadas, para envio ao TCU, conforme exigido no inciso VI do Art. 1º da Lei 9755/98. | 4 |
| REQ-S1-120 | Dispor de rotina para registro de propostas dos pregões presenciais apenas pelo valor do lote, dispensando o preenchimento dos subitens do lote, e propiciando que o fornecedor vencedor realize a readequação dos valores dos subitens on-line em suas dependências, otimizando o cadastro das propostas e o início dos lances. | 4 |
| REQ-S1-121 | Propiciar a escolha dos assinantes de todos os documentos gerados no sistema, permitindo selecionar os formatos de geração (PDF, HTML, DOC, XLS), quantidades de cópias e assinatura eletrônica. | 4 |
| REQ-S1-122 | Dispor de consulta direta no sistema das principais legislações vigentes e atualizadas. | 4 |
| REQ-S1-123 | Dispor de sistema próprio para gerenciamento de pregões eletrônicos ou possuir integração via webservice com o PNCP, Compras Públicas ou similares, permitindo importar automaticamente os dados de lances, participantes, documentos e atas através de agendamento, sem necessidade de digitação ou importação manual. | 4 |
| REQ-S1-124 | Propiciar a exportação dos arquivos para a prestação de contas dos dados referentes a licitações de acordo com legislações estaduais e federais. | 4 |
| REQ-S1-125 | Propiciar o controle da situação do processo licitatório, indicando se está aberto, anulado (parcial ou total), homologado (parcial ou total), deserto, fracassado, descartado, aguardando julgamento, concluído, suspenso ou revogado. Este controle abrange as modalidades de Concorrência, Concurso, Leilão, Pregão, Diálogo Competitivo, Dispensa e Inexigibilidade. | 4 |
| REQ-S1-126 | Propiciar o gerenciamento dos controles necessários para Registro de Preços, de acordo com a legislação vigente. | 4 |
| REQ-S1-127 | Propiciar o registro e emissão de Solicitações ao Compras de produtos e serviços para o registro de preço, facilitando o controle da entrega do objeto licitado. | 4 |
| REQ-S1-128 | Dispor de modelos padrão de edital para uso do sistema, sem necessidade de criar diversos modelos para licitações diferentes. | 4 |
| REQ-S1-129 | Dispor de rotina que possibilite o preenchimento on-line da proposta comercial, dispensando a exportação e importação de arquivos, permitindo que o fornecedor preencha a proposta diretamente em suas dependências. Os dados da proposta comercial devem ser criptografados, exigindo senha para descriptografá-los e importá-los ao sistema, evitando redigitação. | 4 |
| REQ-S1-130 | Dispor de rotina que permita o registro de plano anual de licitações, composto por intenções de licitação. | 4 |
| REQ-S1-131 | Cada intenção deverá conter uma descrição do objeto a ser licitado, o centro de custo responsável, a possibilidade de compartilhamento com outros centros de custo e a inclusão de novos itens. | 4 |
| REQ-S1-132 | Dispor de rotina para adesão a intenções de licitação, permitindo que outras secretarias participem dessas intenções. | 4 |
| REQ-S1-133 | Dispor de rotina para definição dos itens da intenção de licitação, permitindo informar o produto e sua unidade de medida, de modo que as secretarias participantes possam informar o quantitativo desejado. | 4 |
| REQ-S1-134 | Propiciar a geração de planilha de preços a partir dos itens da intenção, possibilitando a criação de processos licitatórios. | 4 |
| REQ-S1-135 | Propiciar a geração de itens da intenção de licitação por meio da importação de um rol de itens. | 4 |
| REQ-S1-136 | Propiciar o cadastro de contratos diretos ou oriundos de licitações, bem como seu gerenciamento, incluindo publicações, aditivos, reajustes e vigência. | 4 |
| REQ-S1-137 | Dispor de alerta para término de vigência de contratos, com envio de mensagens via e-mail, notificando gestores e fiscais de contrato, parametrizando o número de dias de antecedência do alerta. | 4 |
| REQ-S1-138 | Permitir a liberação da diferença reservada entre o valor vencido pelo fornecedor e o valor total estimado no momento da adjudicação, liberando saldo para outras compras, sem necessidade de aguardar a conclusão de todo o processo. | 4 |
| REQ-S1-139 | Permitir o registro da extinção/rescisão do contrato, indicando o motivo e a data, com possibilidade de gerar dispensa de licitação e registro de impeditivos para o fornecedor, quando aplicável. | 4 |
| REQ-S1-140 | Permitir a identificação de contratos aditivos dos tipos Acréscimo, Diminuição, Equilíbrio, Extinção/Rescisão, entre outros, e a visualização do tipo de alteração (bilateral ou unilateral). | 4 |
| REQ-S1-141 | Propiciar o registro de aditivos e supressões contratuais, bloqueando o registro caso ultrapasse os limites legais de acréscimos ou supressões, deduzidos os acréscimos de atualização monetária. | 4 |
| REQ-S1-142 | Propiciar o registro de alteração contratual referente a equilíbrio econômico-financeiro. | 4 |
| REQ-S1-143 | Propiciar o registro de apostila ao contrato, permitindo o registro de variações de valor contratual relacionadas a reajustes de preços previstos no contrato. | 4 |
| REQ-S1-144 | Propiciar o registro de apostila ao contrato, permitindo o registro da variação do valor contratual referente a reajuste de preços previstos no contrato, bem como atualizações financeiras e alterações de dotações orçamentárias, de acordo com a legislação vigente. | 4 |
| REQ-S1-145 | Propiciar o controle do vencimento dos contratos de forma automática, enviando e-mails aos servidores do setor com a relação dos contratos que estão a vencer em determinado período configurável. | 4 |
| REQ-S1-146 | Propiciar a definição de gestores/fiscais nos contratos e aditivos, que serão responsáveis pela fiscalização da execução integral do contrato. | 4 |
| REQ-S1-147 | Propiciar o cadastro das publicações dos contratos e aditivos. | 4 |
| REQ-S1-148 | Propiciar a emissão de relatórios para controle de vencimento dos contratos, autorizações de fornecimento e termos aditivos de contratos. | 4 |
| REQ-S1-149 | Propiciar o registro de fornecedores, inclusive com a emissão do Certificado de Registro Cadastral, controlando a sequência do certificado e permitindo visualizar os dados cadastrais, o objeto social e consultar as documentações. | 4 |
| REQ-S1-150 | Propiciar avaliação de fornecedores, verificando o cumprimento da validade dos documentos obrigatórios especificados no cadastro de fornecedores, evidenciando irregularidades no momento da emissão. | 4 |
| REQ-S1-151 | Propiciar o registro de suspensão/impeditivos do direito de licitar no cadastro de fornecedores, permitindo o controle da data limite para a reabilitação. | 4 |
| REQ-S1-152 | Propiciar o controle da validade dos documentos do fornecedor, permitindo a emissão de relatórios com a relação dos documentos vencidos e a vencer. | 4 |
| REQ-S1-153 | Propiciar o registro e controle da data de validade dos documentos e certidões negativas dos fornecedores. | 4 |
| REQ-S1-154 | Dispor de relatórios que permitam emitir a relação dos documentos vencidos e a vencer dos fornecedores. | 4 |
| REQ-S1-155 | Propiciar o registro do responsável legal da empresa e sócios do fornecedor/empresa. | 4 |
| REQ-S1-156 | Propiciar o registro de índices contábeis, como Ativo Circulante, Ativo Não Circulante, Patrimônio Líquido, Ativo Total, Passivo Circulante, Passivo Não Circulante, Índice de Solvência e Capital Social da empresa/fornecedor. | 4 |
| REQ-S1-157 | Dispor da emissão de Atestado de Capacidade Técnica para o fornecedor, gerando documento com os produtos/serviços fornecidos por ele. | 4 |
| REQ-S1-158 | Propiciar o controle da validade de documentos do fornecedor no momento da emissão de contratos e ordens de compra. | 4 |
| REQ-S1-159 | Propiciar a emissão de relatórios gerenciais do fornecedor, exibindo registros referentes a licitações, contratos no exercício e ordens de compra, podendo ser gerados de forma consolidada ou por processo licitatório. | 4 |
| REQ-S1-160 | Propiciar a geração de Ordens de Compra ou Serviços do tipo Global, Estimativa e Ordinária, sejam dispensáveis ou oriundas de processo licitatório. | 4 |
| REQ-S1-161 | Assegurar a obrigatoriedade dos dados cadastrais dos fornecedores, como CNPJ, Razão Social, Endereço, E-mail e Telefone. | 4 |
| REQ-S1-162 | Propiciar que na geração de Ordens de Compra ou Serviços sejam informados dados referentes à data de emissão e vencimento, fornecedor, finalidade e recurso orçamentário, para que possam ser utilizados na geração dos empenhos e suas parcelas. | 4 |
| REQ-S1-163 | Propiciar o parcelamento de uma ordem de compra do tipo Global e/ou Estimativa, permitindo o empenhamento das parcelas por meio de subempenhos. | 4 |
| REQ-S1-164 | Propiciar a alteração, caso não exista empenho na contabilidade, de informações da ordem de compra, como condições de pagamento, dados de entrega e finalidade/histórico. | 4 |
| REQ-S1-165 | Propiciar o estorno da ordem de compra, efetuando o estorno de seus itens. Caso a ordem de compra já esteja empenhada, permitir que, por meio do estorno do empenho, os itens da ordem de compra sejam estornados automaticamente, sem necessidade de estorno manual. | 4 |
| REQ-S1-166 | Propiciar o registro de dados relativos à retenção na ordem de compra. | 4 |
| REQ-S1-167 | Propiciar o registro de dados relativos ao desconto na ordem de compra. | 4 |
| REQ-S1-168 | Propiciar o reconhecimento de produtos da ordem de compra como Consumo Imediato, para que os lançamentos contábeis de saída do estoque sejam executados automaticamente no momento do empenhamento. | 4 |
| REQ-S1-169 | Propiciar o bloqueio na emissão de ordens de compra oriundas de licitações de Registros de Preço em que a Ata esteja fora de validade. | 4 |
| REQ-S1-170 | Propiciar a consulta de informações referentes ao recebimento da ordem de compra, permitindo a visualização do saldo pendente a ser entregue, com quantidades, valores e saldo. | 4 |
| REQ-S1-171 | Propiciar que, na consulta da ordem de compra, possa ser gerado um extrato de movimentação. | 4 |
| REQ-S1-172 | Propiciar a consulta on-line de débitos de contribuintes pessoa física/jurídica na geração de ordem de compra ou contrato. | 4 |
| REQ-S1-173 | Propiciar a exportação de arquivos para a prestação de contas, com dados pertinentes aos contratos de acordo com legislações estaduais e federais. | 4 |
| REQ-S1-174 | Dispor de rotina que permita gerenciar licitações e contratos fundamentados na Lei 13.019/14. | 4 |
| REQ-S1-175 | Propiciar que, por meio do Portal da Entidade, seja possível registrar a Manifestação de Interesse Social. | 4 |
| REQ-S1-176 | Propiciar que, a partir do Portal da Transparência, seja possível visualizar licitações, contratos e prestações de contas referentes a parcerias. | 5 |
| REQ-S1-177 | Dispor no Portal da Entidade e no Portal da Transparência de uma Agenda Pública de Licitações, listando os eventos de data e hora de abertura das propostas, gerados automaticamente a partir do cadastro dos processos licitatórios. | 5 |
| REQ-S1-178 | Propiciar que, no cadastro de contratos relativos a concessões de bens imóveis do IPASLI, seja possível relacionar os bens aos itens do contrato, para que o setor de patrimônio possa gerenciá-los. | 4 |
| REQ-S1-179 | Possibilitar manter informações cadastrais das linhas de fornecimento dos fornecedores. | 4 |
| REQ-S1-180 | Permitir cadastrar as informações do balanço dos fornecedores no sistema para que o mesmo possa calcular automaticamente os índices de liquidez. | 4 |
| REQ-S1-181 | Possibilitar manter informações cadastrais de sócios, representantes, contato e conta bancária dos fornecedores. | 4 |
| REQ-S1-182 | Possibilitar que sejam calculados os índices de liquidez automaticamente após o preenchimento do balanço patrimonial. | 4 |

## Seção: Convênios

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-183 | Permitir o registro dos contratos e convênios informando número e ano do contrato, fornecedor contratado, datas de início e término, objeto, prazos, valores e quantidades contratadas, calculando a vigência contratual. | 4 |
| REQ-S1-184 | Registrar os aditivos, suspensões e rescisões contratuais, indicando motivo e data. | 4 |
| REQ-S1-185 | Permite o cadastro de responsáveis pelo Convênio, representantes, signatários e o agrupamento dos responsáveis. | 4 |
| REQ-S1-186 | Integração total com o SIAFIC, exportando automaticamente todos os contratos cadastrados no sistema de compras, licitações e contratos e convênios. | 4 |
| REQ-S1-187 | Emitir relatório de razão de contratos e convênios. | 4 |
| REQ-S1-188 | Registrar as medições/etapas de execução dos contratos e convênios. | 4 |
| REQ-S1-189 | Registrar as parcelas de contratos e convênios. | 4 |

## Seção: Fornecimento

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-190 | Registrar, de forma automática, as solicitações de empenho para o reconhecimento inicial da despesa (AE). | 4 |
| REQ-S1-191 | O sistema deverá realizar via integração com sistema contábil, o empenho da despesa. | 4 |
| REQ-S1-192 | Registrar e autorizar, de forma automática, que a entrega de materiais ou a execução de serviços possam ser realizados pelo fornecedor/credor (AF). | 4 |
| REQ-S1-193 | Registrar o ateste da entrega de materiais ou execução de serviços, de forma automática, mediante autorização para que a devida despesa seja liquidada (AL). | 4 |
| REQ-S1-194 | O sistema deverá realizar via integração com sistema contábil, a liquidação da despesa. | 4 |
| REQ-S1-195 | Possibilitar anular as solicitações de empenho já reconhecidas como despesa (AE). | 4 |
| REQ-S1-196 | Possibilitar anular a entrega de materiais ou execução de serviços, já autorizados (AF). | 4 |
| REQ-S1-197 | Possibilitar anular a entrega de materiais ou execução de serviços, já atestados (AL). | 4 |
| REQ-S1-198 | Possibilitar complementar as solicitações de empenhos já reconhecidas como despesa (AE). | 4 |
| REQ-S1-199 | Emitir relatório de autorização de empenho (AE). | 4 |
| REQ-S1-200 | Emitir relatório de autorização de fornecimento (AF). | 4 |
| REQ-S1-201 | Emitir relatório de anulação de autorização de empenho (AE). | 4 |
| REQ-S1-202 | Emitir relatório de anulação de autorização de fornecimento (AF). | 4 |
| REQ-S1-203 | Emitir relatório de anulação de autorização de liquidação (AL). | 4 |
| REQ-S1-204 | Emitir relatório de razão de autorização de fornecimento (AF). | 4 |
| REQ-S1-205 | Emitir relatório de razão de autorização de liquidação (AL). | 4 |

## Seção: Cadastro de Fornecedores

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-206 | O sistema deverá identificar as empresas como ME e EPP para cumprimento à lei 123/2006 e 147/2014. Possibilitar o julgamento das propostas em relação a microempresa, empresa de pequeno porte e empresa de médio porte de acordo com os critérios da Lei Complementar 123/2006; Decreto nº 8.538, de 2015. | 1 |
| REQ-S1-207 | O sistema deverá permitir pesquisar fornecedores a partir de palavras contidas no seu nome, CPF/CNPJ, enquadramento e situação (ativo/vigente). | 1 |
| REQ-S1-208 | Controlar os prazos de vencimento das certidões e demais documentos exigidos aos fornecedores, permitindo a emissão de relatórios. | 1 |
| REQ-S1-209 | O sistema deverá conter cadastro de fornecedores de pessoas físicas e jurídicas, para participação em compras e licitações. | 1 |
| REQ-S1-210 | Os campos de cadastramento de dados do fornecedor devem ser habilitados de acordo com o tipo de pessoa (física ou jurídica) a ser cadastrada. Exemplo: O sistema não poderá permitir a digitação do campo CNPJ para pessoa física e vice-versa. | 1 |
| REQ-S1-211 | O sistema deverá disponibilizar recurso para permitir a consulta de regularidade dos fornecedores, através de link direcionado para os seguintes sites: INSS, FGTS, Fazenda Municipal, Estadual e Federal. | 1 |
| REQ-S1-212 | Integração total com o SIAFIC, exportando automaticamente os fornecedores cadastrados no sistema de Compras, Licitação e Contratos. | 1 |
| REQ-S1-213 | O sistema deverá permitir pesquisar fornecedores a partir de palavras contidas no seu nome, CPF/CNPJ, enquadramento e situação (ativo/vigente). | 1 |
| REQ-S1-214 | O sistema deve possibilitar realizar pesquisas através de link, para os sites do INSS, FGTS, Fazenda Municipal, Estadual e Federal. | 1 |
| REQ-S1-215 | O sistema deverá permitir efetuar o controle de ocorrências dos fornecedores de materiais, serviços e obras como histórico de alterações no cadastro e restrições sofridas como multas e outras penalidades. | 1 |
| REQ-S1-216 | Possibilitar que o relatório de certificado de registro cadastral – CRC – possa ser parametrizado pelo próprio usuário. | 1 |

## Seção: Seção de Compras

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-217 | Permitir o registro de todo o processo licitatório, envolvendo as etapas desde a preparação (processo administrativo) até o julgamento, registrando as atas, deliberação (preço global), mapa comparativo de preços. | 4 |
| REQ-S1-218 | Permitir o acompanhamento integral de todo o processo licitatório, desde a fase de planejamento e preparação até seu julgamento e conclusão, contemplando o registro e controle das seguintes etapas: a) Publicação do processo licitatório e dos avisos correspondentes; b) Elaboração e emissão do relatório de quadro comparativo de preços ou mapa de preços; c) Registro e emissão das atas referentes à análise da documentação, das propostas e das sessões públicas; d) Impugnações apresentadas por interessados; e) Interposição e julgamento de recursos administrativos; f) Deliberações e pareceres da Comissão de Licitação ou equipe de apoio; g) Parecer jurídico aplicável à fase interna ou externa; h) Anulação ou revogação do processo licitatório, quando houver; i) Homologação e adjudicação do objeto ao vencedor; j) Registro e controle de anexos, documentos, atos e decisões relacionados às fases do processo; k) Possibilitar o reordenamento das fases do processo, quando necessário, respeitando a legislação aplicável. | 4 |
| REQ-S1-219 | Permitir no sistema de compras ser realizado o planejamento (previsão de consumo) para cada setor dentro de um período. | 4 |
| REQ-S1-220 | Permitir consolidar os planejamentos de compras constituindo pedido de compras automaticamente. | 4 |
| REQ-S1-221 | Possibilitar que a geração do documento de oficialização de demanda possa ser realizada pelo próprio sistema em cada setor. | 4 |
| REQ-S1-222 | Possibilitar o setor de compras visualizar todos os documentos de oficialização de demanda. | 4 |
| REQ-S1-223 | Possibilitar o setor de compras emitir relatório de todos os documentos de oficialização de demanda com seus respectivos valores para composição do PCA. | 4 |
| REQ-S1-224 | Dispor de integração com o sistema de licitações permitindo verificar o andamento dos processos de compras. | 4 |
| REQ-S1-225 | Possibilitar o cadastramento de comissões julgadoras informando datas de designação ou exoneração e os membros da comissão. | 4 |
| REQ-S1-226 | Possibilitar a emissão de quadro comparativo de preço após o processo de cotação para ver qual foi o vencedor da menor proposta. | 4 |
| REQ-S1-227 | Dispor de rotina que possibilite que a pesquisa e preço sejam preenchidos pelo próprio fornecedor de forma online. | 4 |
| REQ-S1-228 | Dispor de recurso para encaminhar as oficializações de demanda para aprovação e abertura de processo de compra. | 4 |
| REQ-S1-229 | Possibilitar a emissão do resumo das demandas de compra em andamento, informando em que fase este se encontra e também sua tramitação no processo eletrônico. | 4 |
| REQ-S1-230 | Possibilitar a integração com a execução orçamentária gerando as autorizações de empenho, autorizações de fornecimento e a respectiva reserva. | 4 |
| REQ-S1-231 | Possibilitar a integração com o sistema de arrecadação criticando se o fornecedor possuir débitos fiscais. | 4 |
| REQ-S1-232 | Não permitir a alteração da descrição do material após sua utilização. | 4 |
| REQ-S1-233 | Possuir alerta e relatório no sistema quando o limite de dispensa de licitações for excedido de acordo com o tipo de material / serviço. | 4 |
| REQ-S1-234 | Possibilitar a geração automática de autorização de fornecimento a partir da execução do processo de licitação. | 4 |
| REQ-S1-235 | Possibilitar o controle do total das compras dispensáveis (sem licitações). Possibilitando a geração de ordem de compra pegando os dados da oficialização de demanda. Caso utilize cotação de planilha de preços, o sistema deverá pegar os valores automaticamente. | 4 |
| REQ-S1-236 | Possibilitar a emissão do relatório de autorização de fornecimento. | 4 |
| REQ-S1-237 | Possibilitar a integração com o software de protocolo, podendo o processo ser gerado automaticamente conforme parametrização no ato do pedido de compra/oficialização de demanda. | 4 |
| REQ-S1-238 | Possibilitar a emissão do relatório de valores médios de processos de pesquisa de preço para licitação. | 4 |
| REQ-S1-239 | Dispor do recurso de consolidar vários pedidos/oficialização de demanda com mesma natureza para formação de licitação. | 4 |
| REQ-S1-240 | Dispor de recurso de "gerador de relatório", que permite ao usuário emitir relatório com conteúdo, "layout" e ordens selecionáveis. | 4 |
| REQ-S1-241 | Permitir a criação de modelos de documentos a serem utilizados para justificativa da dispensa de licitação. | 4 |
| REQ-S1-242 | Permitir anulação de processo de compra justificado a sua decisão. | 4 |
| REQ-S1-243 | Permitir a renumeração dos itens da compra, possibilitando ser a ordenação em ordem alfabética. | 4 |

## Seção: Seção de Licitação

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-244 | Permitir o registro dos processos licitatórios identificando o número do processo, objeto, requisições de compra a atender, modalidade de licitação e data do processo. | 4 |
| REQ-S1-245 | Possibilitar meios de acompanhamento de todo o processo de abertura e julgamento da licitação, registrando a habilitação, proposta comercial, interposição de recurso, anulação, adjudicação e emitindo o mapa comparativo de preços. | 4 |
| REQ-S1-246 | Não permitir a utilização das despesas sem que haja disponibilidade orçamentária. | 4 |
| REQ-S1-247 | Permitir sugerir o número da licitação sequencial, ou por modalidade. | 4 |
| REQ-S1-248 | Permitir separar os itens do processo por despesa orçamentária a ser utilizada. | 4 |
| REQ-S1-249 | Permitir copiar os itens de outro processo licitatório, já cadastrado. | 4 |
| REQ-S1-250 | Dispor de rotina que possibilite criar modelos de edital padrão para o uso do sistema sem ter que criar vários modelos para licitações diferentes. | 4 |
| REQ-S1-251 | Dispor de rotina que possibilite a criação de modelos para todos os textos de licitações. | 4 |
| REQ-S1-252 | Dispor do recurso de mesclagem de campos em todos os modelos de documentos requeridos nas etapas da licitação e pesquisa de preços. | 4 |
| REQ-S1-253 | Dispor de configuração de julgamento por técnica, definindo as questões e as respostas. | 4 |
| REQ-S1-254 | Dispor de rotina para verificação de possíveis débitos fiscais no ato da inclusão dos fornecedores na licitação. | 4 |
| REQ-S1-255 | Dispor da ata do processo licitatório automaticamente de acordo com o modelo criado. | 4 |
| REQ-S1-256 | Permitir gerar arquivos para atender as exigências do Tribunal de Contas relativas à prestação de contas dos atos administrativos de licitações e contratos. | 4 |
| REQ-S1-257 | Deverá permitir controlar as despesas realizadas e a realizar, evitando a realização de despesas de mesma natureza com dispensa de licitação ou modalidade de licitação indevida, por ultrapassarem os respectivos limites legais. | 4 |
| REQ-S1-258 | Possibilitar as seguintes consultas a fornecedor: Fornecedor de determinado produto e Licitações vencidas por Fornecedor. | 4 |
| REQ-S1-259 | Possibilitar a consulta ao preço praticado nas licitações, por fornecedor ou material. | 4 |
| REQ-S1-260 | Possibilitar as seguintes consultas ao fornecedor: Fornecedor de determinado produto e Licitações vencidas por Fornecedor. | 4 |
| REQ-S1-261 | Possibilitar a geração de todos os controles, documentos e relatórios necessários ao processo licitatório, tais como: ordenação de despesa, editais de publicação, homologação e adjudicação, atas, termo de análise jurídica, parecer técnico e aviso de licitações. | 4 |
| REQ-S1-262 | Dispor do recurso de "gerador de relatório", que permite ao usuário emitir relatório com conteúdo, "layout" e ordens selecionáveis. | 4 |
| REQ-S1-263 | Possibilitar recurso de fala que ao término de confecção de uma ata a mesma possa ser lida automaticamente pelo sistema para os fornecedores e membros da comissão. | 4 |
| REQ-S1-264 | Possibilitar que o sistema sinalize automaticamente empates no julgamento de preços, de acordo com lei complementar 123/2006, mostrando os valores mínimos e máximos, inclusive a cada rodada de lance do pregão presencial. | 4 |
| REQ-S1-265 | Permitir indicar quais são as empresas empatadas na fase de julgamento dos preços. | 4 |
| REQ-S1-266 | Permitir realizar julgamento por maior desconto ou melhor oferta. | 4 |
| REQ-S1-267 | Permitir que no tipo de julgamento de desconto o sistema permita que as propostas de preços possam ser lançadas em porcentagem inclusive os modelos de ata, homologação. | 4 |
| REQ-S1-268 | Possibilitar controlar a situação do processo de licitação, se ela está anulada, cancelada, concluída, suspensa, licitação deserta, fracassada ou revogada. | 4 |
| REQ-S1-269 | Possibilitar gerar a entrada no almoxarifado a partir da liquidação da mercadoria. | 4 |
| REQ-S1-270 | Dispor da Lei de Licitações em ambiente hipertexto. | 4 |
| REQ-S1-271 | Possuir integração total com o sistema de contabilidade, exportando automaticamente todas as licitações cadastradas do sistema de compras, licitações e contratos. | 4 |
| REQ-S1-272 | Possuir o recurso da Lei Complementar Nº 147/2014, Artigo 48, Inciso III. | 4 |

## Seção: Seção de Pregão Presencial / Eletrônico

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-273 | Possuir sistema de pregão presencial, além de controlar todo o processo. | 4 |
| REQ-S1-274 | Possibilitar a execução do pregão por item ou lote de itens. | 4 |
| REQ-S1-275 | Permitir que o enquadramento dos lotes possa ser realizado de forma automática por Item, classificação de material/serviço ou global. | 4 |
| REQ-S1-276 | Dispor de recurso que possibilite a montagem de lotes selecionando seus respectivos itens. | 4 |
| REQ-S1-277 | Possibilitar o registro de forma sintética dos fornecedores que participarão do pregão. | 4 |
| REQ-S1-278 | Possibilitar a digitação e classificação das propostas iniciais de fornecedores definindo quais participarão dos lances, de acordo com os critérios estabelecidos na Lei do Pregão. | 4 |
| REQ-S1-279 | Permitir a classificação das propostas do Pregão Presencial automaticamente, conforme critérios de classificação impostos na legislação (Lei 10.520). | 4 |
| REQ-S1-280 | Possibilitar o registro dos preços das propostas lance a lance até o declínio do último fornecedor. | 4 |
| REQ-S1-281 | Possibilitar o acompanhamento lance a lance do pregão, através de tela que deve ser atualizada automaticamente mediante a digitação dos lances, permitindo aos fornecedores participantes uma visão global do andamento do pregão. | 4 |
| REQ-S1-282 | Possibilitar a emissão da ATA do Pregão Presencial e histórico com os lances. | 4 |
| REQ-S1-283 | Possuir integração total com o sistema de contabilidade, exportando automaticamente todos os pregões presenciais cadastrados no sistema de compras, licitações e contratos. | 4 |
| REQ-S1-284 | Possibilitar que a tela onde são gerenciados os lances dos processos licitatórios na modalidade de pregão possa ser maximizada. | 4 |
| REQ-S1-285 | Possibilitar para processos na modalidade de pregão que seja visualizada na tela de lances a informação de que o valor arrematado/vencedor do lote está superior ao valor médio. | 4 |

## Seção: Seção de Registro de Preços

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-286 | Possibilitar registrar e emitir as requisições de compras e serviços para registro de preço. | 4 |
| REQ-S1-287 | Possuir controle necessário para Registro de Preços, de acordo com a Lei 14.133/2021, facilitando assim o controle de entrega das mercadorias licitadas, diminuindo a necessidade de controle de mercadorias em estoque físico. | 4 |
| REQ-S1-288 | Possibilitar registrar e emitir atas de julgamentos registrando o preço dos fornecedores. | 4 |
| REQ-S1-289 | Possuir base de preços registrados. | 4 |
| REQ-S1-290 | Possibilitar a geração do termo de compromisso para o fornecedor vencedor. | 4 |
| REQ-S1-291 | Possibilitar a geração automática da autorização de fornecimento aos fornecedores mediante registro de preço. | 4 |
| REQ-S1-292 | Possibilitar para os registros de preços ao qual o critério de julgamento seja menor preço global. | 4 |
| REQ-S1-293 | Possibilitar no registro de termo de adesão de registro de preços, informar a origem, número do processo do órgão gerenciador (Origem). | 4 |
| REQ-S1-294 | Permitir a geração de contrato da ata de registro de preço. | 4 |

## Seção: Seção de Contratos

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-295 | Possibilitar o registro e controle dos contratos (objeto, valor contratado, vigência, cronograma de entrega e pagamento e penalidades pelo não cumprimento) e seus aditivos, reajustes e rescisões, bem como o número das notas de empenho. | 4 |
| REQ-S1-296 | Possibilitar que a geração do contrato seja de forma automática sem que o usuário tenha que redigitar todo o processo. | 4 |
| REQ-S1-297 | Permitir que possa ser criado o modelo do contrato com campos de mesclagem para serem usados pelo sistema. | 4 |
| REQ-S1-298 | Possibilitar a definição e o estabelecimento de cronograma de entrega dos itens dos contratos. | 4 |
| REQ-S1-299 | Possibilitar a definição e o estabelecimento de cronograma de pagamentos dos contratos. | 4 |
| REQ-S1-300 | Possibilitar o controle do saldo de material contratado. | 4 |
| REQ-S1-301 | Possibilitar a rescisão do contrato indicando motivo e data. | 4 |
| REQ-S1-302 | Possibilitar registrar as medições da execução do contrato informando o percentual de conclusão a cada medição. | 4 |
| REQ-S1-303 | Dispor do recurso para cadastramento de aditamento contratual. | 4 |
| REQ-S1-304 | Dispor de recurso que possibilite avisar com antecedência o vencimento dos contratos. | 4 |
| REQ-S1-305 | Dispor de recurso que possibilite controlar contratos por unidade gestora. | 4 |
| REQ-S1-306 | Possibilitar integração total com o sistema de contabilidade, exportando automaticamente todos os contratos cadastrados no sistema de compras, licitações e contratos. | 4 |
| REQ-S1-307 | Permitir a inserção do registro de ocorrências em contratos, para possuir o controle histórico de paralisações, situação contratual e demais informações que forem necessárias ao órgão. | 4 |
| REQ-S1-308 | Possibilitar o registro das obrigações contratuais (forma de pagamento, forma de fornecimento, prazo de execução, multa rescisória, multa por inadimplência e garantia contratual). | 4 |
| REQ-S1-309 | Permitir a emissão do relatório de razão do contrato. | 4 |
| REQ-S1-310 | Permitir informar a secretaria no cadastro de fiscal do contrato, para contratos que possuem mais de uma secretaria. | 4 |

## Seção: Seção de Convênios

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-311 | Permitir registrar os fiscais do convênio. | 4 |
| REQ-S1-312 | Permitir que possa ser criado o modelo do convênio com campos de mesclagem para serem usados pelo sistema. | 4 |
| REQ-S1-313 | Permitir o registro de dados específicos do convênio como: banco, agência, conta bancária, fontes, aplicação financeira, responsável e data do final da prestação de contas. | 4 |
| REQ-S1-314 | Permitir o registro de dados referentes às liberações. | 4 |
| REQ-S1-315 | Permitir o registro dos tipos Fomento, Colaboração e Acordo. | 4 |
| REQ-S1-316 | Permitir o registro da rescisão dos convênios indicando motivo e data. | 4 |
| REQ-S1-317 | Permitir o cadastramento de aditamento do convênio. | 4 |
| REQ-S1-318 | Dispor de recurso que possibilite avisar com antecedência o vencimento dos convênios. | 4 |
| REQ-S1-319 | Dispor de recurso que possibilite controlar convênios por unidade gestora. | 4 |
| REQ-S1-320 | Possibilitar integração total com o sistema de contabilidade, exportando automaticamente todos os convênios cadastrados no sistema. | 4 |

## Seção: Seção de Relatórios

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-321 | Possibilitar a consulta dinâmica mediante relatório gerencial das movimentações de mercadorias, por período, dotação ou por almoxarifado, listando todas as entradas e saídas. | 4 |
| REQ-S1-322 | Possibilitar a emissão de relatório de listagem de compras/licitações por período. | 4 |
| REQ-S1-323 | Possibilitar a emissão de relatório de listagem de itens de compra concluída. | 4 |
| REQ-S1-324 | Possibilitar a emissão de relatório de Planejamento de Compra (Previsão de Consumo). | 4 |
| REQ-S1-325 | Possibilitar a emissão de relatório que demonstra o pedido de compra com todos os detalhes de materiais e serviços, assim como suas especificações, quantidades e valores. | 4 |
| REQ-S1-326 | Possibilitar a emissão de relatório contendo os detalhes da pesquisa de preço para ser enviado para o fornecedor para que o mesmo possa preencher com seus preços. | 4 |
| REQ-S1-327 | Possibilitar a emissão de relatório que imprime o documento personalizado de pesquisa de preços com todo seu texto e detalhes. | 4 |
| REQ-S1-328 | Possibilitar a emissão de relatório dos documentos diversos informados na pesquisa de preço. | 4 |
| REQ-S1-329 | Possibilitar a emissão de relatório que demonstre as informações de situação da pesquisa de preços assim como seu texto. | 4 |
| REQ-S1-330 | Possibilitar a emissão de relatório que demonstre o texto do aviso ou publicação do edital. | 4 |
| REQ-S1-331 | Possibilitar a emissão de relatório que mostra em uma folha as principais informações da licitação para ser utilizada como capa de edital. | 4 |
| REQ-S1-332 | Possibilitar a emissão de relatório do edital da licitação com todo seu texto e detalhes. | 4 |
| REQ-S1-333 | Possibilitar a emissão de relatório com texto para ser enviado ao setor jurídico para avaliação do processo de licitação. | 4 |
| REQ-S1-334 | Possibilitar a emissão de relatório da minuta de edital da licitação com todo seu texto e detalhes. | 4 |
| REQ-S1-335 | Possibilitar a emissão de relatório de ordenação de despesa com seu devido texto para ser encaminhado para a contabilidade. | 4 |
| REQ-S1-336 | Possibilitar a emissão de relatório com o texto do parecer jurídico sobre o processo de licitação. | 4 |
| REQ-S1-337 | Possibilitar a emissão de relatório que imprime para os licitantes o comprovante de recebimento de edital. | 4 |
| REQ-S1-338 | Possibilitar a emissão de relatório que demonstra o texto do parecer técnico sobre as amostras dos materiais dos licitantes. | 4 |
| REQ-S1-339 | Possibilitar a emissão de relatório que mostra o texto de registro de um determinado licitante para uma licitação. | 4 |
| REQ-S1-340 | Possibilitar a emissão de relatório do registro das ocorrências efetuadas. | 4 |
| REQ-S1-341 | Possibilitar a emissão de relatório que mostra o texto da pré-homologação / adjudicação da licitação. | 4 |
| REQ-S1-342 | Possibilitar a emissão de relatório que mostra o texto das atas feitas durante o processo de licitação. | 4 |
| REQ-S1-343 | Possibilitar a emissão de relatório contendo o texto final da homologação da licitação. | 4 |
| REQ-S1-344 | Possibilitar a emissão de relatório contendo o texto do parecer da comissão sobre a conclusão do processo de licitação. | 4 |
| REQ-S1-345 | Possibilitar a emissão de relatório que mostra as informações de situação de licitação assim como seu texto. | 4 |
| REQ-S1-346 | Possibilitar a emissão de relatório que mostra uma lista de licitações para a comissão de licitação poder se organizar e saber qual é a programação semanal, quinzenal, etc... das suas licitações. | 4 |
| REQ-S1-347 | Possibilitar a emissão de relatório que mostra os preços que foram obtidos por fornecedor. | 4 |
| REQ-S1-348 | Possibilitar a emissão de relatório que mostra os valores médios das propostas de preços. | 4 |
| REQ-S1-349 | Possibilitar a emissão de relatório que mostra o quadro comparativo de preços com todos os fornecedores e valores avaliando e indicando vencedores. | 4 |
| REQ-S1-350 | Possibilitar a emissão de relatório final de preços com todos os fornecedores que venceram e seus respectivos detalhes. | 4 |
| REQ-S1-351 | Possibilitar a emissão de relatório que mostra os valores médios para a devida reserva contábil de acordo com o processo licitatório, órgãos e respectivas dotações. | 4 |
| REQ-S1-352 | Possibilitar a emissão de relatório que mostra os valores totalizados de compras para cada modalidade de compra. | 4 |
| REQ-S1-353 | Possibilitar a emissão de relatório que mostra os valores totalizados de compras para cada tipo realizadas pela modalidade dispensa. | 4 |
| REQ-S1-354 | Possibilitar a emissão de relatório contendo o extrato da ata de registro de preços. | 4 |
| REQ-S1-355 | Possibilitar a emissão de relatório que mostra uma listagem de todos os materiais registrados com suas respectivas especificações e valor unitário para serem publicados. | 4 |
| REQ-S1-356 | Possibilitar a emissão de relatório que imprime as informações para acompanhamento dos termos de compromisso a vencer dentro de um período. | 4 |
| REQ-S1-357 | Possibilitar a emissão de relatório que imprime o texto do contrato. | 4 |
| REQ-S1-358 | Possibilitar a emissão de relatório que demonstra o saldo inicial, saldo emitido, saldo recebido e o saldo atual de contratos vigentes. | 4 |
| REQ-S1-359 | Possibilitar a emissão de relatório que mostra as informações para acompanhamento dos contratos por situação. | 4 |
| REQ-S1-360 | Possibilitar a emissão de relatório que imprime o texto do convênio. | 4 |
| REQ-S1-361 | Possibilitar a emissão de relatório que reproduz as informações para acompanhamento dos convênios a vencer dentro de um período. | 4 |
| REQ-S1-362 | Possibilitar a emissão de relatório que mostra as autorizações de fornecimento/execução em aberto com estimativas de datas de entrega dentro de um período. | 4 |
| REQ-S1-363 | Possibilitar a emissão de relatório que demonstra a relação de autorização de fornecimento por Fornecedor dentro de um período. | 4 |
| REQ-S1-364 | Possibilitar a emissão de relatório de autorização de fornecimento / execução com todos os detalhes da compra a ser efetuada. | 4 |
| REQ-S1-365 | Possibilitar a emissão de relatório que mostra todos os documentos a vencer / vencidos de fornecedores dentro do período informado. | 4 |
| REQ-S1-366 | Possibilitar a emissão de relatório que mostra todas as licitações que o fornecedor participou e venceu por um período. | 4 |
| REQ-S1-367 | Possibilitar a emissão de relatório que contém a relação de fornecedores por atividade/linhas de fornecimento. | 4 |
| REQ-S1-368 | Possibilitar a emissão de relatório contendo a relação de compras efetuadas dentro de um período. | 4 |
| REQ-S1-369 | Possibilitar a emissão de relatório contendo a listagem de todos os contratos dentro de um período desejado. | 4 |

## Seção: Seção de Integrações

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-370 | Possibilitar que o catálogo de materiais e serviços sejam integrados com os módulos/sistema de almoxarifado e patrimônio. | 6 |
| REQ-S1-371 | Possibilitar que o cadastro de unidade de medida seja integrado com os sistemas/módulos de almoxarifado e patrimônio. | 6 |
| REQ-S1-372 | Possibilitar que o cadastro de fornecedores seja integrado com os módulos/sistemas de contabilidade, almoxarifado e patrimônio. | 6 |
| REQ-S1-373 | Permitir a integração com o software de almoxarifado disponibilizando as ordens de compra para posterior entrada. | 6 |
| REQ-S1-374 | Permitir a integração com o software de receitas tributárias, verificando/bloqueando/alertando débitos fiscais de fornecedores, sendo possível não avisar, verificar e bloquear ou verificar e alertar. | 6 |
| REQ-S1-375 | Possibilitar integração de dados junto ao Portal da Transparência, permitindo a exportação para a divulgação das informações mínimas sobre as licitações, dispensas e inexigibilidade, contratos e ordens de compras do órgão publicante. | 6 |
| REQ-S1-376 | Permitir a integração com o sistema de protocolo, possibilitando que possam ser gerados processos automaticamente quando algum pedido de compra for gerado, ou pedir a confirmação da geração de processos quando algum pedido de compra for gerado, ou deixar que o processo possa ser criado e relacionado manualmente. | 6 |
| REQ-S1-377 | Permitir a integração com sistema de contabilidade empenhando e liquidando as AFs e AEs automaticamente. | 6 |
| REQ-S1-378 | Possibilitar a integração com o sistema de contabilidade pública, exportando as: autorização de empenho (AE), autorização de complementação de empenho, anulação de empenho, autorização de liquidação (AF) e anulação de (AF). | 6 |
| REQ-S1-379 | Possibilitar a integração total com o sistema de contabilidade pública, exportando automaticamente todas as licitações cadastradas do sistema, dispensas e inexigibilidade, contratos concedidos e recebidos e seus aditivos, convênios concedidos e recebidos e seus aditivos. | 6 |
| REQ-S1-380 | Possibilitar a integração com o sistema de contabilidade pública possibilitando gerar/exportar a reserva orçamentária. | 6 |
| REQ-S1-381 | Possibilitar a integração com o sistema de contabilidade pública realizando a importação de dotações orçamentárias. | 6 |

## Seção: Seção de Prestação de Contas ES

| ID | Requisito | Fase |
|---|---|---|
| REQ-S1-382 | Permitir a geração de arquivos destinados à prestação de contas do TCE-ES (Tribunal de Contas do Estado do Espírito Santo). | 7 |
| REQ-S1-383 | Deverá permitir a impressão de relatório para conferência de inconsistências a serem corrigidas no sistema antes de gerar os arquivos para o TCE-ES (Tribunal de Contas do Estado do Espírito Santo). | 7 |
| REQ-S1-384 | O Software deverá realizar a emissão de relatórios destinados à prestação de contas do estado conforme o TCE-ES. | 7 |
