// timeline.js - Precision beat sheet timing engine for 22.00-second Google Maps spec ad

export const TOTAL_DURATION = 22.0; // 22 seconds
export const FPS = 60;
export const TOTAL_FRAMES = Math.round(TOTAL_DURATION * FPS); // 1320 frames

export const BEATS = [
  {
    id: 'logo',
    name: 'Logo Reveal',
    start: 0.0,
    end: 1.10,
    description: 'Official multicolour pin on white; compress into tiny blue location dot.'
  },
  {
    id: 'nav',
    name: 'Navigation Dive',
    start: 1.10,
    end: 3.10,
    description: 'Overhead route reveal, then low dive between buildings. Green Rue de Rivoli banner.'
  },
  {
    id: 'bike',
    name: 'Get a Bike',
    start: 3.10,
    end: 5.40,
    description: 'Vélib place card appears. Cycle lanes light green; dot becomes bicycle marker.'
  },
  {
    id: 'rain',
    name: 'Rain Ahead',
    start: 5.40,
    end: 8.80,
    description: 'Rain in 10 min chip. Cool lighting, rain streaks, glossy roads, aerial rise.'
  },
  {
    id: 'arcade',
    name: 'Galerie Vivienne',
    start: 8.80,
    end: 10.70,
    description: 'Dive through glazed arcade: warm arches, patterned floor, blue route connected.'
  },
  {
    id: 'friends',
    name: 'Meet Friends',
    start: 10.70,
    end: 13.30,
    description: 'Exit into daylight; Rue de Beaujolais banner, red-and-white awning, 3 friends.'
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    start: 13.30,
    end: 16.70,
    description: 'Accelerate along Rivoli, rise above green park, Eiffel Tower silhouette, Rooftop card.'
  },
  {
    id: 'arrival',
    name: 'Arrival & Reveal',
    start: 16.70,
    end: 18.80,
    description: 'You have arrived banner. Orbit destination, pullback to luminous floating city tile.'
  },
  {
    id: 'brand',
    name: 'Brand Lock-Up',
    start: 18.80,
    end: 20.30,
    description: 'City tile recedes into deep navy. Pin in soft blue halo with tagline.'
  },
  {
    id: 'endcard',
    name: 'End Card',
    start: 20.30,
    end: 22.00,
    description: 'Fade to small light, reveal @leoreal.ai signature & spec-ad disclaimer.'
  }
];

export class TimelineController {
  constructor(onUpdate) {
    this.currentTime = 0.0;
    this.isPlaying = false;
    this.isMuted = false;
    this.playbackRate = 1.0;
    this.onUpdate = onUpdate || (() => {});
    this.listeners = [];
  }

  getCurrentBeat() {
    const t = this.currentTime;
    return BEATS.find(b => t >= b.start && t < b.end) || BEATS[BEATS.length - 1];
  }

  getBeatProgress(beatId) {
    const beat = BEATS.find(b => b.id === beatId);
    if (!beat) return 0;
    if (this.currentTime < beat.start) return 0;
    if (this.currentTime >= beat.end) return 1;
    return (this.currentTime - beat.start) / (beat.end - beat.start);
  }

  seek(time) {
    this.currentTime = Math.max(0, Math.min(TOTAL_DURATION, time));
    this.notify();
  }

  seekNormalized(norm) {
    this.seek(norm * TOTAL_DURATION);
  }

  play() {
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
  }

  pause() {
    this.isPlaying = false;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentTime >= TOTAL_DURATION - 0.05) {
        this.seek(0);
      }
      this.play();
    }
  }

  tick(now) {
    if (!this.isPlaying) return;
    const delta = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.currentTime += delta * this.playbackRate;
    if (this.currentTime >= TOTAL_DURATION) {
      this.currentTime = TOTAL_DURATION;
      this.isPlaying = false;
    }
    this.notify();
  }

  notify() {
    this.onUpdate(this.currentTime, this.getCurrentBeat());
  }
}

