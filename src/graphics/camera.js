// camera.js - Director camera with smooth spline paths, banking, low tracking, arcade glide, and aerial pullback

import * as THREE from 'three';

export class DirectorCamera {
  constructor(camera) {
    this.camera = camera;
    this.isFreeCam = false;

    // Define cinematic keyframes [time, eyeX, eyeY, eyeZ, targetX, targetY, targetZ, fov, roll]
    this.keyframes = [
      // 0.0s: Overhead high view looking down at Paris center
      { t: 0.0,  pos: [0, 85, -20],    target: [0, 0, 10],       fov: 48, roll: 0 },
      // 1.1s: Beginning dive behind dot
      { t: 1.1,  pos: [0, 45, 10],     target: [0, 0, 30],       fov: 46, roll: 0 },
      // 2.2s: Low street-level dive behind dot along Rue de Rivoli
      { t: 2.2,  pos: [0, 3.2, 18],    target: [0, 1.2, 45],     fov: 52, roll: -0.02 },
      // 3.1s: Low tracking entering bike lane
      { t: 3.1,  pos: [4.2, 2.8, 52],  target: [5.5, 1.2, 75],   fov: 54, roll: 0.03 },
      // 4.5s: Pan & track past Vélib Palais-Royal
      { t: 4.5,  pos: [11, 3.0, 72],   target: [15, 1.2, 92],    fov: 52, roll: 0.05 },
      // 5.4s: Turn toward Rue Vivienne / Rain begins
      { t: 5.4,  pos: [18, 4.2, 110],  target: [23, 1.4, 135],   fov: 50, roll: -0.04 },
      // 7.2s: Aerial rise through rain streaks
      { t: 7.2,  pos: [22, 16.0, 145], target: [26, 1.5, 175],   fov: 48, roll: 0.02 },
      // 8.8s: Dive smoothly down into Galerie Vivienne entry portal
      { t: 8.8,  pos: [30, 2.6, 175],  target: [30, 2.2, 205],   fov: 56, roll: 0 },
      // 9.8s: Hero interior glide through arcade center (strong perspective)
      { t: 9.8,  pos: [30, 2.4, 205],  target: [30, 2.2, 235],   fov: 58, roll: 0 },
      // 10.7s: Emerge from arcade into daylight
      { t: 10.7, pos: [29, 3.0, 238],  target: [24, 1.5, 255],   fov: 54, roll: -0.04 },
      // 12.0s: Reveal Rue de Beaujolais café & friends
      { t: 12.0, pos: [20, 2.8, 250],  target: [12, 1.4, 258],   fov: 50, roll: 0.02 },
      // 13.3s: Accelerate along Rivoli & begin golden hour rise
      { t: 13.3, pos: [2, 10.0, 270],   target: [-15, 6.0, 310],  fov: 52, roll: -0.03 },
      // 14.8s: Soar above Tuileries green park opening Parisian sunset skyline & Eiffel Tower
      { t: 14.8, pos: [-5, 38.0, 280],  target: [-100, 28.0, 420], fov: 48, roll: 0.04 },
      // 16.5s: Approach Rooftop Rivoli terrace
      { t: 16.5, pos: [-20, 35.0, 320], target: [-35, 27.5, 340], fov: 50, roll: -0.02 },
      // 17.6s: Orbit the endpoint terrace comfortably
      { t: 17.6, pos: [-46, 33.0, 346], target: [-35, 27.5, 340], fov: 48, roll: 0.04 },
      // 18.8s: Pull back to tilted luminous city tile under brand mark
      { t: 18.8, pos: [-10, 140, 210], target: [-10, 10, 240],   fov: 42, roll: -0.08 },
      // 20.3s: City tile recedes into deep navy
      { t: 20.3, pos: [-10, 220, 210], target: [-10, 10, 240],   fov: 38, roll: -0.05 },
      // 22.0s: End Card hold
      { t: 22.0, pos: [-10, 250, 210], target: [-10, 10, 240],   fov: 36, roll: 0 }
    ];

    this.currentLookAt = new THREE.Vector3();
  }

  update(time) {
    if (this.isFreeCam) return;

    // Find bounding keyframes
    let k0 = this.keyframes[0];
    let k1 = this.keyframes[this.keyframes.length - 1];

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (time >= this.keyframes[i].t && time <= this.keyframes[i + 1].t) {
        k0 = this.keyframes[i];
        k1 = this.keyframes[i + 1];
        break;
      }
    }

    const span = k1.t - k0.t;
    const rawAlpha = span > 0 ? (time - k0.t) / span : 0;
    // Smooth cubic ease in/out
    const alpha = rawAlpha * rawAlpha * (3 - 2 * rawAlpha);

    // Interpolate Eye Position
    const eyeX = THREE.MathUtils.lerp(k0.pos[0], k1.pos[0], alpha);
    const eyeY = THREE.MathUtils.lerp(k0.pos[1], k1.pos[1], alpha);
    const eyeZ = THREE.MathUtils.lerp(k0.pos[2], k1.pos[2], alpha);
    this.camera.position.set(eyeX, eyeY, eyeZ);

    // Interpolate Target / LookAt
    const targetX = THREE.MathUtils.lerp(k0.target[0], k1.target[0], alpha);
    const targetY = THREE.MathUtils.lerp(k0.target[1], k1.target[1], alpha);
    const targetZ = THREE.MathUtils.lerp(k0.target[2], k1.target[2], alpha);
    this.currentLookAt.set(targetX, targetY, targetZ);
    this.camera.lookAt(this.currentLookAt);

    // Interpolate Roll / Banking
    const roll = THREE.MathUtils.lerp(k0.roll, k1.roll, alpha);
    if (roll !== 0) {
      this.camera.rotation.z += roll;
    }

    // Interpolate FOV
    const fov = THREE.MathUtils.lerp(k0.fov, k1.fov, alpha);
    if (this.camera.fov !== fov) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }
}
