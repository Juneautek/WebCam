const fs = require('fs');
fetch('https://weathercams.faa.gov/api/sites', {
    headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://weathercams.faa.gov/',
        'Accept': 'application/json'
    }
}).then(r => r.json()).then(data => {
    let akSites = data.payload.filter((s) => s.state === 'AK' && s.cameras && s.cameras.length > 0).slice(0, 50);
    let faaStr = '';
    for (const site of akSites) {
        for (const cam of site.cameras) {
            faaStr += `{
    id: "faa-` + site.siteId + `-` + cam.cameraDirection.toLowerCase() + `",
    name: "` + site.siteName.replace(/"/g, '') + ` - ` + cam.cameraDirection + `",
    lat: ` + cam.latitude + `,
    lng: ` + cam.longitude + `,
    type: "image",
    url: "https://weathercams.faa.gov/data/webcams/` + site.siteId + `_` + cam.cameraDirection + `_current.jpg",
    description: "Live remote sensor view from FAA WeatherCams.",
    provider: "FAA WeatherCams",
    providerType: "faa",
    refreshIntervalMs: 600000
    },`;
        }
    }
    let t = fs.readFileSync('src/data.ts', 'utf8');
    t = t.replace('export const ALASKA_WEBCAMS: Webcam[] = [', 'export const ALASKA_WEBCAMS: Webcam[] = [\n' + faaStr);
    fs.writeFileSync('src/data.ts', t);
    console.log('Success, added FAA cams.');
});
