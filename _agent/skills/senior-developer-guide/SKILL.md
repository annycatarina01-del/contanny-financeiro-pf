---
name: senior-developer-guide
description: Manual de Boas Práticas e Arquitetura para Sistemas React, TypeScript e Supabase.
---

# Manual de Boas Práticas: O Guia Definitivo do Desenvolvedor Sênior

Autor: Manus AI

## Prefácio
Este manual transcende a mera coleção de boas práticas; ele é um compêndio de princípios arquiteturais e diretrizes operacionais forjadas na experiência de construção de sistemas complexos e de missão crítica. Destinado a desenvolvedores seniores, líderes técnicos e arquitetos de software, este guia estabelece um padrão de excelência para a concepção, desenvolvimento e manutenção de aplicações robustas, escaláveis e seguras, com foco em ecossistemas modernos como React, TypeScript e Supabase.

Em um cenário onde a velocidade de entrega é crucial, mas a integridade e a segurança são inegociáveis, a adoção de uma arquitetura bem definida e de processos rigorosos torna-se a espinha dorsal do sucesso. Este documento detalha não apenas o que fazer, mas por que certas abordagens são preferíveis, fornecendo exemplos práticos, complementos técnicos e perguntas de revisão que estimulam o pensamento crítico e a autoavaliação contínua.

O objetivo final é capacitar o desenvolvedor sênior a atuar como um verdadeiro arquiteto de soluções, capaz de construir sistemas que não apenas atendam aos requisitos funcionais, mas que também sejam resilientes, seguros e eficientes a longo prazo.

---

## 1. Arquitetura de Frontend e Componentização: A Arte da Separação de Responsabilidades

A construção de interfaces de usuário modernas exige uma abordagem meticulosa para a organização do código. A arquitetura de frontend deve ser projetada para garantir que cada parte do sistema tenha uma responsabilidade clara e única, promovendo a manutenibilidade, a testabilidade e a escalabilidade. Este princípio, conhecido como Separação de Responsabilidades, é a pedra angular de qualquer sistema frontend robusto.

### 1.1. As Três Camadas Fundamentais do Frontend

Conforme as diretrizes estabelecidas, o frontend deve ser segmentado em três camadas distintas, cada uma com um propósito bem definido. Esta divisão não é meramente estética, mas funcional, prevenindo o acoplamento indesejado e facilitando a evolução do sistema.

| Camada | Localização Padrão | Responsabilidade Primária | Características Chave | Exemplos |
| :--- | :--- | :--- | :--- | :--- |
| **Páginas (Pages)** | `src/modules/{modulo}/*.page.tsx` | Orquestrar o fluxo da aplicação, gerenciar o estado global e local da página, e coordenar a interação entre os componentes. São os "controladores" da interface. | Montam a tela, buscam dados via services e hooks, e passam as informações para os componentes filhos. Devem ser o mais "finas" possível em termos de lógica de apresentação. | `ClientesPage.tsx`, `DashboardPage.tsx` |
| **Componentes de Módulo** | `src/modules/{modulo}/components/` | Encapsular a lógica de negócio e a apresentação de uma funcionalidade específica dentro de um módulo. Interagem com o usuário e disparam eventos. | São componentes "inteligentes" que podem ter estado interno e lógica de interação. Devem ser reutilizáveis dentro do contexto do seu módulo. | `ClienteFormAdd.tsx`, `ProdutoCard.tsx`, `PedidoList.tsx` |
| **Componentes de UI (Dumb Components)** | `src/lib/ui/` | Fornecer blocos de construção visuais reutilizáveis, sem qualquer lógica de negócio ou estado interno. São puramente apresentacionais. | Recebem todas as suas propriedades via `props` e emitem eventos. São os "átomos" da interface, garantindo consistência visual e facilidade de estilização. | `Botao.tsx`, `Input.tsx`, `Modal.tsx`, `Spinner.tsx` |

### 1.2. Regras de Ouro para Componentização

1.  **Componentes não fazem chamadas de API**: Esta é uma regra fundamental. Componentes visuais devem ser consumidores de dados, não provedores. Eles devem receber todas as informações necessárias via `props` ou através de hooks customizados que abstraem a camada de acesso a dados. Isso garante que o componente seja independente da fonte de dados, facilitando testes e a reutilização. Por exemplo, um `UserCard` deve receber um objeto `user` como prop, e não ser responsável por buscar os dados do usuário do servidor.
2.  **Separação Clara entre Páginas e Componentes**: As Páginas (`.page.tsx`) atuam como orquestradores. Elas são responsáveis por montar a tela, gerenciar o estado da rota, buscar os dados necessários (utilizando os services e hooks apropriados) e passar esses dados para os Componentes de Módulo que compõem a interface. Os Componentes de Módulo, por sua vez, focam na lógica de interação e apresentação de uma funcionalidade específica, sem se preocupar com a orquestração da página inteira.
3.  **Componentes de UI "Burros" (`/ui`)**: A pasta `src/lib/ui` deve conter apenas componentes puramente visuais, sem qualquer lógica de negócio. Estes são os blocos de construção básicos, como botões, inputs, modais, tipografia, etc. Eles devem ser altamente reutilizáveis e configuráveis via `props`, garantindo a consistência do design system e facilitando a manutenção visual. A lógica de negócio ou o estado da aplicação não devem residir nesses componentes.

