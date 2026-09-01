(() => {
    const all = Array.isArray(window.INSOMNIAC_ARCHIVE_IMAGES) ? window.INSOMNIAC_ARCHIVE_IMAGES : [];
    const grid = document.getElementById('archive-grid');
    const search = document.getElementById('archive-search');
    const filter = document.getElementById('archive-project');
    const count = document.getElementById('archive-count');
    const more = document.getElementById('archive-load-more');
    const modal = document.getElementById('archive-lightbox');
    if (!grid || !search || !filter || !count || !more || !modal) return;

    const modalImg = modal.querySelector('.archive-lightbox-image');
    const modalTitle = modal.querySelector('.archive-lightbox-title');
    const modalMeta = modal.querySelector('.archive-lightbox-meta');
    const modalSources = modal.querySelector('.archive-lightbox-sources');
    const modalOpen = modal.querySelector('.archive-lightbox-open');
    const closeBtn = modal.querySelector('.archive-lightbox-close');
    const prevBtn = modal.querySelector('.archive-lightbox-prev');
    const nextBtn = modal.querySelector('.archive-lightbox-next');

    const PAGE_SIZE = 48;
    let visibleLimit = PAGE_SIZE;
    let filtered = all.slice();
    let activeIndex = -1;

    const projects = [...new Set(all.map(x => x.project))].sort((a, b) => a.localeCompare(b));
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        filter.appendChild(option);
    });

    const bytes = value => {
        if (!Number.isFinite(value)) return '';
        if (value >= 1024 * 1024) return (value / (1024 * 1024)).toFixed(1) + ' MB';
        return Math.round(value / 1024) + ' KB';
    };

    const cleanSurvey = name => name.replace(/\.htm$/i, '');

    function cardFor(item, index) {
        const figure = document.createElement('figure');
        figure.className = 'archive-card';
        figure.tabIndex = 0;
        figure.setAttribute('role', 'button');
        figure.setAttribute('aria-label', `Open archive image from ${cleanSurvey(item.source)}`);

        const img = document.createElement('img');
        img.src = item.file;
        img.alt = `${item.project} archive image from ${cleanSurvey(item.source)}`;
        img.loading = 'lazy';
        img.decoding = 'async';

        const caption = document.createElement('figcaption');
        const project = document.createElement('span');
        project.className = 'archive-card-project';
        project.textContent = item.project;
        const source = document.createElement('strong');
        source.textContent = cleanSurvey(item.source);
        const detail = document.createElement('span');
        detail.className = 'archive-card-detail';
        const reuse = item.occurrences > 1 ? ` · ${item.occurrences} archive occurrences` : '';
        detail.textContent = `${item.width || '?'}×${item.height || '?'} · ${bytes(item.bytes)}${reuse}`;
        caption.append(project, source, detail);
        figure.append(img, caption);

        const open = () => openLightbox(index);
        figure.addEventListener('click', open);
        figure.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });
        return figure;
    }

    function render() {
        grid.replaceChildren();
        const shown = filtered.slice(0, visibleLimit);
        const frag = document.createDocumentFragment();
        shown.forEach((item, index) => frag.appendChild(cardFor(item, index)));
        grid.appendChild(frag);
        count.textContent = `${shown.length} / ${filtered.length} images shown · ${all.length} unique archive images total`;
        more.hidden = shown.length >= filtered.length;
        more.textContent = `Load ${Math.min(PAGE_SIZE, filtered.length - shown.length)} more`;
        if (!shown.length) {
            const empty = document.createElement('p');
            empty.className = 'archive-empty';
            empty.textContent = '> No archive images match that filter.';
            grid.appendChild(empty);
        }
    }

    function applyFilters() {
        const q = search.value.trim().toLowerCase();
        const project = filter.value;
        filtered = all.filter(item => {
            if (project && item.project !== project) return false;
            if (!q) return true;
            const haystack = [item.project, item.source, item.original, ...(item.sources || [])].join(' ').toLowerCase();
            return haystack.includes(q);
        });
        visibleLimit = PAGE_SIZE;
        render();
    }

    function openLightbox(index) {
        activeIndex = index;
        const item = filtered[activeIndex];
        if (!item) return;
        modalImg.src = item.file;
        modalImg.alt = `${item.project} archive image from ${cleanSurvey(item.source)}`;
        modalTitle.textContent = cleanSurvey(item.source);
        modalMeta.textContent = `${item.project} · ${item.width || '?'}×${item.height || '?'} · ${bytes(item.bytes)} · image ${activeIndex + 1} of ${filtered.length}`;
        modalSources.replaceChildren();
        const label = document.createElement('span');
        label.textContent = item.sources.length > 1 ? 'Found in:' : 'Source:';
        modalSources.appendChild(label);
        const list = document.createElement('ul');
        item.sources.forEach(src => {
            const li = document.createElement('li');
            li.textContent = src;
            list.appendChild(li);
        });
        modalSources.appendChild(list);
        modalOpen.href = item.file;
        modal.hidden = false;
        document.body.classList.add('archive-lightbox-open-body');
        closeBtn.focus();
    }

    function closeLightbox() {
        modal.hidden = true;
        modalImg.removeAttribute('src');
        document.body.classList.remove('archive-lightbox-open-body');
    }

    function step(delta) {
        if (!filtered.length) return;
        activeIndex = (activeIndex + delta + filtered.length) % filtered.length;
        openLightbox(activeIndex);
    }

    search.addEventListener('input', applyFilters);
    filter.addEventListener('change', applyFilters);
    more.addEventListener('click', () => {
        visibleLimit += PAGE_SIZE;
        render();
    });
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    modal.addEventListener('click', e => {
        if (e.target === modal) closeLightbox();
    });
    document.addEventListener('keydown', e => {
        if (modal.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') step(-1);
        else if (e.key === 'ArrowRight') step(1);
    });

    render();
})();
