const fs = require('fs');

const newCams = `
  {
    id: "explore-brooks-falls",
    name: "Brooks Falls - Katmai National Park",
    lat: 58.555,
    lng: -155.27,
    type: "iframe",
    url: "https://explore.org/livecams/player/brown-bear-salmon-cam-brooks-falls",
    description: "Live view of brown bears catching salmon at Brooks Falls in Katmai National Park, courtesy of Explore.org.",
    provider: "Explore.org",
    providerType: "explore_org",
    refreshIntervalMs: 600000
  },
  {
    id: "explore-round-island",
    name: "Walrus Cam - Round Island",
    lat: 58.60,
    lng: -159.98,
    type: "iframe",
    url: "https://explore.org/livecams/player/walrus-cam-round-island",
    description: "Live view of walruses resting on Round Island beaches in Bristol Bay, Alaska.",
    provider: "Explore.org",
    providerType: "explore_org",
    refreshIntervalMs: 600000
  },
  {
    id: "explore-rescue-puppies",
    name: "Warrior Canine Connection Rescue Puppies",
    lat: 61.5, 
    lng: -149.5,
    type: "iframe",
    url: "https://explore.org/livecams/player/warrior-canine-connection-puppy-whelping-room",
    description: "Live rescue puppy whelping room viewing.",
    provider: "Explore.org",
    providerType: "explore_org",
    refreshIntervalMs: 600000
  },
  {
    id: "nps-glacier-bay",
    name: "Glacier Bay Fairweather Webcam",
    lat: 58.45,
    lng: -135.88,
    type: "image",
    url: "https://www.nps.gov/webcams-glba/fairweather.jpg",
    description: "NPS camera looking towards the Fairweather Mountain range from Glacier Bay.",
    provider: "National Park Service",
    providerType: "nps",
    refreshIntervalMs: 300000
  },
  {
    id: "nps-denali-kennels",
    name: "Denali Sled Dog Kennels",
    lat: 63.72,
    lng: -148.96,
    type: "image",
    url: "https://www.nps.gov/webcams-dena/kennels.jpg",
    description: "NPS camera at the Denali Sled Dog Kennels.",
    provider: "National Park Service",
    providerType: "nps",
    refreshIntervalMs: 300000
  },
  {
    id: "yt-seward-harbor",
    name: "Seward Boat Harbor Live",
    lat: 60.117,
    lng: -149.444,
    type: "youtube",
    url: "https://www.youtube.com/embed/5U7E2F6jN0g", 
    description: "Live view of the Small Boat Harbor in Seward, Alaska.",
    provider: "Seward Harbor YouTube",
    providerType: "local_business",
    refreshIntervalMs: 600000
  },
  {
    id: "yt-alaska-railroad",
    name: "Anchorage Train Depot Live",
    lat: 61.22,
    lng: -149.88,
    type: "youtube",
    url: "https://www.youtube.com/embed/U3l0rMItcQc", 
    description: "Live train arrivals and departures from the Alaska Railroad Depot in Anchorage.",
    provider: "Alaska Virtual Views",
    providerType: "local_business",
    refreshIntervalMs: 600000
  },
  {
    id: "dot-rwis-anchorage",
    name: "Glenn Hwy & Muldoon",
    lat: 61.22,
    lng: -149.73,
    type: "image",
    url: "https://roadweather.alaska.gov/images/CamCaches/AK_103362_1.jpg", 
    description: "Alaska DOT RWIS camera - Glenn Highway & Muldoon Road.",
    provider: "Alaska DOT",
    providerType: "adot",
    refreshIntervalMs: 600000
  },
  {
    id: "dot-rwis-peters-creek",
    name: "Glenn Hwy Peters Creek",
    lat: 61.40,
    lng: -149.49,
    type: "image",
    url: "https://roadweather.alaska.gov/images/CamCaches/AK_103282_1.jpg", 
    description: "Alaska DOT RWIS camera - Glenn Highway at Peters Creek.",
    provider: "Alaska DOT",
    providerType: "adot",
    refreshIntervalMs: 600000
  },
`;

let t = fs.readFileSync('src/data.ts', 'utf8');
t = t.replace(/(providerType:\s*[\s\S]+?)(;)/, "$1 | 'nps' | 'adot'$2"); // Add nps and adot to the providerType enum definition
t = t.replace('export const ALASKA_WEBCAMS: Webcam[] = [', 'export const ALASKA_WEBCAMS: Webcam[] = [' + newCams);
fs.writeFileSync('src/data.ts', t);
console.log('Done adding new type and cams.');
