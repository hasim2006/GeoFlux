// city.js - Procedural 3D Paris Environment: Haussmann architecture, streets, parks, landmarks

import * as THREE from 'three';

export class ParisCity {
  constructor(scene) {
    this.scene = scene;
    this.cityGroup = new THREE.Group();
    this.scene.add(this.cityGroup);

    this.materials = this.createMaterials();
    this.buildings = [];
    this.trees = [];
    this.streetLights = [];

    this.buildGroundAndStreets();
    this.buildHaussmannBlocks();
    this.buildPalaisRoyalAndParks();
    this.buildStreetCafe();
    this.buildRooftopRivoli();
    this.buildEiffelTower();
    this.buildAlternativeLandmarks();
  }

  buildAlternativeLandmarks() {
    this.landmarks = {
      eiffel_tower: this.eiffelTower
    };

    // 1. India Gate Landmark (New Delhi)
    const indiaGate = new THREE.Group();
    indiaGate.position.set(-160, 0, 480);
    const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xD4A373, roughness: 0.8 });
    const archPillarL = new THREE.Mesh(new THREE.BoxGeometry(8, 38, 12), sandstoneMat);
    archPillarL.position.set(-10, 19, 0);
    const archPillarR = new THREE.Mesh(new THREE.BoxGeometry(8, 38, 12), sandstoneMat);
    archPillarR.position.set(10, 19, 0);
    const archLintel = new THREE.Mesh(new THREE.BoxGeometry(32, 14, 14), sandstoneMat);
    archLintel.position.set(0, 45, 0);
    const archAttic = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 12), sandstoneMat);
    archAttic.position.set(0, 56, 0);
    indiaGate.add(archPillarL);
    indiaGate.add(archPillarR);
    indiaGate.add(archLintel);
    indiaGate.add(archAttic);
    const igLight = new THREE.PointLight(0xFFAA33, 3.5, 140);
    igLight.position.set(0, 40, 10);
    indiaGate.add(igLight);
    indiaGate.visible = false;
    this.cityGroup.add(indiaGate);
    this.landmarks.india_gate = indiaGate;

    // 2. Empire State Building (New York)
    const empire = new THREE.Group();
    empire.position.set(-160, 0, 480);
    const decoMat = new THREE.MeshStandardMaterial({ color: 0x9AA0A6, metalness: 0.6, roughness: 0.3 });
    const esbBase = new THREE.Mesh(new THREE.BoxGeometry(26, 60, 26), decoMat);
    esbBase.position.y = 30;
    const esbMid = new THREE.Mesh(new THREE.BoxGeometry(18, 45, 18), decoMat);
    esbMid.position.y = 82;
    const esbTop = new THREE.Mesh(new THREE.BoxGeometry(10, 30, 10), decoMat);
    esbTop.position.y = 120;
    const esbSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.8, 45, 6), decoMat);
    esbSpire.position.y = 158;
    empire.add(esbBase);
    empire.add(esbMid);
    empire.add(esbTop);
    empire.add(esbSpire);
    const esbLight = new THREE.PointLight(0xFF4444, 3.0, 140);
    esbLight.position.set(0, 180, 0);
    empire.add(esbLight);
    empire.visible = false;
    this.cityGroup.add(empire);
    this.landmarks.empire_state = empire;

    // 3. Big Ben (London)
    const bigBen = new THREE.Group();
    bigBen.position.set(-160, 0, 480);
    const gothicMat = new THREE.MeshStandardMaterial({ color: 0xCFB997, roughness: 0.7 });
    const bbTower = new THREE.Mesh(new THREE.BoxGeometry(12, 80, 12), gothicMat);
    bbTower.position.y = 40;
    const bbClock = new THREE.Mesh(new THREE.BoxGeometry(14, 14, 14), gothicMat);
    bbClock.position.y = 87;
    const bbSpire = new THREE.Mesh(new THREE.ConeGeometry(7, 35, 4), new THREE.MeshStandardMaterial({ color: 0x3C4752, metalness: 0.8 }));
    bbSpire.position.y = 111;
    bbSpire.rotation.y = Math.PI / 4;
    bigBen.add(bbTower);
    bigBen.add(bbClock);
    bigBen.add(bbSpire);
    bigBen.visible = false;
    this.cityGroup.add(bigBen);
    this.landmarks.big_ben = bigBen;

    // 4. Tokyo Tower (Tokyo)
    const tokyoT = this.eiffelTower.clone();
    tokyoT.position.set(-160, 0, 480);
    tokyoT.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshStandardMaterial({ color: 0xEA4335, metalness: 0.5 });
      }
    });
    tokyoT.visible = false;
    this.cityGroup.add(tokyoT);
    this.landmarks.tokyo_tower = tokyoT;

    // 5. Burj Khalifa (Dubai)
    const burj = new THREE.Group();
    burj.position.set(-160, 0, 480);
    const glassSleek = new THREE.MeshStandardMaterial({ color: 0xC0D6E4, metalness: 0.9, roughness: 0.1 });
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(8, 14, 60, 6), glassSleek);
    b1.position.y = 30;
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(4, 8, 60, 6), glassSleek);
    b2.position.y = 90;
    const b3 = new THREE.Mesh(new THREE.CylinderGeometry(1, 4, 60, 6), glassSleek);
    b3.position.y = 150;
    const bSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 1, 40, 4), glassSleek);
    bSpire.position.y = 200;
    burj.add(b1);
    burj.add(b2);
    burj.add(b3);
    burj.add(bSpire);
    burj.visible = false;
    this.cityGroup.add(burj);
    this.landmarks.burj_khalifa = burj;
  }

  setLandmark(landmarkKey) {
    Object.keys(this.landmarks).forEach(key => {
      if (this.landmarks[key]) {
        this.landmarks[key].visible = (key === landmarkKey);
      }
    });
  }

  createMaterials() {
    return {
      facadeCream: new THREE.MeshStandardMaterial({
        color: 0xF3EFEA,
        roughness: 0.85,
        metalness: 0.05
      }),
      facadeWarmGrey: new THREE.MeshStandardMaterial({
        color: 0xE2DDD5,
        roughness: 0.88,
        metalness: 0.05
      }),
      facadeLimestone: new THREE.MeshStandardMaterial({
        color: 0xDDD6C9,
        roughness: 0.9,
        metalness: 0.05
      }),
      zincRoof: new THREE.MeshStandardMaterial({
        color: 0x4B5864,
        roughness: 0.5,
        metalness: 0.35
      }),
      zincTrim: new THREE.MeshStandardMaterial({
        color: 0x333C44,
        roughness: 0.6,
        metalness: 0.4
      }),
      windowGlass: new THREE.MeshStandardMaterial({
        color: 0x88A2B8,
        roughness: 0.2,
        metalness: 0.8
      }),
      windowWarmGlow: new THREE.MeshStandardMaterial({
        color: 0xFFE0A0,
        emissive: 0xFFAA33,
        emissiveIntensity: 0.6,
        roughness: 0.3
      }),
      balconyIron: new THREE.MeshStandardMaterial({
        color: 0x222629,
        roughness: 0.4,
        metalness: 0.8
      }),
      roadAsphalt: new THREE.MeshStandardMaterial({
        color: 0xCBCED2,
        roughness: 0.8,
        metalness: 0.1
      }),
      sidewalk: new THREE.MeshStandardMaterial({
        color: 0xE8ECEF,
        roughness: 0.9,
        metalness: 0.02
      }),
      bikeLane: new THREE.MeshStandardMaterial({
        color: 0x249B45, // Saturated green cycle lane
        roughness: 0.6,
        metalness: 0.1
      }),
      parkGrass: new THREE.MeshStandardMaterial({
        color: 0x588448,
        roughness: 0.95,
        metalness: 0.0
      }),
      treeFoliage: new THREE.MeshStandardMaterial({
        color: 0x487538,
        roughness: 0.9,
        metalness: 0.0
      }),
      treeTrunk: new THREE.MeshStandardMaterial({
        color: 0x4A3828,
        roughness: 0.95
      }),
      awningRedWhite: new THREE.MeshStandardMaterial({
        color: 0xDE372A,
        roughness: 0.6
      }),
      cafeWhite: new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.5
      }),
      woodDeck: new THREE.MeshStandardMaterial({
        color: 0x7E5A3C,
        roughness: 0.7
      }),
      goldBrass: new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        metalness: 0.7,
        roughness: 0.3
      })
    };
  }

  buildGroundAndStreets() {
    // Master Ground Base / City Tile (for final pullback stage)
    const baseGeo = new THREE.BoxGeometry(450, 2, 550);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.sidewalk);
    baseMesh.position.set(0, -1, 180);
    baseMesh.receiveShadow = true;
    this.cityGroup.add(baseMesh);

    // Main Avenue: Rue de Rivoli (Z: -20 to 120, X: -10 to 10)
    const rivoliGeo = new THREE.PlaneGeometry(16, 500);
    const rivoliRoad = new THREE.Mesh(rivoliGeo, this.materials.roadAsphalt);
    rivoliRoad.rotation.x = -Math.PI / 2;
    rivoliRoad.position.set(0, 0.02, 180);
    rivoliRoad.receiveShadow = true;
    this.cityGroup.add(rivoliRoad);

    // Saturated Green Cycle Lane along Rue de Rivoli
    const bikeLaneGeo = new THREE.PlaneGeometry(2.4, 500);
    const bikeLane = new THREE.Mesh(bikeLaneGeo, this.materials.bikeLane);
    bikeLane.rotation.x = -Math.PI / 2;
    bikeLane.position.set(5.5, 0.03, 180);
    bikeLane.receiveShadow = true;
    this.cityGroup.add(bikeLane);
    this.bikeLaneMesh = bikeLane;

    // Cross street: Place Colette / Rue Saint-Honoré (X: -100 to 100, Z: 80)
    const coletteGeo = new THREE.PlaneGeometry(160, 14);
    const coletteRoad = new THREE.Mesh(coletteGeo, this.materials.roadAsphalt);
    coletteRoad.rotation.x = -Math.PI / 2;
    coletteRoad.position.set(40, 0.02, 85);
    coletteRoad.receiveShadow = true;
    this.cityGroup.add(coletteRoad);

    // Rue Vivienne & Passage approach street (Z: 85 to 220, X: 25)
    const vivienneGeo = new THREE.PlaneGeometry(12, 140);
    const vivienneRoad = new THREE.Mesh(vivienneGeo, this.materials.roadAsphalt);
    vivienneRoad.rotation.x = -Math.PI / 2;
    vivienneRoad.position.set(25, 0.02, 150);
    vivienneRoad.receiveShadow = true;
    this.cityGroup.add(vivienneRoad);

    // Rue de Beaujolais (Z: 260, X: -40 to 80)
    const beaujolaisGeo = new THREE.PlaneGeometry(140, 12);
    const beaujolaisRoad = new THREE.Mesh(beaujolaisGeo, this.materials.roadAsphalt);
    beaujolaisRoad.rotation.x = -Math.PI / 2;
    beaujolaisRoad.position.set(10, 0.02, 260);
    beaujolaisRoad.receiveShadow = true;
    this.cityGroup.add(beaujolaisRoad);
  }

  buildHaussmannBlocks() {
    // Generate modular Haussmann city blocks along the journey
    const blockConfigs = [
      // Left side of Rivoli
      { x: -35, z: 20, w: 40, d: 70, h: 22, floors: 6 },
      { x: -35, z: 100, w: 40, d: 65, h: 24, floors: 6 },
      { x: -35, z: 180, w: 40, d: 75, h: 22, floors: 6 },
      { x: -35, z: 260, w: 40, d: 65, h: 25, floors: 6 },
      { x: -35, z: 340, w: 40, d: 70, h: 26, floors: 6 },

      // Right side of Rivoli (Place Colette / Palais-Royal approach)
      { x: 35, z: 20, w: 38, d: 70, h: 22, floors: 6 },
      { x: 50, z: 140, w: 32, d: 70, h: 23, floors: 6 },
      { x: 55, z: 220, w: 36, d: 65, h: 24, floors: 6 },
      { x: 45, z: 310, w: 34, d: 75, h: 22, floors: 6 },

      // Surrounding peripheral blocks for Parisian density
      { x: -90, z: 60, w: 50, d: 80, h: 20, floors: 5 },
      { x: -90, z: 160, w: 50, d: 90, h: 21, floors: 5 },
      { x: -90, z: 270, w: 50, d: 90, h: 23, floors: 6 },
      { x: 100, z: 60, w: 50, d: 80, h: 20, floors: 5 },
      { x: 105, z: 160, w: 50, d: 90, h: 21, floors: 5 },
      { x: 95, z: 270, w: 50, d: 90, h: 22, floors: 5 }
    ];

    blockConfigs.forEach(cfg => {
      this.createHaussmannBlock(cfg);
    });
  }

  createHaussmannBlock({ x, z, w, d, h, floors }) {
    const block = new THREE.Group();
    block.position.set(x, 0, z);

    const wallMat = Math.random() > 0.5 ? this.materials.facadeCream : this.materials.facadeWarmGrey;

    // 1. Lower facade body (Ground floor to 4th floor)
    const bodyHeight = h * 0.72;
    const bodyGeo = new THREE.BoxGeometry(w, bodyHeight, d);
    const body = new THREE.Mesh(bodyGeo, wallMat);
    body.position.y = bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    block.add(body);

    // 2. Continuous Balconies (Haussmann 2nd floor & 5th floor)
    const balconyFloorY = [bodyHeight * 0.35, bodyHeight * 0.85];
    balconyFloorY.forEach(bY => {
      const bGeo = new THREE.BoxGeometry(w + 1.2, 0.3, d + 1.2);
      const bMesh = new THREE.Mesh(bGeo, this.materials.balconyIron);
      bMesh.position.y = bY;
      block.add(bMesh);

      // Balcony Railing strip
      const railGeo = new THREE.BoxGeometry(w + 1.2, 0.8, d + 1.2);
      const railMesh = new THREE.Mesh(railGeo, this.materials.balconyIron);
      railMesh.position.y = bY + 0.5;
      block.add(railMesh);
    });

    // 3. Iconic Haussmann Zinc Mansard Roof (Sloped 45° with zinc panels)
    const roofHeight = h * 0.28;
    const roofTopW = Math.max(2, w - roofHeight * 1.4);
    const roofTopD = Math.max(2, d - roofHeight * 1.4);

    // Sloped roof mesh using truncated pyramid
    const roofGeo = new THREE.CylinderGeometry(
      Math.sqrt(roofTopW * roofTopW + roofTopD * roofTopD) / 2,
      Math.sqrt(w * w + d * d) / 2,
      roofHeight,
      4,
      1,
      false,
      Math.PI / 4
    );
    const roof = new THREE.Mesh(roofGeo, this.materials.zincRoof);
    roof.position.y = bodyHeight + roofHeight / 2;
    roof.castShadow = true;
    block.add(roof);

    // 4. Roof Chimneys (classic red terracotta Parisian cheminées)
    const numChimneys = 5;
    for (let i = 0; i < numChimneys; i++) {
      const cGeo = new THREE.BoxGeometry(0.8, 2.5, 0.8);
      const chimney = new THREE.Mesh(cGeo, this.materials.facadeLimestone);
      const cx = (Math.random() - 0.5) * (roofTopW * 0.7);
      const cz = (Math.random() - 0.5) * (roofTopD * 0.7);
      chimney.position.set(cx, bodyHeight + roofHeight + 1.25, cz);
      chimney.castShadow = true;
      block.add(chimney);
    }

    // 5. Windows with occasional warm interior lights
    const rows = 4;
    const cols = Math.floor(w / 4);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isWarm = Math.random() > 0.65;
        const winGeo = new THREE.PlaneGeometry(1.6, 2.4);
        const winMat = isWarm ? this.materials.windowWarmGlow : this.materials.windowGlass;
        
        // Front face windows
        const winFront = new THREE.Mesh(winGeo, winMat);
        winFront.position.set(
          -w / 2 + (c + 0.5) * (w / cols),
          3.5 + r * 3.5,
          d / 2 + 0.05
        );
        block.add(winFront);

        // Back face windows
        const winBack = winFront.clone();
        winBack.position.z = -d / 2 - 0.05;
        winBack.rotation.y = Math.PI;
        block.add(winBack);
      }
    }

    // Ground floor storefront trim
    const shopGeo = new THREE.BoxGeometry(w + 0.4, 3.8, d + 0.4);
    const shopMesh = new THREE.Mesh(shopGeo, this.materials.facadeWarmGrey);
    shopMesh.position.y = 1.9;
    block.add(shopMesh);

    this.cityGroup.add(block);
    this.buildings.push(block);
  }

  buildPalaisRoyalAndParks() {
    // Jardin des Tuileries / Palais-Royal Gardens
    const parkGeo = new THREE.BoxGeometry(110, 0.4, 180);
    const park = new THREE.Mesh(parkGeo, this.materials.parkGrass);
    park.position.set(-85, 0.2, 140);
    park.receiveShadow = true;
    this.cityGroup.add(park);

    // Stylized French linden trees in orderly rows
    for (let tx = -120; tx <= -50; tx += 16) {
      for (let tz = 70; tz <= 210; tz += 22) {
        this.createTree(tx, tz);
      }
    }

    // Street trees along Rue de Rivoli
    for (let tz = 10; tz <= 320; tz += 24) {
      this.createTree(9, tz);
    }
  }

  createTree(x, z) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 3.5, 6);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.treeTrunk);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    tree.add(trunk);

    // Parisian manicured foliage canopy (layered ellipsoids)
    const crownGeo = new THREE.DodecahedronGeometry(2.4, 1);
    const crown = new THREE.Mesh(crownGeo, this.materials.treeFoliage);
    crown.position.y = 4.8;
    crown.scale.set(1.1, 1.3, 1.1);
    crown.castShadow = true;
    tree.add(crown);

    this.cityGroup.add(tree);
    this.trees.push(tree);
  }

  buildStreetCafe() {
    // "Rue de Beaujolais" Café terrace (Meet Friends Beat 10.70 - 13.30)
    const cafe = new THREE.Group();
    cafe.position.set(12, 0, 252);

    // Procedural Red & White Striped Awning Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const stripeWidth = 16;
    for (let x = 0; x < 128; x += stripeWidth * 2) {
      ctx.fillStyle = '#D93025'; // Google Red / French bistro red
      ctx.fillRect(x, 0, stripeWidth, 128);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + stripeWidth, 0, stripeWidth, 128);
    }
    const stripeTex = new THREE.CanvasTexture(canvas);
    stripeTex.wrapS = THREE.RepeatWrapping;
    stripeTex.wrapT = THREE.RepeatWrapping;
    stripeTex.repeat.set(4, 1);

    const awningMat = new THREE.MeshStandardMaterial({
      map: stripeTex,
      roughness: 0.5,
      side: THREE.DoubleSide
    });

    const awningWidth = 16;
    const awningDepth = 4.8;
    const awningGeo = new THREE.PlaneGeometry(awningWidth, awningDepth);
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.rotation.x = Math.PI / 3;
    awning.position.set(-6, 4.2, 5);
    awning.castShadow = true;
    cafe.add(awning);

    // Café tables & chairs on sidewalk terrace
    for (let i = -12; i <= 0; i += 3.2) {
      // Table
      const tableTopGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.06, 16);
      const tableTop = new THREE.Mesh(tableTopGeo, this.materials.cafeWhite);
      tableTop.position.set(i, 0.8, 5.5);
      const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), this.materials.balconyIron);
      tableLeg.position.set(i, 0.4, 5.5);
      cafe.add(tableTop);
      cafe.add(tableLeg);

      // Chairs around table
      [-0.65, 0.65].forEach(offsetZ => {
        const chairGeo = new THREE.BoxGeometry(0.45, 0.06, 0.45);
        const chair = new THREE.Mesh(chairGeo, this.materials.balconyIron);
        chair.position.set(i, 0.45, 5.5 + offsetZ);
        cafe.add(chair);
      });
    }

    // Warm terrace lantern glow
    const terraceLight = new THREE.PointLight(0xFFAA44, 1.5, 12);
    terraceLight.position.set(0, 3.2, 2.5);
    cafe.add(terraceLight);

    this.cityGroup.add(cafe);
    this.cafeGroup = cafe;
  }

  buildRooftopRivoli() {
    // Rooftop Rivoli destination (Beat 13.30 - 18.80)
    // Placed on top of building at x: -35, z: 340, y: 26
    const rooftop = new THREE.Group();
    rooftop.position.set(-35, 26, 340);

    // Wooden deck floor
    const deckGeo = new THREE.BoxGeometry(28, 0.4, 34);
    const deck = new THREE.Mesh(deckGeo, this.materials.woodDeck);
    deck.position.y = 0.2;
    deck.receiveShadow = true;
    rooftop.add(deck);

    // Glass perimeter safety railing
    const glassRailGeo = new THREE.BoxGeometry(28.4, 1.4, 34.4);
    const glassRail = new THREE.Mesh(glassRailGeo, this.materials.windowGlass);
    glassRail.position.y = 0.9;
    rooftop.add(glassRail);

    // Modern Lounge Sofas & tables
    const sofaGeo = new THREE.BoxGeometry(6, 1.0, 2.5);
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xF5F5F0, roughness: 0.6 });
    const sofa1 = new THREE.Mesh(sofaGeo, sofaMat);
    sofa1.position.set(4, 0.7, 4);
    rooftop.add(sofa1);

    const sofa2 = sofa1.clone();
    sofa2.position.set(-4, 0.7, 4);
    sofa2.rotation.y = Math.PI;
    rooftop.add(sofa2);

    // Rooftop Bar counter
    const barGeo = new THREE.BoxGeometry(10, 1.6, 2.5);
    const bar = new THREE.Mesh(barGeo, this.materials.facadeWarmGrey);
    bar.position.set(0, 1.0, -8);
    rooftop.add(bar);

    // Warm festoon string lighting poles
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), this.materials.balconyIron);
    pole1.position.set(10, 1.6, 12);
    const pole2 = pole1.clone();
    pole2.position.set(-10, 1.6, 12);
    rooftop.add(pole1);
    rooftop.add(pole2);

    // Warm rooftop party glow light
    const roofLight = new THREE.PointLight(0xFFB050, 2.5, 25);
    roofLight.position.set(0, 3.5, 0);
    rooftop.add(roofLight);

    this.cityGroup.add(rooftop);
    this.rooftopGroup = rooftop;
  }

  buildEiffelTower() {
    // Stylized Eiffel Tower silhouette on the distant horizon
    // Placed at X: -160, Z: 480, Y: 0 (visible during Golden Hour rise)
    const tower = new THREE.Group();
    tower.position.set(-160, 0, 480);

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x6E6155,
      metalness: 0.7,
      roughness: 0.5
    });

    // Tier 1 Base arches & pillars
    const basePillars = [
      [-12, -12], [12, -12], [-12, 12], [12, 12]
    ];
    basePillars.forEach(([px, pz]) => {
      const pGeo = new THREE.CylinderGeometry(1.6, 3.0, 30, 4);
      const pillar = new THREE.Mesh(pGeo, ironMat);
      pillar.position.set(px * 0.7, 15, pz * 0.7);
      tower.add(pillar);
    });

    // Platform 1
    const plat1 = new THREE.Mesh(new THREE.BoxGeometry(22, 2.5, 22), ironMat);
    plat1.position.y = 30;
    tower.add(plat1);

    // Tier 2 Mid spire
    const midGeo = new THREE.CylinderGeometry(4.5, 9.0, 40, 4);
    const mid = new THREE.Mesh(midGeo, ironMat);
    mid.position.y = 50;
    tower.add(mid);

    // Platform 2
    const plat2 = new THREE.Mesh(new THREE.BoxGeometry(12, 2.0, 12), ironMat);
    plat2.position.y = 70;
    tower.add(plat2);

    // Tier 3 Top Needle Spire
    const spireGeo = new THREE.CylinderGeometry(0.4, 4.0, 60, 4);
    const spire = new THREE.Mesh(spireGeo, ironMat);
    spire.position.y = 100;
    tower.add(spire);

    // Beacon Top Light (glowing golden-orange)
    const beaconLight = new THREE.PointLight(0xFFAA44, 3.0, 120);
    beaconLight.position.set(0, 130, 0);
    tower.add(beaconLight);

    this.cityGroup.add(tower);
    this.eiffelTower = tower;
  }
}