### 1.3. Legibilidade e Acessibilidade da Interface

Um aspecto frequentemente negligenciado, mas crucial para a experiência do usuário e a conformidade com padrões de acessibilidade, é a legibilidade dos elementos da interface. Conforme a `design_rules` especificada:

> **INPUT_LEGIBILITY**: TODOS os campos de entrada de texto (inputs, textareas, etc.) DEVEM, por padrão, ter um fundo claro (ex: `#FFFFFF`) e cor de fonte escura (ex: `#111827`) para garantir a máxima legibilidade. Esta regra só pode ser quebrada se o usuário pedir explicitamente uma cor diferente.

Esta regra visa garantir que a interface seja utilizável por uma ampla gama de usuários, incluindo aqueles com deficiências visuais ou em condições de iluminação adversas. A consistência visual e a acessibilidade são marcas de um design sênior e atencioso.

### 1.4. Exemplo Prático de Componentização

Considere um módulo de **Clientes**:

*   `src/modules/clientes/clientes.page.tsx`: Esta página seria responsável por buscar a lista de clientes (talvez usando um `useQuery` do TanStack Query que chama `clienteService.getAll()`) e renderizar um `ClienteList` e um `ClienteFormAdd`.
*   `src/modules/clientes/components/ClienteList.tsx`: Receberia a lista de clientes como `props` e renderizaria vários `ClienteCard`.
*   `src/modules/clientes/components/ClienteCard.tsx`: Receberia um único objeto `cliente` como `prop` e exibiria seus detalhes. Poderia ter um botão de "Editar" que dispara um evento (`onEdit(cliente.id)`).
*   `src/modules/clientes/components/ClienteFormAdd.tsx`: Conteria o formulário para adicionar um novo cliente. Ele chamaria `clienteService.create()` quando o formulário fosse submetido.
*   `src/lib/ui/Input.tsx`, `src/lib/ui/Button.tsx`: Componentes genéricos de UI usados em `ClienteFormAdd` e `ClienteCard`.

### 1.5. Perguntas de Revisão para Arquitetura de Frontend

Ao revisar o código frontend, um desenvolvedor sênior deve se questionar:

*   **Desacoplamento**: Se eu precisar trocar a biblioteca de UI (ex: de Tailwind para Material UI), qual o impacto? A lógica de negócio está misturada com a apresentação?
*   **Reutilização**: Este componente é genérico o suficiente para ser reutilizado em outros contextos? Se não, ele está no lugar certo (dentro de um módulo específico)?
*   **Testabilidade**: É fácil escrever testes unitários para este componente sem precisar montar toda a aplicação?
*   **Coesão**: Este arquivo ou componente tem uma única responsabilidade bem definida? Ele faz apenas uma coisa e faz bem?
*   **Escalabilidade**: Se o número de funcionalidades ou a complexidade da interface aumentar, esta estrutura se manterá organizada ou se tornará um "spaghetti code"?

---

## 2. A Camada de Serviço e Segurança: O Guardião do Backend (Edge Functions do Supabase)

A camada de serviço, frequentemente implementada através de Edge Functions (como as do Supabase), desempenha um papel crucial na arquitetura de um sistema moderno. Ela atua como um "garçom inteligente" ou um "porteiro rigoroso", controlando o acesso ao banco de dados e executando a lógica de negócio sensível em um ambiente seguro e controlado. Esta camada é a primeira linha de defesa contra acessos não autorizados e a garantia de que as operações críticas sejam executadas com integridade.

### 2.1. Regras de Ouro para a Camada de Serviço

1.  **Privilégios Mínimos e Proteção da `service_role` Key**: A `service_role` key do Supabase concede privilégios de administrador e NUNCA deve ser exposta no frontend. Ela deve residir exclusivamente em ambientes seguros de backend, como as Edge Functions. Isso impede que usuários mal-intencionados obtenham acesso irrestrito ao banco de dados, mesmo que consigam comprometer o código do cliente. As Edge Functions, por sua natureza, executam em um ambiente isolado e podem acessar essas chaves de forma segura, sem expô-las ao navegador.
2.  **Abstração por Funcionalidade de Negócio, não por Tabela**: Em vez de criar endpoints que espelham diretamente as operações CRUD de uma tabela (ex: `GET /lancamentos`, `POST /contas`), a camada de serviço deve expor funcionalidades de negócio. Por exemplo, em vez de `POST /transacoes`, teríamos `POST /processar-pagamento` ou `GET /extrato-financeiro`. Esta abordagem oferece várias vantagens:
    *   **Segurança Aprimorada**: Permite que a Edge Function execute múltiplas operações atômicas no banco de dados sob uma única transação, aplicando validações e regras de negócio complexas antes de persistir os dados.
    *   **Manutenibilidade**: A lógica de negócio fica encapsulada em um único local, facilitando a manutenção e a evolução. O frontend não precisa saber os detalhes de como um pagamento é processado, apenas que ele pode chamar a função `processar-pagamento`.
    *   **Auditoria**: As chamadas de API refletem as intenções de negócio, tornando os logs mais compreensíveis e a auditoria mais eficaz.
