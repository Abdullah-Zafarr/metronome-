/**
 * Living Water Cinemagraph Engine for Pulse Metronome
 * Uses WebGL fragment shader to animate realistic lake ripples,
 * sunset reflection shimmer, and subtle rhythmic beat resonance.
 */
class WaterCinemagraph {
  constructor(canvasId = 'water-canvas', imageSrc = 'pulse-bg.jpg') {
    this.canvas = document.getElementById(canvasId);
    this.imageSrc = imageSrc;
    this.gl = null;
    this.program = null;
    this.texture = null;
    this.animationFrameId = null;
    this.startTime = performance.now();
    this.image = null;
    this.isReady = false;

    // Uniform locations
    this.uniforms = {};

    // Interactive beat pulse impulse
    this.beatImpulse = 0.0;
    this.beatImpulseTarget = 0.0;

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false
    }) || this.canvas.getContext('experimental-webgl');

    if (!this.gl) {
      console.warn('[WaterCinemagraph] WebGL not supported, relying on CSS animated fallback.');
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        // Map [-1, 1] to UV [0, 1] with (0,0) at top-left
        v_uv = vec2((a_position.x + 1.0) * 0.5, (1.0 - a_position.y) * 0.5);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      uniform vec2 u_imageResolution;
      uniform float u_time;
      uniform float u_beatImpulse;
      varying vec2 v_uv;

      void main() {
        // Precise "background-size: cover; background-position: center bottom" math
        float canvasAspect = u_resolution.x / u_resolution.y;
        float imgAspect = u_imageResolution.x / u_imageResolution.y;

        vec2 uv;
        if (canvasAspect > imgAspect) {
          // Canvas is wider: scale to fit width, align bottom
          float scale = canvasAspect / imgAspect;
          uv = vec2(v_uv.x, 1.0 - (1.0 - v_uv.y) / scale);
        } else {
          // Canvas is taller/narrower: scale to fit height, align center horizontally
          float scale = imgAspect / canvasAspect;
          uv = vec2((v_uv.x - 0.5) / scale + 0.5, v_uv.y);
        }

        // Shoreline horizon is at roughly y = 0.468 in pulse-bg.jpg
        float horizon = 0.468;
        // Mountain base stays crisp & locked with smoothstep transition
        float waterWeight = smoothstep(horizon - 0.002, horizon + 0.018, uv.y);
        float depth = clamp((uv.y - horizon) / (1.0 - horizon), 0.0, 1.0);

        // 3D perspective wave compression (denser ripples near horizon, broader in foreground)
        float perspectiveY = 26.0 / (uv.y - horizon + 0.11);
        float wavePhase = perspectiveY - u_time * 2.1;

        // Multi-frequency harmonic water waves
        float cross = sin(uv.x * 24.0 + u_time * 0.75) * 0.35;
        float w1 = sin(wavePhase + cross);
        float w2 = cos(wavePhase * 1.55 - u_time * 1.4 + uv.x * 32.0) * 0.4;
        float w3 = sin(uv.y * 30.0 - u_time * 0.9) * 0.2;
        float totalWave = w1 + w2 + w3;

        // Gentle rhythmic beat resonance on the water surface
        float beatRipple = sin(wavePhase * 2.5) * u_beatImpulse * 0.0035;

        // Realistic liquid displacement
        float dispY = (totalWave * 0.0075 + beatRipple) * pow(depth, 0.68) * waterWeight;
        float dispX = sin(wavePhase * 0.7 + uv.x * 16.0) * 0.0028 * pow(depth, 0.68) * waterWeight;

        vec2 distortedUv = clamp(uv + vec2(dispX, dispY), vec2(0.001), vec2(0.999));
        vec4 texColor = texture2D(u_image, distortedUv);

        // Sun reflection shimmering trail (centered at sunX = 0.676)
        float sunX = 0.676;
        float distToSun = abs(uv.x - sunX);
        float bandWidth = 0.048 + depth * 0.075;
        float sunFactor = smoothstep(bandWidth, 0.0, distToSun);

        // Shimmering liquid gold/crimson crest highlights
        float crest = max(0.0, totalWave);
        crest = pow(crest, 3.6);
        vec3 sunHighlight = vec3(1.0, 0.44, 0.14) * crest * sunFactor * (0.38 * depth + 0.09) * waterWeight;
        texColor.rgb += sunHighlight;

        // Subtle specular micro-glitter sparkling across the lake
        float glitter = pow(max(0.0, sin(uv.x * 135.0 + u_time * 3.4) * sin(wavePhase * 2.0)), 12.0);
        texColor.rgb += vec3(1.0, 0.62, 0.28) * glitter * sunFactor * 0.22 * waterWeight;

        // Metronome beat glow accent in water reflection
        if (u_beatImpulse > 0.05) {
          texColor.rgb += vec3(0.9, 0.35, 0.1) * u_beatImpulse * sunFactor * 0.15 * depth * waterWeight;
        }

        // Soft vignette at top for maximum contrast with navigation breadcrumbs
        float topGradient = smoothstep(0.0, 0.22, v_uv.y);
        texColor.rgb *= mix(0.74, 1.0, topGradient);

        gl_FragColor = texColor;
      }
    `;

    try {
      this.program = this.createProgram(vsSource, fsSource);
    } catch (e) {
      console.error('[WaterCinemagraph] Shader error:', e);
      return;
    }

    this.setupGeometry();
    this.setupUniforms();
    this.loadImage();
    this.setupResizeHandler();
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(info);
    }
    return shader;
  }

  createProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(prog);
      throw new Error(info);
    }
    return prog;
  }

  setupGeometry() {
    const gl = this.gl;
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  }

  setupUniforms() {
    const gl = this.gl;
    this.uniforms = {
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      imageResolution: gl.getUniformLocation(this.program, 'u_imageResolution'),
      time: gl.getUniformLocation(this.program, 'u_time'),
      beatImpulse: gl.getUniformLocation(this.program, 'u_beatImpulse'),
      image: gl.getUniformLocation(this.program, 'u_image')
    };
  }

  loadImage() {
    const gl = this.gl;
    this.image = new Image();
    this.image.src = this.imageSrc;
    this.image.onload = () => {
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

      this.resize();
      this.isReady = true;

      // Smoothly reveal living water canvas over the fallback image
      this.canvas.classList.add('active');

      this.render();
    };
  }

  resize() {
    if (!this.canvas || !this.gl) return;
    const parent = this.canvas.parentElement || this.canvas;
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    if (window.ResizeObserver && this.canvas.parentElement) {
      const ro = new ResizeObserver(() => this.resize());
      ro.observe(this.canvas.parentElement);
    }
  }

  pulseBeat(isAccent = false) {
    this.beatImpulseTarget = isAccent ? 1.0 : 0.45;
  }

  render() {
    if (!this.isReady) return;

    const gl = this.gl;
    const elapsed = (performance.now() - this.startTime) / 1000.0;

    // Smoothly decay beat impulse
    this.beatImpulse += (this.beatImpulseTarget - this.beatImpulse) * 0.4;
    this.beatImpulseTarget *= 0.88;

    gl.useProgram(this.program);

    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.imageResolution, this.image.naturalWidth, this.image.naturalHeight);
    gl.uniform1f(this.uniforms.time, elapsed);
    gl.uniform1f(this.uniforms.beatImpulse, this.beatImpulse);
    gl.uniform1i(this.uniforms.image, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.animationFrameId = requestAnimationFrame(() => this.render());
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Attach to window for global access
window.WaterCinemagraph = WaterCinemagraph;
