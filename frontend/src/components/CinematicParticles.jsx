import { useEffect, useRef } from 'react';

/**
 * CinematicParticles - An ultra-premium, GPU-accelerated interactive WebGL particle system.
 * Creates an elegant, cinematic floating particle field inspired by top SaaS and Apple designs.
 * Reacts magnetically and fluidly to cursor movement with custom velocity-based inertia.
 */
function CinematicParticles() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL context
    const gl = canvas.getContext('webgl', { alpha: true, depth: false, antialias: true });
    if (!gl) {
      console.warn('WebGL not supported, falling back to 2D Canvas');
      initCanvas2D(canvas);
      return;
    }

    // Set pixel ratio for high DPI screens
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Vertex Shader Source
    const vsSource = `
      attribute vec3 aPosition;
      attribute float aSize;
      attribute float aSpeed;
      attribute float aPhase;

      uniform float uTime;
      uniform vec2 uCursor;
      uniform vec2 uResolution;
      uniform float uTheme; // 0 = dark mode, 1 = light mode
      uniform float uPixelRatio;

      varying float vDepth;
      varying vec4 vColor;

      void main() {
        vec3 pos = aPosition;

        // Elegant floating motion over time
        pos.x += cos(uTime * 0.05 * aSpeed + aPhase) * 0.06;
        pos.y += sin(uTime * 0.07 * aSpeed + aPhase) * 0.06;

        // Calculate cursor distance in Normalized Device Coordinates (NDC)
        vec2 cursorNDC = (uCursor / uResolution) * 2.0 - 1.0;
        cursorNDC.y = -cursorNDC.y; // Flip Y for WebGL coordinates

        float dist = distance(pos.xy, cursorNDC);

        // Soft magnetic repulsion when cursor is near
        if (dist < 0.5) {
          float force = (1.0 - dist / 0.5) * 0.05;
          pos.xy += normalize(pos.xy - cursorNDC) * force;
        }

        gl_Position = vec4(pos, 1.0);
        vDepth = pos.z;

        // Sub-pixel sizing based on depth parallax
        gl_PointSize = aSize * (1.2 + pos.z) * uPixelRatio;

        // Soft, harmonious color palettes
        if (uTheme == 0.0) {
          // Dark Mode: Glowing ice-blue/purple particles
          vColor = vec4(0.38, 0.58, 1.0, 0.15 + (pos.z + 1.0) * 0.25);
        } else {
          // Light Mode: Slate/dark blue particles
          vColor = vec4(0.08, 0.12, 0.22, 0.08 + (pos.z + 1.0) * 0.18);
        }
      }
    `;

    // Fragment Shader Source (Renders soft cinematic glow/bloom circles)
    const fsSource = `
      precision mediump float;
      varying vec4 vColor;

      void main() {
        // Compute distance from center of the point
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);

        // Easing for smooth Gaussian-like radial drop-off (bloom effect)
        if (dist > 0.5) {
          discard;
        }
        
        float alpha = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);
      }
    `;

    // Helper: Compile Shaders
    const compileShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    // Create & link program
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Generate Particle Buffers
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random coordinates between -1.0 and 1.0 (screen space)
      positions[i * 3] = Math.random() * 2 - 1;
      positions[i * 3 + 1] = Math.random() * 2 - 1;
      positions[i * 3 + 2] = Math.random() * 2 - 2; // Z-axis for depth (parallax)

      // Mix particle sizes: mostly tiny particles with a few larger glowing dust motes
      sizes[i] = Math.random() < 0.95 ? Math.random() * 1.5 + 1.0 : Math.random() * 3.5 + 2.5;

      speeds[i] = Math.random() * 0.8 + 0.2;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const createBuffer = (data, attributeName, size) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, attributeName);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buffer;
    };

    createBuffer(positions, 'aPosition', 3);
    createBuffer(sizes, 'aSize', 1);
    createBuffer(speeds, 'aSpeed', 1);
    createBuffer(phases, 'aPhase', 1);

    // Uniform locations
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uCursorLoc = gl.getUniformLocation(program, 'uCursor');
    const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
    const uThemeLoc = gl.getUniformLocation(program, 'uTheme');
    const uPixelRatioLoc = gl.getUniformLocation(program, 'uPixelRatio');

    // Track Cursor interactions
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop variables
    let animationFrameId;
    let startTime = performance.now();
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;

    // Render loop
    const render = (time) => {
      const elapsed = (time - startTime) * 0.001;

      // Detect light mode / dark mode from DOM class
      const isLightMode = document.body.classList.contains('light-mode');
      const themeVal = isLightMode ? 1.0 : 0.0;

      // Soft LERPing for fluid cursor attraction/repulsion physics
      if (mouseRef.current.active) {
        currentX += (mouseRef.current.targetX - currentX) * 0.04;
        currentY += (mouseRef.current.targetY - currentY) * 0.04;
      } else {
        // Drift back to center slowly when cursor exits screen
        const targetX = window.innerWidth / 2 + Math.cos(elapsed * 0.5) * 80;
        const targetY = window.innerHeight / 2 + Math.sin(elapsed * 0.5) * 80;
        currentX += (targetX - currentX) * 0.01;
        currentY += (targetY - currentY) * 0.01;
      }

      // Configure blending for ultra-smooth glassmorphic transparency overlay
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Set uniforms
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uCursorLoc, currentX, currentY);
      gl.uniform2f(uResolutionLoc, window.innerWidth, window.innerHeight);
      gl.uniform1f(uThemeLoc, themeVal);
      gl.uniform1f(uPixelRatioLoc, window.devicePixelRatio || 1.0);

      // Draw particle system
      gl.drawArrays(gl.POINTS, 0, particleCount);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Cleanup resources
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.85,
        transition: 'opacity 1s ease',
      }}
    />
  );
}

/**
 * Fallback: Canvas 2D engine in case WebGL is disabled or unsupported.
 */
function initCanvas2D(canvas) {
  const ctx = canvas.getContext('2d');
  let animationId;
  const particles = [];
  const particleCount = 200; // Smaller count for 2D fallback to maintain high performance

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.4 + 0.1,
    });
  }

  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isLightMode = document.body.classList.contains('light-mode');
    
    ctx.fillStyle = isLightMode ? 'rgba(8, 12, 22, ' : 'rgba(98, 148, 255, ';

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around screen boundaries
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = isLightMode 
        ? `rgba(8, 12, 22, ${p.alpha * 0.4})` 
        : `rgba(98, 148, 255, ${p.alpha * 0.45})`;
      ctx.fill();
    });

    animationId = requestAnimationFrame(loop);
  };

  loop();

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  };
}

export default CinematicParticles;
