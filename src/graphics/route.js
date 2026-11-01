// route.js - 3D Google Blue Navigation Route, Morphing Location Marker, Catmull-Rom Spline

import * as THREE from 'three';

export class NavigationRoute {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Waypoints for the Paris Journey
    this.points = [
      new THREE.Vector3(0, 0.08, 0),       // 0.0s: Start Rue de Rivoli
      new THREE.Vector3(0, 0.08, 30),      // 1.5s: Rivoli tracking
      new THREE.Vector3(5.5, 0.08, 65),    // 3.1s: Join green bike lane
      new THREE.Vector3(15, 0.08, 85),     // 4.5s: Vélib station Place Colette
      new THREE.Vector3(22, 0.08, 125),    // 6.0s: Turn to Rue Vivienne (Rain)
      new THREE.Vector3(25, 0.08, 160),    // 7.5s: Vivienne approach
      new THREE.Vector3(30, 0.08, 185),    // 8.8s: Enter Galerie Vivienne
      new THREE.Vector3(30, 0.08, 215),    // 9.8s: Mid Galerie Vivienne
      new THREE.Vector3(30, 0.08, 235),    // 10.7s: Exit Galerie Vivienne
      new THREE.Vector3(14, 0.08, 255),    // 11.8s: Rue de Beaujolais / Café
      new THREE.Vector3(0, 0.08, 275),     // 13.3s: Return to Rivoli avenue
      new THREE.Vector3(-10, 5.0, 305),    // 15.0s: Accelerate & rise above park
      new THREE.Vector3(-25, 16.0, 325),   // 16.2s: Rooftop Rivoli ascent
      new THREE.Vector3(-35, 26.3, 340),   // 16.7s: Destination point on terrace
      new THREE.Vector3(-35, 26.3, 345)    // 18.0s: Destination hold
    ];

    this.curve = new THREE.CatmullRomCurve3(this.points);
    this.curve.curveType = 'centripetal';
    this.curve.tension = 0.5;

