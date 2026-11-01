// main.js - Master application controller: Three.js renderer, render loop, studio UI, dynamic locations & voice

import * as THREE from 'three';
import { TimelineController, TOTAL_DURATION, BEATS } from './timeline.js';
import { AudioManager } from '../audio/audio.js';
import { ParisCity } from '../graphics/city.js';
import { GalerieVivienne } from '../graphics/arcade.js';
import { NavigationRoute } from '../graphics/route.js';
import { WeatherSystem } from '../graphics/weather.js';
import { DirectorCamera } from '../graphics/camera.js';
import { UIManager } from '../ui/ui.js';
import { VideoRecorder } from '../export/recorder.js';
import { MapsService, CITY_PRESETS } from '../maps/mapsApi.js';

class App {
  constructor() {
    this.container = document.getElementById('viewport-container');
    this.canvas = document.getElementById('webgl-canvas');
    this.aspectMode = '16:9'; // '16:9' or '9:16'
    this.currentCityKey = 'paris';

    this.mapsService = new MapsService();

    this.initThree();
    this.initSceneObjects();
    this.initTimelineAndAudio();
    this.initStudioUI();
    this.initLocationAndVoiceModals();
    this.bindEvents();

    // Set initial city configuration
    this.applyCityPreset('paris');

    // Expose programmatic hooks for Playwright offline render
    window.seekTimeline = (t) => this.seekToTime(t);
    window.getProjectDuration = () => TOTAL_DURATION;
    window.getProjectInfo = () => ({ duration: TOTAL_DURATION, fps: 60, aspect: this.aspectMode, city: this.currentCityKey });

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();

    // Master Perspective Camera
    this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1200);
    this.directorCamera = new DirectorCamera(this.camera);

