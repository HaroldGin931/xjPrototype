const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export function imageCover(item) {
  const images = item.images || [];
  if (!images.length) return '';
  return `<span class="image-cover"><img src="${esc(images[0].src)}" alt="${esc(images[0].alt)}" loading="lazy"><span class="image-count">${images.length} 张图片</span></span>`;
}

export function imageGroup(item) {
  if (!item.images?.length) return '';
  return `<div class="image-group" aria-label="图片">${item.images.map((image, index) => `<button type="button" class="image-thumbnail" data-image-open="${esc(item.id)}" data-image-index="${index}" aria-label="查看第 ${index + 1} 张图片${image.alt ? `：${esc(image.alt)}` : ''}"><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy"></button>`).join('')}</div>`;
}

export function imageEditor(images = []) {
  return `<section class="image-editor"><label class="image-editor-label" for="compose-images">图片（选填）</label><div class="image-editor-previews">${images.map((image, index) => `<div class="image-editor-preview"><img src="${esc(image.src)}" alt="${esc(image.alt)}"><button type="button" class="image-remove" data-image-remove="${index}" aria-label="移除第 ${index + 1} 张图片">×</button></div>`).join('')}</div><label class="image-add button secondary">添加图片<input type="file" id="compose-images" accept="image/jpeg,image/png,image/webp,image/gif" multiple aria-label="添加图片"></label><p class="caption">图片会按顺序显示在正文下方。</p></section>`;
}

export function setupImageViewer(getItem) {
  const viewer = document.createElement('dialog');
  viewer.className = 'image-viewer';
  viewer.setAttribute('aria-label', '查看图片');
  viewer.innerHTML = `<header class="image-viewer-header"><strong>查看图片</strong><button type="button" class="close-button" data-image-close autofocus>关闭</button></header><div class="image-viewer-stage"><img alt=""></div><footer class="image-viewer-controls"><button type="button" class="button secondary" data-image-prev aria-label="上一张图片">上一张</button><span class="image-viewer-position" role="status" aria-live="polite"></span><button type="button" class="button secondary" data-image-next aria-label="下一张图片">下一张</button></footer>`;
  document.body.append(viewer);
  const image = viewer.querySelector('img');
  const previous = viewer.querySelector('[data-image-prev]');
  const next = viewer.querySelector('[data-image-next]');
  const position = viewer.querySelector('.image-viewer-position');
  let images = [], index = 0, opener;

  const render = () => {
    image.src = images[index].src;
    image.alt = images[index].alt || `第 ${index + 1} 张图片`;
    position.textContent = `${index + 1} / ${images.length}`;
    previous.disabled = index === 0;
    next.disabled = index === images.length - 1;
  };
  const move = delta => {
    index = Math.max(0, Math.min(images.length - 1, index + delta));
    render();
  };
  document.addEventListener('click', event => {
    const control = event.target.closest('[data-image-open]');
    if (!control) return;
    const item = getItem(control.dataset.imageOpen);
    if (!item?.images?.length) return;
    images = item.images;
    index = Math.max(0, Math.min(images.length - 1, Number(control.dataset.imageIndex) || 0));
    opener = control;
    render();
    if (!viewer.open) viewer.showModal();
  });
  viewer.querySelector('[data-image-close]').addEventListener('click', () => viewer.close());
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  viewer.addEventListener('cancel', event => {
    event.preventDefault();
    event.stopPropagation();
    viewer.close();
  });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const box = viewer.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    opener?.focus({ preventScroll: true });
    image.removeAttribute('src');
  });
}