3.  **Validação Agressiva dos Dados de Entrada**: Toda e qualquer entrada de dados que chega à camada de serviço, seja do frontend ou de outros serviços, deve ser validada agressivamente. Ferramentas como a biblioteca Zod para TypeScript são excelentes para definir schemas de validação robustos e garantir que os dados estejam no formato e tipo esperados. Isso previne ataques de injeção, erros de lógica e corrupção de dados. Retorne códigos de erro HTTP apropriados (ex: `400 Bad Request` para dados inválidos) para que o frontend possa tratar o erro de forma amigável.

### 2.2. Exemplo Prático: Processamento de Pagamento

Em um sistema financeiro, um pedido de pagamento não deve ser uma simples inserção na tabela de transações. Ele envolve uma série de verificações e atualizações atômicas. Uma Edge Function para `processar-pagamento` poderia:

1.  Receber o `entry_id`, `account_id` e `amount` do frontend.
2.  Validar os dados de entrada usando Zod.
3.  Verificar as permissões do usuário (se ele pertence à organização correta e tem autorização para realizar pagamentos).
4.  Iniciar uma transação SQL no banco de dados.
5.  Verificar se o `entry_id` existe e se o status permite o pagamento.
6.  Verificar se a `account_id` tem saldo suficiente.
7.  Inserir uma nova `financial_transaction` (saída).
8.  Atualizar o saldo da `account`.
9.  Atualizar o status da `financial_entry` para `paid` ou `partially_paid`.
10. Commitar a transação SQL.
11. Retornar um status de sucesso ou erro.

Este fluxo garante que todas as etapas sejam concluídas com sucesso ou que nenhuma alteração seja persistida, mantendo a integridade financeira.

### 2.3. Perguntas de Revisão para a Camada de Serviço

Ao desenvolver ou revisar uma Edge Function ou serviço de backend, considere:

*   **Vulnerabilidade**: Se um usuário mal-intencionado conseguir manipular o payload da requisição, ele poderia realizar uma operação não autorizada ou corromper dados?
*   **Exposição de Segredos**: Há alguma chave de API, credencial ou informação sensível que está sendo exposta ou que poderia ser inferida a partir do código ou do comportamento da função?
*   **Tratamento de Erros**: A função lida com todos os cenários de erro (dados inválidos, permissão negada, falha no banco de dados) e retorna mensagens claras e códigos HTTP apropriados?
*   **Reutilização**: Esta função é genérica o suficiente para ser usada por diferentes partes do frontend ou por outros serviços internos?
*   **Desempenho**: A função está otimizada para ser executada rapidamente? Há operações de I/O desnecessárias ou loops ineficientes?

---

## 3. Banco de Dados: A Fonte da Verdade e o Guardião da Integridade (PostgreSQL)

O banco de dados não é meramente um repositório de informações; ele é o cérebro do sistema, a fonte da verdade inquestionável para todas as operações de negócio. Em sistemas financeiros, a integridade dos dados é paramount, e o PostgreSQL, com suas capacidades transacionais e extensibilidade, é a escolha ideal para ser o guardião dessa integridade. A lógica de negócio crítica e as regras mais importantes devem residir o mais próximo possível dos dados, ou seja, no próprio banco de dados.

### 3.1. O Princípio Mestre: A Separação dos Poderes Financeiros

O conteúdo fornecido introduz um modelo mental poderoso para sistemas financeiros, separando o universo financeiro em três dimensões distintas. Esta abordagem evita o erro comum de tratar todas as movimentações como uma única "transação", o que pode levar a inconsistências e dificuldades de auditoria.

| Dimensão | Tabela Base | Foco Temporal | Responsabilidade | Regra de Ouro | Exemplo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **O Futuro (As Promessas)** | `financial_entries` | O que vai ou deveria acontecer. | Gerencia expectativas e obrigações. | Uma promessa não é dinheiro real. | Um boleto a pagar, uma fatura a receber. |
| **O Presente (A Realidade)** | `accounts` | Onde o dinheiro está agora. | Representa os saldos atuais. | O saldo é uma consequência das transações, nunca uma fonte de verdade editável manualmente. | Contas bancárias, caixa físico, carteiras digitais. |
| **O Passado (A Verdade Imutável)** | `financial_transactions` | O que já aconteceu, passo a passo. | A verdade absoluta. Livro-razão imutável. | Cada centavo que se moveu é um fato. Só `financial_transactions` movem dinheiro. | Um depósito, um saque, um pagamento. |

### 3.2. Tabelas Atômicas e o Livro-Razão Imutável

As tabelas `contas` e `lancamentos` (ou `financial_transactions`) são o coração deste modelo. A tabela `contas` armazena o estado atual dos cofres, enquanto `lancamentos` registra o histórico imutável de todas as movimentações.

