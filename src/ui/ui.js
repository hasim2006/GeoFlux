// ui.js - Crisp vector overlays, turn banners, place cards, chips, brand lock-up, end card

export class UIManager {
  constructor(container) {
    this.container = container;
    this.createElements();
  }

  createElements() {
    this.uiRoot = document.createElement('div');
    this.uiRoot.className = 'gmaps-ui-layer';
    this.uiRoot.innerHTML = `
      <!-- 0.0 - 1.10s: Starting White Stage & Logo Reveal -->
      <div id="ui-white-stage" class="ui-screen-overlay white-stage active">
        <div class="logo-pin-container" id="initial-logo-pin">
          <img src="assets/google_maps_pin.svg" alt="Google Maps" class="hero-pin-svg" />
        </div>
      </div>

      <!-- 1.10 - 5.40s & 10.70 - 13.30s: Green Turn Banner (Top Left) -->
      <div id="ui-turn-banner" class="ui-panel turn-banner hidden">
        <div class="turn-icon-box">
          <svg viewBox="0 0 24 24" class="turn-arrow-svg">
            <path d="M19 15l-6-6-6 6" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="turn-info">
          <div class="turn-distance" id="turn-distance-text">In 150 m</div>
          <div class="turn-street" id="turn-street-text">Rue de Rivoli</div>
        </div>
      </div>

      <!-- 3.10 - 5.40s: Vélib' Place Card -->
      <div id="ui-card-velib" class="ui-panel place-card hidden">
        <div class="card-header">
          <div class="card-title-group">
            <h3 class="place-title">Vélib’ – Palais-Royal</h3>
            <div class="place-rating">
              <span class="rating-num">4.8</span>
              <span class="stars">★★★★★</span>
              <span class="reviews-count">(342)</span>
            </div>
            <div class="place-subtitle">Bike share station · Place Colette</div>
          </div>
          <div class="place-category-icon">
            <img src="assets/bicycle.svg" alt="Bike" class="cat-icon-svg" />
          </div>
        </div>

        <div class="bike-status-row">
          <div class="bike-pill"><span class="dot green"></span> 14 mechanical</div>
          <div class="bike-pill"><span class="dot blue"></span> 6 e-bikes</div>
        </div>

        <!-- Busy Times Live Histogram -->
        <div class="busy-times-block">
          <div class="busy-label">Popular times · <span class="highlight">Usually not busy</span></div>
          <div class="histogram-bars">
            <div class="bar" style="height: 25%"></div>
            <div class="bar" style="height: 40%"></div>
            <div class="bar" style="height: 60%"></div>
            <div class="bar active" style="height: 35%"></div>
            <div class="bar" style="height: 70%"></div>
            <div class="bar" style="height: 85%"></div>
            <div class="bar" style="height: 50%"></div>
          </div>
        </div>

        <div class="action-chips-row">
          <button class="chip primary">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            Directions
          </button>
          <button class="chip">Start</button>
          <button class="chip">Share</button>
        </div>
      </div>

      <!-- 5.40 - 8.80s: Rain in 10 Min Chip -->
      <div id="ui-chip-rain" class="ui-panel weather-chip hidden">
        <div class="weather-icon">🌧️</div>
        <div class="weather-text">
          <div class="weather-title">Rain in 10 min</div>
          <div class="weather-sub">Dry route recommended</div>
        </div>
      </div>

      <!-- 8.80 - 10.70s: Galerie Vivienne Place Badge -->
      <div id="ui-badge-vivienne" class="ui-panel heritage-badge hidden">
        <div class="heritage-icon">🏛️</div>
        <div class="heritage-info">
          <div class="heritage-name">Galerie Vivienne</div>
          <div class="heritage-meta">Historic Glass Arcade · Est. 1823</div>
        </div>
      </div>

      <!-- 10.70 - 13.30s: 3 Friends Already There Chip -->
      <div id="ui-chip-friends" class="ui-panel friends-chip hidden">
        <div class="avatar-stack">
          <div class="avatar av-1">S</div>
          <div class="avatar av-2">M</div>
          <div class="avatar av-3">C</div>
        </div>
        <div class="friends-info">
          <div class="friends-title">3 friends already there</div>
          <div class="friends-loc">Le Jardin Café · Rue de Beaujolais</div>
        </div>
      </div>

      <!-- 13.30 - 16.70s: Rooftop Rivoli Place Card -->
      <div id="ui-card-rooftop" class="ui-panel place-card hidden">
        <div class="card-header">
          <div class="card-title-group">
            <h3 class="place-title">Rooftop Rivoli</h3>
            <div class="place-rating">
              <span class="rating-num">4.9</span>
              <span class="stars">★★★★★</span>
              <span class="reviews-count">(819)</span>
            </div>
            <div class="place-subtitle">Cocktail lounge · Eiffel Tower view</div>
          </div>
          <div class="golden-tag">Golden Hour 🌅</div>
        </div>
        <div class="rooftop-highlights">
          <span class="badge-tag">Open until 2:00 AM</span>
          <span class="badge-tag">Sunset terrace</span>
        </div>
      </div>

      <!-- 16.70 - 18.80s: You Have Arrived Banner -->
      <div id="ui-banner-arrival" class="ui-panel arrival-banner hidden">
        <div class="arrival-check">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#0F9D58"/>
          </svg>
        </div>
        <div class="arrival-content">
          <div class="arrival-title">You have arrived</div>
          <div class="arrival-subtitle">Rooftop Rivoli · Paris 1er</div>
        </div>
      </div>

      <!-- 18.80 - 20.30s: Brand Lock-Up (Deep Navy Stage) -->
      <div id="ui-stage-brand" class="ui-screen-overlay brand-stage hidden">
        <div class="brand-halo"></div>
        <div class="brand-center">
          <div class="brand-pin-box">
            <img src="assets/google_maps_pin.svg" alt="Google Maps Pin" class="brand-pin-img" />
          </div>
          <h1 class="brand-tagline">Go like you live here.</h1>
        </div>
      </div>

      <!-- 20.30 - 22.00s: Creator End Card -->
      <div id="ui-stage-endcard" class="ui-screen-overlay endcard-stage hidden">
        <div class="endcard-center">
          <div class="light-point"></div>
          <div class="creator-signature">@leoreal.ai</div>
          <div class="signature-line"></div>
          <div class="spec-disclaimer">
            Spec ad. Not affiliated with, sponsored or endorsed by Google LLC.<br>
            Google Maps and the pin logo are trademarks of Google LLC.<br>
            Map data © OpenStreetMap contributors (ODbL).
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.uiRoot);
    this.cacheDomReferences();
  }

  cacheDomReferences() {
    this.elWhiteStage = document.getElementById('ui-white-stage');
    this.elInitialPin = document.getElementById('initial-logo-pin');
    this.elTurnBanner = document.getElementById('ui-turn-banner');
    this.elTurnDist = document.getElementById('turn-distance-text');
    this.elTurnStreet = document.getElementById('turn-street-text');
    this.elCardVelib = document.getElementById('ui-card-velib');
    this.elChipRain = document.getElementById('ui-chip-rain');
    this.elBadgeVivienne = document.getElementById('ui-badge-vivienne');
    this.elChipFriends = document.getElementById('ui-chip-friends');
    this.elCardRooftop = document.getElementById('ui-card-rooftop');
    this.elBannerArrival = document.getElementById('ui-banner-arrival');
    this.elStageBrand = document.getElementById('ui-stage-brand');
    this.elStageEndcard = document.getElementById('ui-stage-endcard');
  }

  updateLocationContent(cfg) {
    this.currentConfig = cfg;
    if (!cfg || !cfg.route) return;

    const r = cfg.route;
    if (this.elTurnStreet) this.elTurnStreet.innerText = r.streetStart;

    // Vélib / Bike card
    const velibTitle = this.elCardVelib.querySelector('.place-title');
    if (velibTitle) velibTitle.innerText = r.bikeStation;
    const velibSub = this.elCardVelib.querySelector('.place-subtitle');
    if (velibSub) velibSub.innerText = r.bikeSub;

    // Passage / Arcade badge
    const passTitle = this.elBadgeVivienne.querySelector('.heritage-name');
    if (passTitle) passTitle.innerText = r.passageName;
    const passSub = this.elBadgeVivienne.querySelector('.heritage-meta');
    if (passSub) passSub.innerText = r.passageSub;

    // Friends chip
    const friendsLoc = this.elChipFriends.querySelector('.friends-loc');
    if (friendsLoc) friendsLoc.innerText = `${r.cafeName} · ${r.streetExit}`;

    // Rooftop card
    const roofTitle = this.elCardRooftop.querySelector('.place-title');
    if (roofTitle) roofTitle.innerText = r.rooftopName;
    const roofSub = this.elCardRooftop.querySelector('.place-subtitle');
    if (roofSub) roofSub.innerText = r.rooftopSub;

    // Arrival banner
    const arrivalSub = this.elBannerArrival.querySelector('.arrival-subtitle');
    if (arrivalSub) arrivalSub.innerText = `${r.rooftopName} · ${cfg.name}`;

    // Brand lockup tagline
    const tagline = this.elStageBrand.querySelector('.brand-tagline');
    if (tagline) tagline.innerText = `Go like you live here.`;
  }

  update(time) {
    // 0.00 - 1.10s: Logo reveal & compression into location dot
    if (time < 1.10) {
      this.elWhiteStage.classList.remove('hidden');
      this.elWhiteStage.classList.add('active');
      const progress = time / 1.10;
      if (progress < 0.7) {
        this.elInitialPin.style.transform = `scale(1)`;
        this.elWhiteStage.style.opacity = '1';
      } else {
        const p2 = (progress - 0.7) / 0.3;
        const scale = 1.0 - p2 * 0.95;
        this.elInitialPin.style.transform = `scale(${scale})`;
        this.elWhiteStage.style.opacity = `${1.0 - p2}`;
      }
    } else {
      this.elWhiteStage.classList.add('hidden');
      this.elWhiteStage.classList.remove('active');
    }

    // Turn Banner (1.10 - 3.10s: Start street; 10.70 - 13.30s: Exit street)
    if (time >= 1.10 && time < 3.10) {
      this.elTurnBanner.classList.remove('hidden');
      this.elTurnDist.innerText = 'In 150 m';
      this.elTurnStreet.innerText = (this.currentConfig && this.currentConfig.route) ? this.currentConfig.route.streetStart : 'Rue de Rivoli';
    } else if (time >= 10.70 && time < 13.30) {
      this.elTurnBanner.classList.remove('hidden');
      this.elTurnDist.innerText = 'Turn right';
      this.elTurnStreet.innerText = (this.currentConfig && this.currentConfig.route) ? this.currentConfig.route.streetExit : 'Rue de Beaujolais';
    } else {
      this.elTurnBanner.classList.add('hidden');
    }

    // 3.10 - 5.40s: Vélib Place Card
    if (time >= 3.10 && time < 5.40) {
      this.elCardVelib.classList.remove('hidden');
    } else {
      this.elCardVelib.classList.add('hidden');
    }

    // 5.40 - 8.80s: Rain in 10 min chip
    if (time >= 5.40 && time < 8.80) {
      this.elChipRain.classList.remove('hidden');
    } else {
      this.elChipRain.classList.add('hidden');
    }

    // 8.80 - 10.70s: Galerie Vivienne badge
    if (time >= 8.80 && time < 10.70) {
      this.elBadgeVivienne.classList.remove('hidden');
    } else {
      this.elBadgeVivienne.classList.add('hidden');
    }

    // 10.70 - 13.30s: 3 Friends chip
    if (time >= 10.70 && time < 13.30) {
      this.elChipFriends.classList.remove('hidden');
    } else {
      this.elChipFriends.classList.add('hidden');
    }

    // 13.30 - 16.70s: Rooftop Rivoli Card
    if (time >= 13.30 && time < 16.70) {
      this.elCardRooftop.classList.remove('hidden');
    } else {
      this.elCardRooftop.classList.add('hidden');
    }

    // 16.70 - 18.80s: You Have Arrived Banner
    if (time >= 16.70 && time < 18.80) {
      this.elBannerArrival.classList.remove('hidden');
    } else {
      this.elBannerArrival.classList.add('hidden');
    }

    // 18.80 - 20.30s: Brand Lock-Up
    if (time >= 18.80 && time < 20.30) {
      this.elStageBrand.classList.remove('hidden');
      const bProgress = (time - 18.80) / (20.30 - 18.80);
      this.elStageBrand.style.opacity = `${Math.min(1.0, bProgress * 2.0)}`;
    } else {
      this.elStageBrand.classList.add('hidden');
    }

    // 20.30 - 22.00s: End Card
    if (time >= 20.30) {
      this.elStageEndcard.classList.remove('hidden');
      const eProgress = (time - 20.30) / (22.00 - 20.30);
      this.elStageEndcard.style.opacity = `${Math.min(1.0, eProgress * 2.5)}`;
    } else {
      this.elStageEndcard.classList.add('hidden');
    }
  }
}

