/**
 * SMCサンプリング風パーティクルフローアニメーション
 * 多峰性分布を滑らかな粒子の流れで表現（軽量版）
 */
(() => {
  const canvas = document.querySelector("[data-particle-canvas]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // 多峰性分布のピーク（アトラクタ）をランダム生成
  const peaks = (() => {
    const rand = (min, max) => min + Math.random() * (max - min);
    const count = Math.floor(rand(7, 10));
    const result = [];
    const minDist = 0.16;
    let guard = 0;
    while (result.length < count && guard < 200) {
      const candidate = {
        x: rand(0.12, 0.88),
        y: rand(0.12, 0.88),
        strength: rand(0.8, 1.45),
        spread: rand(0.22, 0.34),
      };
      let ok = true;
      for (const p of result) {
        const dx = p.x - candidate.x;
        const dy = p.y - candidate.y;
        if (dx * dx + dy * dy < minDist * minDist) {
          ok = false;
          break;
        }
      }
      if (ok) result.push(candidate);
      guard++;
    }
    if (result.length === 0) {
      result.push({ x: 0.5, y: 0.5, strength: 1.0, spread: 0.3 });
    }
    return result;
  })();

  const config = {
    particleCount: 30,            // 粒子数を少なめに
    // 表現と計算コストのバランス
    maxFps: 30,
    dprScale: 0.55,               // 低解像度で描画（負荷削減）
    viewScale: 1.18,              // 表示を少し拡大
    speedScale: 700,              // 動きの速さ（大きく）
    pullStrength: 0.6,            // 分布への引力
    noiseStrength: 6.0,           // ランダムウォーク強度（強め＝ギザギザ）
    flowStrength: 0.04,           // マクロな流れ
    flowScale: 0.0018,            // マクロ流れのスケール
    damping: 0.1,                 // 速度減衰（低め＝毎ステップ方向が大きく変化）
    maxSpeed: 42.0,               // 最大速度（大きく）
    fadeAlpha: 0.018,             // トレイルの長さ
    lineAlpha: 0.85,              // 流れの線の濃さ
    tailScale: 1.4,               // 速度に対する線の長さ
    lineWidthScale: 1.1,          // 線の太さスケール
    resampleProb: 0.003,          // 低重み粒子の再配置
    minRadius: 0.8,
    maxRadius: 1.8,
    hueBase: 215,
    hueRange: 28,
  };

  const state = {
    width: 0,
    height: 0,
    simWidth: 0,
    simHeight: 0,
    particles: [],
    running: false,
    rafId: null,
    time: 0,
    lastTime: 0,
    scaledPeaks: [],
    totalStrength: peaks.reduce((sum, p) => sum + p.strength, 0),
    target: { x: 0, y: 0, strength: 0 },
  };

  // シンプルな乱数（Box-Muller不要、軽量）
  const randRange = (min, max) => min + Math.random() * (max - min);
  // 近似ガウス乱数（合成一様乱数、軽量）
  const randnApprox = () =>
    Math.random() + Math.random() + Math.random() + Math.random() - 2;

  // ポテンシャル（多峰性分布）の評価
  const calcPotential = (x, y) => {
    let pot = 0;
    for (const peak of state.scaledPeaks) {
      const dx = x - peak.x;
      const dy = y - peak.y;
      const d2 = dx * dx + dy * dy;
      const denom = 1 + d2 * peak.invSpread;
      pot += peak.strength / denom;
    }
    return Math.min(1, pot / state.totalStrength);
  };

  // 概念的なサンプリング表現: ポテンシャルと引力ベクトル
  const calcPotentialAndPull = (x, y) => {
    let pot = 0;
    let pullX = 0;
    let pullY = 0;
    for (const peak of state.scaledPeaks) {
      const dx = peak.x - x;
      const dy = peak.y - y;
      const d2 = dx * dx + dy * dy;
      const denom = 1 + d2 * peak.invSpread;
      const w = peak.strength / denom;
      pot += w;
      const force = w * peak.invSpread;
      pullX += dx * force;
      pullY += dy * force;
    }
    const norm = state.totalStrength || 1;
    return {
      pot: Math.min(1, pot / norm),
      pullX: pullX / norm,
      pullY: pullY / norm,
    };
  };

  const createParticle = () => {
    const x = Math.random() * state.simWidth;
    const y = Math.random() * state.simHeight;
    return {
      x,
      y,
      prevX: x,
      prevY: y,
      vx: randRange(-0.22, 0.22),
      vy: randRange(-0.22, 0.22),
      radius: randRange(config.minRadius, config.maxRadius),
      hue: config.hueBase + randRange(-config.hueRange / 2, config.hueRange / 2),
      alpha: randRange(0.45, 0.7),
      temp: randRange(0.55, 1.25), // 乱歩の温度（粒子ごとの確率性）
    };
  };

  const initParticles = () => {
    state.particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      state.particles.push(createParticle());
    }
  };

  const updateScaledPeaks = () => {
    const minDim = Math.min(state.simWidth, state.simHeight) || 1;
    state.scaledPeaks = peaks.map(p => {
      const spreadPx = Math.max(60, (p.spread || 0.18) * minDim);
      return {
        x: p.x * state.simWidth,
        y: p.y * state.simHeight,
        strength: p.strength,
        invSpread: 1 / (spreadPx * spreadPx),
      };
    });
  };

  // ブラウザ座標 → シミュレーション座標変換
  const toSimCoords = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(1, (window.devicePixelRatio || 1) * config.dprScale);
    const canvasX = (clientX - rect.left) * scale;
    const canvasY = (clientY - rect.top) * scale;
    const offsetX = (state.width - state.simWidth * config.viewScale) * 0.5;
    const offsetY = (state.height - state.simHeight * config.viewScale) * 0.5;
    return {
      x: (canvasX - offsetX) / config.viewScale,
      y: (canvasY - offsetY) / config.viewScale,
    };
  };

  // イベントリスナー: マウス追従（PC）
  // canvas は pointer-events: none のため document で捕捉
  document.addEventListener("mousemove", (e) => {
    const sim = toSimCoords(e.clientX, e.clientY);
    state.target.x = sim.x;
    state.target.y = sim.y;
    state.target.strength = 1;
  });

  document.addEventListener("mouseleave", () => {
    // 減衰に任せる（即座に切らない）
  });

  // イベントリスナー: タップ追従（スマホ）
  document.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const sim = toSimCoords(touch.clientX, touch.clientY);
    state.target.x = sim.x;
    state.target.y = sim.y;
    state.target.strength = 1;
  }, { passive: true });

  const updateParticle = (p, step) => {
    const { pot, pullX, pullY } = calcPotentialAndPull(p.x, p.y);

    // 粒子ごとの温度をゆっくり揺らす（確率性の表現）
    p.temp += (Math.random() - 0.5) * 0.01;
    if (p.temp < 0.45) p.temp = 0.45;
    if (p.temp > 1.35) p.temp = 1.35;

    // ランダムウォーク
    const rw = config.noiseStrength * p.temp;
    const nx = randnApprox() * rw;
    const ny = randnApprox() * rw;

    // マクロな全体フロー（複数粒子の流れを表現）
    const t = state.time;
    const fs = config.flowScale;
    const flowAngle = Math.sin(p.x * fs + t * 0.4) * Math.PI + Math.cos(p.y * fs - t * 0.35) * Math.PI * 0.5;
    const fx = Math.cos(flowAngle) * config.flowStrength;
    const fy = Math.sin(flowAngle) * config.flowStrength;

    // ターゲットへのごく微弱な引力（気づくか気づかないか程度）
    let targetPullX = 0;
    let targetPullY = 0;
    const ts = state.target.strength;
    if (ts > 0) {
      const tdx = state.target.x - p.x;
      const tdy = state.target.y - p.y;
      const td2 = tdx * tdx + tdy * tdy;
      const tForce = ts * 0.07 / (1 + td2 * 0.0003);
      targetPullX = tdx * tForce;
      targetPullY = tdy * tForce;
    }

    // 速度更新（概念表現）
    p.vx = p.vx * config.damping + (pullX * config.pullStrength + targetPullX + fx + nx) * step;
    p.vy = p.vy * config.damping + (pullY * config.pullStrength + targetPullY + fy + ny) * step;

    const speed2 = p.vx * p.vx + p.vy * p.vy;
    const maxSpeed = config.maxSpeed;
    if (speed2 > maxSpeed * maxSpeed) {
      const s = maxSpeed / Math.sqrt(speed2);
      p.vx *= s;
      p.vy *= s;
    }

    p.prevX = p.x;
    p.prevY = p.y;
    p.x += p.vx;
    p.y += p.vy;

    // 境界処理（ソフトラップ）
    const margin = 30;
    if (p.x < -margin) p.x = state.simWidth + margin * 0.5;
    if (p.x > state.simWidth + margin) p.x = -margin * 0.5;
    if (p.y < -margin) p.y = state.simHeight + margin * 0.5;
    if (p.y > state.simHeight + margin) p.y = -margin * 0.5;

    // 低重み粒子を確率的に再配置（概念表現）
    if (Math.random() < config.resampleProb && pot < 0.18) {
      const pick = Math.floor(Math.random() * state.scaledPeaks.length);
      const pk = state.scaledPeaks[pick];
      p.x = pk.x + randnApprox() * 20;
      p.y = pk.y + randnApprox() * 20;
      p.vx *= 0.3;
      p.vy *= 0.3;
    }
  };

  const render = () => {
    if (!state.running) return;
    const now = performance.now();
    const minDt = 1000 / config.maxFps;
    if (now - state.lastTime < minDt) {
      state.rafId = requestAnimationFrame(render);
      return;
    }
    const dt = Math.min(0.05, (now - state.lastTime) / 1000);
    state.lastTime = now;

    // 半透明で塗りつぶし（トレイル効果）
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(255, 255, 255, ${config.fadeAlpha})`;
    ctx.fillRect(0, 0, state.width, state.height);

    state.time += dt;

    // ターゲット強度の減衰（操作停止後、モンテカルロに自然復帰）
    if (state.target.strength > 0) {
      state.target.strength *= 0.97;
      if (state.target.strength < 0.01) state.target.strength = 0;
    }

    // パーティクル更新・描画（拡大表示）
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.save();
    const offsetX = (state.width - state.simWidth * config.viewScale) * 0.5;
    const offsetY = (state.height - state.simHeight * config.viewScale) * 0.5;
    ctx.translate(offsetX, offsetY);
    ctx.scale(config.viewScale, config.viewScale);
    for (const p of state.particles) {
      const step = dt * config.speedScale; // 速度調整
      updateParticle(p, step);

      // 重みに応じて見た目を変化
      const weight = calcPotential(p.x, p.y);
      const dynamicRadius = p.radius * (0.7 + weight * 0.6);
      const dynamicAlpha = p.alpha * (0.7 + weight * 0.7);

      // 流れの線（粒子の軌跡）- 直線的な1ステップを表現
      const tail = config.tailScale;
      const tailX = p.x - p.vx * tail;
      const tailY = p.y - p.vy * tail;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `hsla(${p.hue}, 78%, 48%, ${config.lineAlpha * dynamicAlpha})`;
      ctx.lineWidth = dynamicRadius * config.lineWidthScale;
      ctx.stroke();
    }
    ctx.restore();

    state.rafId = requestAnimationFrame(render);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    // 低解像度で描画
    const scale = Math.min(1, (window.devicePixelRatio || 1) * config.dprScale);
    state.width = Math.round(rect.width * scale);
    state.height = Math.round(rect.height * scale);
    canvas.width = state.width;
    canvas.height = state.height;
    state.simWidth = state.width / config.viewScale;
    state.simHeight = state.height / config.viewScale;

    // パーティクル数を画面サイズに応じて調整
    config.particleCount = Math.min(
      90,
      Math.max(40, Math.floor((rect.width * rect.height) / 22000))
    );
    
    updateScaledPeaks();
    initParticles();
  };

  const start = () => {
    if (state.running || prefersReduced.matches) return;
    state.running = true;
    resize();
    state.lastTime = performance.now();
    render();
  };

  const stop = () => {
    state.running = false;
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  };

  window.addEventListener("resize", () => {
    if (state.running) resize();
  });

  prefersReduced.addEventListener("change", (e) => {
    e.matches ? stop() : start();
  });

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  if (document.readyState === "complete") {
    start();
  } else {
    window.addEventListener("load", start);
  }
})();