    this.buildRouteMesh();
    this.buildLocationMarker();
    this.buildDestinationPin();
  }

  buildRouteMesh() {
    // Generate extruded ribbon along the spline
    const tubularSegments = 300;
    const radius = 0.45;
    const radialSegments = 8;
    const geometry = new THREE.TubeGeometry(this.curve, tubularSegments, radius, radialSegments, false);

    // Glowing Google Blue material
    this.routeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1A73E8, // Vivid Google Blue
      emissive: 0x185ABC,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.1
    });

    this.routeMesh = new THREE.Mesh(geometry, this.routeMaterial);
    this.routeMesh.position.y = 0.05;
    this.group.add(this.routeMesh);

    // Soft Blue Glow Underlay (ribbon outline)
    const glowGeo = new THREE.TubeGeometry(this.curve, tubularSegments, radius * 1.6, radialSegments, false);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x8AB4F8,
      transparent: true,
      opacity: 0.28
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.y = 0.04;
    this.group.add(glowMesh);
  }

  buildLocationMarker() {
    this.markerGroup = new THREE.Group();
    this.group.add(this.markerGroup);

    // 1. Blue Location Dot
    const dotGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.2, 24);
    const dotMat = new THREE.MeshStandardMaterial({
      color: 0x1A73E8,
      emissive: 0x4285F4,
      emissiveIntensity: 0.8
    });
    this.dotMesh = new THREE.Mesh(dotGeo, dotMat);
    this.dotMesh.position.y = 0.15;
    this.markerGroup.add(this.dotMesh);

    // White outer ring
    const ringGeo = new THREE.RingGeometry(0.9, 1.25, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.26;
    this.markerGroup.add(ring);

    // Pulsing Radar Ring
    const radarGeo = new THREE.RingGeometry(1.2, 1.4, 32);
    this.radarMat = new THREE.MeshBasicMaterial({
      color: 0x4285F4,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    this.radarRing = new THREE.Mesh(radarGeo, this.radarMat);
    this.radarRing.rotation.x = -Math.PI / 2;
    this.radarRing.position.y = 0.25;
    this.markerGroup.add(this.radarRing);

    // 2. Bicycle Marker (disc with bike emblem that morphs into view at 3.10s)
    this.bikeGroup = new THREE.Group();
    const bikeDiscGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.22, 24);
    const bikeDiscMat = new THREE.MeshStandardMaterial({
      color: 0x185ABC,
      emissive: 0x1A73E8,
      emissiveIntensity: 0.6
    });
    const bikeDisc = new THREE.Mesh(bikeDiscGeo, bikeDiscMat);
    bikeDisc.position.y = 0.16;
    this.bikeGroup.add(bikeDisc);

    // Bike Symbol Graphic inside disc
    const bikeIconGeo = new THREE.PlaneGeometry(1.6, 1.6);
    // Stylized bicycle mesh bars
    const bWhite = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const wheel1 = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.45, 16), bWhite);
    wheel1.rotation.x = -Math.PI / 2;
    wheel1.position.set(-0.6, 0.28, 0);
    this.bikeGroup.add(wheel1);

    const wheel2 = wheel1.clone();
    wheel2.position.x = 0.6;
    this.bikeGroup.add(wheel2);

    const frameBar = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.12), bWhite);
    frameBar.rotation.x = -Math.PI / 2;
    frameBar.position.set(0, 0.28, 0);
    this.bikeGroup.add(frameBar);

    this.bikeGroup.visible = false;
    this.markerGroup.add(this.bikeGroup);
  }

  buildDestinationPin() {
    // Rooftop Destination Marker (pulses at 16.7s)
    this.destGroup = new THREE.Group();
    this.destGroup.position.set(-35, 26.5, 340);

    // Glowing target circle
    const targetGeo = new THREE.RingGeometry(1.8, 2.3, 32);
    this.targetMat = new THREE.MeshBasicMaterial({
      color: 0xEA4335,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const target = new THREE.Mesh(targetGeo, this.targetMat);
    target.rotation.x = -Math.PI / 2;
    target.position.y = 0.1;
    this.destGroup.add(target);

    // 3D Official Pin Outline in space
    const pinShape = new THREE.Shape();
    pinShape.moveTo(0, 0);
    pinShape.bezierCurveTo(1.5, 2.5, 2.5, 4.0, 2.5, 5.5);
    pinShape.absarc(0, 5.5, 2.5, 0, Math.PI, false);
    pinShape.bezierCurveTo(-2.5, 4.0, -1.5, 2.5, 0, 0);

    const pinHole = new THREE.Path();
    pinHole.absarc(0, 5.5, 1.0, 0, Math.PI * 2, true);
    pinShape.holes.push(pinHole);

    const pinGeo = new THREE.ExtrudeGeometry(pinShape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1
    });

    this.pin3DMat = new THREE.MeshStandardMaterial({
      color: 0xEA4335,
      emissive: 0xEA4335,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.3
    });

    this.pin3DMesh = new THREE.Mesh(pinGeo, this.pin3DMat);
    this.pin3DMesh.scale.set(0.35, 0.35, 0.35);
    this.pin3DMesh.position.set(0, 1.2, 0);
    this.destGroup.add(this.pin3DMesh);

    this.group.add(this.destGroup);
  }

  update(time) {
    // Route progress mapping across 0.0 to 18.0 seconds
    let progress = 0;
    if (time < 1.1) {
      progress = 0.0;
    } else if (time < 3.1) {
      progress = (time - 1.1) / (3.1 - 1.1) * 0.18;
    } else if (time < 5.4) {
      progress = 0.18 + (time - 3.1) / (5.4 - 3.1) * 0.15;
    } else if (time < 8.8) {
      progress = 0.33 + (time - 5.4) / (8.8 - 5.4) * 0.22;
    } else if (time < 10.7) {
      progress = 0.55 + (time - 8.8) / (10.7 - 8.8) * 0.15;
    } else if (time < 13.3) {
      progress = 0.70 + (time - 10.7) / (13.3 - 10.7) * 0.12;
    } else if (time < 16.7) {
      progress = 0.82 + (time - 13.3) / (16.7 - 13.3) * 0.17;
    } else {
      progress = 1.0;
    }

    progress = Math.max(0, Math.min(1.0, progress));

    // Position marker at current progress on spline
    const pos = this.curve.getPointAt(progress);
    const tangent = this.curve.getTangentAt(progress);

    this.markerGroup.position.copy(pos);
    if (tangent.lengthSq() > 0.0001) {
      const angle = Math.atan2(tangent.x, tangent.z);
      this.markerGroup.rotation.y = angle;
    }

    // Morph marker: Dot vs Bicycle
    const isBicycle = time >= 3.10 && time < 13.30;
    this.dotMesh.visible = !isBicycle;
    this.bikeGroup.visible = isBicycle;

    // Pulse radar ring
    const radarScale = 1.0 + (Math.sin(time * 6.0) * 0.5 + 0.5) * 1.5;
    this.radarRing.scale.set(radarScale, radarScale, 1);
    this.radarMat.opacity = Math.max(0, 0.7 - (radarScale - 1.0) * 0.45);

    // Pulse destination pin at 16.7s - 18.8s
    if (time >= 16.5) {
      const destScale = 1.0 + Math.sin((time - 16.5) * 8.0) * 0.15;
      this.destGroup.scale.set(destScale, destScale, destScale);
      this.pin3DMesh.rotation.y += 0.02;
    }

    return { pos, tangent, progress };
  }
}
