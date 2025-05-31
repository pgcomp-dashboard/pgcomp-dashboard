# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Testes E2E com Cypress

### Sobre

O frontend utiliza o [Cypress](https://www.cypress.io/) para executar testes de ponta a ponta (E2E), ou seja, para rodar os teste é necessário ter ambos ambientes rodando.

---

### Pré-requisitos

Antes de rodar os testes, é necessário:

1. Ter o **backend rodando em modo de testes** (veja a seção [_Ambiente de Testes_](../backend/README.md#ambiente-de-testes) no backend).

2. Ter criado o arquivo de ambiente do Cypress com as credenciais de acesso.

---

### Configuração do ambiente do Cypress

1. Crie um arquivo `cypress.env.json` na raiz do projeto frontend com base no template existente:

```bash
cp cypress.env.example.json cypress.env.json
````

2. Por padrão, o banco de testes já inclui um usuário administrador com as seguintes credenciais:

```json
{
  "admin_email": "admin@admin.com
  "admin_password": "password"
}
```

> Esses dados devem ser inseridos no `cypress.env.json` para que os testes funcionem corretamente.

---

### Rodar os testes

Existem duas formas principais de executar o Cypress:

#### 🟢 Modo interativo

Abre a interface visual do Cypress, permitindo acompanhar o passo a passo de cada teste:

```bash
npm run cy:open
```

#### ⚙️ Modo CLI (automático)

Executa todos os testes em modo headless (sem interface):

```bash
npm run cy:run
```

---

### Observações

* Os testes Cypress são e2e então eles interagem com o sistema real (backend + banco), portanto é fundamental que o backend esteja rodando com o ambiente de testes ativo.

