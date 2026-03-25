import React, { useEffect, useMemo, useState } from 'react/ import {
Search,
Menu, x,
ChevronRight,
ShoppingBag,
LogOut,
Lock,
User,
Eye, EyeOff, plus,
Minus,
Pencil,
Trash2,
Save,
Image as Imagelcon,
Settings,
QrCode,
ScanLine,
BadgePercent,
} from I lucide-react l import { supabase } from I ./supabase l
const STORE_NAME = Denim Click/ const STORE_LOGO = I/logo-denimclick.pngl const ADMIN_USERNAME = 'Denim/ const ADMIN_PASSWORD = Denimzoa20261 const   = l apartados_admin_session_vl I const   = const WHATSAPP_NUMBER =
1525572665573/
const AUDIENCES = [ I Todd, 'Hombre',
I Dama I , I NifioI , Accesorios l , I Oferta I]
const   = {
Hombre: ['Jeans', Playeras l , I Sudaderas I ,
I Chamarras I , 'Shorts', Polo', Camisas l , ISuéterI],
Dama: ['Jeans', Playeras l , I Sudaderas I ,
I Chamarras I , 'Shorts', I Suéter I],
Nifio: ['Jeans', Playeras l , I Sudaderas I ,
I Chamarras I , 'Shorts', I Suéter I],
Accesorios: [Accesorios l],
Oferta: ['Jeans', Playeras l , I Sudaderas I ,
I Chamarras I , 'Shorts', Polo', Camisas l , I Suéter I, Accesorios l],
const JEANS_FITS = [Straight', 'Slim',
'Skinny', 'Regular', 'Relaxed', 'Baggy']
const BRANDS = [
Levi'S,
'Timberland',
IMI<I,
ICKI,
American Eagle',
ITommy Hilfiger',
'Burberry',
10trasI,
const   = {
Jeans: 399,
Playeras: 199,
Sudaderas: 349,
Chamarras: 499,
Shorts: 249,
Polo: 249,
Camisas: 299,
Suéter: 299,
Accesorios: 149,
const
 
Jeans: 349,
Playeras: 179,
Sudaderas: 31 9,
Chamarras: 449,
Shorts: 21 9,
Polo: 21 9,
Camisas: 269,
Suéter: 269,
Accesorios: 129,
const emptyCustomer = { name: phone: ,
city:  
delivery: 'Entrega en sucursal l, notes:
const emptySpeciaICIient = {
name:
phone: , client_code:  qr_value: 
price_mode: 'special_price l, discount_percent: 0, active: true, notes:
function uselsMobiIe(breakpoint = 980) { const [isMobiIe, setlsMobiIe] = useState( typeof window !== 'undefined/ ? window.innerWidth < breakpoint : false useEffect(() => { const onResize = () => setlsMobiIe(window.innerWidth < breakpoint) window.addEventListener(IresizeI, onResize) return () => window.removeEventListener(IresizeI, onResize)
}, [breakpoint])
return isMobiIe
function mxn(n) {
 
function uniqueVaIues(items) {
return [...new Set(items.fiIter(Boolean))]
function getAudienceCategories(audience, customCategories = [l) { if (audience ITodd) { return uniqueVaIues([...Object.vaIues(BASE_CATE
GORY_MAP).fIat(), ...customCategories])
return uniqueVaIues([...
 
...customCategories])
function getJeansFits(customFits = []) { return uniqueVaIues([...JEANS_FITS, ...customFits])
function getCover(product) {
return Array.isArray(product.images) && product.images.length ? product.images[0]
function totalStock(stock) { return Object.values(stock Il
{}).reduce((sum, n) => sum + Number(n Il
function normalizeProduct(row) { let images = 0
if (Array.isArray(row.images_json)) { images = row.images_json.fiIter(BooIean)
} else if (typeof row.images_json ===
'string/ && row.images_json.trim()) { try { const parsed = JSON.parse(row.images_json) images = Array.isArray(parsed) ? parsed.filter(BooIean) :  
} catch { images = row.images ? [row.images] : []
} else if (row.images) { images = [row.images]
const sizes = typeof row.sizes === 'string/ && row.sizes.trim()
? row.sizes.split(l,l).map((s) =>
s.trim()).fiIter(BooIean)  [I CH I, 'M I, I G I]
const stock = row.stock_json && typeof row.stock_json  'object/ && !
Array.isArray(row.stock_json)
? row.stock_json
 Object.fromEntries(sizes.map((s) =>
return { id: row.id, created_at: row.created_at, name: row.name Il "  description: row.description Il "  category: row.category Il 'Jeans', subcategory: row.subcategory Il "  audience: row.audience Il 'Hombre', brand: row.brand Il 1 0tras I, images, sizes, stock, stock_total: Number(row.stock Il totalStock(stock)), price: Number(row.price_base ?? row.price ?? 0), price_base: Number(row.price_base ?? row.price ?? 0), price_tier3: Number(row.price_tier3 ?? row.price_base ?? row.price ?? 0), price_tierl 0: Number(row.price_tierl 0 ?? row.price_base ?? row.price ?? 0), special_price: Number(row.special_price
active: row.active !== false, is_new: row.is_new !== false, is_offer: row.is_offer === true, sales_count: Number(row.sales_count Il
o), category_order:
Number(row.category_order Il 0),
function productToDb(product) { const stockTotal = totalStock(product.stock) return {
name: product.name, description: product.description, category: product.category, subcategory: product.subcategory Il "  audience: product.audience, brand: product.brand Il 1 0tras I, images: product.images?.[0] Il "  images_json: product.images Il L], sizes: (product.sizes Il  stock: stockTotal, stock_json: product.stock Il {}, price: Number(product.price Il 0), price_base: Number(product.price Il 0), price_tier3: Number(product.price_tier3
Il o), price_tierl 0:
Number(product.price_tierl 0 Il 0), speciaLprice:
Number(product.special_price Il 0), active: product.active !== false, is_new: product.is_new !== false, is_offer: product.is_offer === true, sales_count:
Number(product.sales_count Il 0), category_order:
Number(product.category_order Il 0),
function buildEmptyProduct() { return { name: description:  category: 'Jeans', subcategory: 'Straight', audience: 'Hombre', brand: Levi's', images: [l sizes: [28 1, 1 30 1, 1 32], stock: { 28: O, 30: O, 32: O  price:
price_tier3:
 
price_tierl 0:
 
special_price:
 
Jeans, active: true, is_new: true, is_offer: false, sales_count: 0, category_order: 0, customCategory:  customSubcategory: 
customBrand: 
function currentTier(totalPieces) { if (totalPieces >= 1 0) return { key:
I price_tierl 0 1, label: Precio 1 0+ piezas l }
if (totalPieces >= 3) return { key:
I price_tier3 1, label: Precio 3+ piezas l } return { key: 'price', label: Precio normal/ }
function Badge({ children, bg = I #f3f4f6 1, color = 1 1 827, border = 'none/ }) { return (
< span style={{ fontSize: 1 2, borderRadius: 999, padding: 1 5px 1 Opxl, background: bg, color, border, fontWeight: 700, display: 'inline-flex', alignltems: 'center', {children}
</span>
const styles = { app: { minHeight: I l 00vh I, background: I #f5f5f5 1, color: 1 1827,
container: { maxWidth: 1380, margin: 1 0 auto', padding: 1 0 1 8px I,
input: { width: I l 00 0/0 1, border: I l PX solid #dl d5db I, borderRadius: 1 6, padding: I l 2px 14px I,
outline: I none l , background: I #fffl ,
textarea: { width: I l 00 0/0 1, border: I l PX solid #dl d5db I , borderRadius: 1 6, padding: I l 2px 14px I , outline: I none l , background: I #fffl , minHeight: 1 10, resize: 'vertical', fontFamiIy: 'inherit',
buttonPrimary: { background: I #0f1 72a I , color: I #fffl , border: I none l , borderRadius: 1 6, padding: I l 2px 1 8px I , fontWeight: 700,
cursor: 'pointer', display: 'inline-flex', alignltems: 'center', justifyContent: 'center', gap: 8,
buttonSecondary: { background: I #fffl, color: '#1 1 1 827/, border: I l PX solid #dl d5db I, borderRadius: 1 6, padding: I l 2px 1 8pxI, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignltems: 'center', justifyContent: 'center', gap: 8,
card: { background: I #fffl,
border: I l PX solid #e5e7ebI, borderRadius: 24, boxShadow: 1 0 2px 1 Opx 
function ProductLightbox({ open, product, imagelndex, setlmagelndex, onCIose }) { if (!open Il !product) return null const images = product.images Il []
return (
<div style={{ position: 'fixed', inset: 0, background:  zlndex: 80, display: 'grid', placeltems: 'center', padding: 1 8,
<button type="button" onCIick={onCIose} style={{ position: 'absolute', top: 16, right: 1 6, background: I #fffl, border: I none l, borderRadius: 999, padding: 1 8px 12px I, cursor: 'pointer',
x
</button>
<div style={{ width: I l 00 0/0 1, maxWidth:
980  
<div style={{ color: I #fffl, marginBottom: 1 2, display: 'flex', justifyContent: 'space-between', gap: 1 2 }}>
<strong>{product.name}</strong>
<span>{imagelndex + 1} /
{images.length}</span>
</div>
<div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 
<img src={images[imagelndex]} alt={product.name} style={{ width: I l 00 0/0  , maxHeight:
{images.length > 1 && (
<button type="button" onCIick={() => setlmagelndex((p)
=> (p - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 1 0, top: 1 50 0/0 1, transform: 
background: I #fffl, border: I none l, borderRadius: 999, cursor: 'pointer', padding: I l Opx 14px I,
</button>
<button type="button" onCIick={() => setlmagelndex((p)
=> (p + 1 ) % images.length)} style={{ position: 'absolute', right: 1 0, top: 1 50 0/0 1, transform: 
background: I #fffl, border: I none l, borderRadius: 999, cursor: 'pointer', padding: I l Opx 14px I,
</button>
</div>
{images.length > 1 && (
<div style={{ display: 'grid', gap: 8, grid TemplateCoIumns: I repeat(6, 1 fry, margin Top: 12 }}>
{images.map((img, idx) =>  
<button key={idx} type="button" onCIick={() => setlmagelndex(idx)} style={{ padding: 0, border: idx === imagelndex ?
1 2px solid #fffl : I l PX solid
 
borderRadius: 12, overflow: 'hidden', background: 'transparent', cursor: 'pointer',
 
I l 00 0/0 1, height: 64, objectFit: 'cover/ }} />
</button>
</div>
</div>
</div>
function ImprovePriceModaI({ open, onCIose, specialCode, setSpeciaICode, loginSpeciaICIient, scanningMessage, specialCIientSession, logoutSpeciaICIient,
if (!open) return null
return (
<div style={{ position: 'fixed', inset: 0, background:  zlndex: 70, display: 'grid', placeltems: 'center', padding: 1 8,
<div style={{ ...styles.card, width:
I l 00 0/0 1, maxWidth: 560, padding: 24 }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignltems: 'center', gap: 12 }}>
<h3 style={{ margin: 0, fontSize: 30 }}
>Mejora tu preci0</h3>  style={{ margin: 1 6px 0 0 1, color:
I #6b7280 1 }}>
Ingresa tu cödigo o escanéalo para activar precio especial.
</div>
<button type="button" onCIick={onCIose} style={styles.buttonSecondary}>
<X size={1 6} />
</button>
</div>
{specialCIientSession ? (
<div style={{ margin Top: 1 8, border: I l PX solid #e5e7ebI, borderRadius: 20, padding: 1 6 
<div style={{ display: 'flex', gap: 1 0, alignltems: 'center', marginBottom: 1 0 }}> <BadgePercent size={1 8} />
<strong>CIiente especial activo</ strong>
</div>
 style={{ margin: 1 6px 0/ }}
><strong>Nombre:</strong>
{specialCIientSession.name}</p>  style={{ margin: 1 6px 0/ }}
><strong>Cödigo:</strong>
{specialCIientSession.cIient_code}</p>  style={{ margin: 1 6px 0/ }}
><strong>Modo de precio:</strong>
{specialCIientSession.price_mode}</p>
<div style={{ margin Top: 14 }}>
<button type="button" style={styIes.buttonSecondary} onCIick={IogoutSpeciaICIient}>
Cerrar sesiön especial
</button>
</div>
</div>
<div style={{ margin Top: 1 8, display:
'grid', gap: 14 
<input style={styles.input} placeholder="Escribe tu cödigo" value={speciaICode} onChange={(e) => setSpeciaICode(e.target.vaIue)}
<div style={{ display: 'flex', gap: 1 2, flexWrap: 'wrap/ }}>
<button type="button" style={styles.buttonPrimary} onClick={() => loginSpecialClient(specialCode)}>
<Lock size={1 6} />
Entrar con código
</button>
<button type="button" style={styles.buttonSecondary} onClick={() 	{
const fakeScan = prompt(I Pega aquí el valor del QR o código del cliente) if (fakeScan)
loginSpecialClient(fakeScan)
<ScanLine size={1 6} />
Escanear código
</button>
</div>
 style={{ margin: 0, color:
I #6b7280 1, fontSize: 14 }}>
{scanningMessage ll 'La opción de escaneo rápido ya queda preparada.
Por ahora puedes pegar el valor del QR.I}
</div>
</div>
</div>
function DesktopMegaMenu({ activeAudience, closeMenu, products, setStoreAudience, setStoreCategory,
setStoreBrand, setStoreFit, customCategories, customFits,
const [hoveredCategory, setHoveredCategory] = useState(") const categories = getAudienceCategories(activeAudience, customCategories).filter((c) => c !==
Playeral) const brands = uniqueVaIues([
...BRANDS,
...products
.filter((p) => (activeAudience === ITodd
? true : p.audience === activeAudience))
.map((p) => p.brand),
const fitList = getJeansFits(customFits)
return (
<div style={{ position: 'absolute', left: 0, right: 0,
top: I l 00 0/0 1, background: 1 1 31 5 1, color: I #fffl, borderTop: I l PX solid
 
zlndex: 30,
onMouseLeave={cIoseMenu}
<div style={{ ...styles.container, padding Top: 28, paddingBottom: 28 }}>
<div style={{ display: 'grid', grid TemplateCoIumns:
hoveredCategory === 'Jeans/ ? I l fr 1 fr 1 fr
I frl : I l fr I fr Ifrl, gap: 40,
<h4 style={{ margin Top: 0, fontSize:
1 8 }}>{activeAudience}</h4>
<div style={{ display: 'grid', gap: 1 2 }}
{categories.map((cat) =>  
<button key={cat} type="button" onMouseEnter={() => setHoveredCategory(cat)} onCIick={() => { if (cat === 'Jeans) return
setStoreAudience(activeAudience) setStoreCategory(cat) setStoreFit(ITodosI) setStoreBrand(ITodasI) closeMenu()
style={{ background: 'transparent', border: I nonel, color: I #dl d5dbI, textAIign: I left l, cursor: 'pointer', padding: 0, fontSize: 1 6, display: 'flex', justifyContent: 'space-between', alignltems: 'center',
<span>{cat}</span>
{cat === 'Jeans/ ? <ChevronRight size={1 6} /> : null}
</button>
</div>
</div>
{hoveredCategory === 'Jeans/ && (
<h4 style={{ margin Top: 0, fontSize: 1 8 }}>Fit</h4>
<div style={{ display: 'grid', gap: 12
{fitList.map((fit) =>  
<button key={fit} type="button" onCIick={() => {
setStoreAudience(activeAudience) setStoreCategory(IJeansI) setStoreFit(fit) setStoreBrand(ITodasI) closeMenu()
style={{ background: 'transparent', border: I nonel, color: I #dl d5db I, textAIign: I left l, cursor: 'pointer', padding: 0, fontSize: 1 6,
{fit}
</button>
</div>
</div>
<h4 style={{ margin Top: 0, fontSize:
1 8 }}>Marcas</h4>
<div style={{ display: 'grid', gap: 12 }}
{brands.map((brand) =>  
<button key={brand}
type="button"
	onCIick={() 	{
setStoreAudience(activeAudience) setStoreCategory(ITodosI) setStoreFit(ITodosI) setStoreBrand(brand) closeMenu()
style={{ background: 'transparent', border: I nonel, color: I #dl d5dbI, textAIign: I left l, cursor: 'pointer', padding: 0, fontSize: 1 6,
{brand}
</button>
</div>
</div>
<h4 style={{ margin Top: 0, fontSize:
1 8 }}>Explorar</h4>
<div style={{ display: 'grid', gap: 1 2 }}
<button type="button" onCIick={() => {
setStoreAudience(activeAudience) setStoreCategory(ITodosI) setStoreFit(ITodosI) setStoreBrand(ITodasI)
closeMenu()
style={{ background: 'transparent', border: I none l, color: I #dl d5db I, textAIign: I left l, cursor: 'pointer', padding: 0, fontSize: 16,
Ver todo {activeAudience}
</button>
<button type="button" style={{ background: 'transparent', border: I none l, color: I #dl d5db I,
textAIign: I leftl, cursor: 'pointer', padding: 0, fontSize: 16,
Mejora tu precio
</button>
</div>
</div>
</div>
</div>
</div>
function MobileMenu({ open, close, products, setStoreAudience, setStoreCategory, setStoreBrand, setStoreFit, customCategories, customFits,
const [step, setStep] = useState(IaudiencesI) const [selectedAudience, setSeIectedAudience] = useState(I HombreI) const [selectedCategory, setSeIectedCategory] = useState(")
useEffect(() => { if (!open) { setStep(IaudiencesI) setSeIectedAudience(IHombreI) setSeIectedCategory(")
 [open])
if (!open) return null
const categories = getAudienceCategories(seIectedAudience, customCategories).filter((c) => c !==
Playeral) const brands = uniqueVaIues([
...BRANDS,
...products
.filter((p) => (selectedAudience ===
ITodd ? true : p.audience === selectedAudience))
.map((p) => p.brand),
const fits = getJeansFits(customFits)
return (
<div style={{ position: 'fixed', inset: 0, background:   zlndex: 50 }}>
<div style={{
width: 1 86 0/0 1, maxWidth: 430,
height: I l 00 0/0 1, background: 	1 1 31 5 1, color: I #fffl, padding: 24, overflowY: l autol,
<div style={{ display: 'flex', justifyContent: 'space-between', alignltems: 'center/ }}>
 width: 1 1 0, objectFit: 'contain/ }} />
<button type="button" onCIick={cIose} style={{ background: 'transparent', border: I none l, color: I #fffl, cursor: 'pointer/ }} <X size={30} />
</button>
</div>
{step !== 'audiences/ && (
<button
type="button" onCIick={() 	{ if (step === 'categories) setStep(IaudiencesI) if (step === 'fits) setStep(IcategoriesI) if (step === brands) setStep(IcategoriesI)
style={{ margin Top: 1 8, background: 'transparent', border: I none l, color: I #dl d5db I, cursor: 'pointer',
padding: 0, fontSize: 1 5,
  Volver
</button>
<div style={{ margin Top: 22, display:
'grid', gap: 22 }}>
{step === 'audiences/ &&
 l
<button key={aud}
type="button" onCIick={() 	{
setSeIectedAudience(aud) setStep(IcategoriesI)
style={{
background: 'transparent', border: I nonel, color: I #fffl, fontSize: 28, display: 'flex', justifyContent: 'space-between', alignltems: 'center', cursor: 'pointer', padding: 0,
<span>{aud}</span>
<ChevronRight />
</button>
{step === 'categories/ && (
<h3 style={{ margin: 0, fontSize: 34
}}>{seIectedAudience}</h3>
<button type="button"
	onCIick={() 	{
setStoreAudience(seIectedAudience) setStoreCategory(ITodosI) setStoreFit(ITodosI) setStoreBrand(ITodasI) close()
style={{ background: 'transparent', border: I nonel, color: I #fffl, fontSize: 22, textAIign: I leftl, cursor: 'pointer', padding: 0,
Ver todo
</button>
{categories.map((cat) =>  
<button key={cat} type="button" onCIick={() => { if (cat === 'Jeans) { setSeIectedCategory(cat) setStep(IfitsI)
} else {
setStoreAudience(seIectedAudience) setStoreCategory(cat) setStoreFit(ITodosI) setStoreBrand(ITodasI) close()
style={{ background: 'transparent',
border: I nonel, color: I #fffl, fontSize: 22, display: 'flex', justifyContent: 'space-between', alignltems: 'center', cursor: 'pointer', padding: 0,
<span>{cat}</span>
{cat === 'Jeans/ ? <ChevronRight
/> : null}
</button>
<button type="button" onCIick={() => setStep(I brands I)} style={{ margin Top: 1 0,
background: 'transparent', border: I nonel, color: I #dl d5dbI, fontSize: 20, display: 'flex', justifyContent: 'space-between', alignltems: 'center', cursor: 'pointer', padding: 0,
<span>Marcas</span>
<ChevronRight /> </button>
	{step 	'fits/ && (
<h3 style={{ margin: 0, fontSize: 34 {fits.map((fit) =>  
<button key={fit}
type="button"
	onCIick={() 	{
setStoreAudience(seIectedAudience)
setStoreCategory(seIectedCategory) setStoreFit(fit) setStoreBrand(ITodasI) close()
style={{ background: 'transparent', border: I nonel, color: I #fffl, fontSize: 22,
textAIign: I left l, cursor: 'pointer', padding: 0,
{fit}
</button>
{step === brands' && (
<h3 style={{ margin: 0, fontSize: 34
}}>Marcas</h3>
{brands.map((brand) =>  
<button key={brand} type="button" onCIick={() => {
setStoreAudience(seIectedAudience) setStoreCategory(ITodosI) setStoreFit(ITodosI) setStoreBrand(brand) close()
style={{ background: 'transparent', border: I none l, color: I #fffl, fontSize: 22, textAIign: I left l, cursor: 'pointer', padding: 0,
{brand}
</button>
</div>
</div>
</div>
function ProductCard({ product, selectedConfig, setSeIectedConfig, onAddToCart, onOpenGaIlery, specialCIientSession,
const current = selectedConfig[product.id] Il { size:
quantity: 0,
const activeSize = current.size const stockForSeIected =
Number(product.stock?.[activeSize] Il 0) const priceToShow = specialCIientSession?.active
? Number(product.special_price Il product.price Il 0)
 Number(product.price Il 0)
const setSize = (size) =>  const available =
Number(product.stock?.[size] Il 0) setSeIectedConfig((prev) => 
...prev,
[product.id]: { size, quantity: available > 0 ?
Math.min(prev[product.id]?.quantity Il 1, available) : 0,
const setQuantity = (qty) 
const available =
Number(product.stock?.[activeSize] Il 0) const clean = Math.max(0,
Math.min(Number(qty Il 0), available)) setSeIectedConfig((prev) => 
...prev,
[product.id]: { size: activeSize, quantity: clean,
return (
<div style={{ ...styles.card, overflow:
'hidden/	 
<button type="button" onCIick={()  onOpenGaIIery(product)} style={{
width: I l 00 0/0 1, border: I none l, background: I #f3f4f6 1, padding: 0, cursor: 'pointer', aspectRatio: 1 4 / 4.35,
{getCover(product) ? (
<img src={getCover(product)} alt={product.name} style={{ width: I l 00 0/0 1, height: I l 00 0/0 1, objectFit: 'cover/ }} />
<div style={{ width: I l 00 0/0 1, height:
I l 00 0/0 1, display: 'grid', placeltems: 'center/ }}
<lmagelcon size={42}
 
</div>
</button>
<div style={{ padding: 1 8 }}>
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 1 0 }}>
<Badge>{product.audience}</Badge>
<Badge bg="#fff" border="l PX solid
#d1d5db">{product.brand}</Badge>
{product.category === 'Jeans/ && product.subcategory ? (
<Badge bg="#dbeafe"  d4ed8">{product.subcategory}</
Badge>
) : null}
{product.is_new ? <Badge  color="#fff">Nuevo</
Badge> : null}
{product.sales_count > 0 ? <Badge bg="#f59e0b" color="#fff">Mås vendid0</ Badge> : null}
{specialCIientSession?.active ?
<Badge bg="#065f46" color="#fff">Precio
especial</Badge> : null}
</div>
<h4 style={{ margin: 0, fontSize: 22 }}
>{product.name}</h4>  style={{ margin: 1 8px 0 0 1, color:
I #6b7280 1 }}>{product.category}</p>  style={{ margin: I l Opx 0 0 1, color:
I #6b7280 1, minHeight: 48 }}>
{product.description Il 'Sin descripciönl}
<div style={{ margin Top: 14 }}>  style={{ margin: 0, fontWeight:
800, fontSize: 22 }}>{mxn(priceToShow)}</
</div>
<div style={{ margin Top: 14 }}>  style={{ margin: 1 0 0 8pxI, fontSize:
1 3, color: I #6b7280 1, fontWeight: 700 }}
>TaIlas</p>
<div style={{ display: 'flex', gap: 8, flexWrap: I wrap l }}>
{(product.sizes Il []).map((size) =>  const qty =
Number(product.stock?.[size] Il 0) const selected = activeSize ===
size return (
<button key={size}
type="button" onCIick={() => qty > 0 && setSize(size)} style={{ border: selected ? 1 2px solid
#0f172aI : I l PX solid #dl d5db I, borderRadius: 14, background: qty > 0 ? I #fffl :
I#f3f4f61, padding: 1 8px 1 Opxl, minWidth: 54, cursor: qty > 0 ? 'pointer' : 'notallowed', opacity: qty > 0 ? 1 : 0.6,
<div style={{ fontWeight: 700 }}
>{size}</div>
<div style={{ fontSize: 1 1, color:
I #6b7280 1, margin Top: 4 }}>{qty} pz</div> </button>
</div>
</div>
{activeSize ? (
<div style={{ margin Top: 1 4 }}>
<div style={{ display: 'flex',
alignltems: 'center', gap: 10, flexWrap:
Iwrapl 
<button type="button" onCIick={() => setQuantity((current.quantity Il 0) - 1)} style={styIes.buttonSecondary}>
<Minus size={1 6} />
</button>
<input type="number"
max={stockForSeIected} value={current.quantity} onChange={(e) => setQuantity(e.target.value)} style={{ ...styles.input, width: 86, textAIign: 'center/ }}
<button type="button" onCIick={()
=> setQuantity((current.quantity Il 0) + 1)}
style={styles.buttonSecondary}>
<PIus size={1 6} />
</button>
<span style={{ color: I #6b7280 1, fontSize: 14 }}>
Disponible: {stockForSeIected} pz
</span>
</div>
</div>
) : null}
<button type="button" onCIick={() => onAddToCart(product)} disabled={!activeSize Il
Number(current.quantity Il 0) <= 0} style={{
...styles.buttonPrimary,
width: I l 00 0/0 1, margin Top: 16,
opacity: !activeSize Il
Number(current.quantity Il 0) <= 
Agregar producto
</button>
</div>
</div>
function CartSection({ isMobiIe, cart, setCart, customer, setCustomer, sendOrder, specialCIientSession,
const totalPieces = useMemo(() =>
cart.reduce((sum, item) => sum +
Number(item.quantity Il 0), 0), [cart])
const tier = currentTier(totaIPieces)
const getUnitPrice = (product) =>  if (specialCIientSession?.active) return Number(product.special_price Il product.price Il 0) return Number(product[tier.key] Il product.price Il 0)
const subtotal = useMemo(() => { return cart.reduce((sum, item) => sum + getUnitPrice(item.product) *
Number(item.quantity Il 0), 0)
}, [cart, tier, specialCIientSession])
const updateItemQty = (index, nextQty)
setCart((prev)  const next = [...prev] const item = next[index] if (!item) return prev const max =
Number(item.product.stock?.[item.size] Il
o) const clean = Math.max(0,
Math.min(Number(nextQty Il 0), max)) next[index] = { ...item, quantity: clean } return next.filter((x) =>
Number(x.quantity Il 0) > 0)
const removeltem = (index) =>  setCart((prev) => prev.filter((_,  index))
return (
<section style={{ paddingBottom: 54 }}>
<div style={styles.container}>
<div style={{ display: 'grid', gap: 24, grid TemplateCoIumns: isMobile ? I l frl :
I l .05fr .95frI  
<div style={{ ...styles.card, padding:
24  
<div style={{ display: 'flex', justifyContent: 'space-between', gap: 1 2, alignltems: 'center', flexWrap: 'wrap/ }}>
<h3 style={{ margin: 0, fontSize:
30 }}>Carrit0</h3>  style={{ margin: 1 6px 0 0 1, color: I #6b7280 1 }}>
Aqui verås tus productos, piezas y total a pagar.
</div>
<div style={{ display: 'flex', gap: 1 0,
flexWrap: 'wrap/ }}>
{specialCIientSession?.active ? ( <Badge  color="#fff">Precio especial cliente</ Badge>
<Badge bg="#eef2ff" color="#3730a3">{tier.IabeI}</Badge>
<Badge>{totaIPieces} pz</Badge>
</div>
</div>
<div style={{ display: 'grid', gap: 14, margin Top: 1 8 }}>
{cart.length === 0 (
<div style={{ border: I l PX dashed #dl d5dbI, borderRadius: 20, padding: 26,
textAIign: 'center', color: I #6b7280 1,
Tu carrito estå vacio.
</div>
cart.map((item, index) =>  const unit = getUnitPrice(item.product) const lineTotaI = unit *
Number(item.quantity Il 0)
const stock =
Number(item.product.stock?.[item.size] Il
o)
return (  <div solid #e5e7ebI, borderRadius: 20, padding: <div style={{ display: 'grid', gap: 1 2, grid TemplateCoIumns: isMobiIe ? I l frl : 1 84px 1 fr auto', alignltems: 'start l }}> <div style={{ borderRadius:
1 6, overflow: 'hidden', background:
I#f3f4f61	 
{getCover(item.product) ? ( <img src={getCover(item.product)} alt={item.product.name} style={{ width: I l 00 0/0 1, height: 84, objectFit: 'cover/ }} />
<div style={{ width: I l 00 0/0 1, height: 84, display: 'grid', placeltems:
'center/ }}>
<lmagelcon size={28} color="#9ca3af" />
</div>
</div>
<h4 style={{ margin: 0, fontSize: 20 }}>{item.product.name}</h4>  style={{ margin: 1 6px 0 0 1, color: I #6b7280 1  
{item.product.brand} •
{item.product.category}
 style={{ margin: 1 6px 0 0 1, color: I #6b7280 1 }}>TaIla: {item.size}</p>  style={{ margin: 1 6px 0 0 1, color: I #6b7280 1  
Precio unitario actual: {mxn(unit)}
</div>
<div style={{ display: 'grid', gap: 1 0 }}>
<div style={{ display: 'flex', alignltems: 'center', gap: 8 }}>
<button type="button" style={styIes.buttonSecondary} onCIick={()
=> updateItemQty(index, item.quantity - 1)}
<Minus size={1 6} />
</button>
<input
 
max={stock} value={item.quantity} onChange={(e) => updateItemQty(index, e.target.value)} style={{ ...styles.input, width: 74, textAIign: 'center/ }}
<button type="button" style={styIes.buttonSecondary} onCIick={() => updateItemQty(index, item.quantity + 1)} <Plus size={1 6} />
</button>
<div style={{ fontWeight:
800, textAlign: isMobile ? I left l : I right l }} >{mxn(lineTotal)}</div>
<button type="button" style={styles.buttonSecondary} onClick={() => removeltem(index)}> Eliminar
</button>
</div>
</div>
</div>
</div>
<div style={{ display: 'grid', gap: 14, grid TemplateCoIumns: isMobile ? I l frl :
I repeat(3, 1 fry, margin Top: 1 8 }}>
<div style={{ background: I #f3f4f6 1, borderRadius: 20, padding: 1 6 }}>  style={{ margin: 0, fontSize: 14, color: I #6b7280 1 }}>Piezas totales</p>  style={{ margin: 1 6px 0 0 1, fontSize: 28, fontWeight: 800 }} >{totaIPieces}</p>
</div>
<div style={{ background: I #f3f4f6 1, borderRadius: 20, padding: 1 6 }}>  style={{ margin: 0, fontSize: 14, color: I #6b7280 1 }}>Precio aplicad0</p>  style={{ margin: 1 6px 0 0 1, fontSize: 20, fontWeight: 800 }}>
{specialCIientSession?.active ?
Precio especial clientel : tier.label}
</div>
1
<div style={{ background: I #f3f4f6 , borderRadius: 20, padding: 1 6 }}>  style={{ margin: 0, fontSize: 14, color: I #6b7280 1 }}>Total a pagar</p>  style={{ margin: 1 6px 0 0 1, fontSize: 28, fontWeight: 800 }} >{mxn(subtotal)}</p>
</div>
</div>
</div>
<div style={{ ...styles.card, padding:
24  
<h3 style={{ margin: 0, fontSize: 30 }}
>Datos del cliente</h3>  style={{ margin: 1 6px 0 0 1, color:
I #6b7280 1 }}>
Completa tus datos y envia el
pedido por WhatsApp.
<div style={{ display: 'grid', gap: 14, margin Top: 1 8 }}>
<input style={styles.input} placeholder="Nombre del cliente" value={customer.name} onChange={(e) => setCustomer((p) =>	...p, name:
e.target.value }))}
<input style={styles.input} placeholder="TeIéfono" value={customer.phone} onChange={(e) => setCustomer((p) =>	...p, phone:
e.target.value }))}
<input style={styles.input} placeholder="Ciudad o estado" value={customer.city} onChange={(e) => setCustomer((p) => ({ ...p, city:
e.target.value }))}
<select style={styles.input} value={customer.delivery} onChange={(e) => setCustomer((p) =>	...p, delivery:
e.target.value }))}
<option value="Entrega en sucursal">Entrega en sucursal</option>
<option value="Envios">Envios</
option>
<option value="Entrega en punto medio">Entrega en punto medi0</option>
</select>
<textarea style={styles.textarea} placeholder="Notas o comentarios" value={customer.notes} onChange={(e) => setCustomer((p) => ...p, notes:
e.target.value }))}
</div>
<button type="button" style={{ ...styles.buttonPrimary, width: I l 00 0/0 1, margin Top: 1 8 }} onCIick={sendOrder}
disabled={cart.length === 0}
<ShoppingBag size={1 8} />
Solicitar pedido
</button>
</div>
</div>
</div>
</section>
function ProductForm({ draft, setDraft, onSave, onCanceI, loading, saveLabeI, products }) { const [newSize, setNewSize] = useState(")
const customCategories = uniqueValues( products
.map((p) => p.category) .filter((c) 	!
uniqueVaIues(Object.values(BASE_CATEG
ORY_MAP).fIat()).incIudes(c))
const customFits = uniqueValues( products.map((p) =>
p.subcategory).filter((s) => s && !
 
const customBrands = uniqueVaIues(products.map((p) =>
p.brand).filter((b) => b && !
BRANDS.incIudes(b)))
const categories = getAudienceCategories(draft.audience, customCategories).filter((c) => c !==
Playeral) const fits = getJeansFits(customFits) const brands = uniqueVaIues([...BRANDS,
...customBrands])
const addFiles = (files) =>  const list = Array.from(files Il
[]).filter((file)  file.type.startsWith(Iimage/I)) if (!list.length) return
Promise.all( list.map(
(file)  new Promise((resolve) =>  const reader = new FileReader() reader.onload = () => resolve(String(reader.resuIt Il ")) reader.readAsDataURL(fiIe)
).then((images) => { setDraft((prev) => ({ ...prev, images: 
(prev.images Il	...images].fiIter(BooIean)
const removelmage = (index) =>  setDraft((prev)	...prev, images:
(prev. images Il []).filter((_,	- index)
const updateSizesFromText = (text) =>  const sizes =   =>
s.trim()).fiIter(BooIean) const nextSizes = sizes.length ? sizes .
[I CH I, 'M I, I G I] const nextStock =
Object.fromEntries(nextSizes.map((s) =>
[s, Number(draft.stock?.[s] Il 0)])) setDraft((prev)	...prev, sizes: nextSizes, stock: nextStock })) const addSize = () { const value = newSize.trim() if (!value Il draft.sizes.includes(value)) return setDraft((prev)  ...prev, sizes: [...prev.sizes, value], stock: { ...prev.stock, [value]: 0 },
setNewSize(")
const removeSize = (sizeToRemove) =>  if (draft.sizes.length <= 1 ) return const nextSizes = draft.sizes.filter((s) => s !== sizeToRemove) const nextStock =
Object.fromEntries(nextSizes.map((s) =>
[s, Number(draft.stock?.[s] Il 0)])) setDraft((prev)	...prev, sizes:
nextSizes, stock: nextStock }))
return (
<div style={{ display: 'grid', gap: 1 6 }}> <div style={{ display: 'grid', gap: 1 6, grid TemplateCoIumns: I l fr 1 frl }}>
<input style={styles.input} placeholder="Nombre del producto" value={draft.name} onChange={(e) => setDraft((p) => 
...p, name: e.target.value }))}
<select style={styles.input} value={draft.audience} onChange={(e) =>  const audience = e.target.value const nextCategory = getAudienceCategories(audience, customCategories)[0] Il 'Jeans/ const base =
 
ory] Il 0 const special =
 
nextCategory] Il 0 setDraft((p) 
audience, category: nextCategory, subcategory: nextCategory ===
'Jeans/ ? 'Straight/ •  price: base, price_tier3: base, price_tierl 0: base, special_price: special,
ITodol).map((aud) =>  
<option key={aud} value={aud}>{aud} </option>
</select>
</div>
<div style={{ display: 'grid', gap: 1 6, grid TemplateCoIumns: I l fr 1 frl }}>
<select style={styles.input} value={draft.category} onChange={(e) =>  const category = e.target.value const base =
 
const special =
 
category] Il 0
setDraft((p) 
category, subcategory: category === 'Jeans/
? 'Straight/ •  price: base, price_tier3: base, price_tierl 0: base, special_price: special,
{categories.map((cat) =>  
<option key={cat} value={cat}>{cat}
</option>
</select>
<input style={styles.input} placeholder="O crea una categoria personalizada" value={draft.customCategory Il "} onChange={(e) => setDraft((p) => 
...p, customCategory: e.target.value }))}
</div>
{draft.category === 'Jeans/ && (
<div style={{ display: 'grid', gap: 1 6, grid TemplateCoIumns: I l fr 1 frl }}>
<select style={styles.input} value={draft.subcategory} onChange={(e) => setDraft((p) => 
...p, subcategory: e.target.value }))}
{fits.map((fit) =>  
<option key={fit} value={fit}>{fit}</ option>
</select>
<input style={styles.input} placeholder="O crea un fit personalizado" value={draft.customSubcategory Il "} onChange={(e) => setDraft((p) => 
...p, customSubcategory: e.target.value }))}
</div>
<div style={{ display: 'grid', gap: 1 6, grid TemplateCoIumns: I l fr 1 frl }}>
<select style={styles.input} value={draft.brand} onChange={(e) => setDraft((p) => 
...p, brand: e.target.value }))}
{brands.map((brand) =>  
<option key={brand} value={brand}
>{brand}</option>
</select>
<input style={styles.input} placeholder="O crea una marca personalizada" value={draft.customBrand Il "} onChange={(e) => setDraft((p) => 
...p, customBrand: e.target.value }))}
</div>
<textarea style={styles.textarea} placeholder="Descripciön" value={draft.description} onChange={(e) => setDraft((p) => 
...p, description: e.target.value }))}
<div style={{ display: 'grid', gap: 14, grid TemplateCoIumns: I repeat(4, 1 fry }}>
<input style={styles.input} type="number" placeholder="Precio normal" value={draft.price} onChange={(e) => setDraft((p) => 
...p, price: Number(e.target.value) }))}
<input style={styles.input} type="number" placeholder="Precio 3+" value={draft.price_tier3} onChange={(e) => setDraft((p) => 
...p, price_tier3: Number(e.target.value) }))}
<input
style={styles.input} type="number" placeholder="Precio 1 0+ 11 value={draft.price_tierl 0} onChange={(e) => setDraft((p) => 
...p, price_tierl 0: Number(e.target.value)
<input style={styles.input} type="number" placeholder="Precio especial" value={draft.special_price} onChange={(e) => setDraft((p) => 
...p, special_price: Number(e.target.value)
</div>
<div onDragOver={(e) => e.preventDefauIt()}
	onDrop={(e) 	{
e.preventDefauIt() addFiles(e.dataTransfer.fiIes)
style={{ border: I l PX dashed #dl d5db I, borderRadius: 1 8, padding: 20, background: I #f9fafb I, textAIign: 'center', cursor: 'pointer',
<label style={{ cursor: 'pointer', display: block/ }}>
<lmagelcon size={34} color="#9ca3af" />  style={{ margin: I l Opx 0 4pxI, fontWeight: 700 }}>Sube imågenes del product0</p>  style={{ margin: 0, color: I #6b7280 1
}}>Puedes arrastrarlas o hacer clic aqui</
<input type="file" accept="image/*" multiple style={{ display: 'none/ }} onChange={(e) => addFiIes(e.target.fiIes)}
</label>
</div>
{(draft.images Il []).length > 0 && (
<div style={{ display: 'grid', gap: 8, grid TemplateCoIumns: I repeat(4, 1 fry }}>
{draft.images.map((img, index) =>  
<div key={index} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: I l PX solid #e5e7eb I, background: I #f3f4f6 1,
<img src={img}  style={{ width: I l 00 0/0 1, height: 90, objectFit: 'cover/ }} />
<button type="button" onCIick={()  removelmage(index)} style={{ position: 'absolute', right: 6, top: 6, border: I none l, borderRadius: 999, background: I #fffl, cursor: 'pointer',
I
padding: 1 2px 8px,
x
</button>
</div>
</div>
<div style={{ border: I l PX solid
#e5e7eb I, borderRadius: 1 8, padding: 1 6 }}>  style={{ margin Top: 0, fontWeight:
700 
<input style={styles.input} value={draft.sizes.join(l, I)} onChange={(e) => updateSizesFromText(e.target.vaIue)} placeholder="EjempIo: 28, 30, 32, 34"
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin Top: 1 2 }}>
{draft.sizes.map((size) =>  
<div key={size} style={{ border: I l PX solid #e5e7ebI, borderRadius: 999, padding: 1 6px 1 2pxI, display: 'flex', alignltems: 'center', gap: 8,
<span>{size}</span>
<button type="button" onCIick={() => removeSize(size)} style={{ border: I none l, background: 'transparent', cursor: 'pointer/
x
</button>
</div>
</div>
<div style={{ display: 'flex', gap: 1 0, margin Top: 12 }}>
<input style={styles.input} value={newSize} onChange={(e) => setNewSize(e.target.vaIue)} placeholder="Nueva talla"
<button type="button" style={styles.buttonSecondary} onCIick={addSize}>
<PIus size={1 6} />
Agregar
</button>
</div>
</div>
<div style={{ display: 'grid', gap: 1 2, grid TemplateCoIumns: I repeat(4, 1 fry }}> {draft.sizes.map((size) =>  
<div key={size} style={{ border: I l PX solid #e5e7ebI, borderRadius: 1 6, padding:
 style={{ margin Top: 0, fontSize:
1 4, fontWeight: 700 }}>Stock {size}</p>
<input style={styles.input} type="number" value={draft.stock[size] ?? 0} onChange={(e) => setDraft((p) 
stock: { ...p.stock, [size]:
Number(e.target.value) },
</div>
</div>
<div style={{ display: 'grid', gap: 1 6, grid TemplateCoIumns: I l fr 1 fr 1 frl }}>
<label style={{ display: 'flex', gap: 1 0, alignltems: 'center/ }}>
<input type="checkbox" checked={draft.active} onChange={(e) => setDraft((p) => 
...p, active: e.target.checked }))}
Activo
</label>
<label style={{ display: 'flex', gap: 1 0, alignltems: 'center/ }}>
<input type="checkbox" checked={draft.is_new} onChange={(e) => setDraft((p) => 
...p, is_new: e.target.checked }))}
Nuevo
</label>
<label style={{ display: 'flex', gap: 1 0, alignltems: 'center/ }}>
<input type="checkbox" checked={draft.is_offer} onChange={(e) => setDraft((p) => 
...p, is_offer: e.target.checked }))}
Oferta
</div>
<div style={{ display: 'flex', gap: 1 2, flexWrap: 'wrap/ }}>
<button type="button" style={styIes.buttonPrimary} onCIick={onSave} disabled={loading}>
<Save size={1 6} />
{loading ? 'Guardando...l : saveLabeI}
</button>
<button type="button" style={styles.buttonSecondary} onCIick={onCanceI}>
Cancelar
</button>
</div>
</div>
function SpecialCIientsAdmin({ specialCIients, fetchSpeciaICIients }) { const [draft, setDraft] = useState(emptySpecialCIient) const [editingld, setEditingId] = useState(nuIl) const [loading, setLoading] = useState(faIse)
const resetDraft =  setDraft(emptySpeciaICIient) setEditingId(nuII)
const saveCIient = async () => { if (!draft.name.trim() Il !
draft.client_code.trim()) { alert(I Pon nombre y cödigo del cliente.l) return
setLoading(true)
const payload = { name: draft.name.trim(), phone: draft.phone.trim(), client_code: draft.client_code.trim(), qr_value: (draft.qr_value Il draft.client_code).trim(), price_mode: draft.price_mode Il
'special_pricel, discount_percent:
Number(draft.discount_percent Il 0), active: draft.active !== false, notes: draft.notes Il " 
let response if (editingld) { response = await supabase.from(lspecial_clientsl).update(pa  editingld)
} else { response = await supabase.from(lspecial_clientsl).insert([pay load])
setLoading(faIse)
if (response.error) { alertCNo se pudo guardar cliente especial: ${response.error.message}') return
resetDraft() await fetchSpeciaICIients()
const editCIient = (client) =>  setEditingId(cIient.id) setDraft({
name: client.name Il "  phone: client.phone Il "  client_code: client.client_code Il "  qr_value: client.qr_value Il "  price_mode: client.price_mode Il
'special_pricel, discount_percent:
Number(client.discount_percent Il 0), active: client.active !== false, notes: client.notes Il " 
const deleteCIient = async (id) =>  const ok =  cliente especial?) if (!ok) return
const { error } = await supabase.from(lspecial_clientsl).delete().e q(l id l, id)
if (error) { alertCNo se pudo eliminar: $
{error.message}') return
await fetchSpeciaICIients()
const toggleCIient = async (client) =>  const { error } = await supabase
.from(lspecial_clientsl)
.update({ active: !client.active })
.eq(l id l, client.id)
if (error) { alertCNo se pudo actualizar cliente: $
{error.message}') return
await fetchSpeciaICIients()
return (
<div style={{ ...styles.card, padding: 24, margin Top: 24 }}>
<div style={{ display: 'flex', gap: 1 2, alignltems: 'center', marginBottom: 1 8 }}>
<QrCode 
<h3 style={{ margin: 0, fontSize: 26 }}
>CIientes especiales</h3>  style={{ margin: 14px 0 0 1, color:
I #6b7280 1 }}>
Aqui puedes registrar clientes con cödigo y precio especial.
</div>
</div>
<div style={{ display: 'grid', gap: 14,
grid TemplateCoIumns: I repeat(2, minmax(0,1 
<input style={styles.input} placeholder="Nombre" value={draft.name} onChange={(e) => setDraft((p) => 
...p, name: e.target.value }))}
<input style={styles.input} placeholder="TeIéfono" value={draft.phone} onChange={(e) => setDraft((p) => 
...p, phone: e.target.value }))}
<input style={styles.input} placeholder="Cödigo de cliente" value={draft.client_code} onChange={(e) => setDraft((p) => 
...p, client_code: e.target.value }))}
<input style={styles.input} placeholder="VaIor QR (si Io dejas vacio usa el mismo cödigo)" value={draft.qr_value} onChange={(e) => setDraft((p) => 
...p, qr_value: e.target.value }))}
<select style={styles.input} value={draft.price_mode} onChange={(e) => setDraft((p) => 
...p, price_mode: e.target.value }))}
<option value="speciaI_price">Usar
special_price</option> <option value="discount_percent">Usar descuento %</option>
</select>
<input type="number" style={styles.input} placeholder="Descuento %" value={draft.discount_percent} onChange={(e) => setDraft((p) =>  ...p, discount_percent:
Number(e.target.value) }))}
<textarea style={{ ...styles.textarea, gridCoIumn: I l / -I l }} placeholder="Notas" value={draft.notes}
onChange={(e) => setDraft((p) => 
...p, notes: e.target.value }))}
</div>
<div style={{ display: 'flex', gap: 1 2, margin Top: 14, flexWrap: 'wrap/ }}>
<label style={{ display: 'flex', gap: 1 0, alignltems: 'center/ }}>
<input type="checkbox" checked={draft.active} onChange={(e) => setDraft((p) => 
...p, active: e.target.checked }))}
Activo
</label>
<button type="button" style={styIes.buttonPrimary} onCIick={saveCIient} disabled={loading}>
<Save size={1 6} />
{editingld ? 'Guardar cliente l :
Agregar clientel}
</button>
<button type="button" style={styles.buttonSecondary} onCIick={resetDraft}>
Cancelar
</button>
</div>
<div style={{ display: 'grid', gap: 14, margin Top: 22 }}>
{specialCIients.map((cIient) =>  
<div key={client.id} style={{ border: I l PX solid #e5e7ebI, borderRadius: 18, padding: 14 }}>
<div style={{ display: 'flex', justifyContent: 'space-between', gap: 1 2, flexWrap: 'wrap/ }}>
<strong style={{ fontSize: 20 }}
>{client.name}</strong>
<div style={{ margin Top: 8, color: I #6b7280 1 }}>Cödigo: {client.client_code}</ diV>
<div style={{ margin Top: 4, color: I #6b7280 1 }}>QR: {client.qr_value}</div>
<div style={{ margin Top: 4, color: I #6b7280 1 }}>TeI: {client.phone Il 
<div style={{ margin Top: 4, color: I #6b7280 1 }}>
Modo: {client.price_mode} {client.discount_percent ? '($
 
</div>
</div>
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap/ }}>
<button type="button"
style={styles.buttonSecondary} onCIick={() => editCIient(cIient)}>
<PenciI size={1 6} /> Editar
</button>
<button type="button" style={styIes.buttonSecondary} onCIick={() => toggleCIient(cIient)}>
{client.active ? Desactivarl :
Activarl}
</button>
<button type="button" style={styles.buttonSecondary} onCIick={() => deleteCIient(cIient.id)}>
< Trash2 size={1 6} /> Eliminar
</button>
</div>
</div>
</div>
{specialCIients.Iength === 
<div style={{ border: I l PX dashed #dl d5dbI, borderRadius: 18, padding: 1 8, color: I #6b7280 1	 
No hay clientes especiales registrados.
</div>
</div>
</div>
function StoreView({ isMobiIe, products, search, setSearch, storeAudience, setStoreAudience, storeCategory, setStoreCategory, storeBrand, setStoreBrand, storeFit, setStoreFit, customCategories, customFits, selectedConfig, setSeIectedConfig, addToCart, cart, setCart, customer, setCustomer, sendOrder, gallery, setGaIIery, speciaICIientSession,
specialCode, setSpeciaICode, loginSpeciaICIient, logoutSpeciaICIient,
const [openMegaMenu, setOpenMegaMenu] = useState(faIse) const [megaAudience, setMegaAudience]
= useState(I Hombre I) const [mobileMenuOpen, setMobiIeMenuOpen] = useState(faIse) const [improvePriceOpen, setlmprovePriceOpen] = useState(false)
const visibleBrands = uniqueVaIues([...BRANDS,
...products.map((p) => p.brand)]) const visibleCategories = getAudienceCategories(storeAudience, customCategories).filter((c) => c !== Playeral)
const totalPieces = useMemo(() => cart.reduce((sum, item) => sum +
Number(item.quantity Il 0), 0), [cart]) const tier = currentTier(totaIPieces)
const filteredProducts = useMemo(() => { let list = [...products].filter((p) => p.active)
if (storeAudience !== 'Todd) { list = list.filter((p) => p.audience === storeAudience)
if (storeCategory !== ITodos I) { list = list.filter((p) => p.category === storeCategory)
if (storeBrand !== ITodas l) { list = list.filter((p) => p.brand === storeBrand)
if (storeFit !== ITodos I) { list = list.filter((p) => p.subcategory === storeFit)
if (search.trim()) { const q = search.toLowerCase() list = list.filter((p) =>
'${p.name} ${p.category} $
{p.subcategory} ${p.brand} ${p.audience}
 .toLowerCase().incIudes(q)
list.sort((a, b) { const aPriority = (a.is_new ? 1 000000 : 0) + Number(a.sales_count Il 0) * 1 000 + new Date(a.created_at Il 0).getTime() const bPriority = (b.is_new ? 1 000000 : 0) + Number(b.sales_count Il 0) * 1 000 + new Date(b.created_at Il 0).getTime() return bPriority - aPriority
return list
}, [products, storeAudience, storeCategory, storeBrand, storeFit, search])
const subtotalPreview = cart.reduce((sum, item) => { const unit = specialCIientSession?.active
? Number(item.product.special_price Il item.product.price Il 0)
 Number(item.product[tier.key] Il item.product.price Il 0) return sum + unit *
Number(item.quantity Il 0)
return (
<header style={{ position: 'sticky', top: 0, zlndex: 20, background: 1 1 31 5 1, color: I #fffl, borderBottom: I l PX solid
 
<div style={{ ...styles.container, position: 'relative/ }}>
<div style={{ minHeight: 82, display: 'flex', justifyContent: 'space-between',
alignltems: 'center', gap: 20,
<div style={{ display: 'flex', alignltems: 'center', gap: 1 8 }}>
 
isMobiIe ? 96 : 1 32, objectFit: 'contain/ }} />
</div>
{!isMobiIe ? (
<nav style={{ display: 'flex', alignltems: 'center', gap: 28 }}>
 l
<button key={aud} type="button" onMouseEnter={() => { setMegaAudience(aud) setOpenMegaMenu(true)
onCIick={() => { setStoreAudience(aud) setStoreCategory(ITodosI) setStoreFit(ITodosI) setStoreBrand(ITodasI)
style={{ background: 'transparent', border: I nonel, color: I #fffl, fontWeight: 700, fontSize: 1 6, cursor: 'pointer', borderBottom: megaAudience
=== aud && openMegaMenu ? 1 2px solid
#fffl : 1 2px solid transparent', paddingBottom: 1 0,
{aud}
</button>
< / nav>
) : null}
<div style={{ display: 'flex', alignltems: 'center', gap: 12 }}>
{!isMobiIe ? (
<div style={{ position: 'relative', width: 260  
<Search size={1 7}   style={{ position:
'absolute', top: 14, left: 12 }} />
<input style={{
...styles.input, background: I #0b0c0d I, border: I l PX solid
 
color: I #fffl,
paddingLeft: 36,
value={search} onChange={(e) => setSearch(e.target.vaIue)} placeholder="Buscar"
</div>
) : null}
{!isMobiIe ? (
<button type="button" style={styles.buttonSecondary} onCIick={() => setlmprovePriceOpen(true)}> Mejora tu precio
</button>
) : null}
{isMobiIe ? (
<button type="button"
onCIick={()  setMobiIeMenuOpen(true)} style={{ background:
'transparent', border: I none l, color: I #fffl, cursor: 'pointer/ }}
<Menu size={32} />
</button>
) : null}
</div>
</div>
{!isMobile && openMegaMenu ? (
<DesktopMegaMenu activeAudience={megaAudience} closeMenu={()  setOpenMegaMenu(faIse)} products={products}
setStoreAudience={setStoreAudience} setStoreCategory={setStoreCategory} setStoreBrand={setStoreBrand} setStoreFit={setStoreFit}
customCategories={customCategories} customFits={customFits}
) : null}
</div>
</header>
<MobiIeMenu open={mobiIeMenuOpen} close={() => setMobiIeMenuOpen(faIse)} products={products} setStoreAudience={setStoreAudience} setStoreCategory={setStoreCategory} setStoreBrand={setStoreBrand} setStoreFit={setStoreFit}
customCategories={customCategories} customFits={customFits}
I
<section style={{ padding: 1 28px 0 14px
<div style={styles.container}>
<div style={{ display: 'grid', gap: 22, grid TemplateCoIumns: isMobiIe ?
I l frl : I l .1 5fr .85frI,
alignltems: Istart l,
<hl style={{ margin: 0, fontSize: isMobiIe ? 34 : 52, lineHeight: 1 .02, fontWeight: 800, maxWidth: 660,
Aparta mercancia y desbloquea mejor precio por volumen.
</div>
<div style={{ ...styles.card, padding:
22, display: 'grid', gap: 12 }}>
<div style={{ display: 'flex', justifyContent: 'space-between', gap: 1 0 }}>
 style={{ margin: 0, color:
I #6b7280 1, fontSize: 14 }}>NiveI actual</p> <h2 style={{ margin: 1 5px 0 0 1, fontSize: isMobiIe ? 28 : 34 }}>
{specialCIientSession?.active ?
Precio especial/ : tier.label}
</h2>
</div>
<div style={{ background: I #f3f4f6 1, borderRadius: 1 6, padding: I l Opx 14pxI, minWidth: 78, textAIign: 'center',
 style={{ margin: 0, color:
I #6b7280 1, fontSize: 13 }}>Piezas</p>  style={{ margin: 14px 0 0 1, fontWeight: 800, fontSize: 24 }} >{totaIPieces}</p>
</div>
</div>
<div style={{ display: 'grid', gap: 1 2, grid TemplateCoIumns: I l fr 1 frl }}>
<div style={{ border: I l PX solid
#e5e7eb I, borderRadius: 1 8, padding: 1 6 }}>  style={{ margin: 0, color: I #6b7280 1, fontSize: 14 }}>SubtotaI estimad0</p>  style={{ margin: 1 6px 0 0 1, fontWeight: 800, fontSize: 22 }} >{mxn(subtotaIPreview)}</p>
</div>
<div style={{ border: I l PX solid
#e5e7eb I, borderRadius: 1 8, padding: 1 6 }}>  style={{ margin: 0, color:
I #6b7280 1, fontSize: 14 }}>Venta</p>  style={{ margin: 1 6px 0 0 1, fontWeight: 700 }}>Piezas mixtas</p>  style={{ margin: 1 8px 0 0 1, color: I #d97706 1, fontSize: 14 }}>
{specialCIientSession?.active
? I Tu cödigo especial ya estå activo.l
. totalPieces >= 1 0
? IYa tienes el mejor precio disponible.'
. totalPieces >= 3
? 'Te faltan ${1 0 totalPieces} pieza(s) para desbloquear el precio de 1 0+ piezas. 
 'Te faltan ${3 - totalPieces} pieza(s) para desbloquear el precio de 3+ piezas.)
</div>
</div>
{isMobile ? (
<button type="button" style={{ ...styles.buttonSecondary, marginTop: 6 }} onClick={() => setlmprovePriceOpen(true)}
Mejora tu precio
</button>
) : null}
</div>
</div>
</div>
</section>
<section style={{ paddingBottom: 24 }}>
<div style={styles.container}>
<div style={{ display: 'grid', gap: 14, grid TemplateCoIumns: isMobile ?
I l frl : I l .25fr .8fr .9fr .9frI, alignltems: 'center',
{isMobiIe ? (
<div style={{ position: 'relative/ }}> <Search size={1 6}  style={{ position:
'absolute', left: 1 2, top: 14 }} />
<input style={{ ...styles.input, paddingLeft: 36 }} value={search} onChange={(e) => setSearch(e.target.vaIue)} placeholder="Buscar producto"
</div>
<div 
<select style={styles.input} value={storeAudience} onChange={(e) =>  setStoreAudience(e.target.vaIue) setStoreCategory(ITodosI) setStoreBrand(ITodasI) setStoreFit(ITodosI)
 
<option key={aud} value={aud}
>{aud}</option>
</select>
<select style={styles.input} value={storeCategory} onChange={(e) =>  setStoreCategory(e.target.vaIue) setStoreFit(ITodosI)
<option value="Todos">Todos Ios productos</option>
{visibleCategories.map((cat) =>  
<option key={cat} value={cat}
>{cat}</option>
</select>
<select style={styles.input} value={storeBrand} onChange={(e) => setStoreBrand(e.target.value)}
<option value="Todas">Todas las marcas</option>
{visibleBrands.map((brand) =>  
<option key={brand} value={brand}
>{brand}</option>
</select>
</div>
</div>
</section>
<section style={{ paddingBottom: 42 }}>
<div style={styles.container}>
{filteredProducts.Iength === 0 '7 (
<div style={{ ...styles.card, padding:
30, textAIign: 'center', color: I #6b7280 1 }}> No encontramos productos con ese filtro.
</div>
<div style={{ display: 'grid', gap: 22, grid TemplateColumns: isMobiIe ? I repeat(2, minmax(0, 1 : I repeat(4, minmax(0, 1 
{filteredProducts.map((product) =>
<ProductCard
key={product.id} product={product} selectedConfig={seIectedConfig}
setSeIectedConfig={setSeIectedConfig} onAddToCart={addToCart} onOpenGaIIery={(prod) => setGaIIery({ open: true, product: prod, imagelndex: 0,
specialCIientSession={speciaICIientSessio n}
</div>
</div>
</section>
<CartSection isMobiIe={isMobile} cart={cart} setCart={setCart} customer={customer} setCustomer={setCustomer} sendOrder={sendOrder}
specialCIientSession={specialCIientSessio n}
<ProductLightbox open={gallery.open} product={gallery.product} imagelndex={gallery.imagelndex} setlmagelndex={(value) => setGaIlery((prev) => 
...prev,
imagelndex: typeof value 
Ifunctionl ? value(prev.imagelndex) : value,
onClose={() => setGallery({ open: false, product: null, imagelndex: 0 })}
<lmprovePriceModal open={improvePriceOpen} onClose={()  setlmprovePriceOpen(false)} specialCode={specialCode} setSpecialCode={setSpecialCode} loginSpecialClient={loginSpecialClient} scanningMessage="La función de escaneo rápido queda preparada. En la siguiente etapa conectamos cámara real para QR."
specialClientSession={specialClientSessio n}
logoutSpeciaICIient={IogoutSpeciaICIient}
function AdminView({ products, fetch Products, loading, setLoading, specialCIients, fetchSpeciaICIients,
const isMobiIe = uselsMobiIe() const [adminSearch, setAdminSearch] = useState(") const [editingld, setEditingId] = useState(nuIl)
const [editingDraft, setEditingDraft] = useState(nuIl) const [newProductDraft, setNewProductDraft] = useState(buiIdEmptyProduct())
const filteredProducts = useMemo(() => { if (!adminSearch.trim()) return products const q = adminSearch.toLowerCase() return products.filter((p) =>
'${p.name} ${p.category} $
{p.subcategory} ${p.brand} ${p.audience}
 .toLowerCase().incIudes(q)
}, [products, adminSearch])
const stats = useMemo(() => { return { total: products.length, active: products.filter((p) =>
p.active).length,
stock: products.reduce((sum, p) => sum + Number(p.stock_total Il 0), 0),
}, [products])
const prepareDraftForSave = (draft) =>  const finalCategory = draft.customCategory?.trim() Il draft.category const finalSubcategory = finalCategory  'Jeans/ ?
draft.customSubcategory?.trim() Il draft.subcategory : 
const finalBrand = draft.customBrand?.trim() Il draft.brand return { ...draft, category: finalCategory, subcategory: finalSubcategory, brand: finalBrand,
const addProduct = async () => { if (!newProductDraft.name.trim()) { alert(I Pon nombre al productol) return
setLoading(true) const clean = prepareDraftForSave(newProductDraft) const payload = productToDb(cIean) const { error } = await supabase.from(lproductsl).insert([payload]) setLoading(faIse)
if (error) { alertCNo se pudo crear el producto: $
{error.message}') return
setNewProductDraft(buiIdEmptyProduct()) await fetchProducts()
const startEdit = (product) => { setEditingId(product.id) setEditingDraft({ ...product, customCategory:  customSubcategory:  customBrand: 
const saveEdit = async () => { if (!editingDraft?.name?.trim()) { alert(I Pon nombre al productol) return
setLoading(true) const clean = prepareDraftForSave(editingDraft) const payload = productToDb(cIean) const { error } = await supabase.from(lproductsl).update(payload)
.eq(l id l, editingld) setLoading(faIse)
if (error) { alertCNo se pudo actualizar el producto: ${error.messageF) return
setEditingId(nuII) setEditingDraft(nuII) await fetchProducts() const toggleActive = async (id, next) =>  const { error } = await supabase.from(l products l).update({ active: next 	id) if (error) { alertCNo se pudo cambiar el estado: $
{error.message}') return
await fetchProducts()
const deleteProduct = async (id) =>  const ok = window.confirm(l ßeguro que deseas eliminar este producto?) if (!ok) return const { error } = await supabase.from(lproductsl).delete().eq(lidl,
if (error) { alertCNo se pudo eliminar: $
{error.message}') return
await fetchProducts()
return (
<section style={{ padding: 1 28px 0 50pxI
<div style={styles.container}>
<div style={{ display: 'grid', gap: 24, grid TemplateCoIumns: isMobiIe ? I l frl :
1 .85fr 1 .1 5frI  
<div style={{ display: 'grid', gap: 24 }}> <div style={{ ...styles.card, padding:
24  
<div style={{ display: 'flex', gap: 1 2, alignltems: 'center', marginBottom: 1 6 }}> <Settings />
<h2 style={{ margin: 0, fontSize:
32 }}>PaneI admin</h2>  style={{ margin: 14px 0 0 1, color: I #6b7280 1	 
Administra catålogo, marcas, fit, tallas, stock y precios.
</div>
</div>
<div style={{ display: 'grid', gap: 1 2, grid TemplateCoIumns: I repeat(3, 1 fry }}> <div style={{ background:
I #f3f4f6 1, borderRadius: 20, padding: 1 6 }}>  style={{ margin: 0, color:
I #6b7280 1 }}>Productos</p>  style={{ margin: 1 8px 0 0 1, fontWeight: 800, fontSize: 26 }} >{stats.total}</p>
</div>
<div style={{ background:
I #f3f4f6 1, borderRadius: 20, padding: 1 6 }}>  style={{ margin: 0, color:
I #6b7280 1 }}>Activos</p>  style={{ margin: 1 8px 0 0 1, fontWeight: 800, fontSize: 26 }} >{stats.active}</p>
</div>
<div style={{ background:
I #f3f4f6 1, borderRadius: 20, padding: 1 6 }}>  style={{ margin: 0, color:
I #6b7280 1 }}>Stock</p>  style={{ margin: 1 8px 0 0 1, fontWeight: 800, fontSize: 26 }} >{stats.stock}</p>
</div>
</div>
</div>
<div style={{ ...styles.card, padding:
24  
<h3 style={{ margin Top: 0, fontSize: 24 }}>Agregar product0</h3>
<ProductForm draft={newProductDraft} setDraft={setNewProductDraft} onSave={addProduct} onCanceI={()  setNewProductDraft(buiIdEmptyProduct())} loading={loading} saveLabeI="Guardar producto" products={products}
</div>
</div>
<div style={{ • ..styles.card, padding:
24  
<div style={{ display: 'flex', justifyContent: 'space-between', gap: 1 2,
alignltems: 'center', marginBottom: 1 8, flexWrap: 'wrap',
<h3 style={{ margin: 0, fontSize:
26 }}>Productos registrados</h3>
</div>
<div style={{ position: 'relative', width: isMobiIe ? I l 00%/ : 280 }}> <Search size={1 6} color="#9ca3af" style={{ position: 'absolute', left: 1 2, top: 14 }} />
<input style={{ ...styles.input, paddingLeft: 36 }} value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)}
placeholder="Buscar en admin"
</div>
</div>
<div style={{ display: 'grid', gap: 1 6
{filteredProducts.map((product)
<div key={product.id} style={{ border: I l PX solid #e5e7eb I, borderRadius:
22, padding: 1 6 }}>
{editingld === product.id && editingDraft ? (
<div style={{ display: 'flex', justifyContent: 'space-between', gap: 1 2, alignltems: 'center', marginBottom: 1 6 }}> <h4 style={{ margin: 0, fontSize: 22 }}>Editando product0</h4>
<button
type="button" onCIick={() 	{ setEditingId(nulI) setEditingDraft(nuII)
style={styles.buttonSecondary}
<X size={1 6} />
</button> </div>
<ProductForm draft={editingDraft} setDraft={setEditingDraft} onSave={saveEdit} onCanceI={() 	{ setEditingId(nuII) setEditingDraft(nulI) loading={loading} saveLabeI="Guardar cambios" products={products}
<div style={{ display: 'grid', gap: 1 6, grid TemplateCoIumns: isMobiIe ?
I l frl : I l 1 Opx I fr auto/ }}>
<div style={{ borderRadius:
1 8, overflow: 'hidden', background:
I#f3f4f61	 
{getCover(product) ? ( <img src={getCover(product)} alt={product.name} style={{ width: I l 00 0/0 1, height: 1 1 0, objectFit: 'cover/ }} />
<div style={{ width: I l 00 0/0 1, height: 1 1 0, display: 'grid', placeltems: 'center/ }}>
<lmagelcon size={32} color="#9ca3af" />
</div>
</div>
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignltems: 'center/
<h4 style={{ margin: 0, fontSize: 22 }}>{product.name}</h4>
<Badge>{product.audience}
</Badge>
<Badge bg="#fff" border="l PX solid
#d1d5db">{product.brand}</Badge>
{product.category ===
'Jeans/ && product.subcategory ? (
<Badge bg="#dbeafe"
Badge>
) : null}
</div>
1
 style={{ margin: 1 8px 0 0 , color: I #6b7280 1 }}>{product.category}</p>
<div style={{ display: 'grid', gap: 8, grid TemplateCoIumns: I repeat(4, 1 fry, margin Top: 1 2 }}>
<div style={{ background:
I #f3f4f6 1, borderRadius: 14, padding: 1 0 }}> <small style={{ color:
I #6b7280 1 }}>NormaI</smaII>
<div style={{ fontWeight:
800 }}>{mxn(product.price)}</div>
</div>
<div style={{ background:
I #f3f4f6 1, borderRadius: 14, padding: 1 0 }}> <small style={{ color:
I#6b72801 
<div style={{ fontWeight:
800 }}>{mxn(product.price_tier3)}</div> </div>
<div style={{ background:
I #f3f4f6 1, borderRadius: 14, padding: 1 0 }}> <small style={{ color:
I#6b72801 
<div style={{ fontWeight:
800 }}>{mxn(product.price_tierl O)}</div>
</div>
<div style={{ background:
I #f3f4f6 1, borderRadius: 14, padding: 1 0 }}> <small style={{ color:
I #6b7280 1 }}>Especial</smaII>
<div style={{ fontWeight:
800 }}>{mxn(product.special_price)}</div>
</div>
</div>
</div>
<div style={{ display: 'flex',
flexDirection: isMobile ? 'row/ : 'column', gap: 8 
<button type="button" style={styles.buttonSecondary} onCIick={() => startEdit(product)}>
<PenciI size={1 6} /> Editar
</button>
<button type="button"
style={styles.buttonSecondary} onCIick={()  toggleActive(product.id, !product.active)}
{product.active ? I OcuItarI : Activarl}
</button>
<button type="button"
style={styles.buttonSecondary} onClick={() => deleteProduct(product.id)}>
<Trash2 size={1 6} /> Eliminar
</button>
</div>
</div>
</div>
	{filteredProducts.length 	0 Q (
<div style={{ border: I I px dashed #dl d5dbI, borderRadius: 18, padding: 22, textAlign: 'center', color: I #6b7280 1 }}> No hay productos con ese criterio.
</div>
) : null}
</div>
</div>
<SpeciaICIientsAdmin specialCIients={specialCIients}
fetchSpeciaICIients={fetchSpecialCIients}
</div>
</div>
</div>
</section>
function AdminLogin({ loginForm, setLoginForm, loginError, showPassword, setShowPassword, handleLogin }) { const isMobiIe = uselsMobiIe()
return (
<section style={{ padding: 1 38px 0 60pxI
<div style={styles.container}>
<div style={{ display: 'grid', gap: 24, grid TemplateCoIumns: isMobile ? I l frl : I l fr 1 frl  
<div style={{ ...styles.card, padding:
28  
<h2 style={{ margin: 0, fontSize:
isMobiIe ? 36 : 48 }}>PaneI administrador</
 style={{ margin Top: 1 2, color:
I #6b7280 1, lineHeight: 1 .7 }}>
Aqui administrarås productos, marcas, fit, tallas, stock, precios y clientes especiales.
</div>
<div style={{ ...styles.card, padding:
28  
<div style={{ display: 'flex', gap: 1 2, alignltems: 'center', marginBottom: 1 6 }}>
<Lock 
<h3 style={{ margin: 0, fontSize:
30 }}>lniciar sesiön</h3>  style={{ margin: 14px 0 0 1, color: I #6b7280 1 }}>Usa tu usuario y contrasefia de admin.</p>
</div>
</div>
<div style={{ display: 'grid', gap: 14 }}
<div style={{ position: 'relative/ }}>
<User size={1 6} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14
<input style={{ ...styles.input, paddingLeft: 36 }} value={IoginForm.username} onChange={(e) =>
setLoginForm((p) =>	...p, username:
e.target.value }))} placeholder="Usuario"
</div>
<div style={{ position: 'relativel }}>
<Lock size={1 6} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14
<input style={{ ...styles.input, paddingLeft: 36, paddingRight: 40 }} value={IoginForm.password} onChange={(e)  setLoginForm((p) => ...p, password:
e.target.value }))}
 
type={showPassword ? 'text/ :
'password)
<button type="button" onCIick={()  setShowPassword((p) => !p)} style={{ position: 'absolute', right: 1 2, top: 12, border: I nonel, background: 'transparent', cursor: 'pointer',
{showPassword ? <EyeOff size={1 6} /> : <Eye size={1 6} />}
</button>
</div>
{loginError ? style={{ margin: 0, color: I #dc2626 1, fontWeight: 700 }} >{IoginError}</p> : null}
<button type="button" style={styIes.buttonPrimary} onCIick={handIeLogin}>
Entrar al panel
</button>
</div>
</div>
</div>
</div>
</section>
export default function App() { const isMobiIe = uselsMobiIe() const [products, setProducts] = useState([]) const [specialCIients, setSpecialCIients] = useState([]) const [loading, setLoading] = useState(faIse)
const [route, setRoute] = useState( typeof window !== l undefined l &&
window.Iocation.pathname.toLowerCase().i ncludes(l/adminl)
? 'admin/
 'store/
const [isAdminAuthenticated, setlsAdminAuthenticated] = useState(faIse) const [loginForm, setLoginForm] = useState({ username: password: " }) const [loginError, setLoginError] = useState(") const [showPassword, setShowPassword] = useState(false)
const [search, setSearch] = useState(") const [storeAudience, setStoreAudience]
= useState(ITodoI) const [storeCategory, setStoreCategory] = useState(ITodosI) const [storeBrand, setStoreBrand] = useState(ITodasI) const [storeFit, setStoreFit] = useState(ITodosI)
const [selectedConfig, setSeIectedConfig]
= useState({}) const [cart, setCart] = useState([]) const [customer, setCustomer] = useState(emptyCustomer)
const [gallery, setGaIIery] = useState({ open: false, product: null, imagelndex: 0,
const [specialCode, setSpeciaICode] = useState(") const [specialCIientSession, setSpeciaICIientSession] = useState(nulI)
async function fetchProducts() { const { data, error } = await supabase.from(lproductsl).select(l*l).order(l created_at l, { ascending: false }) if (error) { alertCNo se pudieron leer Ios productos: ${error.message}') return
setProducts((data Il
[]).map(normaIizeProduct))
async function fetchSpeciaICIients() { const { data, error } = await supabase.from(lspecial_clientsl).select(l*l). order(lcreated_atl, { ascending: false }) if (error) { alertCNo se pudieron leer clientes especiales: ${error.messageF) return setSpeciaICIients(data Il [l)
useEffect(() => { fetchProducts() fetchSpecialCIients()
useEffect(() => { const saved = localStorage.getItem(ADMIN_SESSION_KE
y) if (saved === 'true) setlsAdminAuthenticated(true)
const specialSaved =
 
SSION_KEY) if (specialSaved) { try { const parsed =
JSON.parse(speciaISaved) setSpeciaICIientSession(parsed)
} catch {}
const customCategories = useMemo(()
return uniqueVaIues( products
.map((p) => p.category) .filter((cat) 	!
uniqueVaIues(Object.values(BASE_CATEG ORY_MAP).fIat()).incIudes(cat))
}, [products])
const customFits = useMemo(() => { return uniqueVaIues( products.map((p) =>
p.subcategory).filter((sub) => sub && !
 
}, [products])
const addToCart = (product) =>  const selection = selectedConfig[product.id] if (!selection?.size Il
Number(selection.quantity Il 0) <= 0) return
const stock = Number(product.stock?.
[selection.size] Il 0) if (Number(selection.quantity Il 0) > stock) {
alert(I La cantidad supera el stock disponible.l) return
setCart((prev)  const index = prev.findlndex(
(item) => item.product.id === product.id && item.size === selection.size
if (index >= 0) { const next = [...prev] const currentQty =
Number(next[index].quantity Il 0) const newQty = Math.min(stock, currentQty + Number(selection.quantity Il
o)) next[index] = { ...next[index], quantity: newQty } return next
return [...prev, { product, size: selection.size, quantity:
Number(selection.quantity Il 0) }]
setSeIectedConfig((prev) => 
...prev,
[product.id]: { size: selection.size, quantity: 0,
const loginSpeciaICIient = async
(rawCode) { const code = String(rawCode Il ").trim() if (!code) { alert(I Escribe o escanea un cödigo.l)
return
const { data, error } = await supabase
.from(lspecial_clientsl)
 
.orCcIient_code.eq.${code},qr_vaIue.eq.
${codeF)
.eq(lactive l, true)
.limit(l)
if (error) { alertCNo se pudo validar cödigo: $
{error.messageF) return
if (!data Il !data.length) { alert(I Cödigo no encontrado o inactivo.l) return
const client = data[0] setSpeciaICIientSession(cIient)
 
SSION_KEY, JSON.stringify(cIient)) setSpeciaICode(") alertCCIiente especial detectado: $
{client.name}')
const logoutSpeciaICIient =  setSpeciaICIientSession(nuII)
localStorage.removeItem(SPECIAL_CLIENT
_SESSION_KEY)
const sendOrder = async () => { if (cart.length === 0) { alert(IAgrega productos al carrito.l)
return
if (!customer.name.trim() Il ! customer.phone.trim()) { alert(I Pon al menos nombre y teléfono.l) return
const totalPieces = cart.reduce((sum, item) => sum + Number(item.quantity Il 0),
o) const tier = currentTier(totaIPieces)
const getUnitPrice = (product) =>  if (specialCIientSession?.active) { if (specialCIientSession.price_mode
=== discount_percent l &&
Number(specialCIientSession.discount_per cent Il 0) > 0) { const base = Number(product.price Il
o) return Math.round(base * (1 -
Number(specialCIientSession.discount_per cent Il 0) / 100))
return Number(product.special_price Il product.price Il 0)
return Number(product[tier.key] Il product.price Il 0)
const subtotal = cart.reduce((sum, item)
=> sum + getUnitPrice(item.product) *
Number(item.quantity Il 0), 0)
try { setLoading(true)
const orderPayIoad = { customer_name: customer.name Il "  customer_phone: customer.phone Il "  customer_city: customer.city Il "  delivery: customer.delivery Il "  notes: customer.notes Il "  items_json: cart.map((item) => ({ product_id: item.product.id, name: item.product.name, size: item.size, quantity: item.quantity, unit_price:
getUnitPrice(item.product), total: getUnitPrice(item.product) *
Number(item.quantity Il 0),
total_pieces: totalPieces, subtotal, price_level:
specialCIientSession?.active ? Precio especial clientel : tier.label, status: I nuevol, whatsapp_sent: false,
const { error: orderError } = await supabase.from(IordersI).insert([orderPayIo ad]) if (orderError) { alertCNo se pudo guardar el pedido: $
{orderError.messageF) setLoading(faIse) return
for (const item of cart) { const product = products.find((p) =>
p.id === item.product.id) if (!product) continue
const nextStock = {
...product.stock,
[item.size]: Math.max(0,
Number(product.stock?.[item.size] Il 0) Number(item.quantity Il 0)),
const { error: updateError } = await supabase
.from(lproductsl)
.update({ stock_json: nextStock, stock: totalStock(nextStock),
.eq(l id l, item.product.id)
if (updateError) { alertCNo se pudo actualizar stock de
${product.name}: ${updateError.message}
setLoading(faIse) return
const itemsText = cart
.map((item, idx) =>  const unit = getUnitPrice(item.product) return '${idx + 1}. $
{item.product.name} I Talla: ${item.size} I $
{item.quantity} pz I 
 
const special Text = specialCIientSession?.active
?   especial:* $
{specialCIientSession.name}%0A*Cöd.:* $
{specialCIientSession.cIient_codeF
const msg =
 Hola, quiero solicitar un pedido.
O/OOAO/OOA' +
 *Teléfono:* ${customer.phone}%0R +
	 *Ciudad:* ${customer.city ll 	+
 *Entrega:* ${customer.delivery ll 1.1}
0/00AX +
 *Notas:* ${customer.notes ll 1.1}$
{specialText}%0A%0R +
 *Productos:*%0A${itemsText}
O//OOA%OR +
 *Piezas totales:* ${totalPieces}%0R +
 *Nivel de precio:* $
{specialClientSession?.active ? Precio especial clientel : tier.label}%0R +
 *Total a pagar:*  const link = 'https://wa.me/$
 
await fetchProducts() setCart(0) setCustomer(emptyCustomer) setLoading(false)
window.open(link, I_blankl)
} catch (error) { console.error(error) alert(error.message Il 'Error al enviar pedidol) setLoading(false)
const handleLogin = () => { if (loginForm.username === ADMIN_USERNAME  loginForm.password ===
ADMIN_PASSWORD) { setlsAdminAuthenticated(true)
localStorage.setItem(ADMIN_SESSION_KE
Y, 'true) setLoginError(") setRoute(IadminI) if (typeof window !== l undefined l)
window.history.repIaceState({}, , I/adminl) return
setLoginError(I Usuario o contrasefia incorrectos.l)
const handleLogout  setlsAdminAuthenticated(faIse)
localStorage.removeItem(ADMIN_SESSION
_ KEY) setRoute(IstoreI) if (typeof window !== l undefined l) window.history.repIaceState({}, 
return (
<div style={styles.app}>
{route === 'store/ ? (
<StoreView
isMobiIe={isMobiIe} products={products} search={search} setSearch={setSearch} storeAudience={storeAudience}
setStoreAudience={setStoreAudience} storeCategory={storeCategory} setStoreCategory={setStoreCategory} storeBrand={storeBrand} setStoreBrand={setStoreBrand} storeFit={storeFit} setStoreFit={setStoreFit}
customCategories={customCategories} customFits={customFits} selectedConfig={seIectedConfig}
setSeIectedConfig={setSeIectedConfig} addToCart={addToCart} cart={cart}
setCart={setCart} customer={customer} setCustomer={setCustomer} sendOrder={sendOrder} gallery={gallery} setGaIlery={setGalIery}
specialCIientSession={specialCIientSessio n} specialCode={speciaICode} setSpeciaICode={setSpeciaICode}
loginSpeciaICIient={IoginSpeciaICIient}
logoutSpeciaICIient={IogoutSpeciaICIient}
) : isAdminAuthenticated ? (
<header style={{ position: 'sticky', top: 0, zlndex: 20, background: 1 1 31 5, color: I #fffl, borderBottom: I l PX solid
 
<div style={{
...styles.container, minHeight: 76, display: 'flex', justifyContent: 'space-between', alignltems: 'center', gap: 16,
<div style={{ display: 'flex', alignltems: 'center', gap: 12 }}>
<img 
 width: 1 1 0, objectFit: 'contain/ }} />
<strong>Admin</strong>
</div>
<div style={{ display: 'flex', gap: 1 0
<button type="button" style={styIes.buttonSecondary} onCIick={() 	{
setRoute(IstoreI) if (typeof window !== lundefinedl) window.history.repIaceState({}, 
Ver tienda
</button>
<button type="button"
style={styles.buttonSecondary} onCIick={handIeLogout}>
<LogOut size={1 6} />
Cerrar sesiön </button>
</div>
</div>
</header>
<AdminView products={products} fetchProducts={fetchProducts} loading={loading} setLoading={setLoading} specialCIients={speciaICIients}
fetchSpeciaICIients={fetchSpecialCIients}
<AdminLogin
loginForm={loginForm} setLoginForm={setLoginForm} loginError={loginError} showPassword={showPassword}
setShowPassword={setShowPassword} handleLogin={handleLogin}
