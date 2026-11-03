'use client';

import { useEffect, useRef, useState } from 'react';

/** Transparent WebGL overlay. Runs only during Transformation / Photo Moment.
 *  Does not replace MediaPipe pose, astronaut overlay, or any of the six screens.
 *  The renderer uses preserveDrawingBuffer so the same frame can be composited into the PNG.
 */
export default function TransformationFX({ active, theme = '#a393ff', onCanvas }) {
  const hostRef = useRef(null);
  const [available, setAvailable] = useState(true);
  useEffect(() => {
    if (!active || !hostRef.current) return;
    let disposed = false;
    let animationId = 0;
    let renderer, scene, camera, rings = [], stars, starMaterial, halo;
    let resizeObserver;
    let startTime = performance.now();
    const host = hostRef.current;

    (async () => {
      try {
        const THREE = await import('three');
        if (disposed) return;
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.className = 'transformation-fx-canvas';
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(renderer.domElement);
        onCanvas?.(renderer.domElement);
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-5, 5, 8.89, -8.89, 0.1, 100);
        camera.position.set(0, 0, 20);
        camera.lookAt(0, 0, 0);
        const tint = new THREE.Color(theme);
        const gold = new THREE.Color('#ffe2a1');
        const cyan = new THREE.Color('#81e6ff');
        const magenta = new THREE.Color('#f9a5f4');

        // 3D magic rings tilt and rotate around the player; center stays transparent.
        for (let i = 0; i < 3; i++) {
          const geo = new THREE.TorusGeometry(2.45 + i * 0.26, 0.018 + i * 0.004, 8, 100);
          const mat = new THREE.MeshBasicMaterial({ color: [gold, tint, cyan][i], transparent: true, opacity: 0.78 - i * .13, depthWrite: false, blending: THREE.AdditiveBlending });
          const torus = new THREE.Mesh(geo, mat);
          torus.rotation.x = .20 + i * .28;
          torus.rotation.y = .25 + i * .15;
          scene.add(torus);
          rings.push({mesh:torus,geo,mat});
        }
        // Golden outer halo frames the player instead of covering their face.
        const haloGeo = new THREE.TorusGeometry(3.25, .03, 8, 120);
        const haloMat = new THREE.MeshBasicMaterial({color:gold, transparent:true,opacity:.48,depthWrite:false,blending:THREE.AdditiveBlending});
        halo = new THREE.Mesh(haloGeo,haloMat);
        halo.scale.set(.94,1.27,1);
        scene.add(halo);

        const count = 150;
        const coords = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          const angle = i * 2.399963229728653;
          const radius = 2.7 + (i % 19)/19 * 2.2;
          coords[i*3] = Math.cos(angle)*radius;
          coords[i*3+1] = Math.sin(angle)*radius*1.32;
          coords[i*3+2] = (i%9)*.02;
          phases[i] = (i%23)/23*Math.PI*2;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position',new THREE.BufferAttribute(coords,3));
        starMaterial = new THREE.PointsMaterial({color:magenta,size:.09,sizeAttenuation:true,transparent:true,opacity:.86,depthWrite:false,blending:THREE.AdditiveBlending});
        stars = new THREE.Points(geo,starMaterial);
        scene.add(stars);
        const mobileReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const resize = () => {
          if (!renderer || !host.isConnected) return;
          const w = Math.max(1,host.clientWidth),h = Math.max(1,host.clientHeight);
          renderer.setSize(w,h,false);
          const aspect = w/h;
          const visibleH = 17.78;
          camera.left = -visibleH*aspect/2;
          camera.right = visibleH*aspect/2;
          camera.top = visibleH/2;
          camera.bottom = -visibleH/2;
          camera.updateProjectionMatrix();
        };
        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        let previous = 0;
        const render = (now) => {
          if (disposed) return;
          animationId = requestAnimationFrame(render);
          if (now-previous < (mobileReduce ? 100 : 33)) return;
          previous = now;
          const t = (now-startTime)/1000;
          const entrance = Math.min(1,t/1.2);
          const sweep = t < 2.6 ? Math.sin(Math.PI*Math.min(1,t/2.6)) : .24;
          rings.forEach(({mesh,mat},i) => {
            mesh.rotation.z = (i%2?-1:1)*t*(.27+i*.10);
            mesh.rotation.x = .25+i*.25+Math.sin(t*.7+i)*.10;
            const s = .85+entrance*.12+Math.sin(t*1.8+i)*.035;
            mesh.scale.set(s,s*1.2,s);
            mat.opacity = (.23+entrance*.30+sweep*.30)*(1-i*.13);
          });
          halo.rotation.z = -t*.16;
          halo.material.opacity = .22 + sweep*.27;
          stars.rotation.z = t*.035;
          starMaterial.opacity = .45 + sweep*.40;
          renderer.render(scene,camera);
        };
        animationId = requestAnimationFrame(render);
      } catch (err) {
        console.warn('Three.js visual effect unavailable; AR continues normally:',err);
        if (!disposed) setAvailable(false);
      }
    })();
    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      resizeObserver?.disconnect();
      onCanvas?.(null);
      rings.forEach(({geo,mat}) => {geo.dispose();mat.dispose();});
      if (stars) {stars.geometry.dispose();starMaterial.dispose();}
      if (halo) {halo.geometry.dispose();halo.material.dispose();}
      renderer?.dispose();
      if (renderer?.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [active, theme, onCanvas]);
  if (!active || !available) return null;
  return <div ref={hostRef} className="transformation-fx" aria-hidden="true"/>;
}