```sql
-- Contas bancárias. O saldo é a verdade absoluta.
CREATE TABLE contas (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  saldo NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  organization_id UUID REFERENCES organizations(id) NOT NULL, -- Para multitenancy
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Para RLS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- O livro-razão. Imutável. Cada linha é um fato que ocorreu.
CREATE TABLE lancamentos (
  id UUID PRIMARY KEY,
  conta_id UUID REFERENCES contas(id) NOT NULL,
  descricao TEXT,
  valor NUMERIC(15, 2) NOT NULL, -- Positivo para crédito, negativo para débito
  data_transacao DATE NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL, -- Para multitenancy
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Para RLS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Complemento Técnico**: A inclusão de `organization_id` e `user_id` é crucial para a implementação de Multitenancy e Row Level Security (RLS), conforme será detalhado na Seção 4. O `created_at` é essencial para auditoria e ordenação cronológica.

### 3.3. A Função de Negócio (Stored Procedures/RPC)

A lógica de negócio crítica, especialmente aquela que envolve a integridade de múltiplos registros, deve ser encapsulada em funções SQL (Stored Procedures) e exposta via RPC (Remote Procedure Call). Isso garante atomicidade (Tudo ou Nada) e centraliza a lógica onde ela é mais segura e eficiente.

```sql
CREATE OR REPLACE FUNCTION public.inserir_lancamento(p_conta_id UUID, p_descricao TEXT, p_valor NUMERIC)
RETURNS VOID AS $$
BEGIN
  -- 1. Insere o fato no livro-razão
  INSERT INTO public.lancamentos (conta_id, user_id, descricao, valor, data_transacao)
  VALUES (p_conta_id, auth.uid(), p_descricao, p_valor, now()::date);

  -- 2. Atualiza o saldo de forma atômica
  UPDATE public.contas
  SET saldo = saldo + p_valor
  WHERE id = p_conta_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Regra #6: `SECURITY DEFINER`**: Esta cláusula é vital. Ela permite que a função seja executada com os privilégios do usuário que a definiu (geralmente um administrador), e não do usuário que a chamou. Isso é fundamental para que a função possa realizar operações que o usuário comum não teria permissão direta, como atualizar o saldo de uma conta. No entanto, a função deve internamente restringir a operação ao usuário correto, utilizando `auth.uid()` para garantir que apenas os dados pertencentes ao usuário autenticado sejam afetados. Isso cria um gatekeeper seguro para operações sensíveis.

### 3.4. A View de Relatório (Leitura Otimizada)

Para facilitar a leitura e a geração de relatórios, as `VIEWS` são ferramentas poderosas. Elas abstraem a complexidade de `JOINs` e fornecem uma interface simplificada para o consumo de dados, sem duplicá-los.

```sql
CREATE OR REPLACE VIEW public.vw_extrato_financeiro AS
SELECT l.id, l.data_transacao, l.descricao, l.valor, c.nome AS nome_conta
FROM lancamentos l
JOIN contas c ON l.conta_id = c.id
ORDER BY l.data_transacao DESC;
```

**Complemento Técnico**: Views são ideais para consultas frequentes e complexas. No entanto, para grandes volumes de dados, Materialized Views podem ser consideradas para pré-computar e armazenar os resultados, melhorando significativamente o desempenho de leitura à custa de uma atualização periódica.

### 3.5. Fluxos de Trabalho Atômicos Detalhados

O manual fornecido detalha fluxos de trabalho atômicos para operações financeiras comuns. A chave é que todas essas operações devem ser encapsuladas em funções SQL (RPC) para garantir a atomicidade e a integridade.

*   **🟢 Pedido de Compra**
    1. Criação: Um pedido de compra gera um `purchase_order` e uma `financial_entry` do tipo `payable` (a pagar) com `status=open`.
    2. Pagamento: A operação de pagamento é realizada através de uma RPC, por exemplo, `rpc.pay_entry(entry_id, account_id, amount)`. Internamente, esta função executa:
        * `BEGIN` (inicia a transação).
        * Verifica o saldo disponível na `account_id`.
        * Insere uma `financial_transaction` (saída) na tabela `lancamentos`.
        * Atualiza o saldo da `account_id`.
        * Atualiza o status da `financial_entry`.
        * `COMMIT` (finaliza a transação, persistindo todas as alterações ou revertendo tudo em caso de erro).

*   **🟢 Pedido de Venda**
    1. Criação: Um pedido de venda gera um `sales_order` e uma `financial_entry` do tipo `receivable` (a receber) com `status=open`.
    2. Recebimento: A operação de recebimento é feita via RPC, por exemplo, `rpc.receive_entry(entry_id, account_id, amount)`. Internamente, esta função executa:
        * `BEGIN`.
        * Insere uma `financial_transaction` (entrada) na tabela `lancamentos`.
        * Atualiza o saldo da `account_id`.
        * Atualiza o status da `financial_entry`.
        * `COMMIT`.

*   **🔁 Transferência entre Contas**
    * A transferência é uma operação crítica que deve ser tratada como uma única transação atômica. A RPC `rpc.transfer(from_account, to_account, amount)` deve gerar DUAS transações (OUT na conta de origem e `IN` na conta de destino) e atualizar ambos os saldos dentro de um único bloco `BEGIN...COMMIT`. Isso evita cenários onde o dinheiro "some" ou "aparece" devido a falhas parciais.

