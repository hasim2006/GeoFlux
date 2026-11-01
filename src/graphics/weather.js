// weather.js - Dynamic lighting, rain particles, wet road reflections, atmospheric transitions

import * as THREE from 'three';

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;

    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xE0E8F0, 1.2);
    this.scene.add(this.ambientLight);

    // Main Sun Directional Light
    this.sunLight = new THREE.DirectionalLight(0xFFF4E6, 1.8);
    this.sunLight.position.set(60, 100, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    const d = 150;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    // Fill Light
    this.fillLight = new THREE.DirectionalLight(0xA0B8D0, 0.6);
    this.fillLight.position.set(-60, 40, -40);
    this.scene.add(this.fillLight);

    // Fog for Parisian atmospheric perspective
    this.fogColor = new THREE.Color(0xEAECEF);
    this.scene.fog = new THREE.FogExp2(this.fogColor, 0.0035);

    // Background Color
    this.scene.background = this.fogColor.clone();

    // Rain Particle System
    this.rainCount = 1200;
    this.rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(this.rainCount * 6); // 2 vertices per streak line

    for (let i = 0; i < this.rainCount; i++) {
      const x = (Math.random() - 0.5) * 80 + 25;
      const y = Math.random() * 40 + 2;
      const z = (Math.random() - 0.5) * 100 + 150;
      const len = 0.8 + Math.random() * 0.6;

      rainPositions[i * 6] = x;
      rainPositions[i * 6 + 1] = y;
      rainPositions[i * 6 + 2] = z;

      rainPositions[i * 6 + 3] = x - 0.15; // wind tilt
      rainPositions[i * 6 + 4] = y - len;
      rainPositions[i * 6 + 5] = z + 0.1;
    }

    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    this.rainMat = new THREE.LineBasicMaterial({
      color: 0xBCD2E8,
      transparent: true,
      opacity: 0.0 // starts invisible
    });
    this.rainLines = new THREE.LineSegments(this.rainGeo, this.rainMat);
    this.scene.add(this.rainLines);
  }

  update(time, city) {
    const posAttr = this.rainGeo.attributes.position;

    // 1. Lighting Phase Transitions
    if (time < 5.4) {
      // Phase 1: Soft Parisian Daylight
      this.ambientLight.color.setHex(0xE4EAF0);
      this.ambientLight.intensity = 1.2;
      this.sunLight.color.setHex(0xFFF7EC);
      this.sunLight.intensity = 1.8;
      this.sunLight.position.set(60, 100, 40);
      this.fogColor.setHex(0xECEFF2);
      this.scene.fog.density = 0.003;
      this.rainMat.opacity = 0.0;

      if (city && city.materials.roadAsphalt) {
        city.materials.roadAsphalt.roughness = 0.82;
      }
    } else if (time >= 5.4 && time < 8.8) {
      // Phase 2: Rain Ahead (5.40 - 8.80s)
      const rainProgress = (time - 5.4) / (8.8 - 5.4);
      const coolFactor = Math.min(1.0, rainProgress * 2.0);

      // Cool the light & slate overcast
      this.ambientLight.color.lerpColors(new THREE.Color(0xE4EAF0), new THREE.Color(0x8C9AA6), coolFactor);
      this.ambientLight.intensity = 0.95;
      this.sunLight.color.lerpColors(new THREE.Color(0xFFF7EC), new THREE.Color(0xB0C0D0), coolFactor);
      this.sunLight.intensity = 1.1;
      this.fogColor.lerpColors(new THREE.Color(0xECEFF2), new THREE.Color(0x94A0AB), coolFactor);
      this.scene.fog.density = 0.0055;

      // Make roads wet and reflective
      if (city && city.materials.roadAsphalt) {
        city.materials.roadAsphalt.roughness = 0.28; // wet gloss
        city.materials.roadAsphalt.metalness = 0.35;
      }

      // Animate Rain Streaks
      this.rainMat.opacity = Math.min(0.75, rainProgress * 2.5);
      const arr = posAttr.array;
      for (let i = 0; i < this.rainCount; i++) {
        arr[i * 6 + 1] -= 1.4;
        arr[i * 6 + 4] -= 1.4;

        if (arr[i * 6 + 1] < 0.2) {
          const resetY = 35 + Math.random() * 10;
          arr[i * 6 + 1] = resetY;
          arr[i * 6 + 4] = resetY - (0.8 + Math.random() * 0.6);
        }
      }
      posAttr.needsUpdate = true;
    } else if (time >= 8.8 && time < 10.7) {
      // Phase 3: Galerie Vivienne Covered Passage
      this.rainMat.opacity = 0.0;
      this.ambientLight.color.setHex(0xF0DFCC); // warm arcade interior
      this.ambientLight.intensity = 1.4;
      this.sunLight.intensity = 0.8;
      this.fogColor.setHex(0xDFCBB8);
      this.scene.fog.density = 0.002;
    } else if (time >= 10.7 && time < 13.3) {
      // Phase 4: Exit to Daylight / Meet Friends
      this.rainMat.opacity = 0.0;
      this.ambientLight.color.setHex(0xEAF0F6);
      this.ambientLight.intensity = 1.3;
      this.sunLight.color.setHex(0xFFF5E6);
      this.sunLight.intensity = 1.7;
      this.sunLight.position.set(70, 75, 120);
      this.fogColor.setHex(0xEBF0F5);
      this.scene.fog.density = 0.003;

      if (city && city.materials.roadAsphalt) {
        city.materials.roadAsphalt.roughness = 0.75;
      }
    } else if (time >= 13.3 && time < 18.8) {
      // Phase 5: Golden Hour Sunset (13.30 - 18.80s)
      const goldenProgress = Math.min(1.0, (time - 13.3) / (16.7 - 13.3));

      // Warm peach-orange sunset glow
      const peachSun = new THREE.Color(0xFF8844);
      const peachAmb = new THREE.Color(0xFFB580);
      const peachFog = new THREE.Color(0xFFC098);

      this.sunLight.color.lerp(peachSun, 0.25);
      this.sunLight.intensity = 2.4;
      // Low sunset angle for dramatic long shadows
      this.sunLight.position.set(-140, 35, 380);

      this.ambientLight.color.lerp(peachAmb, 0.2);
      this.ambientLight.intensity = 1.1;

      this.fogColor.lerp(peachFog, 0.2);
      this.scene.fog.density = 0.0025;
    } else {
      // Phase 6: Brand Lock-Up & End Card (18.80 - 22.00s)
      // Deep luxury navy stage
      const navy = new THREE.Color(0x0A1224);
      this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, 0.4, 0.1);
      this.ambientLight.color.lerp(new THREE.Color(0x1B2C4B), 0.1);
      this.ambientLight.intensity = 0.7;
      this.fogColor.lerp(navy, 0.1);
      this.scene.fog.density = 0.004;
    }

    this.scene.background.copy(this.fogColor);
  }
}

