document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = document.getElementById('particle-canvas');
    if (canvas && !reducedMotion) {
        const ctx = canvas.getContext('2d');

        let width, height;
        let cols, rows;
        const charSize = 20; 
        const chars = ['·', '+', 'x', '*', '0', '1']; 
        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            cols = Math.ceil(width / charSize);
            rows = Math.ceil(height / charSize);

            ctx.font = '14px "Hack", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // phones don't need 60fps of background texture
        const frameGap = window.matchMedia('(max-width: 768px)').matches ? 1000 / 24 : 0;
        let lastFrame = 0;

        function draw(now) {
            if (frameGap && now - lastFrame < frameGap) {
                requestAnimationFrame(draw);
                return;
            }
            lastFrame = now || 0;

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            const time = Date.now() * 0.001;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const dist = Math.sqrt((x - cols / 2) ** 2 + (y - rows / 2) ** 2);
                    const angle = dist * 0.1 - time * 2;
                    const wave = Math.sin(angle) + Math.sin(x * 0.2 + time) + Math.sin(y * 0.2 + time);

                    const val = (wave + 3) / 6;
                    let charIndex = Math.floor(val * chars.length);
                    if (charIndex < 0) charIndex = 0;
                    if (charIndex >= chars.length) charIndex = chars.length - 1;

                    const char = chars[charIndex];

                    const brightness = Math.floor(val * 255);
                    const alpha = (val * 0.5) + 0.1;

                    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;

                    const posX = x * charSize + charSize / 2;
                    const posY = y * charSize + charSize / 2;

                    ctx.fillText(char, posX, posY);
                }
            }

            requestAnimationFrame(draw);
        }

        draw();
    }

    if (canvas && reducedMotion) {
        canvas.style.display = 'none';
    }

    class AsciiBorderManager {
        constructor() {
            this.charWidth = 0;
            this.charHeight = 0;
            this.resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    this.updateBorder(entry.target);
                }
            });
            this.init();
        }

        init() {
            document.fonts.ready.then(() => {
                this.measureChar();
                this.observeBoxes();
            });

            window.addEventListener('resize', () => {
                this.measureChar();
                this.updateAllBorders();
            });
        }

        observeBoxes() {
            const boxes = document.querySelectorAll('.ascii-box');
            boxes.forEach(box => {
                this.resizeObserver.observe(box);
                this.updateBorder(box); 
            });
        }

        measureChar() {
            const span = document.createElement('span');
            span.style.fontFamily = '"Hack", monospace';
            span.style.fontSize = '16px';
            span.style.lineHeight = '1';
            span.style.position = 'absolute';
            span.style.visibility = 'hidden';
            span.style.whiteSpace = 'pre';
            span.textContent = 'X';
            document.body.appendChild(span);

            const rect = span.getBoundingClientRect();
            this.charWidth = rect.width;
            this.charHeight = rect.height;

            document.body.removeChild(span);

            if (this.charWidth === 0) this.charWidth = 9.6; 
            if (this.charHeight === 0) this.charHeight = 16;
        }

        updateAllBorders() {
            document.querySelectorAll('.ascii-box').forEach(box => this.updateBorder(box));
        }

        updateBorder(box) {
            let overlay = box.querySelector('.ascii-border-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'ascii-border-overlay';
                box.appendChild(overlay);
            }

            const rect = box.getBoundingClientRect();
            const cols = Math.floor(rect.width / this.charWidth);
            const rows = Math.floor(rect.height / this.charHeight);

            if (cols < 2 || rows < 2) {
                overlay.textContent = '';
                return;
            }

            let border = '';

            const TL = '┌';
            const TR = '┐';
            const BL = '└';
            const BR = '┘';
            const H = '─';
            const V = '│';

            border += TL + H.repeat(Math.max(0, cols - 2)) + TR + '\n';

            const middleRow = V + ' '.repeat(Math.max(0, cols - 2)) + V + '\n';
            border += middleRow.repeat(Math.max(0, rows - 2));

            border += BL + H.repeat(Math.max(0, cols - 2)) + BR;

            overlay.textContent = border;

            overlay.style.fontFamily = '"Hack", monospace';
            overlay.style.fontSize = '16px';
            overlay.style.lineHeight = '1';
            overlay.style.letterSpacing = '0px';
            overlay.style.top = '0';
            overlay.style.left = '0';
        }
    }

    document.fonts.ready.then(() => {
        new AsciiBorderManager();
    });

    const articlesGrid = document.getElementById('articles-grid');
    const articleTitle = document.getElementById('article-title');

    if (articlesGrid && typeof articles !== 'undefined') {
        articlesGrid.innerHTML = articles.map(article => `
            <article class="card writeup-card ascii-box" onclick="window.location.href='article.html?id=${article.id}'">
                <div class="card-header">
                    <span class="date">[ ${article.date} ]</span>
                    <span class="category">/ ${article.category}</span>
                </div>
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <a href="article.html?id=${article.id}" class="read-more">> ./read</a>
            </article>
        `).join('');
    }

    if (articleTitle && typeof articles !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        const article = articles.find(a => a.id === articleId);

        if (article) {
            document.getElementById('article-category').textContent = article.category;
            document.getElementById('article-title').textContent = article.title;
            document.getElementById('article-date').textContent = article.date;
            document.getElementById('article-readtime').textContent = article.readTime;
            document.getElementById('article-body').innerHTML = article.content;
            document.title = `${article.title} | Terminal`;
        } else {
            document.getElementById('article-body').innerHTML = '<p>> Error: Article data not found.</p>';
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