*   **🏦 Empréstimos, Sócios e Patrimônio**
    * **Empréstimos**: O recebimento de um empréstimo gera uma `financial_entry` (do tipo `loan payable`) e uma `financial_transaction` (entrada). O pagamento das parcelas segue o fluxo `pay_entry`.
    * **Sócios**: Aportes de capital geram `financial_transactions` (entrada). Retiradas geram `financial_transactions` (saída).
    * **Patrimônio**: A compra/venda de ativos gera `financial_entries` vinculadas ao ativo. A movimentação financeira associada segue o fluxo padrão de pagamentos/recebimentos.

### 3.6. Regras de Ouro e Arquitetura Segura do Banco de Dados

1.  **Saldo Sagrado**: O saldo de uma conta (`accounts.saldo`) deve ser atualizado SOMENTE dentro de funções SQL (RPCs ou Triggers). NUNCA deve ser atualizado diretamente via `UPDATE` manual ou por lógica no frontend. O saldo é uma consequência do histórico de transações, não um valor que pode ser arbitrariamente alterado.
2.  **Histórico Imutável**: Transações financeiras (`financial_transactions`) nunca devem ser apagadas. Se um erro ocorreu, a correção deve ser feita através de um Estorno, que é uma nova transação de compensação. Isso mantém um registro completo e auditável de todas as movimentações, essencial para conformidade e resolução de disputas.
3.  **Sincronização Realtime**: Para sistemas que exigem reatividade, as tabelas `financial_transactions`, `accounts` e `financial_entries` devem ser monitoradas para mudanças. A interface do usuário deve refletir instantaneamente essas mudanças, utilizando mecanismos como o Supabase Realtime em conjunto com o TanStack Query para invalidar e revalidar caches.
4.  **Atomicidade**: Qualquer operação que envolva a modificação de mais de uma tabela ou que exija a manutenção da integridade transacional DEVE ser encapsulada em um bloco `BEGIN...COMMIT` no SQL. Isso garante que a operação seja tratada como uma unidade indivisível.
5.  **Validação Rigorosa**: Além da validação na camada de serviço, o banco de dados deve impor suas próprias regras de validação. Isso inclui verificar `company_id` (para multitenancy), saldo disponível (antes de um débito) e o status do registro (se uma `financial_entry` pode ser paga, por exemplo) antes de processar qualquer alteração.

### 3.7. Visão Final: A Única Verdade

> **Tudo o que se refere ao dinheiro converge para: `financial_transactions`.**
> Se não está no diário de bordo, o dinheiro não se moveu. Se o saldo não bate com a soma das transações, a integridade foi quebrada.

Esta máxima resume a filosofia de um sistema financeiro robusto. A tabela `financial_transactions` é o registro definitivo de todos os eventos monetários. Qualquer discrepância entre o saldo atual de uma conta e a soma de suas transações indica uma falha crítica na integridade do sistema. A arquitetura proposta segue o fluxo: Pedido → Entry → RPC → Transaction → Saldo, onde cada etapa é validada e protegida.

### 3.8. Perguntas de Revisão para Banco de Dados

*   **Integridade Transacional**: Esta operação pode deixar o banco de dados em um estado inconsistente se falhar no meio do caminho? O `BEGIN...COMMIT` está sendo usado corretamente?
*   **Imutabilidade**: Existe algum cenário onde uma transação financeira está sendo deletada em vez de estornada?
*   **Fonte da Verdade**: A lógica de cálculo de saldo está centralizada no banco de dados ou está sendo replicada em outras camadas, aumentando o risco de inconsistências?
*   **Desempenho**: As queries mais críticas estão utilizando índices adequados? Usei `EXPLAIN ANALYZE` para identificar gargalos?
*   **Segurança**: As políticas de RLS estão ativas e corretamente configuradas para todas as tabelas sensíveis?

---

## 4. Multitenancy e Isolamento: A Regra de Ouro do SaaS

Para aplicações SaaS (Software as a Service) que atendem a múltiplos clientes ou empresas a partir de uma única instância de software, a arquitetura de Multitenancy é um requisito fundamental. O desafio é garantir que os dados de uma empresa estejam completamente isolados e inacessíveis por outras, mantendo a eficiência e a escalabilidade. O Supabase, com seu poderoso sistema de Row Level Security (RLS), oferece uma solução elegante para este problema.

### 4.1. A Regra de Ouro do SaaS: `organization_id`

> **Regra #7 (A Regra de Ouro do SaaS)**: Toda tabela que contém dados de um cliente DEVE ter uma coluna `organization_id`.

Esta regra é inegociável. A presença de um `organization_id` em cada registro de dados de cliente é o mecanismo primário para garantir o isolamento. Sem ele, não há como diferenciar a propriedade dos dados entre os diferentes inquilinos do sistema.

