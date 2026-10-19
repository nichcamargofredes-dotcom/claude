---
data: 2026-10-19
tipo: site
status: publicado
---

# Abu Pet Shop (CozyPaws)

Site de uma página para pet shop, minimalista, em português, com animações de entrada e efeitos ligados à rolagem.

- **No ar:** https://abupetshop.vercel.app
- **Código:** GitHub `nichcamargofredes-dotcom/claude`, branch `claude/youthful-feynman-abyvck`, pasta `petshop/`
- **Vercel:** projeto `abupetshop` (conta pessoal)

## Tecnologia

React 19, Vite, TypeScript, Tailwind CSS v4, Lucide, Motion (animações de scroll) e Lenis (rolagem suave).
Fotos geradas com IA (Higgsfield) e otimizadas em WebP em `public/images/`. As imagens da hero, o logo e o avatar vêm do site original no Figma (`polo-pecan-73837341.figma.site`).

## Seções

1. Hero (segue o prompt CozyPaws, com layouts para desktop, tablet e celular)
2. Faixa de benefícios: letreiro que acelera com o scroll
3. Compre por pet: cards com parallax
4. Mais vendidos: vitrine com preços em R$, sem carrinho
5. Serviços: banho e tosa, veterinário, creche e hotel
6. Avaliações: 3 depoimentos
7. Galeria #FamíliaCozyPaws: fica presa na tela e a rolagem passa as fotos para o lado
8. Dúvidas: horário, agendamento, vacinas, portes, visita à loja
9. Agendamento: formulário que monta a mensagem e abre o WhatsApp
10. Rodapé com faixa compacta de marcas

## Decisões

- Tudo traduzido para o português, com preços em reais.
- Removidos: blog, "Nossa história", carrinho e favoritos, a seção de marcas (virou uma faixa no rodapé), entrega e pagamento, perguntas sobre compra online, a oferta de 15% da newsletter.
- Na hero do celular os produtos não ficam mais no meio. As animações de scroll também funcionam no celular.
- Quem ativa "reduzir movimento" no sistema vê a galeria como uma fileira para arrastar, sem animações.

## Próximos passos

- Trocar os dados fictícios pelos reais: WhatsApp em `src/lib/contact.ts` (hoje `5511912345678`), endereço e telefone no `Footer`, no `MobileMenu`, no `Booking` e no `Faq`.
- Ajustar a foto do golden retriever em notebooks, onde ela cobre parte da palavra "pet" no título.
- Republicar na Vercel depois de cada mudança, se o deploy automático pelo GitHub não estiver ligado.
