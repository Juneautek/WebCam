import * as fs from 'fs';

/**
 * UTILITY SCRIPT: CAMERA NETWORK DISCOVERY & SYNC
 * This tool programmatically queries live networks (like the FAA WeatherCams API) 
 * to source real-time image endpoints across Alaska. It maps their internal payload 
 * structures into our standardized application state `data.ts`, automatically managing
 * hundreds of live nodes.
 * 
 * Future expansions:
 * - Alaska DOT RWIS endpoints
 * - AOOS (Alaska Ocean Observing System) arrays
 * - M3U8 Live Stream scraping
 */
async function syncCameras() {
  console.log("Initiating live endpoint discovery sequence...");
  try {
    const res = await fetch("https://weathercams.faa.gov/api/sites", {
      headers: {
         "User-Agent": "Mozilla/5.0",
         "Referer": "https://weathercams.faa.gov/",
         "Accept": "application/json"
      }
    });
    
    if (!res.ok) {
        throw new Error(`Failed to contact FAA API. Status: ${res.status}`);
    }
    
    const data = await res.json();
    
    console.log(`Scan complete. Found ${data.count} total nodes.`);
    
    // Filter to only include active Alaskan cameras
    let akSites = data.payload.filter((s: any) => s.state === "AK" && s.cameras && s.cameras.length > 0);
    
    // We limit to 50 locations (yielding potentially 150-200 directional cams) 
    // to maintain frontend performance without clustering.
    akSites = akSites.slice(0, 50);

    let output = `// AUTO-GENERATED NODE REGISTRY
// Do not edit manually. Run scripts/fetch_faa_cams.ts to sync with upstream providers.

export interface Webcam {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'image' | 'youtube' | 'm3u8';
  url: string;
  description?: string;
  provider: string;
  providerType: 'faa' | 'local_business' | 'radio_station' | 'port_authority' | 'cannery' | 'explore_org' | 'utility';
  refreshIntervalMs: number;
}

export const ALASKA_WEBCAMS: Webcam[] = [
  // --- AP&T ALASKA WEBCAMS ---
  {
    id: "apt-sunnahae",
    name: "Sunnahae Mountain",
    lat: 55.485,
    lng: -133.125,
    type: "image",
    url: "https://cameras.aptalaska.com/sunnaha_normalized.jpg",
    description: "Located on Prince of Wales Island, looking towards Sunnahae Mountain.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-highmountain",
    name: "High Mountain / Ketchikan Airport",
    lat: 55.355,
    lng: -131.713,
    type: "image",
    url: "https://cameras.aptalaska.com/highmountain_normalized.jpg",
    description: "Located on Gravina Island, above the Ketchikan airport, looking out over Vallenar Bay.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-kasaan",
    name: "Kasaan Mountain",
    lat: 55.539,
    lng: -132.396,
    type: "image",
    url: "https://cameras.aptalaska.com/kasaan_normalized.jpg",
    description: "Located on Prince of Wales Island, in Kasaan, looking up at Kasaan Mountain.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-burnettpeak",
    name: "Burnett Peak",
    lat: 56.12,
    lng: -132.39,
    type: "image",
    url: "https://cameras.aptalaska.com/burnettpeak_normalized.jpg",
    description: "Located on Etolin Island, SW of Wrangell, looking towards Wrangell.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-crystal",
    name: "Crystal Mountain",
    lat: 56.63,
    lng: -132.88,
    type: "image",
    url: "https://cameras.aptalaska.com/crystal_normalized.jpg",
    description: "Located 12 miles S of Petersburg, above Crystal Lake, looking towards Petersburg.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-lindenberg",
    name: "Lindenberg Peak",
    lat: 56.81,
    lng: -133.02,
    type: "image",
    url: "https://cameras.aptalaska.com/lindenberg_normalized.jpg",
    description: "Located on Kupreanof Island, W of Petersburg, looking out onto Duncan Canal.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-turn",
    name: "Turn Mountain",
    lat: 56.97,
    lng: -133.94,
    type: "image",
    url: "https://cameras.aptalaska.com/turn_normalized.jpg",
    description: "Located NE of Kake, looking NNE across Fredric Sound towards Holkam Bay.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-dry",
    name: "Dry Mountain",
    lat: 57.65,
    lng: -133.60,
    type: "image",
    url: "https://cameras.aptalaska.com/dry_normalized.jpg",
    description: "Located on the ridge N of Dry Bay, looking up Stephens Passage towards Taku Harbor.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-taku",
    name: "Taku Mountain",
    lat: 58.05,
    lng: -134.02,
    type: "image",
    url: "https://cameras.aptalaska.com/taku_normalized.jpg",
    description: "On the ridge W of Taku Harbor, looking across Stephens Passage towards Grand Island.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-auke",
    name: "Auke Mountain",
    lat: 58.39,
    lng: -134.66,
    type: "image",
    url: "https://cameras.aptalaska.com/auke_normalized.jpg",
    description: "Located N of Auke Bay, looking NW up Lynn Canal towards Endicott River.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-endicott",
    name: "Endicott Ridge",
    lat: 58.78,
    lng: -135.25,
    type: "image",
    url: "https://cameras.aptalaska.com/endicott_normalized.jpg",
    description: "Located S of the Endicott River, looking up Lynn Canal towards Haines.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  {
    id: "apt-chisana",
    name: "Chisana Airport",
    lat: 62.06,
    lng: -142.06,
    type: "image",
    url: "https://cameras.aptalaska.com/chisana_normalized.jpg",
    description: "Looking at a view of the airport which consists of a turf and gravel runway.",
    provider: "AP&T Alaska",
    providerType: "utility",
    refreshIntervalMs: 120000
  },
  // --- CURATED LIVE STREAMS ---
  {
    id: "homer-spit-harbor",
    name: "Homer Spit Harbor",
    lat: 59.6053,
    lng: -151.4191,
    type: "youtube",
    url: "https://www.youtube.com/embed/hORfQndxN2g",
    description: "Live YouTube feed of the Homer Spit and Kachemak Bay.",
    provider: "Homer Chamber of Commerce",
    providerType: "local_business",
    refreshIntervalMs: 600000
  },
  {
    id: "brooks-falls",
    name: "Brooks Falls - Katmai",
    lat: 58.5562,
    lng: -155.7779,
    type: "youtube",
    url: "https://www.youtube.com/embed/KihmR2F5i3k",
    description: "Famous for brown bears catching salmon. Supplied by Explore.org.",
    provider: "Explore.org",
    providerType: "explore_org",
    refreshIntervalMs: 3600000
  },
  {
    id: "katmai-underwater",
    name: "Katmai Underwater Bear Cam",
    lat: 58.557,
    lng: -155.778,
    type: "youtube",
    url: "https://www.youtube.com/embed/S_8nB08L7qA",
    description: "Underwater footage from the Brooks Falls area.",
    provider: "Explore.org",
    providerType: "explore_org",
    refreshIntervalMs: 3600000
  },
  {
    id: "round-island-walrus",
    name: "Round Island Walrus Beach",
    lat: 58.6,
    lng: -159.98,
    type: "youtube",
    url: "https://www.youtube.com/embed/Fw3pQ2_Rft4",
    description: "Live walrus cam from Round Island, Alaska.",
    provider: "Explore.org",
    providerType: "explore_org",
    refreshIntervalMs: 3600000
  },
`;

    // Map FAA nodes to our schema
    let faaCount = 0;
    for (const site of akSites) {
       for (const cam of site.cameras) {
           faaCount++;
           output += `  {
    id: "${site.siteId}-${cam.cameraDirection.toLowerCase()}",
    name: "${site.siteName} - ${cam.cameraDirection}",
    lat: ${cam.latitude},
    lng: ${cam.longitude},
    type: "image",
    url: "https://weathercams.faa.gov/data/webcams/${site.siteId}_${cam.cameraDirection}_current.jpg",
    description: "Live remote sensor view from FAA WeatherCams.",
    provider: "FAA",
    providerType: "faa",
    refreshIntervalMs: 600000 // 10 minute cache/refresh
  },\n`;
       }
    }

    output += `];\n`;
    fs.writeFileSync('./src/data.ts', output);
    console.log(`Successfully synced ${faaCount} remote sensors and 4 video streams into application registry.`);
  } catch (e: any) {
    console.error("Execution failed:", e.message);
  }
}

syncCameras();
