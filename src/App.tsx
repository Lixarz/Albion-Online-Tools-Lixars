import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Plus, Trash2, PieChart, Info, DollarSign, Crown, Sword, FlaskConical, Soup, Menu, X, Map, Calculator, Table, Route, Zap, Trash, Download, Upload, Clock, HelpCircle, Languages } from 'lucide-react';
import { t, Language } from './translations';

const CITIES = ['Martlock', 'Lymhurst', 'Bridgewatch', 'Fort Sterling', 'Thetford', 'Caerleon', 'Brecilien'] as const;
type City = typeof CITIES[number];

type Material = {
  id: string;
  name: string;
  quantityPerCraft: number;
  unitPrice: number; // Simple mode
  cityPrices: Partial<Record<City, number>>; // Matrix mode
};

type Category = 'Gear' | 'Food' | 'Potion';

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-700 text-xs text-slate-200 border border-slate-600 rounded shadow-lg z-50">
      {text}
      {/* Triangle pointer */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
    </div>
  </div>
);

const loadState = () => {
  try {
    const saved = localStorage.getItem('albion-calc-state');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return null;
}

export default function App() {
  const initialState = useMemo(loadState, []);

  const [lang, setLang] = useState<Language>(initialState?.lang || 'en');
  const d = t[lang];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'calculator' | 'matrix'>('calculator');
  const [category, setCategory] = useState<Category>(initialState?.category || 'Gear');
  const [isPremium, setIsPremium] = useState(initialState?.isPremium ?? true);

  // Auto-sync feature
  const [useMatrixPrices, setUseMatrixPrices] = useState(initialState?.useMatrixPrices ?? false);

  // Calculator State
  const [itemName, setItemName] = useState(initialState?.itemName || '');
  const [amountToCraft, setAmountToCraft] = useState(initialState?.amountToCraft || 1);
  const [yieldPerCraft, setYieldPerCraft] = useState(initialState?.yieldPerCraft || 1);
  const [sellPrice, setSellPrice] = useState(initialState?.sellPrice || 0);
  const [matrixSellPrices, setMatrixSellPrices] = useState<Partial<Record<City, number>>>(initialState?.matrixSellPrices || {});
  const [stationFeeTotal, setStationFeeTotal] = useState(initialState?.stationFeeTotal || 0);
  const [rrr, setRrr] = useState(initialState?.rrr ?? 15.2);
  const [materials, setMaterials] = useState<Material[]>(initialState?.materials || [
    { id: '1', name: 'Raw Material 1', quantityPerCraft: 1, unitPrice: 0, cityPrices: {} }
  ]);
  const [feeMode, setFeeMode] = useState<'total' | 'calculate'>(initialState?.feeMode || 'total');
  const [feePer100, setFeePer100] = useState(initialState?.feePer100 || 0);
  const [capacityPerCraft, setCapacityPerCraft] = useState(initialState?.capacityPerCraft || 0);
  const [timeMinutes, setTimeMinutes] = useState(initialState?.timeMinutes || 60);

  useEffect(() => {
    localStorage.setItem('albion-calc-state', JSON.stringify({
      lang, category, isPremium, useMatrixPrices, itemName, amountToCraft, yieldPerCraft, sellPrice, matrixSellPrices, stationFeeTotal, rrr, materials,
      feeMode, feePer100, capacityPerCraft, timeMinutes
    }));
  }, [lang, category, isPremium, useMatrixPrices, itemName, amountToCraft, yieldPerCraft, sellPrice, matrixSellPrices, stationFeeTotal, rrr, materials, feeMode, feePer100, capacityPerCraft, timeMinutes]);

  const handleClearData = () => {
    if (window.confirm(d.clearConfirm)) {
      localStorage.removeItem('albion-calc-state');
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = {
      lang, category, isPremium, useMatrixPrices, itemName, amountToCraft, yieldPerCraft, sellPrice, matrixSellPrices, stationFeeTotal, rrr, materials, feeMode, feePer100, capacityPerCraft, timeMinutes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `albion-craft-${itemName || category.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data) {
          if (data.lang && (data.lang === 'en' || data.lang === 'id')) setLang(data.lang);
          setCategory(data.category || 'Gear');
          setIsPremium(data.isPremium ?? true);
          setUseMatrixPrices(data.useMatrixPrices ?? false);
          setItemName(data.itemName || '');
          setAmountToCraft(data.amountToCraft || 1);
          setYieldPerCraft(data.yieldPerCraft || 1);
          setSellPrice(data.sellPrice || 0);
          setMatrixSellPrices(data.matrixSellPrices || {});
          setStationFeeTotal(data.stationFeeTotal || 0);
          setRrr(data.rrr ?? 15.2);
          if (data.materials) setMaterials(data.materials);
          setFeeMode(data.feeMode || 'total');
          setFeePer100(data.feePer100 || 0);
          setCapacityPerCraft(data.capacityPerCraft || 0);
          setTimeMinutes(data.timeMinutes || 60);
        }
      } catch (err) {
        alert("Failed to import data. Invalid file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatNumberCompact = (num: number) => {
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (absNum >= 1000000) return sign + (absNum / 1000000).toFixed(1) + 'M';
    if (absNum >= 1000) return sign + (absNum / 1000).toFixed(1) + 'k';
    return sign + Math.floor(absNum).toString();
  };

  const addMaterial = () => {
    setMaterials([...materials, { id: Date.now().toString(), name: `Material ${materials.length + 1}`, quantityPerCraft: 1, unitPrice: 0, cityPrices: {} }]);
  };

  const updateMaterial = (id: string, field: keyof Material, value: string | number) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const updateMaterialCityPrice = (id: string, city: City, price: number) => {
    setMaterials(materials.map(m => {
      if (m.id === id) {
        return { ...m, cityPrices: { ...m.cityPrices, [city]: price } };
      }
      return m;
    }));
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const updateMatrixSellPrice = (city: City, price: number) => {
    setMatrixSellPrices(prev => ({ ...prev, [city]: price }));
  };

  // Matrix processing helpers
  const getBestBuyCity = (cityPrices: Partial<Record<City, number>>): { city: City | null, price: number } => {
    let bestCity: City | null = null;
    let lowestPrice = Infinity;
    Object.entries(cityPrices).forEach(([city, price]) => {
      if (price !== undefined && price > 0 && price < lowestPrice) {
        lowestPrice = price;
        bestCity = city as City;
      }
    });
    return { city: bestCity, price: lowestPrice === Infinity ? 0 : lowestPrice };
  };

  const getBestSellCity = (cityPrices: Partial<Record<City, number>>): { city: City | null, price: number } => {
    let bestCity: City | null = null;
    let highestPrice = 0;
    Object.entries(cityPrices).forEach(([city, price]) => {
      if (price !== undefined && price > highestPrice) {
        highestPrice = price;
        bestCity = city as City;
      }
    });
    return { city: bestCity, price: highestPrice };
  };

  // Calculations
  const calculations = useMemo(() => {
    const marketTaxPercent = isPremium ? 0.065 : 0.105;
    
    // Revenue
    const bestSell = getBestSellCity(matrixSellPrices);
    const effectiveSellPrice = useMatrixPrices && bestSell.price > 0 ? bestSell.price : sellPrice;

    const totalItemsYielded = amountToCraft * yieldPerCraft;
    const grossRevenue = totalItemsYielded * effectiveSellPrice;
    const marketTaxAmount = grossRevenue * marketTaxPercent;
    const netRevenue = grossRevenue - marketTaxAmount;

    // Costs
    let totalBaseMaterialCost = 0;
    let totalMaterialReturnVal = 0;

    materials.forEach(mat => {
      const baseQty = Number(mat.quantityPerCraft) * amountToCraft;
      const returnedQty = baseQty * (Number(rrr) / 100);
      
      const bestBuy = getBestBuyCity(mat.cityPrices);
      const effectiveMatPrice = useMatrixPrices && bestBuy.price > 0 ? bestBuy.price : mat.unitPrice;

      const cost = baseQty * Number(effectiveMatPrice);
      const returnVal = returnedQty * Number(effectiveMatPrice);

      totalBaseMaterialCost += cost;
      totalMaterialReturnVal += returnVal;
    });

    const netMaterialCost = totalBaseMaterialCost - totalMaterialReturnVal;
    
    // Station Fee Calculation
    const effectiveStationFee = feeMode === 'total' 
      ? Number(stationFeeTotal) 
      : (Number(feePer100) / 100) * Number(capacityPerCraft) * amountToCraft;

    const totalCost = netMaterialCost + effectiveStationFee;

    // Profit
    const netProfit = netRevenue - totalCost;
    const profitMargin = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    // Time calculations
    const timeHours = timeMinutes / 60;
    const profitPerHour = timeHours > 0 ? netProfit / timeHours : 0;
    const profitPerDay = profitPerHour * 24;

    return {
      effectiveSellPrice,
      bestSellCity: bestSell.city,
      grossRevenue,
      marketTaxAmount,
      netRevenue,
      totalBaseMaterialCost,
      totalMaterialReturnVal,
      netMaterialCost,
      effectiveStationFee,
      totalCost,
      netProfit,
      profitMargin,
      profitPerHour,
      profitPerDay,
      totalItemsYielded
    };
  }, [materials, amountToCraft, yieldPerCraft, sellPrice, matrixSellPrices, stationFeeTotal, rrr, isPremium, useMatrixPrices, feeMode, feePer100, capacityPerCraft, timeMinutes]);

  const categories = [
    { name: 'Gear', icon: Sword, label: d.categories.Gear, desc: d.catDesc.Gear },
    { name: 'Food', icon: Soup, label: d.categories.Food, desc: d.catDesc.Food },
    { name: 'Potion', icon: FlaskConical, label: d.categories.Potion, desc: d.catDesc.Potion },
  ] as const;

  const rrrValues = [0, 15.2, 24.8, 43.5, 47.9, 53.9];
  const rrrOptions = d.rrrOptions.map((label, i) => ({ label, value: rrrValues[i] }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center z-20">
        <div className="font-bold text-xl text-indigo-400 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          {d.appTitle}
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-700 rounded-lg">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col transition-transform z-10
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex font-bold text-2xl text-indigo-400 items-center gap-2 mb-8 px-2">
          <Settings className="w-7 h-7" />
          {d.appTitle}
        </div>

        {/* View Selection */}
        <div className="flex flex-col gap-2 mb-6 border-b border-slate-700 pb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
            {d.mainFeatures}
          </div>
          <button
            onClick={() => { setActiveView('calculator'); setIsSidebarOpen(false); }}
            className={`flex text-left items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeView === 'calculator' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50 text-white' : 'hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Calculator className={`w-5 h-5 ${activeView === 'calculator' ? 'text-indigo-200' : 'text-slate-400'}`} />
            <div className="font-medium text-sm">{d.calcTitle}</div>
          </button>
          <button
            onClick={() => { setActiveView('matrix'); setIsSidebarOpen(false); }}
            className={`flex text-left items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeView === 'matrix' ? 'bg-emerald-600 shadow-lg shadow-emerald-900/50 text-white' : 'hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Table className={`w-5 h-5 ${activeView === 'matrix' ? 'text-emerald-200' : 'text-slate-400'}`} />
            <div className="font-medium text-sm">{d.matrixTitle}</div>
          </button>
        </div>

        <div className="flex justify-between items-center mb-2 px-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {d.strategy}
          </div>
          <button 
            onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
            className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300"
          >
            <Languages className="w-3 h-3" /> {lang === 'en' ? 'ID' : 'EN'}
          </button>
        </div>
        
        <div className="flex flex-col gap-2 mb-8">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = category === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`flex text-left items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-slate-700 text-white border border-slate-600' : 'hover:bg-slate-700/50 text-slate-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div className="text-sm font-medium">{c.label}</div>
              </button>
            )
          })}
        </div>

        <div className="mt-auto">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-medium flex items-center gap-2">
                <Crown className={`w-4 h-4 ${isPremium ? 'text-yellow-400' : 'text-slate-500'}`} />
                {d.premium}
              </span>
              <button 
                onClick={() => setIsPremium(!isPremium)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isPremium ? 'bg-indigo-500' : 'bg-slate-600'
                }`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isPremium ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {isPremium ? d.taxInfoPrem : d.taxInfoNonPrem}
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleExport}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-3 rounded-lg flex items-center justify-center gap-1 transition-colors text-slate-300 font-medium"
            >
              <Download className="w-4 h-4 text-indigo-400" /> {d.save}
            </button>
            <label className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-3 rounded-lg flex items-center justify-center gap-1 transition-colors text-slate-300 cursor-pointer font-medium">
              <Upload className="w-4 h-4 text-emerald-400" /> {d.load}
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          <button 
            onClick={handleClearData} 
            className="w-full mt-2 text-red-400/80 hover:text-red-400 hover:bg-slate-900/50 text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Trash className="w-4 h-4" /> {d.clearData}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          {/* HEADER */}
          <header className="mb-4">
            <h1 className="text-3xl font-bold text-white mb-2">
              {activeView === 'calculator' ? `${d.categories[category]} ${d.calcTitle.split(' ')[0]}` : d.matrixTitle}
            </h1>
            <p className="text-slate-400">
              {activeView === 'calculator' 
                ? d.calcDesc
                : d.matrixDesc}
            </p>
          </header>

          {activeView === 'matrix' && (
             <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col">
              <div className="mb-6 flex items-start gap-4 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
                 <div className="p-2 bg-emerald-500/10 rounded-lg">
                   <Zap className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div>
                   <h3 className="text-emerald-100 font-semibold mb-1">{d.findRoute}</h3>
                   <p className="text-emerald-200/70 text-sm">
                     {d.matrixHelp}
                   </p>
                 </div>
              </div>

              <div className="overflow-x-auto pb-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg min-w-[180px]">{d.itemMaterial}</th>
                      {CITIES.map(c => <th key={c} className="px-4 py-3 min-w-[110px]">{c}</th>)}
                      <th className="px-4 py-3 rounded-tr-lg text-emerald-400 min-w-[140px]">{d.marketBest}</th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* Output Item Row */}
                    <tr className="border-b-2 border-indigo-500/30 bg-slate-800/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-indigo-300">
                        {itemName || d.outputProduct} 
                        <span className="block text-[10px] text-indigo-400/70 mt-0.5">{d.targetSellPrice}</span>
                      </td>
                      {CITIES.map(c => (
                        <td key={c} className="px-2 py-3">
                          <input 
                            type="number" min="0" placeholder="0"
                            value={matrixSellPrices[c] || ''}
                            onChange={(e) => updateMatrixSellPrice(c, Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        {(() => {
                           const b = getBestSellCity(matrixSellPrices);
                           if (b.city) {
                             return (
                               <div className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded inline-flex flex-col">
                                 <span>{b.price.toLocaleString()}</span>
                                 <span className="text-[10px] font-medium opacity-80 mt-0.5">at {b.city}</span>
                               </div>
                             );
                           }
                           return <span className="text-slate-600">-</span>;
                        })()}
                      </td>
                    </tr>
                    
                    {/* Materials Rows */}
                    {materials.map(mat => (
                      <tr key={mat.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 py-4 font-medium text-slate-300">
                          {mat.name || 'Unnamed Material'}
                           <span className="block text-[10px] text-slate-500 mt-0.5">{d.materialBuyPrice}</span>
                        </td>
                        {CITIES.map(c => (
                          <td key={c} className="px-2 py-3">
                            <input 
                              type="number" min="0" placeholder="0"
                              value={mat.cityPrices[c] || ''}
                              onChange={(e) => updateMaterialCityPrice(mat.id, c, Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3">
                           {(() => {
                             const b = getBestBuyCity(mat.cityPrices);
                             if (b.city) {
                               return (
                                 <div className="text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1.5 rounded inline-flex flex-col">
                                   <span>{b.price.toLocaleString()}</span>
                                   <span className="text-[10px] font-medium opacity-80 mt-0.5">at {b.city}</span>
                                 </div>
                               );
                             }
                             return <span className="text-slate-600">-</span>;
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

               <div className="mt-4 flex justify-between items-center px-2">
                 <p className="text-sm text-slate-400 italic">Toggle "{d.useOptimal}" in the Calculator to automatically apply these lowest costs.</p>
                 <button 
                    onClick={() => setActiveView('calculator')}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                   {d.returnToCalc}
                 </button>
               </div>
            </div>
          )}

          {activeView === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              
              {/* Input Section */}
              <div className="col-span-1 lg:col-span-2 xl:col-span-3 space-y-6">
                
                {/* Auto-Sync Banner */}
                <div className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  useMatrixPrices ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800 border-slate-700'
                }`}>
                  <div className="flex gap-3 items-center">
                    <div className={`p-2 rounded-lg ${useMatrixPrices ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
                      <Route className={`w-5 h-5 ${useMatrixPrices ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${useMatrixPrices ? 'text-emerald-100' : 'text-slate-200'}`}>{d.useOptimal}</h3>
                      <p className={`text-xs ${useMatrixPrices ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                        {d.optimalHelp}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUseMatrixPrices(!useMatrixPrices)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      useMatrixPrices ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useMatrixPrices ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Product Config Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 md:p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-400" /> {d.outputProduct}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1">{d.itemName}</label>
                      <input 
                        type="text" 
                        placeholder={`e.g. T6 ${category}`}
                        value={itemName} 
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <Tooltip text={d.amountCraftDesc}>
                        <label className="flex items-center gap-1 block text-sm font-medium text-slate-400 mb-1 cursor-help">
                          {d.amountCraft} <HelpCircle className="w-3 h-3 text-slate-500" />
                        </label>
                      </Tooltip>
                      <input 
                        type="number" 
                        min="1"
                        value={amountToCraft || ''} 
                        onChange={(e) => setAmountToCraft(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <Tooltip text={d.yieldDesc}>
                        <label className="flex items-center gap-1 block text-sm font-medium text-slate-400 mb-1 cursor-help">
                          {d.yieldPerCraft} <HelpCircle className="w-3 h-3 text-slate-500" />
                        </label>
                      </Tooltip>
                      <input 
                        type="number" 
                        min="1"
                        value={yieldPerCraft || ''} 
                        onChange={(e) => setYieldPerCraft(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center justify-between">
                        {d.sellPricePcs}
                        {useMatrixPrices && <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{d.auto}</span>}
                      </label>
                      
                      {useMatrixPrices ? (
                         <div className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-emerald-300 flex items-center justify-between">
                           <span>{calculations.effectiveSellPrice.toLocaleString()}</span>
                           {calculations.bestSellCity && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">{calculations.bestSellCity}</span>}
                         </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="w-3 h-3 text-slate-500" />
                          </div>
                          <input 
                            type="number" 
                            min="0"
                            value={sellPrice || ''} 
                            onChange={(e) => setSellPrice(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-1">
                      <Tooltip text={d.rrrDesc}>
                        <label className="flex items-center gap-1 block text-sm font-medium text-slate-400 mb-1 cursor-help">
                          {d.rrr} <HelpCircle className="w-3 h-3 text-slate-500" />
                        </label>
                      </Tooltip>
                      <select
                        value={rrr}
                        onChange={(e) => setRrr(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none"
                      >
                        {rrrOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Materials Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 md:p-6 shadow-sm overflow-visible">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-400" /> Materials Needed
                    </h2>
                    <button 
                      onClick={addMaterial}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Material
                    </button>
                  </div>

                  <div className="space-y-4">
                    {materials.map((mat) => {
                      const bestBuy = getBestBuyCity(mat.cityPrices);
                      const currentMatPrice = useMatrixPrices && bestBuy.price > 0 ? bestBuy.price : mat.unitPrice;

                      return (
                        <div key={mat.id} className="grid grid-cols-12 gap-3 items-end bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
                          <div className="col-span-12 sm:col-span-4 lg:col-span-5">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Material Name</label>
                            <input 
                              type="text" 
                              value={mat.name} 
                              onChange={(e) => updateMaterial(mat.id, 'name', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            />
                          </div>
                          <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Qty/Craft</label>
                            <input 
                              type="number" 
                              min="0.01" step="0.01"
                              value={mat.quantityPerCraft || ''} 
                              onChange={(e) => updateMaterial(mat.id, 'quantityPerCraft', Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            />
                          </div>
                          <div className="col-span-6 sm:col-span-4 lg:col-span-4">
                            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                              Unit Price
                              {useMatrixPrices && <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">AUTO</span>}
                            </label>
                            {useMatrixPrices ? (
                               <div className="w-full bg-slate-900 border border-emerald-500/50 rounded-md px-3 py-2 flex items-center justify-between">
                                 <span className="text-emerald-300 text-sm">{currentMatPrice > 0 ? currentMatPrice.toLocaleString() : '0'}</span>
                                 {bestBuy.city && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded tracking-wide uppercase">{bestBuy.city}</span>}
                               </div>
                            ) : (
                               <input 
                                type="number" 
                                min="0"
                                value={mat.unitPrice || ''} 
                                onChange={(e) => updateMaterial(mat.id, 'unitPrice', Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                              />
                            )}
                          </div>
                          <div className="col-span-12 sm:col-span-1 lg:col-span-1 flex justify-end">
                            <button 
                              onClick={() => removeMaterial(mat.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2 sm:mt-0"
                              title="Remove Material"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {materials.length === 0 && (
                      <div className="text-center py-6 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                        No materials added. Click "Add Material" to begin.
                      </div>
                    )}
                  </div>
                </div>

                {/* Station Fee Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 md:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                    <h2 className="text-xl font-semibold text-slate-200">{d.stationFeeContent}</h2>
                    <div className="flex bg-slate-900 rounded-lg p-1 w-full sm:w-auto">
                      <button 
                        onClick={() => setFeeMode('total')}
                        className={`flex-1 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${feeMode === 'total' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
                      >
                        {d.totalInput}
                      </button>
                      <button 
                         onClick={() => setFeeMode('calculate')}
                         className={`flex-1 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${feeMode === 'calculate' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
                      >
                        {d.calcCapacity}
                      </button>
                    </div>
                  </div>

                  {feeMode === 'total' ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex-[0.5] w-full relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="w-4 h-4 text-slate-500" />
                          </div>
                        <input 
                          type="number" 
                          min="0"
                          value={stationFeeTotal || ''} 
                          onChange={(e) => setStationFeeTotal(Number(e.target.value))}
                          placeholder={d.totalInput}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="text-xs text-slate-400 flex-[0.5]">
                        {d.totalFeeHelp}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Tooltip text={d.feePer100Desc}>
                          <label className="flex items-center gap-1 block text-xs font-medium text-slate-400 mb-1 cursor-help">
                            {d.feePer100} <HelpCircle className="w-3 h-3 text-slate-500" />
                          </label>
                        </Tooltip>
                        <input 
                          type="number" min="0" value={feePer100 || ''} onChange={e => setFeePer100(Number(e.target.value))} placeholder="e.g. 500"
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                         <Tooltip text={d.capDesc}>
                           <label className="flex items-center gap-1 block text-xs font-medium text-slate-400 mb-1 cursor-help">
                             {d.capPerCraft} <HelpCircle className="w-3 h-3 text-slate-500" />
                           </label>
                         </Tooltip>
                        <input 
                          type="number" min="0" value={capacityPerCraft || ''} onChange={e => setCapacityPerCraft(Number(e.target.value))} placeholder="e.g. 1.125"
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-2 text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                        <span>{d.calcTotalFee}</span>
                        <span className="font-semibold text-indigo-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {calculations.effectiveStationFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time & Rate Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 md:p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-slate-200 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" /> {d.timeRate}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-[0.5] w-full">
                      <label className="block text-xs font-medium text-slate-400 mb-1">{d.totalMins}</label>
                      <input 
                        type="number" 
                        min="1"
                        value={timeMinutes || ''} 
                        onChange={(e) => setTimeMinutes(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="text-xs text-slate-400 flex-[0.5]">
                      {d.timeHelp}
                    </div>
                  </div>
                </div>

              </div>

              {/* Profit Dashboard (Sticky) */}
              <div className="col-span-1 xl:col-span-1">
                <div className="sticky top-6 bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
                  
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{d.finSummary}</h3>
                    <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-slate-700/50 pb-2">
                       <Tooltip text={d.grossRevDesc}>
                        <span className="text-slate-400 text-sm flex items-center gap-1 cursor-help">{d.grossRev} <HelpCircle className="w-3 h-3 text-slate-500" /></span>
                      </Tooltip>
                      <span className="font-semibold text-slate-200">{calculations.grossRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-700/50 pb-2">
                      <Tooltip text={d.marketTaxDesc}>
                        <span className="text-slate-400 text-sm flex items-center gap-1 cursor-help">
                          {d.marketTax} <span className="text-[10px] text-slate-500">({isPremium ? '6.5%' : '10.5%'})</span> <HelpCircle className="w-3 h-3 text-slate-500" />
                        </span>
                      </Tooltip>
                      <span className="font-semibold text-red-400">-{calculations.marketTaxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-700/50 pb-2">
                      <Tooltip text={d.totalMatCostDesc}>
                        <span className="text-slate-400 text-sm flex items-center gap-1 cursor-help">{d.totalMatCost} <HelpCircle className="w-3 h-3 text-slate-500" /></span>
                      </Tooltip>
                      <span className="font-semibold text-slate-200">{calculations.netMaterialCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-700/50 pb-2">
                      <Tooltip text={d.stationFeeDesc}>
                        <span className="text-slate-400 text-sm flex items-center gap-1 cursor-help">{d.stationFeeLabel} <HelpCircle className="w-3 h-3 text-slate-500" /></span>
                      </Tooltip>
                      <span className="font-semibold text-slate-200">{calculations.effectiveStationFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <Tooltip text={d.netProfitDesc}>
                          <span className="text-slate-300 font-bold flex items-center gap-1 cursor-help">{d.netProfit} <HelpCircle className="w-4 h-4 text-slate-400" /></span>
                        </Tooltip>
                        <span className={`text-2xl font-bold ${calculations.netProfit > 0 ? 'text-emerald-400' : calculations.netProfit < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                          {calculations.netProfit > 0 ? '+' : ''}{calculations.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      
                      <div className="flex border border-slate-700 rounded-lg overflow-hidden mt-3 shadow-inner">
                        <div className="w-1/3 p-2 bg-slate-900/50 text-center border-r border-slate-700">
                          <Tooltip text={d.silverItem}>
                             <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 cursor-help">{d.silverItem}</div>
                          </Tooltip>
                          <div className={`font-semibold text-sm ${calculations.netProfit > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {calculations.totalItemsYielded > 0 ? formatNumberCompact(calculations.netProfit / calculations.totalItemsYielded) : 0}
                          </div>
                        </div>
                        <div className="w-1/3 p-2 bg-slate-900/50 text-center border-r border-slate-700">
                          <Tooltip text={d.marginDesc}>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 cursor-help">{d.margin}</div>
                          </Tooltip>
                          <div className={`font-semibold text-sm ${calculations.profitMargin > 20 ? 'text-emerald-400' : calculations.profitMargin > 0 ? 'text-yellow-400' : 'text-slate-300'}`}>
                            {calculations.profitMargin.toFixed(1)}%
                          </div>
                        </div>
                         <div className="w-1/3 p-2 bg-slate-900/50 text-center">
                          <Tooltip text={d.silverHrDesc}>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 cursor-help">{d.silverHr}</div>
                          </Tooltip>
                          <div className={`font-semibold text-sm ${calculations.profitPerHour > 0 ? 'text-emerald-400' : 'text-slate-300'}`} title={`${Math.floor(calculations.profitPerHour).toLocaleString()} Silver / Hr`}>
                            {calculations.profitPerHour > 0 ? formatNumberCompact(calculations.profitPerHour) : 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-xl mt-1">
                    <div className="flex gap-2 text-indigo-300 text-xs leading-relaxed">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                      <p>
                        {d.rrrReturnMsg1} <b className="text-indigo-200">{rrr}%</b> {d.rrrReturnMsg2} <b className="text-indigo-200">{calculations.totalMaterialReturnVal.toLocaleString()}</b> {d.rrrReturnMsg3}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
