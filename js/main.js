(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ---------- Footer year ---------- */
    var year = document.getElementById("current-year");
    if (year) year.textContent = new Date().getFullYear();

    /* ---------- Header: solid background once scrolled ---------- */
    var header = document.querySelector(".site-header");
    function updateHeader() {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    /* ---------- Mobile menu ---------- */
    var toggle = document.querySelector(".menu-toggle");
    var links = document.getElementById("nav-links");

    function setMenu(open) {
        toggle.setAttribute("aria-expanded", String(open));
        links.classList.toggle("is-open", open);
        header.classList.toggle("menu-open", open);
    }

    toggle.addEventListener("click", function () {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    links.addEventListener("click", function (e) {
        if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && links.classList.contains("is-open")) {
            setMenu(false);
            toggle.focus();
        }
    });

    window.matchMedia("(min-width: 861px)").addEventListener("change", function (mq) {
        if (mq.matches) setMenu(false);
    });

    /* ---------- Contact form (Formspree) ----------
       Submits in the background and shows an inline status.
       Without JavaScript the form still posts normally. */
    var form = document.querySelector(".contact-form");
    if (form && window.fetch) {
        var status = form.querySelector(".form-status");
        var button = form.querySelector('button[type="submit"]');

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            status.textContent = "Sending…";
            status.className = "form-status";
            button.disabled = true;

            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            })
                .then(function (res) {
                    if (!res.ok) throw new Error("Request failed");
                    form.reset();
                    status.textContent = "Message sent. We'll be in touch soon.";
                    status.classList.add("is-success");
                })
                .catch(function () {
                    status.textContent = "Your message didn't send. Check your connection and try again, or email contact@harborlight.tech.";
                    status.classList.add("is-error");
                })
                .finally(function () {
                    button.disabled = false;
                });
        });
    }

    /* ---------- Hero: a lighthouse beam sweeping across a knowledge graph ---------- */
    var hero = document.querySelector(".hero");
    var canvas = document.querySelector(".hero-canvas");
    if (!hero || !canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var COLORS = {
        beam: "65, 193, 186",
        star: "242, 241, 236",
        slate: "#365b6d",
        teal: "#41c1ba",
        cream: "#f2f1ec"
    };
    var LABELS = ["Customer", "Product", "Supplier", "Contract", "Asset", "Policy", "Location", "Employee"];
    var PERIOD = 16000; // ms per full rotation
    var BEAM_HALF = 0.16; // radians

    var W = 0, H = 0, dpr = 1;
    var nodes = [], edges = [], lamp = { x: 0, y: 0 }, scale = 1, compact = false;
    var running = false, rafId = 0, last = 0, angle = -Math.PI * 0.72;

    // Small seeded random so the layout is stable between loads.
    function rng(seed) {
        return function () {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };
    }

    function build() {
        var rect = hero.getBoundingClientRect();
        W = rect.width;
        H = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        compact = W < 720;
        scale = compact ? 0.55 : Math.max(0.6, Math.min(1.15, H / 780));
        var towerH = 230 * scale;
        var baseX = compact ? W - 46 : Math.min(W - 120, W * 0.84);
        lamp.x = baseX;
        lamp.y = H - 34 - towerH - 16 * scale;

        // Scatter nodes on a jittered grid across the sky.
        var rand = rng(7);
        var cols = compact ? 5 : 11;
        var rows = compact ? 7 : 6;
        var top = 90, bottom = H - 110;
        nodes = [];
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (rand() < 0.28) continue;
                var x = ((c + 0.2 + rand() * 0.6) / cols) * W;
                var y = top + ((r + 0.15 + rand() * 0.7) / rows) * (bottom - top);
                if (Math.hypot(x - lamp.x, y - lamp.y) < 70 * scale) continue;
                nodes.push({
                    x: x,
                    y: y,
                    r: 1.4 + rand() * 1.8,
                    glow: 0,
                    label: null,
                    // Nodes behind the headline stay fainter so the text reads clearly.
                    dim: compact ? 0.6 : (x < W * 0.52 ? 0.45 : 1),
                    angle: 0
                });
            }
        }

        // Label a few nodes away from the headline.
        var labelIdx = 0;
        if (!compact) {
            nodes.forEach(function (n) {
                if (n.x > W * 0.56 && n.x < W - 150 && n.r > 2.2 && labelIdx < LABELS.length) {
                    n.label = LABELS[labelIdx++];
                    n.r = Math.max(n.r, 3);
                }
            });
        }

        // Connect each node to its two nearest neighbours.
        var seen = {};
        edges = [];
        nodes.forEach(function (n, i) {
            n.angle = Math.atan2(n.y - lamp.y, n.x - lamp.x);
            nodes
                .map(function (m, j) { return { j: j, d: Math.hypot(m.x - n.x, m.y - n.y) }; })
                .filter(function (o) { return o.j !== i; })
                .sort(function (a, b) { return a.d - b.d; })
                .slice(0, 2)
                .forEach(function (o) {
                    var key = Math.min(i, o.j) + "-" + Math.max(i, o.j);
                    if (!seen[key]) {
                        seen[key] = true;
                        edges.push([i, o.j]);
                    }
                });
        });
    }

    function angleDiff(a, b) {
        var d = a - b;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return Math.abs(d);
    }

    function inBeam(theta) {
        // Twin beams, like the logo: one each side of the lamp.
        var d = Math.min(angleDiff(theta, angle), angleDiff(theta, angle + Math.PI));
        return d < BEAM_HALF ? 1 - d / BEAM_HALF : 0;
    }

    function drawCone(theta, half, alpha) {
        var len = Math.hypot(W, H);
        var grad = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, len * 0.85);
        grad.addColorStop(0, "rgba(" + COLORS.beam + ", " + alpha + ")");
        grad.addColorStop(0.4, "rgba(" + COLORS.beam + ", " + alpha * 0.3 + ")");
        grad.addColorStop(1, "rgba(" + COLORS.beam + ", 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(lamp.x, lamp.y);
        ctx.lineTo(lamp.x + Math.cos(theta - half) * len, lamp.y + Math.sin(theta - half) * len);
        ctx.lineTo(lamp.x + Math.cos(theta + half) * len, lamp.y + Math.sin(theta + half) * len);
        ctx.closePath();
        ctx.fill();
    }

    function drawBeam(theta) {
        drawCone(theta, BEAM_HALF * 1.6, 0.08);
        drawCone(theta, BEAM_HALF, 0.12);
        drawCone(theta, BEAM_HALF * 0.45, 0.12);
    }

    function drawLighthouse() {
        var s = scale;
        var baseY = H - 34;
        var towerH = 230 * s;
        var bw = 20 * s, tw = 13 * s; // half widths at base and top
        var x = lamp.x;
        var topY = baseY - towerH;

        // Tower body with diagonal stripes, clipped to the tapered shape.
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x - bw, baseY);
        ctx.lineTo(x - tw, topY);
        ctx.lineTo(x + tw, topY);
        ctx.lineTo(x + bw, baseY);
        ctx.closePath();
        ctx.fillStyle = COLORS.teal;
        ctx.fill();
        ctx.clip();
        ctx.fillStyle = COLORS.slate;
        var band = 26 * s;
        for (var y = topY - band; y < baseY + band; y += band * 2) {
            ctx.beginPath();
            ctx.moveTo(x - bw, y + 12 * s);
            ctx.lineTo(x + bw, y - 4 * s);
            ctx.lineTo(x + bw, y - 4 * s + band);
            ctx.lineTo(x - bw, y + 12 * s + band);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Gallery, lantern room, and roof.
        ctx.fillStyle = COLORS.slate;
        ctx.fillRect(x - tw - 5 * s, topY - 5 * s, (tw + 5 * s) * 2, 6 * s);
        ctx.fillStyle = COLORS.cream;
        ctx.fillRect(x - 9 * s, topY - 22 * s, 18 * s, 17 * s);
        ctx.fillStyle = COLORS.slate;
        ctx.beginPath();
        ctx.moveTo(x - 14 * s, topY - 22 * s);
        ctx.lineTo(x, topY - 34 * s);
        ctx.lineTo(x + 14 * s, topY - 22 * s);
        ctx.closePath();
        ctx.fill();

        // Lamp glow.
        var g = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, 30 * s);
        g.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        g.addColorStop(0.3, "rgba(" + COLORS.beam + ", 0.5)");
        g.addColorStop(1, "rgba(" + COLORS.beam + ", 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y, 30 * s, 0, Math.PI * 2);
        ctx.fill();
    }

    function draw(dt) {
        ctx.clearRect(0, 0, W, H);

        drawBeam(angle);
        drawBeam(angle + Math.PI);

        // Nodes light up as the beam passes, then fade slowly.
        var decay = Math.pow(0.5, dt / 1400);
        nodes.forEach(function (n) {
            var hit = inBeam(n.angle);
            n.glow = Math.max(n.glow * decay, hit);
        });

        // Edges appear between nodes that are both lit.
        ctx.lineWidth = 1;
        edges.forEach(function (e) {
            var a = nodes[e[0]], b = nodes[e[1]];
            var alpha = 0.05 + Math.min(a.glow, b.glow) * 0.5 * Math.min(a.dim, b.dim);
            ctx.strokeStyle = "rgba(" + COLORS.beam + ", " + alpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        });

        ctx.font = "500 12px 'Instrument Sans', system-ui, sans-serif";
        ctx.textBaseline = "middle";
        nodes.forEach(function (n) {
            var lit = n.glow * n.dim;
            if (lit > 0.05) {
                ctx.fillStyle = "rgba(" + COLORS.beam + ", " + (lit * 0.35).toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "rgba(" + COLORS.star + ", " + (0.25 + lit * 0.75).toFixed(3) + ")";
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();

            if (n.label && lit > 0.02) {
                ctx.fillStyle = "rgba(" + COLORS.star + ", " + (lit * 0.85).toFixed(3) + ")";
                ctx.fillText(n.label, n.x + 9, n.y);
            }
        });

        drawLighthouse();
    }

    function frame(now) {
        var dt = last ? Math.min(now - last, 64) : 16;
        last = now;
        angle += (dt / PERIOD) * Math.PI * 2;
        draw(dt);
        rafId = requestAnimationFrame(frame);
    }

    function start() {
        if (running || reduceMotion.matches) return;
        running = true;
        last = 0;
        rafId = requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(rafId);
    }

    function renderStill() {
        // A single composed frame: beam raised toward the upper left, graph lit.
        angle = -Math.PI * 0.86;
        nodes.forEach(function (n) {
            n.glow = Math.max(inBeam(n.angle), 0.55);
        });
        draw(0);
    }

    function init() {
        build();
        if (reduceMotion.matches) renderStill();
        else draw(16);
    }

    init();

    var visible = true;
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible && !document.hidden) start();
            else stop();
        }).observe(hero);
    } else {
        start();
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else if (visible) start();
    });

    reduceMotion.addEventListener("change", function () {
        stop();
        init();
        if (!reduceMotion.matches && visible) start();
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            build();
            if (!running) {
                if (reduceMotion.matches) renderStill();
                else draw(16);
            }
        }, 120);
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
            if (!running) init();
        });
    }
})();
