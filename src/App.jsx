import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Filter,
  LogOut,
  Lock,
  User,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  Save,
  Image as ImageIcon,
  Tag,
  Boxes,
  Settings,
} from 'lucide-react'
import { supabase } from './supabase'

const STORE_NAME = 'Denim Click'
const STORE_LOGO = '/logo-denim-click.png'
const ADMIN_USERNAME = 'Denim'
const ADMIN_PASSWORD = 'Denimzoa2026'
const ADMIN_SESSION_KEY = 'apartados_admin_session_v1'

const AUDIENCES = ['Hombre', 'Dama', 'Niño', 'Accesorios', 'Oferta']

const BASE_CATEGORY_MAP = {
  Hombre: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Polo', 'Camisas', 'Suéter'],
  Dama: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Suéter'],
  Niño: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Suéter'],
  Accesorios: ['Accesorios'],
  Oferta: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Polo', 'Camisas', 'Suéter', 'Accesorios'],
}

const JEANS_SUBCATEGORIES = ['Straight', 'Slim', 'Skinny', 'Regular', 'Relaxed', 'Baggy']

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
    stock_total: Number(row.stock || 0),
    price: Number(row.price_base ?? row.price ?? DEFAULT_PRICE_BY_CATEGORY[row.category] ?? 0),
    price_base: Number(row.price_base ?? row.price ?? 0),
    price_tier3: Number(row.price_tier3 ?? 0),
    price_tier10: Number(row.price_tier10 ?? 0),
    special_price: Number(row.special_price ?? 0),
    active: row.active !== false,
    is_new: row.is_new !== false,
    is_offer: row.is_offer === true,
    sales_count: Number(row.sales_count || 0),
    category_order: Number(row.category_order || 0),
  }
}

function productToDb(product) {
  const totalStock = Object.values(product.stock || {}).reduce((sum, n) => sum + Number(n || 0), 0)

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
    stock: totalStock,
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
    price: DEFAULT_PRICE_BY_CATEGORY['Jeans'],
    price_tier3: DEFAULT_PRICE_BY_CATEGORY['Jeans'],
    price_tier10: DEFAULT_PRICE_BY_CATEGORY['Jeans'],
    special_price: DEFAULT_SPECIAL_PRICE_BY_CATEGORY['Jeans'],
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

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean))]
}

function getAudienceCategories(audience, customCategories = []) {
  const base = BASE_CATEGORY_MAP[audience] || []
  return uniqueValues([...base, ...customCategories])
}

function getAllVisibleCategories(customCategories = []) {
  return uniqueValues([...Object.values(BASE_CATEGORY_MAP).flat(), ...customCategories])
}

function getCategorySubcategories(category, customSubs = []) {
  if (category === 'Jeans') {
    return uniqueValues([...JEANS_SUBCATEGORIES, ...customSubs])
  }
  return uniqueValues([...customSubs])
}

