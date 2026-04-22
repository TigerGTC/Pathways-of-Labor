    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { Line2 }         from 'three/addons/lines/Line2.js';
    import { LineMaterial }  from 'three/addons/lines/LineMaterial.js';
    import { LineGeometry }  from 'three/addons/lines/LineGeometry.js';

    // GDP PER CAPITA — inline World Bank 2024 data (iso3 → USD)
    // 158 countries matched to Natural Earth 110m feature set.
    // Missing countries (sanctioned, disputed, no WB data) render gray.
    // Used as FALLBACK if live WB API fetch fails.
    // ─────────────────────────────────────────────────────────────
    const GDP_PER_CAPITA = {
      "ALB": 11377.78,
      "DZA": 5752.99,
      "AGO": 2665.87,
      "ARG": 13969.78,
      "ARM": 8556.21,
      "AUS": 64603.99,
      "AUT": 58268.88,
      "AZE": 7283.85,
      "BHS": 39455.45,
      "BGD": 2593.42,
      "BLR": 8317.63,
      "BEL": 56614.57,
      "BLZ": 7681.24,
      "BEN": 1485.38,
      "BOL": 4421.17,
      "BIH": 9358.79,
      "BWA": 7695.75,
      "BRA": 10310.55,
      "BRN": 33153.47,
      "BGR": 17596.02,
      "BFA": 981.99,
      "BDI": 219.42,
      "KHM": 2627.88,
      "CMR": 1830.01,
      "CAN": 54340.35,
      "CAF": 516.16,
      "TCD": 961.56,
      "CHL": 16709.89,
      "CHN": 13303.15,
      "COL": 7919.21,
      "COD": 649.38,
      "COG": 2482.25,
      "CRI": 18587.15,
      "CIV": 2727.89,
      "HRV": 24050.44,
      "CYP": 38674.29,
      "CZE": 31823.31,
      "DNK": 71026.48,
      "DJI": 3552.72,
      "DOM": 10875.66,
      "ECU": 6874.71,
      "EGY": 3338.47,
      "SLV": 5579.66,
      "GNQ": 6745.40,
      "EST": 31428.35,
      "SWZ": 3909.56,
      "ETH": 1133.88,
      "FJI": 6425.74,
      "FIN": 53149.77,
      "FRA": 46103.08,
      "GAB": 8230.04,
      "GMB": 871.34,
      "GEO": 9241.49,
      "DEU": 56103.73,
      "GHA": 2390.77,
      "GRC": 24626.15,
      "GTM": 6150.03,
      "GIN": 1694.95,
      "GNB": 1007.74,
      "GUY": 29675.24,
      "HTI": 2142.62,
      "HND": 3426.43,
      "HUN": 23292.33,
      "ISL": 86040.53,
      "IND": 2694.74,
      "IDN": 4925.43,
      "IRN": 5190.17,
      "IRQ": 6073.61,
      "IRL": 112894.95,
      "ISR": 54176.68,
      "ITA": 40385.34,
      "JAM": 7753.80,
      "JPN": 32487.08,
      "JOR": 4618.10,
      "KAZ": 14154.63,
      "KEN": 2132.43,
      "KOR": 36238.64,
      "KWT": 32717.72,
      "KGZ": 2420.19,
      "LAO": 2123.98,
      "LVA": 23409.08,
      "LSO": 971.91,
      "LBR": 851.50,
      "LBY": 6569.16,
      "LTU": 29384.02,
      "LUX": 137781.68,
      "MDG": 544.99,
      "MWI": 522.57,
      "MYS": 11874.43,
      "MLI": 1094.62,
      "MRT": 2110.12,
      "MEX": 14185.78,
      "MDA": 7576.20,
      "MNG": 6750.63,
      "MNE": 13263.33,
      "MAR": 4153.19,
      "MOZ": 656.78,
      "MMR": 1359.05,
      "NAM": 4413.13,
      "NPL": 1447.31,
      "NLD": 67520.42,
      "NCL": 29213.19,
      "NZL": 49205.18,
      "NIC": 2847.54,
      "NER": 735.27,
      "NGA": 1084.16,
      "MKD": 9291.86,
      "NOR": 86785.43,
      "OMN": 20285.23,
      "PAK": 1478.77,
      "PAN": 19161.22,
      "PNG": 3006.71,
      "PRY": 6416.10,
      "PER": 8452.37,
      "PHL": 3984.83,
      "POL": 25103.57,
      "PRT": 29292.24,
      "PRI": 39343.72,
      "QAT": 76688.69,
      "ROU": 20080.21,
      "RUS": 14889.02,
      "RWA": 999.65,
      "SAU": 35121.66,
      "SEN": 1773.22,
      "SRB": 13679.21,
      "SLE": 806.65,
      "SVK": 25992.67,
      "SVN": 34301.03,
      "SLB": 1933.56,
      "SOM": 629.54,
      "ZAF": 6267.19,
      "ESP": 35326.77,
      "LKA": 4515.57,
      "SDN": 984.61,
      "SUR": 6961.79,
      "SWE": 57117.49,
      "CHE": 103998.19,
      "TJK": 1341.20,
      "TZA": 1186.72,
      "THA": 7346.62,
      "TLS": 1331.97,
      "TGO": 1119.38,
      "TTO": 18733.41,
      "TUN": 4181.14,
      "TUR": 15892.72,
      "TKM": 6856.66,
      "UGA": 1077.91,
      "UKR": 5389.47,
      "ARE": 50273.51,
      "GBR": 53246.37,
      "USA": 84534.04,
      "URY": 23906.51,
      "UZB": 3161.70,
      "VUT": 3410.77,
      "VEN": 4217.59,
      "VNM": 4717.29,
      "ZMB": 1187.11,
      "ZWE": 2497.20
    };

    // ─────────────────────────────────────────────────────────────
    // SOURCE REGISTRY — Chicago-style citations for all data used
    // ─────────────────────────────────────────────────────────────
    const SOURCES = {
      'WB-GDP-2024':    { short: 'WB',       full: 'World Bank. "GDP per capita (current US$)." World Development Indicators, 2024.', url: 'https://data.worldbank.org/indicator/NY.GDP.PCAP.CD' },
      'REST-COUNTRIES': { short: 'RestC',    full: 'REST Countries API v3.1 (country metadata).',                                       url: 'https://restcountries.com' },
      'ILO-2021':       { short: 'ILO',      full: 'International Labour Organization. ILO Global Estimates on International Migrant Workers, 3rd ed. Geneva: ILO, 2021.', url: 'https://ilo.org' },
      'ILO-EST':        { short: 'ILO est.', full: 'International Labour Organization, corridor-level estimates.',                      url: 'https://ilo.org' },
      'POEA-2019':      { short: 'POEA',     full: 'Philippine Overseas Employment Administration. 2019 Overseas Employment Statistics. Manila, 2020.', url: 'https://www.dmw.gov.ph' },
      'BMET-2019':      { short: 'BMET',     full: 'Bureau of Manpower, Employment and Training (Bangladesh). Overseas Employment and Remittances Data 2019. Dhaka, 2020.', url: 'https://www.bmet.gov.bd' },
      'DOFE-2019':      { short: 'DoFE',     full: 'Department of Foreign Employment (Nepal). Labor Migration for Employment: A Status Report 2019/20. Kathmandu, 2020.', url: 'https://dofe.gov.np' },
      'SLBFE-2019':     { short: 'SLBFE',    full: 'Sri Lanka Bureau of Foreign Employment. Annual Statistical Report 2019. Colombo, 2020.', url: 'https://www.slbfe.lk' },
      'EUROSTAT-2020':  { short: 'Eurostat', full: 'Eurostat. Migration and Migrant Population Statistics. Luxembourg, 2021.',           url: 'https://ec.europa.eu/eurostat' },
      'GCC-STAT-2019':  { short: 'GCC-Stat', full: 'Statistical Centre for the Cooperation Council for the Arab Countries of the Gulf. Labor Market Statistics 2019. Riyadh, 2020.', url: 'https://gccstat.org' },
    };

    function resolveSource(raw) {
      const t = (raw || '').toLowerCase();
      if (t.includes('poea'))       return 'POEA-2019';
      if (t.includes('bmet'))       return 'BMET-2019';
      if (t.includes('dofe'))       return 'DOFE-2019';
      if (t.includes('slbfe'))      return 'SLBFE-2019';
      if (t.includes('eurostat'))   return 'EUROSTAT-2020';
      if (t.includes('gcc'))        return 'GCC-STAT-2019';
      if (t.includes('ilo est'))    return 'ILO-EST';
      if (t.includes('ilo'))        return 'ILO-2021';
      return null;
    }

    function srcTag(id) {
      const s = SOURCES[id];
      return s ? ' (' + s.short + ')' : '';
    }

    // ─────────────────────────────────────────────────────────────
    // SECTOR NARRATIVES — editable; used in arc click popup
    // ─────────────────────────────────────────────────────────────
    const SECTOR_NARRATIVES = {
      'Construction':  'Workers build, finish, and service large-scale infrastructure and housing projects. Contracts are typically project-tied and end with completion of the build phase.',
      'Domestic Work': 'Workers provide household services — cleaning, childcare, elder care, cooking — usually under live-in arrangements. The sector is disproportionately female and historically excluded from core labor protections.',
      'Agriculture':   'Workers harvest crops, tend livestock, or run greenhouse operations on a seasonal cycle. Employment is short-cycle and closely tied to growing seasons and weather.',
      'Care':          'Workers assist elderly or disabled clients in private homes or care facilities. Demand is driven by aging populations in destination economies.',
      'Manufacturing': 'Workers staff assembly lines producing textiles, electronics, and export goods. Hours are regimented and shift-based; wages are often piece- or output-tied.',
      'Hospitality':   'Workers staff hotels, restaurants, and tourist services. Seasonality and language/service requirements shape the corridor and contract terms.',
      'Mining':        'Workers engage in extraction of coal, minerals, or precious metals — physically demanding work frequently far from destination cities.',
    };

    // ─────────────────────────────────────────────────────────────
    // LIVE API FETCHES — WB GDP + REST Countries
    // ─────────────────────────────────────────────────────────────
    async function fetchWorldBankGDP() {
      const url = 'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&date=2024&per_page=400';
      const r = await fetch(url);
      if (!r.ok) throw new Error('WB API HTTP ' + r.status);
      const body = await r.json();
      const rows = Array.isArray(body) && body.length >= 2 ? body[1] : [];
      const map = {};
      for (const row of rows) {
        const iso3 = row.countryiso3code;
        if (iso3 && row.value != null) map[iso3] = row.value;
      }
      return map;
    }

    async function fetchCountryMeta() {
      const url = 'https://restcountries.com/v3.1/all?fields=cca3,name,population,region,subregion,capital,currencies,languages';
      const r = await fetch(url);
      if (!r.ok) throw new Error('RestCountries HTTP ' + r.status);
      const rows = await r.json();
      const map = {};
      for (const c of rows) {
        if (!c.cca3) continue;
        map[c.cca3] = {
          name: c.name && (c.name.common || c.name.official) || c.cca3,
          population: c.population,
          region: c.region,
          subregion: c.subregion,
          capital: Array.isArray(c.capital) ? c.capital[0] : c.capital,
          currencies: c.currencies ? Object.keys(c.currencies) : [],
          languages: c.languages ? Object.values(c.languages) : [],
        };
      }
      return map;
    }

    // ─────────────────────────────────────────────────────────────
    // 1. DATA PARSER
    // ─────────────────────────────────────────────────────────────
    async function loadMigrationData() {
      const resp = await fetch('data/migration-data.txt');
      const text = resp.ok ? await resp.text() : '';
      const lines = text.split('\n');

      let mode = null;
      const corridors = [];
      const regions = [];
      const sources = [];
      let definitionText = '';
      let definitionSource = '';
      let outflowText = '';
      let destText = '';
      let headerParsed = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Section detection
        if (trimmed.startsWith('## Corridors')) { mode = 'corridors'; headerParsed = false; continue; }
        if (trimmed.startsWith('## Regional Volumes')) { mode = 'regions'; headerParsed = false; continue; }
        if (trimmed.startsWith('## Sources')) { mode = 'sources'; continue; }
        if (trimmed.startsWith('## Migrant Worker')) { mode = 'definition'; continue; }
        if (trimmed.startsWith('## Outflow Country')) { mode = 'outflow'; continue; }
        if (trimmed.startsWith('## Destination Country')) { mode = 'destination'; continue; }
        if (trimmed.startsWith('## ') && mode !== null) { mode = null; continue; }

        if (mode === 'corridors') {
          if (!headerParsed) {
            if (trimmed.includes('Origin City')) { headerParsed = true; }
            continue;
          }
          if (trimmed.startsWith('|---') || trimmed === '') continue;
          if (!trimmed.startsWith('|')) continue;

          const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 0);
          if (cells.length < 12) continue;
          const parsed = cells.filter(c => c !== '');
          if (parsed.length < 12) continue;

          corridors.push({
            originCity:    parsed[0],
            originCountry: parsed[1],
            originLat:     parseFloat(parsed[2]),
            originLng:     parseFloat(parsed[3]),
            destCity:      parsed[4],
            destCountry:   parsed[5],
            destLat:       parseFloat(parsed[6]),
            destLng:       parseFloat(parsed[7]),
            volume:        parseInt(parsed[8], 10),
            year:          parseInt(parsed[9], 10),
            sector:        parsed[10],
            source:        parsed[11],
          });
        }

        if (mode === 'regions') {
          if (!headerParsed) {
            if (trimmed.includes('Region')) { headerParsed = true; }
            continue;
          }
          if (trimmed.startsWith('|---') || trimmed === '') continue;
          if (!trimmed.startsWith('|')) continue;

          const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx) => idx > 0);
          const parsed = cells.filter(c => c !== '');
          if (parsed.length < 3) continue;

          regions.push({
            region:  parsed[0],
            workers: parseFloat(parsed[1]),
            year:    parseInt(parsed[2], 10),
          });
        }

        if (mode === 'sources') {
          const match = trimmed.match(/^(\d+)\.\s+(.+)$/);
          if (match) {
            sources.push(match[2]);
          }
        }

        if (mode === 'definition') {
          if (trimmed.startsWith('>')) {
            definitionText = trimmed.slice(1).trim();
          } else if (/^source:/i.test(trimmed)) {
            definitionSource = trimmed.replace(/^source:\s*/i, '').trim();
          }
        }

        if (mode === 'outflow') {
          if (trimmed.startsWith('>')) outflowText = trimmed.slice(1).trim();
          continue;
        }

        if (mode === 'destination') {
          if (trimmed.startsWith('>')) destText = trimmed.slice(1).trim();
          continue;
        }
      }

      return { corridors, regions, sources, definition: { text: definitionText, source: definitionSource }, outflow: outflowText, destination: destText };
    }

    // ─────────────────────────────────────────────────────────────
    // 2. polar2Cartesian — aligned to Three.js SphereGeometry UV convention
    //    u=0 at lng=-180, u=0.5 at lng=0 (Prime Meridian) → +X axis
    //    (lat=0,lng=0) → (r,0,0)  (lat=90,lng=*) → (0,r,0)
    // ─────────────────────────────────────────────────────────────
    function polar2Cartesian(lat, lng, altitude, radius) {
      const phi   = (90 - lat) * (Math.PI / 180);       // polar angle from +Y
      const theta = (lng + 180) * (Math.PI / 180);      // azimuth, aligned to Three.js SphereGeometry
      const r = radius * (1 + altitude);
      return new THREE.Vector3(
        -r * Math.cos(theta) * Math.sin(phi),           // sign flip + cos/sin swap matches Three.js
         r * Math.cos(phi),
         r * Math.sin(theta) * Math.sin(phi)
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 3. geoInterpolate — inlined SLERP, no d3 dependency
    //    Returns function(t) -> [lat, lng] for t in [0,1]
    // ─────────────────────────────────────────────────────────────
    function geoInterpolate(lat1, lng1, lat2, lng2) {
      const toRad = Math.PI / 180;
      const toDeg = 180 / Math.PI;
      const phi1 = lat1 * toRad, phi2 = lat2 * toRad;
      const lam1 = lng1 * toRad, lam2 = lng2 * toRad;

      const cosLat1 = Math.cos(phi1), sinLat1 = Math.sin(phi1);
      const cosLat2 = Math.cos(phi2), sinLat2 = Math.sin(phi2);
      const cosLng1 = Math.cos(lam1), sinLng1 = Math.sin(lam1);
      const cosLng2 = Math.cos(lam2), sinLng2 = Math.sin(lam2);

      // Cartesian unit vectors
      const x1 = cosLat1 * cosLng1, y1 = cosLat1 * sinLng1, z1 = sinLat1;
      const x2 = cosLat2 * cosLng2, y2 = cosLat2 * sinLng2, z2 = sinLat2;

      const dot = Math.min(1, Math.max(-1, x1*x2 + y1*y2 + z1*z2));
      const omega = Math.acos(dot);
      const sinOmega = Math.sin(omega);

      return function(t) {
        if (sinOmega < 1e-10) return [lat1, lng1];
        const a = Math.sin((1 - t) * omega) / sinOmega;
        const b = Math.sin(t * omega) / sinOmega;
        const x = a * x1 + b * x2;
        const y = a * y1 + b * y2;
        const z = a * z1 + b * z2;
        return [
          Math.atan2(z, Math.sqrt(x*x + y*y)) * toDeg,
          Math.atan2(y, x) * toDeg
        ];
      };
    }

    // ─────────────────────────────────────────────────────────────
    // 4. GDP color helpers
    // ─────────────────────────────────────────────────────────────

    // Three-stop palette: dark (low) → cyan-700 (mid) → amber-400 (high)
    const GDP_PALETTE = [
      { r: 0x1e, g: 0x29, b: 0x3b },  // t=0: slate-800
      { r: 0x0e, g: 0x74, b: 0x90 },  // t=0.5: cyan-700
      { r: 0xfb, g: 0xbf, b: 0x24 },  // t=1: amber-400
    ];
    const GDP_NO_DATA_HEX = 0x475569;  // slate-600

    function gdpToColor(gdp) {
      if (gdp == null) return GDP_NO_DATA_HEX;
      const t = Math.min(1, Math.max(0,
        (Math.log(gdp) - Math.log(500)) / (Math.log(120000) - Math.log(500))
      ));
      let r, g, b;
      if (t <= 0.5) {
        const s = t / 0.5;
        r = Math.round(GDP_PALETTE[0].r + s * (GDP_PALETTE[1].r - GDP_PALETTE[0].r));
        g = Math.round(GDP_PALETTE[0].g + s * (GDP_PALETTE[1].g - GDP_PALETTE[0].g));
        b = Math.round(GDP_PALETTE[0].b + s * (GDP_PALETTE[1].b - GDP_PALETTE[0].b));
      } else {
        const s = (t - 0.5) / 0.5;
        r = Math.round(GDP_PALETTE[1].r + s * (GDP_PALETTE[2].r - GDP_PALETTE[1].r));
        g = Math.round(GDP_PALETTE[1].g + s * (GDP_PALETTE[2].g - GDP_PALETTE[1].g));
        b = Math.round(GDP_PALETTE[1].b + s * (GDP_PALETTE[2].b - GDP_PALETTE[1].b));
      }
      return (r << 16) | (g << 8) | b;
    }

    // ── Module-scope helpers ──────────────────────────────────────
    function brightenHex(hex, factor) {
      const r = Math.min(255, Math.round(((hex >> 16) & 0xff) * factor));
      const g = Math.min(255, Math.round(((hex >>  8) & 0xff) * factor));
      const b = Math.min(255, Math.round(( hex        & 0xff) * factor));
      return (r << 16) | (g << 8) | b;
    }

    function pickLabelFill(hex) {
      const h = hex.replace('#', '');
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum > 0.55 ? '#0f172a' : '#fef3c7';
    }

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // ─────────────────────────────────────────────────────────────
    // 5. Globe CLASS
    // ─────────────────────────────────────────────────────────────
    const GLOBE_RADIUS = 100;
    const ATMOSPHERE_RADIUS = 103;
    const AMBER = new THREE.Color(0xfbbf24);

    class Globe {
      #renderer = null;
      #scene = null;
      #camera = null;
      #controls = null;
      #globeMesh = null;
      #atmosphereMesh = null;
      #pointMeshes = [];
      #arcMeshes = [];
      #borderMeshes = [];
      #countryMeshes = [];
      #countryGroup = new Map();
      #raycaster = new THREE.Raycaster();
      #mouse = new THREE.Vector2(-9999, -9999);
      #frameId = null;
      #tooltip = null;
      #container = null;
      #startTime = Date.now();
      #lastClientX = 0;
      #lastClientY = 0;
      #hoveredIso3 = null;
      #dragging = false;
      #zooming = false;
      #zoomTimer = null;
      #downX = 0;
      #downY = 0;
      #downTime = 0;
      #downButton = -1;
      #priorAutoRotate;
      #interactive = true;

      // Public click callbacks — set by bootstrap after construction
      onArcClick = null;
      onCountryClick = null;

      constructor(container) {
        this.#container = container;
        this.#tooltip = document.getElementById('globeTooltip');

        // Clear loading placeholder
        container.innerHTML = '';

        // Renderer — GOTCHA #3 context: SRGBColorSpace set in setTexture
        this.#renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.#renderer.setPixelRatio(window.devicePixelRatio);
        this.#renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.#renderer.domElement);

        // Scene
        this.#scene = new THREE.Scene();

        // Camera
        this.#camera = new THREE.PerspectiveCamera(
          45, container.clientWidth / container.clientHeight, 0.1, 1000
        );
        this.#camera.position.set(0, 0, 300);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.#scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 50, 50);
        this.#scene.add(dirLight);

        // Globe sphere — texture loaded in setTexture()
        const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 32);
        const sphereMat = new THREE.MeshPhongMaterial({ color: 0x1a2a4a, shininess: 5 });
        this.#globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
        this.#globeMesh.renderOrder = 0;
        this.#scene.add(this.#globeMesh);

        // OrbitControls
        this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
        this.#controls.enableDamping = true;
        this.#controls.dampingFactor = 0.08;
        this.#controls.minDistance = 150;
        this.#controls.maxDistance = 500;
        this.#controls.autoRotate = true;
        this.#controls.autoRotateSpeed = 0.3;
        this.#controls.enablePan = false;
        this.#controls.addEventListener('start', () => {
          this.#dragging = true;
          this.#hideTooltip();
          this.#clearCountryHover();
        });
        this.#controls.addEventListener('end', () => {
          this.#dragging = false;
        });
        this.#renderer.domElement.addEventListener('wheel', () => {
          this.#zooming = true;
          if (this.#zoomTimer) clearTimeout(this.#zoomTimer);
          this.#zoomTimer = setTimeout(() => { this.#zooming = false; }, 180);
        }, { passive: true });

        // Atmosphere glow — GOTCHA #5: added AFTER globe sphere, with renderOrder=2 and depthWrite=false
        const atmGeo = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 64, 32);
        const atmMat = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              intensity = clamp(intensity, 0.0, 1.0);
              gl_FragColor = vec4(0.5, 0.7, 1.0, 1.0) * intensity;
            }
          `,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,  // GOTCHA #5: do not write to depth buffer
        });
        this.#atmosphereMesh = new THREE.Mesh(atmGeo, atmMat);
        this.#atmosphereMesh.renderOrder = 2;  // GOTCHA #5: render AFTER arcs (renderOrder=1)
        this.#scene.add(this.#atmosphereMesh);

        // Resize + pointer listeners — handlers are arrow-function fields, already this-bound.
        // (Do NOT rebind: private methods are non-writable per spec and assignment throws in Safari.)
        window.addEventListener('resize', this.#onResize);
        this.#renderer.domElement.addEventListener('pointermove', this.#onPointerMove);
        this.#renderer.domElement.addEventListener('pointerdown', this.#onPointerDown);
        this.#renderer.domElement.addEventListener('pointerup', this.#onPointerUp);
        this.#renderer.domElement.addEventListener('pointercancel', this.#onPointerCancel);
        this.#renderer.domElement.addEventListener('pointerleave', this.#onPointerCancel);
      }

      // ── setTexture ──────────────────────────────────────────────
      // GOTCHA #3: must set texture.colorSpace = THREE.SRGBColorSpace
      setTexture(url) {
        const loader = new THREE.TextureLoader();
        loader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;  // GOTCHA #3
            this.#globeMesh.material.map = texture;
            this.#globeMesh.material.color.set(0xffffff);
            this.#globeMesh.material.needsUpdate = true;
          },
          undefined,
          (err) => {
            console.warn('Globe texture failed to load:', url, err);
            // Graceful fallback: keep the dark blue sphere
          }
        );
      }

      // ── setCountries ────────────────────────────────────────────
      // Triangulates country polygons and adds per-country choropleth meshes to scene.
      // Uses earcut (global from CDN) for triangulation.
      // All countries flat at COUNTRY_BASE_ALTITUDE. extraAlt > 0 flags origin/outflow
      // countries — used only to pick opacity (0.92 vs 0.68), not to extrude geometry.
      setCountries(geojson, gdpMap, outflowScore) {
        // Dispose previous per-country meshes
        this.#hoveredIso3 = null;
        for (const m of this.#countryMeshes) {
          m.geometry.dispose();
          m.material.dispose();
          this.#scene.remove(m);
        }
        this.#countryMeshes = [];
        this.#countryGroup = new Map();

        if (typeof earcut === 'undefined') {
          console.warn('earcut not available — country choropleth skipped');
          return;
        }

        const COUNTRY_BASE_ALTITUDE = 0.012;
        const MAX_SEGMENT_DEG = 1.5;  // border edges; interior covered by subdivideTriangles

        // Subdivide a ring of [lng, lat] pairs so no segment exceeds MAX_SEGMENT_DEG
        function subdivideRing(ring) {
          const out = [];
          for (let i = 0; i < ring.length; i++) {
            const a = ring[i];
            const b = ring[(i + 1) % ring.length];
            out.push(a);
            const dLat = b[1] - a[1];
            const dLng = b[0] - a[0];
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist > MAX_SEGMENT_DEG) {
              const steps = Math.ceil(dist / MAX_SEGMENT_DEG);
              for (let s = 1; s < steps; s++) {
                const frac = s / steps;
                out.push([a[0] + frac * dLng, a[1] + frac * dLat]);
              }
            }
          }
          return out;
        }

        // Recursively split triangles whose longest edge exceeds maxEdge degrees.
        // verts is a mutable flat [lng, lat, ...] array extended in place.
        function subdivideTriangles(verts, indices, maxEdge) {
          const out = [];
          const stack = [];
          for (let i = 0; i < indices.length; i += 3) stack.push([indices[i], indices[i+1], indices[i+2]]);
          while (stack.length) {
            const [a, b, c] = stack.pop();
            const ax=verts[a*2], ay=verts[a*2+1];
            const bx=verts[b*2], by=verts[b*2+1];
            const cx=verts[c*2], cy=verts[c*2+1];
            const eAB=Math.hypot(bx-ax,by-ay), eBC=Math.hypot(cx-bx,cy-by), eCA=Math.hypot(ax-cx,ay-cy);
            const maxE=Math.max(eAB,eBC,eCA);
            if (maxE <= maxEdge) { out.push(a,b,c); continue; }
            let m;
            if (eAB>=eBC && eAB>=eCA) { m=verts.length/2; verts.push((ax+bx)/2,(ay+by)/2); stack.push([a,m,c]); stack.push([m,b,c]); }
            else if (eBC>=eCA)        { m=verts.length/2; verts.push((bx+cx)/2,(by+cy)/2); stack.push([b,m,a]); stack.push([m,c,a]); }
            else                      { m=verts.length/2; verts.push((cx+ax)/2,(cy+ay)/2); stack.push([c,m,b]); stack.push([m,a,b]); }
          }
          return out;
        }

        // Build a ready THREE.Mesh for a single top-face polygon.
        // Returns a mesh or null on failure.
        function buildTopFaceMesh(rings, color, name, gdp, altitude) {
          // rings[0] = outer ring, rings[1..] = holes
          const subdivided = rings.map(r => subdivideRing(r));

          const flatCoords = [];
          const holeIndices = [];

          for (let ri = 0; ri < subdivided.length; ri++) {
            if (ri > 0) holeIndices.push(flatCoords.length / 2);
            for (const [lng, lat] of subdivided[ri]) {
              flatCoords.push(lng, lat);
            }
          }

          let rawIdx;
          try {
            rawIdx = earcut(flatCoords, holeIndices.length > 0 ? holeIndices : null, 2);
          } catch (e) {
            console.warn('earcut failed for', name, e);
            return null;
          }

          if (!rawIdx || rawIdx.length === 0) return null;

          const subdividedIdx = subdivideTriangles(flatCoords, rawIdx, 1.2);
          if (!subdividedIdx || subdividedIdx.length === 0) return null;

          const totalVerts = flatCoords.length / 2;
          const posArray = new Float32Array(totalVerts * 3);
          for (let vi = 0; vi < totalVerts; vi++) {
            const lng = flatCoords[vi * 2];
            const lat = flatCoords[vi * 2 + 1];
            const pos = polar2Cartesian(lat, lng, altitude, GLOBE_RADIUS);
            posArray[vi * 3]     = pos.x;
            posArray[vi * 3 + 1] = pos.y;
            posArray[vi * 3 + 2] = pos.z;
          }

          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
          geo.setIndex(subdividedIdx);

          const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.68,   // overwritten per-mesh below based on isOrigin
            side: THREE.DoubleSide,
            depthWrite: false,
          });

          return new THREE.Mesh(geo, mat);
        }

        // Build side-wall quads between baseAltitude and topAltitude for a single outer ring.
        function buildSideWallMesh(outerRing, color, baseAltitude, topAltitude) {
          const ring = subdivideRing(outerRing);
          const n = ring.length;
          if (n < 2) return null;

          const positions = [];

          for (let i = 0; i < n; i++) {
            const [lngA, latA] = ring[i];
            const [lngB, latB] = ring[(i + 1) % n];

            const bA = polar2Cartesian(latA, lngA, baseAltitude, GLOBE_RADIUS);
            const bB = polar2Cartesian(latB, lngB, baseAltitude, GLOBE_RADIUS);
            const tA = polar2Cartesian(latA, lngA, topAltitude, GLOBE_RADIUS);
            const tB = polar2Cartesian(latB, lngB, topAltitude, GLOBE_RADIUS);

            // Triangle 1: bottomA, bottomB, topB
            positions.push(bA.x, bA.y, bA.z, bB.x, bB.y, bB.z, tB.x, tB.y, tB.z);
            // Triangle 2: bottomA, topB, topA
            positions.push(bA.x, bA.y, bA.z, tB.x, tB.y, tB.z, tA.x, tA.y, tA.z);
          }

          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

          const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide,
            depthWrite: true,
          });

          return new THREE.Mesh(geo, mat);
        }

        const MAX_SCORE = 500;
        const scores = outflowScore || {};

        for (const feature of geojson.features) {
          const props = feature.properties;
          const iso3 = props.ADM0_A3 || '';
          const name = props.ADMIN || props.NAME || iso3;
          const gdp = gdpMap[iso3] ?? null;
          const color = gdpToColor(gdp);

          const score = scores[iso3] || 0;
          const extraAlt = Math.min(score, MAX_SCORE) / MAX_SCORE * 0.08;
          const isOrigin = extraAlt > 0;
          const topAltitude = COUNTRY_BASE_ALTITUDE + extraAlt;

          const geom = feature.geometry;
          if (!geom) continue;

          const polygons = geom.type === 'Polygon'
            ? [geom.coordinates]
            : geom.type === 'MultiPolygon'
            ? geom.coordinates
            : [];

          if (polygons.length === 0) continue;

          for (const rings of polygons) {
            if (!rings || rings.length === 0) continue;
            const mesh = buildTopFaceMesh(rings, color, name, gdp, topAltitude);
            if (!mesh) continue;

            mesh.material.opacity = isOrigin ? 0.92 : 0.68;
            mesh.renderOrder = 0;
            mesh.userData = { type: 'country', label: name, gdp: gdp ?? null, iso3 };
            this.#scene.add(mesh);
            this.#countryMeshes.push(mesh);

            if (!this.#countryGroup.has(iso3)) this.#countryGroup.set(iso3, []);
            this.#countryGroup.get(iso3).push(mesh);

            if (isOrigin && rings[0]) {
              const wallMesh = buildSideWallMesh(rings[0], color, COUNTRY_BASE_ALTITUDE, topAltitude);
              if (wallMesh) {
                wallMesh.renderOrder = 0;
                wallMesh.userData = { type: 'country', label: name, gdp: gdp ?? null, iso3 };
                this.#scene.add(wallMesh);
                this.#countryMeshes.push(wallMesh);
                this.#countryGroup.get(iso3).push(wallMesh);
              }
            }
          }
        }

        console.log(`[Globe] per-country meshes: ${this.#countryMeshes.length}`);
        return this.#countryMeshes.length;
      }

      // ── setCountryBorders ──── dashed = sending; solid = receiving ───
      setCountryBorders(geojson, originIso3Set, destIso3Set) {
        for (const m of this.#borderMeshes) {
          m.geometry.dispose();
          m.material.dispose();
          this.#scene.remove(m);
        }
        this.#borderMeshes = [];

        const BORDER_ALTITUDE = 0.015;
        const AMBER_HEX = 0xfbbf24;
        const MAX_SEGMENT_DEG = 1.5;

        function subdivideRing(ring) {
          const out = [];
          for (let i = 0; i < ring.length; i++) {
            const a = ring[i];
            const b = ring[(i + 1) % ring.length];
            out.push(a);
            const dLat = b[1] - a[1];
            const dLng = b[0] - a[0];
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist > MAX_SEGMENT_DEG) {
              const steps = Math.ceil(dist / MAX_SEGMENT_DEG);
              for (let s = 1; s < steps; s++) {
                const frac = s / steps;
                out.push([a[0] + frac * dLng, a[1] + frac * dLat]);
              }
            }
          }
          return out;
        }

        for (const feature of geojson.features) {
          const props = feature.properties;
          const iso3 = props.ADM0_A3 || '';
          let isSolid = false;
          let isDashed = false;
          if (originIso3Set.has(iso3)) {
            isDashed = true;
          } else if (destIso3Set.has(iso3)) {
            isSolid = true;
          } else {
            continue;
          }

          const geom = feature.geometry;
          if (!geom) continue;

          const polygons = geom.type === 'Polygon'
            ? [geom.coordinates]
            : geom.type === 'MultiPolygon'
            ? geom.coordinates
            : [];

          for (const rings of polygons) {
            if (!rings || rings.length === 0) continue;
            const outerRing = rings[0];
            if (!outerRing || outerRing.length < 3) continue;

            const subdivided = subdivideRing(outerRing);
            const pts = [];
            for (const [lng, lat] of subdivided) {
              const pos = polar2Cartesian(lat, lng, BORDER_ALTITUDE, GLOBE_RADIUS);
              pts.push(pos.x, pos.y, pos.z);
            }
            // Close the ring
            const first = subdivided[0];
            const fp = polar2Cartesian(first[1], first[0], BORDER_ALTITUDE, GLOBE_RADIUS);
            pts.push(fp.x, fp.y, fp.z);

            const lineGeo = new LineGeometry();
            lineGeo.setPositions(pts);

            const rendererSize = this.#renderer.getSize(new THREE.Vector2());
            const mat = new LineMaterial({
              color: AMBER_HEX,
              transparent: true,
              opacity: 0.9,
              linewidth: isSolid ? 2.5 : 3.0,  // pixels; dashed needs a touch more for visual parity
              worldUnits: false,
              dashed: isDashed,
              dashSize: 1.4,
              gapSize: 0.9,
              dashScale: 1,
              alphaToCoverage: false,
            });
            mat.resolution.set(rendererSize.x, rendererSize.y);

            const line = new Line2(lineGeo, mat);
            if (isDashed) line.computeLineDistances();
            line.renderOrder = 1;
            line.userData = { type: 'border', iso3, birthOffset: Math.random() * Math.PI * 2 };
            this.#scene.add(line);
            this.#borderMeshes.push(line);
          }
        }

        console.log(`[Globe] border meshes: ${this.#borderMeshes.length}`);
        return this.#borderMeshes.length;
      }

      // ── setPoints ───────────────────────────────────────────────
      setPoints(points) {
        for (const m of this.#pointMeshes) {
          m.geometry.dispose();
          m.material.dispose();
          this.#scene.remove(m);
        }
        this.#pointMeshes = [];

        for (const pt of points) {
          const height = (pt.volume / 200000) + 3.0;
          const geo = new THREE.CylinderGeometry(0.9, 0.9, height, 10);
          const mat = new THREE.MeshLambertMaterial({ color: AMBER });
          const mesh = new THREE.Mesh(geo, mat);

          const pos = polar2Cartesian(pt.lat, pt.lng, 0, GLOBE_RADIUS);
          const surfacePos = polar2Cartesian(pt.lat, pt.lng, height / (2 * GLOBE_RADIUS), GLOBE_RADIUS);
          mesh.position.copy(surfacePos);

          const normal = pos.clone().normalize();
          const up = new THREE.Vector3(0, 1, 0);
          const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
          mesh.quaternion.copy(quaternion);

          mesh.renderOrder = 1;
          mesh.userData = { type: 'point', label: pt.label, volume: pt.volume };
          this.#scene.add(mesh);
          this.#pointMeshes.push(mesh);
        }
        return this.#pointMeshes.length;
      }

      // ── setArcs ─────────────────────────────────────────────────
      setArcs(arcs) {
        for (const m of this.#arcMeshes) {
          m.geometry.dispose();
          m.material.dispose();
          this.#scene.remove(m);
        }
        this.#arcMeshes = [];

        for (const arc of arcs) {
          const { startLat, startLng, endLat, endLng, volume, label, corridor } = arc;

          // GOTCHA #4: altitude scales with angular distance to avoid clipping for long routes
          const lat1r = startLat * Math.PI / 180;
          const lat2r = endLat   * Math.PI / 180;
          const lng1r = startLng * Math.PI / 180;
          const lng2r = endLng   * Math.PI / 180;
          const dotProd = Math.sin(lat1r)*Math.sin(lat2r) + Math.cos(lat1r)*Math.cos(lat2r)*Math.cos(lng2r - lng1r);
          const angularDist = Math.acos(Math.min(1, Math.max(-1, dotProd)));
          const maxAlt = 0.1 + 0.4 * (angularDist / Math.PI);  // GOTCHA #4

          const N = 60;
          const interpolate = geoInterpolate(startLat, startLng, endLat, endLng);
          const waypoints = [];
          for (let i = 0; i <= N; i++) {
            const t = i / N;
            const [wLat, wLng] = interpolate(t);
            const arcAlt = maxAlt * 4 * t * (1 - t);
            waypoints.push(polar2Cartesian(wLat, wLng, arcAlt, GLOBE_RADIUS));
          }

          // GOTCHA #1: TubeGeometry, NOT THREE.Line (linewidth > 1 broken on Windows/Linux)
          const curve = new THREE.CatmullRomCurve3(waypoints);
          const tubeRadius = 0.45 + volume / 600000;
          const geo = new THREE.TubeGeometry(curve, 60, tubeRadius, 8, false);  // GOTCHA #1
          const mat = new THREE.MeshBasicMaterial({
            color: AMBER,
            transparent: true,
            opacity: 0.75,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.renderOrder = 1;  // GOTCHA #5: arcs at renderOrder=1, atmosphere at 2
          mesh.userData = {
            type: 'arc',
            label,
            volume,
            corridor,   // full corridor object for click popup
            birthOffset: Math.random() * Math.PI * 2,
          };
          this.#scene.add(mesh);
          this.#arcMeshes.push(mesh);
        }
        return this.#arcMeshes.length;
      }

      // ── toggleAutoRotate ────────────────────────────────────────
      toggleAutoRotate() {
        this.#controls.autoRotate = !this.#controls.autoRotate;
      }

      // ── overview sheet helpers ───────────────────────────────────
      _cameraDistance() { return this.#camera.position.length(); }

      // ── zoomOutTo ───────────────────────────────────────────────
      // Smoothly scale the camera's radial distance from current → target.
      // Preserves the auto-rotate orientation (operates along camera.position's direction).
      zoomOutTo(targetDist, durationMs = 1200) {
        const startDist = this.#camera.position.length();
        const delta     = targetDist - startDist;
        if (Math.abs(delta) < 0.5) return;  // already close enough, no-op
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const t0 = performance.now();
        const step = () => {
          const p = Math.min(1, (performance.now() - t0) / durationMs);
          const d = startDist + delta * easeOutCubic(p);
          this.#camera.position.setLength(d);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }

      setInteractive(on) {
        if (!on) {
          // Cache prior auto-rotate only on the transition from enabled→disabled
          if (this.#controls.enabled) {
            this.#priorAutoRotate = this.#controls.autoRotate;
          }
          this.#controls.enabled = false;
          this.#controls.autoRotate = false;
          this.#interactive = false;
          this.#clearCountryHover();
          this.#hideTooltip();
        } else {
          this.#controls.enabled = true;
          // Restore prior rotation state if we have one cached
          if (this.#priorAutoRotate !== undefined) {
            this.#controls.autoRotate = this.#priorAutoRotate;
            this.#priorAutoRotate = undefined;
          }
          this.#interactive = true;
        }
      }

      // ── start / stop / destroy ──────────────────────────────────
      start() {
        this.#animate();
      }

      stop() {
        if (this.#frameId !== null) {
          cancelAnimationFrame(this.#frameId);
          this.#frameId = null;
        }
      }

      destroy() {
        this.stop();
        window.removeEventListener('resize', this.#onResize);
        this.#renderer.domElement.removeEventListener('pointermove', this.#onPointerMove);
        this.#renderer.domElement.removeEventListener('pointerdown', this.#onPointerDown);
        this.#renderer.domElement.removeEventListener('pointerup', this.#onPointerUp);
        this.#renderer.domElement.removeEventListener('pointercancel', this.#onPointerCancel);
        this.#renderer.domElement.removeEventListener('pointerleave', this.#onPointerCancel);

        for (const m of [...this.#arcMeshes, ...this.#pointMeshes, ...this.#countryMeshes, ...this.#borderMeshes]) {
          m.geometry.dispose();
          m.material.dispose();
          this.#scene.remove(m);
        }
        if (this.#globeMesh) {
          this.#globeMesh.geometry.dispose();
          this.#globeMesh.material.dispose();
          if (this.#globeMesh.material.map) this.#globeMesh.material.map.dispose();
        }
        if (this.#atmosphereMesh) {
          this.#atmosphereMesh.geometry.dispose();
          this.#atmosphereMesh.material.dispose();
        }
        this.#renderer.dispose();
        this.#container.removeChild(this.#renderer.domElement);
        this.#renderer = null;
        this.#scene = null;
        this.#camera = null;
        this.#controls = null;
      }

      // ── private: animation loop ──────────────────────────────────
      #animate() {
        this.#frameId = requestAnimationFrame(() => this.#animate());
        this.#controls.update();

        // Sin-opacity pulse for arc meshes
        const elapsed = (Date.now() - this.#startTime) / 1000;
        for (const m of this.#arcMeshes) {
          const offset = m.userData.birthOffset || 0;
          m.material.opacity = Math.sin(elapsed * 2 + offset) * 0.3 + 0.7;
        }

        // Same sin pulse as arcs
        for (const m of this.#borderMeshes) {
          const offset = m.userData.birthOffset || 0;
          m.material.opacity = Math.sin(elapsed * 2 + offset) * 0.3 + 0.7;
        }

        if (this.#interactive && !this.#dragging && !this.#zooming) this.#raycast();

        this.#renderer.render(this.#scene, this.#camera);
      }

      // ── private: resize handler (arrow field → auto-bound, writable) ──
      #onResize = () => {
        const w = this.#container.clientWidth;
        const h = this.#container.clientHeight;
        this.#camera.aspect = w / h;
        this.#camera.updateProjectionMatrix();
        this.#renderer.setSize(w, h);
        for (const m of this.#borderMeshes) {
          if (m.material && m.material.resolution) m.material.resolution.set(w, h);
        }
      };

      // ── private: pointer move (arrow field → auto-bound, writable) ──
      #onPointerMove = (event) => {
        const rect = this.#renderer.domElement.getBoundingClientRect();
        this.#mouse.x =  ((event.clientX - rect.left)  / rect.width)  * 2 - 1;
        this.#mouse.y = -((event.clientY - rect.top)   / rect.height) * 2 + 1;
        this.#lastClientX = event.clientX;
        this.#lastClientY = event.clientY;
      };

      // ── private: pointer down — record start state only (no raycasting) ──
      #onPointerDown = (event) => {
        if (event.button !== 0) return;
        this.#downX = event.clientX;
        this.#downY = event.clientY;
        this.#downTime = performance.now();
        this.#downButton = 0;
      };

      // ── private: pointer cancel/leave — reset tap state ──
      #onPointerCancel = () => {
        this.#downButton = -1;
      };

      // ── private: pointer up — tap-vs-drag test, then arc/country dispatch ──
      #onPointerUp = (event) => {
        if (this.#downButton !== 0) return;
        this.#downButton = -1;

        const dx = event.clientX - this.#downX;
        const dy = event.clientY - this.#downY;
        const distSq = dx * dx + dy * dy;
        const dt = performance.now() - this.#downTime;

        // Tap = short press (< 350 ms) with tiny movement (< 6 px).
        // Anything larger is a drag — don't fire click.
        if (distSq > 36 || dt > 350) return;

        const rect = this.#renderer.domElement.getBoundingClientRect();
        const mx =  ((event.clientX - rect.left)  / rect.width)  * 2 - 1;
        const my = -((event.clientY - rect.top)   / rect.height) * 2 + 1;

        const clickRay = new THREE.Raycaster();
        clickRay.setFromCamera(new THREE.Vector2(mx, my), this.#camera);

        // Arcs have priority
        const arcHits = clickRay.intersectObjects(this.#arcMeshes, false);
        if (arcHits.length > 0) {
          const ud = arcHits[0].object.userData;
          if (this.onArcClick) this.onArcClick(ud);
          return;
        }

        // Country click — globe-occluder filter
        const candidates = [this.#globeMesh, ...this.#countryMeshes];
        const clickHits = clickRay.intersectObjects(candidates, false);
        const firstCountry = clickHits.find(h => h.object !== this.#globeMesh);
        const firstGlobe   = clickHits.find(h => h.object === this.#globeMesh);
        const countryOccluded = firstCountry && firstGlobe && firstGlobe.distance < firstCountry.distance;
        if (firstCountry && !countryOccluded) {
          const ud = firstCountry.object.userData;
          if (this.onCountryClick) this.onCountryClick(ud);
          return;
        }

        // Click on empty globe — dismiss panel
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) infoPanel.style.display = 'none';
      };

      // ── private: country hover helpers ──────────────────────────
      #applyCountryHover(iso3) {
        const group = this.#countryGroup.get(iso3);
        if (!group || !group.length) return;
        for (const m of group) {
          const ud = m.userData;
          if (ud.__origColor === undefined) ud.__origColor = m.material.color.getHex();
          m.material.color.setHex(brightenHex(ud.__origColor, 1.35));
          if (m.material.emissive) m.material.emissive.setHex(0x3a2a08);
        }
      }

      #clearCountryHover() {
        if (!this.#hoveredIso3) return;
        const group = this.#countryGroup.get(this.#hoveredIso3);
        if (group) {
          for (const m of group) {
            const ud = m.userData;
            if (ud.__origColor !== undefined) m.material.color.setHex(ud.__origColor);
            if (m.material.emissive) m.material.emissive.setHex(0x000000);
          }
        }
        this.#hoveredIso3 = null;
      }

      // ── private: raycast ────────────────────────────────────────
      // Precedence: arc > point > country (arcs are smallest hit targets)
      #raycast() {
        if (!this.#camera) return;
        this.#raycaster.setFromCamera(this.#mouse, this.#camera);

        // Check arcs and points first (higher priority)
        const primaryObjects = [...this.#arcMeshes, ...this.#pointMeshes];
        const primaryHits = this.#raycaster.intersectObjects(primaryObjects, false);

        if (primaryHits.length > 0) {
          const hit = primaryHits[0].object;
          const ud = hit.userData;
          if (ud && ud.label) {
            const srcId = ud.corridor ? resolveSource(ud.corridor.source) : 'ILO-EST';
            this.#showTooltip(ud.type, ud.label, ud.volume, null, srcTag(srcId));
          }
          // Restore any country hover when over arc/point
          this.#clearCountryHover();
          return;
        }

        // Country hover — globe-occluder filter on per-country meshes
        const candidates = [this.#globeMesh, ...this.#countryMeshes];
        const hits = this.#raycaster.intersectObjects(candidates, false);
        const firstCountry = hits.find(h => h.object !== this.#globeMesh);
        const firstGlobe   = hits.find(h => h.object === this.#globeMesh);
        const countryOccluded = firstCountry && firstGlobe && firstGlobe.distance < firstCountry.distance;

        if (firstCountry && !countryOccluded) {
          const hit = firstCountry.object;
          const ud = hit.userData;
          const newIso3 = ud.iso3 || null;
          if (newIso3 !== this.#hoveredIso3) {
            this.#clearCountryHover();
            if (newIso3) {
              this.#applyCountryHover(newIso3);
              this.#hoveredIso3 = newIso3;
            }
          }
          if (ud && ud.label) {
            this.#showTooltip('country', ud.label, null, ud.gdp, srcTag('WB-GDP-2024'));
          }
          return;
        }

        // No country hit — clear hover, hide tooltip
        this.#clearCountryHover();
        this.#hideTooltip();
      }

      // ── private: tooltip ────────────────────────────────────────
      // type: 'arc' | 'point' | 'country'
      // Never innerHTML with data — createElement + textContent only
      #showTooltip(type, label, volume, gdp, sourceSuffix) {
        if (!this.#tooltip) return;
        const x = this.#lastClientX || 0;
        const y = this.#lastClientY || 0;
        this.#tooltip.style.display = 'block';
        this.#tooltip.style.transform = `translate(${x + 15}px, ${y + 15}px)`;

        this.#tooltip.textContent = '';

        const labelNode = document.createElement('div');
        labelNode.style.fontWeight = 'bold';
        labelNode.textContent = label;
        this.#tooltip.appendChild(labelNode);

        if (type === 'arc' || type === 'point') {
          if (volume !== undefined && volume !== null) {
            const volNode = document.createElement('div');
            volNode.style.fontSize = '0.75rem';
            volNode.style.color = '#94a3b8';
            volNode.textContent = Number(volume).toLocaleString() + ' workers/year' + (sourceSuffix || '');
            this.#tooltip.appendChild(volNode);
          }
        } else if (type === 'country') {
          const gdpNode = document.createElement('div');
          gdpNode.style.fontSize = '0.75rem';
          gdpNode.style.color = '#94a3b8';
          if (gdp !== null && gdp !== undefined) {
            gdpNode.textContent = 'GDP per capita: $' + Number(gdp).toLocaleString(undefined, { maximumFractionDigits: 0 }) + (sourceSuffix || '');
          } else {
            gdpNode.textContent = 'GDP per capita: unavailable';
          }
          this.#tooltip.appendChild(gdpNode);
        }
      }

      #hideTooltip() {
        if (this.#tooltip) this.#tooltip.style.display = 'none';
      }

      // ── getCountryColor — public ──────────────────────────────────
      // Returns an SVG hex string for the named country, or null.
      #_countryColorCache = new Map();
      static #_ALIAS = {
        'UAE':          'United Arab Emirates',
        'USA':          'United States of America',
        'UK':           'United Kingdom',
        'South Korea':  'South Korea',
        'Taiwan':       'Taiwan',
        'DR Congo':     'Dem. Rep. Congo',
        'Czechia':      'Czech Republic',
        'Saudi Arabia': 'Saudi Arabia',
        'Qatar':        'Qatar',
        'Kuwait':       'Kuwait',
        'Philippines':  'Philippines',
        'Bangladesh':   'Bangladesh',
        'India':        'India',
        'Nepal':        'Nepal',
        'Sri Lanka':    'Sri Lanka',
        'Mexico':       'Mexico',
        'Guatemala':    'Guatemala',
        'El Salvador':  'El Salvador',
        'Poland':       'Poland',
        'Romania':      'Romania',
        'Ukraine':      'Ukraine',
        'Indonesia':    'Indonesia',
        'Myanmar':      'Myanmar',
        'Vietnam':      'Vietnam',
        'Zimbabwe':     'Zimbabwe',
        'Ethiopia':     'Ethiopia',
        'Venezuela':    'Venezuela',
        'Colombia':     'Colombia',
        'Peru':         'Peru',
        'Chile':        'Chile',
        'Italy':        'Italy',
        'Malaysia':     'Malaysia',
        'Thailand':     'Thailand',
        'South Africa': 'South Africa',
      };

      getCountryColor(name) {
        if (this.#_countryColorCache.has(name)) return this.#_countryColorCache.get(name);
        const canonical = Globe.#_ALIAS[name] || name;
        for (const m of this.#countryMeshes) {
          const ud = m.userData;
          if (ud.label === canonical || ud.label === name) {
            const hex = ud.__origColor !== undefined ? ud.__origColor : m.material.color.getHex();
            const result = '#' + hex.toString(16).padStart(6, '0');
            this.#_countryColorCache.set(name, result);
            return result;
          }
        }
        this.#_countryColorCache.set(name, null);
        return null;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 6. DATA HELPERS — build points and arcs arrays from corridors
    // ─────────────────────────────────────────────────────────────
    function buildPointsFromCorridors(corridors) {
      const seen = new Map();
      for (const c of corridors) {
        const originKey = c.originCity + ',' + c.originCountry;
        if (!seen.has(originKey)) {
          seen.set(originKey, {
            lat: c.originLat,
            lng: c.originLng,
            label: c.originCity + ', ' + c.originCountry,
            volume: c.volume,
          });
        } else {
          seen.get(originKey).volume += c.volume;
        }

        const destKey = c.destCity + ',' + c.destCountry;
        if (!seen.has(destKey)) {
          seen.set(destKey, {
            lat: c.destLat,
            lng: c.destLng,
            label: c.destCity + ', ' + c.destCountry,
            volume: c.volume,
          });
        } else {
          seen.get(destKey).volume += c.volume;
        }
      }
      return Array.from(seen.values());
    }

    function buildArcsFromCorridors(corridors) {
      return corridors.map(c => ({
        startLat:  c.originLat,
        startLng:  c.originLng,
        endLat:    c.destLat,
        endLng:    c.destLng,
        volume:    c.volume,
        label:     c.originCity + ' → ' + c.destCity + '\n' + c.sector + ' · ' + c.year,
        corridor:  c,   // full corridor object stored for click popup
      }));
    }

    // ─────────────────────────────────────────────────────────────
    // 7. ORIGIN OUTFLOW — name→ISO3 map + score builder
    // ─────────────────────────────────────────────────────────────
    const ORIGIN_NAME_TO_ISO3 = {
      'Philippines':'PHL', 'Bangladesh':'BGD', 'India':'IND', 'Nepal':'NPL',
      'Sri Lanka':'LKA', 'Mexico':'MEX', 'Guatemala':'GTM', 'El Salvador':'SLV',
      'Poland':'POL', 'Romania':'ROU', 'Ukraine':'UKR', 'Indonesia':'IDN',
      'Myanmar':'MMR', 'Vietnam':'VNM', 'Zimbabwe':'ZWE', 'Ethiopia':'ETH',
      'Venezuela':'VEN', 'Peru':'PER',
    };

    const DEST_NAME_TO_ISO3 = {
      'Saudi Arabia':'SAU', 'UAE':'ARE', 'Qatar':'QAT', 'Kuwait':'KWT',
      'USA':'USA',
      'UK':'GBR', 'Italy':'ITA', 'Poland':'POL',
      'Malaysia':'MYS', 'Thailand':'THA', 'Taiwan':'TWN',
      'South Africa':'ZAF',
      'Colombia':'COL', 'Chile':'CHL',
    };

    function buildOriginOutflow(corridors, gdpMap) {
      const volumeByIso3 = {};
      for (const c of corridors) {
        const iso3 = ORIGIN_NAME_TO_ISO3[c.originCountry];
        if (!iso3) continue;
        volumeByIso3[iso3] = (volumeByIso3[iso3] || 0) + c.volume;
      }
      const scoreByIso3 = {};
      for (const iso3 in volumeByIso3) {
        const gdp = gdpMap[iso3];
        if (!gdp || gdp <= 0) continue;
        scoreByIso3[iso3] = volumeByIso3[iso3] / gdp;   // outflow pressure
      }
      console.log('outflowScore:', scoreByIso3);
      return scoreByIso3;
    }

    // ─────────────────────────────────────────────────────────────
    // INFO PANEL HELPERS — createElement-only, never innerHTML with data
    // ─────────────────────────────────────────────────────────────

    // Module-scope countryMeta ref — populated during bootstrap from REST Countries API
    let _gdpLive = false;
    let _countryMeta = {};
    // All corridors — for per-country inflow/outflow totals
    let _allCorridors = [];

    function openInfoPanel(buildFn) {
      const panel = document.getElementById('infoPanel');
      const body  = document.getElementById('infoBody');
      if (!panel || !body) return;
      body.textContent = '';
      buildFn(body);
      panel.style.display = 'block';
    }

    function closeInfoPanel() {
      const panel = document.getElementById('infoPanel');
      if (panel) panel.style.display = 'none';
    }

    function makeSection(parent, heading) {
      const h4 = document.createElement('h4');
      h4.textContent = heading;
      parent.appendChild(h4);
    }

    function makePara(parent, text, isSrc) {
      const p = document.createElement('p');
      if (isSrc) p.className = 'src';
      p.textContent = text;
      parent.appendChild(p);
      return p;
    }

    function makeLink(parent, text, url) {
      const a = document.createElement('a');
      a.textContent = text;
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      parent.appendChild(a);
    }

    function showArcInfo(userData) {
      const c = userData.corridor;
      if (!c) return;

      openInfoPanel((body) => {
        // Title: originCity → destCity
        const h3 = document.createElement('h3');
        h3.textContent = c.originCity + ' → ' + c.destCity;
        body.appendChild(h3);

        // Subtitle: country pair
        const sub = document.createElement('p');
        sub.style.color = '#64748b';
        sub.style.fontSize = '0.78rem';
        sub.style.marginTop = '-0.25rem';
        sub.textContent = c.originCountry + ' → ' + c.destCountry;
        body.appendChild(sub);

        // Sector
        makeSection(body, 'Sector');
        const narrative = SECTOR_NARRATIVES[c.sector];
        makePara(body, c.sector + (narrative ? '' : ''), false);
        if (narrative) makePara(body, narrative, false);

        // Volume
        makeSection(body, 'Volume');
        const srcId = resolveSource(c.source);
        makePara(body, Number(c.volume).toLocaleString() + ' workers/year' + srcTag(srcId), false);

        // Year
        makeSection(body, 'Year');
        makePara(body, String(c.year) + srcTag(srcId), false);

        // Source
        makeSection(body, 'Source');
        const s = SOURCES[srcId];
        if (s) {
          const sp = document.createElement('p');
          sp.className = 'src';
          sp.textContent = s.full + ' ';
          const a = document.createElement('a');
          a.textContent = '[link]';
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          sp.appendChild(a);
          body.appendChild(sp);
        }
      });
    }

    function showCountryInfo(userData) {
      const iso3 = userData.iso3 || '';
      const meta = _countryMeta[iso3] || null;
      const displayName = (meta && meta.name) || userData.label || iso3;

      // Determine sending/receiving role from corridors
      let outflow = 0, inflow = 0;
      const outSrcs = new Set(), inSrcs = new Set();
      for (const c of _allCorridors) {
        const oIso = ORIGIN_NAME_TO_ISO3[c.originCountry] || '';
        const dIso = ORIGIN_NAME_TO_ISO3[c.destCountry]   || '';
        if (oIso === iso3 || c.originCountry === displayName || c.originCountry === userData.label) {
          outflow += c.volume;
          outSrcs.add(resolveSource(c.source));
        }
        if (dIso === iso3 || c.destCountry === displayName || c.destCountry === userData.label) {
          inflow += c.volume;
          inSrcs.add(resolveSource(c.source));
        }
      }
      const role = (outflow > 0 && inflow > 0) ? 'sending · receiving'
                 : outflow > 0 ? 'sending'
                 : inflow  > 0 ? 'receiving'
                 : '';

      openInfoPanel((body) => {
        const h3 = document.createElement('h3');
        h3.textContent = displayName;
        body.appendChild(h3);

        if (role) {
          const sub = document.createElement('p');
          sub.style.color = '#64748b';
          sub.style.fontSize = '0.78rem';
          sub.style.marginTop = '-0.25rem';
          sub.textContent = role;
          body.appendChild(sub);
        }

        // GDP per capita
        makeSection(body, 'GDP per capita');
        const gdp = userData.gdp;
        const gdpLabel = gdp != null
          ? '$' + Number(gdp).toLocaleString(undefined, { maximumFractionDigits: 0 }) + (_gdpLive ? ' (WB)' : ' (WB [fallback])')
          : 'No data';
        makePara(body, gdpLabel, false);

        if (meta) {
          // Region / Subregion
          if (meta.region || meta.subregion) {
            makeSection(body, 'Region / Subregion');
            makePara(body, [meta.region, meta.subregion].filter(Boolean).join(' / ') + srcTag('REST-COUNTRIES'), false);
          }

          // Population
          if (meta.population) {
            makeSection(body, 'Population');
            makePara(body, Number(meta.population).toLocaleString() + srcTag('REST-COUNTRIES'), false);
          }

          // Capital
          if (meta.capital) {
            makeSection(body, 'Capital');
            makePara(body, meta.capital + srcTag('REST-COUNTRIES'), false);
          }
        }

        // Outflow / Inflow
        if (outflow > 0 || inflow > 0) {
          makeSection(body, 'Outflow / Inflow');
          if (outflow > 0) {
            const outSrcStr = Array.from(outSrcs).map(id => srcTag(id)).join('');
            makePara(body, 'Outflow: ' + Number(outflow).toLocaleString() + ' workers/year' + outSrcStr, false);
          }
          if (inflow > 0) {
            const inSrcStr = Array.from(inSrcs).map(id => srcTag(id)).join('');
            makePara(body, 'Inflow: ' + Number(inflow).toLocaleString() + ' workers/year' + inSrcStr, false);
          }
        }

        // Sources used
        const usedSrcIds = new Set(['WB-GDP-2024']);
        if (meta) usedSrcIds.add('REST-COUNTRIES');
        for (const id of [...outSrcs, ...inSrcs]) usedSrcIds.add(id);

        makeSection(body, 'Sources');
        for (const id of usedSrcIds) {
          const s = SOURCES[id];
          if (!s) continue;
          const sp = document.createElement('p');
          sp.className = 'src';
          sp.textContent = s.full + ' ';
          const a = document.createElement('a');
          a.textContent = '[link]';
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          sp.appendChild(a);
          body.appendChild(sp);
        }
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 8. BOOTSTRAP — immediate fullscreen init, no launch button
    // ─────────────────────────────────────────────────────────────
    document.body.dataset.moduleStarted = 'true';  // proves the module parsed + ran

    (async () => {
      try {
        const globeContainer = document.getElementById('globeContainer');
        if (!globeContainer) throw new Error('#globeContainer not found in DOM');

        // Parallel fetch: migration data, geojson, live GDP (fallback on fail), country metadata
        const [migrationData, countriesGeo, wbGdp, countryMeta] = await Promise.all([
          loadMigrationData(),
          fetch('data/countries-110m.json').then(r => r.json()),
          fetchWorldBankGDP().catch(e => { console.warn('WB fetch failed, using fallback', e); return null; }),
          fetchCountryMeta().catch(e => { console.warn('RestCountries fetch failed', e); return {}; }),
        ]);

        // Use live GDP if available, otherwise fallback to hardcoded const
        const gdpMap = wbGdp || GDP_PER_CAPITA;
        _gdpLive = wbGdp !== null;
        _countryMeta = countryMeta || {};
        _allCorridors = migrationData.corridors;

        const globe = new Globe(globeContainer);
        globe.setTexture('assets/night-earth-web.jpg');

        const outflowScore  = buildOriginOutflow(migrationData.corridors, gdpMap);
        const countryCount  = countriesGeo ? globe.setCountries(countriesGeo, gdpMap, outflowScore) : 0;
        const originIso3Set = new Set(Object.values(ORIGIN_NAME_TO_ISO3));
        const destIso3Set   = new Set(Object.values(DEST_NAME_TO_ISO3));
        if (countriesGeo) globe.setCountryBorders(countriesGeo, originIso3Set, destIso3Set);
        const arcs          = buildArcsFromCorridors(migrationData.corridors);
        const arcCount      = globe.setArcs(arcs);

        // Wire click callbacks
        globe.onArcClick     = (ud) => showArcInfo(ud);
        globe.onCountryClick = (ud) => showCountryInfo(ud);

        globe.start();

        // ── Intro sequencer — typewriter → line slide → dot → globe roll → handoff ──
        let introDone = false;
        const introOverlay     = document.getElementById('introOverlay');
        const introTextEl      = document.getElementById('introText');
        const introQuestionEl  = document.getElementById('introQuestion');
        const introPathEl      = document.getElementById('introPath');
        const introDotEl       = document.getElementById('introDot');
        const globeContainerEl = document.getElementById('globeContainer');
        const gdpLegendEl      = document.getElementById('gdpLegend');

        globe.setInteractive(false);

        const introQuestion      = 'How do migrant workers move around the world?';
        const introTypeDelay     = 55;
        const introHoldAfterType = 700;
        const introLineSlideMs   = 1000;
        const introHoldAfterLine = 280;
        const introDotFadeMs     = 320;
        const introHoldAfterDot  = 260;
        const introRollMs        = 4800;
        const introFadeTailMs    = 520;

        let introCharIdx = 0;
        const introType = () => {
          if (introCharIdx <= introQuestion.length) {
            introTextEl.textContent = introQuestion.slice(0, introCharIdx);
            introCharIdx++;
            setTimeout(introType, introTypeDelay);
          } else {
            setTimeout(introSlideLine, introHoldAfterType);
          }
        };

        const introSlideLine = () => {
          introPathEl.classList.add('slide-in');
          setTimeout(introShowDot, introLineSlideMs + introHoldAfterLine);
        };

        const introShowDot = () => {
          introDotEl.classList.add('show');
          setTimeout(introRoll, introDotFadeMs + introHoldAfterDot);
        };

        const introRoll = () => {
          globeContainerEl.classList.add('rolling');
          introQuestionEl.classList.add('push');
          setTimeout(() => {
            introPathEl.classList.add('fade-out');
          }, introRollMs);
          setTimeout(introFinish, introRollMs + introFadeTailMs);
        };

        const introFinish = () => {
          globeContainerEl.style.transition = 'none';
          globeContainerEl.style.transform  = 'translateX(0) rotate(0deg)';
          globeContainerEl.style.opacity    = '1';
          globeContainerEl.style.pointerEvents = 'auto';
          void globeContainerEl.offsetWidth;
          globeContainerEl.style.transition = '';
          introOverlay.classList.add('done');
          gdpLegendEl.classList.add('ready');
          document.getElementById('scrollHint')?.classList.add('ready');
          globe.setInteractive(true);
          introDone = true;
          globe.zoomOutTo(380, 1200);
        };

        setTimeout(introType, 350);

        // ── Overview Sheet: aggregation + pie charts + reveal ─────

        const formatVol = (n) => {
          if (n >= 1_000_000) return (n / 1e6).toFixed(1) + 'M';
          if (n >= 1_000) return Math.round(n / 1e3) + 'k';
          return n.toLocaleString();
        };

        const buildAggregation = (corridors, key, partnerKey) => {
          const map = new Map();
          for (const c of corridors) {
            const country = c[key];
            const partner = c[partnerKey];
            const vol = Number(c.volume) || 0;
            if (!map.has(country)) map.set(country, { total: 0, partners: new Map() });
            const entry = map.get(country);
            entry.total += vol;
            entry.partners.set(partner, (entry.partners.get(partner) || 0) + vol);
          }
          // Convert partner Maps to sorted arrays
          for (const entry of map.values()) {
            entry.partners = [...entry.partners.entries()]
              .map(([name, volume]) => ({ name, volume }))
              .sort((a, b) => b.volume - a.volume);
          }
          return map;
        };

        const topSlices = (agg, n = 8) => {
          const sorted = [...agg.entries()].sort((a, b) => b[1].total - a[1].total);
          const top = sorted.slice(0, n);
          const rest = sorted.slice(n);
          const slices = top.map(([name, d]) => ({ name, total: d.total, partners: d.partners }));
          if (rest.length) {
            slices.push({ name: 'Other', total: rest.reduce((s, [, d]) => s + d.total, 0), partners: [] });
          }
          return slices;
        };

        // PIE_PALETTE removed — slices now use globe.getCountryColor()

        const renderPie = (svgEl, slices, tooltip, direction, pieOffset) => {
          const total = slices.reduce((s, sl) => s + sl.total, 0);
          if (total === 0) return;
          const R = 100;
          let startAngle = -Math.PI / 2;

          // Outer wrapper — transform stays scale(1), per-slice groups drive the reveal
          const scaleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          scaleG.setAttribute('class', 'pie-scale');
          scaleG.setAttribute('transform', 'scale(1)');

          const pieOff = pieOffset || 0;

          for (let i = 0; i < slices.length; i++) {
            const sl = slices[i];
            const fraction = sl.total / total;
            const angle = fraction * 2 * Math.PI;
            const endAngle = startAngle + angle;
            const midAngle = startAngle + angle / 2;
            const color = sl.name === 'Other' ? '#475569' : (globe.getCountryColor(sl.name) || '#475569');

            // Per-slice wrapper for staggered reveal animation
            const sliceG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            sliceG.setAttribute('class', 'slice-wrap');
            sliceG._sliceIdx = i;
            sliceG._sliceCount = slices.length;
            sliceG.setAttribute('transform', 'rotate(-35) scale(0.2)');
            sliceG.style.opacity = '0';

            let pathEl;
            if (Math.abs(angle - 2 * Math.PI) < 0.0001) {
              // Full circle — SVG arc breaks at exactly 360deg
              pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              pathEl.setAttribute('cx', '0');
              pathEl.setAttribute('cy', '0');
              pathEl.setAttribute('r', String(R));
            } else {
              const x1 = R * Math.cos(startAngle), y1 = R * Math.sin(startAngle);
              const x2 = R * Math.cos(endAngle),   y2 = R * Math.sin(endAngle);
              const largeArc = angle > Math.PI ? 1 : 0;
              pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              pathEl.setAttribute('d', `M 0 0 L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`);
            }
            pathEl.setAttribute('fill', color);
            pathEl.classList.add('pie-slice');

            const topPartners = sl.partners.slice(0, 3);
            pathEl.addEventListener('pointerenter', (e) => {
              pathEl.classList.add('hover');
              let html = `<strong>${sl.name}</strong><div class="vol">${formatVol(sl.total)}</div>`;
              if (topPartners.length) {
                html += `<ul>${topPartners.map(p => `<li>&rarr; ${p.name} &middot; ${formatVol(p.volume)}</li>`).join('')}</ul>`;
              }
              tooltip.innerHTML = html;
              tooltip.style.display = 'block';
              positionTooltip(e, tooltip);
            });
            pathEl.addEventListener('pointermove', (e) => positionTooltip(e, tooltip));
            pathEl.addEventListener('pointerleave', () => {
              pathEl.classList.remove('hover');
              tooltip.style.display = 'none';
            });

            sliceG.appendChild(pathEl);

            // External labels with radial leader lines — shows the full country name, no truncation
            if (fraction >= 0.015) {
              const outerR = R * 1.04;     // leader tick start, just outside the arc
              const labelR = R * 1.16;     // where text anchors sit
              const cx = Math.cos(midAngle);
              const sy = Math.sin(midAngle);
              const isRight = cx >= 0;
              const ox = outerR * cx;
              const oy = outerR * sy;
              const lx = labelR * cx;
              const ly = labelR * sy;

              // Subtle radial tick connecting the slice edge to the label
              const leader = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              leader.setAttribute('x1', ox.toFixed(2));
              leader.setAttribute('y1', oy.toFixed(2));
              leader.setAttribute('x2', lx.toFixed(2));
              leader.setAttribute('y2', ly.toFixed(2));
              leader.setAttribute('stroke', 'rgba(226,232,240,0.35)');
              leader.setAttribute('stroke-width', '0.7');
              leader.setAttribute('pointer-events', 'none');
              sliceG.appendChild(leader);

              const anchor = isRight ? 'start' : 'end';
              const textX  = lx + (isRight ? 2.5 : -2.5);

              // Country name — full, never truncated
              const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              nameEl.setAttribute('x', textX.toFixed(2));
              nameEl.setAttribute('y', (ly - 1.5).toFixed(2));
              nameEl.setAttribute('text-anchor', anchor);
              nameEl.setAttribute('dominant-baseline', 'alphabetic');
              nameEl.setAttribute('font-size', '9');
              nameEl.setAttribute('font-family', 'system-ui, sans-serif');
              nameEl.setAttribute('font-weight', '600');
              nameEl.setAttribute('letter-spacing', '0.01em');
              nameEl.setAttribute('pointer-events', 'none');
              nameEl.setAttribute('fill', '#e8edf3');
              nameEl.textContent = sl.name;
              sliceG.appendChild(nameEl);

              // Percentage — secondary typographic weight
              const pct = fraction >= 0.1 ? (fraction * 100).toFixed(0) : (fraction * 100).toFixed(1);
              const pctEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              pctEl.setAttribute('x', textX.toFixed(2));
              pctEl.setAttribute('y', (ly + 8).toFixed(2));
              pctEl.setAttribute('text-anchor', anchor);
              pctEl.setAttribute('dominant-baseline', 'alphabetic');
              pctEl.setAttribute('font-size', '7.5');
              pctEl.setAttribute('font-family', 'system-ui, sans-serif');
              pctEl.setAttribute('font-weight', '400');
              pctEl.setAttribute('pointer-events', 'none');
              pctEl.setAttribute('fill', '#94a3b8');
              pctEl.textContent = pct + '%';
              sliceG.appendChild(pctEl);
            }

            scaleG.appendChild(sliceG);
            startAngle = endAngle;
          }

          svgEl.appendChild(scaleG);
          return scaleG;
        };

        const positionTooltip = (e, tooltip) => {
          const tw = 300;
          const left = e.clientX + tw > window.innerWidth ? e.clientX - tw - 8 : e.clientX + 16;
          tooltip.style.left = left + 'px';
          tooltip.style.top  = (e.clientY + 12) + 'px';
        };

        // Build + render pies
        const destAgg = buildAggregation(_allCorridors, 'destCountry', 'originCountry');
        const origAgg = buildAggregation(_allCorridors, 'originCountry', 'destCountry');
        const destSlices = topSlices(destAgg);
        const origSlices = topSlices(origAgg);
        const pieTooltip = document.getElementById('pieTooltip');
        const pieDestScale = renderPie(document.getElementById('pieDest'), destSlices, pieTooltip, 'from', 0.72);
        const pieOrigScale = renderPie(document.getElementById('pieOrig'), origSlices, pieTooltip, 'to', 0.78);

        // Populate migrant-worker definition from data markdown
        if (migrationData.definition && migrationData.definition.text) {
          const defQuoteEl  = document.getElementById('heroDefQuote');
          const defSourceEl = document.getElementById('heroDefSource');
          if (defQuoteEl)  defQuoteEl.textContent  = '\u201C' + migrationData.definition.text + '\u201D';
          if (defSourceEl && migrationData.definition.source) {
            defSourceEl.textContent = '— ' + migrationData.definition.source;
          }
        }

        const outflowQuoteEl = document.getElementById('outflowDefQuote');
        if (outflowQuoteEl && migrationData.outflow) {
          outflowQuoteEl.textContent = migrationData.outflow;
        }
        const destQuoteEl = document.getElementById('destDefQuote');
        if (destQuoteEl && migrationData.destination) {
          destQuoteEl.textContent = migrationData.destination;
        }

        // ── Sources bibliography ──────────────────────────────────
        const sourcesListEl = document.getElementById('sourcesList');
        if (sourcesListEl && migrationData.sources && migrationData.sources.length > 0) {
          sourcesListEl.textContent = '';  // safety: wipe any placeholder
          for (const citation of migrationData.sources) {
            const li = document.createElement('li');
            // Convert markdown-style *italic* to <em>, linkify URLs. Safe: DOM nodes only, no innerHTML with data.
            const parts = citation.split(/(\*[^*]+\*)/);
            for (const part of parts) {
              if (part.startsWith('*') && part.endsWith('*')) {
                const em = document.createElement('em');
                em.textContent = part.slice(1, -1);
                li.appendChild(em);
              } else {
                // Linkify http(s) URLs in this plain-text part
                const urlRe = /(https?:\/\/[^\s]+)/g;
                let last = 0, m;
                while ((m = urlRe.exec(part)) !== null) {
                  if (m.index > last) li.appendChild(document.createTextNode(part.slice(last, m.index)));
                  const a = document.createElement('a');
                  a.href = m[1];
                  a.textContent = m[1];
                  a.target = '_blank';
                  a.rel = 'noopener noreferrer';
                  li.appendChild(a);
                  last = m.index + m[1].length;
                }
                if (last < part.length) li.appendChild(document.createTextNode(part.slice(last)));
              }
            }
            sourcesListEl.appendChild(li);
          }
        }

        // ── Reveal controller ─────────────────────────────────────
        const sheet = document.getElementById('overviewSheet');
        const sheetClose = document.getElementById('sheetClose');
        const heroStatEl = document.getElementById('heroStat');
        let revealProgress = 0;   // logical target (0–1)
        let animatedReveal = 0;   // visual value driven by rAF
        let snapTimer = null;
        let rafId = null;         // current rAF handle, if any
        // Perf guards: skip no-op frames, defer blur, pause globe when covered
        let lastAppliedReveal = -1;
        let globePaused = false;

        // ── Pie slice animation (time-based, triggered by reveal) ──
        let pieAnimRunning = false;
        const pieSliceEls = [
          ...(pieDestScale ? pieDestScale.querySelectorAll('.slice-wrap') : []),
          ...(pieOrigScale ? pieOrigScale.querySelectorAll('.slice-wrap') : []),
        ];

        const resetPieSlices = () => {
          for (const g of pieSliceEls) {
            g.setAttribute('transform', 'rotate(-35) scale(0.2)');
            g.style.opacity = '0';
          }
        };

        const startPieAnim = () => {
          const duration = 1200;
          const t0 = performance.now();
          const tick = (now) => {
            if (!pieAnimRunning) return;
            const t = clamp((now - t0) / duration, 0, 1);
            for (const g of pieSliceEls) {
              const idx = g._sliceIdx || 0;
              const cnt = g._sliceCount || 1;
              const delay = (idx / Math.max(1, cnt - 1)) * 0.4;
              const local = clamp((t - delay) / (1 - delay), 0, 1);
              const e = easeOutCubic(local);
              g.setAttribute('transform', `rotate(${((1 - e) * -35).toFixed(2)}) scale(${(0.2 + e * 0.8).toFixed(3)})`);
              g.style.opacity = e.toFixed(3);
            }
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };

        // applyVisuals(r) — drives all visuals from a single value r ∈ [0,1]
        const applyVisuals = (r) => {
          if (Math.abs(r - lastAppliedReveal) < 0.002 && r !== 0 && r !== 1) return;

          document.documentElement.style.setProperty('--reveal', r);
          sheet.classList.toggle('open', r >= 0.15);
          sheet.classList.toggle('settled', r >= 0.999);
          // Globe stays locked while mid-flight; unlocks only when fully settled at 0
          globe.setInteractive(revealProgress === 0 && r < 0.001);

          if (r >= 0.95 && !globePaused) { globe.stop(); globePaused = true; }
          else if (r < 0.95 && globePaused) { globe.start(); globePaused = false; }

          // Pie animation — starts when pies become visible, runs on its own clock
          if (r >= 0.65 && !pieAnimRunning) {
            pieAnimRunning = true;
            startPieAnim();
          } else if (r < 0.3 && pieAnimRunning) {
            pieAnimRunning = false;
            resetPieSlices();
          }

          // Hero count-up and scale — window shifted so animations play during the visible slide
          const n = 167.7 * easeOutCubic(clamp((r - 0.15) / 0.80, 0, 1));
          if (heroStatEl) {
            heroStatEl.textContent = n.toFixed(1) + 'M';
            const heroScale = 0.92 + 0.08 * easeOutCubic(clamp((r - 0.15) / 0.80, 0, 1));
            heroStatEl.style.transform = `scale(${heroScale.toFixed(3)})`;
          }

          lastAppliedReveal = r;
        };

        // rAF interpolates animated reveal so JS animations play during the visible slide
        const applyReveal = (p, animate) => {
          revealProgress = clamp(p, 0, 1);
          if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }

          if (!animate) {
            // Live wheel drag — snap visuals instantly to revealProgress
            animatedReveal = revealProgress;
            applyVisuals(animatedReveal);
          } else {
            // Snap / close — animate animatedReveal → revealProgress over 700ms
            const startVal = animatedReveal;
            const endVal   = revealProgress;
            const duration = 700;
            const startTime = performance.now();

            const tick = (now) => {
              const t = clamp((now - startTime) / duration, 0, 1);
              animatedReveal = startVal + (endVal - startVal) * easeOutCubic(t);
              applyVisuals(animatedReveal);
              if (t < 1) {
                rafId = requestAnimationFrame(tick);
              } else {
                animatedReveal = endVal;
                applyVisuals(animatedReveal);
                rafId = null;
              }
            };
            rafId = requestAnimationFrame(tick);
          }
        };

        const snapReveal = () => {
          const target = revealProgress > 0.5 ? 1 : 0;
          applyReveal(target, true);
        };

        const closeSheet = () => {
          clearTimeout(snapTimer);
          applyReveal(0, true);
        };

        window.addEventListener('wheel', (e) => {
          if (!introDone) { e.preventDefault(); e.stopPropagation(); return; }
          const dist = globe._cameraDistance();
          const atMax = dist >= 495;
          const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 100 : e.deltaY;

          const fullyOpen = revealProgress >= 0.999;
          const atTop     = sheet.scrollTop <= 0;
          const atBottom  = sheet.scrollTop + sheet.clientHeight >= sheet.scrollHeight - 1;

          if (revealProgress === 0) {
            // Sheet closed — only intercept when at max zoom-out and scrolling down
            if (atMax && dy > 0) {
              e.preventDefault();
              e.stopPropagation();
              // First scroll that initiates the reveal — clear any open click-popup
              closeInfoPanel();
              applyReveal(revealProgress + dy / 320, false);
              clearTimeout(snapTimer);
              snapTimer = setTimeout(() => snapReveal(), 140);
            }
          } else if (!fullyOpen) {
            // Sheet partially open — intercept all wheel to continue the transition
            e.preventDefault();
            e.stopPropagation();
            applyReveal(revealProgress + dy / 320, false);
            clearTimeout(snapTimer);
            snapTimer = setTimeout(() => snapReveal(), 140);
          } else {
            // Sheet fully open — pass through scroll unless user is pulling back down at top
            if (dy > 0) {
              // Scrolling down into content — let browser scroll #overviewSheet natively
              return;
            } else if (dy < 0 && !atTop) {
              // Scrolling up through sheet content — do not intercept
              return;
            } else if (dy < 0 && atTop) {
              // Scrolling up at top of sheet content — start closing
              e.preventDefault();
              e.stopPropagation();
              applyReveal(revealProgress + dy / 320, false);
              clearTimeout(snapTimer);
              snapTimer = setTimeout(() => snapReveal(), 140);
            }
          }
        }, { passive: false, capture: true });

        // ── ScrollHint: click + drag to open ──────────────────────
        const scrollHintEl = document.getElementById('scrollHint');
        if (scrollHintEl) {
          scrollHintEl.style.cursor = 'pointer';
          scrollHintEl.style.pointerEvents = 'auto';
          let hintDragging = false;
          let hintStartY = 0;
          let hintWasDragged = false;

          scrollHintEl.addEventListener('pointerdown', (e) => {
            if (!introDone || revealProgress > 0) return;
            hintDragging = true;
            hintWasDragged = false;
            hintStartY = e.clientY;
            scrollHintEl.setPointerCapture(e.pointerId);
            closeInfoPanel();
            e.preventDefault();
          });

          scrollHintEl.addEventListener('pointermove', (e) => {
            if (!hintDragging) return;
            const dy = hintStartY - e.clientY;
            if (Math.abs(dy) > 5) hintWasDragged = true;
            applyReveal(Math.max(0, Math.min(1, dy / (window.innerHeight * 0.7))), false);
          });

          scrollHintEl.addEventListener('lostpointercapture', () => {
            if (!hintDragging) return;
            hintDragging = false;
            snapReveal();
          });

          scrollHintEl.addEventListener('click', (e) => {
            if (!introDone || revealProgress > 0) return;
            if (hintWasDragged) { hintWasDragged = false; return; }
            e.stopPropagation();
            closeInfoPanel();
            applyReveal(1, true);
          });
        }

        // ── SheetClose handle: click + drag to close ──────────────
        if (sheetClose) {
          let handleDragging = false;
          let handleStartY = 0;
          let handleWasDragged = false;

          sheetClose.addEventListener('pointerdown', (e) => {
            if (revealProgress < 0.99) return;
            handleDragging = true;
            handleWasDragged = false;
            handleStartY = e.clientY;
            sheetClose.setPointerCapture(e.pointerId);
            e.preventDefault();
          });

          sheetClose.addEventListener('pointermove', (e) => {
            if (!handleDragging) return;
            const dy = e.clientY - handleStartY;
            if (Math.abs(dy) > 5) handleWasDragged = true;
            applyReveal(Math.max(0, Math.min(1, 1 - dy / (window.innerHeight * 0.7))), false);
          });

          sheetClose.addEventListener('lostpointercapture', () => {
            if (!handleDragging) return;
            handleDragging = false;
            snapReveal();
          });

          sheetClose.addEventListener('click', (e) => {
            if (handleWasDragged) { handleWasDragged = false; return; }
            closeSheet();
          });
        }

        // ESC key dismisses info panel
        window.addEventListener('keydown', (e) => {
          if (e.code === 'Space') {
            if (revealProgress > 0) return;   // sheet open — don't mess with rotation
            e.preventDefault();
            globe.toggleAutoRotate();
          }
          if (e.code === 'Escape') {
            if (revealProgress > 0) {
              closeSheet();
            } else {
              closeInfoPanel();
            }
          }
        });

        // Close button
        const infoClose = document.getElementById('infoClose');
        if (infoClose) infoClose.addEventListener('click', closeInfoPanel);

      } catch (err) {
        // Surface to the inline error panel
        window.dispatchEvent(new ErrorEvent('error', {
          error: err, message: err && err.message, filename: 'bootstrap',
        }));
        throw err;
      }
    })();
