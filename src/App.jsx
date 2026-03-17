import React, { useEffect, useMemo, useState } from 'react'
import {
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  Search,
  Trash2,
  Package2,
  Settings,
  Save,
  Pencil,
  X,
  Image as ImageIcon,
  Boxes,
  Tag,
  ListOrdered,
  Lock,
  LogOut,
  User,
  Eye,
  EyeOff,
} from 'lucide-react'
import { supabase } from './supabase'

const WHATSAPP_NUMBER = '525572665573'
const STORE_NAME = 'Denim Click'
const STORE_LOGO = '/logo-denim-click.png'
const ADMIN_USERNAME = 'Denim'
const ADMIN_PASSWORD = 'Denimzoa2026'
const ADMIN_SESSION_KEY = 'apartados_admin_session_v1'
const NEW_DAYS = 8

const emptyCustomer = {
  name: '',
  phone: '',
  city: '',
  delivery: 'Envíos',
  shippingType: 'Domicilio',
  shippingAddress: '',
  recipientName: '',
  recipientPhone: '',
  postalCode: '',
  ocurreAddress: '',
  notes: '',
}

const mxn = (n) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(Number(n || 0))

const tierFromPieces = (pieces) =>
  pieces >= 10
    ? { key: 'tier10', label: 'Precio 10+ piezas' }
    : pieces >= 3
      ? { key: 'tier3', label: 'Precio 3+ piezas' }
      : { key: 'base', label: 'Precio normal' }

const progressMessage = (pieces) => {
  if (pieces >= 10) return 'Ya tienes el mejor precio disponible.'
  if (pieces >= 3) {
    return `Te faltan ${10 - pieces} pieza(s) para desbloquear el precio de 10+ piezas.`
  }
  return `Te faltan ${3 - pieces} pieza(s) para desbloquear el precio de 3+ piezas.`
}

const totalStock = (product) =>
  Object.values(product.stock || {}).reduce((sum, n) => sum + Number(n || 0), 0)

const getProductImages = (product) =>
  Array.isArray(product.images) ? product.images.filter(Boolean) : []

const getCover = (product) => getProductImages(product)[0] || ''

const isProductNew = (product) =>
  product.isNew &&
  Date.now() - Number(product.createdAt || 0) < NEW_DAYS * 24 * 60 * 60 * 1000

const buildEmptyProduct = () => ({
  name: '',
  category: 'Jeans',
  images: [],
  description: '',
  prices: { base: 0, tier3: 0, tier10: 0 },
  sizes: ['CH', 'M', 'G'],
  stock: { CH: 0, M: 0, G: 0 },
  active: true,
  isNew: true,
  isOffer: false,
  salesCount: 0,
  createdAt: Date.now(),
})

function normalizeProduct(p) {
  const images = Array.isArray(p.images) ? p.images.filter(Boolean) : []

  const sizes =
    Array.isArray(p.sizes) && p.sizes.length
      ? p.sizes.filter(Boolean)
      : typeof p.sizes === 'string' && p.sizes.trim()
        ? p.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : ['CH', 'M', 'G']

  const stock =
    p.stock && typeof p.stock === 'object' && !Array.isArray(p.stock)
      ? p.stock
      : Object.fromEntries(sizes.map((s) => [s, 0]))

  return {
    id: Number(p.id || Date.now()),
    name: p.name || '',
    category: p.category || 'General',
    images,
    description: p.description || '',
    prices: {
      base: Number(p.prices?.base || 0),
      tier3: Number(p.prices?.tier3 || 0),
      tier10: Number(p.prices?.tier10 || 0),
    },
    sizes,
    stock,
    active: p.active !== false,
    isNew: p.isNew !== false,
    isOffer: p.isOffer === true,
    salesCount: Number(p.salesCount || 0),
    createdAt: Number(p.createdAt || Date.now()),
  }
}

function mapDbRowToProduct(row) {
  let parsedImages = []
  if (Array.isArray(row.images_json)) {
    parsedImages = row.images_json
  } else if (typeof row.images_json === 'string') {
    try {
      parsedImages = JSON.parse(row.images_json || '[]')
    } catch {
      parsedImages = row.images ? [row.images] : []
    }
  } else if (row.images) {
    parsedImages = [row.images]
  }

  let parsedSizes = ['CH', 'M', 'G']
  if (Array.isArray(row.sizes)) {
    parsedSizes = row.sizes
  } else if (typeof row.sizes === 'string' && row.sizes.trim()) {
    parsedSizes = row.sizes.split(',').map((s) => s.trim()).filter(Boolean)
  }

  let parsedStock = {}
  if (row.stock_json && typeof row.stock_json === 'object' && !Array.isArray(row.stock_json)) {
    parsedStock = row.stock_json
  } else {
    parsedStock = Object.fromEntries(parsedSizes.map((s) => [s, 0]))
  }

  return normalizeProduct({
    id: row.id,
    name: row.name,
    category: row.category,
    images: parsedImages,
    description: row.description,
    prices: {
      base: row.price_base ?? row.price ?? 0,
      tier3: row.price_tier3 ?? 0,
      tier10: row.price_tier10 ?? 0,
    },
    sizes: parsedSizes,
    stock: parsedStock,
    active: row.active,
    isNew: row.is_new,
    isOffer: row.is_offer,
    salesCount: row.sales_count,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  })
}

function mapProductToDb(product) {
  const normalized = normalizeProduct(product)
  return {
    name: normalized.name,
    category: normalized.category,
    description: normalized.description,
    price: normalized.prices.base,
    price_base: normalized.prices.base,
    price_tier3: normalized.prices.tier3,
    price_tier10: normalized.prices.tier10,
    images: normalized.images[0] || '',
    images_json: normalized.images,
    sizes: normalized.sizes.join(','),
    stock: totalStock(normalized),
    stock_json: normalized.stock,
    active: normalized.active,
    is_new: normalized.isNew,
    is_offer: normalized.isOffer,
    sales_count: normalized.salesCount,
  }
}

function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return isMobile
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f5f5f5',
    color: '#111827',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 16px',
  },
  header: {
    background: 'transparent',
    borderBottom: 'none',
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '8px 16px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    position: 'relative',
  },
  logo: {
    width: 320,
    height: 'auto',
    objectFit: 'contain',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 28,
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
  },
  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 18,
    padding: '12px 14px',
    outline: 'none',
    background: '#fff',
  },
  textarea: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 18,
    padding: '12px 14px',
    outline: 'none',
    minHeight: 110,
    background: '#fff',
    fontFamily: 'inherit',
  },
  buttonPrimary: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: 18,
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
    borderRadius: 18,
    padding: '12px 18px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
}