function getCover(product) {
  return Array.isArray(product.images) && product.images.length ? product.images[0] : ''
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

function DesktopMegaMenu({
  activeAudience,
  setActiveAudience,
  products,
  setStoreAudience,
  setStoreCategory,
  setStoreSubcategory,
  setStoreBrand,
  closeMenu,
  customCategories,
  customSubcategories,
}) {
  const categories = getAudienceCategories(activeAudience, customCategories)
  const categoryBrands = uniqueValues(
    products
      .filter((p) => p.audience === activeAudience || activeAudience === 'Oferta')
      .map((p) => p.brand)
  )

  const brands = uniqueValues([...BRANDS, ...categoryBrands])

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
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
                  onClick={() => {
                    setStoreAudience(activeAudience)
                    setStoreCategory(cat)
                    setStoreSubcategory('Todas')
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
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ marginTop: 0, fontSize: 18 }}>Subcategorías</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {getCategorySubcategories('Jeans', customSubcategories).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setStoreAudience(activeAudience)
                    setStoreCategory('Jeans')
                    setStoreSubcategory(sub)
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
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ marginTop: 0, fontSize: 18 }}>Marcas</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    setStoreAudience(activeAudience)
                    setStoreCategory('Todas')
                    setStoreSubcategory('Todas')
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
                  setStoreCategory('Todas')
                  setStoreSubcategory('Todas')
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
                Lo más reciente
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
  setStoreSubcategory,
  setStoreBrand,
  customCategories,
  customSubcategories,
}) {
  const [step, setStep] = useState('audiences')
  const [selectedAudience, setSelectedAudience] = useState('Hombre')
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  useEffect(() => {
    if (!open) {
      setStep('audiences')
      setSelectedAudience('Hombre')
      setSelectedCategory('Todas')
    }
  }, [open])

  if (!open) return null

  const audienceCategories = getAudienceCategories(selectedAudience, customCategories)
  const categoryBrands = uniqueValues(
    products
      .filter((p) => p.audience === selectedAudience || selectedAudience === 'Oferta')
      .map((p) => p.brand)
  )
  const brands = uniqueValues([...BRANDS, ...categoryBrands])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,.45)',
      }}
    >
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
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={30} />
          </button>
        </div>

        {step !== 'audiences' && (
          <button
            type="button"
            onClick={() => {
              if (step === 'categories') setStep('audiences')
              if (step === 'subcategories') setStep('categories')
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
            AUDIENCES.map((aud) => (
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
                  setStoreCategory('Todas')
                  setStoreSubcategory('Todas')
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

              {audienceCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    if (cat === 'Jeans') {
                      setSelectedCategory(cat)
                      setStep('subcategories')
                    } else {
                      setStoreAudience(selectedAudience)
                      setStoreCategory(cat)
                      setStoreSubcategory('Todas')
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

          {step === 'subcategories' && (
            <>
              <h3 style={{ margin: 0, fontSize: 34 }}>{selectedCategory}</h3>
              {getCategorySubcategories('Jeans', customSubcategories).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setStoreAudience(selectedAudience)
                    setStoreCategory('Jeans')
                    setStoreSubcategory(sub)
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
                  {sub}
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
                    setStoreCategory('Todas')
                    setStoreSubcategory('Todas')
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

        <div style={{ marginTop: 42, color: '#d1d5db', fontSize: 18, lineHeight: 1.5 }}>
          <strong style={{ color: '#fff' }}>Mejora tu precio</strong>
          <p style={{ marginTop: 10 }}>
            Más adelante conectaremos aquí el acceso para clientes con precio especial.
          </p>
        </div>
      </div>
    </div>
  )
}

function ProductForm({ draft, setDraft, onSave, onCancel, loading, saveLabel, products }) {
  const [newSize, setNewSize] = useState('')

  const customCategories = uniqueValues(
    products
      .map((p) => p.category)
      .filter((c) => !getAllVisibleCategories([]).includes(c))
  )

  const customSubcategories = uniqueValues(
    products
      .map((p) => p.subcategory)
      .filter((s) => s && !JEANS_SUBCATEGORIES.includes(s))
  )

  const customBrands = uniqueValues(
    products.map((p) => p.brand).filter((b) => b && !BRANDS.includes(b))
  )

  const categories = getAudienceCategories(draft.audience, customCategories)
  const brands = uniqueValues([...BRANDS, ...customBrands])
  const subcategories =
    draft.category === 'Jeans'
      ? getCategorySubcategories('Jeans', customSubcategories)
      : draft.customSubcategory
        ? [draft.customSubcategory]
        : []

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
    const sizes = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const nextSizes = sizes.length ? sizes : ['CH', 'M', 'G']
    const nextStock = Object.fromEntries(nextSizes.map((s) => [s, Number(draft.stock?.[s] || 0)]))

    setDraft((prev) => ({
      ...prev,
      sizes: nextSizes,
      stock: nextStock,
    }))
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
    setDraft((prev) => ({
      ...prev,
      sizes: nextSizes,
      stock: nextStock,
    }))
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
            const nextAudience = e.target.value
            const nextCategory = getAudienceCategories(nextAudience, customCategories)[0] || 'Jeans'
            const nextPrice = DEFAULT_PRICE_BY_CATEGORY[nextCategory] || 0
            const nextSpecial = DEFAULT_SPECIAL_PRICE_BY_CATEGORY[nextCategory] || 0

            setDraft((p) => ({
              ...p,
              audience: nextAudience,
              category: nextCategory,
              subcategory: nextCategory === 'Jeans' ? 'Straight' : '',
              price: nextPrice,
              price_tier3: nextPrice,
              price_tier10: nextPrice,
              special_price: nextSpecial,
            }))
          }}
        >
          {AUDIENCES.map((aud) => (
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
            const nextCategory = e.target.value
            const nextPrice = DEFAULT_PRICE_BY_CATEGORY[nextCategory] || 0
            const nextSpecial = DEFAULT_SPECIAL_PRICE_BY_CATEGORY[nextCategory] || 0

            setDraft((p) => ({
              ...p,
              category: nextCategory,
              subcategory: nextCategory === 'Jeans' ? 'Straight' : '',
              price: p.price || nextPrice,
              price_tier3: p.price_tier3 || nextPrice,
              price_tier10: p.price_tier10 || nextPrice,
              special_price: p.special_price || nextSpecial,
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
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="O crea una subcategoría personalizada"
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
  storeSubcategory,
  setStoreSubcategory,
  storeBrand,
  setStoreBrand,
  priceSort,
  setPriceSort,
  customCategories,
  customSubcategories,
}) {
  const [openMegaMenu, setOpenMegaMenu] = useState(false)
  const [megaAudience, setMegaAudience] = useState('Hombre')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const visibleBrands = uniqueValues([...BRANDS, ...products.map((p) => p.brand)])
  const visibleCategories = getAudienceCategories(storeAudience, customCategories)
  const visibleSubcategories =
    storeCategory === 'Jeans'
      ? getCategorySubcategories('Jeans', customSubcategories)
      : []

  const filteredProducts = useMemo(() => {
    let list = [...products].filter((p) => p.active)

    if (storeAudience !== 'Todas') {
      list = list.filter((p) => p.audience === storeAudience)
    }

    if (storeCategory !== 'Todas') {
      list = list.filter((p) => p.category === storeCategory)
    }

    if (storeSubcategory !== 'Todas') {
      list = list.filter((p) => p.subcategory === storeSubcategory)
    }

    if (storeBrand !== 'Todas') {
      list = list.filter((p) => p.brand === storeBrand)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        `${p.name} ${p.category} ${p.subcategory} ${p.brand} ${p.audience}`
          .toLowerCase()
          .includes(q)
      )
    }

    if (priceSort === 'low-high') {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    } else if (priceSort === 'high-low') {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    } else {
      list.sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime()
        const bDate = new Date(b.created_at || 0).getTime()
        return bDate - aDate
      })
    }

    return list
  }, [products, storeAudience, storeCategory, storeSubcategory, storeBrand, priceSort, search])

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
                {AUDIENCES.map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onMouseEnter={() => {
                      setMegaAudience(aud)
                      setOpenMegaMenu(true)
                    }}
                    onClick={() => {
                      setStoreAudience(aud)
                      setStoreCategory('Todas')
                      setStoreSubcategory('Todas')
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
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <Menu size={32} />
                </button>
              ) : null}
            </div>
          </div>

          {!isMobile && openMegaMenu ? (
            <DesktopMegaMenu
              activeAudience={megaAudience}
              setActiveAudience={setMegaAudience}
              products={products}
              setStoreAudience={setStoreAudience}
              setStoreCategory={setStoreCategory}
              setStoreSubcategory={setStoreSubcategory}
              setStoreBrand={setStoreBrand}
              closeMenu={() => setOpenMegaMenu(false)}
              customCategories={customCategories}
              customSubcategories={customSubcategories}
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
        setStoreSubcategory={setStoreSubcategory}
        setStoreBrand={setStoreBrand}
        customCategories={customCategories}
        customSubcategories={customSubcategories}
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
                  fontSize: isMobile ? 54 : 82,
                  lineHeight: 0.96,
                  fontWeight: 800,
                }}
              >
                Aparta mercancía y desbloquea mejor precio por volumen.
              </h1>
            </div>

            <div
              style={{
                ...styles.card,
                padding: 22,
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Nivel actual</p>
                  <h2 style={{ margin: '5px 0 0', fontSize: isMobile ? 28 : 34 }}>Precio normal</h2>
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
                  <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: 24 }}>0</p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: '1fr 1fr',
                }}
              >
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Subtotal estimado</p>
                  <p style={{ margin: '6px 0 0', fontWeight: 800, fontSize: 22 }}>$0</p>
                </div>

                <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Venta</p>
                  <p style={{ margin: '6px 0 0', fontWeight: 700 }}>Piezas mixtas</p>
                  <p style={{ margin: '8px 0 0', color: '#d97706', fontSize: 14 }}>
                    Te faltan 3 pieza(s) para desbloquear el precio de 3+ piezas.
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

      <section style={{ paddingBottom: 26 }}>
        <div style={styles.container}>
          <div
            style={{
              display: 'grid',
              gap: 14,
              gridTemplateColumns: isMobile ? '1fr' : '1.2fr .8fr .8fr .8fr .8fr .8fr',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 26 }}>Catálogo</h3>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Filtra por segmento, categoría, subcategoría, marca o precio.
              </p>
            </div>

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
            ) : null}

            <select
              style={styles.input}
              value={storeAudience}
              onChange={(e) => {
                setStoreAudience(e.target.value)
                setStoreCategory('Todas')
                setStoreSubcategory('Todas')
              }}
            >
              <option value="Todas">Todos</option>
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
                setStoreSubcategory('Todas')
              }}
            >
              <option value="Todas">Todas las categorías</option>
              {visibleCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              value={storeSubcategory}
              onChange={(e) => setStoreSubcategory(e.target.value)}
              disabled={storeCategory !== 'Jeans'}
            >
              <option value="Todas">Todas las subcategorías</option>
              {visibleSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
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

            <select
              style={styles.input}
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
            >
              <option value="recent">Lo más reciente</option>
              <option value="low-high">Precio menor a mayor</option>
              <option value="high-low">Precio mayor a menor</option>
            </select>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 50 }}>
        <div style={styles.container}>
          {filteredProducts.length === 0 ? (
            <div
              style={{
                ...styles.card,
                padding: 30,
                textAlign: 'center',
                color: '#6b7280',
              }}
            >
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
                <div key={product.id} style={{ ...styles.card, overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '4 / 4.4', background: '#f3f4f6' }}>
                    {getCover(product) ? (
                      <img
                        src={getCover(product)}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                        <ImageIcon size={44} color="#9ca3af" />
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 18 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: 12,
                          borderRadius: 999,
                          padding: '5px 10px',
                          background: '#f3f4f6',
                          fontWeight: 700,
                        }}
                      >
                        {product.audience}
                      </span>

                      <span
                        style={{
                          fontSize: 12,
                          borderRadius: 999,
                          padding: '5px 10px',
                          background: '#fff',
                          border: '1px solid #d1d5db',
                          fontWeight: 700,
                        }}
                      >
                        {product.brand}
                      </span>

                      {product.category === 'Jeans' && product.subcategory ? (
                        <span
                          style={{
                            fontSize: 12,
                            borderRadius: 999,
                            padding: '5px 10px',
                            background: '#e0f2fe',
                            color: '#0c4a6e',
                            fontWeight: 700,
                          }}
                        >
                          {product.subcategory}
                        </span>
                      ) : null}
                    </div>

                    <h4 style={{ margin: 0, fontSize: 24 }}>{product.name}</h4>
                    <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
                      {product.category}
                    </p>
                    <p style={{ margin: '10px 0 0', color: '#6b7280', minHeight: 48 }}>
                      {product.description || 'Sin descripción'}
                    </p>

                    <div style={{ marginTop: 14 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 24 }}>{mxn(product.price)}</p>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(product.sizes || []).map((size) => (
                        <span
                          key={size}
                          style={{
                            border: '1px solid #d1d5db',
                            borderRadius: 12,
                            padding: '6px 10px',
                            fontSize: 13,
                            color: Number(product.stock?.[size] || 0) > 0 ? '#111827' : '#9ca3af',
                          }}
                        >
                          {size}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      style={{ ...styles.buttonPrimary, width: '100%', marginTop: 16 }}
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function AdminView({
  products,
  fetchProducts,
  loading,
  setLoading,
}) {
  const isMobile = useIsMobile()
  const [adminSearch, setAdminSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingDraft, setEditingDraft] = useState(null)
  const [newProductDraft, setNewProductDraft] = useState(buildEmptyProduct())

  const filteredProducts = useMemo(() => {
    if (!adminSearch.trim()) return products
    const q = adminSearch.toLowerCase()
    return products.filter((p) =>
      `${p.name} ${p.category} ${p.subcategory} ${p.brand} ${p.audience}`
        .toLowerCase()
        .includes(q)
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
    const finalSubcategory =
      finalCategory === 'Jeans'
        ? draft.customSubcategory?.trim() || draft.subcategory
        : ''
    const finalBrand = draft.customBrand?.trim() || draft.brand

    const fallbackPrice = DEFAULT_PRICE_BY_CATEGORY[finalCategory] || 0
    const fallbackSpecial = DEFAULT_SPECIAL_PRICE_BY_CATEGORY[finalCategory] || 0

    return {
      ...draft,
      category: finalCategory,
      subcategory: finalSubcategory,
      brand: finalBrand,
      price: Number(draft.price || fallbackPrice),
      price_tier3: Number(draft.price_tier3 || draft.price || fallbackPrice),
      price_tier10: Number(draft.price_tier10 || draft.price || fallbackPrice),
      special_price: Number(draft.special_price || fallbackSpecial),
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
    if (!editingDraft) return
    if (!editingDraft.name.trim()) {
      alert('Pon nombre al producto')
      return
    }

    setLoading(true)
    const clean = prepareDraftForSave(editingDraft)
    const payload = productToDb(clean)

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', editingId)

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
                  <h2 style={{ margin: 0, fontSize: 32 }}>Panel admin pro</h2>
                  <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                    Administra catálogo, segmentos, categorías, marcas y precios.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280' }}>
                    <Tag size={16} />
                    <span>Productos</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontWeight: 800, fontSize: 26 }}>{stats.total}</p>
                </div>

                <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280' }}>
                    <Boxes size={16} />
                    <span>Activos</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontWeight: 800, fontSize: 26 }}>{stats.active}</p>
                </div>

                <div style={{ background: '#f3f4f6', borderRadius: 20, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280' }}>
                    <Boxes size={16} />
                    <span>Stock</span>
                  </div>
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
                <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                  Busca y edita productos según segmento, categoría o marca.
                </p>
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

                          <span
                            style={{
                              borderRadius: 999,
                              padding: '5px 10px',
                              background: '#f3f4f6',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {product.audience}
                          </span>

                          <span
                            style={{
                              borderRadius: 999,
                              padding: '5px 10px',
                              background: '#fff',
                              border: '1px solid #d1d5db',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {product.brand}
                          </span>

                          {product.category === 'Jeans' && product.subcategory ? (
                            <span
                              style={{
                                borderRadius: 999,
                                padding: '5px 10px',
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              {product.subcategory}
                            </span>
                          ) : null}
                        </div>

                        <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
                          {product.category}
                        </p>

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

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                          {(product.sizes || []).map((size) => (
                            <span
                              key={size}
                              style={{
                                border: '1px solid #d1d5db',
                                borderRadius: 12,
                                padding: '6px 10px',
                                fontSize: 13,
                              }}
                            >
                              {size}: {product.stock?.[size] || 0}
                            </span>
                          ))}
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

                        <button
                          type="button"
                          style={styles.buttonSecondary}
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredProducts.length === 0 ? (
                <div
                  style={{
                    border: '1px dashed #d1d5db',
                    borderRadius: 18,
                    padding: 22,
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
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
              Aquí administrarás productos, segmentos, categorías, subcategorías, marcas y precios.
            </p>
          </div>

          <div style={{ ...styles.card, padding: 28 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <Lock />
              <div>
                <h3 style={{ margin: 0, fontSize: 30 }}>Iniciar sesión</h3>
                <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                  Usa tu usuario y contraseña de admin.
                </p>
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

              {loginError ? (
                <p style={{ margin: 0, color: '#dc2626', fontWeight: 700 }}>{loginError}</p>
              ) : null}

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
  const [storeAudience, setStoreAudience] = useState('Hombre')
  const [storeCategory, setStoreCategory] = useState('Todas')
  const [storeSubcategory, setStoreSubcategory] = useState('Todas')
  const [storeBrand, setStoreBrand] = useState('Todas')
  const [priceSort, setPriceSort] = useState('recent')

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
        .filter((cat) => !getAllVisibleCategories([]).includes(cat))
    )
  }, [products])

  const customSubcategories = useMemo(() => {
    return uniqueValues(
      products
        .map((p) => p.subcategory)
        .filter((sub) => sub && !JEANS_SUBCATEGORIES.includes(sub))
    )
  }, [products])

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
    <div style={{ minHeight: '100vh', background: '#f5f5f5', color: '#111827' }}>
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
          storeSubcategory={storeSubcategory}
          setStoreSubcategory={setStoreSubcategory}
          storeBrand={storeBrand}
          setStoreBrand={setStoreBrand}
          priceSort={priceSort}
          setPriceSort={setPriceSort}
          customCategories={customCategories}
          customSubcategories={customSubcategories}
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