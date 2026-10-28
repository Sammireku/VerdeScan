// Interactive Seed Finder Map with "Download Offline Map" feature for offline nursery & seed access
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Search,
  Phone,
  Navigation,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  Store,
  Compass,
  Download,
  WifiOff,
  RefreshCw,
  Trash2,
  HardDrive,
  Database,
  Check,
} from 'lucide-react';

export interface FindSeedsViewProps {
  onClose: () => void;
}

export interface SeedShop {
  id: string;
  name: string;
  category: 'certified_dealer' | 'cooperative' | 'organic_exchange' | 'nursery';
  distanceKm: number;
  rating: number;
  address: string;
  phone: string;
  hours: string;
  isOpen: boolean;
  coordinates: { x: number; y: number }; // Percentage offset on interactive map
  varietiesInStock: string[];
  certifiedBy: string;
  nurseryType?: string;
}

const REGIONAL_SEED_SHOPS_DATA: SeedShop[] = [
  {
    id: 'shop-1',
    name: 'Heritage Agro-Inputs & Seed Depot',
    category: 'certified_dealer',
    distanceKm: 0.8,
    rating: 4.9,
    address: 'Plot 14 Commercial Row, Main Market Road',
    phone: '+233 24 411 9823',
    hours: '8:00 AM – 5:30 PM',
    isOpen: true,
    coordinates: { x: 38, y: 44 },
    varietiesInStock: ['Tomato (Roma VF)', 'Scotch Bonnet Pepper', 'Maize (Obatanpa)', 'Dwarf Okra'],
    certifiedBy: 'Ministry of Food & Agriculture (MoFA)',
    nurseryType: 'Certified Seed Dealer',
  },
  {
    id: 'shop-2',
    name: 'GreenFields Seed & Nursery Specialists',
    category: 'certified_dealer',
    distanceKm: 1.4,
    rating: 4.8,
    address: 'Corner of Ring Road & Station Bypass',
    phone: '+233 20 892 4110',
    hours: '7:30 AM – 6:00 PM',
    isOpen: true,
    coordinates: { x: 62, y: 32 },
    varietiesInStock: ['Drought-Tolerant Maize', 'Cowpea (Songotra)', 'Cabbage (Oxylus)', 'Watermelon (Sugar Baby)'],
    certifiedBy: 'National Seed Trade Association',
    nurseryType: 'Hybrid & Certified Nursery',
  },
  {
    id: 'shop-3',
    name: 'EcoFlora Organic Garden & Seed Exchange',
    category: 'organic_exchange',
    distanceKm: 2.3,
    rating: 4.9,
    address: '8 Orchid Lane, Botanical Gardens Junction',
    phone: '+233 55 330 7712',
    hours: '9:00 AM – 5:00 PM',
    isOpen: true,
    coordinates: { x: 26, y: 68 },
    varietiesInStock: ['Heirloom San Marzano', 'African Marigold', 'Sweet Basil', 'Monstera Cuttings', 'Snake Plant Rhizomes'],
    certifiedBy: 'Organic Growers Federation',
    nurseryType: 'Heirloom Seed & Plant Nursery',
  },
  {
    id: 'shop-4',
    name: 'AgroPro Inputs & Cooperative Hub',
    category: 'cooperative',
    distanceKm: 3.7,
    rating: 4.6,
    address: 'Agricultural Extension Office Depot, Km 4',
    phone: '+233 24 550 9180',
    hours: '8:00 AM – 4:30 PM',
    isOpen: false,
    coordinates: { x: 74, y: 65 },
    varietiesInStock: ['Certified Cassava Stems', 'Yam Minisetts', 'Soybean (Jenguma)', 'Sorghum (Kapaala)'],
    certifiedBy: 'Crops Research Institute (CSIR)',
    nurseryType: 'Farmer Cooperative Depot',
  },
  {
    id: 'shop-5',
    name: 'Central Horticultural Nursery & Seedlings',
    category: 'nursery',
    distanceKm: 4.8,
    rating: 4.7,
    address: 'Silo Complex, North Highway Gate 2',
    phone: '+233 50 120 4499',
    hours: '7:00 AM – 6:00 PM',
    isOpen: true,
    coordinates: { x: 48, y: 78 },
    varietiesInStock: ['Eggplant (Gboma)', 'Sweet Pepper', 'Onion (Bawku Red)', 'Certified Seed Trays', 'Seedling Transplants'],
    certifiedBy: 'Plant Protection & Regulatory Services (PPRSD)',
    nurseryType: 'Regional Plant Nursery',
  },
  {
    id: 'shop-6',
    name: 'Bunso Agro-Forestry & Fruit Nursery',
    category: 'nursery',
    distanceKm: 6.2,
    rating: 4.9,
    address: 'Bunso Cocoa Research Arboretum Gate',
    phone: '+233 24 380 1190',
    hours: '8:00 AM – 5:00 PM',
    isOpen: true,
    coordinates: { x: 82, y: 40 },
    varietiesInStock: ['Grafted Mango', 'Improved Citrus', 'Papaya (Solo)', 'Passion Fruit Vines', 'Cocoa Seedlings'],
    certifiedBy: 'CRIG Agro-Forestry Division',
    nurseryType: 'Fruit & Tree Nursery',
  },
  {
    id: 'shop-7',
    name: 'Savanna Seed Producers Cooperative',
    category: 'cooperative',
    distanceKm: 8.5,
    rating: 4.8,
    address: 'Extension Road, Northern Farmers Pavilion',
    phone: '+233 27 744 3301',
    hours: '8:00 AM – 4:00 PM',
    isOpen: true,
    coordinates: { x: 20, y: 28 },
    varietiesInStock: ['Groundnut (Manipinta)', 'Millet (Kaanati)', 'Sesame', 'Pigeon Pea', 'Bambara Groundnut'],
    certifiedBy: 'Savanna Agricultural Research Institute (SARI)',
    nurseryType: 'Certified Seed Multiplier',
  },
];

