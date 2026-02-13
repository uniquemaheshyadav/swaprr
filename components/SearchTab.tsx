import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Sparkles, Loader2, AlertTriangle, Map as MapIcon } from 'lucide-react';
import { Item, Category } from '../types';
import { askMapsAdvisor } from '../services/geminiService';

declare const google: any;

interface SearchTabProps {
  items: Item[];
}

const SearchTab: React.FC<SearchTabProps> = ({ items }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMap, setGoogleMap] = useState<any>(null);
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapError, setMapError] = useState(false);

  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'All' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Handle Google Maps Error / Auth Failures
  useEffect(() => {
    const handleMapError = () => {
      console.warn("Google Maps Error detected (Billing/Auth/Network). Switching to List View.");
      setMapError(true);
    };

    window.addEventListener('google-maps-error', handleMapError);

    // Check if error triggered before component mount
    if ((window as any).gm_authFailure_triggered) {
      handleMapError();
    }

    // Safety Timeout: If google is not defined after 2 seconds, assume failure
    const loadTimer = setTimeout(() => {
      if (typeof google === 'undefined' || !google.maps) {
        handleMapError();
      }
    }, 2000);

    return () => {
      window.removeEventListener('google-maps-error', handleMapError);
      clearTimeout(loadTimer);
    };
  }, []);

  useEffect(() => {
    if (mapError) return;

    // Defensive check for google object
    if (typeof google === 'undefined') return;

    if (mapRef.current && !googleMap && google.maps) {
      try {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 18.5204, lng: 73.8567 },
          zoom: 13,
          disableDefaultUI: true,
          styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
            { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
            { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#18181b" }] },
            { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
          ]
        });
        setGoogleMap(map);
      } catch (e) {
        console.error("Map creation failed:", e);
        setMapError(true);
      }
    }
  }, [mapRef, googleMap, mapError]);

  useEffect(() => {
    if (!googleMap || mapError || typeof google === 'undefined') return;

    // Clear existing markers? Real implementation should manage marker instances.
    // For prototype simplicity, we just add new ones on top (re-rendering map is expensive, so we just add)
    // A production app would store markers in a ref and clear them on filter change.

    try {
      filteredItems.forEach(item => {
        new google.maps.Marker({
          position: item.location,
          map: googleMap,
          title: item.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
        });
      });
    } catch (e) {
      console.warn("Marker creation failed:", e);
    }
  }, [googleMap, filteredItems, mapError]);

  const handleAiAsk = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    const response = await askMapsAdvisor(18.5204, 73.8567, aiQuery);
    setAiResponse(response);
    setAiLoading(false);
  };

  return (
    // Height calculation: 100vh - 64px (header)
    // On mobile, the bottom nav covers the bottom, but the map can still extend behind it or stop above it.
    // Let's use flex-1 which works inside the Layout's flex container.
    <div className="relative w-full h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] flex flex-col bg-gray-50 dark:bg-dark-bg">

      {/* Floating Search Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-6 md:w-96 md:right-auto z-10 flex flex-col gap-2">
        <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md rounded-xl p-2 flex items-center space-x-2 border border-gray-200 dark:border-gray-800 shadow-lg">
          <Search size={20} className="text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Search items..."
            className="bg-transparent w-full outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm py-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar md:flex-wrap">
          {['All', 'Item', 'Study', 'Skill'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat as Category | 'All')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-md
                ${filter === cat
                  ? 'bg-electric-blue text-white shadow-blue-500/30'
                  : 'bg-white/90 dark:bg-dark-card/90 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {mapError ? (
          <div className="h-full overflow-y-auto p-4 space-y-3 pt-32 md:pt-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 rounded-lg p-3 flex items-start gap-3 mb-4 max-w-md mx-auto">
              <AlertTriangle className="text-orange-500" size={18} />
              <div>
                <h3 className="text-xs font-bold text-orange-800 dark:text-orange-200">Map Service Unavailable</h3>
                <p className="text-[10px] text-orange-600 dark:text-orange-300">Google Maps billing/auth error. Switched to List View.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto px-4 pb-20">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white dark:bg-dark-card p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-3 animate-in slide-in-from-bottom-2">
                  <SmartImage src={item.image} alt={item.title} itemTitle={item.title} category={item.category} className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-800" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-1">{item.title}</h4>
                      <span className="text-xs font-bold text-electric-blue whitespace-nowrap">{item.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                      <MapPin size={10} />
                      <span>{item.location.lat.toFixed(2)}, {item.location.lng.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full bg-gray-200 dark:bg-gray-900" />
        )}

        {/* AI Advisor Button */}
        <div className="absolute bottom-24 md:bottom-8 right-4 z-10">
          <button
            onClick={() => setAdvisorOpen(!advisorOpen)}
            className="w-14 h-14 bg-white dark:bg-dark-card rounded-full shadow-xl flex items-center justify-center text-electric-blue border border-gray-100 dark:border-gray-700 hover:scale-105 transition"
          >
            <Sparkles size={28} />
          </button>
        </div>
      </div>

      {advisorOpen && (
        <div className="absolute bottom-40 md:bottom-24 right-4 w-80 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1">
              <Sparkles size={14} className="text-electric-blue" /> Campus Scout
            </h3>
            <button onClick={() => setAdvisorOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>

          <div className="space-y-3">
            {aiResponse && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-gray-700 dark:text-gray-200 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-blue-100 dark:border-blue-900">
                {aiResponse}
              </div>
            )}

            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs outline-none text-gray-800 dark:text-white focus:ring-1 focus:ring-electric-blue border border-transparent focus:border-electric-blue transition-all"
                placeholder="e.g. Where can I find coffee?"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              />
              <button onClick={handleAiAsk} disabled={aiLoading} className="bg-electric-blue hover:bg-electric-dark text-white p-2 rounded-lg transition-colors">
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTab;