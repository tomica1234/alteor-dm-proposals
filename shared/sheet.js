// 共通ビューア：シートを画面幅に合わせて縮小し、ガイド線・原寸表示・PDF書き出しのバーを付ける。
// ?view=front / ?view=back を付けると、その面だけを原寸で表示する（一覧ページのサムネイル用）。
// ?guides=1 を付けると、ガイド線を入れた状態で開く。
(() => {
  const PLANS = [['A', '現行踏襲'], ['B', '書面'], ['C', '紺と金'], ['D', '号外'], ['E', '図解']];
  const SHEET_PX = 216 * 96 / 25.4;
  const GAP = 28;

  const root = document.documentElement;
  const body = document.body;
  const stage = document.querySelector('.stage');
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (params.has('guides')) body.classList.add('show-guides');

  document.querySelectorAll('.sheet').forEach(sheet => {
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    const cap = document.createElement('p');
    cap.className = 'sheet-cap';
    cap.textContent = sheet.dataset.label || '';
    const box = document.createElement('div');
    box.className = 'sheet-box';
    sheet.replaceWith(wrap);
    box.append(sheet);
    wrap.append(cap, box);

    const guides = document.createElement('div');
    guides.className = 'guides';
    guides.setAttribute('aria-hidden', 'true');
    guides.innerHTML = '<i class="trim"></i><i class="safe"></i>'
      + (sheet.classList.contains('front') ? '<i class="addr">宛名印字スペース（デザインを置かない）</i>' : '');
    sheet.append(guides);

    if (view && !sheet.classList.contains(view)) wrap.hidden = true;
  });

  if (view) {
    root.classList.add('embed');
    return;
  }

  const id = body.dataset.plan;
  const bar = document.createElement('header');
  bar.className = 'bar';
  bar.innerHTML = `
    <a href="index.html">← 5案の一覧</a>
    <span class="ttl">案${id}　${body.dataset.name}</span>
    <span class="note">${body.dataset.note || ''}</span>
    <label><input type="checkbox" id="tg-guides"> ガイド線</label>
    <label><input type="checkbox" id="tg-actual"> 原寸</label>
    <button type="button" id="bt-print">PDFに書き出す</button>
    <nav aria-label="案の切り替え">${PLANS.map(([p, n]) => `<a href="plan-${p.toLowerCase()}.html" title="案${p} ${n}"${p === id ? ' aria-current="page"' : ''}>${p}</a>`).join('')}</nav>
    <span class="legend">
      <span><i class="l-trim"></i>仕上がり線（210×297mm。外側3mmは塗り足し）</span>
      <span><i class="l-safe"></i>文字・ロゴはこの内側に</span>
      <span><i class="l-tbd"></i>未確定の仮置き（URL・QR など）</span>
    </span>`;
  body.prepend(bar);

  const fit = () => {
    let k = 1;
    if (!body.classList.contains('actual')) {
      const vw = root.clientWidth - 40;
      const cols = vw >= 1000 ? 2 : 1;
      k = Math.min(1, (vw - (cols - 1) * GAP) / (cols * SHEET_PX));
    }
    stage.style.setProperty('--k', k.toFixed(4));
  };

  const tgGuides = bar.querySelector('#tg-guides');
  tgGuides.checked = body.classList.contains('show-guides');
  tgGuides.addEventListener('change', e => body.classList.toggle('show-guides', e.target.checked));
  bar.querySelector('#tg-actual').addEventListener('change', e => { body.classList.toggle('actual', e.target.checked); fit(); });
  bar.querySelector('#bt-print').addEventListener('click', () => window.print());
  window.addEventListener('resize', fit);
  fit();
})();
