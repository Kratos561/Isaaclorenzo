/* ============================================================
   AISAK 3D — Animaciones GSAP
   Skills: gsap-core (tweens, eases, stagger, matchMedia),
           gsap-timeline (labels, position parameter),
           gsap-scrolltrigger (batch, scrub, once).
   Si el CDN no carga, la web usa su sistema CSS/IO de respaldo.
   ============================================================ */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.defaults({ duration: 0.7, ease: "power3.out" });

  const mm = gsap.matchMedia();

  mm.add(
    {
      reduceMotion: "(prefers-reduced-motion: reduce)",
      finePointer: "(hover: hover) and (pointer: fine)"
    },
    (context) => {
      const { reduceMotion, finePointer } = context.conditions;
      if (reduceMotion) return; // el CSS ya anula el movimiento

      document.documentElement.classList.add("gsap-on");

      /* ---------- HERO: timeline de entrada (páginas con rejilla hero) ---------- */
      if (document.querySelector(".hero__grid")) {
        const heroTl = gsap.timeline({ defaults: { duration: 0.9, ease: "power3.out" } });
        heroTl.addLabel("intro", 0.45);
        heroTl.from(".hero__meta .label", { y: 18, autoAlpha: 0, duration: 0.6 }, "intro");
        heroTl.from(".hero__slate > div", { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, "intro+=0.1");
        heroTl.from(".hero__intro", { y: 22, autoAlpha: 0 }, "intro+=0.25");
        heroTl.from(".hero__credit", { autoAlpha: 0, duration: 0.6 }, "intro+=0.35");
      }

      /* ---------- PORTAFOLIO: respiración + brillo suave ---------- */
      const word = document.getElementById("portafolioWord");
      if (word && !word.querySelector("span")) {
        const text = word.textContent.trim();
        word.textContent = "";
        text.split("").forEach((ch) => {
          const s = document.createElement("span");
          s.textContent = ch;
          word.appendChild(s);
        });
      }
      if (word) {
        gsap.to(word, {
          scale: 1.015, duration: 3.2, ease: "sine.inOut",
          yoyo: true, repeat: -1, transformOrigin: "50% 50%"
        });
        gsap.to("#portafolioWord > span", {
          opacity: 0.55, duration: 1.6, ease: "sine.inOut",
          stagger: { each: 0.18, yoyo: true, repeat: -1 }
        });
      }

      /* ---------- HERO: logo flotante en subpáginas (img sin keyframes) ---------- */
      const heroLogoImg = document.querySelector(".hero__logo img");
      if (heroLogoImg) {
        gsap.to(heroLogoImg, { y: -12, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }

      /* ---------- HERO: parallax al hacer scroll (scrub) ---------- */
      if (document.querySelector(".hero")) {
        if (document.querySelector(".hero__logo img")) {
          gsap.to(".hero__logo img", {
            yPercent: 14, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
          });
        }
        if (word) {
          gsap.to(word, {
            yPercent: 10, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
          });
        }
        if (document.querySelector(".hero__name")) {
          gsap.to(".hero__name", {
            yPercent: -10, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
          });
        }
      }

      /* ---------- REVEALS por scroll, con stagger por lotes ---------- */
      const FROM = {
        up:    { from: { y: 28, autoAlpha: 0 }, to: { y: 0, autoAlpha: 1 } },
        right: { from: { x: 40, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 } },
        mask:  { from: { clipPath: "inset(0 0 100% 0)" }, to: { clipPath: "inset(0 0 0% 0)" } }
      };
      ["up", "right", "mask"].forEach((kind) => {
        const els = gsap.utils.toArray('[data-reveal][data-from="' + kind + '"]');
        if (!els.length) return;
        gsap.set(els, FROM[kind].from);
        ScrollTrigger.batch(els, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => gsap.to(batch, {
            ...FROM[kind].to,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
            overwrite: true
          })
        });
      });

      /* ---------- MARQUEE infinito (principal) ---------- */
      const marquee = document.querySelector(".marquee");
      if (marquee && marquee.children.length) {
        Array.from(marquee.children).forEach((node) => {
          const clone = node.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          marquee.appendChild(clone);
        });
        gsap.fromTo(
          marquee,
          { x: 0 },
          { x: () => -(marquee.scrollWidth / 2), duration: 24, ease: "none", repeat: -1 }
        );
      }

      /* ---------- BOTONES magnéticos (solo puntero fino) ---------- */
      if (finePointer) {
        document.querySelectorAll(".btn").forEach((btn) => {
          const xTo = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power2.out" });
          const yTo = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power2.out" });
          btn.addEventListener("pointermove", (e) => {
            const r = btn.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
          });
          btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
        });
      }

      /* ---------- PORTAFOLIO 3D: inclinación con el cursor ---------- */
      if (finePointer && word) {
        gsap.set(word, { transformPerspective: 1000 });
        const tiltX = gsap.quickTo(word, "rotationX", { duration: 0.6, ease: "power2.out" });
        const tiltY = gsap.quickTo(word, "rotationY", { duration: 0.6, ease: "power2.out" });
        const zone = document.querySelector(".hero--cover") || document;
        zone.addEventListener("pointermove", (e) => {
          const r = word.getBoundingClientRect();
          const px = (e.clientX - (r.left + r.width / 2)) / r.width;
          const py = (e.clientY - (r.top + r.height / 2)) / r.height;
          tiltY(gsap.utils.clamp(-12, 12, px * 24));
          tiltX(gsap.utils.clamp(-10, 10, -py * 20));
        });
        zone.addEventListener("pointerleave", () => { tiltX(0); tiltY(0); });
      }

      /* ---------- RETRATO: deriva sutil con el scroll ---------- */
      if (document.querySelector(".portrait")) {
        gsap.fromTo(".portrait", { y: -16 }, {
          y: 16, ease: "none",
          scrollTrigger: { trigger: ".about__grid", start: "top bottom", end: "bottom top", scrub: true }
        });
      }

      /* ---------- Recalcula triggers al cargar fuentes/imágenes ---------- */
      window.addEventListener("load", () => ScrollTrigger.refresh());
    }
  );
})();
