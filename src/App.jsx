import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Menu,
  X,
  ChevronRight,
  ShoppingBag,
  LogOut,
  Lock,
  User,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Save,
  Image as ImageIcon,
  Settings,
} from 'lucide-react'
import { supabase } from './supabase'

const STORE_NAME = 'Denim Click'
const STORE_LOGO = '/logo-denim-click.png'
const ADMIN_USERNAME = 'Denim'
const ADMIN_PASSWORD = 'Denimzoa2026'
const ADMIN_SESSION_KEY = 'apartados_admin_session_v1'
const WHATSAPP_NUMBER = '525572665573'

const AUDIENCES = ['Todo', 'Hombre', 'Dama', 'Niño', 'Accesorios', 'Oferta']

const BASE_CATEGORY_MAP = {
  Hombre: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Polo', 'Camisas', 'Suéter'],
  Dama: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Suéter'],
  Niño: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Suéter'],
  Accesorios: ['Accesorios'],
  Oferta: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Polo', 'Camisas', 'Suéter', 'Accesorios'],
}

const JEANS_FITS = ['Straight', 'Slim', 'Skinny', 'Regular', 'Relaxed', 'Baggy']

const BRANDS = [
  'Levi’s',
  'Timberland',
  'MK',
  'CK',
  'American Eagle',
  'Tommy Hilfiger',
  'Burberry',
  'Otras',
]

const DEFAULT_PRICE_BY_CATEGORY = {
  Jeans: 399,
  Playeras: 199,
  Sudaderas: 349,
  Chamarras: 499,
  Shorts: 249,
  Polo: 249,
  Camisas: 299,
  Suéter: 299,
  Accesorios: 149,
}

const DEFAULT_SPECIAL_PRICE_BY_CATEGORY = {
  Jeans: 349,
  Playeras: 179,
  Sudaderas: 319,
  Chamarras: 449,
  Shorts: 219,
  Polo: 219,
  Camisas: 269,
  Suéter: 269,
  Accesorios: 129,
}

const emptyCustomer = {
  name: '',
  phone: '',
  city: '',
  delivery: 'Entrega en sucursal',
  notes: '',
}

function useIsMobile(breakpoint = 980) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return isMobile
}

function mxn(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')}`
}

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean))]
}

function getAudienceCategories(audience, customCategories = []) {
  if (audience === 'Todo') {
    return uniqueValues([...Object.values(BASE_CATEGORY_MAP).flat(), ...customCategories])
  }
  return uniqueValues([...(BASE_CATEGORY_MAP[audience] || []), ...customCategories])
}

function getJeansFits(customSubcategories = []) {
  return uniqueValues([...JEANS_FITS, ...customSubcategories])
}

function getCover(product) {
  return Array.isArray(product.images) && product.images.length ? product.images[0] : ''
}

function totalStock(stock) {
  return Object.values(stock || {}).reduce((sum, n) => sum + Number(n || 0), 0)
}

function normalizeProduct(row) {
  let images = []
  if (Array.isArray(row.images_json)) {
    images = row.images_json.filter(Boolean)
  } else if (typeof row.images_json === 'string' && row.images_json.trim()) {
    try {
      const parsed = JSON.parse(row.images_json)
      images = Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
      images = row.images ? [row.images] : []
    }
  } else if (row.images) {
    images = [row.images]
  }

  const sizes =
    typeof row.sizes === 'string' && row.sizes.trim()
      ? row.sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : ['CH', 'M', 'G']

  const stock =
    row.stock_json && typeof row.stock_json === 'object' && !Array.isArray(row.stock_json)
      ? row.stock_json
      : Object.fromEntries(sizes.map((s) => [s, 0]))

  return {
    id: row.id,
    created_at: row.created_at,
    name: row.name || '',
    description: row.description || '',
    category: row.category || 'Jeans',
    subcategory: row.subcategory || '',
    audience: row.audience || 'Hombre',
    brand: row.brand || 'Otras',
    images,
    sizes,
    stock,
    stock_total: Number(row.stock || totalStock(stock)),
    price: Number(row.price_base ?? row.price ?? 0),
    price_base: Number(row.price_base ?? row.price ?? 0),
    price_tier3: Number(row.price_tier3 ?? row.price_base ?? row.price ?? 0),
    price_tier10: Number(row.price_tier10 ?? row.price_base ?? row.price ?? 0),
    special_price: Number(row.special_price ?? 0),
    active: row.active !== false,
    is_new: row.is_new !== false,
    is_offer: row.is_offer === true,
    sales_count: Number(row.sales_count || 0),
    category_order: Number(row.category_order || 0),
  }
}

function productToDb(product) {
  const stockTotal = totalStock(product.stock)
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory || '',
    audience: product.audience,
    brand: product.brand || 'Otras',
    images: product.images?.[0] || '',
    images_json: product.images || [],
    sizes: (product.sizes || []).join(','),
    stock: stockTotal,
    stock_json: product.stock || {},
    price: Number(product.price || 0),
    price_base: Number(product.price || 0),
    price_tier3: Number(product.price_tier3 || 0),
    price_tier10: Number(product.price_tier10 || 0),
    special_price: Number(product.special_price || 0),
    active: product.active !== false,
    is_new: product.is_new !== false,
    is_offer: product.is_offer === true,
    sales_count: Number(product.sales_count || 0),
    category_order: Number(product.category_order || 0),
  }
}

function buildEmptyProduct() {
  return {
    name: '',
    description: '',
    category: 'Jeans',
    subcategory: 'Straight',
    audience: 'Hombre',
    brand: 'Levi’s',
    images: [],
    sizes: ['28', '30', '32'],
    stock: { 28: 0, 30: 0, 32: 0 },
    price: DEFAULT_PRICE_BY_CATEGORY.Jeans,
    price_tier3: DEFAULT_PRICE_BY_CATEGORY.Jeans,
    price_tier10: DEFAULT_PRICE_BY_CATEGORY.Jeans,
    special_price: DEFAULT_SPECIAL_PRICE_BY_CATEGORY.Jeans,
    active: true,
    is_new: true,
    is_offer: false,
    sales_count: 0,
    category_order: 0,
    customCategory: '',
    customSubcategory: '',
    customBrand: '',
  }
}

function currentTier(totalPieces) {
  if (totalPieces >= 10) return { key: 'price_tier10', label: 'Precio 10+ piezas' }
  if (totalPieces >= 3) return { key: 'price_tier3', label: 'Precio 3+ piezas' }
  return { key: 'price', label: 'Precio normal' }
}

function Badge({ children, bg = '#f3f4f6', color = '#111827', border = 'none' }) {
  return (
    <span
      style={{
        fontSize: 12,
        borderRadius: 999,
        padding: '5px 10px',
        background: bg,
        color,
        border,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}
    </span>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f5f5f5',
    color: '#111827',
  },
  container: {
    maxWidth: 1380,
    margin: '0 auto',
    padding: '0 18px',
  },
  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 16,
    padding: '12px 14px',
    outline: 'none',
    background: '#fff',
  },
  textarea: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 16,
    padding: '12px 14px',
    outline: 'none',
    background: '#fff',
    minHeight: 110,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  buttonPrimary: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    padding: '12px 18px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonSecondary: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: 16,
    padding: '12px 18px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 24,
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  },
}

