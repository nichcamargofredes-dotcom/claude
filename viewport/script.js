// Número do WhatsApp da Viewport: DDI + DDD + número, só dígitos (ex.: '5519999999999').
// Enquanto estiver vazio, o botão abre o WhatsApp com a mensagem pronta para escolher o contato.
const WHATSAPP = '';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// medida da tela do visitante
function readout() {
  const w = window.innerWidth, h = window.innerHeight;
  $$('.vw').forEach(e => e.textContent = w);
  $$('.vh').forEach(e => e.textContent = h);
}
readout();
addEventListener('resize', readout, { passive: true });

// navegação
const nav = $('#topo'), links = $('#links'), burger = $('#burger');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
links.addEventListener('click', e => {
  if (e.target.closest('a')) { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
});

// computador / celular em cada trabalho
const SIZES = { desk: '1440 × 900', mob: '390 × 844' };
$$('.case-stage').forEach(stage => {
  const btns = $$('.seg button', stage), size = $('.size b', stage);
  btns.forEach(b => b.addEventListener('click', () => {
    stage.dataset.mode = b.dataset.to;
    btns.forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    size.textContent = SIZES[b.dataset.to];
  }));
});

// medidas no cartão de serviço, como no inspetor do navegador
$$('.svc').forEach(card => {
  const tag = $('.inspect', card);
  card.addEventListener('mouseenter', () => {
    const r = card.getBoundingClientRect();
    tag.dataset.size = `section.servico  ${Math.round(r.width)} × ${Math.round(r.height)}`;
  });
});

// formulário para WhatsApp
const form = $('#form'), send = $('#send'), msg = $('#form-msg');
function waLink() {
  const v = id => $(id).value.trim();
  const text = [
    `Olá, Nicolas! Vim pelo site da Viewport.`,
    v('#f-nome') && `Meu nome é ${v('#f-nome')}.`,
    v('#f-negocio') && `Negócio: ${v('#f-negocio')}.`,
    `Preciso de: ${v('#f-tipo')}.`,
    v('#f-msg')
  ].filter(Boolean).join('\n');
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
const refresh = () => { send.href = waLink(); };
form.addEventListener('input', refresh);
refresh();
send.addEventListener('click', e => {
  const missing = ['#f-nome', '#f-negocio'].filter(id => !$(id).value.trim());
  ['#f-nome', '#f-negocio'].forEach(id => $(id).classList.toggle('err', missing.includes(id)));
  if (missing.length) {
    e.preventDefault();
    msg.textContent = 'Preencha seu nome e o nome do negócio para enviar.';
    $(missing[0]).focus();
  } else {
    msg.textContent = '';
  }
});
form.addEventListener('submit', e => e.preventDefault());

$('#ano').textContent = new Date().getFullYear();
