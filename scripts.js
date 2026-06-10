/* ===================================================
   NATSU SKIN v2.0 — script.js
   夏の記憶 · Soft Sky Archive
   ─ 단일 정규화 스크립트 (중복 IIFE 제거) ─
   =================================================== */
(function () {
  "use strict";

  const C = window.NATSU || {};

  /* ── 1. 설정값 주입 (.nc[data-key]) ─────────────── */
  document.querySelectorAll(".nc[data-key]").forEach(function (el) {
    const v = C[el.dataset.key];
    if (v !== undefined && v !== null) el.textContent = v;
  });
  const bgmSrc = document.getElementById("bgm-src");
  if (bgmSrc && C.audioSrc) bgmSrc.src = C.audioSrc;
  const albumArtEl = document.getElementById("albumArt");
  if (albumArtEl && C.albumArt) {
    const img = document.createElement("img");
    img.src = C.albumArt;
    img.alt = "album art";
    albumArtEl.innerHTML = "";
    albumArtEl.appendChild(img);
  }

  /* ── 2. 다크 / 라이트 모드 ──────────────────────── */
  const html = document.documentElement;
  const THEME_KEY = "natsu-theme";
  function applyTheme(t) {
    html.setAttribute("data-theme", t);
    localStorage.setItem(THEME_KEY, t);
  }
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) applyTheme(saved);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) applyTheme("dark");
  else if (C.darkDefault) applyTheme("dark");
  else applyTheme("light");

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? "dark" : "light");
  });
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ── 3. 커스텀 커서 ──────────────────────────────── */
  const cursorEl = document.getElementById("custom-cursor");
  if (cursorEl && C.cursorSrc) {
    cursorEl.style.cssText =
      "display:block;background:url(" + C.cursorSrc + ") center/contain no-repeat;";
    document.body.classList.add("has-cursor");
    document.addEventListener("mousemove", function (e) {
      cursorEl.style.left = e.clientX + "px";
      cursorEl.style.top  = e.clientY + "px";
    });
  }

  /* ── 4. 배경 파티클 ──────────────────────────────── */
  (function () {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    const effect = (C.bgEffect || "firefly").toLowerCase();
    const N      = Math.max(10, Math.min(120, C.bgIntensity || 40));
    if (effect === "none") { canvas.style.display = "none"; return; }

    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    function mkP() {
      const p = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - .5) * .5,
        vy: -(Math.random() * .6 + .2),
        life: Math.random() * 200,
        maxLife: Math.random() * 200 + 120,
        size: Math.random() * 3 + 1,
      };
      if (effect === "firefly") {
        p.color = ["#ffe066","#b2ff59","#4fc3f7"][~~(Math.random()*3)];
        p.vy = (Math.random()-.5)*.4; p.vx = (Math.random()-.5)*.4;
        p.pulse = Math.random() * Math.PI * 2;
      } else if (effect === "sakura") {
        p.color = ["#ffb7c5","#ffd6e0","#ff8fab"][~~(Math.random()*3)];
        p.rot = Math.random()*Math.PI*2; p.rotV = (Math.random()-.5)*.04;
        p.vx = (Math.random()-.5)*.8; p.vy = Math.random()*.8+.3;
        p.size = Math.random()*5+3;
      } else if (effect === "snow") {
        p.color = "rgba(220,240,255,.85)";
        p.vx = (Math.random()-.5)*.5; p.vy = Math.random()*.6+.2;
        p.size = Math.random()*4+2;
      } else if (effect === "bubble") {
        p.color = "rgba(79,195,247,.35)";
        p.size = Math.random()*10+4;
        p.vx = (Math.random()-.5)*.4; p.vy = -(Math.random()*.5+.2);
      }
      return p;
    }

    const pts = Array.from({length:N}, mkP);

    function draw(p) {
      ctx.save();
      if (effect === "firefly") {
        p.pulse += .05;
        ctx.globalAlpha = (Math.sin(p.pulse)*.5+.5)*.8+.2;
        ctx.fillStyle = p.color; ctx.shadowBlur=8; ctx.shadowColor=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      } else if (effect === "sakura") {
        ctx.globalAlpha=.7; ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.fillStyle=p.color;
        ctx.beginPath(); ctx.ellipse(0,0,p.size,p.size*.55,0,0,Math.PI*2); ctx.fill();
        p.rot+=p.rotV;
      } else if (effect === "snow") {
        ctx.globalAlpha=.7; ctx.fillStyle=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      } else if (effect === "bubble") {
        ctx.globalAlpha=.5; ctx.strokeStyle=p.color; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.stroke();
        ctx.globalAlpha=.3; ctx.fillStyle="rgba(255,255,255,.6)";
        ctx.beginPath(); ctx.arc(p.x-p.size*.3,p.y-p.size*.3,p.size*.28,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(function(p){
        p.x+=p.vx; p.y+=p.vy; p.life++;
        if (p.life>p.maxLife||p.x<-20||p.x>canvas.width+20||p.y<-20||p.y>canvas.height+20) {
          Object.assign(p, mkP());
          if (effect==="sakura"||effect==="snow") p.y=-10;
          else p.y=canvas.height+10;
        }
        draw(p);
      });
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ── 5. 메인 이미지 슬라이더 ────────────────────── */
  (function () {
    const wrap  = document.getElementById("sliderWrap");
    const track = document.getElementById("sliderTrack");
    const dotsEl = document.getElementById("sliderDots");
    const prevBtn = document.getElementById("sliderPrev");
    const nextBtn = document.getElementById("sliderNext");
    const ph    = document.getElementById("sliderPlaceholder");

    if (!wrap || !track) return;

    const slides = (C.slides || []).filter(Boolean);
    if (!slides.length) return; /* placeholder 유지 */
    if (ph) ph.style.display = "none";

    wrap.setAttribute("data-count", slides.length);

    /* 이미지 생성 */
    slides.forEach(function (src) {
      const img = document.createElement("img");
      img.className = "slider-img";
      img.src = src;
      img.alt = "main image";
      img.loading = "lazy";
      track.appendChild(img);
    });

    /* 닷 생성 */
    slides.forEach(function (_, i) {
      const d = document.createElement("button");
      d.className = "slider-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", (i+1) + "번 슬라이드");
      d.type = "button";
      d.addEventListener("click", function() { goTo(i); });
      dotsEl && dotsEl.appendChild(d);
    });

    let cur = 0, timer = null;

    function goTo(idx) {
      cur = (idx + slides.length) % slides.length;
      track.style.transform = "translateX(-" + (cur * 100) + "%)";
      dotsEl && dotsEl.querySelectorAll(".slider-dot").forEach(function(d,i){
        d.classList.toggle("active", i === cur);
      });
      resetTimer();
    }

    function resetTimer() {
      clearInterval(timer);
      if (slides.length > 1) {
        timer = setInterval(function(){ goTo(cur + 1); }, C.slideInterval || 4000);
      }
    }

    prevBtn && prevBtn.addEventListener("click", function(){ goTo(cur - 1); });
    nextBtn && nextBtn.addEventListener("click", function(){ goTo(cur + 1); });

    /* 터치 스와이프 */
    var touchX = 0;
    wrap.addEventListener("touchstart", function(e){ touchX = e.touches[0].clientX; },{passive:true});
    wrap.addEventListener("touchend", function(e){
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) goTo(cur + (dx < 0 ? 1 : -1));
    });

    resetTimer();
  })();

  /* ── 6. D-DAY 계산 ───────────────────────────────── */
  (function () {
    const numEl = document.getElementById("ddayNum");
    if (!numEl || !C.ddayStart) return;
    const start = new Date(C.ddayStart);
    const today = new Date();
    start.setHours(0,0,0,0); today.setHours(0,0,0,0);
    const diff = Math.round((today - start) / 86400000);
    const mode = C.ddayMode || "dday";
    let label = "";
    if (mode === "dplus") {
      label = diff >= 0 ? "D+" + diff : "D-" + Math.abs(diff);
    } else if (mode === "count") {
      label = (diff + 1) + "일째";
    } else { /* dday */
      label = diff === 0 ? "D-DAY" : (diff > 0 ? "D+" + diff : "D-" + Math.abs(diff));
    }
    numEl.textContent = label;
  })();

  /* ── 7. MP3 플레이어 ─────────────────────────────── */
  (function () {
    const audio   = document.getElementById("bgm");
    const toggle  = document.getElementById("audioToggle");
    const stopBtn = document.getElementById("audioStop");
    const backBtn = document.getElementById("audioBack");
    const loopBtn = document.getElementById("audioLoop");
    const loopBadge = document.getElementById("loopBadge");
    const fill    = document.getElementById("progressFill");
    const pBar    = document.querySelector(".player-progress");
    const curEl   = document.getElementById("audioCurrent");
    const durEl   = document.getElementById("audioDuration");
    const volSl   = document.getElementById("volSlider");

    if (!audio || !toggle) return;

    /* 초기 설정 */
    audio.loop   = !!C.loopPlay;
    audio.volume = volSl ? parseFloat(volSl.value) : 0.6;
    if (C.loopPlay && loopBtn)  loopBtn.classList.add("active");
    if (C.loopPlay && loopBadge) loopBadge.classList.add("active");

    function fmt(s) {
      if (!isFinite(s)) return "0:00";
      return ~~(s/60) + ":" + String(~~(s%60)).padStart(2,"0");
    }

    toggle.addEventListener("click", function () {
      if (audio.paused) { audio.play().catch(function(){}); toggle.textContent = "Ⅱ"; }
      else { audio.pause(); toggle.textContent = "▶"; }
    });
    stopBtn && stopBtn.addEventListener("click", function () {
      audio.pause(); audio.currentTime = 0;
      toggle.textContent = "▶";
      if (fill) fill.style.width = "0%";
      if (curEl) curEl.textContent = "0:00";
    });
    backBtn && backBtn.addEventListener("click", function () {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
    loopBtn && loopBtn.addEventListener("click", function () {
      audio.loop = !audio.loop;
      loopBtn.classList.toggle("active", audio.loop);
      loopBadge && loopBadge.classList.toggle("active", audio.loop);
    });
    volSl && volSl.addEventListener("input", function () {
      audio.volume = parseFloat(this.value);
    });
    audio.addEventListener("loadedmetadata", function () {
      if (durEl) durEl.textContent = fmt(audio.duration);
    });
    audio.addEventListener("timeupdate", function () {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (fill) fill.style.width = pct.toFixed(2) + "%";
      if (pBar)  pBar.setAttribute("aria-valuenow", ~~pct);
      if (curEl) curEl.textContent = fmt(audio.currentTime);
      if (durEl) durEl.textContent = fmt(audio.duration);
    });
    audio.addEventListener("ended", function () {
      if (!audio.loop) toggle.textContent = "▶";
    });

    /* 프로그레스바 클릭 seek */
    pBar && pBar.addEventListener("click", function (e) {
      if (!audio.duration) return;
      const r = pBar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });

    /* 자동재생 */
    if (C.autoPlay) audio.play().catch(function(){});
  })();

  /* ── 8. 메뉴 접기 ────────────────────────────────── */
  (function () {
    const card   = document.querySelector(".menu-card");
    const toggle = document.getElementById("menuToggle");
    if (!card || !toggle) return;
    toggle.addEventListener("click", function () {
      const collapsed = card.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
    });
  })();

  /* ── 9. 검색 버튼 ────────────────────────────────── */
  (function () {
    const btn   = document.getElementById("searchBtn");
    const input = document.getElementById("searchInput");
    if (!btn || !input) return;
    const onclick = btn.getAttribute("data-onclick");
    if (onclick) {
      btn.addEventListener("click", function () { (new Function(onclick))(); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); (new Function(onclick))(); }
      });
    }
  })();

  /* ── 10. 보호글 비밀번호 처리 ───────────────────── */
  (function () {
    const wrap  = document.querySelector(".protected-wrap");
    const input = document.getElementById("protected-pw");
    const errEl = document.getElementById("protected-error");
    const btn   = document.querySelector(".protected-btn");
    if (!wrap || !input || !errEl) return;

    const ATTEMPT_KEY = "natsu_pw_attempt";

    /* 이전 제출 후 재로드 = 오류 */
    if (sessionStorage.getItem(ATTEMPT_KEY) === "1") {
      errEl.hidden = false;
      input.classList.add("shake");
      input.setAttribute("aria-invalid", "true");
      setTimeout(function(){ input.classList.remove("shake"); }, 500);
      input.focus();
      sessionStorage.removeItem(ATTEMPT_KEY);
    }

    function submitAction() {
      if (!input.value.trim()) {
        errEl.hidden = false;
        errEl.textContent = "비밀번호를 입력해 주세요.";
        input.classList.add("shake");
        setTimeout(function(){ input.classList.remove("shake"); }, 500);
        input.focus();
        return false;
      }
      sessionStorage.setItem(ATTEMPT_KEY, "1");
      return true;
    }

    /* 확인 버튼: data-submit 에 티스토리 핸들러 저장 */
    if (btn) {
      const origHandler = btn.getAttribute("data-submit");
      btn.addEventListener("click", function () {
        if (submitAction() && origHandler) {
          try { (new Function(origHandler))(); }
          catch(e) { console.warn("protected submit:", e); }
        }
      });
    }

    /* Enter 키 */
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (submitAction() && btn) btn.click();
    });

    /* 입력 시 오류 초기화 */
    input.addEventListener("input", function () {
      if (!errEl.hidden) {
        errEl.hidden = true;
        input.removeAttribute("aria-invalid");
      }
    });

    /* 본문 로드 성공 시 플래그 제거 */
    if (document.querySelector(".post-view")) {
      sessionStorage.removeItem(ATTEMPT_KEY);
    }
  })();

  /* ── 11. 카드 등장 애니메이션 ───────────────────── */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".card").forEach(function (el, i) {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      el.style.transition =
        "opacity .4s ease " + (i * 0.055) + "s," +
        "transform .4s ease " + (i * 0.055) + "s";
      io.observe(el);
    });
  }

  /* ── 12. 맨 위로 버튼 ───────────────────────────── */
  (function () {
    const btn = document.createElement("button");
    btn.textContent = "↑";
    btn.setAttribute("aria-label", "맨 위로");
    btn.style.cssText = [
      "position:fixed","bottom:20px","right:20px","z-index:999",
      "width:36px","height:36px","border-radius:50%",
      "border:1.5px solid rgba(79,195,247,.6)",
      "background:rgba(255,255,255,.9)","color:#0277bd",
      "font-size:16px","font-weight:700","cursor:pointer",
      "box-shadow:0 4px 12px rgba(2,119,189,.15)",
      "opacity:0","transition:opacity .3s",
      "backdrop-filter:blur(4px)",
    ].join(";");
    document.body.appendChild(btn);
    window.addEventListener("scroll", function () {
      btn.style.opacity = scrollY > 200 ? "1" : "0";
    });
    btn.addEventListener("click", function () {
      window.scrollTo({ top:0, behavior:"smooth" });
    });
  })();

  /* ── 13. Lazy Load ───────────────────────────────── */
  if ("IntersectionObserver" in window) {
    const imgIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.target.dataset.src) {
          e.target.src = e.target.dataset.src;
          imgIo.unobserve(e.target);
        }
      });
    });
    document.querySelectorAll("img[data-src]").forEach(function (img) { imgIo.observe(img); });
  }

  /* ── 14. 코드블럭 복사 버튼 ─────────────────────── */
  document.querySelectorAll(".post-body pre").forEach(function (pre) {
    const btn = document.createElement("button");
    btn.textContent = "copy";
    btn.style.cssText = [
      "position:absolute","top:8px","right:8px","padding:2px 8px",
      "border:1px solid rgba(79,195,247,.4)","border-radius:4px",
      "background:rgba(0,0,0,.3)","color:#81d4fa",
      "font-size:10px","cursor:pointer","font-family:inherit",
    ].join(";");
    pre.style.position = "relative";
    pre.appendChild(btn);
    btn.addEventListener("click", function () {
      const code = pre.querySelector("code");
      const text = (code ? code.textContent : pre.textContent).replace(/\bcopy\b/,"").trim();
      navigator.clipboard && navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "✓ copied";
        setTimeout(function () { btn.textContent = "copy"; }, 1800);
      });
    });
  });

  /* ── 15. 본문 예상 읽기 시간 ────────────────────── */
  (function () {
    const body = document.getElementById("post-body");
    const el   = document.getElementById("readTime");
    if (!body || !el) return;
    const words = body.textContent.trim().length;
    const min   = Math.max(1, Math.ceil(words / 500));
    el.textContent = "약 " + min + "분 읽기";
  })();

})();