Para gerenciar as organizações e seus membros, a estrutura de tabelas deve incluir:

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE organization_members (
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- Ex: 'admin', 'member', 'viewer'
  PRIMARY KEY (organization_id, user_id)
);
```

As tabelas de dados de negócio, como `contas` e `lancamentos`, devem ser estendidas para incluir a coluna `organization_id`, criando a ligação direta com a organização proprietária dos dados.

```sql
-- Exemplo de adição de organization_id a uma tabela existente
ALTER TABLE contas ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE lancamentos ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

### 4.2. Autenticação e Autorização com Row Level Security (RLS)

O RLS é a camada de segurança mais poderosa do PostgreSQL e, consequentemente, do Supabase. Ele permite definir políticas que restringem o acesso a linhas individuais de uma tabela com base no usuário autenticado ou em outras condições. Para multitenancy, o RLS é a garantia de que um usuário só verá os dados de sua própria organização.

**Políticas de Segurança Baseadas em Organização**

Para simplificar a gestão das políticas de RLS e centralizar a lógica de verificação de associação à organização, é altamente recomendável criar uma função auxiliar no SQL.

```sql
-- Função auxiliar para verificar se um usuário pertence a uma organização
CREATE OR REPLACE FUNCTION is_member_of(p_org_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Complemento Técnico**: A função `is_member_of` também utiliza `SECURITY DEFINER` para garantir que ela possa consultar a tabela `organization_members` mesmo que o usuário autenticado não tenha permissão direta de leitura nessa tabela. A verificação `user_id = auth.uid()` é crucial para garantir que a função sempre opere no contexto do usuário atualmente autenticado.

Com esta função auxiliar, as políticas de RLS tornam-se concisas e fáceis de entender:

```sql
-- Habilita RLS para a tabela 'contas'
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;

-- Política: Membros da organização podem gerenciar (ver, inserir, atualizar, deletar)
CREATE POLICY "org_members_can_manage_contas" ON contas FOR ALL
USING ( is_member_of(organization_id) );

-- Habilita RLS para a tabela 'lancamentos'
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- Política: Membros da organização podem ver e gerenciar seus próprios lançamentos
CREATE POLICY "org_members_can_manage_lancamentos" ON lancamentos FOR ALL
USING ( is_member_of(organization_id) );
```

**Resultado**: Com estas políticas de RLS ativas, é impossível para um usuário ver, inserir, atualizar ou deletar dados de uma organização da qual não faz parte, mesmo que tente manipular as requisições no frontend ou na camada de serviço. O banco de dados impõe a segurança no nível mais granular.

### 4.3. Perguntas de Revisão para Multitenancy e RLS

*   **Vazamento de Dados**: Existe algum cenário onde um usuário de uma organização pode, acidentalmente ou intencionalmente, acessar dados de outra organização?
*   **Cobertura RLS**: Todas as tabelas que contêm dados de cliente têm RLS habilitado e políticas de segurança baseadas em `organization_id`?
*   **Performance RLS**: As políticas de RLS estão otimizadas? Elas estão causando lentidão nas consultas? (Índices nas colunas usadas nas políticas são cruciais).
*   **Consistência**: A coluna `organization_id` está presente em todas as tabelas de dados de negócio? Há chaves estrangeiras garantindo a integridade referencial?
*   **Testes**: As políticas de RLS foram testadas exaustivamente com diferentes perfis de usuário e organizações?

---

## 5. Performance, Cache e Realtime: Otimizando a Experiência do Usuário

Um sistema sênior não é apenas funcional e seguro; ele é também rápido e responsivo. A otimização de performance envolve uma combinação estratégica de cache, sincronização em tempo real e consultas eficientes, garantindo que a experiência do usuário seja fluida sem sobrecarregar a infraestrutura.

### 5.1. O Modelo Correto: Cache + Revalidação (Stale-While-Revalidate)

O modelo tradicional de "buscar dados toda vez que o módulo abre" é ineficiente e não escala. Em sistemas modernos, a abordagem Stale-While-Revalidate (SWR) é o padrão ouro, adotado por gigantes como Vercel, Google e Facebook. Este modelo funciona da seguinte forma:

1.  **Primeira Vez**: O sistema busca os dados do servidor e os exibe.
2.  **Depois**: Em acessos subsequentes, o sistema exibe imediatamente os dados do cache (dados "stale").
3.  **Em Segundo Plano**: Enquanto os dados do cache são exibidos, o sistema revalida os dados em segundo plano, buscando a versão mais recente do servidor.
4.  **Atualização Automática**: Se os dados do servidor forem diferentes, a interface é atualizada automaticamente e o cache é renovado.

No ecossistema React, o TanStack Query (anteriormente React Query) é a ferramenta ideal para implementar SWR. Ele gerencia o cache, a deduplicação de requisições, o background refetch, a sincronização entre abas e o controle de stale time, eliminando a maior parte dos problemas de gerenciamento de estado assíncrono.

### 5.2. Realtime Seletivo: Onde a Reatividade Importa

Um ERP multiusuário precisa de reatividade. Se o Usuário A cria uma conta a pagar, o Usuário B, que está no módulo financeiro, não deveria precisar dar F5 para ver a atualização. O Supabase Realtime preenche essa lacuna, transmitindo mudanças do banco de dados (INSERT, UPDATE, DELETE) via WebSockets, e o mais importante: ele respeita sua Row Level Security.

**Assinando Mudanças no Banco de Dados**

O uso do Realtime deve ser cirúrgico. Não se deve assinar mudanças em todas as tabelas, pois isso pode sobrecarregar o cliente e o servidor. O foco deve ser em tabelas críticas onde a atualização imediata é essencial para a experiência do usuário.

Exemplo no Frontend (React) com TanStack Query:

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase'; // Seu cliente Supabase centralizado

function useRealtimeTransactions(organizationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) return; // Garante que o filtro esteja presente

    const channel = supabase
      .channel('realtime-lancamentos')
      .on(
        'postgres_changes',
        {
          event: '*', // 'INSERT', 'UPDATE', 'DELETE' ou '*' para todos
          schema: 'public',
          table: 'lancamentos',
          filter: `organization_id=eq.${organizationId}` // Filtro crucial
        },
        (payload) => {
          console.log('Mudança em lançamentos recebida:', payload);
          // Invalida a query de lançamentos para que o TanStack Query refetch o novo estado
          queryClient.invalidateQueries(['lancamentos', organizationId]);
        }
      )
      .subscribe();

    return () => {
      // Limpeza: Desinscreve do canal quando o componente é desmontado
      supabase.removeChannel(channel);
    };
  }, [organizationId, queryClient]);
}
```

