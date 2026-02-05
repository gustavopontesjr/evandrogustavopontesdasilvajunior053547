# SigPet MT - Gestão de Animais e Tutores (Front-end)

> **Candidato:** Evandro Gustavo Pontes da Silva Junior
> **Vaga:** Engenheiro da Computação (Perfil Sênior)
> **Processo Seletivo:** Governo de Mato Grosso - Edital 001/2026

Aplicação SPA (Single Page Application) desenvolvida para o gerenciamento de pets e tutores...

---

## Decisões Arquiteturais

A arquitetura foi desenhada para atender aos requisitos de escalabilidade e manutenibilidade, utilizando o ecossistema React.

### 1. Padrão Facade e Gerenciamento de Estado
Em conformidade com o requisito de "State Management", que permite a escolha entre BehaviorSubject, RxJS ou Facade Pattern, optou-se pela implementação do **Facade Pattern**.

A implementação foi realizada através de **Custom Hooks** (ex: `usePetDetails`, `useTutorDetails`). Estes Hooks atuam como uma fachada para a camada de visualização (View), abstraindo a complexidade das regras de negócio, comunicação com a API (Services) e estados locais. Essa abordagem isola responsabilidades e facilita a manutenção, mantendo os componentes visuais limpos.

### 2. Performance e Lazy Loading
Foi implementado Code Splitting em nível de rota. Os módulos de "Pets" e "Tutores" são carregados sob demanda (lazy loading), garantindo que o bundle inicial da aplicação seja leve, otimizando o tempo de carregamento da tela de login.

### 3. Containerização
O Dockerfile utiliza a estratégia de Multi-stage Build. A aplicação é compilada em um ambiente Node.js e, na etapa final, os arquivos estáticos são servidos por um servidor Nginx Alpine, resultando em uma imagem leve e otimizada para produção.

---

## Limitações Conhecidas e Notas de Integração

Em conformidade com o item do edital sobre transparência técnica, registro as seguintes observações referentes à integração com a API fornecida:

**Campo "Espécie" no cadastro de Pets**
Durante os testes de integração, observei que o campo "espécie", embora seja enviado corretamente no payload das requisições (POST/PUT), não está sendo persistido ou retornado pela API (`pet-manager-api.geia.vip`).
Para fins de avaliação e cumprimento do requisito visual, o campo foi mantido no formulário, acompanhado de uma nota informativa na interface ("Campo informativo").

**Expiração de Sessão (Token)**
A API fornecida possui uma política de segurança com tempo de expiração de token. Caso ocorra inatividade ou o tempo limite seja excedido durante a navegação, a aplicação redirecionará automaticamente para a tela de login para renovação das credenciais.

---

## Estrutura do Projeto

src/
├── assets/       # Recursos estáticos (Imagens, Logos)
├── components/   # Componentes visuais reutilizáveis (Input, Button, Modal)
├── contexts/     # Estado Global (Autenticação)
├── hooks/        # Camada Facade (Regras de negócio e comunicação com API)
├── layouts/      # Estruturas de layout persistentes (Sidebar, Header)
├── pages/        # Telas da aplicação
├── services/     # Configuração do Axios e Endpoints
├── types/        # Interfaces e Tipos TypeScript
└── routes/       # Configuração de rotas e Lazy Loading

---

## Como Executar

### Pré-requisitos
- Node.js 18 ou superior (para execução local)
- Docker (para execução em container)

### Opção 1: Execução via Docker

1. Abra o terminal (Prompt de Comando, PowerShell ou Terminal) na pasta raiz do projeto.

2. Construa a imagem da aplicação executando o comando abaixo. Aguarde o processo de download e compilação terminar:
   Comando: docker build -t sigpet-front .

3. Inicie o container executando o comando abaixo. Isso subirá o servidor na porta 8080:
   Comando: docker run -p 8080:80 sigpet-front

4. Após iniciar, acesse a aplicação no seu navegador através do endereço: http://localhost:8080

Nota: O endpoint de Health Check (Liveness Probe) exigido no edital estará disponível em: http://localhost:8080/health.json

### Opção 2: Execução Local

1. Abra o terminal (Prompt de Comando, PowerShell ou Terminal) na pasta raiz do projeto.

2. Instale as dependências do projeto usando o comando: npm install

3. Após terminar a instalação, inicie o servidor de desenvolvimento usando o comando: npm run dev

4. Acesse a aplicação através do link exibido no terminal. Copie e cole o link em seu navegador ou segure CTRL e clique nele.

---

## Testes

O projeto utiliza Vitest para testes unitários. Para executar a bateria de testes e validar a integridade dos componentes:

npm run test

---

## Checklist de Conformidade (Edital)

- [x] Lazy Loading nas rotas de módulos.
- [x] Testes Unitários configurados.
- [x] Padrão Facade implementado (Hooks).
- [x] Health Check / Liveness Probe.
- [x] Dockerfile configurado com Nginx.
- [x] Documentação técnica de execução.