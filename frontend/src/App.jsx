import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const EVENTS = [
  { id: 1, title: "Summer Sale Extravaganza", description: "Up to 70% off on all summer collections. Limited time only!", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80", redirect_url: "#" },
  { id: 2, title: "New Arrivals — Tech Edition", description: "Discover the latest gadgets and electronics hitting our shelves.", image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&q=80", redirect_url: "#" },
  { id: 3, title: "Flash Deal: Fashion Week", description: "Exclusive designer drops every hour. Don't blink or you'll miss it.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80", redirect_url: "#" },
  { id: 4, title: "Home & Living Fair", description: "Transform your space with curated home décor and furniture.", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=80", redirect_url: "#" },
  { id: 5, title: "Sports & Fitness Mega Sale", description: "Gear up for your goals. Equipment, apparel, and supplements.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80", redirect_url: "#" },
];

const PRODUCTS = [
  { id: 1, name: "Wireless Noise-Cancelling Headphones", category: "Electronics", description: "Premium sound with 30-hour battery life and active noise cancellation.", price: 2499, stock: 45, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80","https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80","https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&q=80"] },
  { id: 2, name: "Leather Crossbody Bag", category: "Fashion", description: "Genuine full-grain leather with brass fittings. Timeless everyday carry.", price: 3299, stock: 23, images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80","https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80"] },
  { id: 3, name: "Minimalist Desk Lamp", category: "Home & Living", description: "Adjustable arm with 3 colour temperatures and USB-C charging port.", price: 1899, stock: 67, images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80","https://images.unsplash.com/photo-1513506003901-1e6a35000864?w=600&q=80","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"] },
  { id: 4, name: "Running Shoes Pro X", category: "Sports", description: "Responsive foam midsole with breathable knit upper. 5km to marathon ready.", price: 4599, stock: 12, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80","https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80"] },
  { id: 5, name: "Stainless Steel Water Bottle", category: "Sports", description: "Triple-insulated keeps drinks cold 48h, hot 24h. 1L capacity.", price: 899, stock: 200, images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80","https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=600&q=80","https://images.unsplash.com/photo-1530735606863-2b6c0d91d3ce?w=600&q=80"] },
  { id: 6, name: "Ceramic Pour-Over Coffee Set", category: "Home & Living", description: "Hand-thrown ceramics with stainless dripper. Elevate your morning ritual.", price: 2199, stock: 34, images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80"] },
  { id: 7, name: "Ultrawide Monitor 34\"", category: "Electronics", description: "IPS panel, 144Hz, 1ms response. Built for productivity and gaming.", price: 32999, stock: 8, images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80","https://images.unsplash.com/photo-1593640408182-31c228814993?w=600&q=80","https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80"] },
  { id: 8, name: "Linen Relaxed Blazer", category: "Fashion", description: "Unstructured silhouette in premium Irish linen. Office to evening.", price: 5499, stock: 19, images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80","https://images.unsplash.com/photo-1594938298603-c8148c4b4f98?w=600&q=80","https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&q=80"] },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const uid = () => Math.random().toString(36).slice(2);

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type==="error" ? "#ef4444" : t.type==="success" ? "#22c55e" : "#1e293b",
          color:"#fff", padding:"12px 18px", borderRadius:12, fontSize:14, fontWeight:500,
          boxShadow:"0 8px 32px rgba(0,0,0,0.18)", pointerEvents:"all", display:"flex", alignItems:"center", gap:10, minWidth:220, maxWidth:320,
          animation:"slideUp 0.3s ease"
        }}>
          <span style={{fontSize:18}}>{t.type==="error"?"⚠️":t.type==="success"?"✓":"ℹ️"}</span>
          <span style={{flex:1}}>{t.message}</span>
          <button onClick={()=>remove(t.id)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:16,padding:0}}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── IMAGE SLIDER ─────────────────────────────────────────────────────────────
function ImageSlider({ images, height = 220 }) {
  const [idx, setIdx] = useState(0);
  const [touching, setTouching] = useState(null);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);
  const onTouchStart = e => setTouching(e.touches[0].clientX);
  const onTouchEnd = e => { if(touching===null) return; const dx = e.changedTouches[0].clientX - touching; if(dx < -40) next(); else if(dx > 40) prev(); setTouching(null); };
  return (
    <div style={{position:"relative",width:"100%",height,overflow:"hidden",borderRadius:"12px 12px 0 0",background:"#f1f5f9"}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {images.map((src,i) => (
        <img key={i} src={src} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:i===idx?1:0,transition:"opacity 0.4s ease"}} loading="lazy"/>
      ))}
      {images.length > 1 && <>
        <button onClick={prev} style={sliderBtnStyle("left")}>‹</button>
        <button onClick={next} style={sliderBtnStyle("right")}>›</button>
        <div style={{position:"absolute",bottom:10,left:0,right:0,display:"flex",justifyContent:"center",gap:6}}>
          {images.map((_,i)=><button key={i} onClick={()=>setIdx(i)} style={{width:i===idx?18:7,height:7,borderRadius:4,background:i===idx?"#6366f1":"rgba(255,255,255,0.7)",border:"none",cursor:"pointer",transition:"all 0.3s ease",padding:0}}/>)}
        </div>
      </>}
    </div>
  );
}
const sliderBtnStyle = side => ({ position:"absolute",top:"50%",transform:"translateY(-50%)",[side]:10,background:"rgba(255,255,255,0.85)",border:"none",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,color:"#334155",zIndex:2,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",backdropFilter:"blur(4px)" });

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, cart, user, setUser, dark, setDark, toast, searchOpen, setSearchOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);

  const handleLogout = () => { setUser(null); setDropOpen(false); toast("Signed out successfully","success"); };
  const doSearch = e => { e.preventDefault(); if(searchVal.trim()){ setPage("products"); setMenuOpen(false); } };

  const navLinks = [
    { label:"Home", key:"home" }, { label:"Products", key:"products" },
    { label:"About", key:"about" }, { label:"Contact", key:"contact" }
  ];

  return (
    <nav style={{ position:"sticky",top:0,zIndex:1000,background:dark?"#0f172a":"#fff",borderBottom:`1px solid ${dark?"#1e293b":"#e2e8f0"}`,boxShadow:"0 1px 12px rgba(0,0,0,0.07)" }}>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
        {/* Logo */}
        <div onClick={()=>setPage("home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:16}}>S</div>
          <span style={{fontWeight:700,fontSize:18,color:dark?"#f1f5f9":"#1e293b",letterSpacing:-0.5}}>ShopSphere</span>
        </div>

        {/* Desktop Links */}
        <div style={{display:"flex",alignItems:"center",gap:4}} className="desktop-nav">
          {navLinks.map(l=>(
            <button key={l.key} onClick={()=>setPage(l.key)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 14px",borderRadius:8,fontWeight:500,fontSize:14,color:page===l.key?"#6366f1":dark?"#94a3b8":"#64748b",background:page===l.key?(dark?"rgba(99,102,241,0.15)":"rgba(99,102,241,0.08)"):"none",transition:"all 0.2s"}}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Search */}
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {searchOpen && (
              <form onSubmit={doSearch} style={{display:"flex",alignItems:"center"}}>
                <input autoFocus value={searchVal} onChange={e=>setSearchVal(e.target.value)} placeholder="Search products..." style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${dark?"#334155":"#e2e8f0"}`,fontSize:13,width:180,background:dark?"#1e293b":"#f8fafc",color:dark?"#f1f5f9":"#1e293b",outline:"none"}}/>
              </form>
            )}
            <button onClick={()=>setSearchOpen(s=>!s)} style={iconBtn(dark)}>🔍</button>
          </div>

          {/* Dark mode */}
          <button onClick={()=>setDark(d=>!d)} style={iconBtn(dark)}>{dark?"☀️":"🌙"}</button>

          {/* Cart */}
          <button onClick={()=>setPage("cart")} style={{...iconBtn(dark),position:"relative"}}>
            🛒
            {cartCount>0 && <span style={{position:"absolute",top:-4,right:-4,background:"#ef4444",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</span>}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{position:"relative"}}>
              <button onClick={()=>setDropOpen(d=>!d)} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:24,border:`1px solid ${dark?"#334155":"#e2e8f0"}`,background:dark?"#1e293b":"#f8fafc",cursor:"pointer",color:dark?"#f1f5f9":"#334155",fontSize:13,fontWeight:500}}>
                <span style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12}}>{user.name[0]}</span>
                {user.name.split(" ")[0]}
                <span style={{fontSize:10}}>{dropOpen?"▲":"▼"}</span>
              </button>
              {dropOpen && (
                <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",background:dark?"#1e293b":"#fff",border:`1px solid ${dark?"#334155":"#e2e8f0"}`,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:180,overflow:"hidden",zIndex:100}}>
                  {[["My Profile","profile"],["My Orders","orders"],["Wishlist","wishlist"],["Settings","settings"]].map(([label,key])=>(
                    <button key={key} onClick={()=>{setPage(key);setDropOpen(false)}} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",fontSize:13,color:dark?"#e2e8f0":"#334155",fontWeight:500,transition:"background 0.15s"}} onMouseEnter={e=>e.target.style.background=dark?"rgba(255,255,255,0.05)":"#f8fafc"} onMouseLeave={e=>e.target.style.background="none"}>
                      {label}
                    </button>
                  ))}
                  <div style={{borderTop:`1px solid ${dark?"#334155":"#e2e8f0"}`,margin:"4px 0"}}/>
                  <button onClick={handleLogout} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#ef4444",fontWeight:500}}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={()=>setPage("login")} style={{padding:"8px 18px",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:20,fontWeight:600,fontSize:13,cursor:"pointer",transition:"opacity 0.2s"}} onMouseEnter={e=>e.target.style.opacity=0.85} onMouseLeave={e=>e.target.style.opacity=1}>
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button onClick={()=>setMenuOpen(m=>!m)} style={{...iconBtn(dark),display:"none"}} className="hamburger">{menuOpen?"✕":"☰"}</button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{background:dark?"#0f172a":"#fff",padding:"12px 24px 20px",borderTop:`1px solid ${dark?"#1e293b":"#e2e8f0"}`}}>
          {navLinks.map(l=>(
            <button key={l.key} onClick={()=>{setPage(l.key);setMenuOpen(false)}} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 0",background:"none",border:"none",cursor:"pointer",fontSize:15,fontWeight:500,color:dark?"#e2e8f0":"#334155",borderBottom:`1px solid ${dark?"#1e293b":"#f1f5f9"}`}}>
              {l.label}
            </button>
          ))}
        </div>
      )}
      <style>{`
        @media(max-width:768px){.desktop-nav{display:none!important}.hamburger{display:flex!important}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        *{box-sizing:border-box}
      `}</style>
    </nav>
  );
}
const iconBtn = dark => ({ background:"none",border:"none",cursor:"pointer",width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,position:"relative",transition:"background 0.15s",background:dark?"transparent":"transparent" });

// ─── HERO EVENTS SLIDER ───────────────────────────────────────────────────────
function EventsSlider({ dark }) {
  const [idx, setIdx] = useState(0);
  const [touching, setTouching] = useState(null);
  const timerRef = useRef(null);
  const n = EVENTS.length;

  const goTo = useCallback(i => { setIdx(((i % n) + n) % n); clearInterval(timerRef.current); timerRef.current = setInterval(()=>setIdx(x=>((x+1)%n)), 5000); }, [n]);

  useEffect(() => { timerRef.current = setInterval(()=>setIdx(x=>((x+1)%n)), 5000); return ()=>clearInterval(timerRef.current); }, [n]);

  const onTouchStart = e => setTouching(e.touches[0].clientX);
  const onTouchEnd = e => { if(touching===null) return; const dx = e.changedTouches[0].clientX - touching; if(dx < -50) goTo(idx+1); else if(dx > 50) goTo(idx-1); setTouching(null); };

  return (
    <section style={{padding:"24px 24px 8px",maxWidth:1280,margin:"0 auto"}}>
      <div style={{position:"relative",borderRadius:20,overflow:"hidden",boxShadow:"0 8px 40px rgba(99,102,241,0.15)",height:420}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {EVENTS.map((ev,i) => (
          <a key={ev.id} href={ev.redirect_url} style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",opacity:i===idx?1:0,transition:"opacity 0.6s ease",pointerEvents:i===idx?"all":"none",textDecoration:"none"}}>
            <img src={ev.image} alt={ev.title} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)"}}/>
            <div style={{position:"relative",padding:"40px 48px",zIndex:1}}>
              <div style={{display:"inline-block",background:"rgba(99,102,241,0.85)",color:"#fff",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,marginBottom:12,backdropFilter:"blur(8px)"}}>FEATURED EVENT</div>
              <h2 style={{margin:0,color:"#fff",fontSize:"clamp(20px,4vw,36px)",fontWeight:700,letterSpacing:-0.5,textShadow:"0 2px 12px rgba(0,0,0,0.4)"}}>{ev.title}</h2>
              <p style={{margin:"8px 0 0",color:"rgba(255,255,255,0.85)",fontSize:15,maxWidth:500}}>{ev.description}</p>
            </div>
          </a>
        ))}

        {/* Prev/Next */}
        <button onClick={()=>goTo(idx-1)} style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:22,color:"#fff",zIndex:10,backdropFilter:"blur(8px)",transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.35)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}>‹</button>
        <button onClick={()=>goTo(idx+1)} style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:22,color:"#fff",zIndex:10,backdropFilter:"blur(8px)",transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.35)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}>›</button>

        {/* Dots */}
        <div style={{position:"absolute",bottom:20,left:0,right:0,display:"flex",justifyContent:"center",gap:8,zIndex:10}}>
          {EVENTS.map((_,i)=><button key={i} onClick={()=>goTo(i)} style={{width:i===idx?28:8,height:8,borderRadius:4,background:i===idx?"#6366f1":"rgba(255,255,255,0.5)",border:"none",cursor:"pointer",transition:"all 0.3s ease",padding:0}}/>)}
        </div>
      </div>
    </section>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, addToCart, setPage, setCheckoutProduct, dark }) {
  const [hov, setHov] = useState(false);
  const { id, name, category, description, price, stock, images } = product;

  const handleBuyNow = () => { setCheckoutProduct(product); setPage("checkout"); };

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      background:dark?"#1e293b":"#fff", borderRadius:16, overflow:"hidden",
      boxShadow:hov?"0 16px 48px rgba(99,102,241,0.18)":"0 2px 12px rgba(0,0,0,0.07)",
      border:`1px solid ${dark?"#334155":"#f1f5f9"}`, transition:"all 0.3s ease",
      transform:hov?"translateY(-4px)":"none", display:"flex", flexDirection:"column"
    }}>
      <ImageSlider images={images} height={220}/>
      <div style={{padding:"16px 16px 20px",flex:1,display:"flex",flexDirection:"column",gap:6}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
          <h3 style={{margin:0,fontSize:14,fontWeight:600,color:dark?"#f1f5f9":"#1e293b",lineHeight:1.35}}>{name}</h3>
          <span style={{background:dark?"rgba(99,102,241,0.2)":"rgba(99,102,241,0.08)",color:"#6366f1",padding:"3px 8px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>{category}</span>
        </div>
        <p style={{margin:0,fontSize:12,color:dark?"#94a3b8":"#64748b",lineHeight:1.5,flex:1}}>{description}</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:19,fontWeight:700,color:"#6366f1"}}>{fmt(price)}</span>
          <span style={{fontSize:11,color:stock<10?"#ef4444":dark?"#94a3b8":"#64748b",fontWeight:500}}>{stock<10?`Only ${stock} left`:`${stock} in stock`}</span>
        </div>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>addToCart(product)} style={{flex:1,padding:"9px 0",background:dark?"rgba(99,102,241,0.15)":"rgba(99,102,241,0.08)",color:"#6366f1",border:"1px solid rgba(99,102,241,0.25)",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.2s"}} onMouseEnter={e=>{e.target.style.background="#6366f1";e.target.style.color="#fff"}} onMouseLeave={e=>{e.target.style.background=dark?"rgba(99,102,241,0.15)":"rgba(99,102,241,0.08)";e.target.style.color="#6366f1"}}>
            Add to Cart
          </button>
          <button onClick={handleBuyNow} style={{flex:1,padding:"9px 0",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer",transition:"opacity 0.2s"}} onMouseEnter={e=>e.target.style.opacity=0.85} onMouseLeave={e=>e.target.style.opacity=1}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ dark, addToCart, setPage, setCheckoutProduct }) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("default");
  const categories = ["All", ...new Set(PRODUCTS.map(p=>p.category))];
  let products = filter==="All" ? PRODUCTS : PRODUCTS.filter(p=>p.category===filter);
  if(sort==="price-asc") products = [...products].sort((a,b)=>a.price-b.price);
  if(sort==="price-desc") products = [...products].sort((a,b)=>b.price-a.price);
  if(sort==="name") products = [...products].sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <div>
      <EventsSlider dark={dark}/>
      <section style={{maxWidth:1280,margin:"0 auto",padding:"40px 24px 60px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:28}}>
          <div>
            <h2 style={{margin:0,fontSize:28,fontWeight:700,color:dark?"#f1f5f9":"#1e293b",letterSpacing:-0.5}}>Products</h2>
            <p style={{margin:"4px 0 0",color:dark?"#94a3b8":"#64748b",fontSize:14}}>{products.length} items</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>setFilter(c)} style={{padding:"7px 16px",borderRadius:20,border:`1px solid ${filter===c?"#6366f1":dark?"#334155":"#e2e8f0"}`,background:filter===c?"#6366f1":"none",color:filter===c?"#fff":dark?"#94a3b8":"#64748b",fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.2s"}}>{c}</button>
            ))}
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"7px 12px",borderRadius:10,border:`1px solid ${dark?"#334155":"#e2e8f0"}`,background:dark?"#1e293b":"#fff",color:dark?"#e2e8f0":"#334155",fontSize:13,cursor:"pointer",outline:"none"}}>
              <option value="default">Sort by Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:24}}>
          {products.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} setPage={setPage} setCheckoutProduct={setCheckoutProduct} dark={dark}/>)}
        </div>
      </section>
    </div>
  );
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────
function CartPage({ cart, setCart, setPage, dark, setCheckoutProduct }) {
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = subtotal + tax + shipping;

  const update = (id, delta) => setCart(c => c.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+delta)}:i));
  const remove = id => setCart(c=>c.filter(i=>i.id!==id));
  const clear = () => setCart([]);

  if(cart.length===0) return (
    <div style={{maxWidth:600,margin:"80px auto",textAlign:"center",padding:"0 24px"}}>
      <div style={{fontSize:72,marginBottom:16}}>🛒</div>
      <h2 style={{color:dark?"#f1f5f9":"#1e293b",margin:"0 0 8px"}}>Your cart is empty</h2>
      <p style={{color:dark?"#94a3b8":"#64748b",marginBottom:28}}>Looks like you haven't added anything yet.</p>
      <button onClick={()=>setPage("home")} style={primaryBtn}>Continue Shopping</button>
    </div>
  );

  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px 60px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32}}>
        <h1 style={{margin:0,fontSize:26,fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>Shopping Cart ({cart.length})</h1>
        <button onClick={clear} style={{background:"none",border:"none",color:"#ef4444",fontWeight:500,fontSize:13,cursor:"pointer"}}>Clear Cart</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:32,alignItems:"start"}} className="cart-grid">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {cart.map(item=>(
            <div key={item.id} style={{display:"flex",gap:16,background:dark?"#1e293b":"#fff",borderRadius:14,padding:16,border:`1px solid ${dark?"#334155":"#f1f5f9"}`,alignItems:"center"}}>
              <img src={item.images[0]} alt={item.name} style={{width:80,height:80,objectFit:"cover",borderRadius:10,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <h3 style={{margin:"0 0 4px",fontSize:14,fontWeight:600,color:dark?"#f1f5f9":"#1e293b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</h3>
                <p style={{margin:0,fontSize:12,color:dark?"#94a3b8":"#64748b"}}>{item.category}</p>
                <p style={{margin:"4px 0 0",fontWeight:700,color:"#6366f1",fontSize:15}}>{fmt(item.price)}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <button onClick={()=>update(item.id,-1)} style={qtyBtn(dark)}>−</button>
                <span style={{width:24,textAlign:"center",fontWeight:600,color:dark?"#f1f5f9":"#1e293b"}}>{item.qty}</span>
                <button onClick={()=>update(item.id,+1)} style={qtyBtn(dark)}>+</button>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontWeight:700,fontSize:14,color:dark?"#f1f5f9":"#1e293b"}}>{fmt(item.price*item.qty)}</div>
                <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:"#ef4444",fontSize:12,cursor:"pointer",marginTop:4}}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {/* Summary */}
        <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:24,border:`1px solid ${dark?"#334155":"#f1f5f9"}`,minWidth:280}}>
          <h3 style={{margin:"0 0 20px",fontWeight:700,fontSize:16,color:dark?"#f1f5f9":"#1e293b"}}>Order Summary</h3>
          {[["Subtotal",fmt(subtotal)],["GST (18%)",fmt(tax)],["Shipping",shipping===0?"Free":fmt(shipping)]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:12,fontSize:14,color:dark?"#94a3b8":"#64748b"}}>
              <span>{l}</span><span style={{fontWeight:500,color:dark?"#e2e8f0":"#334155"}}>{v}</span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${dark?"#334155":"#e2e8f0"}`,paddingTop:14,marginTop:4,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:16,color:dark?"#f1f5f9":"#1e293b"}}>
            <span>Total</span><span style={{color:"#6366f1"}}>{fmt(total)}</span>
          </div>
          {shipping===0 && <p style={{fontSize:11,color:"#22c55e",marginTop:8,fontWeight:500}}>✓ Free shipping on orders above ₹2,000</p>}
          <button onClick={()=>{ setCheckoutProduct(null); setPage("checkout"); }} style={{...primaryBtn,width:"100%",marginTop:20}}>Proceed to Checkout</button>
          <button onClick={()=>setPage("home")} style={{display:"block",width:"100%",marginTop:10,padding:"10px 0",background:"none",border:`1px solid ${dark?"#334155":"#e2e8f0"}`,borderRadius:12,color:dark?"#94a3b8":"#64748b",fontWeight:500,fontSize:14,cursor:"pointer"}}>Continue Shopping</button>
        </div>
      </div>
      <style>{`@media(max-width:700px){.cart-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
const qtyBtn = dark => ({ width:30,height:30,borderRadius:8,border:`1px solid ${dark?"#334155":"#e2e8f0"}`,background:dark?"#0f172a":"#f8fafc",color:dark?"#e2e8f0":"#334155",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" });

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id:"upi", label:"UPI", icon:"📱" },
  { id:"gpay", label:"Google Pay", icon:"🔵" },
  { id:"phonepe", label:"PhonePe", icon:"💜" },
  { id:"paytm", label:"Paytm", icon:"🔷" },
  { id:"debit", label:"Debit Card", icon:"💳" },
  { id:"credit", label:"Credit Card", icon:"💳" },
  { id:"netbanking", label:"Net Banking", icon:"🏦" },
  { id:"cod", label:"Cash on Delivery", icon:"💵" },
];

function CheckoutPage({ cart, checkoutProduct, dark, user, toast, setPage, setCart }) {
  const [form, setForm] = useState({ name: user?.name||"", email: user?.email||"", phone:"", address:"", city:"", state:"", country:"India", postal:"" });
  const [payment, setPayment] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const items = checkoutProduct ? [{...checkoutProduct, qty:1}] : cart;
  const subtotal = items.reduce((s,i)=>s+i.price*i.qty,0);
  const tax = Math.round(subtotal*0.18);
  const shipping = subtotal>2000?0:99;
  const total = subtotal+tax+shipping;

  const validate = () => {
    const e = {};
    if(!form.name.trim()) e.name="Full name required";
    if(!/\S+@\S+\.\S+/.test(form.email)) e.email="Valid email required";
    if(!/^\d{10}$/.test(form.phone)) e.phone="10-digit phone required";
    if(!form.address.trim()) e.address="Address required";
    if(!form.city.trim()) e.city="City required";
    if(!form.state.trim()) e.state="State required";
    if(!/^\d{6}$/.test(form.postal)) e.postal="6-digit postal code required";
    return e;
  };

  const handleOrder = () => {
    const e = validate();
    if(Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCart([]);
      toast("Order placed successfully! 🎉","success");
      setPage("orders");
    }, 2000);
  };

  const inp = (key, placeholder, type="text") => (
    <div>
      <input type={type} placeholder={placeholder} value={form[key]} onChange={e=>{setForm(f=>({...f,[key]:e.target.value}));setErrors(er=>({...er,[key]:null}))}}
        style={{width:"100%",padding:"10px 14px",border:`1px solid ${errors[key]?"#ef4444":dark?"#334155":"#e2e8f0"}`,borderRadius:10,background:dark?"#0f172a":"#f8fafc",color:dark?"#f1f5f9":"#1e293b",fontSize:14,outline:"none",transition:"border 0.2s"}}/>
      {errors[key]&&<p style={{margin:"4px 0 0",color:"#ef4444",fontSize:11}}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px 60px"}}>
      <h1 style={{margin:"0 0 32px",fontSize:26,fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>Checkout</h1>
      <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:32,alignItems:"start"}} className="checkout-grid">
        <div style={{display:"flex",flexDirection:"column",gap:24}}>
          {/* Customer info */}
          <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:24,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
            <h3 style={{margin:"0 0 20px",fontWeight:600,color:dark?"#f1f5f9":"#1e293b"}}>Customer Information</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {inp("name","Full Name")}{inp("email","Email Address","email")}
              {inp("phone","Phone Number","tel")}{inp("address","Street Address")}
              {inp("city","City")}{inp("state","State")}
              {inp("country","Country")}{inp("postal","Postal Code")}
            </div>
          </div>

          {/* Payment */}
          <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:24,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
            <h3 style={{margin:"0 0 20px",fontWeight:600,color:dark?"#f1f5f9":"#1e293b"}}>Payment Method</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10}}>
              {PAYMENT_METHODS.map(m=>(
                <button key={m.id} onClick={()=>setPayment(m.id)} style={{padding:"12px 8px",border:`2px solid ${payment===m.id?"#6366f1":dark?"#334155":"#e2e8f0"}`,borderRadius:12,background:payment===m.id?(dark?"rgba(99,102,241,0.15)":"rgba(99,102,241,0.05)"):"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all 0.2s"}}>
                  <span style={{fontSize:22}}>{m.icon}</span>
                  <span style={{fontSize:11,fontWeight:500,color:payment===m.id?"#6366f1":dark?"#94a3b8":"#64748b"}}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:24,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
          <h3 style={{margin:"0 0 16px",fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>Order Summary</h3>
          {items.map(item=>(
            <div key={item.id} style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
              <img src={item.images[0]} alt="" style={{width:48,height:48,objectFit:"cover",borderRadius:8,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontSize:12,fontWeight:500,color:dark?"#e2e8f0":"#334155",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</p>
                <p style={{margin:"2px 0 0",fontSize:11,color:dark?"#94a3b8":"#64748b"}}>Qty: {item.qty}</p>
              </div>
              <span style={{fontWeight:600,fontSize:13,color:dark?"#f1f5f9":"#1e293b",flexShrink:0}}>{fmt(item.price*item.qty)}</span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${dark?"#334155":"#e2e8f0"}`,paddingTop:12,marginTop:4}}>
            {[["Subtotal",fmt(subtotal)],["GST (18%)",fmt(tax)],["Shipping",shipping===0?"Free":fmt(shipping)]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13,color:dark?"#94a3b8":"#64748b"}}>
                <span>{l}</span><span style={{color:dark?"#e2e8f0":"#334155",fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${dark?"#334155":"#e2e8f0"}`,paddingTop:12,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:16,color:dark?"#f1f5f9":"#1e293b",marginBottom:20}}>
            <span>Total</span><span style={{color:"#6366f1"}}>{fmt(total)}</span>
          </div>
          <button onClick={handleOrder} disabled={loading} style={{...primaryBtn,width:"100%",opacity:loading?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}/> Processing...</>:"Place Order"}
          </button>
        </div>
      </div>
      <style>{`@media(max-width:700px){.checkout-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
function LoginPage({ setPage, setUser, dark, toast }) {
  const [form, setForm] = useState({ email:"", password:"", remember:false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = () => {
    const e = {};
    if(!/\S+@\S+\.\S+/.test(form.email)) e.email="Valid email required";
    if(form.password.length < 6) e.password="Password must be at least 6 characters";
    if(Object.keys(e).length){ setErrors(e); return; }
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      setUser({ id: uid(), name:"Demo User", email: form.email, role:"user" });
      toast("Welcome back!","success");
      setPage("home");
    }, 1200);
  };

  return (
    <div style={{minHeight:"calc(100vh - 200px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{width:"100%",maxWidth:420,background:dark?"#1e293b":"#fff",borderRadius:20,padding:40,boxShadow:"0 8px 40px rgba(0,0,0,0.1)",border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"#fff",fontWeight:700,fontSize:22}}>S</div>
          <h1 style={{margin:0,fontSize:24,fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>Welcome back</h1>
          <p style={{margin:"6px 0 0",color:dark?"#94a3b8":"#64748b",fontSize:14}}>Sign in to your ShopSphere account</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={labelStyle(dark)}>Email</label>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com" style={inputStyle(dark,errors.email)}/>
            {errors.email && <p style={errStyle}>{errors.email}</p>}
          </div>
          <div>
            <label style={labelStyle(dark)}>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" style={inputStyle(dark,errors.password)}/>
            {errors.password && <p style={errStyle}>{errors.password}</p>}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:dark?"#94a3b8":"#64748b"}}>
              <input type="checkbox" checked={form.remember} onChange={e=>setForm(f=>({...f,remember:e.target.checked}))} style={{accentColor:"#6366f1"}}/>
              Remember me
            </label>
            <button style={{background:"none",border:"none",color:"#6366f1",fontSize:13,cursor:"pointer",fontWeight:500}}>Forgot password?</button>
          </div>
          <button onClick={handle} disabled={loading} style={{...primaryBtn,width:"100%",marginTop:8,opacity:loading?0.7:1}}>
            {loading?"Signing in…":"Sign In"}
          </button>
          <p style={{textAlign:"center",fontSize:13,color:dark?"#94a3b8":"#64748b",margin:0}}>
            Don't have an account? <button onClick={()=>setPage("signup")} style={{background:"none",border:"none",color:"#6366f1",fontWeight:600,cursor:"pointer",padding:0}}>Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignupPage({ setPage, setUser, dark, toast }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", confirm:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = () => {
    const e = {};
    if(!form.name.trim()) e.name="Full name required";
    if(!/\S+@\S+\.\S+/.test(form.email)) e.email="Valid email required";
    if(!/^\d{10}$/.test(form.phone)) e.phone="10-digit phone required";
    if(form.password.length < 8) e.password="Minimum 8 characters";
    if(form.password !== form.confirm) e.confirm="Passwords don't match";
    if(Object.keys(e).length){ setErrors(e); return; }
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      setUser({ id:uid(), name:form.name, email:form.email, role:"user" });
      toast("Account created! Welcome to ShopSphere 🎉","success");
      setPage("home");
    }, 1400);
  };

  const fields = [
    ["name","text","Full Name","Your full name"],
    ["email","email","Email","you@example.com"],
    ["phone","tel","Phone","10-digit mobile number"],
    ["password","password","Password","Min 8 characters"],
    ["confirm","password","Confirm Password","Repeat your password"],
  ];

  return (
    <div style={{minHeight:"calc(100vh - 200px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{width:"100%",maxWidth:460,background:dark?"#1e293b":"#fff",borderRadius:20,padding:40,boxShadow:"0 8px 40px rgba(0,0,0,0.1)",border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <h1 style={{margin:0,fontSize:24,fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>Create account</h1>
          <p style={{margin:"6px 0 0",color:dark?"#94a3b8":"#64748b",fontSize:14}}>Join ShopSphere today</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {fields.map(([key,type,label,placeholder])=>(
            <div key={key}>
              <label style={labelStyle(dark)}>{label}</label>
              <input type={type} value={form[key]} onChange={e=>{setForm(f=>({...f,[key]:e.target.value}));setErrors(er=>({...er,[key]:null}))}} placeholder={placeholder} style={inputStyle(dark,errors[key])}/>
              {errors[key]&&<p style={errStyle}>{errors[key]}</p>}
            </div>
          ))}
          <button onClick={handle} disabled={loading} style={{...primaryBtn,width:"100%",marginTop:8,opacity:loading?0.7:1}}>
            {loading?"Creating account…":"Create Account"}
          </button>
          <p style={{textAlign:"center",fontSize:13,color:dark?"#94a3b8":"#64748b",margin:0}}>
            Already have an account? <button onClick={()=>setPage("login")} style={{background:"none",border:"none",color:"#6366f1",fontWeight:600,cursor:"pointer",padding:0}}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── USER PROFILE / DASHBOARD ─────────────────────────────────────────────────
function ProfilePage({ user, setUser, dark, toast }) {
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({ name: user.name, email: user.email, phone:"" });
  const [saved, setSaved] = useState(false);
  const MOCK_ORDERS = [
    { id:"ORD-2891", date:"2026-06-01", total:7298, status:"Delivered", items:3 },
    { id:"ORD-2764", date:"2026-05-18", total:2499, status:"Shipped", items:1 },
    { id:"ORD-2601", date:"2026-04-30", total:12900, status:"Processing", items:2 },
  ];
  const statusColor = s => s==="Delivered"?"#22c55e":s==="Shipped"?"#6366f1":s==="Processing"?"#f59e0b":"#94a3b8";

  const tabs = [["profile","👤 Profile"],["orders","📦 My Orders"],["wishlist","❤️ Wishlist"],["settings","⚙️ Settings"]];

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px 60px"}}>
      <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
        {/* Sidebar */}
        <div style={{width:200,flexShrink:0,background:dark?"#1e293b":"#fff",borderRadius:16,padding:16,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
          <div style={{textAlign:"center",padding:"16px 0 20px",borderBottom:`1px solid ${dark?"#334155":"#f1f5f9"}`,marginBottom:8}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:24,margin:"0 auto 10px"}}>{user.name[0]}</div>
            <p style={{margin:0,fontWeight:600,fontSize:14,color:dark?"#f1f5f9":"#1e293b"}}>{user.name}</p>
            <p style={{margin:"2px 0 0",fontSize:11,color:dark?"#94a3b8":"#64748b"}}>{user.email}</p>
          </div>
          {tabs.map(([key,label])=>(
            <button key={key} onClick={()=>setTab(key)} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 12px",background:tab===key?(dark?"rgba(99,102,241,0.15)":"rgba(99,102,241,0.08)"):"none",border:"none",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:tab===key?600:400,color:tab===key?"#6366f1":dark?"#94a3b8":"#64748b",marginBottom:2,transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{flex:1,minWidth:0}}>
          {tab==="profile" && (
            <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:28,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
              <h2 style={{margin:"0 0 24px",fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>Edit Profile</h2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[["name","text","Full Name"],["email","email","Email"],["phone","tel","Phone"]].map(([k,t,l])=>(
                  <div key={k} style={k==="email"?{gridColumn:"1/-1"}:{}}>
                    <label style={labelStyle(dark)}>{l}</label>
                    <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={inputStyle(dark)}/>
                  </div>
                ))}
              </div>
              <button onClick={()=>{setUser(u=>({...u,...form}));setSaved(true);setTimeout(()=>setSaved(false),2000);toast("Profile updated","success")}} style={{...primaryBtn,marginTop:20}}>
                {saved?"✓ Saved!":"Save Changes"}
              </button>
            </div>
          )}
          {tab==="orders" && (
            <div>
              <h2 style={{margin:"0 0 20px",fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>My Orders</h2>
              {MOCK_ORDERS.map(o=>(
                <div key={o.id} style={{background:dark?"#1e293b":"#fff",borderRadius:14,padding:20,border:`1px solid ${dark?"#334155":"#f1f5f9"}`,marginBottom:12,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <p style={{margin:0,fontWeight:600,fontSize:14,color:dark?"#f1f5f9":"#1e293b"}}>{o.id}</p>
                    <p style={{margin:"3px 0 0",fontSize:12,color:dark?"#94a3b8":"#64748b"}}>{new Date(o.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} · {o.items} item{o.items>1?"s":""}</p>
                  </div>
                  <span style={{fontWeight:700,color:dark?"#f1f5f9":"#1e293b",fontSize:15}}>{fmt(o.total)}</span>
                  <span style={{padding:"4px 12px",borderRadius:20,background:`${statusColor(o.status)}22`,color:statusColor(o.status),fontSize:12,fontWeight:600}}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
          {tab==="wishlist" && (
            <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:40,border:`1px solid ${dark?"#334155":"#f1f5f9"}`,textAlign:"center"}}>
              <div style={{fontSize:52}}>❤️</div>
              <h3 style={{color:dark?"#f1f5f9":"#1e293b",marginBottom:8}}>Your wishlist is empty</h3>
              <p style={{color:dark?"#94a3b8":"#64748b",fontSize:14}}>Save items you love for later.</p>
            </div>
          )}
          {tab==="settings" && (
            <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:28,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
              <h2 style={{margin:"0 0 20px",fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>Settings</h2>
              {[["Email Notifications","Get order updates via email"],["SMS Notifications","Get order updates via SMS"],["Marketing Emails","Receive deals and offers"]].map(([l,d])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
                  <div>
                    <p style={{margin:0,fontWeight:500,fontSize:14,color:dark?"#f1f5f9":"#1e293b"}}>{l}</p>
                    <p style={{margin:"2px 0 0",fontSize:12,color:dark?"#94a3b8":"#64748b"}}>{d}</p>
                  </div>
                  <input type="checkbox" defaultChecked style={{accentColor:"#6366f1",width:16,height:16,cursor:"pointer"}}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminPage({ dark, toast }) {
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState(PRODUCTS);
  const [events, setEvents] = useState(EVENTS);
  const MOCK_ORDERS = [
    { id:"ORD-2891", user:"Priya Sharma", total:7298, status:"Delivered", date:"2026-06-01" },
    { id:"ORD-2764", user:"Rahul Gupta", total:2499, status:"Shipped", date:"2026-05-18" },
    { id:"ORD-2601", user:"Neha Mehta", total:12900, status:"Processing", date:"2026-04-30" },
    { id:"ORD-2480", user:"Amit Patel", total:5499, status:"Pending", date:"2026-04-15" },
  ];
  const [orderStatus, setOrderStatus] = useState(() => Object.fromEntries(MOCK_ORDERS.map(o=>[o.id,o.status])));
  const statusColor = s => s==="Delivered"?"#22c55e":s==="Shipped"?"#6366f1":s==="Processing"?"#f59e0b":"#94a3b8";

  const adminTabs = [["overview","📊 Overview"],["products","📦 Products"],["events","🎉 Events"],["orders","📋 Orders"],["users","👥 Users"]];

  const stats = [
    { label:"Total Revenue", value:"₹2,89,450", icon:"💰", change:"+12%" },
    { label:"Total Orders", value:"147", icon:"📦", change:"+8%" },
    { label:"Active Users", value:"1,284", icon:"👥", change:"+23%" },
    { label:"Products", value:products.length, icon:"🛍️", change:"" },
  ];

  return (
    <div style={{maxWidth:1280,margin:"0 auto",padding:"40px 24px 60px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
        <div>
          <h1 style={{margin:0,fontSize:24,fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>Admin Dashboard</h1>
          <p style={{margin:"4px 0 0",color:dark?"#94a3b8":"#64748b",fontSize:13}}>Manage your store</p>
        </div>
        <span style={{padding:"6px 14px",background:"rgba(99,102,241,0.1)",color:"#6366f1",borderRadius:20,fontSize:12,fontWeight:600}}>Admin</span>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:28,flexWrap:"wrap"}}>
        {adminTabs.map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{padding:"8px 16px",borderRadius:10,border:"none",background:tab===key?"#6366f1":"none",color:tab===key?"#fff":dark?"#94a3b8":"#64748b",fontWeight:tab===key?600:400,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>
            {label}
          </button>
        ))}
      </div>

      {tab==="overview" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:32}}>
            {stats.map(s=>(
              <div key={s.label} style={{background:dark?"#1e293b":"#fff",borderRadius:14,padding:20,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontSize:26}}>{s.icon}</span>
                  {s.change&&<span style={{fontSize:11,fontWeight:600,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"2px 8px",borderRadius:20}}>{s.change}</span>}
                </div>
                <p style={{margin:0,fontSize:24,fontWeight:700,color:dark?"#f1f5f9":"#1e293b"}}>{s.value}</p>
                <p style={{margin:"4px 0 0",fontSize:12,color:dark?"#94a3b8":"#64748b"}}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:24,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
            <h3 style={{margin:"0 0 16px",fontWeight:600,color:dark?"#f1f5f9":"#1e293b"}}>Recent Orders</h3>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>{["Order ID","Customer","Total","Status","Date"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",color:dark?"#64748b":"#94a3b8",fontWeight:500,borderBottom:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {MOCK_ORDERS.map(o=>(
                    <tr key={o.id}>
                      <td style={{padding:"12px",color:"#6366f1",fontWeight:500,borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{o.id}</td>
                      <td style={{padding:"12px",color:dark?"#e2e8f0":"#334155",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{o.user}</td>
                      <td style={{padding:"12px",fontWeight:600,color:dark?"#f1f5f9":"#1e293b",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{fmt(o.total)}</td>
                      <td style={{padding:"12px",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}><span style={{padding:"3px 10px",borderRadius:20,background:`${statusColor(o.status)}22`,color:statusColor(o.status),fontWeight:600,fontSize:11}}>{o.status}</span></td>
                      <td style={{padding:"12px",color:dark?"#94a3b8":"#64748b",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab==="products" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{margin:0,fontWeight:600,color:dark?"#f1f5f9":"#1e293b"}}>Product Inventory ({products.length})</h3>
            <button onClick={()=>toast("Add product form — connect backend to persist","info")} style={primaryBtn}>+ Add Product</button>
          </div>
          <div style={{overflowX:"auto",background:dark?"#1e293b":"#fff",borderRadius:16,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr>{["","Name","Category","Price","Stock","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"12px 16px",color:dark?"#64748b":"#94a3b8",fontWeight:500,borderBottom:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>{h}</th>)}</tr></thead>
              <tbody>
                {products.map(p=>(
                  <tr key={p.id}>
                    <td style={{padding:"10px 16px",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}><img src={p.images[0]} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:8}}/></td>
                    <td style={{padding:"10px 16px",fontWeight:500,color:dark?"#e2e8f0":"#334155",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`,maxWidth:200}}>{p.name}</td>
                    <td style={{padding:"10px 16px",color:dark?"#94a3b8":"#64748b",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{p.category}</td>
                    <td style={{padding:"10px 16px",fontWeight:600,color:"#6366f1",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{fmt(p.price)}</td>
                    <td style={{padding:"10px 16px",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}><span style={{color:p.stock<10?"#ef4444":"#22c55e",fontWeight:500}}>{p.stock}</span></td>
                    <td style={{padding:"10px 16px",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`,display:"flex",gap:6}}>
                      <button onClick={()=>toast(`Edit ${p.name}—connect backend`,"info")} style={{padding:"5px 10px",fontSize:11,borderRadius:7,border:`1px solid ${dark?"#334155":"#e2e8f0"}`,background:"none",color:"#6366f1",cursor:"pointer",fontWeight:500}}>Edit</button>
                      <button onClick={()=>{setProducts(ps=>ps.filter(x=>x.id!==p.id));toast("Product deleted","success")}} style={{padding:"5px 10px",fontSize:11,borderRadius:7,border:"1px solid rgba(239,68,68,0.3)",background:"none",color:"#ef4444",cursor:"pointer",fontWeight:500}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="events" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{margin:0,fontWeight:600,color:dark?"#f1f5f9":"#1e293b"}}>Events ({events.length})</h3>
            <button onClick={()=>toast("Add event — connect backend","info")} style={primaryBtn}>+ Add Event</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {events.map(ev=>(
              <div key={ev.id} style={{background:dark?"#1e293b":"#fff",borderRadius:14,padding:16,border:`1px solid ${dark?"#334155":"#f1f5f9"}`,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                <img src={ev.image} alt="" style={{width:80,height:52,objectFit:"cover",borderRadius:8,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontWeight:600,fontSize:14,color:dark?"#f1f5f9":"#1e293b"}}>{ev.title}</p>
                  <p style={{margin:"3px 0 0",fontSize:12,color:dark?"#94a3b8":"#64748b"}}>{ev.description}</p>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>toast("Edit event — connect backend","info")} style={{padding:"6px 12px",fontSize:12,borderRadius:8,border:`1px solid ${dark?"#334155":"#e2e8f0"}`,background:"none",color:"#6366f1",cursor:"pointer",fontWeight:500}}>Edit</button>
                  <button onClick={()=>{setEvents(es=>es.filter(x=>x.id!==ev.id));toast("Event deleted","success")}} style={{padding:"6px 12px",fontSize:12,borderRadius:8,border:"1px solid rgba(239,68,68,0.3)",background:"none",color:"#ef4444",cursor:"pointer",fontWeight:500}}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="orders" && (
        <div>
          <h3 style={{margin:"0 0 16px",fontWeight:600,color:dark?"#f1f5f9":"#1e293b"}}>Order Management</h3>
          <div style={{overflowX:"auto",background:dark?"#1e293b":"#fff",borderRadius:16,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr>{["Order ID","Customer","Total","Status","Date","Update"].map(h=><th key={h} style={{textAlign:"left",padding:"12px 16px",color:dark?"#64748b":"#94a3b8",fontWeight:500,borderBottom:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>{h}</th>)}</tr></thead>
              <tbody>
                {MOCK_ORDERS.map(o=>(
                  <tr key={o.id}>
                    <td style={{padding:"12px 16px",color:"#6366f1",fontWeight:500,borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{o.id}</td>
                    <td style={{padding:"12px 16px",color:dark?"#e2e8f0":"#334155",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{o.user}</td>
                    <td style={{padding:"12px 16px",fontWeight:600,color:dark?"#f1f5f9":"#1e293b",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{fmt(o.total)}</td>
                    <td style={{padding:"12px 16px",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}><span style={{padding:"3px 10px",borderRadius:20,background:`${statusColor(orderStatus[o.id]||o.status)}22`,color:statusColor(orderStatus[o.id]||o.status),fontWeight:600,fontSize:11}}>{orderStatus[o.id]||o.status}</span></td>
                    <td style={{padding:"12px 16px",color:dark?"#94a3b8":"#64748b",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>{o.date}</td>
                    <td style={{padding:"12px 16px",borderBottom:`1px solid ${dark?"#1e293b":"#f8fafc"}`}}>
                      <select value={orderStatus[o.id]||o.status} onChange={e=>{setOrderStatus(s=>({...s,[o.id]:e.target.value}));toast(`Order ${o.id} updated to ${e.target.value}`,"success")}} style={{padding:"5px 8px",borderRadius:7,border:`1px solid ${dark?"#334155":"#e2e8f0"}`,background:dark?"#0f172a":"#f8fafc",color:dark?"#e2e8f0":"#334155",fontSize:12,cursor:"pointer",outline:"none"}}>
                        {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="users" && (
        <div>
          <h3 style={{margin:"0 0 16px",fontWeight:600,color:dark?"#f1f5f9":"#1e293b"}}>User Management</h3>
          <div style={{background:dark?"#1e293b":"#fff",borderRadius:16,padding:24,border:`1px solid ${dark?"#334155":"#f1f5f9"}`,textAlign:"center",color:dark?"#94a3b8":"#64748b",fontSize:14}}>
            <p style={{fontSize:32,margin:"0 0 8px"}}>👥</p>
            User list will populate from MongoDB when connected to the backend.<br/>
            <span style={{fontSize:12}}>Currently 1 demo user in session state.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIMPLE PAGES ─────────────────────────────────────────────────────────────
function AboutPage({ dark }) {
  return (
    <div style={{maxWidth:800,margin:"0 auto",padding:"60px 24px"}}>
      <h1 style={{fontWeight:700,fontSize:36,color:dark?"#f1f5f9":"#1e293b",letterSpacing:-0.5}}>About ShopSphere</h1>
      <p style={{fontSize:17,color:dark?"#94a3b8":"#475569",lineHeight:1.8,marginBottom:24}}>ShopSphere is a modern, full-featured e-commerce platform built to deliver a seamless shopping experience. From curated product selections to lightning-fast checkout, we've thought of everything so you don't have to.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:20,marginTop:40}}>
        {[["🚀","Fast Delivery","Orders fulfilled within 24–48 hours"],["🔒","Secure Payments","256-bit encrypted transactions"],["💬","24/7 Support","Round-the-clock customer service"],["↩️","Easy Returns","Hassle-free 30-day return policy"]].map(([ico,title,desc])=>(
          <div key={title} style={{background:dark?"#1e293b":"#fff",borderRadius:14,padding:20,border:`1px solid ${dark?"#334155":"#f1f5f9"}`,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:10}}>{ico}</div>
            <h3 style={{margin:"0 0 6px",fontWeight:600,color:dark?"#f1f5f9":"#1e293b",fontSize:14}}>{title}</h3>
            <p style={{margin:0,fontSize:12,color:dark?"#94a3b8":"#64748b"}}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPage({ dark, toast }) {
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const handle = () => { toast("Message sent! We'll get back to you within 24 hours.","success"); setForm({name:"",email:"",message:""}); };
  return (
    <div style={{maxWidth:600,margin:"0 auto",padding:"60px 24px"}}>
      <h1 style={{fontWeight:700,fontSize:32,color:dark?"#f1f5f9":"#1e293b",marginBottom:8}}>Get in Touch</h1>
      <p style={{color:dark?"#94a3b8":"#64748b",marginBottom:32,fontSize:15}}>Have a question? We'd love to hear from you.</p>
      <div style={{background:dark?"#1e293b":"#fff",borderRadius:20,padding:32,border:`1px solid ${dark?"#334155":"#f1f5f9"}`}}>
        {[["name","text","Full Name"],["email","email","Email Address"]].map(([k,t,l])=>(
          <div key={k} style={{marginBottom:16}}>
            <label style={labelStyle(dark)}>{l}</label>
            <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={inputStyle(dark)}/>
          </div>
        ))}
        <div style={{marginBottom:20}}>
          <label style={labelStyle(dark)}>Message</label>
          <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={5} style={{...inputStyle(dark),resize:"vertical"}}/>
        </div>
        <button onClick={handle} style={{...primaryBtn,width:"100%"}}>Send Message</button>
      </div>
      <div style={{display:"flex",gap:16,marginTop:24,flexWrap:"wrap"}}>
        {[["📧","support@shopsphere.in"],["📞","+91 98765 43210"],["📍","Mumbai, Maharashtra, India"]].map(([i,v])=>(
          <div key={v} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:dark?"#94a3b8":"#64748b"}}>
            <span>{i}</span><span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersPage({ dark }) {
  return (
    <div style={{maxWidth:800,margin:"0 auto",padding:"60px 24px"}}>
      <h1 style={{fontWeight:700,fontSize:28,color:dark?"#f1f5f9":"#1e293b",marginBottom:24}}>My Orders</h1>
      <div style={{background:dark?"#1e293b":"#fff",borderRadius:20,padding:60,border:`1px solid ${dark?"#334155":"#f1f5f9"}`,textAlign:"center"}}>
        <div style={{fontSize:60,marginBottom:12}}>📦</div>
        <h2 style={{color:dark?"#f1f5f9":"#1e293b"}}>No orders yet</h2>
        <p style={{color:dark?"#94a3b8":"#64748b"}}>Place your first order and it'll show up here.</p>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ dark, setPage }) {
  const [email, setEmail] = useState("");
  return (
    <footer style={{background:dark?"#0f172a":"#1e293b",color:"#94a3b8",marginTop:"auto"}}>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"48px 24px 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:32,marginBottom:40}}>
          {/* Brand */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:32,height:32,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14}}>S</div>
              <span style={{color:"#f1f5f9",fontWeight:700,fontSize:15}}>ShopSphere</span>
            </div>
            <p style={{fontSize:13,lineHeight:1.6,margin:0}}>Your one-stop destination for premium products delivered to your door.</p>
          </div>
          {/* Quick Links */}
          <div>
            <h4 style={{color:"#f1f5f9",fontSize:14,fontWeight:600,margin:"0 0 14px"}}>Quick Links</h4>
            {[["Home","home"],["Products","products"],["About","about"],["Contact","contact"]].map(([l,k])=>(
              <button key={k} onClick={()=>setPage(k)} style={{display:"block",background:"none",border:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",padding:"4px 0",transition:"color 0.2s",textAlign:"left"}} onMouseEnter={e=>e.target.style.color="#f1f5f9"} onMouseLeave={e=>e.target.style.color="#94a3b8"}>{l}</button>
            ))}
          </div>
          {/* Support */}
          <div>
            <h4 style={{color:"#f1f5f9",fontSize:14,fontWeight:600,margin:"0 0 14px"}}>Customer Support</h4>
            {["FAQ","Help Center","Shipping Policy","Return Policy"].map(l=>(
              <p key={l} style={{margin:"0 0 6px",fontSize:13,cursor:"pointer",transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="#f1f5f9"} onMouseLeave={e=>e.target.style.color="#94a3b8"}>{l}</p>
            ))}
          </div>
          {/* Newsletter */}
          <div>
            <h4 style={{color:"#f1f5f9",fontSize:14,fontWeight:600,margin:"0 0 14px"}}>Newsletter</h4>
            <p style={{fontSize:13,marginBottom:12}}>Get exclusive deals in your inbox.</p>
            <div style={{display:"flex",gap:6}}>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid #334155",background:"#1e293b",color:"#f1f5f9",fontSize:12,outline:"none"}}/>
              <button onClick={()=>{setEmail("");}} style={{padding:"8px 12px",background:"#6366f1",border:"none",borderRadius:8,color:"#fff",fontSize:12,cursor:"pointer",fontWeight:500,whiteSpace:"nowrap"}}>Subscribe</button>
            </div>
            <div style={{display:"flex",gap:12,marginTop:16}}>
              {["🐦","📸","💼","📘"].map((i,k)=>(
                <button key={k} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.05)",border:"none",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>{i}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{borderTop:"1px solid #334155",paddingTop:20,textAlign:"center",fontSize:12}}>
          © 2026 ShopSphere. All Rights Reserved. · Built with ❤️ in India
        </div>
      </div>
    </footer>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const primaryBtn = { padding:"11px 24px",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:12,fontWeight:600,fontSize:14,cursor:"pointer",transition:"opacity 0.2s" };
const labelStyle = dark => ({ display:"block",fontSize:12,fontWeight:500,color:dark?"#94a3b8":"#64748b",marginBottom:6 });
const inputStyle = (dark,err) => ({ width:"100%",padding:"10px 14px",border:`1px solid ${err?"#ef4444":dark?"#334155":"#e2e8f0"}`,borderRadius:10,background:dark?"#0f172a":"#f8fafc",color:dark?"#f1f5f9":"#1e293b",fontSize:14,outline:"none",transition:"border 0.2s" });
const errStyle = { margin:"4px 0 0",color:"#ef4444",fontSize:11 };

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(false);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const toast = useCallback((message, type="info") => {
    const id = uid();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const addToCart = useCallback((product) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id);
      if(existing) return c.map(i => i.id===product.id ? {...i,qty:i.qty+1} : i);
      return [...c, {...product, qty:1}];
    });
    toast(`${product.name.split(" ").slice(0,3).join(" ")} added to cart`, "success");
  }, [toast]);

  const bg = dark ? "#0f172a" : "#f8fafc";
  const color = dark ? "#f1f5f9" : "#1e293b";

  const renderPage = () => {
    switch(page) {
      case "home": return <HomePage dark={dark} addToCart={addToCart} setPage={setPage} setCheckoutProduct={setCheckoutProduct}/>;
      case "products": return <HomePage dark={dark} addToCart={addToCart} setPage={setPage} setCheckoutProduct={setCheckoutProduct}/>;
      case "cart": return <CartPage cart={cart} setCart={setCart} setPage={setPage} dark={dark} setCheckoutProduct={setCheckoutProduct}/>;
      case "checkout": return <CheckoutPage cart={cart} checkoutProduct={checkoutProduct} dark={dark} user={user} toast={toast} setPage={setPage} setCart={setCart}/>;
      case "login": return <LoginPage setPage={setPage} setUser={setUser} dark={dark} toast={toast}/>;
      case "signup": return <SignupPage setPage={setPage} setUser={setUser} dark={dark} toast={toast}/>;
      case "profile": return user ? <ProfilePage user={user} setUser={setUser} dark={dark} toast={toast}/> : <LoginPage setPage={setPage} setUser={setUser} dark={dark} toast={toast}/>;
      case "orders": return user ? <OrdersPage dark={dark}/> : <LoginPage setPage={setPage} setUser={setUser} dark={dark} toast={toast}/>;
      case "wishlist": return user ? <ProfilePage user={user} setUser={setUser} dark={dark} toast={toast}/> : <LoginPage setPage={setPage} setUser={setUser} dark={dark} toast={toast}/>;
      case "settings": return user ? <ProfilePage user={user} setUser={setUser} dark={dark} toast={toast}/> : <LoginPage setPage={setPage} setUser={setUser} dark={dark} toast={toast}/>;
      case "admin": return user?.role==="admin" ? <AdminPage dark={dark} toast={toast}/> : <LoginPage setPage={setPage} setUser={setUser} dark={dark} toast={toast}/>;
      case "about": return <AboutPage dark={dark}/>;
      case "contact": return <ContactPage dark={dark} toast={toast}/>;
      default: return (
        <div style={{textAlign:"center",padding:"80px 24px"}}>
          <p style={{fontSize:72}}>404</p>
          <h2 style={{color}}>Page not found</h2>
          <button onClick={()=>setPage("home")} style={primaryBtn}>Go Home</button>
        </div>
      );
    }
  };

  return (
    <div style={{minHeight:"100vh",background:bg,color,display:"flex",flexDirection:"column",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      <Navbar page={page} setPage={setPage} cart={cart} user={user} setUser={setUser} dark={dark} setDark={setDark} toast={toast} searchOpen={searchOpen} setSearchOpen={setSearchOpen}/>
      <main style={{flex:1}}>
        {renderPage()}
      </main>
      <Footer dark={dark} setPage={setPage}/>
      <Toast toasts={toasts} remove={id=>setToasts(t=>t.filter(x=>x.id!==id))}/>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        input,textarea,select{font-family:inherit}
        button{font-family:inherit}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#6366f1;border-radius:3px}
        @media(max-width:600px){
          .desktop-nav{display:none!important}
          .hamburger{display:flex!important}
        }
      `}</style>
    </div>
  );
}