    // High fidelity WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.updateViewportSize();
  }

  initSceneObjects() {
    this.city = new ParisCity(this.scene);
    this.arcade = new GalerieVivienne(this.scene);
    this.route = new NavigationRoute(this.scene);
    this.weather = new WeatherSystem(this.scene);
    this.ui = new UIManager(document.getElementById('studio-viewport'));
  }

  initTimelineAndAudio() {
    this.audio = new AudioManager();
    this.timeline = new TimelineController((time, beat) => {
      this.onTimelineUpdate(time, beat);
    });

    this.recorder = new VideoRecorder(this.canvas, this.audio, this.timeline);
  }

  initStudioUI() {
    // Timeline scrubber & buttons
    this.btnPlay = document.getElementById('btn-play');
    this.btnPlayIcon = document.getElementById('btn-play-icon');
    this.scrubber = document.getElementById('timeline-scrubber');
    this.timecodeDisplay = document.getElementById('timecode-display');
    this.beatBadge = document.getElementById('current-beat-badge');
    this.btnAudio = document.getElementById('btn-audio');
    this.btnAspect = document.getElementById('btn-aspect');
    this.btnCam = document.getElementById('btn-cam');
    this.btnExport = document.getElementById('btn-export');
    this.exportModal = document.getElementById('export-modal');
    this.exportProgress = document.getElementById('export-progress');
    this.exportStatus = document.getElementById('export-status');
    this.beatChipsContainer = document.getElementById('beat-chips-container');

    // Header buttons
    this.btnLocation = document.getElementById('btn-location');
    this.btnVoiceSettings = document.getElementById('btn-voice-settings');
    this.modalLocation = document.getElementById('modal-location');
    this.modalVoice = document.getElementById('modal-voice');

    // Populate beat chips
    BEATS.forEach(beat => {
      const chip = document.createElement('button');
      chip.className = 'beat-chip';
      chip.innerText = `${beat.name} (${beat.start.toFixed(1)}s)`;
      chip.onclick = () => {
        this.timeline.seek(beat.start);
        this.audio.ensureContext();
      };
      this.beatChipsContainer.appendChild(chip);
    });
  }

  initLocationAndVoiceModals() {
    // Location Presets Click
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cityKey = btn.dataset.city;
        this.applyCityPreset(cityKey);
      });
    });

    // Custom Route Generator Button
    const btnGen = document.getElementById('btn-generate-route');
    const inputOrigin = document.getElementById('input-origin');
    const inputDest = document.getElementById('input-dest');
    const inputApiKey = document.getElementById('input-apikey');

    btnGen.addEventListener('click', async () => {
      const orig = inputOrigin.value.trim();
      const dest = inputDest.value.trim();
      const key = inputApiKey.value.trim();
      if (!orig || !dest) return;

      btnGen.innerText = "⏳ Generating Real 3D Route...";
      btnGen.disabled = true;

      try {
        if (key) this.mapsService.setApiKey(key);
        const routeData = await this.mapsService.fetchCustomRoute(orig, dest);

        // Build dynamic city preset config
        const customConfig = {
          name: routeData.destName || dest,
          country: "Custom Location",
          landmark: "eiffel_tower",
          route: {
            streetStart: routeData.originName || orig,
            streetTurn: routeData.streetNames[1] || "Cross Boulevard",
            passageName: "Grand Central Promenade",
            passageSub: "Covered Architectural Galleria",
            streetExit: routeData.streetNames[2] || "Avenue Central",
            bikeStation: `Smart Cycle – ${orig.split(',')[0]}`,
            bikeSub: "Station #04 · 12 bikes ready",
            cafeName: "The Local Bistro",
            rooftopName: `Rooftop ${dest.split(',')[0]}`,
            rooftopSub: `Sunset Lounge · Panoramic view`
          },
          voiceLines: [
            `A bike around ${orig.split(',')[0]}.`,
            "Shelter before the rain.",
            "A passage worth taking.",
            "Friends already there.",
            "And a rooftop just in time.",
            `Go like you live here. ${dest.split(',')[0]}.`
          ]
        };

        this.applyCustomConfig(customConfig);
        this.modalLocation.classList.add('hidden');
      } catch (err) {
        alert("Error creating route: " + err.message);
      } finally {
        btnGen.innerText = "🚀 Generate Custom 3D Video Ad";
        btnGen.disabled = false;
      }
    });

    // Close location modal
    document.getElementById('btn-close-location-modal').addEventListener('click', () => {
      this.modalLocation.classList.add('hidden');
    });

    // Open location modal
    this.btnLocation.addEventListener('click', () => {
      this.modalLocation.classList.remove('hidden');
    });

    // Voice Studio Modal
    this.btnVoiceSettings.addEventListener('click', () => {
      this.populateVoiceSelect();
      this.modalVoice.classList.remove('hidden');
    });

    document.getElementById('btn-close-voice-modal').addEventListener('click', () => {
      this.modalVoice.classList.add('hidden');
    });

    // Voice sliders
    const rateSlider = document.getElementById('slider-voice-rate');
    const rateVal = document.getElementById('rate-val');
    rateSlider.addEventListener('input', (e) => {
      this.audio.voiceRate = parseFloat(e.target.value);
      rateVal.innerText = `${this.audio.voiceRate}x`;
    });

    const pitchSlider = document.getElementById('slider-voice-pitch');
    const pitchVal = document.getElementById('pitch-val');
    pitchSlider.addEventListener('input', (e) => {
      this.audio.voicePitch = parseFloat(e.target.value);
      pitchVal.innerText = `${this.audio.voicePitch}`;
    });

    // Voice select change
    const voiceSelect = document.getElementById('voice-select');
    voiceSelect.addEventListener('change', () => {
      const voices = window.speechSynthesis.getVoices();
      const chosen = voices.find(v => v.name === voiceSelect.value);
      if (chosen) this.audio.selectedVoice = chosen;
    });

    // Test voice button
    document.getElementById('btn-test-voice').addEventListener('click', () => {
      this.audio.speak("Go like you live here. A crystal clear voice guide.");
    });
  }

  populateVoiceSelect() {
    if (!('speechSynthesis' in window)) return;
    const voiceSelect = document.getElementById('voice-select');
    voiceSelect.innerHTML = '';
    const voices = window.speechSynthesis.getVoices();
    voices.filter(v => v.lang.startsWith('en')).forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.innerText = `${v.name} (${v.lang})`;
      if (this.audio.selectedVoice && this.audio.selectedVoice.name === v.name) {
        opt.selected = true;
      }
      voiceSelect.appendChild(opt);
    });
  }

  applyCityPreset(cityKey) {
    const preset = CITY_PRESETS[cityKey];
    if (!preset) return;
    this.currentCityKey = cityKey;
    this.applyCustomConfig(preset);
  }

  applyCustomConfig(config) {
    this.btnLocation.innerText = `📍 Location: ${config.name}`;

    // 1. Update 3D Landmark
    if (config.landmark) {
      this.city.setLandmark(config.landmark);
    }

    // 2. Update Place cards, turn banners & brand lock-up
    this.ui.updateLocationContent(config);

    // 3. Update voice lines
    if (config.voiceLines) {
      this.audio.setVoiceLines(config.voiceLines);
    }

    // Reset timeline to 0
    this.timeline.seek(0);
    this.audio.resetTriggers();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.updateViewportSize());

    // Play / Pause
    this.btnPlay.addEventListener('click', () => {
      this.audio.ensureContext();
      this.timeline.togglePlay();
      this.updatePlayBtnState();
    });

    // Scrubber drag / input
    this.scrubber.addEventListener('input', (e) => {
      const norm = parseFloat(e.target.value);
      this.audio.ensureContext();
      this.timeline.seekNormalized(norm);
    });

    // Audio mute
    this.btnAudio.addEventListener('click', () => {
      this.audio.ensureContext();
      this.audio.setMuted(!this.audio.isMuted);
      this.btnAudio.classList.toggle('active', !this.audio.isMuted);
      this.btnAudio.innerText = this.audio.isMuted ? '🔇 Audio Off' : '🔊 Audio On';
    });

    // Aspect ratio toggle (16:9 vs 9:16)
    this.btnAspect.addEventListener('click', () => {
      this.aspectMode = this.aspectMode === '16:9' ? '9:16' : '16:9';
      this.btnAspect.innerText = `📐 Aspect: ${this.aspectMode}`;
      const viewport = document.getElementById('studio-viewport');
      viewport.classList.toggle('mode-vertical', this.aspectMode === '9:16');
      this.updateViewportSize();
    });

    // Camera Mode toggle
    this.btnCam.addEventListener('click', () => {
      this.directorCamera.isFreeCam = !this.directorCamera.isFreeCam;
      this.btnCam.innerText = this.directorCamera.isFreeCam ? '🎥 Cam: Free Orbit' : '🎥 Cam: Director (Auto)';
      this.btnCam.classList.toggle('active', !this.directorCamera.isFreeCam);
    });

    // Video Export button
    this.btnExport.addEventListener('click', () => {
      this.startExport();
    });

    // Key shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.audio.ensureContext();
        this.timeline.togglePlay();
        this.updatePlayBtnState();
      }
    });
  }

  updatePlayBtnState() {
    if (this.timeline.isPlaying) {
      this.btnPlay.classList.add('playing');
      this.btnPlayIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    } else {
      this.btnPlay.classList.remove('playing');
      this.btnPlayIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`;
    }
  }

  updateViewportSize() {
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    let targetW, targetH;
    if (this.aspectMode === '16:9') {
      targetW = Math.min(containerWidth, containerHeight * (16 / 9));
      targetH = targetW * (9 / 16);
    } else {
      targetH = Math.min(containerHeight, containerWidth * (16 / 9));
      targetW = targetH * (9 / 16);
    }

    this.renderer.setSize(targetW, targetH, false);
    this.camera.aspect = targetW / targetH;
    this.camera.updateProjectionMatrix();
  }

  seekToTime(t) {
    this.timeline.seek(t);
    this.updateSceneState(t);
    this.renderer.render(this.scene, this.camera);
  }

  updateSceneState(time) {
    this.route.update(time);
    this.weather.update(time, this.city);
    this.directorCamera.update(time);
    this.ui.update(time);
  }

  onTimelineUpdate(time, beat) {
    const norm = time / TOTAL_DURATION;
    this.scrubber.value = norm.toString();

    const secs = Math.floor(time);
    const ms = Math.floor((time - secs) * 100);
    const frame = Math.round(time * 60);
    this.timecodeDisplay.innerText = `00:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')} (Frame ${frame}/1320)`;

    if (beat) {
      this.beatBadge.innerText = `${beat.name} [${beat.start.toFixed(1)}s - ${beat.end.toFixed(1)}s]`;
    }

    this.updateSceneState(time);
    this.recorder.checkTimelineProgress(time, TOTAL_DURATION);
  }

  startExport() {
    this.audio.ensureContext();
    this.exportModal.classList.remove('hidden');
    this.exportStatus.innerText = "Recording 22-second master video at 60 FPS...";

    this.recorder.startRecording(
      (progress) => {
        const pct = Math.round(progress * 100);
        this.exportProgress.style.width = `${pct}%`;
        this.exportStatus.innerText = `Recording: ${pct}% (00:${(progress * TOTAL_DURATION).toFixed(1)}s / 22.0s)`;
      },
      (blob, filename) => {
        this.exportProgress.style.width = `100%`;
        this.exportStatus.innerText = `Complete! Downloaded: ${filename}`;
        setTimeout(() => {
          this.exportModal.classList.add('hidden');
        }, 3000);
      }
    );
  }

  animate(now) {
    requestAnimationFrame(this.animate);

    this.timeline.tick(now);
    this.audio.update(this.timeline.currentTime, this.timeline.isPlaying);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