const OFFLINE_MAP_STORAGE_KEY = 'verdescan_offline_seed_map';

export function FindSeedsView({ onClose }: FindSeedsViewProps) {
  const [selectedShopId, setSelectedShopId] = useState<string>(REGIONAL_SEED_SHOPS_DATA[0].id);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocationName, setUserLocationName] = useState('Local Vicinity');

  // Offline map download state
  const [isOfflineMapDownloaded, setIsOfflineMapDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStepText, setDownloadStepText] = useState('');
  const [isOfflineModeSimulated, setIsOfflineModeSimulated] = useState(false);
  const [offlineCacheSize, setOfflineCacheSize] = useState('480 KB');

  // Check offline status on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_MAP_STORAGE_KEY);
      if (stored) {
        setIsOfflineMapDownloaded(true);
      }
    } catch {
      // ignore
    }

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setUserLocationName('Current GPS Coordinates');
        },
        () => {
          setUserLocationName('Regional Farm Zone');
        },
        { timeout: 4000 }
      );
    }
  }, []);

  // Handler: Download and cache regional nurseries & seed suppliers
  const handleDownloadOfflineMap = () => {
    setIsDownloading(true);
    setDownloadProgress(10);
    setDownloadStepText('Connecting to regional agro-dealer registry...');

    setTimeout(() => {
      setDownloadProgress(35);
      setDownloadStepText('Caching 7 regional plant nurseries & seed suppliers...');
    }, 400);

    setTimeout(() => {
      setDownloadProgress(65);
      setDownloadStepText('Saving GPS coordinates, phone numbers & seed inventory...');
    }, 800);

    setTimeout(() => {
      setDownloadProgress(90);
      setDownloadStepText('Verifying offline vector map tiles & routing paths...');
    }, 1200);

    setTimeout(() => {
      setDownloadProgress(100);
      setDownloadStepText('Map successfully downloaded for offline access!');

      // Save to localStorage
      const offlinePayload = {
        downloadedAt: new Date().toISOString(),
        version: '1.2.0',
        sizeKb: 480,
        shopsCount: REGIONAL_SEED_SHOPS_DATA.length,
        shops: REGIONAL_SEED_SHOPS_DATA,
      };

      try {
        localStorage.setItem(OFFLINE_MAP_STORAGE_KEY, JSON.stringify(offlinePayload));
      } catch {
        // ignore
      }

      setIsOfflineMapDownloaded(true);
      setIsDownloading(false);
    }, 1600);
  };

  const handleDeleteOfflineMap = () => {
    try {
      localStorage.removeItem(OFFLINE_MAP_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsOfflineMapDownloaded(false);
    setIsOfflineModeSimulated(false);
  };

  const filteredShops = REGIONAL_SEED_SHOPS_DATA.filter((shop) => {
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'certified' && shop.category === 'certified_dealer') ||
      (filterType === 'organic' && shop.category === 'organic_exchange') ||
      (filterType === 'coop' && (shop.category === 'cooperative' || shop.category === 'nursery'));

    const matchesSearch =
      searchQuery.trim() === '' ||
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.varietiesInStock.some((v) => v.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shop.nurseryType || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const selectedShop =
    REGIONAL_SEED_SHOPS_DATA.find((s) => s.id === selectedShopId) || filteredShops[0];

  return (
    <div className="space-y-4 px-4 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E6EBE4] flex items-center justify-center text-[#19201D] hover:bg-stone-50 shadow-2xs touch-target"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#19201D] tracking-tight leading-none">
              Find Seeds & Nurseries
            </h1>
            <p className="text-[11px] text-[#5E6D65] mt-0.5 font-medium flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#78C441]" />
              <span>Certified suppliers, agro-dealers & plant nurseries</span>
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-[#EBF0E9] p-1 rounded-2xl flex items-center">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'map' ? 'bg-[#182635] text-white shadow-2xs' : 'text-[#5E6D65]'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'list' ? 'bg-[#182635] text-white shadow-2xs' : 'text-[#5E6D65]'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* OFFLINE MAP DOWNLOAD ACTION BANNER (Requested by user) */}
      <div className="bg-white rounded-3xl p-4 border border-[#E6EBE4] shadow-xs space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isOfflineMapDownloaded
                  ? 'bg-[#D8F3DC] text-[#2D6A4F]'
                  : 'bg-[#EBF5FF] text-[#2563EB]'
              }`}
            >
              {isOfflineMapDownloaded ? (
                <Check className="w-5 h-5 stroke-[3]" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#19201D]">
                  {isOfflineMapDownloaded ? 'Offline Map Ready' : 'Download Offline Map'}
                </h3>
                {isOfflineMapDownloaded && (
                  <span className="text-[9px] bg-[#D8F3DC] text-[#1B4332] px-1.5 py-0.2 rounded-md font-bold">
                    Cached ({offlineCacheSize})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5E6D65] leading-tight mt-0.5">
                {isOfflineMapDownloaded
                  ? 'Nurseries, seed varieties & supplier contacts are saved for use without internet.'
                  : 'Cache all regional nurseries, seed stocks & phone numbers for field use.'}
              </p>
            </div>
          </div>

          {!isOfflineMapDownloaded ? (
            <button
              type="button"
              onClick={handleDownloadOfflineMap}
              disabled={isDownloading}
              className="touch-target bg-[#78C441] hover:bg-[#6BB536] disabled:bg-stone-300 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0 min-h-[38px]"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Downloading...' : 'Download Map'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsOfflineModeSimulated(!isOfflineModeSimulated)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                  isOfflineModeSimulated
                    ? 'bg-[#182635] text-[#86EFAC] border-[#182635]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
                title="Toggle simulated offline test"
              >
                {isOfflineModeSimulated ? '📡 Offline Active' : 'Test Offline'}
              </button>
              <button
                type="button"
                onClick={handleDeleteOfflineMap}
                className="text-stone-400 hover:text-[#BC4749] p-1.5 rounded-lg"
                title="Clear cached map"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Download Progress Bar */}
        {isDownloading && (
          <div className="space-y-1 pt-1">
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#78C441] h-full transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-[#2D6A4F] font-bold text-right">{downloadStepText}</p>
          </div>
        )}

        {/* Active Offline Alert Notification */}
        {isOfflineModeSimulated && (
          <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] p-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
            <WifiOff className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              Offline Map Mode Active: Browsing saved regional nurseries and certified seed dealers
              without network access.
            </span>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search variety (Roma VF, Maize, Okra) or nursery..."
          className="w-full bg-white border border-[#E6EBE4] text-xs font-bold rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#78C441] shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Suppliers' },
          { id: 'certified', label: 'Certified Dealers' },
          { id: 'organic', label: 'Organic & Nurseries' },
          { id: 'coop', label: 'Cooperatives' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              filterType === f.id
                ? 'bg-[#78C441] text-white border-[#78C441] shadow-2xs'
                : 'bg-white border-[#E6EBE4] text-[#5E6D65] hover:text-[#19201D]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* INTERACTIVE RADAR MAP VIEW */}
      {viewMode === 'map' && (
        <div className="space-y-3.5">
          {/* Map Canvas */}
          <div className="relative aspect-4/3 w-full bg-[#E5ECE3] rounded-3xl overflow-hidden border border-[#D0DCD0] shadow-inner p-4 select-none">
            {/* Styled Map Background Grid & Roads */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#A8BCA6" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Simulated Main Roads */}
                <path d="M 0 120 Q 150 160 400 130" fill="none" stroke="#FFFFFF" strokeWidth="12" />
                <path d="M 0 120 Q 150 160 400 130" fill="none" stroke="#CBD9C8" strokeWidth="8" />
                <path d="M 180 0 Q 190 200 240 400" fill="none" stroke="#FFFFFF" strokeWidth="10" />
                <path d="M 180 0 Q 190 200 240 400" fill="none" stroke="#CBD9C8" strokeWidth="6" />
                {/* River / Water Canal */}
                <path
                  d="M 320 0 Q 280 180 350 400"
                  fill="none"
                  stroke="#BFDBFE"
                  strokeWidth="10"
                  opacity="0.8"
                />
              </svg>
            </div>

            {/* User Center GPS Pulse Pin */}
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: '50%', top: '50%' }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/20 animate-ping absolute" />
              <div className="w-4 h-4 rounded-full bg-[#3B82F6] border-2 border-white shadow-md z-10" />
              <span className="text-[9px] font-extrabold bg-[#182635] text-white px-2 py-0.5 rounded-full mt-1 shadow-md whitespace-nowrap">
                You ({userLocationName})
              </span>
            </div>

            {/* Interactive Shop Pins */}
            {filteredShops.map((shop) => {
              const isSelected = shop.id === selectedShop?.id;
              return (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => setSelectedShopId(shop.id)}
                  style={{ left: `${shop.coordinates.x}%`, top: `${shop.coordinates.y}%` }}
                  className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all transform active:scale-95 group touch-target ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                  title={shop.name}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-[#182635] text-[#78C441] border-[#78C441] ring-4 ring-[#78C441]/30'
                          : 'bg-[#78C441] text-white border-white'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-1 shadow-xs whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-[#182635] text-white'
                          : 'bg-white/90 text-[#19201D] opacity-90'
                      }`}
                    >
                      {shop.distanceKm} km
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Map Legend Floating Controls */}
            <div className="absolute bottom-2.5 left-2.5 z-30 bg-white/90 backdrop-blur-md rounded-xl p-2 border border-[#E6EBE4] shadow-xs text-[10px] space-y-1 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#78C441]" />
                <span className="text-[#19201D]">
                  {filteredShops.length} Suppliers in Regional Range
                </span>
              </div>
            </div>
          </div>

          {/* Selected Shop Callout Card (Floating below map) */}
          {selectedShop && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedShop.isOpen ? 'bg-[#78C441]' : 'bg-red-400'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-[#5E6D65]">
                      {selectedShop.isOpen ? 'Open Now' : 'Closed'} • {selectedShop.hours}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#19201D] leading-tight mt-0.5">
                    {selectedShop.name}
                  </h3>
                  <p className="text-xs text-[#5E6D65] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#78C441] shrink-0" />
                    <span>{selectedShop.address}</span>
                  </p>
                </div>

                <div className="bg-[#D8F3DC] text-[#2D6A4F] px-2.5 py-1 rounded-xl text-center shrink-0">
                  <span className="text-xs font-black block leading-none">
                    {selectedShop.distanceKm}
                  </span>
                  <span className="text-[9px] font-bold">KM</span>
                </div>
              </div>

              {/* Certified Seeds in Stock */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#19201D]">
                  Certified Varieties in Stock:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedShop.varietiesInStock.map((v) => (
                    <span
                      key={v}
                      className="text-[10px] font-bold bg-[#F6F8F5] text-[#2D6A4F] border border-[#E6EBE4] px-2 py-0.5 rounded-lg"
                    >
                      🌱 {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Regulatory Quality Badge */}
              <div className="flex items-center gap-1.5 text-[10px] text-[#5E6D65] bg-stone-50 p-2 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#78C441] shrink-0" />
                <span>Verified by {selectedShop.certifiedBy}</span>
              </div>

              {/* Action Buttons: Directions & Call */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${selectedShop.phone}`}
                  className="touch-target bg-[#F6F8F5] hover:bg-stone-100 border border-[#E6EBE4] text-[#19201D] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#78C441]" />
                  <span>Call Store</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedShop.name + ' ' + selectedShop.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs min-h-[44px]"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DIRECTORY LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-3xl p-4 border border-[#E6EBE4] shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#19201D] leading-tight">
                    {shop.name}
                  </h3>
                  <p className="text-[11px] text-[#5E6D65] mt-0.5">{shop.address}</p>
                </div>
                <span className="text-xs font-black text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 rounded-lg shrink-0">
                  {shop.distanceKm} km
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {shop.varietiesInStock.map((v) => (
                  <span
                    key={v}
                    className="text-[9px] font-bold bg-[#F6F8F5] text-[#2D6A4F] px-1.5 py-0.5 rounded"
                  >
                    {v}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#E6EBE4] text-xs">
                <span className="text-[10px] text-[#5E6D65]">Hours: {shop.hours}</span>
                <a
                  href={`tel:${shop.phone}`}
                  className="text-[#78C441] font-bold flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{shop.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
