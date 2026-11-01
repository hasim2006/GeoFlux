// arcade.js - Galerie Vivienne hero interior: glass canopy, neoclassical arches, mosaic floor, warm storefronts

import * as THREE from 'three';

export class GalerieVivienne {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Gallery placement: along the route from Z: 180 to 240, X: 30
    this.group.position.set(30, 0, 210);

    this.materials = this.createMaterials();
    this.buildArcadeStructure();
    this.buildMosaicFloor();
    this.buildGlassCanopy();
    this.buildStorefronts();
    this.buildHangingLanterns();
  }

  createMaterials() {
    return {
      arcadeStone: new THREE.MeshStandardMaterial({
        color: 0xE8DFD1, // Warm Parisian limestone
        roughness: 0.8,
        metalness: 0.05
      }),
      archTrim: new THREE.MeshStandardMaterial({
        color: 0xD0C4B0,
        roughness: 0.75
      }),
      mosaicFloor: new THREE.MeshStandardMaterial({
        color: 0xD8C29D, // Ochre & terracotta mosaic pattern
        roughness: 0.35, // Polished terrazzo finish
        metalness: 0.1
      }),
      canopyGlass: new THREE.MeshStandardMaterial({
        color: 0xD8EFFC,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
        metalness: 0.9
      }),
      ironRib: new THREE.MeshStandardMaterial({
        color: 0x2C3338,
        roughness: 0.5,
        metalness: 0.8
      }),
      shopWood: new THREE.MeshStandardMaterial({
        color: 0x4A2E1B, // Rich dark oak shopfronts
        roughness: 0.6
      }),
      shopGlow: new THREE.MeshStandardMaterial({
        color: 0xFFE89E,
        emissive: 0xFF9922,
        emissiveIntensity: 0.75,
        roughness: 0.2
      }),
      brassGold: new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        metalness: 0.85,
        roughness: 0.25
      })
    };
  }

  buildMosaicFloor() {
    // 60m length, 7m width corridor floor
    const floorGeo = new THREE.PlaneGeometry(7.2, 60);
    const floor = new THREE.Mesh(floorGeo, this.materials.mosaicFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.04;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Central geometric mosaic runner strip
    const runnerGeo = new THREE.PlaneGeometry(3.6, 60);
    const runnerMat = new THREE.MeshStandardMaterial({
      color: 0x9B5938, // Terracotta key pattern
      roughness: 0.3
    });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.y = 0.05;
    runner.receiveShadow = true;
    this.group.add(runner);
  }

  buildArcadeStructure() {
    const length = 60;
    const archSpacing = 5.0; // Arch every 5 meters
    const numArches = Math.floor(length / archSpacing);
    const halfLen = length / 2;

    for (let i = 0; i <= numArches; i++) {
      const zPos = -halfLen + i * archSpacing;

      // Left Pillar
      const pillarGeo = new THREE.BoxGeometry(0.7, 5.0, 0.7);
      const pillarL = new THREE.Mesh(pillarGeo, this.materials.arcadeStone);
      pillarL.position.set(-3.6, 2.5, zPos);
      pillarL.castShadow = true;
      this.group.add(pillarL);

      // Right Pillar
      const pillarR = pillarL.clone();
      pillarR.position.x = 3.6;
      this.group.add(pillarR);

      // Classical Arch Ring overhead connecting the pillars
      const archRingGeo = new THREE.TorusGeometry(3.6, 0.3, 8, 24, Math.PI);
      const arch = new THREE.Mesh(archRingGeo, this.materials.archTrim);
      arch.position.set(0, 5.0, zPos);
      // No inverted rotation: curves upwards overhead
      this.group.add(arch);

      // Arch keystone ornament
      const keyGeo = new THREE.BoxGeometry(0.5, 0.6, 0.8);
      const key = new THREE.Mesh(keyGeo, this.materials.brassGold);
      key.position.set(0, 8.6, zPos);
      this.group.add(key);
    }

    // Outer solid envelope walls
    const wallGeoL = new THREE.BoxGeometry(1.2, 10, 60);
    const wallL = new THREE.Mesh(wallGeoL, this.materials.arcadeStone);
    wallL.position.set(-4.6, 5, 0);
    this.group.add(wallL);

    const wallR = wallL.clone();
    wallR.position.x = 4.6;
    this.group.add(wallR);
  }

  buildGlassCanopy() {
    // Sloped arched glass roof over the entire gallery
    const roofCurve = new THREE.CylinderGeometry(
      3.8,
      3.8,
      60,
      16,
      1,
      true,
      0,
      Math.PI
    );
    const canopy = new THREE.Mesh(roofCurve, this.materials.canopyGlass);
    canopy.rotation.z = Math.PI / 2;
    canopy.rotation.y = Math.PI / 2;
    canopy.position.set(0, 5.8, 0);
    this.group.add(canopy);

    // Iron Rib Grid
    for (let z = -28; z <= 28; z += 3.0) {
      const ribGeo = new THREE.TorusGeometry(3.75, 0.06, 6, 20, Math.PI);
      const rib = new THREE.Mesh(ribGeo, this.materials.ironRib);
      rib.position.set(0, 5.0, z);
      this.group.add(rib);
    }
  }

  buildStorefronts() {
    // Boutiques, bookshops, antiquities on left and right walls
    const numShops = 8;
    const shopSpan = 60 / numShops;

    for (let i = 0; i < numShops; i++) {
      const z = -26 + i * shopSpan + shopSpan / 2;

      // Left Shop Window
      const windowL = new THREE.Mesh(new THREE.PlaneGeometry(shopSpan * 0.75, 3.2), this.materials.shopGlow);
      windowL.position.set(-3.95, 2.2, z);
      windowL.rotation.y = Math.PI / 2;
      this.group.add(windowL);

      // Shop frame & signage
      const signL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, shopSpan * 0.8), this.materials.shopWood);
      signL.position.set(-3.9, 4.0, z);
      this.group.add(signL);

      // Right Shop Window
      const windowR = new THREE.Mesh(new THREE.PlaneGeometry(shopSpan * 0.75, 3.2), this.materials.shopGlow);
      windowR.position.set(3.95, 2.2, z);
      windowR.rotation.y = -Math.PI / 2;
      this.group.add(windowR);

      const signR = signL.clone();
      signR.position.x = 3.9;
      this.group.add(signR);
    }
  }

  buildHangingLanterns() {
    // Warm hanging brass chandeliers along the central gallery axis
    for (let z = -24; z <= 24; z += 12) {
      const lantern = new THREE.Group();
      lantern.position.set(0, 6.0, z);

      // Rod
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 6), this.materials.brassGold);
      rod.position.y = 1.0;
      lantern.add(rod);

      // Glowing glass sphere
      const sphereGeo = new THREE.SphereGeometry(0.45, 12, 12);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xFFE2A0,
        emissive: 0xFFAA33,
        emissiveIntensity: 1.2
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      lantern.add(sphere);

      // Point Light casting warm amber pool on the mosaic floor
      const light = new THREE.PointLight(0xFFA834, 1.8, 14);
      light.position.y = -0.2;
      lantern.add(light);

      this.group.add(lantern);
    }
  }
}
