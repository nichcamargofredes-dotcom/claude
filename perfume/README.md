# Site – Maison Vespéra · Eau de Parfum

Site estático (HTML, CSS e JS puros), sem build. Para testar localmente, sirva a pasta (as imagens são carregadas via `fetch`):

```
cd perfume && python3 -m http.server 8000
```

e abra http://localhost:8000.

## Como funciona
- O frasco fica fixo no fundo enquanto o site desce. O scroll controla os 192 quadros do vídeo (`media/frames/`), desenhados num `<canvas>`.
- Cada painel de informação (`.panel--left` ou `.panel--right` em `index.html`) faz o frasco diminuir e ir para o lado oposto. No celular, o frasco sobe e o texto aparece embaixo.
- O primeiro quadro é a foto original (`media/hero.webp`), alinhada sobre o vídeo.
- A palavra "Vespéra" fica entre duas camadas: fundo (quadro inteiro) e frente (o mesmo quadro recortado pela máscara de `media/masks/`). Por isso o texto fica atrás do frasco e dos ingredientes durante toda a animação.
- As máscaras foram geradas com rembg (modelo isnet-general-use).

## Personalizar
- **Nome, textos e preços:** `index.html`
- **Cores e fontes:** variáveis no topo de `styles.css`
- **Velocidade da animação:** altura mínima de `.panel` em `styles.css` (painéis mais altos = animação mais lenta)
