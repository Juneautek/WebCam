import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Search, X, Maximize2, Play, Pause } from 'lucide-react';
import { ALASKA_WEBCAMS, Webcam } from './data';
import 'leaflet/dist/leaflet.css';

const getProxyUrl = (url: string) => {
  if (url.includes('webcams.thesnowcloud.com') || url.includes('iliamna.com') || url.includes('weathercams.faa.gov')) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

function MapController({ selectedCam }: { selectedCam: Webcam | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCam) {
      map.flyTo([selectedCam.lat, selectedCam.lng], 9, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedCam, map]);
  return null;
}

const getTypeColor = (type: string) => {
  if (type === 'faa') return 'cyan-500';
  if (type === 'local_business') return 'emerald-500';
  if (type === 'radio_station') return 'orange-500';
  if (type === 'port_authority') return 'blue-500';
  if (type === 'cannery') return 'purple-500';
  if (type === 'explore_org') return 'yellow-500';
  if (type === 'utility') return 'pink-500';
  if (type === 'usgs') return 'teal-500';
  return 'cyan-500';
};

const getTypeGlow = (type: string) => {
  if (type === 'faa') return 'cyan-500/20';
  if (type === 'local_business') return 'emerald-500/20';
  if (type === 'radio_station') return 'orange-500/20';
  if (type === 'port_authority') return 'blue-500/20';
  if (type === 'cannery') return 'purple-500/20';
  if (type === 'explore_org') return 'yellow-500/20';
  if (type === 'utility') return 'pink-500/20';
  if (type === 'usgs') return 'teal-500/20';
  return 'cyan-500/20';
};

const createCustomIcon = (name: string, type: string) => {
  const color = getTypeColor(type);
  const glow = getTypeGlow(type);
  
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: renderToString(
      <div className="group cursor-pointer">
        <div className="w-12 h-12 flex items-center justify-center relative">
          <div className={`absolute w-full h-full rounded-full bg-${color.split('-')[0]}-500/20 blur-xl animate-pulse`}></div>
          <div className={`w-4 h-4 rounded-full bg-${color.split('-')[0]}-500 border-2 border-[#0a0c10] shadow-[0_0_10px_${color.split('-')[0]}]`}></div>
          <div className="absolute -top-10 bg-[#0a0c10] border border-white/20 px-3 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-xl transform scale-0 group-hover:scale-110 transition-transform origin-bottom pointer-events-none z-50">
            {name.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -20],
  });
};

