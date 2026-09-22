# GastaMenos 💰

O **GastaMenos** é um aplicativo Progressivo (PWA) de controle financeiro pessoal. Focado na simplicidade e usabilidade em dispositivos móveis, ele ajuda você a acompanhar sua renda, fatura de cartão e definir metas de economia blindada de maneira semanal.

## Funcionalidades Principais 🌟

- **Gestão de Ciclo Financeiro:** Adapte o controle financeiro ao vencimento da sua fatura do cartão ou trabalhe com o mês civil.
- **Orçamentação Semanal:** A sua renda disponível (descontando fatura atual e meta de economia) é automaticamente dividida de forma justa pelas semanas do seu ciclo financeiro.
- **Economia Blindada:** Defina uma meta de economia logo no início. O app avisa se você gastar mais do que deve e "corroer" suas economias.
- **Lançamentos Simples:** Registre despesas e receitas extras facilmente associadas à semana atual.
- **Offline First (Local Storage):** Seus dados não vão para nenhum servidor. Tudo fica salvo de forma privada e segura no seu próprio dispositivo.
- **PWA Ready:** Instale no seu smartphone como um aplicativo nativo para uma experiência sem barra de navegação.

## Tecnologias Utilizadas 🚀

O projeto foi construído utilizando as seguintes tecnologias:

- **React 19**
- **Vite 8**
- **Tailwind CSS** (para estilização rápida e responsiva)
- **Lucide React** (para iconografia moderna)
- **Vite PWA Plugin** (para suporte PWA)

## Como Rodar Localmente 🖥️

Siga os passos abaixo para iniciar o projeto em sua máquina local:

### 1. Clonar o repositório
\`\`\`bash
git clone https://github.com/pedroPecly/gastamenos.git
cd gastamenos
\`\`\`

### 2. Instalar dependências
Certifique-se de ter o Node.js instalado (versão 18+ recomendada).
\`\`\`bash
npm install
\`\`\`

### 3. Executar em ambiente de desenvolvimento
\`\`\`bash
npm run dev
\`\`\`
A aplicação estará rodando localmente (normalmente em \`http://localhost:5173\`).

### 4. Build de Produção
Para criar a versão otimizada para produção:
\`\`\`bash
npm run build
\`\`\`

## Contribuindo 🤝

Se você deseja contribuir, por favor faça um _fork_ do repositório, crie uma _branch_ com suas alterações e abra um _Pull Request_.