**Modelo Mental**:
Você não cria 20 cérebros. Você cria 1 fonte de verdade (o banco de dados). O realtime atua como os nervos, transmitindo as mudanças do cérebro para a visão (o frontend) de forma eficiente.
*   **Banco** = cérebro
*   **Frontend** = visão
*   **Realtime** = nervos

### 5.3. Otimização de Consultas e Paginação

1.  **Índices no Banco de Dados**: Adicione índices em todas as colunas usadas em cláusulas `WHERE`, `JOIN`, `ORDER BY` e `GROUP BY`. Use `EXPLAIN ANALYZE` no PostgreSQL para identificar gargalos.
    ```sql
    CREATE INDEX idx_lancamentos_org_data ON lancamentos (organization_id, data_transacao);
    ```
    **Complemento Técnico**: Índices compostos são extremamente eficazes para queries que filtram por múltiplos campos.
2.  **Paginação**: Nunca retorne milhares de linhas de uma vez. Sempre pagine os resultados da API. No Supabase, isso é feito facilmente com `.range(from, to)`.
3.  **Cache na Edge Function**: Para dados que não mudam com frequência, implemente cache na própria Edge Function para reduzir a carga no banco de dados.

### 5.4. O que NÃO Fazer (Anti-Padrões)

*   **Refazer fetch toda navegação**: Viola o princípio SWR e causa lentidão.
*   **Fazer cálculo crítico no front-end**: Viola a regra de que o banco é a fonte da verdade.
*   **Manter estado financeiro só na memória**: Perda de dados e inconsistência em caso de refresh.
*   **Depender só de refresh manual**: Experiência de usuário ruim e falta de reatividade.
*   **Realtime em 30 tabelas ao mesmo tempo**: Sobrecarga desnecessária.

### 5.5. Perguntas de Revisão para Performance e Realtime

*   **Escalabilidade**: Esta lista de dados se manterá performática se contiver 100.000 registros? A paginação está implementada?
*   **Eficiência do Realtime**: O Realtime está sendo usado apenas onde é necessário? As subscrições são filtradas por `organization_id` e limpas no desmonte?
*   **Otimização de Query**: Usei `EXPLAIN ANALYZE`? Há índices faltando?
*   **Cache**: O TanStack Query está configurado com `staleTime` apropriado?

---

## 6. Tópicos Avançados para Produção: Robustez e Confiabilidade

Um sistema pronto para produção vai além da funcionalidade básica. Ele incorpora mecanismos de teste, tratamento de erros, monitoramento e recuperação de desastres.

### 6.1. Testes Automatizados: Sua Rede de Segurança

| Tipo de Teste | Foco | Ferramentas | Dica Sênior |
| :--- | :--- | :--- | :--- |
| **Unitários (Frontend)** | Funções puras, componentes de UI, hooks. | Jest, React Testing Library | Teste a lógica interna isoladamente. |
| **Integração (Frontend)** | Fluxos de usuário, interação entre componentes, API mocks. | Cypress, Playwright, RTL | Simule cenários de usuário real. |
| **API (Edge Functions)** | Chamadas HTTP reais, retornos e status codes. | Jest, Vitest | Verifique dados e status codes (400, 401, 500). |
| **Banco de Dados (SQL)** | Funções SQL, triggers, políticas de RLS. | pg_prove | Execute testes dentro de transações (ROLLBACK). |

### 6.2. Tratamento de Erros e Resiliência

*   **Frontend**: Use `try...catch`. Mostre mensagens amigáveis. Integre com Sentry ou LogRocket.
*   **Edge Functions**: Valide com Zod. Retorne códigos HTTP semânticos (400, 401, 403, 500).
*   **Banco de Dados**: Lance exceções explícitas (`RAISE EXCEPTION`) para erros de negócio.

