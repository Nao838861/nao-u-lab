// 地表画像は数kmの色と区画を、写真素材は手の届く距離の藁・土・落葉を受け持つ。
export function applyGroundDetail(material, coverage, grain, sizeX, sizeZ) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.terrainCover = { value: coverage };
    shader.uniforms.terrainGrain = { value: grain };
    shader.vertexShader = 'varying float terrainDepth;\n' + shader.vertexShader.replace(
      '#include <project_vertex>', '#include <project_vertex>\nterrainDepth = -mvPosition.z;');
    shader.fragmentShader = `
      uniform sampler2D terrainCover;
      uniform sampler2D terrainGrain;
      varying float terrainDepth;
      float terrainHash(vec2 p) {
        vec3 h = fract(vec3(p.xyx) * 0.1031);
        h += dot(h, h.yzx + 33.33);
        return fract((h.x + h.y) * h.z);
      }
    ` + shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      if (terrainDepth < 650.0) {
        vec3 cover = texture2D(terrainCover, vMapUv).rgb;
        vec2 p = vec2(vMapUv.x * ${sizeX.toFixed(2)}, (1.0 - vMapUv.y) * ${sizeZ.toFixed(2)});
        float a = cover.g * 2.2 - 1.0;
        vec2 plot = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
        // 別縮尺・別方向の連続サンプルを混ぜ、材質タイルの境目と反復を隠す。
        vec2 bend = vec2(sin(p.y * .19 + sin(p.x * .09)), cos(p.x * .23 + p.y * .07));
        vec3 fine = texture2D(terrainGrain, (plot + bend * .28) / 2.8).rgb;
        vec3 broad = texture2D(terrainGrain, mat2(.8,.6,-.6,.8) * (p + bend) / 6.3).rgb;
        vec3 relief = (fine - .50) * 1.28 + (broad - .50) * .64;
        float field = smoothstep(.16, .95, cover.r);
        float water = 1.0 - smoothstep(.04,.14,cover.r);
        float dirt = 1.0 - smoothstep(-.65,.65,cover.b * 14.0 - 4.0 + (fine.g - .5) * .95);
        float forest = smoothstep(.93,1.18,diffuseColor.g / max(.01,diffuseColor.r))
                     * (1.0 - smoothstep(.10,.19,diffuseColor.r));
        float surface = mix(relief.g, relief.b, forest);
        surface = mix(surface, relief.r, field);
        // 不揃いな刈株を近景でのみ見せる。遠くの画素に細い茎を残さない。
        vec2 bed = plot + bend * .11;
        vec2 cell = floor(bed / vec2(.37,.48));
        vec2 stalk = fract(bed / vec2(.37,.48)) - .5;
        stalk -= (vec2(terrainHash(cell),terrainHash(cell + 67.0)) - .5) * .65;
        float stub = (1.0 - smoothstep(.035,.19,length(stalk))) * smoothstep(.18,.62,terrainHash(cell + 23.0));
        stub *= 1.0 - smoothstep(.04,.18,max(fwidth(bed.x), fwidth(bed.y)));
        vec3 ground = diffuseColor.rgb * max(.25, 1.0 + surface);
        ground += vec3(.112,.066,.018) * stub * field;
        vec3 track = vec3(.27,.185,.108) * max(.32, 1.0 + relief.g * .93);
        ground = mix(ground, track, dirt);
        float nearWeight = (1.0 - smoothstep(240.0,650.0,terrainDepth)) * (1.0-water);
        diffuseColor.rgb = mix(diffuseColor.rgb, ground, nearWeight);
      }
    `);
  };
}

// 近接時のみ、カメラの周囲に刈株を立てる。セルに固定した種で再訪時も配置が一致する。
export function nearbyStubble(THREE, scene, image, sizeX, sizeZ, heightAt) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(image.width / 2);
  canvas.height = Math.ceil(image.height / 2);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const pos = [], colors = [];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, x = .055 * Math.cos(a), z = .055 * Math.sin(a), h = .11 + (i % 4) * .035;
    const dx = .012 * Math.cos(a + 1.2), dz = .012 * Math.sin(a + 1.2);
    pos.push(x-dx,0,z-dz, x+dx,0,z+dz, x*1.8,h,z*1.8);
    colors.push(.06,.033,.009, .12,.075,.024, .24,.16,.055);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      float distanceToTuft = length((modelViewMatrix * instanceMatrix[3]).xyz);
      transformed *= 1.0 - smoothstep(22.0, 42.0, distanceToTuft);
    `);
  };
  const steps = 22, cellSize = 2.4, perCell = 5;
  const mesh = new THREE.InstancedMesh(geometry, material, (steps * 2 + 1) ** 2 * perCell);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false; mesh.count = 0;
  scene.add(mesh);
  let lastX, lastZ;
  const dummy = new THREE.Object3D();
  return function update(x, y, z) {
    mesh.visible = y - heightAt(x,z) < 48;
    if (!mesh.visible) return;
    const cx = Math.floor(x / cellSize), cz = Math.floor(z / cellSize);
    if (lastX !== undefined && Math.abs(lastX-cx) < 4 && Math.abs(lastZ-cz) < 4) return;
    lastX = cx; lastZ = cz;
    let count = 0;
    for (let j = cz-steps; j <= cz+steps; j++) for (let i = cx-steps; i <= cx+steps; i++) {
      let seed = Math.imul(i + 8192, 73856093) ^ Math.imul(j + 8192, 19349663);
      const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 4294967296;
      for (let k=0; k<perCell; k++) {
        const px = (i + random()) * cellSize, pz = (j + random()) * cellSize;
        const u = Math.floor((px / sizeX + .5) * canvas.width), v = Math.floor((pz / sizeZ + .5) * canvas.height);
        if (u<0 || v<0 || u>=canvas.width || v>=canvas.height) continue;
        const n = (v * canvas.width + u) * 4;
        if (pixels[n] < 165 || pixels[n+2] < 135) continue;
        dummy.position.set(px,heightAt(px,pz),pz);
        dummy.rotation.y = random() * Math.PI * 2;
        dummy.scale.setScalar(.65 + random() * .85);
        dummy.updateMatrix();
        mesh.setMatrixAt(count++,dummy.matrix);
      }
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
  };
}