/* === 보호글 섹션 홈/목록 숨김 처리 === */
(function () {
  const protectedWrap = document.querySelector(".protected-wrap");
  const secretPage = document.querySelector(".secret-page");

  const hasProtectedInput =
    document.querySelector("#protected-pw") ||
    document.querySelector("[name='[##_article_password_name_##]']") ||
    document.querySelector(".protected-input");

  const protectedTitleText =
    document.querySelector(".protected-title")?.textContent?.trim() || "";

  const isRawTistoryBlock =
    protectedTitleText.includes("[##_") ||
    document.body.textContent.includes("[##_article_protected_title_##]");

  const isArticleLike =
    location.pathname.includes("/entry/") ||
    location.pathname.includes("/m/") ||
    document.querySelector(".post-view");

  const isProtectedPage =
    !!hasProtectedInput && !isRawTistoryBlock && isArticleLike;

  if (isProtectedPage) {
    document.body.classList.add("is-protected-page");
    return;
  }

  document.body.classList.remove("is-protected-page");

  if (protectedWrap) protectedWrap.remove();
  if (secretPage) secretPage.remove();
})();


/* === 글 상세 영역 홈/목록 숨김 처리 === */
(function () {
  const postView = document.querySelector(".post-view");
  if (!postView) return;

  const rawArticle =
    postView.textContent.includes("[##_article_content_##]") ||
    postView.textContent.includes("[##_article_title_##]");

  const isArticleUrl =
    location.pathname.includes("/entry/") ||
    /^\/\d+/.test(location.pathname);

  if (isArticleUrl && !rawArticle) {
    document.body.classList.add("is-article-page");
    return;
  }

  document.body.classList.remove("is-article-page");
  postView.remove();
})();


/* === MP3 time/back button patch === */
(function () {
  const audio = document.getElementById("bgm");
  const cur = document.getElementById("audioCurrent");
  const dur = document.getElementById("audioDuration");
  const back = document.getElementById("audioBack");

  function fmt(sec) {
    if (!Number.isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  if (audio) {
    audio.addEventListener("loadedmetadata", function () {
      if (dur) dur.textContent = fmt(audio.duration);
    });

    audio.addEventListener("timeupdate", function () {
      if (cur) cur.textContent = fmt(audio.currentTime);
      if (dur && audio.duration) dur.textContent = fmt(audio.duration);
    });
  }

  if (audio && back) {
    back.addEventListener("click", function () {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
  }
})();