### 6.3. Backup e Recuperação de Desastres

*   **PITR (Point-in-Time Recovery)**: Habilite no Supabase para "voltar no tempo".
*   **Acesso Restrito**: O acesso direto ao banco de produção deve ser restrito. Alterações de schema (DDL) apenas via migrações versionadas.

---

## 7. Arquitetura Recomendada (PRO): O Modelo de um ERP Sério

Um ERP profissional exige alta concorrência, consistência e fluidez.

### 7.1. Os Quatro Pilares

1.  **Cache Inteligente**: Reduz carga e acelera a interface.
2.  **Sincronização Realtime**: Atualização sem refresh.
3.  **Isolamento (Multi-tenant)**: Proteção de dados por empresa.
4.  **Controle de Consistência**: Banco de dados como cérebro e fonte da verdade.

### 7.2. As Três Camadas

*   **🟢 Camada 1 — Banco de Dados**: Cálculos financeiros, triggers e regras críticas residem aqui. É a única fonte da verdade.
*   **🔵 Camada 2 — Camada de Dados no Frontend**: TanStack Query + Supabase Realtime gerenciam cache, deduplicação e background refetch.
*   **🟣 Camada 3 — Estado Global (UI State)**: Zustand para estados leves (filtros, modais, tema).

### 7.3. Como Fazer REALTIME Direito

*   **❌ Não**: Realtime em 30 tabelas.
*   **✅ Sim**: Identifique tabelas críticas (ex: Transações, mas não Relatórios).
*   **Princípio**: Realtime só onde a atualização imediata é um requisito de negócio.

---

## 8. O Manual da Tesouraria Perfeita: Dominando o Fluxo de Dinheiro

Imagine a tesouraria como uma sala de cofres digital à prova de falhas.

### 8.1. As Três Dimensões

1.  **O Futuro (As Promessas)**: `financial_entries`. O que vai acontecer.
2.  **O Presente (A Realidade)**: `accounts`. Onde o dinheiro está agora.
3.  **O Passado (A Verdade Imutável)**: `financial_transactions`. O diário de bordo imutável.

### 8.2. Regras de Ouro da Tesouraria

1.  **Saldo Sagrado**: Atualizado SOMENTE via funções SQL.
2.  **Histórico Imutável**: Nunca apague. Use Estornos.
3.  **Sincronização Realtime**: UI reage a mudanças no banco.
4.  **Atomicidade**: Use `BEGIN...COMMIT`.
5.  **Validação**: Verifique `company_id` e saldo antes de processar.

---

## 9. Canonico: Regras de Comportamento e Arquitetura do Desenvolvedor Sênior

### 9.1. Role Definition: O Executor Preciso

O desenvolvedor sênior é um executor de tarefas que segue as regras de forma literal e precisa. **Você não tem autonomia para tomar decisões de design ou refatoração não solicitadas.**

### 9.2. Absolute Rules (Inquebráveis)

1.  **MINIMAL_SCOPE_MODIFICATION**: NUNCA modifique código que não foi expressamente solicitado. Seja um cirurgião.
2.  **NO_INTERPRETATION**: Execute apenas instruções explícitas. Não adivinhe intenções.
3.  **NO_ASSUMPTIONS**: Não presuma existência de tabelas ou variáveis. Pergunte se não estiver claro.
4.  **IMMUTABLE_ARCHITECTURE**: A estrutura de pastas e modularidade são sagradas.

### 9.3. Design Rules

*   **INPUT_LEGIBILITY**: Fundo claro (`#FFFFFF`) e cor escura (`#111827`) em todos os campos de texto.

### 9.4. Architecture Definition (Estrutura de Pastas)

```text
src/
 ├─ lib/
 │   └─ supabase.ts  (ÚNICO cliente)
 │
 ├─ modules/
 │   ├─ {modulo}/
 │   │   ├─ components/ (Componentes Visuais)
 │   │   ├─ {modulo}.page.tsx (Orquestrador)
 │   │   ├─ {modulo}.service.ts (Camada de Dados)
 │   │   └─ {modulo}.types.ts (Tipos)
```

### 9.5. Supabase Rules

*   Importe o cliente apenas de `src/lib/supabase.ts`.
*   PROIBIDO acessar o Supabase diretamente de arquivos `.tsx`. Use a camada de serviço.
*   RLS é OBRIGATÓRIO em todas as tabelas.
*   NUNCA use `service_role` key no frontend.

### 9.6. Workflow and Output

1.  **Tradução**: Traduza pedidos de linguagem natural para planos técnicos baseados na arquitetura.
2.  **Confirmação**: Apresente o plano e aguarde confirmação antes de codificar.
3.  **Minimalismo**: Gere apenas o código alterado ou os novos arquivos solicitados.

---

## Perguntas de Revisão Finais

*   **Conformidade**: Violou o `MINIMAL_SCOPE_MODIFICATION`?
*   **Interpretação**: Adicionei funcionalidades não solicitadas?
*   **Assunções**: Presumi algo não definido?
*   **Arquitetura**: Alterei a estrutura de pastas?
*   **Legibilidade**: Segui o padrão de campos de texto?