export function WebcamMarker({ webcam, onOpenFullscreen }: { key?: string | number, webcam: Webcam, onOpenFullscreen: (w: Webcam) => void }) {
  const icon = createCustomIcon(webcam.name, webcam.providerType);
  const [imageUrl, setImageUrl] = useState(() => {
    const pUrl = getProxyUrl(webcam.url);
    const separator = pUrl.includes('?') ? '&' : '?';
    return `${pUrl}${separator}t=${Date.now()}`;
  });

  useEffect(() => {
    // Some cams have a refresh interval, set up an interval to refresh the image
    // by appending a cache-busting timestamp
    const interval = setInterval(() => {
       const pUrl = getProxyUrl(webcam.url);
       const separator = pUrl.includes('?') ? '&' : '?';
       setImageUrl(`${pUrl}${separator}t=${Date.now()}`);
    }, webcam.refreshIntervalMs || 60000);

    return () => clearInterval(interval);
  }, [webcam.url, webcam.refreshIntervalMs]);

  const rawColor = getTypeColor(webcam.providerType).split('-')[0];

  return (
    <Marker position={[webcam.lat, webcam.lng]} icon={icon}>
      <Popup className="custom-popup" maxWidth={400} minWidth={320}>
        <div className="bg-[#0a0c10] text-slate-300 font-sans p-4 rounded-xl border border-white/10 text-left w-[320px] sm:w-[400px] shadow-2xl relative">
          <h3 className="font-bold text-white text-base mb-1 tracking-tight pr-4">{webcam.name}</h3>
          <p className={`text-[10px] text-${rawColor}-400 font-mono mb-2 uppercase tracking-wider`}>
             Source: {webcam.providerType.replace('_', ' ')} • {webcam.provider}
          </p>
          {webcam.description && (
            <p className="text-xs text-slate-400 mb-3">{webcam.description}</p>
          )}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-2xl group">
              {webcam.type === 'youtube' ? (
                <iframe 
                  src={`${webcam.url}${webcam.url.includes('?') ? '&' : '?'}autoplay=1&mute=1`} 
                  title={webcam.name} 
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              ) : webcam.type === 'iframe' ? (
                <iframe 
                  src={webcam.url} 
                  title={webcam.name} 
                  className="absolute inset-0 w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <img 
                  src={imageUrl || undefined} 
                  alt={webcam.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute bottom-2 left-2 flex items-center gap-2 pointer-events-none">
                 <span className="text-[9px] bg-red-600/80 px-1 rounded text-white font-black backdrop-blur">LIVE</span>
                 <span className="text-[9px] text-white/70 font-mono bg-black/40 px-1 rounded backdrop-blur">
                   {webcam.type === 'youtube' ? 'Streaming Live' : `Auto-refresh: ${Math.round(webcam.refreshIntervalMs/1000)}s`}
                 </span>
              </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
             <div className="flex gap-2 items-center">
                <span className={`w-1.5 h-1.5 rounded-full bg-${rawColor}-400 shadow-[0_0_5px_${rawColor}] animate-pulse`}></span>
                <span className={`text-[10px] text-${rawColor}-400 font-medium`}>Remote Sensor Active</span>
             </div>
             <button onClick={() => onOpenFullscreen(webcam)} className="text-[9px] font-bold uppercase flex items-center gap-1 hover:text-white transition-colors">
               <Maximize2 className="w-3 h-3" /> Enter Fullscreen
             </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCam, setSelectedCam] = useState<Webcam | null>(null);
  const [fullScreenCam, setFullScreenCam] = useState<Webcam | null>(null);

  const filteredCams = activeFilter 
    ? ALASKA_WEBCAMS.filter(cam => cam.providerType === activeFilter)
    : ALASKA_WEBCAMS;

  // Real-time URL handler for fullscreen image
  const [fsImageUrl, setFsImageUrl] = useState('');
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState(false);
  
  useEffect(() => {
    if (!fullScreenCam || fullScreenCam.type !== 'image') {
      setIsPlayingTimelapse(false);
      return;
    }
    
    let isSubscribed = true;
    let timelapseInterval: NodeJS.Timeout;

    if (isPlayingTimelapse) {
      // Determine time-lapse URLs based on provider url patterns
      let urls: string[] = [];
      const base = fullScreenCam.url;
      urls.push(base); // current
      
      // We will try to fetch some historical images depending on pattern
      if (base.includes('image0.jpg')) {
        // Kodiak pattern, push backwards in time
        for (let i = 1; i <= 9; i++) {
          urls.push(base.replace('image0.jpg', `image${i}.jpg`));
        }
      } else if (base.includes('_current.jpg')) {
         // FAA pattern, push backwards
         for (let i = 1; i <= 9; i++) {
           urls.push(base.replace('_current.jpg', `_${i}.jpg`));
         }
      }
      
      // Reverse so it plays chronologically
      urls.reverse();
      
      let index = 0;
      setFsImageUrl(getProxyUrl(urls[index]));
      
      timelapseInterval = setInterval(() => {
        index = (index + 1) % urls.length;
        if (isSubscribed) {
          const pUrl = getProxyUrl(urls[index]);
          const separator = pUrl.includes('?') ? '&' : '?';
          setFsImageUrl(`${pUrl}${separator}t=${Date.now()}`);
        }
      }, 500); // 500ms per frame
      
    } else {
      setFsImageUrl(getProxyUrl(fullScreenCam.url));
      const interval = setInterval(() => {
        if (isSubscribed) {
          const pUrl = getProxyUrl(fullScreenCam.url);
          const separator = pUrl.includes('?') ? '&' : '?';
          setFsImageUrl(`${pUrl}${separator}t=${Date.now()}`);
        }
      }, fullScreenCam.refreshIntervalMs || 60000);
      timelapseInterval = interval;
    }

    return () => {
      isSubscribed = false;
      clearInterval(timelapseInterval);
    };
  }, [fullScreenCam, isPlayingTimelapse]);

  return (
    <div className="w-full h-screen bg-[#05070a] text-slate-300 flex flex-col overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0c10] shadow-2xl z-[1000] pointer-events-auto relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <div className="w-4 h-4 bg-[#0a0c10] -rotate-45 flex items-center justify-center"></div>
          </div>
          <span className="font-bold text-xl tracking-tighter text-white">GEO<span className="text-cyan-500">STREAM</span></span>
        </div>
        <div className="flex-1 mx-4 md:mx-12 max-w-2xl">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Agent Discovery: Scanning for local business & FAA image feeds..." 
              className="w-full bg-[#161b22] border border-white/5 rounded-full py-2 pl-12 pr-4 text-sm focus:ring-1 focus:border-cyan-500 focus:ring-cyan-500/50 outline-none placeholder:text-slate-500 text-white transition-all shadow-inner"
            />
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs uppercase font-semibold tracking-widest hidden md:flex">
          <span className="text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_cyan]"></span> 
            {ALASKA_WEBCAMS.length} Active Nodes
          </span>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded border border-white/10 transition-colors">
            My Watchlist
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Discovery */}
        <aside className="w-80 bg-[#080a0e] border-r border-white/5 flex flex-col z-[500] relative">
          <div className="p-4 flex flex-col gap-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Network Feeds
              </h2>
            </div>
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveFilter(null)}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === null ? 'border-white text-white' : 'border-white/10 text-slate-500 hover:border-white/30'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter('faa')}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === 'faa' ? 'border-cyan-500 text-cyan-400' : 'border-cyan-500/20 text-cyan-500/50 hover:border-cyan-500/50'}`}
              >
                FAA Cams
              </button>
              <button 
                onClick={() => setActiveFilter('local_business')}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === 'local_business' ? 'border-emerald-500 text-emerald-400' : 'border-emerald-500/20 text-emerald-500/50 hover:border-emerald-500/50'}`}
              >
                Local Biz
              </button>
              <button 
                onClick={() => setActiveFilter('radio_station')}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === 'radio_station' ? 'border-orange-500 text-orange-400' : 'border-orange-500/20 text-orange-500/50 hover:border-orange-500/50'}`}
              >
                Radio/TV
              </button>
              <button 
                onClick={() => setActiveFilter('port_authority')}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === 'port_authority' ? 'border-blue-500 text-blue-400' : 'border-blue-500/20 text-blue-500/50 hover:border-blue-500/50'}`}
              >
                Ports
              </button>
              <button 
                onClick={() => setActiveFilter('cannery')}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === 'cannery' ? 'border-purple-500 text-purple-400' : 'border-purple-500/20 text-purple-500/50 hover:border-purple-500/50'}`}
              >
                Canneries
              </button>
              <button 
                onClick={() => setActiveFilter('explore_org')}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === 'explore_org' ? 'border-yellow-500 text-yellow-400' : 'border-yellow-500/20 text-yellow-500/50 hover:border-yellow-500/50'}`}
              >
                Explore.org
              </button>
              <button 
                onClick={() => setActiveFilter('usgs')}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === 'usgs' ? 'border-teal-500 text-teal-400' : 'border-teal-500/20 text-teal-500/50 hover:border-teal-500/50'}`}
              >
                USGS / AVO
              </button>
              <button 
                onClick={() => setActiveFilter('utility')}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border-2 transition-colors ${activeFilter === 'utility' ? 'border-pink-500 text-pink-400' : 'border-pink-500/20 text-pink-500/50 hover:border-pink-500/50'}`}
              >
                ISPs & Utilities
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {filteredCams.map(cam => {
               const rawColor = getTypeColor(cam.providerType).split('-')[0];
               return (
                 <div key={cam.id} className="group cursor-pointer" onClick={() => setSelectedCam(cam)}>
                  <div className={`relative aspect-video rounded-lg overflow-hidden bg-slate-800 mb-2 border border-white/5 group-hover:border-${rawColor}-500/50 transition-all`}>
                    <div className="absolute top-2 left-2 bg-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold text-white uppercase z-10">Live</div>
                    {cam.type === 'youtube' ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img 
                          src={`https://img.youtube.com/vi/${cam.url.split('/embed/')[1]?.split('?')[0] || ''}/mqdefault.jpg`}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                          alt="YouTube Thumbnail"
                        />
                      </div>
                    ) : cam.type === 'iframe' ? (
                      <iframe 
                        src={cam.url} 
                        title={cam.name} 
                        className="absolute inset-0 w-full h-full border-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity bg-white"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <img src={getProxyUrl(cam.url) || undefined} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" referrerPolicy="no-referrer" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[9px] px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                      {cam.type === 'youtube' ? 'Live Stream' : `${Math.round(cam.refreshIntervalMs/1000)}s update`}
                    </div>
                  </div>
                  <h3 className={`text-sm font-medium text-white group-hover:text-${rawColor}-400 transition-colors`}>{cam.name}</h3>
                  <p className="text-xs text-slate-500">{cam.provider}</p>
                 </div>
               );
            })}
          </div>
        </aside>

        {/* Map Context Area */}
        <main className="flex-1 relative bg-[#020408]">
          <MapContainer
            center={[62.0, -150.0]}
            zoom={5}
            zoomControl={false}
            style={{ width: '100%', height: '100%', zIndex: 10, background: '#020408' }}
          >
            <MapController selectedCam={selectedCam} />
            {/* OpenStreetMap TileLayer with a dark style overlay via CSS filters above, or we can use a dark theme tile layer provider */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {filteredCams.map(cam => (
              <WebcamMarker key={cam.id} webcam={cam} onOpenFullscreen={setFullScreenCam} />
            ))}
          </MapContainer>
        </main>
      </div>
      
      {/* Bottom Analytics Bar */}
      <footer className="h-10 bg-[#020408] border-t border-white/5 flex items-center justify-between px-6 z-[1000] relative">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Focus: 62.00° N, 150.00° W</span>
          <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-cyan-500/50"></div>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="text-[10px] text-cyan-500 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></span> SYSTEM NOMINAL
          </span>
          <span className="text-[10px] text-slate-500 font-mono">FEED LATENCY: 240MS</span>
        </div>
      </footer>

      {/* Fullscreen Player Overlay */}
      {fullScreenCam && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-12 animate-in fade-in duration-300">
          <div className="absolute top-6 right-6 z-50">
            <button 
              onClick={() => setFullScreenCam(null)} 
              className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur transition-all border border-white/10 shadow-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 w-full h-full relative flex flex-col items-center justify-center">
            <div className="w-full h-full max-w-7xl max-h-[85vh] relative flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
              {fullScreenCam.type === 'youtube' ? (
                <iframe 
                  src={`${fullScreenCam.url}${fullScreenCam.url.includes('?') ? '&' : '?'}autoplay=1&mute=0`} 
                  title={fullScreenCam.name} 
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              ) : fullScreenCam.type === 'iframe' ? (
                <iframe 
                  src={fullScreenCam.url} 
                  title={fullScreenCam.name} 
                  className="absolute inset-0 w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin"
                  allowFullScreen
                />
              ) : (
                <img 
                  src={fsImageUrl || undefined} 
                  alt={fullScreenCam.name} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="mt-6 flex flex-col items-center">
               <h2 className="text-2xl font-bold tracking-tight text-white">{fullScreenCam.name}</h2>
               <p className="text-sm font-mono text-cyan-500 mt-2 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                 {fullScreenCam.provider.toUpperCase()} FEED ACTIVE
               </p>
               {fullScreenCam.type === 'image' && (fullScreenCam.url.includes('image0.jpg') || fullScreenCam.url.includes('_current.jpg')) && (
                 <div className="mt-4 flex opacity-90 hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => setIsPlayingTimelapse(!isPlayingTimelapse)}
                     className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur transition-all border border-white/10"
                   >
                     {isPlayingTimelapse ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-cyan-400" />}
                     <span className="text-xs font-bold uppercase tracking-wider text-white">
                       {isPlayingTimelapse ? 'Pause Time-Lapse' : 'Play 10-Frame Time-Lapse'}
                     </span>
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