function ProductLightbox({ open, product, imageIndex, setImageIndex, onClose }) {
  if (!open || !product) return null

  const images = product.images || []

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.8)',
        zIndex: 80,
        display: 'grid',
        placeItems: 'center',
        padding: 18,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: '#fff',
          border: 'none',
          borderRadius: 999,
          padding: '8px 12px',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>

      <div style={{ width: '100%', maxWidth: 980 }}>
        <div style={{ color: '#fff', marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <strong>{product.name}</strong>
          <span>
            {imageIndex + 1} / {images.length}
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'rgba(255,255,255,.08)',
          }}
        >
          <img
            src={images[imageIndex]}
            alt={product.name}
            style={{ width: '100%', maxHeight: '78vh', objectFit: 'contain' }}
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setImageIndex((p) => (p - 1 + images.length) % images.length)}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  padding: '10px 14px',
                }}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => setImageIndex((p) => (p + 1) % images.length)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  padding: '10px 14px',
                }}
              >
                ›
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(6, 1fr)', marginTop: 12 }}>
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImageIndex(idx)}
                style={{
                  padding: 0,
                  border: idx === imageIndex ? '2px solid #fff' : '1px solid rgba(255,255,255,.25)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <img src={img} alt={`${product.name}-${idx}`} style={{ width: '100%', height: 64, objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DesktopMegaMenu({
  activeAudience,
  closeMenu,
  products,
  setStoreAudience,
  setStoreCategory,
  setStoreBrand,
  setStoreFit,
  customCategories,
  customFits,
}) {
  const [hoveredCategory, setHoveredCategory] = useState('')

  const categories = getAudienceCategories(activeAudience, customCategories).filter((c) => c !== 'Playera')
  const brands = uniqueValues([
    ...BRANDS,
    ...products
      .filter((p) => (activeAudience === 'Todo' ? true : p.audience === activeAudience))
      .map((p) => p.brand),
  ])

  const fitList = getJeansFits(customFits)

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '100%',
        background: '#111315',
        color: '#fff',
        borderTop: '1px solid rgba(255,255,255,.08)',
        zIndex: 30,
      }}
      onMouseLeave={closeMenu}
    >
      <div style={{ ...styles.container, paddingTop: 28, paddingBottom: 28 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: hoveredCategory === 'Jeans' ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr',
            gap: 40,
          }}
        >
          <div>
            <h4 style={{ marginTop: 0, fontSize: 18 }}>{activeAudience}</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onClick={() => {
                    if (cat === 'Jeans') return
                    setStoreAudience(activeAudience)
                    setStoreCategory(cat)
                    setStoreFit('Todos')
                    setStoreBrand('Todas')
                    closeMenu()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#d1d5db',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{cat}</span>
                  {cat === 'Jeans' ? <ChevronRight size={16} /> : null}
                </button>
              ))}
            </div>
          </div>

          {hoveredCategory === 'Jeans' && (
            <div>
              <h4 style={{ marginTop: 0, fontSize: 18 }}>Fit</h4>
              <div style={{ display: 'grid', gap: 12 }}>
                {fitList.map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => {
                      setStoreAudience(activeAudience)
                      setStoreCategory('Jeans')
                      setStoreFit(fit)
                      setStoreBrand('Todas')
                      closeMenu()
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#d1d5db',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 16,
                    }}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 style={{ marginTop: 0, fontSize: 18 }}>Marcas</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    setStoreAudience(activeAudience)
                    setStoreCategory('Todos')
                    setStoreFit('Todos')
                    setStoreBrand(brand)
                    closeMenu()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#d1d5db',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 16,
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ marginTop: 0, fontSize: 18 }}>Explorar</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setStoreAudience(activeAudience)
                  setStoreCategory('Todos')
                  setStoreFit('Todos')
                  setStoreBrand('Todas')
                  closeMenu()
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#d1d5db',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 16,
                }}
              >
                Ver todo {activeAudience}
              </button>

              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#d1d5db',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 16,
                }}
              >
                Mejora tu precio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileMenu({
  open,
  close,
  products,
  setStoreAudience,
  setStoreCategory,
  setStoreBrand,
  setStoreFit,
  customCategories,
  customFits,
}) {
  const [step, setStep] = useState('audiences')
  const [selectedAudience, setSelectedAudience] = useState('Hombre')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    if (!open) {
      setStep('audiences')
      setSelectedAudience('Hombre')
      setSelectedCategory('')
    }
  }, [open])

  if (!open) return null

  const categories = getAudienceCategories(selectedAudience, customCategories).filter((c) => c !== 'Playera')
  const brands = uniqueValues([
    ...BRANDS,
    ...products
      .filter((p) => (selectedAudience === 'Todo' ? true : p.audience === selectedAudience))
      .map((p) => p.brand),
  ])

  const fits = getJeansFits(customFits)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 50 }}>
      <div
        style={{
          width: '86%',
          maxWidth: 430,
          height: '100%',
          background: '#111315',
          color: '#fff',
          padding: 24,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={STORE_LOGO} alt={STORE_NAME} style={{ width: 110, objectFit: 'contain' }} />
          <button
            type="button"
            onClick={close}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={30} />
          </button>
        </div>

        {step !== 'audiences' && (
          <button
            type="button"
            onClick={() => {
              if (step === 'categories') setStep('audiences')
              if (step === 'fits') setStep('categories')
              if (step === 'brands') setStep('categories')
            }}
            style={{
              marginTop: 18,
              background: 'transparent',
              border: 'none',
              color: '#d1d5db',
              cursor: 'pointer',
              padding: 0,
              fontSize: 15,
            }}
          >
            ← Volver
          </button>
        )}

        <div style={{ marginTop: 22, display: 'grid', gap: 22 }}>
          {step === 'audiences' &&
            AUDIENCES.filter((x) => x !== 'Todo').map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => {
                  setSelectedAudience(aud)
                  setStep('categories')
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 28,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span>{aud}</span>
                <ChevronRight />
              </button>
            ))}

          {step === 'categories' && (
            <>
              <h3 style={{ margin: 0, fontSize: 34 }}>{selectedAudience}</h3>

              <button
                type="button"
                onClick={() => {
                  setStoreAudience(selectedAudience)
                  setStoreCategory('Todos')
                  setStoreFit('Todos')
                  setStoreBrand('Todas')
                  close()
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 22,
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Ver todo
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    if (cat === 'Jeans') {
                      setSelectedCategory(cat)
                      setStep('fits')
                    } else {
                      setStoreAudience(selectedAudience)
                      setStoreCategory(cat)
                      setStoreFit('Todos')
                      setStoreBrand('Todas')
                      close()
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: 22,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <span>{cat}</span>
                  {cat === 'Jeans' ? <ChevronRight /> : null}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setStep('brands')}
                style={{
                  marginTop: 10,
                  background: 'transparent',
                  border: 'none',
                  color: '#d1d5db',
                  fontSize: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span>Marcas</span>
                <ChevronRight />
              </button>
            </>
          )}

          {step === 'fits' && (
            <>
              <h3 style={{ margin: 0, fontSize: 34 }}>Fit</h3>
              {fits.map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => {
                    setStoreAudience(selectedAudience)
                    setStoreCategory(selectedCategory)
                    setStoreFit(fit)
                    setStoreBrand('Todas')
                    close()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: 22,
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {fit}
                </button>
              ))}
            </>
          )}

          {step === 'brands' && (
            <>
              <h3 style={{ margin: 0, fontSize: 34 }}>Marcas</h3>
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    setStoreAudience(selectedAudience)
                    setStoreCategory('Todos')
                    setStoreFit('Todos')
                    setStoreBrand(brand)
                    close()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: 22,
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {brand}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  selectedConfig,
  setSelectedConfig,
  onAddToCart,
  onOpenGallery,
}) {
  const current = selectedConfig[product.id] || {
    size: '',
    quantity: 0,
  }

  const activeSize = current.size
  const stockForSelected = Number(product.stock?.[activeSize] || 0)

  const setSize = (size) => {
    const available = Number(product.stock?.[size] || 0)
    setSelectedConfig((prev) => ({
      ...prev,
      [product.id]: {
        size,
        quantity: available > 0 ? Math.min(prev[product.id]?.quantity || 1, available) : 0,
      },
    }))
  }

  const setQuantity = (qty) => {
    const available = Number(product.stock?.[activeSize] || 0)
    const clean = Math.max(0, Math.min(Number(qty || 0), available))
    setSelectedConfig((prev) => ({
      ...prev,
      [product.id]: {
        size: activeSize,
        quantity: clean,
      },
    }))
  }

  return (
    <div style={{ ...styles.card, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => onOpenGallery(product)}
        style={{
          width: '100%',
          border: 'none',
          background: '#f3f4f6',
          padding: 0,
          cursor: 'pointer',
          aspectRatio: '4 / 4.35',
        }}
      >
        {getCover(product) ? (
          <img src={getCover(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
            <ImageIcon size={42} color="#9ca3af" />
          </div>
        )}
      </button>

      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <Badge>{product.audience}</Badge>
          <Badge bg="#fff" border="1px solid #d1d5db">{product.brand}</Badge>
          {product.category === 'Jeans' && product.subcategory ? (
            <Badge bg="#dbeafe" color="#1d4ed8">{product.subcategory}</Badge>
          ) : null}
          {product.is_new ? (
            <Badge bg="#0284c7" color="#fff">Nuevo</Badge>
          ) : null}
          {product.sales_count > 0 ? (
            <Badge bg="#f59e0b" color="#fff">Más vendido</Badge>
          ) : null}
        </div>

        <h4 style={{ margin: 0, fontSize: 22 }}>{product.name}</h4>
        <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{product.category}</p>
        <p style={{ margin: '10px 0 0', color: '#6b7280', minHeight: 48 }}>
          {product.description || 'Sin descripción'}
        </p>

        <div style={{ marginTop: 14 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>{mxn(product.price)}</p>
        </div>

        <div style={{ marginTop: 14 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280', fontWeight: 700 }}>Tallas</p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(product.sizes || []).map((size) => {
              const qty = Number(product.stock?.[size] || 0)
              const selected = activeSize === size
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => qty > 0 && setSize(size)}
                  style={{
                    border: selected ? '2px solid #0f172a' : '1px solid #d1d5db',
                    borderRadius: 14,
                    background: qty > 0 ? '#fff' : '#f3f4f6',
                    padding: '8px 10px',
                    minWidth: 54,
                    cursor: qty > 0 ? 'pointer' : 'not-allowed',
                    opacity: qty > 0 ? 1 : 0.6,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{size}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{qty} pz</div>
                </button>
              )
            })}
          </div>
        </div>

        {activeSize ? (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((current.quantity || 0) - 1)}
                style={styles.buttonSecondary}
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                min="0"
                max={stockForSelected}
                value={current.quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ ...styles.input, width: 86, textAlign: 'center' }}
              />

              <button
                type="button"
                onClick={() => setQuantity((current.quantity || 0) + 1)}
                style={styles.buttonSecondary}
              >
                <Plus size={16} />
              </button>

              <span style={{ color: '#6b7280', fontSize: 14 }}>
                Disponible: {stockForSelected} pz
              </span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={!activeSize || Number(current.quantity || 0) <= 0}
          style={{
            ...styles.buttonPrimary,
            width: '100%',
            marginTop: 16,
            opacity: !activeSize || Number(current.quantity || 0) <= 0 ? 0.5 : 1,
          }}
        >
          Agregar producto
        </button>
      </div>
    </div>
  )
}

function CartSection({
  isMobile,
  cart,
  setCart,
  customer,
  setCustomer,
  sendOrder,
}) {
  const totalPieces = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cart])
  const tier = currentTier(totalPieces)

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const unit = Number(item.product[tier.key] || item.product.price || 0)
      return sum + unit * Number(item.quantity || 0)
    }, 0)
  }, [cart, tier])

  const updateItemQty = (index, nextQty) => {
    setCart((prev) => {
      const next = [...prev]
      const item = next[index]
      if (!item) return prev
      const max = Number(item.product.stock?.[item.size] || 0)
      const clean = Math.max(0, Math.min(Number(nextQty || 0), max))
      next[index] = { ...item, quantity: clean }
      return next.filter((x) => Number(x.quantity || 0) > 0)
    })
  }

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <section style={{ paddingBottom: 54 }}>
      <div style={styles.container}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: isMobile ? '1fr' : '1.05fr .95fr' }}>
          <div style={{ ...styles.card, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 30 }}>Carrito</h3>
                <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                  Aquí verás tus productos, piezas y total a pagar.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Badge bg="#eef2ff" color="#3730a3">{tier.label}</Badge>
                <Badge>{totalPieces} pz</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              {cart.length === 0 ? (
                <div
                  style={{
                    border: '1px dashed #d1d5db',
                    borderRadius: 20,
                    padding: 26,
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
                  Tu carrito está vacío.
                </div>
              ) : (
                cart.map((item, index) => {
                  const unit = Number(item.product[tier.key] || item.product.price || 0)
                  const lineTotal = unit * Number(item.quantity || 0)
                  const stock = Number(item.product.stock?.[item.size] || 0)

                  return (
                    <div key={`${item.product.id}-${item.size}-${index}`} style={{ border: '1px solid #e5e7eb', borderRadius: 20, padding: 16 }}>
                      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '84px 1fr auto', alignItems: 'start' }}>
                        <div style={{ borderRadius: 16, overflow: 'hidden', background: '#f3f4f6' }}>
                          {getCover(item.product) ? (
                            <img src={getCover(item.product)} alt={item.product.name} style={{ width: '100%', height: 84, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: 84, display: 'grid', placeItems: 'center' }}>
                              <ImageIcon size={28} color="#9ca3af" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 style={{ margin: 0, fontSize: 20 }}>{item.product.name}</h4>
                          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                            {item.product.brand} · {item.product.category}
                          </p>
                          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                            Talla: {item.size}
                          </p>
                          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                            Precio unitario actual: {mxn(unit)}
                          </p>
                        </div>

                        <div style={{ display: 'grid', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button type="button" style={styles.buttonSecondary} onClick={() => updateItemQty(index, item.quantity - 1)}>
                              <Minus size={16} />
                            </button>

                            <input
                              type="number"
                              min="0"
                              max={stock}
                              value={item.quantity}
                              onChange={(e) => updateItemQty(index, e.target.value)}
                              style={{ ...styles.input, width: 74, textAlign: 'center' }}
                            />

                            <button type="button" style={styles.buttonSecondary} onClick={() => updateItemQty(index, item.quantity + 1)}>
                              <Plus size={16} />
                            </button>
                          </div>

                          <div style={{ fontWeight: 800, textAlign: isMobile ? 'left' : 'right' }}>{mxn(lineTotal)}</div>

                          <button type="button" style={styles.buttonSecondary} onClick={() => removeItem(index)}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gap: 14,
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                marginTop: 18,
              }}
            >
              <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Piezas totales</p>
                <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800 }}>{totalPieces}</p>
              </div>

              <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Precio aplicado</p>
                <p style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 800 }}>{tier.label}</p>
              </div>

              <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Total a pagar</p>
                <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800 }}>{mxn(subtotal)}</p>
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 30 }}>Datos del cliente</h3>
            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
              Completa tus datos y envía el pedido por WhatsApp.
            </p>

            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              <input
                style={styles.input}
                placeholder="Nombre del cliente"
                value={customer.name}
                onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
              />

              <input
                style={styles.input}
                placeholder="Teléfono"
                value={customer.phone}
                onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
              />

              <input
                style={styles.input}
                placeholder="Ciudad o estado"
                value={customer.city}
                onChange={(e) => setCustomer((p) => ({ ...p, city: e.target.value }))}
              />

              <select
                style={styles.input}
                value={customer.delivery}
                onChange={(e) => setCustomer((p) => ({ ...p, delivery: e.target.value }))}
              >
                <option value="Entrega en sucursal">Entrega en sucursal</option>
                <option value="Envíos">Envíos</option>
                <option value="Entrega en punto medio">Entrega en punto medio</option>
              </select>

              <textarea
                style={styles.textarea}
                placeholder="Notas o comentarios"
                value={customer.notes}
                onChange={(e) => setCustomer((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <button
              type="button"
              style={{ ...styles.buttonPrimary, width: '100%', marginTop: 18 }}
              onClick={sendOrder}
              disabled={cart.length === 0}
            >
              <ShoppingBag size={18} />
              Solicitar pedido
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductForm({ draft, setDraft, onSave, onCancel, loading, saveLabel, products }) {
  const [newSize, setNewSize] = useState('')

  const customCategories = uniqueValues(
    products
      .map((p) => p.category)
      .filter((c) => !uniqueValues(Object.values(BASE_CATEGORY_MAP).flat()).includes(c))
  )

  const customFits = uniqueValues(
    products
      .map((p) => p.subcategory)
      .filter((s) => s && !JEANS_FITS.includes(s))
  )

  const customBrands = uniqueValues(products.map((p) => p.brand).filter((b) => b && !BRANDS.includes(b)))

  const categories = getAudienceCategories(draft.audience, customCategories).filter((c) => c !== 'Playera')
  const fits = getJeansFits(customFits)
  const brands = uniqueValues([...BRANDS, ...customBrands])

  const addFiles = (files) => {
    const list = Array.from(files || []).filter((file) => file.type.startsWith('image/'))
    if (!list.length) return

    Promise.all(
      list.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result || ''))
            reader.readAsDataURL(file)
          })
      )
    ).then((images) => {
      setDraft((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...images].filter(Boolean),
      }))
    })
  }

  const removeImage = (index) => {
    setDraft((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }))
  }

  const updateSizesFromText = (text) => {
    const sizes = text.split(',').map((s) => s.trim()).filter(Boolean)
    const nextSizes = sizes.length ? sizes : ['CH', 'M', 'G']
    const nextStock = Object.fromEntries(nextSizes.map((s) => [s, Number(draft.stock?.[s] || 0)]))
    setDraft((prev) => ({ ...prev, sizes: nextSizes, stock: nextStock }))
  }

  const addSize = () => {
    const value = newSize.trim()
    if (!value || draft.sizes.includes(value)) return
    setDraft((prev) => ({
      ...prev,
      sizes: [...prev.sizes, value],
      stock: { ...prev.stock, [value]: 0 },
    }))
    setNewSize('')
  }

  const removeSize = (sizeToRemove) => {
    if (draft.sizes.length <= 1) return
    const nextSizes = draft.sizes.filter((s) => s !== sizeToRemove)
    const nextStock = Object.fromEntries(nextSizes.map((s) => [s, Number(draft.stock?.[s] || 0)]))
    setDraft((prev) => ({ ...prev, sizes: nextSizes, stock: nextStock }))
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <input
          style={styles.input}
          placeholder="Nombre del producto"
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
        />

        <select
          style={styles.input}
          value={draft.audience}
          onChange={(e) => {
            const audience = e.target.value
            const nextCategory = getAudienceCategories(audience, customCategories)[0] || 'Jeans'
            const base = DEFAULT_PRICE_BY_CATEGORY[nextCategory] || 0
            const special = DEFAULT_SPECIAL_PRICE_BY_CATEGORY[nextCategory] || 0

            setDraft((p) => ({
              ...p,
              audience,
              category: nextCategory,
              subcategory: nextCategory === 'Jeans' ? 'Straight' : '',
              price: base,
              price_tier3: base,
              price_tier10: base,
              special_price: special,
            }))
          }}
        >
          {AUDIENCES.filter((x) => x !== 'Todo').map((aud) => (
            <option key={aud} value={aud}>
              {aud}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <select
          style={styles.input}
          value={draft.category}
          onChange={(e) => {
            const category = e.target.value
            const base = DEFAULT_PRICE_BY_CATEGORY[category] || 0
            const special = DEFAULT_SPECIAL_PRICE_BY_CATEGORY[category] || 0
            setDraft((p) => ({
              ...p,
              category,
              subcategory: category === 'Jeans' ? 'Straight' : '',
              price: base,
              price_tier3: base,
              price_tier10: base,
              special_price: special,
            }))
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          style={styles.input}
          placeholder="O crea una categoría personalizada"
          value={draft.customCategory || ''}
          onChange={(e) => setDraft((p) => ({ ...p, customCategory: e.target.value }))}
        />
      </div>

      {draft.category === 'Jeans' && (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
          <select
            style={styles.input}
            value={draft.subcategory}
            onChange={(e) => setDraft((p) => ({ ...p, subcategory: e.target.value }))}
          >
            {fits.map((fit) => (
              <option key={fit} value={fit}>
                {fit}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="O crea un fit personalizado"
            value={draft.customSubcategory || ''}
            onChange={(e) => setDraft((p) => ({ ...p, customSubcategory: e.target.value }))}
          />
        </div>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <select
          style={styles.input}
          value={draft.brand}
          onChange={(e) => setDraft((p) => ({ ...p, brand: e.target.value }))}
        >
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <input
          style={styles.input}
          placeholder="O crea una marca personalizada"
          value={draft.customBrand || ''}
          onChange={(e) => setDraft((p) => ({ ...p, customBrand: e.target.value }))}
        />
      </div>

      <textarea
        style={styles.textarea}
        placeholder="Descripción"
        value={draft.description}
        onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
      />

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <input
          style={styles.input}
          type="number"
          placeholder="Precio normal"
          value={draft.price}
          onChange={(e) => setDraft((p) => ({ ...p, price: Number(e.target.value) }))}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Precio 3+"
          value={draft.price_tier3}
          onChange={(e) => setDraft((p) => ({ ...p, price_tier3: Number(e.target.value) }))}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Precio 10+"
          value={draft.price_tier10}
          onChange={(e) => setDraft((p) => ({ ...p, price_tier10: Number(e.target.value) }))}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Precio especial"
          value={draft.special_price}
          onChange={(e) => setDraft((p) => ({ ...p, special_price: Number(e.target.value) }))}
        />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          addFiles(e.dataTransfer.files)
        }}
        style={{
          border: '1px dashed #d1d5db',
          borderRadius: 18,
          padding: 20,
          background: '#f9fafb',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <label style={{ cursor: 'pointer', display: 'block' }}>
          <ImageIcon size={34} color="#9ca3af" />
          <p style={{ margin: '10px 0 4px', fontWeight: 700 }}>Sube imágenes del producto</p>
          <p style={{ margin: 0, color: '#6b7280' }}>Puedes arrastrarlas o hacer clic aquí</p>
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      </div>

      {(draft.images || []).length > 0 && (
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {draft.images.map((img, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                background: '#f3f4f6',
              }}
            >
              <img src={img} alt={`img-${index}`} style={{ width: '100%', height: 90, objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 6,
                  border: 'none',
                  borderRadius: 999,
                  background: '#fff',
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
        <p style={{ marginTop: 0, fontWeight: 700 }}>Tallas</p>
        <input
          style={styles.input}
          value={draft.sizes.join(', ')}
          onChange={(e) => updateSizesFromText(e.target.value)}
          placeholder="Ejemplo: 28, 30, 32, 34"
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {draft.sizes.map((size) => (
            <div
              key={size}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{size}</span>
              <button
                type="button"
                onClick={() => removeSize(size)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <input
            style={styles.input}
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="Nueva talla"
          />
          <button type="button" style={styles.buttonSecondary} onClick={addSize}>
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {draft.sizes.map((size) => (
          <div key={size} style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 12 }}>
            <p style={{ marginTop: 0, fontSize: 14, fontWeight: 700 }}>Stock {size}</p>
            <input
              style={styles.input}
              type="number"
              value={draft.stock[size] ?? 0}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  stock: { ...p.stock, [size]: Number(e.target.value) },
                }))
              }
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr 1fr' }}>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft((p) => ({ ...p, active: e.target.checked }))}
          />
          Activo
        </label>

        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={draft.is_new}
            onChange={(e) => setDraft((p) => ({ ...p, is_new: e.target.checked }))}
          />
          Nuevo
        </label>

        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={draft.is_offer}
            onChange={(e) => setDraft((p) => ({ ...p, is_offer: e.target.checked }))}
          />
          Oferta
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" style={styles.buttonPrimary} onClick={onSave} disabled={loading}>
          <Save size={16} />
          {loading ? 'Guardando...' : saveLabel}
        </button>

        <button type="button" style={styles.buttonSecondary} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

function StoreView({
  isMobile,
  products,
  search,
  setSearch,
  storeAudience,
  setStoreAudience,
  storeCategory,
  setStoreCategory,
  storeBrand,
  setStoreBrand,
  storeFit,
  setStoreFit,
  customCategories,
  customFits,
  selectedConfig,
  setSelectedConfig,
  addToCart,
  cart,
  setCart,
  customer,
  setCustomer,
  sendOrder,
  gallery,
  setGallery,
}) {
  const [openMegaMenu, setOpenMegaMenu] = useState(false)
  const [megaAudience, setMegaAudience] = useState('Hombre')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const visibleBrands = uniqueValues([...BRANDS, ...products.map((p) => p.brand)])
  const visibleCategories = getAudienceCategories(storeAudience, customCategories).filter((c) => c !== 'Playera')

  const filteredProducts = useMemo(() => {
    let list = [...products].filter((p) => p.active)

    if (storeAudience !== 'Todo') {
      list = list.filter((p) => p.audience === storeAudience)
    }

    if (storeCategory !== 'Todos') {
      list = list.filter((p) => p.category === storeCategory)
    }

    if (storeBrand !== 'Todas') {
      list = list.filter((p) => p.brand === storeBrand)
    }

    if (storeFit !== 'Todos') {
      list = list.filter((p) => p.subcategory === storeFit)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        `${p.name} ${p.category} ${p.subcategory} ${p.brand} ${p.audience}`.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      const aPriority = (a.is_new ? 1000000 : 0) + Number(a.sales_count || 0) * 1000 + new Date(a.created_at || 0).getTime()
      const bPriority = (b.is_new ? 1000000 : 0) + Number(b.sales_count || 0) * 1000 + new Date(b.created_at || 0).getTime()
      return bPriority - aPriority
    })

    return list
  }, [products, storeAudience, storeCategory, storeBrand, storeFit, search])

  const totalPieces = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cart])
  const tier = currentTier(totalPieces)

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#111315',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div style={{ ...styles.container, position: 'relative' }}>
          <div
            style={{
              minHeight: 82,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <img
                src={STORE_LOGO}
                alt={STORE_NAME}
                style={{ width: isMobile ? 96 : 132, objectFit: 'contain' }}
              />
            </div>

            {!isMobile ? (
              <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                {AUDIENCES.filter((x) => x !== 'Todo').map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onMouseEnter={() => {
                      setMegaAudience(aud)
                      setOpenMegaMenu(true)
                    }}
                    onClick={() => {
                      setStoreAudience(aud)
                      setStoreCategory('Todos')
                      setStoreFit('Todos')
                      setStoreBrand('Todas')
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: 'pointer',
                      borderBottom: megaAudience === aud && openMegaMenu ? '2px solid #fff' : '2px solid transparent',
                      paddingBottom: 10,
                    }}
                  >
                    {aud}
                  </button>
                ))}
              </nav>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!isMobile ? (
                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={17} color="#9ca3af" style={{ position: 'absolute', top: 14, left: 12 }} />
                  <input
                    style={{
                      ...styles.input,
                      background: '#0b0c0d',
                      border: '1px solid rgba(255,255,255,.12)',
                      color: '#fff',
                      paddingLeft: 36,
                    }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar"
                  />
                </div>
              ) : null}

              {!isMobile ? (
                <button type="button" style={styles.buttonSecondary}>
                  Mejora tu precio
                </button>
              ) : null}

              {isMobile ? (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <Menu size={32} />
                </button>
              ) : null}
            </div>
          </div>

          {!isMobile && openMegaMenu ? (
            <DesktopMegaMenu
              activeAudience={megaAudience}
              closeMenu={() => setOpenMegaMenu(false)}
              products={products}
              setStoreAudience={setStoreAudience}
              setStoreCategory={setStoreCategory}
              setStoreBrand={setStoreBrand}
              setStoreFit={setStoreFit}
              customCategories={customCategories}
              customFits={customFits}
            />
          ) : null}
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        close={() => setMobileMenuOpen(false)}
        products={products}
        setStoreAudience={setStoreAudience}
        setStoreCategory={setStoreCategory}
        setStoreBrand={setStoreBrand}
        setStoreFit={setStoreFit}
        customCategories={customCategories}
        customFits={customFits}
      />

      <section style={{ padding: '28px 0 14px' }}>
        <div style={styles.container}>
          <div
            style={{
              display: 'grid',
              gap: 22,
              gridTemplateColumns: isMobile ? '1fr' : '1.15fr .85fr',
              alignItems: 'start',
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? 34 : 52,
                  lineHeight: 1.02,
                  fontWeight: 800,
                  maxWidth: 660,
                }}
              >
                Aparta mercancía y desbloquea mejor precio por volumen.
              </h1>
            </div>

            <div style={{ ...styles.card, padding: 22, display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Nivel actual</p>
                  <h2 style={{ margin: '5px 0 0', fontSize: isMobile ? 28 : 34 }}>{tier.label}</h2>
                </div>
                <div
                  style={{
                    background: '#f3f4f6',
                    borderRadius: 16,
                    padding: '10px 14px',
                    minWidth: 78,
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Piezas</p>
                  <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: 24 }}>{totalPieces}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Subtotal estimado</p>
                  <p style={{ margin: '6px 0 0', fontWeight: 800, fontSize: 22 }}>
                    {mxn(
                      cart.reduce((sum, item) => {
                        const unit = Number(item.product[tier.key] || item.product.price || 0)
                        return sum + unit * Number(item.quantity || 0)
                      }, 0)
                    )}
                  </p>
                </div>

                <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Venta</p>
                  <p style={{ margin: '6px 0 0', fontWeight: 700 }}>Piezas mixtas</p>
                  <p style={{ margin: '8px 0 0', color: '#d97706', fontSize: 14 }}>
                    {totalPieces >= 10
                      ? 'Ya tienes el mejor precio disponible.'
                      : totalPieces >= 3
                        ? `Te faltan ${10 - totalPieces} pieza(s) para desbloquear el precio de 10+ piezas.`
                        : `Te faltan ${3 - totalPieces} pieza(s) para desbloquear el precio de 3+ piezas.`}
                  </p>
                </div>
              </div>

              {isMobile ? (
                <button type="button" style={{ ...styles.buttonSecondary, marginTop: 6 }}>
                  Mejora tu precio
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 24 }}>
        <div style={styles.container}>
          <div
            style={{
              display: 'grid',
              gap: 14,
              gridTemplateColumns: isMobile ? '1fr' : '1.25fr .8fr .9fr .9fr',
              alignItems: 'center',
            }}
          >
            {isMobile ? (
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
                <input
                  style={{ ...styles.input, paddingLeft: 36 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto"
                />
              </div>
            ) : (
              <div />
            )}

            <select
              style={styles.input}
              value={storeAudience}
              onChange={(e) => {
                setStoreAudience(e.target.value)
                setStoreCategory('Todos')
                setStoreBrand('Todas')
                setStoreFit('Todos')
              }}
            >
              {AUDIENCES.map((aud) => (
                <option key={aud} value={aud}>
                  {aud}
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              value={storeCategory}
              onChange={(e) => {
                setStoreCategory(e.target.value)
                setStoreFit('Todos')
              }}
            >
              <option value="Todos">Todos los productos</option>
              {visibleCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              value={storeBrand}
              onChange={(e) => setStoreBrand(e.target.value)}
            >
              <option value="Todas">Todas las marcas</option>
              {visibleBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 42 }}>
        <div style={styles.container}>
          {filteredProducts.length === 0 ? (
            <div style={{ ...styles.card, padding: 30, textAlign: 'center', color: '#6b7280' }}>
              No encontramos productos con ese filtro.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 22,
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))',
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedConfig={selectedConfig}
                  setSelectedConfig={setSelectedConfig}
                  onAddToCart={addToCart}
                  onOpenGallery={(prod) =>
                    setGallery({
                      open: true,
                      product: prod,
                      imageIndex: 0,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CartSection
        isMobile={isMobile}
        cart={cart}
        setCart={setCart}
        customer={customer}
        setCustomer={setCustomer}
        sendOrder={sendOrder}
      />

      <ProductLightbox
        open={gallery.open}
        product={gallery.product}
        imageIndex={gallery.imageIndex}
        setImageIndex={(value) =>
          setGallery((prev) => ({
            ...prev,
            imageIndex: typeof value === 'function' ? value(prev.imageIndex) : value,
          }))
        }
        onClose={() => setGallery({ open: false, product: null, imageIndex: 0 })}
      />
    </>
  )
}

function AdminView({ products, fetchProducts, loading, setLoading }) {
  const isMobile = useIsMobile()
  const [adminSearch, setAdminSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingDraft, setEditingDraft] = useState(null)
  const [newProductDraft, setNewProductDraft] = useState(buildEmptyProduct())

  const filteredProducts = useMemo(() => {
    if (!adminSearch.trim()) return products
    const q = adminSearch.toLowerCase()
    return products.filter((p) =>
      `${p.name} ${p.category} ${p.subcategory} ${p.brand} ${p.audience}`.toLowerCase().includes(q)
    )
  }, [products, adminSearch])

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.active).length,
      stock: products.reduce((sum, p) => sum + Number(p.stock_total || 0), 0),
    }
  }, [products])

  const prepareDraftForSave = (draft) => {
    const finalCategory = draft.customCategory?.trim() || draft.category
    const finalSubcategory = finalCategory === 'Jeans' ? draft.customSubcategory?.trim() || draft.subcategory : ''
    const finalBrand = draft.customBrand?.trim() || draft.brand
    return {
      ...draft,
      category: finalCategory,
      subcategory: finalSubcategory,
      brand: finalBrand,
    }
  }

  const addProduct = async () => {
    if (!newProductDraft.name.trim()) {
      alert('Pon nombre al producto')
      return
    }

    setLoading(true)
    const clean = prepareDraftForSave(newProductDraft)
    const payload = productToDb(clean)
    const { error } = await supabase.from('products').insert([payload])
    setLoading(false)

    if (error) {
      alert(`No se pudo crear el producto: ${error.message}`)
      return
    }

    setNewProductDraft(buildEmptyProduct())
    await fetchProducts()
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setEditingDraft({
      ...product,
      customCategory: '',
      customSubcategory: '',
      customBrand: '',
    })
  }

  const saveEdit = async () => {
    if (!editingDraft?.name?.trim()) {
      alert('Pon nombre al producto')
      return
    }

    setLoading(true)
    const clean = prepareDraftForSave(editingDraft)
    const payload = productToDb(clean)
    const { error } = await supabase.from('products').update(payload).eq('id', editingId)
    setLoading(false)

    if (error) {
      alert(`No se pudo actualizar el producto: ${error.message}`)
      return
    }

    setEditingId(null)
    setEditingDraft(null)
    await fetchProducts()
  }

  const toggleActive = async (id, next) => {
    const { error } = await supabase.from('products').update({ active: next }).eq('id', id)
    if (error) {
      alert(`No se pudo cambiar el estado: ${error.message}`)
      return
    }
    await fetchProducts()
  }

  const deleteProduct = async (id) => {
    const ok = window.confirm('¿Seguro que deseas eliminar este producto?')
    if (!ok) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`)
      return
    }
    await fetchProducts()
  }

  return (
    <section style={{ padding: '28px 0 50px' }}>
      <div style={styles.container}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: isMobile ? '1fr' : '.85fr 1.15fr' }}>
          <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ ...styles.card, padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <Settings />
                <div>
                  <h2 style={{ margin: 0, fontSize: 32 }}>Panel admin</h2>
                  <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                    Administra catálogo, marcas, fit, precios, tallas y stock.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>Productos</p>
                  <p style={{ margin: '8px 0 0', fontWeight: 800, fontSize: 26 }}>{stats.total}</p>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>Activos</p>
                  <p style={{ margin: '8px 0 0', fontWeight: 800, fontSize: 26 }}>{stats.active}</p>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>Stock</p>
                  <p style={{ margin: '8px 0 0', fontWeight: 800, fontSize: 26 }}>{stats.stock}</p>
                </div>
              </div>
            </div>

            <div style={{ ...styles.card, padding: 24 }}>
              <h3 style={{ marginTop: 0, fontSize: 24 }}>Agregar producto</h3>
              <ProductForm
                draft={newProductDraft}
                setDraft={setNewProductDraft}
                onSave={addProduct}
                onCancel={() => setNewProductDraft(buildEmptyProduct())}
                loading={loading}
                saveLabel="Guardar producto"
                products={products}
              />
            </div>
          </div>

          <div style={{ ...styles.card, padding: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                marginBottom: 18,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 26 }}>Productos registrados</h3>
              </div>

              <div style={{ position: 'relative', width: isMobile ? '100%' : 280 }}>
                <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
                <input
                  style={{ ...styles.input, paddingLeft: 36 }}
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Buscar en admin"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {filteredProducts.map((product) => (
                <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: 22, padding: 16 }}>
                  {editingId === product.id && editingDraft ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ margin: 0, fontSize: 22 }}>Editando producto</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null)
                            setEditingDraft(null)
                          }}
                          style={styles.buttonSecondary}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <ProductForm
                        draft={editingDraft}
                        setDraft={setEditingDraft}
                        onSave={saveEdit}
                        onCancel={() => {
                          setEditingId(null)
                          setEditingDraft(null)
                        }}
                        loading={loading}
                        saveLabel="Guardar cambios"
                        products={products}
                      />
                    </>
                  ) : (
                    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : '110px 1fr auto' }}>
                      <div style={{ borderRadius: 18, overflow: 'hidden', background: '#f3f4f6' }}>
                        {getCover(product) ? (
                          <img src={getCover(product)} alt={product.name} style={{ width: '100%', height: 110, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: 110, display: 'grid', placeItems: 'center' }}>
                            <ImageIcon size={32} color="#9ca3af" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: 22 }}>{product.name}</h4>
                          <Badge>{product.audience}</Badge>
                          <Badge bg="#fff" border="1px solid #d1d5db">{product.brand}</Badge>
                          {product.category === 'Jeans' && product.subcategory ? (
                            <Badge bg="#dbeafe" color="#1d4ed8">{product.subcategory}</Badge>
                          ) : null}
                        </div>

                        <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{product.category}</p>

                        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 12 }}>
                          <div style={{ background: '#f3f4f6', borderRadius: 14, padding: 10 }}>
                            <small style={{ color: '#6b7280' }}>Normal</small>
                            <div style={{ fontWeight: 800 }}>{mxn(product.price)}</div>
                          </div>
                          <div style={{ background: '#f3f4f6', borderRadius: 14, padding: 10 }}>
                            <small style={{ color: '#6b7280' }}>3+</small>
                            <div style={{ fontWeight: 800 }}>{mxn(product.price_tier3)}</div>
                          </div>
                          <div style={{ background: '#f3f4f6', borderRadius: 14, padding: 10 }}>
                            <small style={{ color: '#6b7280' }}>10+</small>
                            <div style={{ fontWeight: 800 }}>{mxn(product.price_tier10)}</div>
                          </div>
                          <div style={{ background: '#f3f4f6', borderRadius: 14, padding: 10 }}>
                            <small style={{ color: '#6b7280' }}>Especial</small>
                            <div style={{ fontWeight: 800 }}>{mxn(product.special_price)}</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 8 }}>
                        <button type="button" style={styles.buttonSecondary} onClick={() => startEdit(product)}>
                          <Pencil size={16} />
                          Editar
                        </button>

                        <button
                          type="button"
                          style={styles.buttonSecondary}
                          onClick={() => toggleActive(product.id, !product.active)}
                        >
                          {product.active ? 'Ocultar' : 'Activar'}
                        </button>

                        <button type="button" style={styles.buttonSecondary} onClick={() => deleteProduct(product.id)}>
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredProducts.length === 0 ? (
                <div style={{ border: '1px dashed #d1d5db', borderRadius: 18, padding: 22, textAlign: 'center', color: '#6b7280' }}>
                  No hay productos con ese criterio.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AdminLogin({ loginForm, setLoginForm, loginError, showPassword, setShowPassword, handleLogin }) {
  const isMobile = useIsMobile()

  return (
    <section style={{ padding: '38px 0 60px' }}>
      <div style={styles.container}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          <div style={{ ...styles.card, padding: 28 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 36 : 48 }}>Panel administrador</h2>
            <p style={{ marginTop: 12, color: '#6b7280', lineHeight: 1.7 }}>
              Aquí administrarás productos, marcas, fit, tallas, stock y precios.
            </p>
          </div>

          <div style={{ ...styles.card, padding: 28 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <Lock />
              <div>
                <h3 style={{ margin: 0, fontSize: 30 }}>Iniciar sesión</h3>
                <p style={{ margin: '4px 0 0', color: '#6b7280' }}>Usa tu usuario y contraseña de admin.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
                <input
                  style={{ ...styles.input, paddingLeft: 36 }}
                  value={loginForm.username}
                  onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="Usuario"
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
                <input
                  style={{ ...styles.input, paddingLeft: 36, paddingRight: 40 }}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {loginError ? <p style={{ margin: 0, color: '#dc2626', fontWeight: 700 }}>{loginError}</p> : null}

              <button type="button" style={styles.buttonPrimary} onClick={handleLogin}>
                Entrar al panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const isMobile = useIsMobile()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const [route, setRoute] = useState(
    typeof window !== 'undefined' &&
      window.location.pathname.toLowerCase().includes('/admin')
      ? 'admin'
      : 'store'
  )

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [search, setSearch] = useState('')
  const [storeAudience, setStoreAudience] = useState('Todo')
  const [storeCategory, setStoreCategory] = useState('Todos')
  const [storeBrand, setStoreBrand] = useState('Todas')
  const [storeFit, setStoreFit] = useState('Todos')

  const [selectedConfig, setSelectedConfig] = useState({})
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState(emptyCustomer)

  const [gallery, setGallery] = useState({
    open: false,
    product: null,
    imageIndex: 0,
  })

  async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })

    if (error) {
      alert(`No se pudieron leer los productos: ${error.message}`)
      return
    }

    setProducts((data || []).map(normalizeProduct))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_SESSION_KEY)
    if (saved === 'true') setIsAdminAuthenticated(true)
  }, [])

  const customCategories = useMemo(() => {
    return uniqueValues(
      products
        .map((p) => p.category)
        .filter((cat) => !uniqueValues(Object.values(BASE_CATEGORY_MAP).flat()).includes(cat))
    )
  }, [products])

  const customFits = useMemo(() => {
    return uniqueValues(
      products
        .map((p) => p.subcategory)
        .filter((sub) => sub && !JEANS_FITS.includes(sub))
    )
  }, [products])

  const addToCart = (product) => {
    const selection = selectedConfig[product.id]
    if (!selection?.size || Number(selection.quantity || 0) <= 0) return

    const stock = Number(product.stock?.[selection.size] || 0)
    if (Number(selection.quantity || 0) > stock) {
      alert('La cantidad supera el stock disponible.')
      return
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (item) => item.product.id === product.id && item.size === selection.size
      )

      if (index >= 0) {
        const next = [...prev]
        const currentQty = Number(next[index].quantity || 0)
        const newQty = Math.min(stock, currentQty + Number(selection.quantity || 0))
        next[index] = { ...next[index], quantity: newQty }
        return next
      }

      return [...prev, { product, size: selection.size, quantity: Number(selection.quantity || 0) }]
    })

    setSelectedConfig((prev) => ({
      ...prev,
      [product.id]: {
        size: selection.size,
        quantity: 0,
      },
    }))
  }

  const sendOrder = async () => {
    if (cart.length === 0) {
      alert('Agrega productos al carrito.')
      return
    }

    if (!customer.name.trim() || !customer.phone.trim()) {
      alert('Pon al menos nombre y teléfono.')
      return
    }

    const totalPieces = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    const tier = currentTier(totalPieces)
    const subtotal = cart.reduce((sum, item) => {
      const unit = Number(item.product[tier.key] || item.product.price || 0)
      return sum + unit * Number(item.quantity || 0)
    }, 0)

    try {
      setLoading(true)

      const orderPayload = {
        customer_name: customer.name || '',
        customer_phone: customer.phone || '',
        customer_city: customer.city || '',
        delivery: customer.delivery || '',
        notes: customer.notes || '',
        items_json: cart.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
          unit_price: Number(item.product[tier.key] || item.product.price || 0),
          total: Number(item.product[tier.key] || item.product.price || 0) * Number(item.quantity || 0),
        })),
        total_pieces: totalPieces,
        subtotal,
        price_level: tier.label,
        status: 'nuevo',
        whatsapp_sent: false,
      }

      const { error: orderError } = await supabase.from('orders').insert([orderPayload])
      if (orderError) {
        alert(`No se pudo guardar el pedido: ${orderError.message}`)
        setLoading(false)
        return
      }

      for (const item of cart) {
        const product = products.find((p) => p.id === item.product.id)
        if (!product) continue

        const nextStock = {
          ...product.stock,
          [item.size]: Math.max(0, Number(product.stock?.[item.size] || 0) - Number(item.quantity || 0)),
        }

        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_json: nextStock,
            stock: totalStock(nextStock),
          })
          .eq('id', item.product.id)

        if (updateError) {
          alert(`No se pudo actualizar stock de ${product.name}: ${updateError.message}`)
          setLoading(false)
          return
        }
      }

      const itemsText = cart
        .map((item, idx) => {
          const unit = Number(item.product[tier.key] || item.product.price || 0)
          return `${idx + 1}. ${item.product.name} | Talla: ${item.size} | ${item.quantity} pz | ${mxn(unit)}`
        })
        .join('%0A')

      const msg =
        `Hola, quiero solicitar un pedido.%0A%0A` +
        `*Cliente:* ${customer.name}%0A` +
        `*Teléfono:* ${customer.phone}%0A` +
        `*Ciudad:* ${customer.city || '-'}%0A` +
        `*Entrega:* ${customer.delivery || '-'}%0A` +
        `*Notas:* ${customer.notes || '-'}%0A%0A` +
        `*Productos:*%0A${itemsText}%0A%0A` +
        `*Piezas totales:* ${totalPieces}%0A` +
        `*Nivel de precio:* ${tier.label}%0A` +
        `*Total a pagar:* ${mxn(subtotal)}`

      const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`

      await fetchProducts()
      setCart([])
      setCustomer(emptyCustomer)
      setLoading(false)
      window.open(link, '_blank')
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error al enviar pedido')
      setLoading(false)
    }
  }

  const handleLogin = () => {
    if (loginForm.username === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true)
      localStorage.setItem(ADMIN_SESSION_KEY, 'true')
      setLoginError('')
      setRoute('admin')
      if (typeof window !== 'undefined') window.history.replaceState({}, '', '/admin')
      return
    }
    setLoginError('Usuario o contraseña incorrectos.')
  }

  const handleLogout = () => {
    setIsAdminAuthenticated(false)
    localStorage.removeItem(ADMIN_SESSION_KEY)
    setRoute('store')
    if (typeof window !== 'undefined') window.history.replaceState({}, '', '/')
  }

  return (
    <div style={styles.app}>
      {route === 'store' ? (
        <StoreView
          isMobile={isMobile}
          products={products}
          search={search}
          setSearch={setSearch}
          storeAudience={storeAudience}
          setStoreAudience={setStoreAudience}
          storeCategory={storeCategory}
          setStoreCategory={setStoreCategory}
          storeBrand={storeBrand}
          setStoreBrand={setStoreBrand}
          storeFit={storeFit}
          setStoreFit={setStoreFit}
          customCategories={customCategories}
          customFits={customFits}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          addToCart={addToCart}
          cart={cart}
          setCart={setCart}
          customer={customer}
          setCustomer={setCustomer}
          sendOrder={sendOrder}
          gallery={gallery}
          setGallery={setGallery}
        />
      ) : isAdminAuthenticated ? (
        <>
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              background: '#111315',
              color: '#fff',
              borderBottom: '1px solid rgba(255,255,255,.08)',
            }}
          >
            <div
              style={{
                ...styles.container,
                minHeight: 76,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={STORE_LOGO} alt={STORE_NAME} style={{ width: 110, objectFit: 'contain' }} />
                <strong>Admin</strong>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  style={styles.buttonSecondary}
                  onClick={() => {
                    setRoute('store')
                    if (typeof window !== 'undefined') window.history.replaceState({}, '', '/')
                  }}
                >
                  Ver tienda
                </button>

                <button type="button" style={styles.buttonSecondary} onClick={handleLogout}>
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </header>

          <AdminView
            products={products}
            fetchProducts={fetchProducts}
            loading={loading}
            setLoading={setLoading}
          />
        </>
      ) : (
        <AdminLogin
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          loginError={loginError}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleLogin={handleLogin}
        />
      )}
    </div>
  )
}