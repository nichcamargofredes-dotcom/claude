# CozyPaws · site de pet shop

Site de uma página para uma pet shop, minimalista, com animações de entrada e efeitos ligados à rolagem do mouse.
Feito com **React 19 + Vite + TypeScript**, **Tailwind CSS v4**, **Lucide React**, **Motion** (animações de scroll) e **Lenis** (rolagem suave).

## Como rodar

```bash
cd petshop
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/ para publicar
npm run preview   # serve o build localmente
```

## O que tem na página

| Seção | Efeito |
|-------|--------|
| Hero (prompt CozyPaws) | Header, layouts desktop/tablet/mobile, palavras do título com `word-pop`, cards deslizando, fotos subindo em sequência |
| Faixa de benefícios | Letreiro infinito que acelera e inverte com a velocidade do scroll |
| Compre por pet | Grade de cards com parallax na foto e entrada escalonada |
| Mais vendidos | Bento com produto destaque e preços em reais |
| Serviços | Texto rolando com a foto fixa ao lado, que troca com "wipe" a cada serviço |
| Avaliações | Colunas em velocidades diferentes (no celular, cards entram pelos lados) |
| #FamíliaCozyPaws | Galeria horizontal presa na tela enquanto você rola, também no celular |
| Dúvidas | Perguntas frequentes em acordeão (horário, agendamento, vacinas) |
| Newsletter | O dachshund sobe por trás do painel conforme a seção aparece |
| Rodapé | Faixa compacta de marcas parceiras e logotipo gigante subindo com o scroll |

Quem usa "reduzir movimento" no sistema vê tudo estático, sem perder conteúdo.

## Hero

Segue o prompt do CozyPaws, com os textos traduzidos para o português: cores, fontes (Inter e DM Serif Display), tamanhos com `clamp()`, animações e ordem de entrada.
Um ajuste: em telas baixas (notebooks de 768 px de altura, por exemplo) a faixa de fotos estreita um pouco e o "muro" verde continua até as bordas, para o golden retriever não cobrir o título. Em 1440×900 o layout fica praticamente igual ao do prompt.

## Imagens

- **Hero, logo e avatar**: carregados direto do site original no Figma (`polo-pecan-73837341.figma.site`), como o prompt pede. Se aquele endereço sair do ar, essas imagens somem.
- **Demais fotos**: geradas com IA (Higgsfield, modelo Z Image) e salvas otimizadas em `public/images/` (WebP, ~1,6 MB no total).
  A lista fica em `scripts/images.json`. Para trocar ou adicionar fotos, edite a lista e rode `npm run images`
  (ou só faça push: o workflow `.github/workflows/petshop-images.yml` baixa, converte e commita sozinho).

## Onde mexer

- Textos e produtos: `src/components/sections/*.tsx`
- Menu: `src/lib/nav.ts`
- Cores e animações: `src/index.css` (bloco `@theme` e keyframes)
- Endereços das imagens: `src/lib/assets.ts`

Os dados da loja (endereço, telefone, preços, avaliações) são fictícios, troque pelos reais antes de publicar.
