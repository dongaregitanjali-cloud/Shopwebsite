import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  ChefHat, 
  Leaf, 
  Coffee, 
  Lock, 
  CheckCircle, 
  X, 
  Plus, 
  Minus, 
  Edit,
  Save,
  MessageCircle,
  Sparkles,
  Loader2,
  Wand2,
  Bot
} from 'lucide-react';

const defaultMenu = [
  {
    id: 'cat1',
    category: 'Breakfast (ब्रेकफास्ट)',
    items: [
      { id: 'b1', name: 'Kande Pohe (कांदे पोहे)', desc: 'Traditional Maharashtrian flattened rice', price: 40, available: true, img: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=300&q=80' },
      { id: 'b2', name: 'Misal Pav (मिसळ पाव)', desc: 'Spicy sprouted moth bean curry with pav', price: 70, available: true, img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=300&q=80' },
      { id: 'b3', name: 'Upma (उपमा)', desc: 'Savory semolina porridge cooked with veggies', price: 40, available: true, img: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'cat2',
    category: 'Lunch/Dinner Thalis (थाळी)',
    items: [
      { id: 't1', name: 'Mini Veg Thali', desc: '2 Poli, 1 Bhaji, Dal, Rice, Pickle', price: 90, available: true, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80' },
      { id: 't2', name: 'Special Maharashtrian Thali', desc: '3 Poli, 2 Bhaji, Varan Bhaat, Sweet, Papad, Salad', price: 150, available: true, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'cat3',
    category: 'Extra Polis & Bhajis (पोळी आणि भाजी)',
    items: [
      { id: 'e1', name: 'Ghadichi Poli (Chapati)', desc: 'Soft layered whole wheat flatbread', price: 10, available: true, img: 'https://images.unsplash.com/photo-1565557618462-2ca8b1fa4e00?auto=format&fit=crop&w=300&q=80' },
      { id: 'e2', name: 'Jowar Bhakri', desc: 'Healthy traditional sorghum flatbread', price: 20, available: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568a70950?auto=format&fit=crop&w=300&q=80' },
      { id: 'e3', name: 'Daily Sukhi Bhaji', desc: 'Dry vegetable of the day (e.g., Batata, Kobi)', price: 40, available: true, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80' },
      { id: 'e4', name: 'Daily Patal Bhaji', desc: 'Gravy vegetable of the day (e.g., Usal, Matki)', price: 50, available: true, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80' }
    ]
  }
];

const callGeminiAPI = async (prompt, systemInstruction = "") => {
  const apiKey = ""; // Users can drop their Gemini API key here
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [craving, setCraving] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [generatingDescId, setGeneratingDescId] = useState(null);

  useEffect(() => {
    const savedMenu = localStorage.getItem('sarasMenuData');
    if (savedMenu) {
      setMenu(JSON.parse(savedMenu));
    } else {
      setMenu(defaultMenu);
      localStorage.setItem('sarasMenuData', JSON.stringify(defaultMenu));
    }
  }, []);

  const updateCart = (item, delta) => {
    setCart(prev => {
      const newCart = { ...prev };
      const currentQty = newCart[item.id]?.quantity || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) delete newCart[item.id];
      else newCart[item.id] = { ...item, quantity: newQty };
      return newCart;
    });
  };

  const cartTotal = useMemo(() => Object.values(cart).reduce((total, item) => total + (item.price * item.quantity), 0), [cart]);
  const cartItemCount = useMemo(() => Object.values(cart).reduce((count, item) => count + item.quantity, 0), [cart]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'SARASPOLIKENDRA2012') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setIsEditingMode(false);
  };

  const updateMenuItem = (catIndex, itemIndex, field, value) => {
    const newMenu = [...menu];
    newMenu[catIndex].items[itemIndex][field] = value;
    setMenu(newMenu);
  };

  const saveMenuChanges = () => {
    localStorage.setItem('sarasMenuData', JSON.stringify(menu));
    setIsEditingMode(false);
    alert("Menu updated successfully!");
  };

  const handleGenerateDescription = async (item, catIndex, itemIndex) => {
    setGeneratingDescId(item.id);
    try {
      const prompt = `Write a short, mouth-watering description (max 15 words) for the Maharashtrian dish: "${item.name}". Make it sound authentic and appetizing.`;
      const sysInst = "You are an expert food copywriter specializing in Indian/Maharashtrian cuisine.";
      let newDesc = await callGeminiAPI(prompt, sysInst);
      newDesc = newDesc.replace(/^["']|["']$/g, '').trim();
      updateMenuItem(catIndex, itemIndex, 'desc', newDesc);
    } catch (error) {
      alert("Please update your Gemini API key in App.jsx to run AI description features!");
    } finally {
      setGeneratingDescId(null);
    }
  };

  const handleGetSuggestion = async () => {
    if (!craving.trim()) return;
    setIsSuggesting(true);
    try {
      const availableItems = menu.flatMap(cat => cat.items.filter(i => i.available).map(i => i.name)).join(", ");
      const prompt = `Customer craving: "${craving}". Available menu items: ${availableItems}. Suggest 1 or 2 items from the menu that best fit this craving.`;
      const sysInst = "You are a friendly Maharashtrian virtual chef at 'Saras Poli Bhaji Kendra'. Keep your response under 3 sentences, enthusiastic, and ONLY suggest items that are exactly on the provided menu list.";
      const response = await callGeminiAPI(prompt, sysInst);
      setAiSuggestion(response);
    } catch (error) {
      setAiSuggestion("Please drop your Gemini API key inside App.jsx to unlock the AI Chef!");
    } finally {
      setIsSuggesting(false);
    }
  };

  const placeOrder = (e) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) return;
    let orderText = `*Hello Saras Poli Bhaji Kendra, I want to place an order:*\n\n*Customer Details:*\nName: ${customer.name}\nPhone: ${customer.phone}\nAddress: ${customer.address}\n\n*Order Summary:*\n`;
    Object.values(cart).forEach(item => { orderText += `- ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}\n`; });
    orderText += `\n*Total Amount: ₹${cartTotal}*\n\nThank you!`;
    window.open(`https://wa.me/918108674763?text=${encodeURIComponent(orderText)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 selection:bg-emerald-200">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-2 rounded-xl"><ChefHat size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-emerald-800 leading-tight">Saras Poli Bhaji Kendra</h1>
              <p className="text-xs text-emerald-600 font-medium">सरस पोळीभाजी केंद्र</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && <div className="hidden md:flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-semibold"><Lock size={14} /> Admin Mode</div>}
            <button onClick={() => document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' })} className="relative bg-emerald-50 text-emerald-700 p-2 rounded-full hover:bg-emerald-100 transition-colors">
              <ShoppingBag size={24} />
              {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{cartItemCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative bg-emerald-800 text-white overflow-hidden py-16 md:py-24 text-center">
        <div className="relative max-w-6xl mx-auto px-4 z-10">
          <span className="bg-emerald-500/30 border border-emerald-400/50 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4 inline-block">Authentic Maharashtrian Taste</span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4">Gharche Jevan, <br/><span className="text-emerald-300">Ata Baher Pan!</span></h2>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8 font-light">Experience the comfort of home-style cooking with our daily fresh tiffins, thalis, and traditional delicacies.</p>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center text-emerald-50 text-sm">
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full"><MapPin size={16} /> <span>Shop 4, Atriya Bldg, Brahmand, Thane (W)</span></div>
            <div className="flex gap-4">
              <a href="tel:8108674763" className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full"><span>8108674763</span></a>
              <a href="tel:8169289466" className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full"><span>8169289466</span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 mt-12 mb-4">
        <div className="bg-gradient-to-r from-emerald-50 to-green-100 rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-white p-4 rounded-full shadow-md text-emerald-600"><Sparkles size={32} /></div>
          <div className="flex-1 w-full">
            <h3 className="text-xl font-bold text-emerald-800 mb-2">✨ Ask our AI Chef!</h3>
            <p className="text-sm text-emerald-700 mb-4">Tell us what you're craving, and our AI will recommend the perfect meal from today's menu.</p>
            <div className="flex gap-2">
              <input type="text" value={craving} onChange={(e) => setCraving(e.target.value)} placeholder="E.g., I want something spicy and comforting..." className="flex-1 p-3 rounded-xl border border-emerald-200 outline-none bg-white" />
              <button onClick={handleGetSuggestion} className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl">Suggest</button>
            </div>
            {aiSuggestion && <div className="mt-4 bg-white rounded-xl p-4 border border-emerald-100 text-emerald-800 text-sm font-medium">{aiSuggestion}</div>}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-10 border-b-2 border-emerald-100 pb-4">
          <div><h2 className="text-3xl font-bold text-gray-800">Daily Menu</h2></div>
          {isAdmin && (
            <button onClick={() => setIsEditingMode(!isEditingMode)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
              {isEditingMode ? "View Mode" : "Edit Menu"}
            </button>
          )}
        </div>

        <div className="space-y-12">
          {menu.map((category, catIndex) => (
            <div key={category.id}>
              <h3 className="text-xl font-bold text-emerald-800 mb-6">{category.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, itemIndex) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border p-5">
                    <img src={item.img} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                    {isEditingMode ? (
                      <div className="space-y-2">
                        <input type="text" value={item.name} onChange={(e) => updateMenuItem(catIndex, itemIndex, 'name', e.target.value)} className="w-full font-bold border-b p-1" />
                        <div className="relative">
                          <textarea value={item.desc} onChange={(e) => updateMenuItem(catIndex, itemIndex, 'desc', e.target.value)} className="w-full text-sm border p-1 pr-8" rows="2" />
                          <button onClick={() => handleGenerateDescription(item, catIndex, itemIndex)} className="absolute bottom-2 right-2 text-emerald-600 bg-white p-1 rounded-full border"><Wand2 size={14} /></button>
                        </div>
                        <input type="number" value={item.price} onChange={(e) => updateMenuItem(catIndex, itemIndex, 'price', parseInt(e.target.value) || 0)} className="w-20 border p-1" />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                          <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">₹{item.price}</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">{item.desc}</p>
                        {item.available ? (
                          <div className="flex items-center justify-between mt-4">
                            {cart[item.id] ? (
                              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-1">
                                <button onClick={() => updateCart(item, -1)} className="p-1 text-emerald-700"><Minus size={14} /></button>
                                <span className="font-bold">{cart[item.id].quantity}</span>
                                <button onClick={() => updateCart(item, 1)} className="p-1 text-emerald-700"><Plus size={14} /></button>
                              </div>
                            ) : (
                              <button onClick={() => updateCart(item, 1)} className="w-full border-2 border-emerald-500 text-emerald-600 font-bold py-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">Add to Order</button>
                            )}
                          </div>
                        ) : <div className="text-center text-gray-400 py-2">Out of Stock</div>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="order-section" className="bg-white py-12 border-t">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-50 p-6 rounded-3xl border">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            {Object.keys(cart).length === 0 ? <p className="text-gray-400">Cart is empty</p> : (
              <div className="space-y-4">
                {Object.values(cart).map(item => (
                  <div key={item.id} className="flex justify-between bg-white p-3 rounded-xl shadow-sm">
                    <div><p className="font-semibold">{item.name}</p><p className="text-sm text-gray-500">₹{item.price} x {item.quantity}</p></div>
                    <div className="font-bold">₹{item.price * item.quantity}</div>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between font-bold text-lg"><span>Total:</span><span className="text-emerald-600">₹{cartTotal}</span></div>
              </div>
            )}
          </div>
          <form onSubmit={placeOrder} className="space-y-4">
            <input type="text" required placeholder="Full Name" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} className="w-full p-3 rounded-xl border" />
            <input type="tel" required placeholder="Phone Number" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} className="w-full p-3 rounded-xl border" />
            <textarea required placeholder="Delivery Address" value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} className="w-full p-3 rounded-xl border" rows="3" />
            <button type="submit" className="w-full py-4 rounded-xl text-white font-bold bg-[#25D366] flex items-center justify-center gap-2"><MessageCircle /> Place Order via WhatsApp</button>
          </form>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; 2026 Saras Poli Bhaji Kendra. All rights reserved.</p>
        <button onClick={() => isAdmin ? handleAdminLogout() : setShowAdminLogin(true)} className="mt-4 opacity-30 hover:opacity-100 text-gray-500"><Lock size={14} /></button>
      </footer>

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative">
            <button onClick={() => setShowAdminLogin(false)} className="absolute top-4 right-4"><X size={20} /></button>
            <h3 className="text-xl font-bold text-center mb-4">Admin Access</h3>
            <form onSubmit={handleAdminLogin}>
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password" className="w-full p-3 rounded-xl border mb-4 text-center" />
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Unlock</button>
              {loginError && <p className="text-red-500 text-xs mt-2 text-center">{loginError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