function Badge({ children, bg = '#f3f4f6', color = '#111827', border }) {
  return (
    <span
      style={{
        ...styles.badge,
        background: bg,
        color,
        border: border || 'none',
      }}
    >
      {children}
    </span>
  )
}

function statusBadgeColors(status) {
  if (status === 'confirmado') return { bg: '#dcfce7', color: '#166534', border: '1px solid #86efac' }
  if (status === 'cancelado') return { bg: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }
  if (status === 'entregado') return { bg: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' }
  return { bg: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db' }
}

function ProductGallery({ images, currentIndex, setCurrentIndex, title, onOpen }) {
  return (
    <div>
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 4.2',
          overflow: 'hidden',
          background: '#f3f4f6',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
      >
        {images.length ? (
          <button
            type="button"
            onClick={onOpen}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              padding: 0,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <img
              src={images[currentIndex]}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </button>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
            <ImageIcon size={40} color="#9ca3af" />
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex(currentIndex <= 0 ? images.length - 1 : currentIndex - 1)
              }
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                borderRadius: 999,
                background: 'rgba(255,255,255,.92)',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex(currentIndex >= images.length - 1 ? 0 : currentIndex + 1)
              }
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                borderRadius: 999,
                background: 'rgba(255,255,255,.92)',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 12 }}>
          {images.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: idx === currentIndex ? '2px solid #111827' : '1px solid #e5e7eb',
                padding: 0,
                cursor: 'pointer',
                background: '#fff',
              }}
            >
              <img src={img} alt={`${title} ${idx + 1}`} style={{ width: '100%', height: 56, objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Lightbox({ open, data, onClose, onPrev, onNext, setIndex }) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.82)',
        zIndex: 50,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          right: 16,
          top: 16,
          border: 'none',
          borderRadius: 999,
          background: '#fff',
          padding: '8px 12px',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>

      <div style={{ width: '100%', maxWidth: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: 12, gap: 12 }}>
          <strong>{data.title}</strong>
          <span>{data.index + 1} / {data.images.length}</span>
        </div>

        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'rgba(255,255,255,.06)' }}>
          <img src={data.images[data.index]} alt={data.title} style={{ width: '100%', maxHeight: '78vh', objectFit: 'contain' }} />

          {data.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={onPrev}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,.92)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={onNext}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,.92)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                }}
              >
                ›
              </button>
            </>
          )}
        </div>

        {data.images.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 12 }}>
            {data.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIndex(idx)}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: idx === data.index ? '2px solid white' : '1px solid rgba(255,255,255,.2)',
                  padding: 0,
                  cursor: 'pointer',
                  background: 'transparent',
                }}
              >
                <img src={img} alt={`${data.title} ${idx + 1}`} style={{ width: '100%', height: 64, objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductForm({ draft, setDraft, onSave, onCancel, saveLabel, loading }) {
  const [newSize, setNewSize] = useState('')
  const sizesText = draft.sizes.join(', ')

  const updateSizes = (value) => {
    const sizes = value.split(',').map((x) => x.trim()).filter(Boolean)
    const nextSizes = sizes.length ? sizes : ['CH', 'M', 'G']
    const nextStock = Object.fromEntries(nextSizes.map((s) => [s, Number(draft.stock?.[s] || 0)]))
    setDraft((prev) => ({ ...prev, sizes: nextSizes, stock: nextStock }))
  }

  const addSize = () => {
    const size = newSize.trim()
    if (!size || draft.sizes.includes(size)) return setNewSize('')
    setDraft((prev) => ({
      ...prev,
      sizes: [...prev.sizes, size],
      stock: { ...prev.stock, [size]: 0 },
    }))
    setNewSize('')
  }

  const removeSize = (sizeToRemove) => {
    if (draft.sizes.length <= 1) return
    const nextSizes = draft.sizes.filter((s) => s !== sizeToRemove)
    const nextStock = Object.fromEntries(nextSizes.map((s) => [s, Number(draft.stock?.[s] || 0)]))
    setDraft((prev) => ({ ...prev, sizes: nextSizes, stock: nextStock }))
  }

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
          }),
      ),
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

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <input
          style={styles.input}
          placeholder="Nombre del producto"
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
        />
        <input
          style={styles.input}
          placeholder="Categoría"
          value={draft.category}
          onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
        />
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr .95fr' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              addFiles(e.dataTransfer.files)
            }}
            style={{
              minHeight: 160,
              border: '1px dashed #d1d5db',
              borderRadius: 18,
              background: '#f9fafb',
              display: 'grid',
              placeItems: 'center',
              padding: 20,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div>
              <ImageIcon size={38} color="#9ca3af" />
              <p style={{ margin: '10px 0 4px', fontWeight: 700 }}>
                Arrastra imágenes aquí o haz clic para subirlas
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                Puedes cargar varias fotos por producto
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>

          {(draft.images || []).length > 0 && (
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {draft.images.map((img, index) => (
                <div
                  key={`${index}-${img.slice(0, 10)}`}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 14,
                    border: '1px solid #e5e7eb',
                    background: '#f3f4f6',
                  }}
                >
                  <img src={img} alt={`Producto ${index + 1}`} style={{ width: '100%', height: 90, objectFit: 'cover' }} />
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
                      padding: '2px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <textarea
          style={{ ...styles.input, minHeight: 180, resize: 'vertical' }}
          placeholder="Descripción"
          value={draft.description}
          onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
        />
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <input
          style={styles.input}
          type="number"
          placeholder="Precio 1 a 2 piezas"
          value={draft.prices.base}
          onChange={(e) =>
            setDraft((p) => ({ ...p, prices: { ...p.prices, base: Number(e.target.value) } }))
          }
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Precio 3 a 9 piezas"
          value={draft.prices.tier3}
          onChange={(e) =>
            setDraft((p) => ({ ...p, prices: { ...p.prices, tier3: Number(e.target.value) } }))
          }
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Precio 10 o más piezas"
          value={draft.prices.tier10}
          onChange={(e) =>
            setDraft((p) => ({ ...p, prices: { ...p.prices, tier10: Number(e.target.value) } }))
          }
        />
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <label style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
          <input
            type="checkbox"
            checked={draft.isNew === true}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                isNew: e.target.checked,
                createdAt: e.target.checked ? Date.now() : p.createdAt,
              }))
            }
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>Producto nuevo</p>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>
              La etiqueta Nuevo se mostrará durante 8 días.
            </p>
          </div>
        </label>

        <label style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
          <input
            type="checkbox"
            checked={draft.isOffer === true}
            onChange={(e) => setDraft((p) => ({ ...p, isOffer: e.target.checked }))}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>Producto en oferta</p>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>
              Mostrará la etiqueta Oferta.
            </p>
          </div>
        </label>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
        <p style={{ marginTop: 0, fontWeight: 700 }}>Tallas</p>
        <input
          style={styles.input}
          placeholder="Tallas separadas por coma"
          value={sizesText}
          onChange={(e) => updateSizes(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {draft.sizes.map((size) => (
            <div
              key={size}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: 14,
              }}
            >
              <span>{size}</span>
              <button
                type="button"
                onClick={() => removeSize(size)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <input
            style={styles.input}
            placeholder="Nueva talla. Ejemplo: XG o 38"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
          />
          <button type="button" style={styles.buttonSecondary} onClick={addSize}>
            <Plus size={16} />
            Agregar talla
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {draft.sizes.map((size) => (
          <div key={size} style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 14 }}>
            <p style={{ marginTop: 0, fontSize: 14, fontWeight: 700 }}>Stock talla {size}</p>
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

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" style={styles.buttonPrimary} onClick={onSave} disabled={loading}>
          <Save size={16} />
          {loading ? 'Guardando...' : saveLabel}
        </button>
        <button type="button" style={styles.buttonSecondary} onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

function Storefront({
  products,
  search,
  setSearch,
  category,
  setCategory,
  selections,
  setSelections,
  addToCart,
  cart,
  totalPieces,
  tier,
  subtotal,
  updateCartQuantity,
  removeFromCart,
  customer,
  setCustomer,
  confirmOrderAndSendWhatsApp,
  loading,
}) {
  const isMobile = useIsMobile()
  const [imageIndexes, setImageIndexes] = useState({})
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0, title: '' })

  const categories = useMemo(
    () => ['Todas', ...new Set(products.filter((p) => p.active).map((p) => p.category))],
    [products],
  )

  const topSellingIds = useMemo(
    () =>
      products
        .filter((p) => p.active)
        .sort((a, b) => Number(b.salesCount || 0) - Number(a.salesCount || 0))
        .slice(0, 3)
        .map((p) => p.id),
    [products],
  )

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.active &&
          (category === 'Todas' || p.category === category) &&
          `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, category, search],
  )

  const moveLightbox = (direction) => {
    setLightbox((prev) => {
      if (!prev.images.length) return prev
      const nextIndex =
        direction === 'next'
          ? (prev.index + 1) % prev.images.length
          : (prev.index - 1 + prev.images.length) % prev.images.length
      return { ...prev, index: nextIndex }
    })
  }

  return (
    <>
      <section style={{ padding: '12px 0 20px' }}>
        <div style={styles.container}>
          <div
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: isMobile ? '1fr' : '1.2fr .8fr',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: isMobile ? 42 : 76,
                  lineHeight: 1.02,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Aparta mercancía y desbloquea mejor precio por volumen.
              </h2>
            </div>

            <div style={{ ...styles.card, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Nivel actual</p>
                  <h2 style={{ margin: '4px 0 0', fontSize: isMobile ? 22 : 28 }}>{tier.label}</h2>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 18, padding: '12px 16px', textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Piezas</p>
                  <p style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 800 }}>{totalPieces}</p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  marginTop: 20,
                }}
              >
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 22, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Subtotal estimado</p>
                  <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800 }}>{mxn(subtotal)}</p>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 22, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Venta</p>
                  <p style={{ margin: '6px 0 0', fontWeight: 700 }}>Piezas mixtas</p>
                  <p style={{ margin: '8px 0 0', color: '#d97706', fontSize: 14 }}>
                    {progressMessage(totalPieces)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '10px 0 40px' }}>
        <div style={styles.container}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: isMobile ? 'stretch' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              marginBottom: 24,
            }}
          >
            <div>
              <h2 style={styles.sectionTitle}>Catálogo</h2>
              <p style={{ color: '#6b7280' }}>
                Selecciona talla y cantidad, agrega al pedido y el precio baja según el total de piezas.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                minWidth: isMobile ? '100%' : 420,
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
                <input
                  style={{ ...styles.input, paddingLeft: 36 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto"
                />
              </div>

              <select style={styles.input} value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            }}
          >
            {filteredProducts.map((product) => {
              const availableSizes = product.sizes.filter(
                (size) => Number(product.stock?.[size] || 0) > 0
              )

              const fallbackSize = availableSizes[0] || product.sizes[0] || ''

              const selected = selections[product.id] || {
                size: fallbackSize,
                quantity: 0,
              }

              const stock = Number(product.stock?.[selected.size] || 0)
              const images = getProductImages(product)
              const currentIndex = Math.min(imageIndexes[product.id] || 0, Math.max(images.length - 1, 0))

              return (
                <div key={product.id} style={{ ...styles.card, overflow: 'hidden' }}>
                  <ProductGallery
                    images={images}
                    currentIndex={currentIndex}
                    setCurrentIndex={(idx) => setImageIndexes((prev) => ({ ...prev, [product.id]: idx }))}
                    title={product.name}
                    onOpen={() => setLightbox({ open: true, images, index: currentIndex, title: product.name })}
                  />

                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                      <div>
                        <Badge bg="#fff" color="#374151" border="1px solid #d1d5db">
                          {product.category}
                        </Badge>
                        <h3 style={{ margin: '12px 0 0', fontSize: 28 }}>{product.name}</h3>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {topSellingIds.includes(product.id) && Number(product.salesCount || 0) > 0 ? (
                            <Badge bg="#f59e0b" color="#fff">
                              Más vendido
                            </Badge>
                          ) : null}
                          {isProductNew(product) ? (
                            <Badge bg="#0284c7" color="#fff">
                              Nuevo
                            </Badge>
                          ) : null}
                          {product.isOffer ? (
                            <Badge bg="#059669" color="#fff">
                              Oferta
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {availableSizes.length === 0 ? (
                        <Badge bg="#dc2626" color="#fff">
                          Sin existencias
                        </Badge>
                      ) : null}
                    </div>

                    <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{product.description}</p>

                    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 16 }}>
                      <div style={{ borderRadius: 18, background: '#f3f4f6', padding: 14 }}>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>1-2</p>
                        <p style={{ margin: '6px 0 0', fontWeight: 800 }}>{mxn(product.prices.base)}</p>
                      </div>
                      <div style={{ borderRadius: 18, background: '#f3f4f6', padding: 14 }}>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>3-9</p>
                        <p style={{ margin: '6px 0 0', fontWeight: 800 }}>{mxn(product.prices.tier3)}</p>
                      </div>
                      <div style={{ borderRadius: 18, background: '#f3f4f6', padding: 14 }}>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>10+</p>
                        <p style={{ margin: '6px 0 0', fontWeight: 800 }}>{mxn(product.prices.tier10)}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                      <select
                        style={styles.input}
                        value={selected.size}
                        onChange={(e) =>
                          setSelections((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...(prev[product.id] || { quantity: 0 }),
                              size: e.target.value,
                            },
                          }))
                        }
                        disabled={availableSizes.length === 0}
                      >
                        {product.sizes.map((s) => {
                          const sizeStock = Number(product.stock?.[s] || 0)
                          const isDisabled = sizeStock <= 0

                          return (
                            <option key={s} value={s} disabled={isDisabled}>
                              {isDisabled ? `${s} - agotada` : `${s}`}
                            </option>
                          )
                        })}
                      </select>

                      <div
                        style={{
                          borderRadius: 18,
                          background: '#f3f4f6',
                          padding: '12px 14px',
                          fontSize: 14,
                          color: '#374151',
                        }}
                      >
                        {availableSizes.length === 0
                          ? 'Sin existencias'
                          : `Disponibles en esta talla: ${stock} pz`}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid #e5e7eb',
                          borderRadius: 18,
                          padding: '10px 14px',
                        }}
                      >
                        <span style={{ color: '#6b7280' }}>Cantidad</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelections((prev) => ({
                                ...prev,
                                [product.id]: {
                                  ...(prev[product.id] || { size: fallbackSize }),
                                  quantity: Math.max(0, (prev[product.id]?.quantity || 0) - 1),
                                },
                              }))
                            }
                            style={styles.buttonSecondary}
                          >
                            <Minus size={16} />
                          </button>
                          <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>
                            {selected.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelections((prev) => ({
                                ...prev,
                                [product.id]: {
                                  ...(prev[product.id] || { size: fallbackSize }),
                                  quantity: Math.min(stock, (prev[product.id]?.quantity || 0) + 1),
                                },
                              }))
                            }
                            style={styles.buttonSecondary}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      style={{ ...styles.buttonPrimary, width: '100%', marginTop: 18 }}
                      onClick={() => addToCart(product)}
                      disabled={selected.quantity <= 0 || stock <= 0 || availableSizes.length === 0}
                    >
                      {availableSizes.length === 0 ? 'Sin existencias' : 'Agregar al pedido'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 60 }}>
        <div style={styles.container}>
          <div
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: isMobile ? '1fr' : '1.15fr .85fr',
            }}
          >
            <div style={{ ...styles.card, padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <Package2 />
                <div>
                  <h3 style={{ margin: 0, fontSize: 28 }}>Resumen del pedido</h3>
                  <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                    Pedido mixto con precio automático por volumen.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {cart.length === 0 ? (
                  <div
                    style={{
                      border: '1px dashed #d1d5db',
                      borderRadius: 24,
                      padding: 32,
                      textAlign: 'center',
                      color: '#6b7280',
                    }}
                  >
                    Aún no has agregado productos al pedido.
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.size}-${index}`}
                      style={{ border: '1px solid #e5e7eb', borderRadius: 24, padding: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 20 }}>{item.product.name}</h4>
                          <p style={{ margin: '8px 0 0', color: '#6b7280' }}>Talla: {item.size}</p>
                          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                            Precio actual: {mxn(item.product.prices[tier.key])}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button type="button" onClick={() => updateCartQuantity(index, -1)} style={styles.buttonSecondary}>
                            <Minus size={16} />
                          </button>
                          <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>
                            {item.quantity}
                          </span>
                          <button type="button" onClick={() => updateCartQuantity(index, 1)} style={styles.buttonSecondary}>
                            <Plus size={16} />
                          </button>
                          <button type="button" onClick={() => removeFromCart(index)} style={styles.buttonSecondary}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 14,
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  marginTop: 20,
                }}
              >
                <div style={{ background: '#f3f4f6', borderRadius: 24, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Piezas totales</p>
                  <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800 }}>{totalPieces}</p>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 24, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Precio aplicado</p>
                  <p style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 800 }}>{tier.label}</p>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 24, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Subtotal estimado</p>
                  <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800 }}>{mxn(subtotal)}</p>
                </div>
              </div>
            </div>

            <div style={{ ...styles.card, padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <ShoppingBag />
                <div>
                  <h3 style={{ margin: 0, fontSize: 28 }}>Datos del cliente</h3>
                  <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                    La solicitud se enviará por WhatsApp.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
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
                  <option value="Envíos">Envíos</option>
                  <option value="Entrega en sucursal">Entrega en sucursal</option>
                  <option value="Entrega en punto medio">Entrega en punto medio</option>
                </select>

                {customer.delivery === 'Envíos' && (
                  <>
                    <select
                      style={styles.input}
                      value={customer.shippingType}
                      onChange={(e) => setCustomer((p) => ({ ...p, shippingType: e.target.value }))}
                    >
                      <option value="Domicilio">Domicilio</option>
                      <option value="Ocurre">Ocurre</option>
                    </select>

                    {customer.shippingType === 'Domicilio' ? (
                      <>
                        <input
                          style={styles.input}
                          placeholder="Nombre de quien recibe"
                          value={customer.recipientName}
                          onChange={(e) => setCustomer((p) => ({ ...p, recipientName: e.target.value }))}
                        />
                        <input
                          style={styles.input}
                          placeholder="Número de contacto"
                          value={customer.recipientPhone}
                          onChange={(e) => setCustomer((p) => ({ ...p, recipientPhone: e.target.value }))}
                        />
                        <input
                          style={styles.input}
                          placeholder="Dirección"
                          value={customer.shippingAddress}
                          onChange={(e) => setCustomer((p) => ({ ...p, shippingAddress: e.target.value }))}
                        />
                        <input
                          style={styles.input}
                          placeholder="Código postal"
                          value={customer.postalCode}
                          onChange={(e) => setCustomer((p) => ({ ...p, postalCode: e.target.value }))}
                        />
                      </>
                    ) : (
                      <input
                        style={styles.input}
                        placeholder="Dirección de ocurre"
                        value={customer.ocurreAddress}
                        onChange={(e) => setCustomer((p) => ({ ...p, ocurreAddress: e.target.value }))}
                      />
                    )}
                  </>
                )}

                <textarea
                  style={styles.textarea}
                  placeholder="Notas o comentarios"
                  value={customer.notes}
                  onChange={(e) => setCustomer((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <button
                type="button"
                style={{ ...styles.buttonPrimary, width: '100%', marginTop: 18, padding: 18 }}
                onClick={confirmOrderAndSendWhatsApp}
                disabled={loading || cart.length === 0}
              >
                <MessageCircle size={18} />
                {loading ? 'Procesando apartado...' : 'Solicitar apartado por WhatsApp'}
              </button>

              <p style={{ marginTop: 16, color: '#6b7280', lineHeight: 1.7 }}>
                Recuerda que cuentas con 8 días para abonar o liquidar tu apartado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Lightbox
        open={lightbox.open}
        data={lightbox}
        onClose={() => setLightbox({ open: false, images: [], index: 0, title: '' })}
        onPrev={() => moveLightbox('prev')}
        onNext={() => moveLightbox('next')}
        setIndex={(idx) => setLightbox((prev) => ({ ...prev, index: idx }))}
      />

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 40,
          background: '#22c55e',
          color: '#fff',
          width: 58,
          height: 58,
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 12px 24px rgba(0,0,0,.18)',
          textDecoration: 'none',
        }}
      >
        <MessageCircle size={28} />
      </a>
    </>
  )
}

function AdminPanel({
  adminSearch,
  setAdminSearch,
  stats,
  reloadProducts,
  newProductDraft,
  setNewProductDraft,
  addNewProduct,
  filteredAdminProducts,
  editingId,
  editingDraft,
  setEditingId,
  setEditingDraft,
  startEdit,
  saveEdit,
  toggleActive,
  deleteProduct,
  loading,
  orders,
  ordersLoading,
  ordersError,
  reloadOrders,
  updateOrderStatus,
}) {
  const isMobile = useIsMobile()

  return (
    <section style={{ padding: '32px 0' }}>
      <div style={styles.container}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: isMobile ? '1fr' : '.8fr 1.2fr' }}>
          <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ ...styles.card, padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <Settings />
                <div>
                  <h2 style={{ margin: 0, fontSize: 32 }}>Panel administrador</h2>
                  <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                    Aquí actualizas inventario, precios, tallas y fotos.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}>
                <div style={{ background: '#f3f4f6', borderRadius: 24, padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#6b7280' }}>
                    <ListOrdered size={16} />
                    <span>Productos</span>
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 800 }}>{stats.totalCount}</p>
                </div>

                <div style={{ background: '#f3f4f6', borderRadius: 24, padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#6b7280' }}>
                    <Tag size={16} />
                    <span>Activos</span>
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 800 }}>{stats.activeCount}</p>
                </div>

                <div style={{ background: '#f3f4f6', borderRadius: 24, padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#6b7280' }}>
                    <Boxes size={16} />
                    <span>Inventario</span>
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 800 }}>{stats.inventoryCount}</p>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <button type="button" style={styles.buttonSecondary} onClick={reloadProducts}>
                  Recargar desde Supabase
                </button>
              </div>
            </div>

            <div style={{ ...styles.card, padding: 24 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                <Plus />
                <h3 style={{ margin: 0, fontSize: 24 }}>Agregar producto nuevo</h3>
              </div>

              <ProductForm
                draft={newProductDraft}
                setDraft={setNewProductDraft}
                onSave={addNewProduct}
                onCancel={() => setNewProductDraft(buildEmptyProduct())}
                saveLabel="Agregar producto"
                loading={loading}
              />
            </div>

            <div style={{ ...styles.card, padding: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 24 }}>Pedidos</h3>
                  <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                    Solicitudes guardadas desde la tienda online.
                  </p>
                </div>

                <button type="button" style={styles.buttonSecondary} onClick={reloadOrders}>
                  Recargar pedidos
                </button>
              </div>

              {ordersLoading ? (
                <p>Cargando pedidos...</p>
              ) : ordersError ? (
                <p style={{ color: '#dc2626', fontWeight: 600 }}>{ordersError}</p>
              ) : orders.length === 0 ? (
                <div
                  style={{
                    border: '1px dashed #d1d5db',
                    borderRadius: 20,
                    padding: 20,
                    color: '#6b7280',
                  }}
                >
                  Aún no hay pedidos registrados.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {orders.map((order) => {
                    const items = Array.isArray(order.items_json) ? order.items_json : []
                    const badgeColors = statusBadgeColors(order.status)

                    return (
                      <div
                        key={order.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: 20,
                          padding: 16,
                          background: '#fff',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <h4 style={{ margin: 0, fontSize: 20 }}>Pedido #{order.id}</h4>
                            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                              {order.customer_name || '-'} · {order.customer_phone || '-'}
                            </p>
                            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                              {order.customer_city || '-'}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontWeight: 700 }}>{mxn(order.subtotal || 0)}</p>
                            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                              {order.total_pieces || 0} pieza(s)
                            </p>
                            <Badge
                              bg={badgeColors.bg}
                              color={badgeColors.color}
                              border={badgeColors.border}
                            >
                              {order.status || 'nuevo'}
                            </Badge>
                          </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
                            Nivel: {order.price_level || '-'}
                          </p>
                          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>
                            Entrega: {order.delivery || '-'}
                          </p>
                          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>
                            WhatsApp enviado: {order.whatsapp_sent ? 'Sí' : 'No'}
                          </p>
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            borderRadius: 16,
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          <p style={{ marginTop: 0, fontWeight: 700 }}>Productos:</p>
                          {items.length === 0 ? (
                            <p style={{ margin: 0, color: '#6b7280' }}>Sin productos</p>
                          ) : (
                            <div style={{ display: 'grid', gap: 6 }}>
                              {items.map((item, idx) => (
                                <div key={idx} style={{ fontSize: 14, color: '#374151' }}>
                                  {item.name} · Talla {item.size} · {item.quantity} pz · {mxn(item.total || 0)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                          <button
                            type="button"
                            style={styles.buttonSecondary}
                            onClick={() => updateOrderStatus(order.id, 'nuevo')}
                          >
                            Nuevo
                          </button>

                          <button
                            type="button"
                            style={styles.buttonSecondary}
                            onClick={() => updateOrderStatus(order.id, 'confirmado')}
                          >
                            Confirmar
                          </button>

                          <button
                            type="button"
                            style={styles.buttonSecondary}
                            onClick={() => updateOrderStatus(order.id, 'cancelado')}
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            style={styles.buttonSecondary}
                            onClick={() => updateOrderStatus(order.id, 'entregado')}
                          >
                            Entregado
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ ...styles.card, padding: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                alignItems: 'center',
                marginBottom: 20,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 24 }}>Administrar catálogo</h3>
                <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                  Edita precios, stock, tallas, imagen y estado del producto.
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
              {filteredAdminProducts.map((product) => (
                <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: 24, padding: 18 }}>
                  {editingId === product.id && editingDraft ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ margin: 0, fontSize: 20 }}>Editando producto</h4>
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
                        saveLabel="Guardar cambios"
                        loading={loading}
                      />
                    </>
                  ) : (
                    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : '110px 1fr auto', alignItems: 'start' }}>
                      <div style={{ overflow: 'hidden', borderRadius: 18, background: '#f3f4f6' }}>
                        {getCover(product) ? (
                          <img src={getCover(product)} alt={product.name} style={{ width: '100%', height: 110, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: 110, display: 'grid', placeItems: 'center' }}>
                            <ImageIcon size={30} color="#9ca3af" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: 22 }}>{product.name}</h4>
                          <Badge bg={product.active ? '#f3f4f6' : '#fff'} color="#111827" border="1px solid #d1d5db">
                            {product.active ? 'Activo' : 'Oculto'}
                          </Badge>
                          <Badge bg="#fff" color="#111827" border="1px solid #d1d5db">
                            {product.category}
                          </Badge>
                          {isProductNew(product) ? <Badge bg="#0284c7" color="#fff">Nuevo</Badge> : null}
                          {product.isOffer ? <Badge bg="#059669" color="#fff">Oferta</Badge> : null}
                        </div>

                        <p style={{ margin: '10px 0 0', color: '#6b7280', lineHeight: 1.6 }}>
                          {product.description || 'Sin descripción'}
                        </p>

                        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', marginTop: 12 }}>
                          <div style={{ borderRadius: 16, background: '#f3f4f6', padding: 12 }}>
                            1-2 pz: <strong>{mxn(product.prices.base)}</strong>
                          </div>
                          <div style={{ borderRadius: 16, background: '#f3f4f6', padding: 12 }}>
                            3-9 pz: <strong>{mxn(product.prices.tier3)}</strong>
                          </div>
                          <div style={{ borderRadius: 16, background: '#f3f4f6', padding: 12 }}>
                            10+ pz: <strong>{mxn(product.prices.tier10)}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                          {product.sizes.map((size) => (
                            <div key={size} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: '8px 12px', fontSize: 14 }}>
                              {size}: <strong>{product.stock[size] || 0}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 8 }}>
                        <button type="button" style={styles.buttonSecondary} onClick={() => startEdit(product)}>
                          <Pencil size={16} />
                          Editar
                        </button>
                        <button type="button" style={styles.buttonSecondary} onClick={() => toggleActive(product.id)}>
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
    <section style={{ padding: '36px 0' }}>
      <div style={styles.container}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          <div style={{ ...styles.card, padding: 28 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 34 : 42 }}>Panel administrador privado</h2>
            <p style={{ marginTop: 14, color: '#6b7280', lineHeight: 1.7 }}>
              Esta área es solo para administración de inventario, precios, tallas, productos y fotos.
            </p>

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', marginTop: 18 }}>
              <div style={{ borderRadius: 22, background: '#f3f4f6', padding: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#6b7280' }}>
                  <User size={16} />
                  <span>Usuario</span>
                </div>
                <p style={{ margin: '8px 0 0', fontWeight: 800 }}>{ADMIN_USERNAME}</p>
              </div>

              <div style={{ borderRadius: 22, background: '#f3f4f6', padding: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#6b7280' }}>
                  <Lock size={16} />
                  <span>Ruta</span>
                </div>
                <p style={{ margin: '8px 0 0', fontWeight: 800 }}>/admin</p>
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, padding: 28 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
              <Lock />
              <div>
                <h3 style={{ margin: 0, fontSize: 32 }}>Iniciar sesión</h3>
                <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                  Usa tu usuario y contraseña para entrar.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
                <input
                  style={{ ...styles.input, paddingLeft: 36 }}
                  placeholder="Usuario"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
                <input
                  style={{ ...styles.input, paddingLeft: 36, paddingRight: 40 }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
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

              {loginError ? <p style={{ margin: 0, color: '#dc2626', fontWeight: 600 }}>{loginError}</p> : null}

              <button type="button" style={styles.buttonPrimary} onClick={handleLogin}>
                <Lock size={16} />
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
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [selections, setSelections] = useState({})
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState(emptyCustomer)
  const [route, setRoute] = useState(
    typeof window !== 'undefined' &&
      window.location.pathname.toLowerCase().includes('/admin')
      ? 'admin'
      : 'store',
  )
  const [adminSearch, setAdminSearch] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingDraft, setEditingDraft] = useState(null)
  const [newProductDraft, setNewProductDraft] = useState(buildEmptyProduct())
  const [loading, setLoading] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        console.error('Error cargando productos:', error)
        alert('Error Supabase: ' + error.message)
        return
      }

      const mapped = (data || []).map(mapDbRowToProduct)
      setProducts(mapped)
    } catch (e) {
      console.error(e)
      alert('Error leyendo Supabase: ' + e.message)
    }
  }

  async function fetchOrders() {
    try {
      setOrdersLoading(true)
      setOrdersError('')

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando pedidos:', error)
        setOrdersError(error.message || 'No se pudieron cargar los pedidos')
        setOrdersLoading(false)
        return
      }

      setOrders(data || [])
      setOrdersLoading(false)
    } catch (e) {
      console.error(e)
      setOrdersError(e.message || 'Error inesperado cargando pedidos')
      setOrdersLoading(false)
    }
  }

  async function updateOrderStatus(orderId, nextStatus) {
    const order = orders.find((o) => o.id === orderId)
    if (!order) {
      alert('No se encontró el pedido.')
      return
    }

    if (nextStatus === 'cancelado') {
      const items = Array.isArray(order.items_json) ? order.items_json : []

      for (const item of items) {
        const { data: productRow, error: productReadError } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single()

        if (productReadError) {
          console.error('Error leyendo producto para devolución de stock:', productReadError)
          alert(`No se pudo leer el producto ${item.name} para devolver stock.`)
          return
        }

        const product = mapDbRowToProduct(productRow)

        const nextStock = {
          ...product.stock,
          [item.size]: Number(product.stock?.[item.size] || 0) + Number(item.quantity || 0),
        }

        const nextTotalStock = Object.values(nextStock).reduce(
          (sum, n) => sum + Number(n || 0),
          0
        )

        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock_json: nextStock,
            stock: nextTotalStock,
          })
          .eq('id', item.product_id)

        if (stockError) {
          console.error('Error devolviendo stock:', stockError)
          alert(`No se pudo devolver stock del producto ${item.name}.`)
          return
        }
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId)

    if (error) {
      console.error('Error actualizando estado del pedido:', error)
      alert(`No se pudo actualizar el estado del pedido: ${error.message}`)
      return
    }

    await fetchProducts()
    await fetchOrders()

    const rawPhone = String(order.customer_phone || '').replace(/\D/g, '')
    let customerPhone = rawPhone

    if (customerPhone.length === 10) {
      customerPhone = `52${customerPhone}`
    }

    const items = Array.isArray(order.items_json) ? order.items_json : []
    const itemsText = items.length
      ? items
          .map(
            (item, idx) =>
              `${idx + 1}. ${item.name} | Talla: ${item.size} | ${item.quantity} pz`
          )
          .join('%0A')
      : 'Sin productos'

    let message = ''

    if (nextStatus === 'confirmado') {
      message =
        `Hola ${order.customer_name || ''}, tu pedido #${order.id} ha sido *CONFIRMADO*.%0A%0A` +
        `*Productos:*%0A${itemsText}%0A%0A` +
        `*Total:* ${mxn(order.subtotal || 0)}%0A` +
        `Gracias por tu compra en ${STORE_NAME}.`
    } else if (nextStatus === 'cancelado') {
      message =
        `Hola ${order.customer_name || ''}, tu pedido #${order.id} ha sido *CANCELADO*.%0A%0A` +
        `Si deseas, podemos ayudarte a generar uno nuevo.%0A%0A` +
        `Gracias por contactar a ${STORE_NAME}.`
    } else if (nextStatus === 'entregado') {
      message =
        `Hola ${order.customer_name || ''}, tu pedido #${order.id} ha sido marcado como *ENTREGADO*.%0A%0A` +
        `Gracias por tu compra en ${STORE_NAME}.`
    }

    if (message && customerPhone) {
      const waUrl = `https://wa.me/${customerPhone}?text=${message}`
      window.open(waUrl, '_blank')
    } else {
      alert(`Pedido #${orderId} actualizado a: ${nextStatus}`)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  useEffect(() => {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY)
    if (savedSession === 'true') setIsAdminAuthenticated(true)
  }, [])

  useEffect(() => {
    setSelections((prev) => {
      const next = { ...prev }

      products.forEach((product) => {
        const availableSizes = product.sizes.filter(
          (size) => Number(product.stock?.[size] || 0) > 0
        )

        const fallbackSize = availableSizes[0] || product.sizes[0] || ''

        if (
          !next[product.id] ||
          !product.sizes.includes(next[product.id].size) ||
          Number(product.stock?.[next[product.id].size] || 0) <= 0
        ) {
          next[product.id] = {
            size: fallbackSize,
            quantity: 0,
          }
        }
      })

      Object.keys(next).forEach((key) => {
        if (!products.some((p) => String(p.id) === String(key))) {
          delete next[key]
        }
      })

      return next
    })
  }, [products])

  const filteredAdminProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          !adminSearch ||
          `${p.name} ${p.category}`.toLowerCase().includes(adminSearch.toLowerCase()),
      ),
    [products, adminSearch],
  )

  const totalPieces = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const tier = tierFromPieces(totalPieces)

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + Number(item.product.prices[tier.key] || 0) * item.quantity, 0),
    [cart, tier],
  )

  const stats = useMemo(
    () => ({
      totalCount: products.length,
      activeCount: products.filter((p) => p.active).length,
      inventoryCount: products.reduce((sum, p) => sum + totalStock(p), 0),
    }),
    [products],
  )

  const addToCart = async (product) => {
    const selected = selections[product.id]
    if (!selected?.quantity) return

    const available = Number(product.stock?.[selected.size] || 0)
    const already = cart
      .filter((item) => item.product.id === product.id && item.size === selected.size)
      .reduce((sum, item) => sum + item.quantity, 0)

    if (selected.quantity + already > available) return

    setCart((prev) => {
      const i = prev.findIndex((item) => item.product.id === product.id && item.size === selected.size)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], quantity: next[i].quantity + selected.quantity }
        return next
      }
      return [...prev, { product, size: selected.size, quantity: selected.quantity }]
    })

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, salesCount: Number(p.salesCount || 0) + Number(selected.quantity || 0) }
          : p,
      ),
    )

    setSelections((prev) => ({
      ...prev,
      [product.id]: { size: product.sizes[0], quantity: 0 },
    }))

    await supabase
      .from('products')
      .update({ sales_count: Number(product.salesCount || 0) + Number(selected.quantity || 0) })
      .eq('id', product.id)
  }

  const updateCartQuantity = (index, delta) => {
    setCart((prev) => {
      const next = [...prev]
      const item = next[index]
      if (!item) return prev

      const available = Number(item.product.stock?.[item.size] || 0)
      const nextQty = item.quantity + delta
      if (nextQty > available) return prev

      next[index].quantity = nextQty
      return next.filter((entry) => entry.quantity > 0)
    })
  }

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const confirmOrderAndSendWhatsApp = async () => {
    if (!cart.length) {
      alert('No hay productos en el pedido.')
      return
    }

    try {
      setLoading(true)

      for (const item of cart) {
        const product = products.find((p) => p.id === item.product.id)
        if (!product) continue

        const currentSizeStock = Number(product.stock?.[item.size] || 0)

        if (item.quantity > currentSizeStock) {
          alert(
            `No hay suficiente stock para ${product.name} talla ${item.size}. Disponible: ${currentSizeStock} pz`
          )
          setLoading(false)
          return
        }
      }

      const orderPayload = {
        customer_name: customer.name || '',
        customer_phone: customer.phone || '',
        customer_city: customer.city || '',
        delivery: customer.delivery || '',
        shipping_type: customer.shippingType || '',
        shipping_address: customer.shippingAddress || '',
        recipient_name: customer.recipientName || '',
        recipient_phone: customer.recipientPhone || '',
        postal_code: customer.postalCode || '',
        ocurre_address: customer.ocurreAddress || '',
        notes: customer.notes || '',
        items_json: cart.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
          unit_price: Number(item.product.prices[tier.key] || 0),
          total:
            Number(item.product.prices[tier.key] || 0) * Number(item.quantity || 0),
        })),
        total_pieces: totalPieces,
        subtotal: subtotal,
        price_level: tier.label,
        status: 'nuevo',
        whatsapp_sent: false,
      }

      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()

      if (orderError) {
        console.error('Error guardando pedido:', orderError)
        alert(`No se pudo guardar el pedido en Supabase: ${orderError.message}`)
        setLoading(false)
        return
      }

      for (const item of cart) {
        const product = products.find((p) => p.id === item.product.id)
        if (!product) continue

        const nextStock = {
          ...product.stock,
          [item.size]: Math.max(
            0,
            Number(product.stock?.[item.size] || 0) - Number(item.quantity || 0)
          ),
        }

        const nextTotalStock = Object.values(nextStock).reduce(
          (sum, n) => sum + Number(n || 0),
          0
        )

        const { error } = await supabase
          .from('products')
          .update({
            stock_json: nextStock,
            stock: nextTotalStock,
          })
          .eq('id', product.id)

        if (error) {
          console.error('Error descontando stock:', error)
          alert('No se pudo descontar el stock en Supabase.')
          setLoading(false)
          return
        }
      }

      const items = cart
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.product.name} | Talla: ${item.size} | Cantidad: ${item.quantity} pz | Precio: ${mxn(item.product.prices[tier.key])}`,
        )
        .join('%0A')

      const shippingDetails =
        customer.delivery === 'Envíos'
          ? customer.shippingType === 'Domicilio'
            ? `%0A*Tipo de envío:* Domicilio%0A*Recibe:* ${customer.recipientName || '-'}%0A*Tel. receptor:* ${customer.recipientPhone || '-'}%0A*Dirección:* ${customer.shippingAddress || '-'}%0A*C.P.:* ${customer.postalCode || '-'}`
            : `%0A*Tipo de envío:* Ocurre%0A*Dirección ocurre:* ${customer.ocurreAddress || '-'}`
          : ''

      const msg = `Hola, quiero solicitar un apartado.%0A%0A*Cliente:* ${customer.name || '-'}%0A*Teléfono:* ${customer.phone || '-'}%0A*Ciudad:* ${customer.city || '-'}%0A*Entrega:* ${customer.delivery || '-'}${shippingDetails}%0A*Notas:* ${customer.notes || '-'}%0A%0A*Productos:*%0A${items}%0A%0A*Total de piezas:* ${totalPieces}%0A*Nivel de precio:* ${tier.label}%0A*Subtotal estimado:* ${mxn(subtotal)}%0A%0APor favor confírmenme existencia y seguimiento.`

      const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`

      if (insertedOrder?.[0]?.id) {
        await supabase
          .from('orders')
          .update({ whatsapp_sent: true })
          .eq('id', insertedOrder[0].id)
      }

      await fetchProducts()
      await fetchOrders()
      setCart([])
      setCustomer(emptyCustomer)

      setLoading(false)
      window.open(link, '_blank')
    } catch (e) {
      console.error(e)
      alert('Error al confirmar el apartado: ' + e.message)
      setLoading(false)
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setEditingDraft(normalizeProduct(product))
  }

  const saveEdit = async () => {
    if (!editingDraft?.name?.trim()) return
    setLoading(true)

    const payload = mapProductToDb(editingDraft)

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', editingId)

    setLoading(false)

    if (error) {
      console.error('Error actualizando producto:', error)
      alert('No se pudo actualizar el producto.')
      return
    }

    setEditingId(null)
    setEditingDraft(null)
    await fetchProducts()
  }

  const addNewProduct = async () => {
    if (!newProductDraft.name.trim()) return
    setLoading(true)

    const payload = mapProductToDb(newProductDraft)
    const { error } = await supabase.from('products').insert([payload])

    setLoading(false)

    if (error) {
      console.error('Error creando producto:', error)
      alert('No se pudo crear el producto.')
      return
    }

    setNewProductDraft(buildEmptyProduct())
    await fetchProducts()
  }

  const toggleActive = async (id) => {
    const current = products.find((p) => p.id === id)
    if (!current) return

    const { error } = await supabase
      .from('products')
      .update({ active: !current.active })
      .eq('id', id)

    if (error) {
      console.error('Error cambiando estado:', error)
      alert('No se pudo cambiar el estado.')
      return
    }

    await fetchProducts()
  }

  const deleteProduct = async (id) => {
    const ok = window.confirm('¿Seguro que deseas eliminar este producto?')
    if (!ok) return

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      console.error('Error eliminando producto:', error)
      alert('No se pudo eliminar el producto.')
      return
    }

    setCart((prev) => prev.filter((item) => item.product.id !== id))
    await fetchProducts()
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
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <img
              src={STORE_LOGO}
              alt={STORE_NAME}
              style={styles.logo}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              position: isMobile ? 'static' : 'absolute',
              right: 16,
              top: 16,
            }}
          >
            {route === 'admin' && isAdminAuthenticated && (
              <button type="button" style={styles.buttonSecondary} onClick={handleLogout}>
                <LogOut size={16} />
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {route === 'store' ? (
        <Storefront
          products={products}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          selections={selections}
          setSelections={setSelections}
          addToCart={addToCart}
          cart={cart}
          totalPieces={totalPieces}
          tier={tier}
          subtotal={subtotal}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          customer={customer}
          setCustomer={setCustomer}
          confirmOrderAndSendWhatsApp={confirmOrderAndSendWhatsApp}
          loading={loading}
        />
      ) : isAdminAuthenticated ? (
        <AdminPanel
          adminSearch={adminSearch}
          setAdminSearch={setAdminSearch}
          stats={stats}
          reloadProducts={fetchProducts}
          newProductDraft={newProductDraft}
          setNewProductDraft={setNewProductDraft}
          addNewProduct={addNewProduct}
          filteredAdminProducts={filteredAdminProducts}
          editingId={editingId}
          editingDraft={editingDraft}
          setEditingId={setEditingId}
          setEditingDraft={setEditingDraft}
          startEdit={startEdit}
          saveEdit={saveEdit}
          toggleActive={toggleActive}
          deleteProduct={deleteProduct}
          loading={loading}
          orders={orders}
          ordersLoading={ordersLoading}
          ordersError={ordersError}
          reloadOrders={fetchOrders}
          updateOrderStatus={updateOrderStatus}
        />
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