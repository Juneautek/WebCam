const fs = require('fs');

const moreCams = `
  {
    id: "yt-homer-spit",
    name: "Homer Spit Live",
    lat: 59.6,
    lng: -151.4,
    type: "youtube",
    url: "https://www.youtube.com/embed/n42qFz0l2T0",
    description: "Live view of the world-famous Homer Spit.",
    provider: "Homer Alaska YouTube",
    providerType: "local_business",
    refreshIntervalMs: 600000
  },
  {
    id: "yt-kenai-river",
    name: "Kenai River Live",
    lat: 60.55,
    lng: -151.1,
    type: "youtube",
    url: "https://www.youtube.com/embed/F92E3tUSq0w",
    description: "Live salmon fishing action on the Kenai River.",
    provider: "Kenai River Webcams",
    providerType: "local_business",
    refreshIntervalMs: 600000
  },
  {
    id: "yt-juneau-cruise",
    name: "Juneau Cruise Ships",
    lat: 58.3,
    lng: -134.4,
    type: "youtube",
    url: "https://www.youtube.com/embed/51iE94P1a7s",
    description: "Live cruise ship dock in Juneau.",
    provider: "Juneau Harbor Live",
    providerType: "local_business",
    refreshIntervalMs: 600000
  },
  {
    id: "uaf-aurora-cam",
    name: "UAF Aurora Allsky Cam",
    lat: 64.8436,
    lng: -147.723,
    type: "image",
    url: "https://allsky.gi.alaska.edu/images/latest.jpg",
    description: "Live from the Geophysical Institute at University of Alaska Fairbanks.",
    provider: "University of Alaska",
    providerType: "explore_org",
    refreshIntervalMs: 60000
  },
  {
    id: "nps-katmai",
    name: "Katmai Dumpling Mountain",
    lat: 58.58,
    lng: -155.35,
    type: "image",
    url: "https://www.nps.gov/webcams-katm/dumpling.jpg",
    description: "NPS camera on Dumpling Mountain overlooking Naknek Lake in Katmai National Park.",
    provider: "National Park Service",
    providerType: "nps",
    refreshIntervalMs: 300000
  },
`;

let t = fs.readFileSync('src/data.ts', 'utf8');
t = t.replace('export const ALASKA_WEBCAMS: Webcam[] = [', 'export const ALASKA_WEBCAMS: Webcam[] = [' + moreCams);
fs.writeFileSync('src/data.ts', t);
console.log('Done adding MORE new type and cams.');
