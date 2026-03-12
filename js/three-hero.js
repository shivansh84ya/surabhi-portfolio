/* three-hero.js — Subtle floating blobs with mouse parallax */
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;
  
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let isVisible = true;
  
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);
  
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
    // Warm earthy colors matching brand palette
    const colors = [
      new THREE.Color(0xC4A882), // taupe
      new THREE.Color(0x8B3A1A), // accent
      new THREE.Color(0xE8D9C4), // sand
      new THREE.Color(0xA07850), // brown-light
      new THREE.Color(0xDDD0BC), // taupe-light
    ];
  
    // Create floating mesh blobs
    const blobs = [];
    const blobData = [
      { x: -2.5, y: 1.2, z: -2, scale: 2.2, speed: 0.0008, color: colors[0] },
      { x: 2.8, y: -1.0, z: -1, scale: 1.8, speed: 0.0006, color: colors[1] },
      { x: 0.5, y: 2.0, z: -3, scale: 2.8, speed: 0.0005, color: colors[2] },
      { x: -1.5, y: -2.2, z: -2, scale: 1.4, speed: 0.001, color: colors[3] },
      { x: 3.5, y: 1.8, z: -4, scale: 2.0, speed: 0.0007, color: colors[4] },
    ];
  
    blobData.forEach((data, i) => {
      const geo = new THREE.IcosahedronGeometry(data.scale, 2);
      const mat = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.18,
        shininess: 40,
        specular: new THREE.Color(0xFFFFFF),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(data.x, data.y, data.z);
      mesh.userData = { ...data, phase: i * Math.PI * 0.4 };
      scene.add(mesh);
      blobs.push(mesh);
    });
  
    // Soft ambient + directional lighting
    const ambient = new THREE.AmbientLight(0xF5EFE6, 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xC4A882, 0.6);
    dirLight.position.set(3, 5, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x8B3A1A, 0.4, 12);
    pointLight.position.set(-3, -2, 2);
    scene.add(pointLight);
  
    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });
  
    // Touch tracking
    document.addEventListener('touchmove', (e) => {
      if (e.touches[0]) {
        mouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    }, { passive: true });
  
    // Visibility API — pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });
  
    // Resize
    window.addEventListener('resize', () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  
    // Animation loop
    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;
  
      const t = clock.getElapsedTime();
  
      // Smooth camera parallax
      targetX += (mouseX * 0.3 - targetX) * 0.05;
      targetY += (mouseY * 0.2 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);Research & Ideation

  
      // Float blobs
      blobs.forEach((blob) => {
        const d = blob.userData;
        blob.position.y = d.y + Math.sin(t * d.speed * 1000 + d.phase) * 0.4;
        blob.position.x = d.x + Math.cos(t * d.speed * 800 + d.phase) * 0.3;
        blob.rotation.x = t * 0.2 + d.phase;
        blob.rotation.y = t * 0.15 + d.phase;
      });
  
      renderer.render(scene, camera);
    }
    animate();
  })();