# MR Material de Construção
# Autor: Pedro Guilherme - Aluno Tecinfo

Aplicação demonstrativa de produtos, estoque, clientes e orçamentos, feita com React, TypeScript e Vite.

## Rodar localmente

```bash
npm install
npm run dev
```

O servidor de demonstração da API sobe dentro do Vite. Não é necessário iniciar um segundo terminal. A configuração local fica em `.env.local`; o arquivo `.env.example` mostra a chave usada.

## API temporária

O projeto contém uma API Node sem banco persistente. Ela atende os recursos `produtos`, `clientes` e `orcamentos` em `/api`. Os registros ficam apenas na memória do processo, isolados por sessão do navegador. Ao sair da aplicação, os registros daquela sessão são apagados. Eles também desaparecem se o servidor for parado, reiniciado ou se a sessão ficar inativa por seis horas.

Esta API serve para demonstração e não oferece autenticação real nem armazenamento apropriado para dados privados. Não use dados pessoais reais.

## Publicar a demonstração

O front-end continua publicado como site estático na Vercel. O arquivo vercel.json encaminha as chamadas /api/ ao serviço definido em render.yaml. Publique esse Blueprint no Render para habilitar a API. Se o hostname gerado for diferente, configure VITE_API_URL nas variáveis de ambiente da Vercel com a URL pública do serviço mais /api e faça um novo deploy.

O plano gratuito do Render suspende serviços sem tráfego por 15 minutos e pode reiniciá-los; como o armazenamento é só memória, esses eventos apagam os dados e a primeira chamada pode demorar para acordar o serviço.

## Verificações

```bash
npm run build
npm run lint
```

Não há suíte automatizada configurada no `package.json`.
