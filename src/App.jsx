import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  QrCode,
  ScanLine,
  MessageCircle,
  HelpCircle,
  Headphones,
  Facebook,
  Instagram,
  Youtube,
  Music2,
  ExternalLink,
} from 'lucide-react'
import { supabase } from './supabase'

const STORE_NAME = 'Denim Click'
const ADMIN_USERNAME = 'Denim'
const ADMIN_PASSWORD = 'Denimzoa2026'
const ADMIN_SESSION_KEY = 'apartados_admin_session_v2'
const SPECIAL_CLIENT_SESSION_KEY = 'denimclick_special_client_v2'
const CART_STORAGE_KEY = 'denimclick_cart_v2'
const PRODUCTS_CACHE_KEY = 'denimclick_products_cache_v3'
const SPECIAL_PRICE_RULES_STORAGE_KEY = 'denimclick_special_price_rules_v1'
const PRODUCT_PAGE_SIZE_DESKTOP = 24
const PRODUCT_PAGE_SIZE_MOBILE = 12
const NEW_PRODUCT_DAYS = 7
const LAST_UNITS_FILTER = '__last_units__'
const PROMO_ROTATE_MS = 5200
const HOME_APARTADO_VIDEO_URL = '/apartado-mayoreo.mp4'
const PRODUCT_META_MARKER = '[[DENIM_CLICK_PRODUCT_META]]'
const PRODUCT_LIST_COLUMNS = 'id,created_at,name,description,category,subcategory,audience,brand,images,sizes,stock,stock_json,price,price_base,price_tier3,price_tier10,special_price,active,is_new,is_offer,sales_count,category_order'
const WHATSAPP_NUMBER = '525572665573'
const SUPPORT_WHATSAPP_NUMBER = '525641124995'
const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61588550633275',
    icon: 'facebook',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@denimclick',
    icon: 'tiktok',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/denimclick?utm_source=qr&igsh=MTNwdmVqdXI0N2hzMw==',
    icon: 'instagram',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/channel/UCJ9lrMwT2oeQS4XFHaJKgvA',
    icon: 'youtube',
  },
]


const AUDIENCES = ['Todo', 'Hombre', 'Dama', 'Niño', 'Accesorios', 'Oferta']
const CLIENT_TIERS = ['Plata', 'Oro', 'Esmeralda', 'Platino', 'Diamante', 'Imperial']

const SPECIAL_PRICE_RULE_PRESETS = [
  {
    id: 'levis-jeans',
    label: 'Levi\'s jeans dama/caballero',
    brand: 'Levi',
    audience: 'Hombre,Dama',
    category: 'Jeans',
    exclude_text: '',
    prices: {
      Plata: 285,
      Oro: 275,
      Esmeralda: 265,
      Platino: 255,
      Diamante: 245,
      Imperial: 0,
    },
  },
  {
    id: 'playeras-corta',
    label: 'Playeras dama/caballero sin manga larga',
    brand: 'Todas',
    audience: 'Hombre,Dama',
    category: 'Playeras',
    exclude_text: 'manga larga',
    prices: {
      Plata: 175,
      Oro: 175,
      Esmeralda: 175,
      Platino: 159,
      Diamante: 159,
      Imperial: 0,
    },
  },
]

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
  Jeans: 699,
  Playeras: 399,
  Sudaderas: 349,
  Chamarras: 499,
  Shorts: 249,
  Polo: 249,
  Camisas: 299,
  Sueter: 299,
  Accesorios: 149,
}

const ADMIN_PRICE_PRESETS = {
  Jeans: {
    price: 699,
    price_tier3: 499,
    price_tier10: 299,
    special_price: 289,
  },
  Playeras: {
    price: 399,
    price_tier3: 299,
    price_tier10: 199,
    special_price: 185,
  },
}

const ORDER_STATUSES = [
  { value: 'nuevo', label: 'Pedido nuevo', color: '#1d4ed8', bg: '#eff6ff' },
  { value: 'confirmado_pago', label: 'Confirmado, espera de pago', color: '#92400e', bg: '#fef3c7' },
  { value: 'incompleto', label: 'Pedido incompleto', color: '#991b1b', bg: '#fef2f2' },
  { value: 'proceso_envio', label: 'En proceso de envio', color: '#047857', bg: '#ecfdf5' },
  { value: 'entregado', label: 'Pedido entregado', color: '#374151', bg: '#f3f4f6' },
  { value: 'cancelado', label: 'Cancelado', color: '#6b7280', bg: '#f3f4f6' },
]

const ADMIN_TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'productos', label: 'Productos' },
  { key: 'clientes', label: 'Clientes especiales' },
  { key: 'tarifas', label: 'Tarifas especiales' },
  { key: 'promociones', label: 'Promociones' },
  { key: 'pedidos', label: 'Pedidos' },
]


const emptyCustomer = {
  name: '',
  phone: '',
  city: '',
  delivery: 'sucursal',
  notes: '',

  // NUEVO
  address: '',
  receiver: '',
  receiver_phone: '',
  reference: '',
}

const emptySpecialClient = {
  name: '',
  phone: '',
  client_code: '',
  qr_value: '',
  client_tier: 'Plata',
  active: true,
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


function isKidsAudience(audience) {
  return String(audience || '').toLowerCase().startsWith('ni')
}

function getDefaultProductPricing(audience, category, current = {}) {
  if (isKidsAudience(audience)) {
    return {
      price: Number(current.price || 0),
      price_tier3: Number(current.price_tier3 || 0),
      price_tier10: Number(current.price_tier10 || 0),
      special_price: Number(current.special_price || 0),
    }
  }

  const preset = ADMIN_PRICE_PRESETS[category]
  if (preset) return { ...preset }

  const base = Number(DEFAULT_PRICE_BY_CATEGORY[category] || current.price || 0)
  return {
    price: base,
    price_tier3: Number(current.price_tier3 || base),
    price_tier10: Number(current.price_tier10 || base),
    special_price: Number(current.special_price || base),
  }
}

function normalizeRuleText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function productMatchesSpecialRule(product, rule) {
  if (!product || !rule) return false
  const audiences = normalizeMetaList(rule.audience || 'Todo')
  const audienceOk =
    audiences.length === 0 ||
    audiences.includes('Todo') ||
    audiences.some((audience) => normalizeRuleText(audience) === normalizeRuleText(product.audience))
  const categoryOk = !rule.category || normalizeRuleText(rule.category) === normalizeRuleText(product.category)
  const brandOk =
    !rule.brand ||
    normalizeRuleText(rule.brand) === 'todas' ||
    normalizeRuleText(rule.brand) === 'todos' ||
    normalizeRuleText(product.brand).includes(normalizeRuleText(rule.brand))
  const combinedText = normalizeRuleText(product.name + ' ' + product.category + ' ' + product.subcategory + ' ' + product.brand)
  const excludeOk = !rule.exclude_text || !combinedText.includes(normalizeRuleText(rule.exclude_text))
  return audienceOk && categoryOk && brandOk && excludeOk
}

function getDefaultTierPricesForProduct(product, rules = SPECIAL_PRICE_RULE_PRESETS) {
  const matchingRule = (rules || []).find((rule) => productMatchesSpecialRule(product, rule))
  if (matchingRule?.prices) {
    return Object.fromEntries(CLIENT_TIERS.map((tier) => [tier, Number(matchingRule.prices[tier] || 0)]))
  }
  const fallback = Number(product?.price_tier10 || product?.price_tier3 || product?.price || 0)
  return Object.fromEntries(CLIENT_TIERS.map((tier) => [tier, fallback]))
}

function getSpecialTierPrice(product, tierName, productTierPrices, rules = SPECIAL_PRICE_RULE_PRESETS) {
  if (!product || !tierName) return 0
  const row = (productTierPrices || []).find((item) => String(item.product_id) === String(product.id) && item.client_tier === tierName)
  if (row && Number(row.price || 0) > 0) return Number(row.price || 0)
  const defaults = getDefaultTierPricesForProduct(product, rules)
  return Number(defaults[tierName] || 0)
}

function getFitsForAudience(products, audience, customFits = [], options = {}) {
  const onlyWithStock = options.onlyWithStock !== false
  const audienceFits = uniqueValues(
    products
      .filter((product) => product.category === 'Jeans')
      .filter((product) => product.active !== false)
      .filter((product) => audience === 'Todo' || product.audience === audience)
      .filter((product) => !onlyWithStock || totalStock(product.stock) > 0)
      .map((product) => product.subcategory)
  )

  const baseFits = onlyWithStock
    ? audienceFits
    : isKidsAudience(audience)
      ? audienceFits
      : audience === 'Dama'
        ? ['Skinny', 'Slim', 'Straight', 'Baggy', ...audienceFits]
        : [...JEANS_FITS, ...audienceFits]

  return uniqueValues([...baseFits, ...(onlyWithStock ? [] : customFits)]).filter(Boolean)
}

function getOrderStatusMeta(status) {
  return ORDER_STATUSES.find((item) => item.value === status) || ORDER_STATUSES[0]
}

function normalizeOrderItems(items) {
  if (Array.isArray(items)) return items
  if (typeof items === 'string' && items.trim()) {
    try {
      const parsed = JSON.parse(items)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function orderIsArchived(status) {
  return ['entregado', 'cancelado'].includes(status)
}

function formatShortDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

function daysSince(value) {
  if (!value) return 0
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 0
  return (Date.now() - date.getTime()) / 86400000
}

function isWithinDays(value, days) {
  return daysSince(value) <= Number(days || 0)
}

function isOfferCurrentlyActive(meta = {}, row = {}) {
  if (meta.offer_forever === true) return true
  const duration = Number(meta.offer_duration_days || 0)
  if (!duration) return true
  return isWithinDays(meta.offer_started_at || row.created_at, duration)
}

function getProductBasePrice(product) {
  if (product?.is_offer && Number(product.offer_price || 0) > 0) {
    return Number(product.offer_price || 0)
  }
  if (product?.is_offer && Number(product.promo_discount_percent || 0) > 0) {
    const discount = Math.min(95, Math.max(0, Number(product.promo_discount_percent || 0)))
    return Math.round(Number(product?.price || 0) * (1 - discount / 100))
  }
  return Number(product?.price || 0)
}

function isLastUnitsProduct(product) {
  const stockEntries = Object.entries(product?.stock || {}).filter(([, qty]) => Number(qty || 0) > 0)
  return totalStock(product?.stock) <= 4 || stockEntries.length <= 1
}

function generateOrderNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const stamp = String(now.getTime()).slice(-6)
  return 'DC-' + y + m + d + '-' + stamp
}

function getOrderNumber(order) {
  const notes = String(order?.notes || '')
  const match = notes.match(/Numero pedido:\s*([^|\n]+)/i)
  if (match) return match[1].trim()
  return order?.id ? 'DC-' + String(order.id).slice(0, 8).toUpperCase() : 'Sin numero'
}

function getOrderCancelReason(order) {
  const notes = String(order?.notes || '')
  const match = notes.match(/Motivo cancelacion:\s*([^|\n]+)/i)
  return match ? match[1].trim() : ''
}

function getCover(product) {
  return Array.isArray(product.images) && product.images.length ? product.images[0] : ''
}

function totalStock(stock) {
  return Object.values(stock || {}).reduce((sum, n) => sum + Number(n || 0), 0)
}

function normalizeMetaList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function splitProductDescription(rawDescription = '') {
  const raw = String(rawDescription || '')
  const markerIndex = raw.indexOf(PRODUCT_META_MARKER)

  if (markerIndex < 0) {
    return { description: raw.trim(), meta: {} }
  }

  const description = raw.slice(0, markerIndex).trim()
  const rawMeta = raw.slice(markerIndex + PRODUCT_META_MARKER.length).trim()

  try {
    return {
      description,
      meta: JSON.parse(rawMeta || '{}') || {},
    }
  } catch {
    return { description, meta: {} }
  }
}

function composeProductDescription(product) {
  const cleanDescription = splitProductDescription(product.description || '').description
  const meta = {
    package_pieces: Number(product.package_pieces || 10),
    package_stock: Number(product.package_stock || 0),
    package_fit: product.package_fit || '',
    package_breakdown: product.package_breakdown || '',
    lengths: normalizeMetaList(product.lengths),
    offer_price: Number(product.offer_price || 0),
    offer_duration_days: Number(product.offer_duration_days || 0),
    offer_forever: product.offer_forever === true,
    offer_started_at: product.offer_started_at || '',
    promotion_title: product.promotion_title || '',
    promotion_note: product.promotion_note || '',
    promo_discount_percent: Number(product.promo_discount_percent || 0),
    promo_free_shipping: product.promo_free_shipping === true,
    promo_terms: product.promo_terms || '',
  }

  const hasMeta =
    meta.package_stock > 0 ||
    Boolean(meta.package_fit) ||
    Boolean(meta.package_breakdown) ||
    meta.lengths.length > 0 ||
    meta.package_pieces !== 10 ||
    meta.offer_price > 0 ||
    meta.offer_duration_days > 0 ||
    meta.offer_forever === true ||
    Boolean(meta.offer_started_at) ||
    Boolean(meta.promotion_title) ||
    Boolean(meta.promotion_note) ||
    meta.promo_discount_percent > 0 ||
    meta.promo_free_shipping === true ||
    Boolean(meta.promo_terms)

  if (!hasMeta) return cleanDescription
  return (cleanDescription ? cleanDescription + '\n\n' : '') + PRODUCT_META_MARKER + JSON.stringify(meta)
}

function getPackagePieces(product) {
  return Number(product?.package_pieces || 10)
}

function getPackageUnitPrice(product) {
  return Number(product?.special_price || product?.price_tier10 || product?.price || 0)
}

function getCartItemPieces(item) {
  if (item?.packageMode) {
    return getPackagePieces(item.product) * Number(item.quantity || 0)
  }
  return Number(item?.quantity || 0)
}

function getCartItemMaxQuantity(item) {
  if (item?.packageMode) {
    return Number(item.product?.package_stock || 0)
  }
  return Number(item.product?.stock?.[item.size] || 0)
}

function getCartItemUnitPrice(item, getProductUnitPrice) {
  if (item?.packageMode) return getPackageUnitPrice(item.product)
  return getProductUnitPrice(item.product)
}

function getCartLineTotal(item, getProductUnitPrice) {
  return getCartItemUnitPrice(item, getProductUnitPrice) * getCartItemPieces(item)
}

function getCartTotalPieces(cart) {
  return cart.reduce((sum, item) => sum + getCartItemPieces(item), 0)
}

function getCartSubtotal(cart, getProductUnitPrice) {
  return cart.reduce((sum, item) => sum + getCartLineTotal(item, getProductUnitPrice), 0)
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

  const parsedDescription = splitProductDescription(row.description || '')
  const productMeta = parsedDescription.meta || {}
  const offerActive = row.is_offer === true && isOfferCurrentlyActive(productMeta, row)

  return {
    id: row.id,
    created_at: row.created_at,
    name: row.name || '',
    description: parsedDescription.description,
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
    offer_price: Number(productMeta.offer_price || 0),
    offer_duration_days: Number(productMeta.offer_duration_days || 0),
    offer_forever: productMeta.offer_forever === true,
    offer_started_at: productMeta.offer_started_at || row.created_at || '',
    promotion_title: productMeta.promotion_title || '',
    promotion_note: productMeta.promotion_note || '',
    promo_discount_percent: Number(productMeta.promo_discount_percent || 0),
    promo_free_shipping: productMeta.promo_free_shipping === true,
    promo_terms: productMeta.promo_terms || '',
    price_tier3: Number(row.price_tier3 ?? row.price_base ?? row.price ?? 0),
    price_tier10: Number(row.price_tier10 ?? row.price_base ?? row.price ?? 0),
    special_price: Number(row.special_price ?? 0),
    active: row.active !== false,
    is_new: row.is_new !== false && isWithinDays(row.created_at, NEW_PRODUCT_DAYS),
    is_offer: offerActive,
    sales_count: Number(row.sales_count || 0),
    category_order: Number(row.category_order || 0),
    package_pieces: Number(productMeta.package_pieces || 10),
    package_stock: Number(productMeta.package_stock || 0),
    package_fit: productMeta.package_fit || '',
    package_breakdown: productMeta.package_breakdown || '',
    lengths: normalizeMetaList(productMeta.lengths),
  }
}

function productToDb(product, options = {}) {
  const includeImages = options.includeImages !== false
  const stockTotal = totalStock(product.stock)
  const productForDescription = {
    ...product,
    offer_started_at: product.is_offer ? product.offer_started_at || new Date().toISOString() : product.offer_started_at || '',
  }

  const payload = {
    name: product.name,
    description: composeProductDescription(productForDescription),
    category: product.category,
    subcategory: product.subcategory || '',
    audience: product.audience,
    brand: product.brand || 'Otras',
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

  if (includeImages) {
    payload.images = product.images?.[0] || ''
    payload.images_json = product.images || []
  }

  return payload
}

function imagesAreEqual(left = [], right = []) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false
  if (left.length !== right.length) return false
  return left.every((item, index) => item === right[index])
}

function getFriendlyProductError(error) {
  const message = String(error?.message || error || '')
  if (message.toLowerCase().includes('statement timeout')) {
    return 'La base tardo demasiado en responder. Ya optimizamos el guardado para no reenviar fotos si no cambiaron; intenta guardar de nuevo.'
  }
  return message
}

function compressImageSource(source, options = {}) {
  const maxSize = Number(options.maxSize || 1000)
  const quality = Number(options.quality || 0.68)
  const original = String(source || '')
  if (!original) return Promise.resolve('')

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.width || 1, img.height || 1))
        const width = Math.max(1, Math.round((img.width || 1) * scale))
        const height = Math.max(1, Math.round((img.height || 1) * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        context.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/webp', quality))
      } catch {
        resolve(original)
      }
    }
    img.onerror = () => resolve(original)
    img.src = original
  })
}

function compressImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => compressImageSource(String(reader.result || '')).then(resolve)
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

async function compressProductImages(images = []) {
  const cleanImages = (Array.isArray(images) ? images : []).filter(Boolean).slice(0, 12)
  return Promise.all(cleanImages.map((image) => compressImageSource(image)))
}

function buildEmptyProduct() {
  const pricing = getDefaultProductPricing('Hombre', 'Jeans')

  return {
    name: '',
    description: '',
    category: 'Jeans',
    subcategory: 'Straight',
    audience: 'Hombre',
    brand: BRANDS[0] || 'Otras',
    images: [],
    sizes: ['28', '30', '32'],
    stock: { 28: 0, 30: 0, 32: 0 },
    ...pricing,
    active: true,
    is_new: true,
    is_offer: false,
    offer_price: 0,
    offer_duration_days: 0,
    offer_forever: true,
    offer_started_at: '',
    promotion_title: '',
    promotion_note: '',
    promo_discount_percent: 0,
    promo_free_shipping: false,
    promo_terms: '',
    sales_count: 0,
    category_order: 0,
    package_pieces: 10,
    package_stock: 0,
    package_fit: '',
    package_breakdown: '',
    lengths: [],
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

function buildPaginationPages(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, idx) => idx + 1)
  const pages = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  if (start > 2) pages.push('...')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < totalPages - 1) pages.push('...')
  pages.push(totalPages)
  return pages
}

function PaginationControls({ page, totalPages, setPage, isMobile, totalItems }) {
  if (totalPages <= 1) return null
  const pages = buildPaginationPages(page, totalPages)

  return (
    <nav aria-label="Paginacion de productos" style={{ borderTop: '1px solid #d8d3c8', marginTop: isMobile ? 22 : 34, paddingTop: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          style={{ ...styles.buttonSecondary, opacity: page <= 1 ? 0.5 : 1, borderRadius: 999 }}
        >
          ‹ Anterior
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {pages.map((item, idx) =>
            item === '...' ? (
              <span key={'dots-' + idx} style={{ padding: '0 6px', color: '#6b7280', fontWeight: 900 }}>...</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  border: page === item ? '1px solid #111315' : '1px solid transparent',
                  background: page === item ? '#fff' : 'transparent',
                  color: '#111315',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          style={{ ...styles.buttonSecondary, opacity: page >= totalPages ? 0.5 : 1, borderRadius: 999 }}
        >
          Siguiente ›
        </button>
      </div>
      <p style={{ margin: '10px 0 0', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
        Pagina {page} de {totalPages} · {totalItems} productos
      </p>
    </nav>
  )
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
    boxSizing: 'border-box',
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
    boxSizing: 'border-box',
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
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (open) setZoomed(false)
  }, [open, product?.id, imageIndex])


  if (!open || !product) return null
  const images = product.images || []

  const previousImage = () => {
    setImageIndex((p) => (p - 1 + images.length) % images.length)
  }

  const nextImage = () => {
    setImageIndex((p) => (p + 1) % images.length)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.86)',
        zIndex: 90,
        display: 'grid',
        placeItems: 'center',
        padding: 18,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar fotos"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: '#fff',
          border: 'none',
          borderRadius: 999,
          width: 46,
          height: 46,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        <X size={24} />
      </button>

      <div style={{ width: '100%', maxWidth: 1040 }}>
        <div style={{ color: '#fff', marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <strong>{product.name}</strong>
          <span>{imageIndex + 1} / {images.length || 1}</span>
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: zoomed ? 'auto' : 'hidden',
            background: 'rgba(255,255,255,.08)',
            maxHeight: '78vh',
          }}
        >
          {images[imageIndex] ? (
            <button
              type="button"
              onClick={() => setZoomed((value) => !value)}
              style={{
                border: 'none',
                padding: 0,
                background: 'transparent',
                width: zoomed ? '150%' : '100%',
                cursor: zoomed ? 'zoom-out' : 'zoom-in',
                transformOrigin: 'center center',
              }}
            >
              <img
                src={images[imageIndex]}
                alt={product.name}
                style={{
                  width: '100%',
                  maxHeight: zoomed ? 'none' : '78vh',
                  objectFit: 'contain',
                }}
              />
            </button>
          ) : (
            <div style={{ minHeight: 420, display: 'grid', placeItems: 'center' }}>
              <ImageIcon size={50} color="#fff" />
            </div>
          )}

          {images.length > 1 && !zoomed ? (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={previousImage}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  width: 44,
                  height: 44,
                  fontSize: 28,
                }}
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Foto siguiente"
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  width: 44,
                  height: 44,
                  fontSize: 28,
                }}
              >
                ›
              </button>
            </>
          ) : null}
        </div>

        {images.length > 1 && (
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(6, 1fr)', marginTop: 12 }}>
            {images.slice(0, 6).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImageIndex(idx)}
                style={{
                  padding: 0,
                  border: idx === imageIndex ? '2px solid #fff' : '1px solid rgba(255,255,255,.25)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <img src={img} alt={product.name + '-' + idx} style={{ width: '100%', height: 64, objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ScannerModal({ open, onClose, onDetected }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const frameRef = useRef(null)

  const [status, setStatus] = useState('Preparando cámara...')
  const [detectedText, setDetectedText] = useState('')
  const [detected, setDetected] = useState(false)

  const lastValueRef = useRef('')
  const sameCountRef = useRef(0)
  const warmupTimeoutRef = useRef(null)
  const readyRef = useRef(false)

  useEffect(() => {
    if (!open) return

    let stopped = false

    const stopCamera = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      if (warmupTimeoutRef.current) {
        clearTimeout(warmupTimeoutRef.current)
        warmupTimeoutRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }

    const resetDetection = () => {
      lastValueRef.current = ''
      sameCountRef.current = 0
      readyRef.current = false
      setDetected(false)
      setDetectedText('')
    }

    const startScanner = async () => {
      try {
        resetDetection()

        if (!navigator.mediaDevices?.getUserMedia) {
          setStatus('Tu navegador no permite abrir la cámara.')
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
          },
          audio: false,
        })

        if (stopped) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        if (!('BarcodeDetector' in window)) {
          setStatus('Este navegador abre la cámara, pero no soporta escaneo automático. Usa el código manual.')
          return
        }

        setStatus('Enfoca el QR o código de barras dentro del marco...')

        warmupTimeoutRef.current = setTimeout(() => {
          if (!stopped) {
            readyRef.current = true
            setStatus('Escaneando automáticamente...')
          }
        }, 1000)

        const detector = new window.BarcodeDetector({
          formats: [
            'qr_code',
            'code_128',
            'code_39',
            'code_93',
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'itf',
            'codabar',
          ],
        })

        const scan = async () => {
          if (stopped) return

          try {
            const video = videoRef.current

            if (video && video.readyState >= 2 && readyRef.current && !detected) {
              const codes = await detector.detect(video)

              if (codes?.length) {
                const value = String(codes[0].rawValue || '').trim()

                if (value) {
                  setDetectedText(value)

                  if (value === lastValueRef.current) {
                    sameCountRef.current += 1
                  } else {
                    lastValueRef.current = value
                    sameCountRef.current = 1
                  }

                  if (sameCountRef.current >= 2) {
                    setDetected(true)
                    setStatus('Código detectado. Iniciando sesión...')
                    stopCamera()

                    setTimeout(() => {
                      onDetected(value)
                      onClose()
                    }, 400)

                    return
                  }
                }
              }
            }
          } catch {
            // Some video frames are not ready for barcode detection yet.
          }

          frameRef.current = requestAnimationFrame(scan)
        }

        scan()
      } catch {
        setStatus('No se pudo abrir la cámara. Revisa permisos del navegador.')
      }
    }

    startScanner()

    return () => {
      stopped = true
      stopCamera()
      resetDetection()
    }
  }, [open, onClose, onDetected, detected])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.78)',
        zIndex: 90,
        display: 'grid',
        placeItems: 'center',
        padding: 18,
      }}
    >
      <div style={{ ...styles.card, width: '100%', maxWidth: 620, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 26 }}>Escanear código</h3>
            <p style={{ margin: '6px 0 0', color: detected ? '#065f46' : '#6b7280', fontWeight: detected ? 700 : 500 }}>
              {status}
            </p>
          </div>

          <button type="button" onClick={onClose} style={styles.buttonSecondary}>
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 20,
            overflow: 'hidden',
            background: '#000',
            aspectRatio: '4 / 3',
            position: 'relative',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <div
              style={{
                width: '68%',
                maxWidth: 320,
                aspectRatio: '1.6 / 1',
                border: detected ? '3px solid #22c55e' : '3px solid rgba(255,255,255,.95)',
                borderRadius: 18,
                boxShadow: detected
                  ? '0 0 0 9999px rgba(0,0,0,.28), 0 0 22px rgba(34,197,94,.8)'
                  : '0 0 0 9999px rgba(0,0,0,.30)',
                position: 'relative',
                transition: 'all .2s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: 2,
                  background: detected ? '#22c55e' : 'rgba(255,255,255,.9)',
                  boxShadow: detected ? '0 0 10px #22c55e' : '0 0 10px rgba(255,255,255,.8)',
                  transform: 'translateY(-50%)',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          <div
            style={{
              background: detected ? '#dcfce7' : '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: 16,
              padding: 12,
              fontSize: 14,
              color: '#374151',
            }}
          >
            {detectedText
              ? `Código encontrado: ${detectedText}`
              : 'Coloca el QR o código de barras dentro del marco. El sistema escaneará automáticamente.'}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={styles.buttonSecondary}
              onClick={() => {
                lastValueRef.current = ''
                sameCountRef.current = 0
                readyRef.current = true
                setDetected(false)
                setDetectedText('')
                setStatus('Escaneando automáticamente...')
              }}
            >
              Reintentar
            </button>

            <button type="button" style={styles.buttonSecondary} onClick={onClose}>
              Cerrar escáner
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
function LoginClientModal({
  open,
  onClose,
  specialCode,
  setSpecialCode,
  loginSpecialClient,
  specialClientSession,
  logoutSpecialClient,
}) {
  const [scannerOpen, setScannerOpen] = useState(false)

  const handleLoginValue = async (value) => {
    const client = await loginSpecialClient(value)
    if (client) {
      setScannerOpen(false)
      onClose()
    }
  }

  if (!open) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.45)',
          zIndex: 70,
          display: 'grid',
          placeItems: 'center',
          padding: 18,
        }}
      >
        <div style={{ ...styles.card, width: '100%', maxWidth: 560, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 30 }}>Inicia sesión</h3>
              <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                Escanea tu código o escríbelo manualmente para iniciar sesión y desbloquear precios especiales.
              </p>
            </div>

            <button type="button" onClick={onClose} style={styles.buttonSecondary}>
              <X size={16} />
            </button>
          </div>

          {specialClientSession ? (
            <div style={{ marginTop: 18, border: '1px solid #e5e7eb', borderRadius: 20, padding: 16 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>Cliente activo</p>
              <p style={{ margin: '8px 0 0' }}><strong>Nombre:</strong> {specialClientSession.name}</p>
              <p style={{ margin: '8px 0 0' }}><strong>Código:</strong> {specialClientSession.client_code}</p>
              <p style={{ margin: '8px 0 0' }}><strong>Categoría:</strong> {specialClientSession.client_tier}</p>

              <div style={{ marginTop: 14 }}>
                <button type="button" style={styles.buttonSecondary} onClick={logoutSpecialClient}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
              <input
                style={styles.input}
                placeholder="Escribe tu ID o código"
                value={specialCode}
                onChange={(e) => setSpecialCode(e.target.value)}
              />

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="button" style={styles.buttonPrimary} onClick={() => handleLoginValue(specialCode)}>
                  <Lock size={16} />
                  Entrar
                </button>

                <button
                  type="button"
                  style={styles.buttonSecondary}
                  onClick={() => setScannerOpen(true)}
                >
                  <ScanLine size={16} />
                  Escanear código
                </button>
              </div>

              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                El escaneo funciona en automático y también puedes escribir el código manualmente.
              </p>
            </div>
          )}
        </div>
      </div>

      <ScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={(value) => handleLoginValue(value)}
      />
    </>
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
  const hasLastUnits = products.some((product) => product.active !== false && (activeAudience === 'Todo' || product.audience === activeAudience) && isLastUnitsProduct(product))
  const categories = [
    ...getAudienceCategories(activeAudience, customCategories).filter((c) => c !== 'Playera'),
    ...(hasLastUnits ? ['Ultimas piezas'] : []),
  ]
  const brands = uniqueValues([
    ...BRANDS,
    ...products
      .filter((p) => (activeAudience === 'Todo' ? true : p.audience === activeAudience))
      .map((p) => p.brand),
  ])
  const fitList = getFitsForAudience(products, activeAudience, customFits)

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
                    if (cat === 'Ultimas piezas') {
                      setStoreAudience(activeAudience)
                      setStoreCategory('Todos')
                      setStoreFit(LAST_UNITS_FILTER)
                      setStoreBrand('Todas')
                      closeMenu()
                      return
                    }
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

  const hasLastUnits = products.some((product) => product.active !== false && (selectedAudience === 'Todo' || product.audience === selectedAudience) && isLastUnitsProduct(product))
  const categories = [
    ...getAudienceCategories(selectedAudience, customCategories).filter((c) => c !== 'Playera'),
    ...(hasLastUnits ? ['Ultimas piezas'] : []),
  ]
  const brands = uniqueValues([
    ...BRANDS,
    ...products
      .filter((p) => (selectedAudience === 'Todo' ? true : p.audience === selectedAudience))
      .map((p) => p.brand),
  ])
  const fits = getFitsForAudience(products, selectedAudience, customFits)

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
          <DenimClickLogo variant="light" size="sm" />
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
            ['Hombre', 'Dama', 'Niño', 'Accesorios', 'Oferta', 'Mejora tu precio'].map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => {
                  if (aud === 'Mejora tu precio') {
                    close()
                    return
                  }
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
                {aud !== 'Mejora tu precio' ? <ChevronRight /> : null}
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
                    } else if (cat === 'Ultimas piezas') {
                      setStoreAudience(selectedAudience)
                      setStoreCategory('Todos')
                      setStoreFit(LAST_UNITS_FILTER)
                      setStoreBrand('Todas')
                      close()
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
function ProductMediaCarousel({
  product,
  isMobile,
  variant = 'card',
  onOpenGallery,
  onOpenQuickView,
}) {
  const images = Array.isArray(product.images) && product.images.length ? product.images : []
  const [imageIndex, setImageIndex] = useState(0)
  const eagerFirstImage = variant === 'quick' || (!isMobile && variant !== 'card')
  const touchStartX = useRef(0)
  const swipedRef = useRef(false)

  useEffect(() => {
    setImageIndex(0)
  }, [product.id])

  const goTo = (nextIndex) => {
    if (!images.length) return
    setImageIndex((nextIndex + images.length) % images.length)
  }

  const openDetail = () => {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    if (isMobile) {
      onOpenQuickView(product)
      return
    }
    onOpenGallery(product, imageIndex)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={'Ver detalle de ' + product.name}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter') openDetail()
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches?.[0]?.clientX || 0
        swipedRef.current = false
      }}
      onTouchEnd={(event) => {
        const endX = event.changedTouches?.[0]?.clientX || touchStartX.current
        const diff = touchStartX.current - endX
        if (Math.abs(diff) < 34) return
        swipedRef.current = true
        goTo(imageIndex + (diff > 0 ? 1 : -1))
      }}
      style={{
        width: '100%',
        background: '#ebe6dc',
        cursor: 'pointer',
        aspectRatio: variant === 'quick' ? '4 / 5.1' : isMobile ? '4 / 4.9' : '4 / 4.35',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'pan-y',
      }}
    >
      {images.length ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            transform: 'translateX(-' + imageIndex * 100 + '%)',
            transition: 'transform .28s ease',
          }}
        >
          {images.map((image, idx) => (
            <img
              key={image + idx}
              src={image}
              alt={product.name}
              loading={idx === 0 && eagerFirstImage ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={idx === 0 && eagerFirstImage ? 'high' : 'low'}
              style={{
                width: '100%',
                height: '100%',
                flex: '0 0 100%',
                objectFit: 'cover',
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
          <ImageIcon size={42} color="#9ca3af" />
        </div>
      )}

      {images.length > 1 ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: isMobile ? 12 : 14,
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {images.slice(0, 5).map((_, idx) => (
            <span
              key={idx}
              style={{
                width: idx === imageIndex ? 18 : 7,
                height: 7,
                borderRadius: 999,
                background: idx === imageIndex ? '#111315' : 'rgba(17,19,21,.28)',
                transition: 'width .2s ease',
              }}
            />
          ))}
        </div>
      ) : null}

      {!isMobile && images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={(event) => {
              event.stopPropagation()
              goTo(imageIndex - 1)
            }}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 38,
              height: 38,
              borderRadius: 999,
              border: 'none',
              background: 'rgba(255,255,255,.9)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              fontSize: 24,
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={(event) => {
              event.stopPropagation()
              goTo(imageIndex + 1)
            }}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 38,
              height: 38,
              borderRadius: 999,
              border: 'none',
              background: 'rgba(255,255,255,.9)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              fontSize: 24,
            }}
          >
            ›
          </button>
        </>
      ) : null}

      {isMobile && variant === 'card' ? (
        <button
          type="button"
          aria-label={'Agregar rapido ' + product.name}
          onClick={(event) => {
            event.stopPropagation()
            onOpenQuickView(product)
          }}
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
            width: 42,
            height: 42,
            borderRadius: 999,
            border: '1px solid rgba(17,19,21,.12)',
            background: 'rgba(255,255,255,.94)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 26px rgba(17,19,21,.14)',
          }}
        >
          <ShoppingBag size={20} />
        </button>
      ) : null}

      {!isMobile && variant === 'card' ? (
        <span
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            borderRadius: 999,
            padding: '7px 10px',
            background: 'rgba(255,255,255,.92)',
            color: '#111315',
            fontWeight: 900,
            fontSize: 12,
          }}
        >
          Ver detalle
        </span>
      ) : null}
    </div>
  )
}

function ProductCard({
  product,
  selectedConfig,
  setSelectedConfig,
  onAddToCart,
  onOpenGallery,
  onOpenQuickView,
  specialClientSession,
  isMobile,
}) {
  const current = selectedConfig[product.id] || { size: '', quantity: 0 }
  const activeSize = current.size
  const stockForSelected = Number(product.stock?.[activeSize] || 0)
  const availableStock = totalStock(product.stock)

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
    <article
      style={{
        ...styles.card,
        overflow: 'hidden',
        borderRadius: isMobile ? 0 : 8,
        boxShadow: isMobile ? 'none' : styles.card.boxShadow,
        border: isMobile ? 'none' : styles.card.border,
        background: '#fff',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={(event) => {
        if (isMobile) return
        event.currentTarget.style.transform = 'translateY(-6px)'
        event.currentTarget.style.boxShadow = '0 24px 50px rgba(17,19,21,0.12)'
      }}
      onMouseLeave={(event) => {
        if (isMobile) return
        event.currentTarget.style.transform = 'translateY(0px)'
        event.currentTarget.style.boxShadow = styles.card.boxShadow
      }}
    >
      <ProductMediaCarousel
        product={product}
        isMobile={isMobile}
        onOpenGallery={onOpenGallery}
        onOpenQuickView={onOpenQuickView}
      />

      <div style={{ padding: isMobile ? '11px 0 18px' : 18 }}>
        {!isMobile ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <Badge>{product.audience}</Badge>
            <Badge bg="#fff" border="1px solid #d1d5db">{product.brand}</Badge>
            {product.is_new ? <Badge bg="#111315" color="#fff">Nuevo</Badge> : null}
            {product.sales_count > 0 ? <Badge bg="#b7791f" color="#fff">Mas vendido</Badge> : null}
            <Badge
              bg={availableStock > 0 ? '#ecfdf5' : '#fef2f2'}
              color={availableStock > 0 ? '#065f46' : '#991b1b'}
            >
              {availableStock > 0 ? availableStock + ' disponibles' : 'Agotado'}
            </Badge>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onOpenQuickView(product)}
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            textAlign: 'left',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <h4 style={{ margin: 0, fontSize: isMobile ? 15 : 22, lineHeight: 1.18, fontWeight: 850 }}>
            {product.name}
          </h4>
        </button>

        {isMobile ? (
          <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
              Tallas disponibles
            </p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(product.sizes || []).slice(0, 8).map((size) => {
                const qty = Number(product.stock?.[size] || 0)
                const selected = activeSize === size
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => qty > 0 && setSize(size)}
                    disabled={qty <= 0}
                    style={{
                      border: selected ? '2px solid #111315' : '1px solid ' + (qty > 0 ? '#d1d5db' : '#e5e7eb'),
                      color: qty > 0 ? '#111315' : '#9ca3af',
                      background: qty > 0 ? '#fff' : '#f3f4f6',
                      borderRadius: 999,
                      padding: '5px 8px',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: qty > 0 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {size} · {qty}
                  </button>
                )
              })}
            </div>

            {activeSize ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d8d3c8', borderRadius: 999, overflow: 'hidden' }}>
                  <button type="button" onClick={() => setQuantity((current.quantity || 0) - 1)} style={{ border: 'none', background: '#fff', width: 32, height: 32, cursor: 'pointer' }}>
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={stockForSelected}
                    value={current.quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    style={{ width: 42, height: 32, textAlign: 'center', border: 'none', outline: 'none', fontWeight: 900 }}
                  />
                  <button type="button" onClick={() => setQuantity((current.quantity || 0) + 1)} style={{ border: 'none', background: '#fff', width: 32, height: 32, cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  disabled={!activeSize || Number(current.quantity || 0) <= 0}
                  style={{
                    ...styles.buttonPrimary,
                    minHeight: 36,
                    borderRadius: 999,
                    padding: '8px 12px',
                    fontSize: 12,
                    opacity: !activeSize || Number(current.quantity || 0) <= 0 ? 0.5 : 1,
                    cursor: !activeSize || Number(current.quantity || 0) <= 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Agregar producto
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <p style={{ display: 'none' }}>{product.description || 'Sin descripcion'}</p>

            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {!specialClientSession?.active ? (
                <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: 8, border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>NORMAL</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{mxn(product.price)}</div>
                  </div>
                  <div style={{ background: '#eff6ff', borderRadius: 12, padding: 8, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 700 }}>3+ PZ</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{mxn(product.price_tier3)}</div>
                  </div>
                  <div style={{ background: '#ecfdf5', borderRadius: 12, padding: 8, border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: 10, color: '#047857', fontWeight: 700 }}>10+ PZ</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{mxn(product.price_tier10)}</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: 10, fontSize: 13, color: '#065f46', fontWeight: 700 }}>
                  Precio especial activo para cliente {specialClientSession.client_tier}
                </div>
              )}
            </div>

            <div style={{ marginTop: 10 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280', fontWeight: 700 }}>Tallas</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(product.sizes || []).map((size) => {
                  const qty = Number(product.stock?.[size] || 0)
                  const selected = activeSize === size
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => qty > 0 && setSize(size)}
                      disabled={qty <= 0}
                      style={{
                        border: selected ? '2px solid #0f172a' : '1px solid #d1d5db',
                        borderRadius: 12,
                        background: qty > 0 ? '#fff' : '#f3f4f6',
                        padding: '8px 10px',
                        minWidth: 54,
                        cursor: qty > 0 ? 'pointer' : 'not-allowed',
                        opacity: qty > 0 ? 1 : 0.6,
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{size}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{qty} pz</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {activeSize ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setQuantity((current.quantity || 0) - 1)} style={{ ...styles.buttonSecondary, padding: '8px 10px' }}>
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={stockForSelected}
                    value={current.quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    style={{ ...styles.input, width: 86, textAlign: 'center', padding: '12px 14px' }}
                  />
                  <button type="button" onClick={() => setQuantity((current.quantity || 0) + 1)} style={{ ...styles.buttonSecondary, padding: '8px 10px' }}>
                    <Plus size={14} />
                  </button>
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
                marginTop: 12,
                opacity: !activeSize || Number(current.quantity || 0) <= 0 ? 0.5 : 1,
                cursor: !activeSize || Number(current.quantity || 0) <= 0 ? 'not-allowed' : 'pointer',
                fontSize: 15,
              }}
            >
              Agregar producto
            </button>
          </>
        )}
      </div>
    </article>
  )
}

function HomeFeaturedProductCard({ product, isMobile, onOpenGallery, onOpenQuickView }) {
  return (
    <article
      style={{
        ...styles.card,
        overflow: 'hidden',
        borderRadius: 8,
        border: isMobile ? '1px solid #e5e7eb' : styles.card.border,
        boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.05)' : styles.card.boxShadow,
        background: '#fff',
        flex: isMobile ? '0 0 calc(100vw - 36px)' : undefined,
      }}
    >
      <ProductMediaCarousel
        product={product}
        isMobile={isMobile}
        onOpenGallery={onOpenGallery}
        onOpenQuickView={onOpenQuickView}
      />
      <div style={{ padding: isMobile ? '12px 0 18px' : 18 }}>
        <button
          type="button"
          onClick={() => onOpenQuickView(product)}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <h3 style={{ margin: 0, fontSize: isMobile ? 17 : 24, lineHeight: 1.12, fontWeight: 950 }}>
            {product.name}
          </h3>
        </button>
      </div>
    </article>
  )
}

function ProductQuickView({
  open,
  product,
  isMobile,
  selectedConfig,
  setSelectedConfig,
  onAddToCart,
  onAddPackageToCart,
  onClose,
  onOpenGallery,
  specialClientSession,
  totalPieces,
  getCartUnitPrice,
}) {
  const [imageIndex, setImageIndex] = useState(0)
  const [packageQty, setPackageQty] = useState(1)
  const touchStartX = useRef(0)
  const detailPanelRef = useRef(null)
  const autoScrollRef = useRef(null)
  const images = product?.images || []
  const current = product ? selectedConfig[product.id] || { size: '', quantity: 0 } : { size: '', quantity: 0 }
  const activeSize = current.size
  const stockForSelected = product ? Number(product.stock?.[activeSize] || 0) : 0
  const availableStock = product ? totalStock(product.stock) : 0
  const specialPriceUnlocked = specialClientSession?.active && (specialClientSession.client_tier !== 'Plata' || Number(totalPieces || 0) >= 10)
  const displayPrice = product ? (specialPriceUnlocked ? Number(getCartUnitPrice?.(product) || getProductBasePrice(product)) : getProductBasePrice(product)) : 0
  const packagePieces = product ? getPackagePieces(product) : 10
  const packageStock = product ? Number(product.package_stock || 0) : 0
  const packageUnitPrice = product ? getPackageUnitPrice(product) : 0

  useEffect(() => {
    if (!open || !product) return
    setImageIndex(0)
    setPackageQty(1)
    const firstAvailable = (product.sizes || []).find((size) => Number(product.stock?.[size] || 0) > 0)
    const existing = selectedConfig[product.id]
    if (!existing?.size || Number(product.stock?.[existing.size] || 0) <= 0) {
      setSelectedConfig((prev) => ({
        ...prev,
        [product.id]: {
          size: firstAvailable || '',
          quantity: firstAvailable ? 1 : 0,
        },
      }))
    }
  }, [open, product, selectedConfig, setSelectedConfig])

  if (!open || !product) return null

  const goTo = (nextIndex) => {
    if (!images.length) return
    setImageIndex((nextIndex + images.length) % images.length)
  }

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

  const addAndClose = () => {
    const added = onAddToCart(product)
    if (added !== false) onClose()
  }

  const setPackageQuantity = (qty) => {
    const clean = Math.max(1, Math.min(Number(qty || 1), Math.max(1, packageStock)))
    setPackageQty(clean)
  }

  const addPackageAndClose = () => {
    const added = onAddPackageToCart(product, packageQty)
    if (added !== false) onClose()
  }

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      window.clearInterval(autoScrollRef.current.id)
      autoScrollRef.current = null
    }
  }

  const startAutoScroll = (direction) => {
    if (isMobile || !detailPanelRef.current) return
    if (autoScrollRef.current?.direction === direction) return
    stopAutoScroll()
    const id = window.setInterval(() => {
      if (detailPanelRef.current) detailPanelRef.current.scrollTop += direction * 18
    }, 24)
    autoScrollRef.current = { id, direction }
  }

  const handleQuickViewMouseMove = (event) => {
    if (isMobile || !detailPanelRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientY > rect.bottom - 82) startAutoScroll(1)
    else if (event.clientY < rect.top + 82) startAutoScroll(-1)
    else stopAutoScroll()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 75,
        background: 'rgba(17,19,21,.46)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: isMobile ? 'flex-end' : 'center',
        padding: isMobile ? 0 : 24,
      }}
      onClick={onClose}
    >
      <section
        aria-label="Detalle rapido de producto"
        onClick={(event) => event.stopPropagation()}
        onMouseMove={handleQuickViewMouseMove}
        onMouseLeave={stopAutoScroll}
        onWheel={(event) => {
          if (!isMobile && detailPanelRef.current && !detailPanelRef.current.contains(event.target)) {
            detailPanelRef.current.scrollTop += event.deltaY
          }
        }}
        style={{
          width: isMobile ? '100%' : 'min(1120px, 96vw)',
          maxHeight: isMobile ? '94vh' : '92vh',
          background: '#fff',
          borderRadius: isMobile ? '28px 28px 0 0' : 8,
          overflow: isMobile ? 'auto' : 'hidden',
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.06fr) minmax(360px, .94fr)',
          boxShadow: '0 30px 90px rgba(17,19,21,.28)',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: '#eeeae2',
            minHeight: isMobile ? 330 : 620,
            height: isMobile ? '56vh' : '100%',
            maxHeight: isMobile ? 520 : 'none',
            overflow: 'hidden',
            touchAction: 'pan-y',
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches?.[0]?.clientX || 0
          }}
          onTouchEnd={(event) => {
            const endX = event.changedTouches?.[0]?.clientX || touchStartX.current
            const diff = touchStartX.current - endX
            if (Math.abs(diff) > 34) goTo(imageIndex + (diff > 0 ? 1 : -1))
          }}
        >
          {images.length ? (
            <div style={{ height: '100%', display: 'flex', transform: 'translateX(-' + imageIndex * 100 + '%)', transition: 'transform .28s ease' }}>
              {images.map((image, idx) => (
                <button
                  key={image + idx}
                  type="button"
                  onClick={() => onOpenGallery(product, imageIndex)}
                  style={{ width: '100%', height: '100%', flex: '0 0 100%', border: 'none', padding: 0, background: 'transparent', cursor: 'zoom-in' }}
                >
                  <img src={image} alt={product.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          ) : (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
              <ImageIcon size={52} color="#9ca3af" />
            </div>
          )}

          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 46,
              height: 46,
              borderRadius: 999,
              border: 'none',
              background: 'rgba(255,255,255,.94)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 28px rgba(17,19,21,.16)',
            }}
          >
            <X size={24} />
          </button>

          {images.length > 1 ? (
            <>
              {!isMobile ? (
                <>
                  <button type="button" aria-label="Imagen anterior" onClick={() => goTo(imageIndex - 1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(255,255,255,.9)', width: 44, height: 44, borderRadius: 999, cursor: 'pointer', fontSize: 28 }}>‹</button>
                  <button type="button" aria-label="Imagen siguiente" onClick={() => goTo(imageIndex + 1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(255,255,255,.9)', width: 44, height: 44, borderRadius: 999, cursor: 'pointer', fontSize: 28 }}>›</button>
                </>
              ) : null}
              <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                {images.slice(0, 6).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={'Ver imagen ' + (idx + 1)}
                    onClick={() => setImageIndex(idx)}
                    style={{ width: idx === imageIndex ? 22 : 9, height: 9, borderRadius: 999, border: '1px solid rgba(255,255,255,.8)', background: idx === imageIndex ? '#111315' : 'rgba(255,255,255,.75)', cursor: 'pointer' }}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div ref={detailPanelRef} style={{ padding: isMobile ? '22px 18px 92px' : 34, overflowY: isMobile ? 'visible' : 'auto', maxHeight: isMobile ? 'none' : '92vh', overscrollBehavior: 'contain', display: 'grid', gap: 18 }}>
          <div>
            <p style={{ margin: 0, color: '#9a6b16', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>
              {product.brand} · {product.category}
            </p>
            <h2 style={{ margin: '8px 0 0', fontSize: isMobile ? 30 : 38, lineHeight: 1.02 }}>
              {product.name}
            </h2>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontWeight: 700 }}>
              Modelo/Fit: {product.subcategory || product.category}
            </p>
            {product.lengths?.length ? (
              <p style={{ margin: '6px 0 0', color: '#6b7280', fontWeight: 700 }}>
                Largo: {product.lengths.join(', ')}
              </p>
            ) : null}
            <p style={{ margin: '14px 0 0', fontSize: 28, fontWeight: 950 }}>
              {mxn(displayPrice)}
              {!specialClientSession?.active && product.price_tier3 < product.price ? (
                <span style={{ display: 'block', color: '#9a6b16', fontSize: 14, marginTop: 4 }}>
                  Compra 3+ piezas desde {mxn(product.price_tier3)}
                </span>
              ) : null}
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <p style={{ margin: 0, fontWeight: 900 }}>Seleccionar talla</p>
              <span style={{ color: availableStock > 0 ? '#047857' : '#991b1b', fontSize: 13, fontWeight: 900 }}>
                {availableStock > 0 ? availableStock + ' piezas disponibles' : 'Agotado'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {(product.sizes || []).map((size) => {
                const qty = Number(product.stock?.[size] || 0)
                const selected = activeSize === size
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => qty > 0 && setSize(size)}
                    disabled={qty <= 0}
                    style={{
                      minWidth: 72,
                      border: selected ? '2px solid #111315' : '1px solid #d1d5db',
                      background: qty > 0 ? '#fff' : '#f3f4f6',
                      color: qty > 0 ? '#111315' : '#9ca3af',
                      borderRadius: 8,
                      padding: '12px 10px',
                      cursor: qty > 0 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <strong>{size}</strong>
                    <span style={{ display: 'block', color: '#6b7280', fontSize: 11, marginTop: 3 }}>{qty} pz</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ border: '1px solid #e5dfd4', borderRadius: 8, padding: 14, background: '#fbfaf7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={18} />
              <p style={{ margin: 0, fontWeight: 950 }}>Paquete cerrado</p>
            </div>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 13, lineHeight: 1.45 }}>
              {packagePieces} piezas del mismo modelo. No se eligen tallas; se entrega con el entallado configurado.
            </p>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', marginTop: 12 }}>
              <div style={{ background: '#fff', border: '1px solid #e5dfd4', borderRadius: 8, padding: 10 }}>
                <small style={{ color: '#6b7280', fontWeight: 800 }}>Precio paquete</small>
                <div style={{ fontWeight: 950 }}>{mxn(packageUnitPrice)} c/u</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e5dfd4', borderRadius: 8, padding: 10 }}>
                <small style={{ color: '#6b7280', fontWeight: 800 }}>Disponibles</small>
                <div style={{ fontWeight: 950 }}>{packageStock} paquete{packageStock === 1 ? '' : 's'}</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e5dfd4', borderRadius: 8, padding: 10 }}>
                <small style={{ color: '#6b7280', fontWeight: 800 }}>Entallado</small>
                <div style={{ fontWeight: 950 }}>{product.package_fit || product.package_breakdown || 'Por confirmar'}</div>
              </div>
            </div>
            {product.package_breakdown ? (
              <p style={{ margin: '10px 0 0', color: '#374151', fontSize: 13, fontWeight: 800 }}>
                Corrida: {product.package_breakdown}
              </p>
            ) : null}
            {packageStock > 0 ? (
              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d8d3c8', borderRadius: 999, overflow: 'hidden' }}>
                  <button type="button" onClick={() => setPackageQuantity(packageQty - 1)} style={{ border: 'none', background: '#fff', width: 38, height: 38, cursor: 'pointer' }}>
                    <Minus size={15} />
                  </button>
                  <input type="number" min="1" max={packageStock} value={packageQty} onChange={(event) => setPackageQuantity(event.target.value)} style={{ width: 48, height: 38, textAlign: 'center', border: 'none', outline: 'none', fontWeight: 900 }} />
                  <button type="button" onClick={() => setPackageQuantity(packageQty + 1)} style={{ border: 'none', background: '#fff', width: 38, height: 38, cursor: 'pointer' }}>
                    <Plus size={15} />
                  </button>
                </div>
                <button type="button" style={{ ...styles.buttonSecondary, background: '#111315', color: '#fff' }} onClick={addPackageAndClose}>
                  Agregar paquete cerrado
                </button>
              </div>
            ) : (
              <p style={{ margin: '10px 0 0', color: '#991b1b', fontWeight: 900 }}>Paquete cerrado agotado.</p>
            )}
          </div>

          <div>
            <p style={{ margin: '0 0 10px', fontWeight: 900 }}>Cantidad</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d8d3c8', borderRadius: 999, overflow: 'hidden' }}>
              <button type="button" onClick={() => setQuantity((current.quantity || 0) - 1)} style={{ border: 'none', background: '#fff', width: 46, height: 42, cursor: 'pointer' }}>
                <Minus size={17} />
              </button>
              <input type="number" min="0" max={stockForSelected} value={current.quantity} onChange={(event) => setQuantity(event.target.value)} style={{ width: 58, height: 42, textAlign: 'center', border: 'none', outline: 'none', fontWeight: 900 }} />
              <button type="button" onClick={() => setQuantity((current.quantity || 0) + 1)} style={{ border: 'none', background: '#fff', width: 46, height: 42, cursor: 'pointer' }}>
                <Plus size={17} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={addAndClose}
            disabled={!activeSize || Number(current.quantity || 0) <= 0}
            style={{ ...styles.buttonPrimary, width: '100%', minHeight: 56, borderRadius: 0, opacity: !activeSize || Number(current.quantity || 0) <= 0 ? .52 : 1, cursor: !activeSize || Number(current.quantity || 0) <= 0 ? 'not-allowed' : 'pointer' }}
          >
            <ShoppingBag size={18} />
            Agregar a bolsa
          </button>

          <div style={{ borderTop: '1px solid #ece6da', paddingTop: 18 }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>Descripcion</h3>
            <p style={{ margin: '10px 0 0', color: '#374151', lineHeight: 1.7 }}>
              {product.description || 'Prenda seleccionada para apartado. Revisa talla, disponibilidad y precio antes de agregarla a tu bolsa.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}



function CartDrawer({
  open,
  onClose,
  isMobile,
  cart,
  setCart,
  customer,
  setCustomer,
  sendOrder,
  orderLoading,
  specialClientSession,
  getCartUnitPrice,
}) {
  const totalPieces = useMemo(() => getCartTotalPieces(cart), [cart])

  const subtotal = useMemo(() => getCartSubtotal(cart, getCartUnitPrice), [cart, getCartUnitPrice])

  const progress = specialClientSession?.active
    ? 100
    : totalPieces >= 10
      ? 100
      : totalPieces >= 3
        ? Math.max(35, Math.round((totalPieces / 10) * 100))
        : Math.round((totalPieces / 3) * 34)

  const status = specialClientSession?.active
    ? {
        title: 'Precio especial activo',
        text: 'Tu categoría de cliente ya está aplicando precios personalizados.',
        tone: '#065f46',
        bg: '#ecfdf5',
        border: '#a7f3d0',
      }
    : totalPieces >= 10
      ? {
          title: 'Mayoreo máximo activo',
          text: 'Ya llevas precio de 10+ piezas en todos los productos elegibles.',
          tone: '#92400e',
          bg: '#fef3c7',
          border: '#fcd34d',
        }
      : totalPieces >= 3
        ? {
            title: 'Mayoreo 3+ activo',
            text: 'Te faltan ' + (10 - totalPieces) + ' pieza' + (10 - totalPieces > 1 ? 's' : '') + ' para el mejor precio.',
            tone: '#047857',
            bg: '#ecfdf5',
            border: '#a7f3d0',
          }
        : {
            title: 'Precio normal',
            text: 'Te faltan ' + (3 - totalPieces) + ' pieza' + (3 - totalPieces > 1 ? 's' : '') + ' para activar mayoreo 3+.',
            tone: '#1d4ed8',
            bg: '#eff6ff',
            border: '#bfdbfe',
          }

  const updateItemQty = (index, nextQty) => {
    setCart((prev) => {
      const next = [...prev]
      const item = next[index]
      if (!item) return prev
      const max = getCartItemMaxQuantity(item)
      const clean = Math.max(0, Math.min(Number(nextQty || 0), max))
      next[index] = { ...item, quantity: clean }
      return next.filter((x) => Number(x.quantity || 0) > 0)
    })
  }

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(17,19,21,.42)',
        display: 'flex',
        justifyContent: isMobile ? 'center' : 'flex-end',
        alignItems: isMobile ? 'flex-end' : 'stretch',
      }}
      onClick={onClose}
    >
      <aside
        aria-label="Bolsa de apartados"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? '100%' : 520,
          maxWidth: '100%',
          maxHeight: isMobile ? '92vh' : '100vh',
          background: '#fff',
          color: '#111315',
          borderRadius: isMobile ? '28px 28px 0 0' : 0,
          boxShadow: '-24px 0 70px rgba(17,19,21,.24)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: isMobile ? '18px 18px 14px' : '26px 28px 18px',
            borderBottom: '1px solid #ece6da',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <div>
            <p style={{ margin: 0, color: '#9a6b16', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>
              Denim Click
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: isMobile ? 28 : 34, lineHeight: 1 }}>Bolsa de apartado</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar bolsa"
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: '1px solid #e5dfd4',
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={22} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: isMobile ? 18 : 28, display: 'grid', gap: 18 }}>
          <div
            style={{
              border: '1px solid ' + status.border,
              background: status.bg,
              borderRadius: 20,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}>
              <div>
                <p style={{ margin: 0, color: status.tone, fontWeight: 900 }}>{status.title}</p>
                <p style={{ margin: '6px 0 0', color: '#374151', lineHeight: 1.45 }}>{status.text}</p>
              </div>
              <Badge bg="#fff" color={status.tone} border={'1px solid ' + status.border}>{totalPieces} pz</Badge>
            </div>

            <div style={{ height: 9, background: 'rgba(255,255,255,.75)', borderRadius: 999, marginTop: 14, overflow: 'hidden' }}>
              <div style={{ width: progress + '%', height: '100%', background: status.tone, borderRadius: 999 }} />
            </div>

            {!specialClientSession?.active ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: '#6b7280', fontSize: 12, fontWeight: 800 }}>
                <span>Normal</span>
                <span>3+ pz</span>
                <span>10+ pz</span>
              </div>
            ) : null}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 22 }}>Tus productos</h3>
              <Badge bg="#f6f4ef" border="1px solid #e5dfd4">{mxn(subtotal)}</Badge>
            </div>

            {cart.length === 0 ? (
              <div style={{ border: '1px dashed #d8d3c8', borderRadius: 22, padding: 26, textAlign: 'center', color: '#6b7280' }}>
                Tu bolsa está vacía. Agrega productos desde el catálogo.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {cart.map((item, index) => {
                  const unit = getCartItemUnitPrice(item, getCartUnitPrice)
                  const lineTotal = getCartLineTotal(item, getCartUnitPrice)
                  const stock = getCartItemMaxQuantity(item)

                  return (
                    <article
                      key={item.product.id + '-' + item.size + '-' + index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '92px 1fr',
                        gap: 14,
                        borderBottom: '1px solid #f0ebe2',
                        paddingBottom: 14,
                      }}
                    >
                      <div style={{ borderRadius: 16, overflow: 'hidden', background: '#f3f4f6', aspectRatio: '1 / 1.1' }}>
                        {getCover(item.product) ? (
                          <img src={getCover(item.product)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                            <ImageIcon size={28} color="#9ca3af" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: 17, lineHeight: 1.2 }}>{item.product.name}</h4>
                            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
                              {item.product.brand} · {item.product.category}
                            </p>
                            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
                              {item.packageMode
                                ? 'Paquete cerrado: ' + item.quantity + ' paquete(s) x ' + getPackagePieces(item.product) + ' pz'
                                : 'Talla ' + item.size}
                            </p>
                            {item.packageMode && item.product.package_breakdown ? (
                              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Corrida: {item.product.package_breakdown}</p>
                            ) : null}
                          </div>
                          <strong>{mxn(lineTotal)}</strong>
                        </div>

                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d8d3c8', borderRadius: 999, overflow: 'hidden' }}>
                            <button type="button" aria-label="Quitar pieza" onClick={() => updateItemQty(index, item.quantity - 1)} style={{ border: 'none', background: '#fff', width: 34, height: 34, cursor: 'pointer' }}>
                              <Minus size={15} />
                            </button>
                            <input
                              aria-label="Cantidad"
                              type="number"
                              min="0"
                              max={stock}
                              value={item.quantity}
                              onChange={(e) => updateItemQty(index, e.target.value)}
                              style={{ width: 44, height: 34, textAlign: 'center', border: 'none', outline: 'none', fontWeight: 900 }}
                            />
                            <button type="button" aria-label="Agregar pieza" onClick={() => updateItemQty(index, item.quantity + 1)} style={{ border: 'none', background: '#fff', width: 34, height: 34, cursor: 'pointer' }}>
                              <Plus size={15} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#6b7280',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              cursor: 'pointer',
                              fontWeight: 800,
                            }}
                          >
                            <Trash2 size={16} />
                            Quitar
                          </button>
                        </div>

                        <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 13 }}>{item.packageMode ? 'Precio por pieza del paquete' : 'Unitario'}: {mxn(unit)}</p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>Datos para solicitar</h3>

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
              <option value="sucursal">Entrega en sucursal</option>
              <option value="envios">Envíos</option>
              <option value="punto">Entrega en punto medio</option>
            </select>

            {customer.delivery === 'envios' && (
              <div style={{ display: 'grid', gap: 12 }}>
                <input
                  style={styles.input}
                  placeholder="Nombre de quien recibe"
                  value={customer.receiver || ''}
                  onChange={(e) => setCustomer((p) => ({ ...p, receiver: e.target.value }))}
                />

                <input
                  style={styles.input}
                  placeholder="Teléfono de quien recibe"
                  value={customer.receiver_phone || ''}
                  onChange={(e) => setCustomer((p) => ({ ...p, receiver_phone: e.target.value }))}
                />

                <input
                  style={styles.input}
                  placeholder="Dirección completa"
                  value={customer.address || ''}
                  onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))}
                />

                <textarea
                  style={styles.textarea}
                  placeholder="Referencia (color de casa, entre calles, etc.)"
                  value={customer.reference || ''}
                  onChange={(e) => setCustomer((p) => ({ ...p, reference: e.target.value }))}
                />
              </div>
            )}

            <textarea
              style={styles.textarea}
              placeholder="Notas adicionales"
              value={customer.notes}
              onChange={(e) => setCustomer((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>

        <div
          style={{
            padding: isMobile ? 18 : 24,
            borderTop: '1px solid #ece6da',
            background: '#fff',
          }}
        >
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
              <span>Subtotal</span>
              <strong>{mxn(subtotal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>Piezas</span>
              <span>{totalPieces}</span>
            </div>
          </div>

          <button
            type="button"
            style={{
              ...styles.buttonPrimary,
              width: '100%',
              minHeight: 54,
              borderRadius: 999,
              opacity: cart.length === 0 || orderLoading ? .55 : 1,
              cursor: cart.length === 0 || orderLoading ? 'not-allowed' : 'pointer',
            }}
            onClick={sendOrder}
            disabled={cart.length === 0 || orderLoading}
          >
            <ShoppingBag size={18} />
            {orderLoading ? 'Preparando apartado...' : 'Solicitar apartado por WhatsApp'}
          </button>
        </div>
      </aside>
    </div>
  )
}

function ProductForm({ draft, setDraft, onSave, onCancel, loading, saveLabel, products }) {
  const isMobile = useIsMobile()
  const [newSize, setNewSize] = useState('')

  const customCategories = uniqueValues(
    products
      .map((p) => p.category)
      .filter((c) => !uniqueValues(Object.values(BASE_CATEGORY_MAP).flat()).includes(c))
  )

  const customFits = uniqueValues(
    products.map((p) => p.subcategory).filter((s) => s && !JEANS_FITS.includes(s))
  )

  const customBrands = uniqueValues(products.map((p) => p.brand).filter((b) => b && !BRANDS.includes(b)))

  const categories = getAudienceCategories(draft.audience, customCategories).filter((c) => c !== 'Playera')
  const fits = getFitsForAudience(products, draft.audience, customFits, { onlyWithStock: false })
  const brands = uniqueValues([...BRANDS, ...customBrands])
  const hasPreset = !isKidsAudience(draft.audience) && Boolean(ADMIN_PRICE_PRESETS[draft.category])

  const applyAudience = (audience) => {
    const nextCategory = getAudienceCategories(audience, customCategories).filter((c) => c !== 'Playera')[0] || 'Jeans'
    const nextFits = getFitsForAudience(products, audience, customFits, { onlyWithStock: false })
    const nextPricing = getDefaultProductPricing(audience, nextCategory, draft)

    setDraft((prev) => ({
      ...prev,
      audience,
      category: nextCategory,
      subcategory: nextCategory === 'Jeans' ? nextFits[0] || prev.subcategory || 'Straight' : '',
      ...nextPricing,
    }))
  }

  const applyCategory = (category) => {
    const nextPricing = getDefaultProductPricing(draft.audience, category, draft)
    setDraft((prev) => ({
      ...prev,
      category,
      subcategory: category === 'Jeans' ? getFitsForAudience(products, prev.audience, customFits, { onlyWithStock: false })[0] || prev.subcategory || 'Straight' : prev.subcategory || '',
      ...nextPricing,
    }))
  }

  const addFiles = (files) => {
    const list = Array.from(files || []).filter((file) => file.type.startsWith('image/'))
    if (!list.length) return

    Promise.all(list.map((file) => compressImageFile(file))).then((images) => {
      setDraft((prev) => ({ ...prev, images: [...(prev.images || []), ...images].filter(Boolean) }))
    })
  }

  const removeImage = (index) => {
    setDraft((prev) => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }))
  }

  const updateSizesFromText = (text) => {
    const sizes = text.split(',').map((s) => s.trim()).filter(Boolean)
    const nextSizes = sizes.length ? sizes : ['CH', 'M', 'G']
    const nextStock = Object.fromEntries(nextSizes.map((s) => [s, Number(draft.stock?.[s] || 0)]))
    setDraft((prev) => ({ ...prev, sizes: nextSizes, stock: nextStock }))
  }

  const addSize = () => {
    const values = newSize
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
    if (!values.length) return

    setDraft((prev) => {
      const nextSizes = [...prev.sizes]
      const nextStock = { ...prev.stock }
      values.forEach((value) => {
        if (!nextSizes.includes(value)) {
          nextSizes.push(value)
          nextStock[value] = 0
        }
      })
      return { ...prev, sizes: nextSizes, stock: nextStock }
    })
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
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
        <input
          style={styles.input}
          placeholder="Nombre del producto"
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
        />

        <select style={styles.input} value={draft.audience} onChange={(e) => applyAudience(e.target.value)}>
          {AUDIENCES.filter((x) => x !== 'Todo').map((aud) => (
            <option key={aud} value={aud}>{aud}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
        <select style={styles.input} value={draft.category} onChange={(e) => applyCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          style={styles.input}
          placeholder="O crea una categoria personalizada"
          value={draft.customCategory || ''}
          onChange={(e) => setDraft((p) => ({ ...p, customCategory: e.target.value }))}
        />
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          <div>
            <select
              style={styles.input}
              value={draft.subcategory}
              onChange={(e) => setDraft((p) => ({ ...p, subcategory: e.target.value }))}
            >
              {fits.map((fit) => (
                <option key={fit} value={fit}>{fit}</option>
              ))}
            </select>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 12 }}>
              Puedes seleccionar o crear modelo/fit para cualquier producto.
            </p>
          </div>

          <input
            style={styles.input}
            placeholder="O crea un fit personalizado"
            value={draft.customSubcategory || ''}
            onChange={(e) => setDraft((p) => ({ ...p, customSubcategory: e.target.value }))}
          />
        </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
        <select
          style={styles.input}
          value={draft.brand}
          onChange={(e) => setDraft((p) => ({ ...p, brand: e.target.value }))}
        >
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
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
        placeholder="Descripcion"
        value={draft.description}
        onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
      />

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16, background: '#fbfaf7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 900 }}>Precios</p>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
              {isKidsAudience(draft.audience)
                ? 'Producto de nino: precios manuales, sin carga automatica.'
                : hasPreset
                  ? 'Tarifa cargada automaticamente. Puedes editar cualquier campo.'
                  : 'Categoria sin preset: edita los precios manualmente.'}
            </p>
          </div>
          {hasPreset ? (
            <button
              type="button"
              style={styles.buttonSecondary}
              onClick={() => setDraft((p) => ({ ...p, ...getDefaultProductPricing(p.audience, p.category, p) }))}
            >
              Restaurar default
            </button>
          ) : null}
        </div>

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', marginTop: 14 }}>
          {[
            ['1 pieza', 'price'],
            ['3+ piezas', 'price_tier3'],
            ['10+ piezas', 'price_tier10'],
            ['Paquete cerrado', 'special_price'],
          ].map(([label, key]) => (
            <label key={key} style={{ display: 'grid', gap: 6, color: '#6b7280', fontWeight: 800, fontSize: 13 }}>
              {label}
              <input
                style={styles.input}
                type="number"
                value={draft[key]}
                onChange={(e) => setDraft((p) => ({ ...p, [key]: Number(e.target.value) }))}
              />
            </label>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16, background: '#fbfaf7' }}>
        <p style={{ margin: 0, fontWeight: 900 }}>Paquete cerrado y largos</p>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
          Configura paquetes de 10 o 12 piezas, cantidad disponible, corrida y largos visibles en tienda.
        </p>

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', marginTop: 14 }}>
          <label style={{ display: 'grid', gap: 6, color: '#6b7280', fontWeight: 800, fontSize: 13 }}>
            Piezas por paquete
            <input
              style={styles.input}
              type="number"
              min="1"
              value={draft.package_pieces ?? 10}
              onChange={(e) => setDraft((p) => ({ ...p, package_pieces: Number(e.target.value) }))}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, color: '#6b7280', fontWeight: 800, fontSize: 13 }}>
            Paquetes disponibles
            <input
              style={styles.input}
              type="number"
              min="0"
              value={draft.package_stock ?? 0}
              onChange={(e) => setDraft((p) => ({ ...p, package_stock: Number(e.target.value) }))}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, color: '#6b7280', fontWeight: 800, fontSize: 13 }}>
            Largo
            <input
              style={styles.input}
              value={(draft.lengths || []).join(', ')}
              onChange={(e) => setDraft((p) => ({ ...p, lengths: normalizeMetaList(e.target.value) }))}
              placeholder="Ej. 30, 32"
            />
          </label>

          <label style={{ display: 'grid', gap: 6, color: '#6b7280', fontWeight: 800, fontSize: 13 }}>
            Entallado
            <input
              style={styles.input}
              value={draft.package_fit || ''}
              onChange={(e) => setDraft((p) => ({ ...p, package_fit: e.target.value }))}
              placeholder="Ej. Slim caballero"
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: 6, color: '#6b7280', fontWeight: 800, fontSize: 13, marginTop: 14 }}>
          Corrida del paquete
          <input
            style={styles.input}
            value={draft.package_breakdown || ''}
            onChange={(e) => setDraft((p) => ({ ...p, package_breakdown: e.target.value }))}
            placeholder="Ej. 28-1, 30-2, 32-3, 34-2"
          />
        </label>
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
          <p style={{ margin: '10px 0 4px', fontWeight: 700 }}>Sube imagenes del producto</p>
          <p style={{ margin: 0, color: '#6b7280' }}>Puedes arrastrarlas o hacer clic aqui</p>
          <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />
        </label>
      </div>

      {(draft.images || []).length > 0 && (
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {draft.images.map((img, index) => (
            <div key={index} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f3f4f6' }}>
              <img src={img} alt={'img-' + index} style={{ width: '100%', height: 90, objectFit: 'cover' }} />
              <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', right: 6, top: 6, border: 'none', borderRadius: 999, background: '#fff', cursor: 'pointer', padding: '2px 8px' }}>
                X
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
        <p style={{ marginTop: 0, fontWeight: 700 }}>Tallas</p>
        <input style={styles.input} value={draft.sizes.join(', ')} onChange={(e) => updateSizesFromText(e.target.value)} placeholder="Ejemplo: 28, 30, 32, 34" />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {draft.sizes.map((size) => (
            <div key={size} style={{ border: '1px solid #e5e7eb', borderRadius: 999, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{size}</span>
              <button type="button" onClick={() => removeSize(size)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                X
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <input
            style={styles.input}
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSize()
              }
            }}
            placeholder="Nueva talla"
          />
          <button type="button" style={styles.buttonSecondary} onClick={addSize}>
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)' }}>
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

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr' }}>
        {[
          ['Activo', 'active'],
          ['Nuevo', 'is_new'],
          ['Oferta visible', 'is_offer'],
        ].map(([label, key]) => (
          <label key={key} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={draft[key]} onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.checked }))} />
            {label}
          </label>
        ))}
      </div>

      {draft.is_offer ? (
        <div style={{ border: '1px solid #fcd34d', borderRadius: 14, padding: 12, background: '#fef3c7', color: '#92400e', display: 'grid', gap: 12 }}>
          <div style={{ fontWeight: 900 }}>
            Configura la oferta. Si no marcas "oferta permanente", se desactiva sola al cumplir los dias.
          </div>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)' }}>
            <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
              Precio oferta
              <input style={styles.input} type="number" value={draft.offer_price || ''} onChange={(e) => setDraft((p) => ({ ...p, offer_price: Number(e.target.value) }))} />
            </label>
            <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
              % descuento
              <input style={styles.input} type="number" min="0" max="95" value={draft.promo_discount_percent || 0} onChange={(e) => setDraft((p) => ({ ...p, promo_discount_percent: Number(e.target.value) }))} />
            </label>
            <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
              Dias de duracion
              <input style={styles.input} type="number" min="0" value={draft.offer_duration_days || 0} disabled={draft.offer_forever} onChange={(e) => setDraft((p) => ({ ...p, offer_duration_days: Number(e.target.value), offer_forever: false }))} />
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 800 }}>
              <input type="checkbox" checked={draft.offer_forever !== false} onChange={(e) => setDraft((p) => ({ ...p, offer_forever: e.target.checked }))} />
              Oferta permanente
            </label>
          </div>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 800 }}>
            <input type="checkbox" checked={draft.promo_free_shipping === true} onChange={(e) => setDraft((p) => ({ ...p, promo_free_shipping: e.target.checked }))} />
            Promocion de envio gratis
          </label>
          <input style={styles.input} placeholder="Titulo de promocion" value={draft.promotion_title || ''} onChange={(e) => setDraft((p) => ({ ...p, promotion_title: e.target.value }))} />
          <textarea style={{ ...styles.textarea, minHeight: 76 }} placeholder="Terminos y condiciones de la promocion" value={draft.promo_terms || draft.promotion_note || ''} onChange={(e) => setDraft((p) => ({ ...p, promo_terms: e.target.value, promotion_note: e.target.value }))} />
        </div>
      ) : null}

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

function ProductTierPricesEditor({ product, priceRows, fetchTierPrices }) {
  const isMobile = useIsMobile()
  const [draft, setDraft] = useState(Object.fromEntries(CLIENT_TIERS.map((tier) => [tier, 0])))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const next = Object.fromEntries(CLIENT_TIERS.map((tier) => [tier, 0]))
    for (const row of priceRows.filter((r) => r.product_id === product.id)) {
      next[row.client_tier] = Number(row.price || 0)
    }
    setDraft(next)
  }, [product.id, priceRows])

  const savePrices = async () => {
    setSaving(true)

    for (const tier of CLIENT_TIERS) {
      const value = Number(draft[tier] || 0)
      const existing = priceRows.find((r) => r.product_id === product.id && r.client_tier === tier)

      if (existing) {
        const { error } = await supabase.from('product_customer_prices').update({ price: value }).eq('id', existing.id)
        if (error) {
          setSaving(false)
          alert('No se pudo guardar ' + tier + ': ' + error.message)
          return
        }
      } else {
        const { error } = await supabase.from('product_customer_prices').insert([{ product_id: product.id, client_tier: tier, price: value }])
        if (error) {
          setSaving(false)
          alert('No se pudo crear ' + tier + ': ' + error.message)
          return
        }
      }
    }

    setSaving(false)
    await fetchTierPrices()
    alert('Precios por categoria guardados.')
  }

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
      <p style={{ marginTop: 0, fontWeight: 900, fontSize: 18 }}>Tarifas para clientes especiales</p>

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(6, 1fr)' }}>
        {CLIENT_TIERS.map((tier) => (
          <label key={tier} style={{ background: '#f8fafc', borderRadius: 14, padding: 12, display: 'grid', gap: 8, fontWeight: 800 }}>
            {tier}
            <input type="number" style={styles.input} value={draft[tier]} onChange={(e) => setDraft((p) => ({ ...p, [tier]: Number(e.target.value) }))} />
          </label>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="button" style={styles.buttonPrimary} onClick={savePrices} disabled={saving}>
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar tarifas'}
        </button>
      </div>
    </div>
  )
}

function SpecialPricingAdmin({ products, productTierPrices, fetchTierPrices, specialPriceRules, setSpecialPriceRules }) {
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [savingRule, setSavingRule] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products
      .filter((product) => product.active !== false)
      .filter((product) => !q || (product.name + ' ' + product.brand + ' ' + product.category + ' ' + product.subcategory).toLowerCase().includes(q))
      .slice(0, 60)
  }, [products, search])

  const selectedProduct = products.find((product) => String(product.id) === String(selectedId)) || filtered[0]

  useEffect(() => {
    if (!selectedId && filtered[0]) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])

  const updateRule = (index, key, value) => {
    setSpecialPriceRules((prev) => prev.map((rule, idx) => (idx === index ? { ...rule, [key]: value } : rule)))
  }

  const updateRulePrice = (index, tier, value) => {
    setSpecialPriceRules((prev) =>
      prev.map((rule, idx) =>
        idx === index
          ? { ...rule, prices: { ...(rule.prices || {}), [tier]: Number(value) } }
          : rule
      )
    )
  }

  const addRule = () => {
    setSpecialPriceRules((prev) => [
      ...prev,
      {
        id: 'regla-' + Date.now(),
        label: 'Nueva regla',
        brand: 'Todas',
        audience: 'Hombre,Dama',
        category: 'Jeans',
        exclude_text: '',
        prices: Object.fromEntries(CLIENT_TIERS.map((tier) => [tier, 0])),
      },
    ])
  }

  const applyRule = async (rule, index) => {
    const matchingProducts = products.filter((product) => productMatchesSpecialRule(product, rule))
    if (!matchingProducts.length) {
      alert('No hay productos que coincidan con esta regla.')
      return
    }

    setSavingRule(index)
    for (const product of matchingProducts) {
      for (const tier of CLIENT_TIERS) {
        const value = Number(rule.prices?.[tier] || 0)
        const existing = productTierPrices.find((row) => String(row.product_id) === String(product.id) && row.client_tier === tier)
        if (existing) {
          const { error } = await supabase.from('product_customer_prices').update({ price: value }).eq('id', existing.id)
          if (error) {
            setSavingRule(null)
            alert('No se pudo actualizar ' + product.name + ' / ' + tier + ': ' + error.message)
            return
          }
        } else {
          const { error } = await supabase.from('product_customer_prices').insert([{ product_id: product.id, client_tier: tier, price: value }])
          if (error) {
            setSavingRule(null)
            alert('No se pudo crear ' + product.name + ' / ' + tier + ': ' + error.message)
            return
          }
        }
      }
    }

    await fetchTierPrices()
    setSavingRule(null)
    alert('Regla aplicada a ' + matchingProducts.length + ' producto(s).')
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ ...styles.card, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 28 }}>Reglas de tarifas especiales</h3>
            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
              Configura precios por marca y tipo de producto. Plata se activa al completar 10 piezas; las demas categorias aplican desde 1 pieza.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" style={styles.buttonSecondary} onClick={() => setSpecialPriceRules(SPECIAL_PRICE_RULE_PRESETS)}>Restaurar presets</button>
            <button type="button" style={styles.buttonPrimary} onClick={addRule}><Plus size={16} />Nueva regla</button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {(specialPriceRules || []).map((rule, index) => {
            const matches = products.filter((product) => productMatchesSpecialRule(product, rule)).length
            return (
              <div key={rule.id || index} style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16, background: '#fbfaf7' }}>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '1.2fr .7fr .8fr .8fr .8fr', alignItems: 'end' }}>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
                    Nombre de regla
                    <input style={styles.input} value={rule.label || ''} onChange={(event) => updateRule(index, 'label', event.target.value)} />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
                    Marca
                    <input style={styles.input} value={rule.brand || ''} onChange={(event) => updateRule(index, 'brand', event.target.value)} placeholder="Todas o Levi" />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
                    Genero
                    <input style={styles.input} value={rule.audience || ''} onChange={(event) => updateRule(index, 'audience', event.target.value)} placeholder="Hombre,Dama" />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
                    Tipo
                    <input style={styles.input} value={rule.category || ''} onChange={(event) => updateRule(index, 'category', event.target.value)} placeholder="Jeans" />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
                    Excluir texto
                    <input style={styles.input} value={rule.exclude_text || ''} onChange={(event) => updateRule(index, 'exclude_text', event.target.value)} placeholder="manga larga" />
                  </label>
                </div>

                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(6, 1fr)', marginTop: 12 }}>
                  {CLIENT_TIERS.map((tier) => (
                    <label key={tier} style={{ display: 'grid', gap: 6, fontWeight: 800, color: '#6b7280', fontSize: 13 }}>
                      {tier}
                      <input style={styles.input} type="number" value={rule.prices?.[tier] || 0} onChange={(event) => updateRulePrice(index, tier, event.target.value)} />
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
                  <Badge bg="#eff6ff" color="#1d4ed8">{matches} productos coinciden</Badge>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      style={styles.buttonSecondary}
                      onClick={() => setSpecialPriceRules((prev) => prev.filter((_, idx) => idx !== index))}
                    >
                      Eliminar regla
                    </button>
                    <button type="button" style={styles.buttonPrimary} disabled={savingRule === index} onClick={() => applyRule(rule, index)}>
                      <Save size={16} />
                      {savingRule === index ? 'Aplicando...' : 'Aplicar a productos'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ ...styles.card, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 24 }}>Ajuste manual por producto</h3>
            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Usalo solo cuando un producto necesite un precio diferente a la regla.</p>
          </div>
          <button type="button" style={styles.buttonSecondary} onClick={fetchTierPrices}>Actualizar tarifas</button>
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', marginTop: 18 }}>
          <input style={styles.input} placeholder="Buscar producto para editar tarifa" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={styles.input} value={selectedProduct?.id || ''} onChange={(e) => setSelectedId(e.target.value)}>
            {filtered.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>

        {selectedProduct ? (
          <div style={{ marginTop: 18, border: '1px solid #e5e7eb', borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 72, height: 82, borderRadius: 12, overflow: 'hidden', background: '#f3f4f6' }}>
                {getCover(selectedProduct) ? <img src={getCover(selectedProduct)} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 22 }}>{selectedProduct.name}</h4>
                <p style={{ margin: '6px 0 0', color: '#6b7280' }}>{selectedProduct.brand} · {selectedProduct.category}</p>
              </div>
            </div>
            <ProductTierPricesEditor product={selectedProduct} priceRows={productTierPrices} fetchTierPrices={fetchTierPrices} />
          </div>
        ) : (
          <div style={{ border: '1px dashed #d1d5db', borderRadius: 18, padding: 22, color: '#6b7280', textAlign: 'center', marginTop: 18 }}>
            No hay productos activos para configurar.
          </div>
        )}
      </div>
    </div>
  )
}

function PromotionProductEditor({ product, fetchProducts }) {
  const isMobile = useIsMobile()
  const [draft, setDraft] = useState({
    is_offer: product.is_offer === true,
    offer_price: product.offer_price || 0,
    promo_discount_percent: product.promo_discount_percent || 0,
    promo_free_shipping: product.promo_free_shipping === true,
    offer_duration_days: product.offer_duration_days || 0,
    offer_forever: product.offer_forever !== false,
    promotion_title: product.promotion_title || '',
    promotion_note: product.promotion_note || '',
    promo_terms: product.promo_terms || '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft({
      is_offer: product.is_offer === true,
      offer_price: product.offer_price || 0,
      promo_discount_percent: product.promo_discount_percent || 0,
      promo_free_shipping: product.promo_free_shipping === true,
      offer_duration_days: product.offer_duration_days || 0,
      offer_forever: product.offer_forever !== false,
      promotion_title: product.promotion_title || '',
      promotion_note: product.promotion_note || '',
      promo_terms: product.promo_terms || '',
    })
  }, [product])

  const savePromotion = async () => {
    setSaving(true)
    const nextProduct = {
      ...product,
      ...draft,
      promotion_note: draft.promo_terms || draft.promotion_note || '',
      offer_started_at: draft.is_offer ? product.offer_started_at || new Date().toISOString() : product.offer_started_at,
    }
    const { error } = await supabase.from('products').update(productToDb(nextProduct)).eq('id', product.id)
    setSaving(false)
    if (error) {
      alert('No se pudo guardar promocion: ' + error.message)
      return
    }
    await fetchProducts()
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '82px 1fr' : '92px 1fr auto', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 82, height: 92, borderRadius: 12, overflow: 'hidden', background: '#f3f4f6' }}>
          {getCover(product) ? <img src={getCover(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
        </div>
        <div>
          <strong>{product.name}</strong>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>{product.brand} · {product.category}</p>
          {draft.is_offer ? <Badge bg="#fef3c7" color="#92400e">Activa</Badge> : null}
          {draft.promo_free_shipping ? <Badge bg="#ecfdf5" color="#047857">Envio gratis</Badge> : null}
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 900 }}>
          <input type="checkbox" checked={draft.is_offer} onChange={(event) => setDraft((prev) => ({ ...prev, is_offer: event.target.checked }))} />
          Promocion activa
        </label>
      </div>

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? '1fr' : '1fr 120px 120px 140px', marginTop: 12 }}>
        <input style={styles.input} placeholder="Nombre de la promocion" value={draft.promotion_title} onChange={(event) => setDraft((prev) => ({ ...prev, promotion_title: event.target.value }))} />
        <input style={styles.input} type="number" placeholder="Precio" value={draft.offer_price || ''} onChange={(event) => setDraft((prev) => ({ ...prev, offer_price: Number(event.target.value) }))} />
        <input style={styles.input} type="number" placeholder="% desc." value={draft.promo_discount_percent || 0} onChange={(event) => setDraft((prev) => ({ ...prev, promo_discount_percent: Number(event.target.value) }))} />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800 }}>
          <input type="checkbox" checked={draft.promo_free_shipping} onChange={(event) => setDraft((prev) => ({ ...prev, promo_free_shipping: event.target.checked }))} />
          Envio gratis
        </label>
      </div>

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? '1fr' : '140px 1fr', marginTop: 10 }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800 }}>
          <input type="checkbox" checked={draft.offer_forever} onChange={(event) => setDraft((prev) => ({ ...prev, offer_forever: event.target.checked }))} />
          Sin vencimiento
        </label>
        <input
          style={styles.input}
          type="number"
          min="0"
          disabled={draft.offer_forever}
          placeholder="Dias de duracion"
          value={draft.offer_duration_days || 0}
          onChange={(event) => setDraft((prev) => ({ ...prev, offer_duration_days: Number(event.target.value), offer_forever: false }))}
        />
      </div>

      <textarea
        style={{ ...styles.textarea, minHeight: 86, marginTop: 10 }}
        placeholder="Terminos y condiciones de la promocion"
        value={draft.promo_terms || draft.promotion_note}
        onChange={(event) => setDraft((prev) => ({ ...prev, promo_terms: event.target.value, promotion_note: event.target.value }))}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button type="button" style={styles.buttonPrimary} disabled={saving} onClick={savePromotion}>
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar promocion'}
        </button>
      </div>
    </div>
  )
}

function PromotionsAdmin({ products, fetchProducts }) {
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState('todos')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products
      .filter((product) => mode === 'todos' || product.is_offer === true)
      .filter((product) => !q || (product.name + ' ' + product.brand + ' ' + product.category + ' ' + product.subcategory).toLowerCase().includes(q))
  }, [products, search, mode])

  return (
    <div style={{ ...styles.card, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 28 }}>Creador de promociones</h3>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
            Activa promociones por producto, define precio especial, porcentaje, envio gratis, vigencia y terminos.
          </p>
        </div>
        <Badge bg="#fef3c7" color="#92400e">{products.filter((product) => product.is_offer).length} activas</Badge>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '1fr 220px', marginTop: 18 }}>
        <input style={styles.input} placeholder="Buscar producto para promocionar" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={styles.input} value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="todos">Todos los productos</option>
          <option value="activas">Solo promociones activas</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr', marginTop: 18 }}>
        {filtered.map((product) => (
          <PromotionProductEditor key={product.id} product={product} fetchProducts={fetchProducts} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ border: '1px dashed #d1d5db', borderRadius: 18, padding: 22, color: '#6b7280', textAlign: 'center', marginTop: 18 }}>
          No hay productos con ese criterio.
        </div>
      ) : null}
    </div>
  )
}

function SpecialClientsAdmin({ specialClients, fetchSpecialClients }) {
  const isMobile = useIsMobile()
  const [draft, setDraft] = useState(emptySpecialClient)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clientSearch, setClientSearch] = useState('')

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase()
    if (!q) return specialClients
    return specialClients.filter((client) =>
      (client.name + ' ' + client.phone + ' ' + client.client_code + ' ' + client.client_tier).toLowerCase().includes(q)
    )
  }, [specialClients, clientSearch])

  const resetDraft = () => {
    setDraft(emptySpecialClient)
    setEditingId(null)
  }

  const makeCode = () => {
    const seed = (draft.name || 'cliente').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'cli'
    const suffix = String(Math.floor(1000 + Math.random() * 9000))
    setDraft((prev) => ({ ...prev, client_code: seed + suffix, qr_value: seed + suffix }))
  }

  const saveClient = async () => {
    if (!draft.name.trim() || !draft.client_code.trim()) {
      alert('Pon nombre y codigo del cliente.')
      return
    }

    setLoading(true)

    const payload = {
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      client_code: draft.client_code.trim(),
      qr_value: (draft.qr_value || draft.client_code).trim(),
      client_tier: draft.client_tier || 'Plata',
      active: draft.active !== false,
      notes: draft.notes || '',
    }

    const response = editingId
      ? await supabase.from('special_clients').update(payload).eq('id', editingId)
      : await supabase.from('special_clients').insert([payload])

    setLoading(false)

    if (response.error) {
      alert('No se pudo guardar cliente especial: ' + response.error.message)
      return
    }

    resetDraft()
    await fetchSpecialClients()
  }

  const editClient = (client) => {
    setEditingId(client.id)
    setDraft({
      name: client.name || '',
      phone: client.phone || '',
      client_code: client.client_code || '',
      qr_value: client.qr_value || '',
      client_tier: client.client_tier || 'Plata',
      active: client.active !== false,
      notes: client.notes || '',
    })
  }

  const deleteClient = async (id) => {
    const ok = window.confirm('Eliminar cliente especial?')
    if (!ok) return

    const { error } = await supabase.from('special_clients').delete().eq('id', id)
    if (error) {
      alert('No se pudo eliminar: ' + error.message)
      return
    }

    await fetchSpecialClients()
  }

  const toggleClient = async (client) => {
    const { error } = await supabase.from('special_clients').update({ active: !client.active }).eq('id', client.id)
    if (error) {
      alert('No se pudo actualizar cliente: ' + error.message)
      return
    }

    await fetchSpecialClients()
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ ...styles.card, padding: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
          <QrCode />
          <div>
            <h3 style={{ margin: 0, fontSize: 28 }}>Clientes especiales</h3>
            <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
              Alta rapida con codigo, QR, categoria y estado.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0,1fr))' }}>
          <input style={styles.input} placeholder="Nombre" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
          <input style={styles.input} placeholder="Telefono" value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={styles.input} placeholder="Codigo de cliente" value={draft.client_code} onChange={(e) => setDraft((p) => ({ ...p, client_code: e.target.value }))} />
            <button type="button" style={styles.buttonSecondary} onClick={makeCode}>Generar</button>
          </div>
          <input style={styles.input} placeholder="Valor QR o codigo de barras" value={draft.qr_value} onChange={(e) => setDraft((p) => ({ ...p, qr_value: e.target.value }))} />
          <select style={styles.input} value={draft.client_tier} onChange={(e) => setDraft((p) => ({ ...p, client_tier: e.target.value }))}>
            {CLIENT_TIERS.map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft((p) => ({ ...p, active: e.target.checked }))} />
            Activo
          </label>
          <textarea style={{ ...styles.textarea, gridColumn: '1 / -1' }} placeholder="Notas" value={draft.notes} onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" style={styles.buttonPrimary} onClick={saveClient} disabled={loading}>
            <Save size={16} />
            {editingId ? 'Guardar cliente' : 'Agregar cliente'}
          </button>
          <button type="button" style={styles.buttonSecondary} onClick={resetDraft}>Cancelar</button>
        </div>
      </div>

      <div style={{ ...styles.card, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 24 }}>Directorio de clientes</h3>
          <div style={{ position: 'relative', width: isMobile ? '100%' : 320 }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
            <input style={{ ...styles.input, paddingLeft: 36 }} placeholder="Buscar cliente" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          {filteredClients.map((client) => (
            <div key={client.id} style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '1fr auto' }}>
              <div>
                <strong style={{ fontSize: 20 }}>{client.name}</strong>
                <div style={{ marginTop: 8, color: '#6b7280' }}>Codigo: {client.client_code} | QR: {client.qr_value || '-'}</div>
                <div style={{ marginTop: 4, color: '#6b7280' }}>Tel: {client.phone || '-'} | Categoria: {client.client_tier || 'Plata'}</div>
                <Badge bg={client.active ? '#ecfdf5' : '#f3f4f6'} color={client.active ? '#047857' : '#6b7280'}>{client.active ? 'Activo' : 'Inactivo'}</Badge>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" style={styles.buttonSecondary} onClick={() => editClient(client)}><Pencil size={16} />Editar</button>
                <button type="button" style={styles.buttonSecondary} onClick={() => toggleClient(client)}>{client.active ? 'Desactivar' : 'Activar'}</button>
                <button type="button" style={styles.buttonSecondary} onClick={() => deleteClient(client.id)}><Trash2 size={16} />Eliminar</button>
              </div>
            </div>
          ))}

          {filteredClients.length === 0 ? (
            <div style={{ border: '1px dashed #d1d5db', borderRadius: 18, padding: 18, color: '#6b7280' }}>
              No hay clientes especiales con ese criterio.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function OrdersAdmin({ orders, fetchOrders }) {
  const isMobile = useIsMobile()
  const [orderSearch, setOrderSearch] = useState('')
  const [mode, setMode] = useState('activos')
  const [savingId, setSavingId] = useState(null)

  const updateStatus = async (order, status) => {
    const payload = { status }
    if (status === 'cancelado') {
      const reason = window.prompt('Motivo de cancelacion del pedido:')
      if (!reason || !reason.trim()) return
      payload.notes = [order.notes || '', 'Motivo cancelacion: ' + reason.trim()].filter(Boolean).join(' | ')
    }

    setSavingId(order.id)
    const { error } = await supabase.from('orders').update(payload).eq('id', order.id)
    setSavingId(null)

    if (error) {
      alert('No se pudo actualizar pedido: ' + error.message)
      return
    }

    await fetchOrders()
  }

  const dashboard = useMemo(() => {
    const delivered = orders.filter((order) => order.status === 'entregado').length
    const canceled = orders.filter((order) => order.status === 'cancelado').length
    const pending = orders.filter((order) => !orderIsArchived(order.status)).length
    const byPieces = new Map()
    const byOrders = new Map()

    orders.forEach((order) => {
      if (order.status === 'cancelado') return
      const key = order.customer_phone || order.customer_name || 'Cliente sin datos'
      const name = order.customer_name || key
      const pieces = Number(order.total_pieces || normalizeOrderItems(order.items_json).reduce((sum, item) => sum + Number(item.pieces || item.quantity || 0), 0))
      byPieces.set(key, { name, value: (byPieces.get(key)?.value || 0) + pieces })
      byOrders.set(key, { name, value: (byOrders.get(key)?.value || 0) + 1 })
    })

    return {
      delivered,
      canceled,
      pending,
      topPieces: [...byPieces.values()].sort((a, b) => b.value - a.value).slice(0, 5),
      topOrders: [...byOrders.values()].sort((a, b) => b.value - a.value).slice(0, 5),
    }
  }, [orders])

  const visibleOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase()
    return orders
      .filter((order) => (mode === 'archivados' ? orderIsArchived(order.status) : !orderIsArchived(order.status)))
      .filter((order) => {
        if (!q) return true
        return (
          String(order.customer_name || '').toLowerCase().includes(q) ||
          String(order.customer_phone || '').toLowerCase().includes(q) ||
          String(order.status || '').toLowerCase().includes(q)
        )
      })
  }, [orders, mode, orderSearch])

  return (
    <div style={{ ...styles.card, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 28 }}>Pedidos</h3>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Actualiza estatus y archiva pedidos entregados o cancelados.</p>
        </div>
        <button type="button" style={styles.buttonSecondary} onClick={fetchOrders}>Actualizar</button>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', marginTop: 18 }}>
        {[
          ['Pendientes', dashboard.pending],
          ['Entregados', dashboard.delivered],
          ['Cancelados', dashboard.canceled],
        ].map(([label, value]) => (
          <div key={label} style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, background: '#f8fafc' }}>
            <p style={{ margin: 0, color: '#6b7280', fontWeight: 800 }}>{label}</p>
            <p style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 950 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', marginTop: 14 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 16 }}>
          <h4 style={{ margin: 0 }}>Ranking por piezas</h4>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {dashboard.topPieces.map((client, idx) => (
              <div key={client.name + idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span>{idx + 1}. {client.name}</span>
                <strong>{client.value} pz</strong>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 16 }}>
          <h4 style={{ margin: 0 }}>Ranking por pedidos</h4>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {dashboard.topOrders.map((client, idx) => (
              <div key={client.name + idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span>{idx + 1}. {client.name}</span>
                <strong>{client.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
        {[
          ['activos', 'Activos'],
          ['archivados', 'Archivados'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            style={{
              ...styles.buttonSecondary,
              background: mode === value ? '#111315' : '#fff',
              color: mode === value ? '#fff' : '#111315',
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 280px' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
          <input style={{ ...styles.input, paddingLeft: 36 }} placeholder="Buscar por cliente, telefono o estatus" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        {visibleOrders.map((order) => {
          const meta = getOrderStatusMeta(order.status)
          const items = normalizeOrderItems(order.items_json)
          const frozen = orderIsArchived(order.status)

          return (
            <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16, display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ fontSize: 20 }}>{getOrderNumber(order)} · {order.customer_name || 'Cliente sin nombre'}</strong>
                  <div style={{ marginTop: 6, color: '#6b7280' }}>{order.customer_phone || '-'} | {formatShortDate(order.created_at)}</div>
                </div>
                <span style={{ borderRadius: 999, padding: '8px 12px', background: meta.bg, color: meta.color, fontWeight: 900 }}>
                  {meta.label}
                </span>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: item.image ? '58px 1fr auto' : '1fr auto', alignItems: 'center', gap: 10, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 10, background: '#f3f4f6' }}
                      />
                    ) : null}
                    <span>{item.name} | Talla {item.size || '-'} | {item.quantity} pz</span>
                    <strong>{mxn(item.total || Number(item.unit_price || 0) * Number(item.quantity || 0))}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: 12, alignItems: 'center' }}>
                <div style={{ color: '#6b7280' }}>
                  <strong style={{ color: '#111315' }}>Total:</strong> {mxn(order.subtotal)} | <strong style={{ color: '#111315' }}>Piezas:</strong> {order.total_pieces || items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
                  {order.notes ? <div style={{ marginTop: 6 }}>Notas: {order.notes}</div> : null}
                  {getOrderCancelReason(order) ? <div style={{ marginTop: 6, color: '#991b1b', fontWeight: 800 }}>Motivo cancelacion: {getOrderCancelReason(order)}</div> : null}
                </div>

                <select
                  style={styles.input}
                  value={order.status || 'nuevo'}
                  disabled={savingId === order.id || frozen}
                  onChange={(e) => updateStatus(order, e.target.value)}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}

        {visibleOrders.length === 0 ? (
          <div style={{ border: '1px dashed #d1d5db', borderRadius: 18, padding: 22, color: '#6b7280', textAlign: 'center' }}>
            No hay pedidos en esta seccion.
          </div>
        ) : null}
      </div>
    </div>
  )
}



function DenimClickLogo({ variant = 'light', size = 'md' }) {
  const color = variant === 'light' ? '#fff' : '#111315'
  const iconColor = variant === 'light' ? '#fff' : '#111315'
  const scale = size === 'mobile' ? 0.52 : size === 'xs' ? 0.64 : size === 'sm' ? 0.82 : size === 'lg' ? 1.18 : 1
  const spinnerBars = Array.from({ length: 18 }, (_, index) => ({ index, opacity: 0.25 + (index / 17) * 0.75 }))
  const letterStyle = {
    fontSize: Math.round(18 * scale),
    fontWeight: 500,
    lineHeight: 1,
    color,
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }
  const wordStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: Math.round(9 * scale),
  }

  return (
    <span
      aria-label={STORE_NAME}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(16 * scale),
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={wordStyle}>
        {'DENIM'.split('').map((letter) => (
          <span key={letter} style={letterStyle}>{letter}</span>
        ))}
      </span>

      <svg
        width={Math.round(46 * scale)}
        height={Math.round(46 * scale)}
        viewBox="0 0 72 72"
        role="img"
        aria-hidden="true"
        style={{ display: 'block', flex: '0 0 auto', overflow: 'visible' }}
      >
        <g transform="translate(36 36)">
          {spinnerBars.map((bar) => (
            <rect
              key={bar.index}
              x="-2"
              y="-31"
              width="4"
              height="9"
              rx="2"
              fill={iconColor}
              opacity={bar.opacity}
              transform={'rotate(' + bar.index * 20 + ')'}
            />
          ))}
        </g>
        <path
          d="M30 20v33l8-8 6 14 8-4-6-13h12L30 20Z"
          fill={iconColor}
          stroke={iconColor}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>

      <span style={wordStyle}>
        {'CLICK'.split('').map((letter) => (
          <span key={letter} style={letterStyle}>{letter}</span>
        ))}
      </span>
    </span>
  )
}

function SocialIcon({ icon, size = 20 }) {
  if (icon === 'facebook') return <Facebook size={size} />
  if (icon === 'instagram') return <Instagram size={size} />
  if (icon === 'youtube') return <Youtube size={size} />
  return <Music2 size={size} />
}

function TopHelpMenu({ isMobile, open, setOpen, onOpenMenu, onOrderStatus, onImprovePrice, onHelp }) {
  const openPinnedRef = useRef(false)
  const menuItems = [
    {
      label: 'Estatus del pedido',
      text: 'Consulta el avance de tus apartados.',
      action: onOrderStatus,
    },
    {
      label: 'Mejora tu precio',
      text: 'Activa tu codigo de cliente especial.',
      action: onImprovePrice,
    },
    {
      label: 'Ayuda',
      text: 'Preguntas frecuentes y soporte por WhatsApp.',
      action: onHelp,
    },
  ]

  return (
    <div
      style={{ position: 'relative', flex: '0 0 auto', paddingBottom: isMobile ? 0 : 14, marginBottom: isMobile ? 0 : -14 }}
      onMouseEnter={() => {
        if (!isMobile) {
          onOpenMenu?.()
          setOpen(true)
        }
      }}
      onMouseLeave={() => {
        if (!isMobile && !openPinnedRef.current) setOpen(false)
      }}
    >
      <button
        type="button"
        aria-label="Ayuda y opciones"
        title="Ayuda y opciones"
        onClick={() => {
          onOpenMenu?.()
          openPinnedRef.current = !(open && openPinnedRef.current)
          setOpen(openPinnedRef.current ? true : !open)
        }}
        style={{
          width: isMobile ? 40 : 46,
          height: isMobile ? 40 : 46,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,.20)',
          background: 'transparent',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        <HelpCircle size={isMobile ? 23 : 25} />
      </button>

      {open ? (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            width: isMobile ? 268 : 300,
            background: '#fff',
            color: '#111315',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            boxShadow: '0 24px 60px rgba(0,0,0,.24)',
            padding: 8,
            zIndex: 80,
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                openPinnedRef.current = false
                setOpen(false)
                item.action?.()
              }}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                color: '#111315',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: 12,
                padding: '12px 12px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 10,
                alignItems: 'center',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = '#f5f5f5'
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent'
              }}
            >
              <span>
                <strong style={{ display: 'block', fontSize: 15 }}>{item.label}</strong>
                <span style={{ display: 'block', color: '#6b7280', fontSize: 12, marginTop: 3, lineHeight: 1.35 }}>
                  {item.text}
                </span>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function HelpInfoSection({ isMobile }) {
  const supportMessage = encodeURIComponent('Hola Denim Click, necesito ayuda con mi pedido o una compra.')
  const supportLink = 'https://wa.me/' + SUPPORT_WHATSAPP_NUMBER + '?text=' + supportMessage
  const faqs = [
    {
      question: 'Como solicito un apartado?',
      answer: 'Agrega las prendas a tu bolsa, revisa tallas y cantidades, y presiona Solicitar apartado por WhatsApp. El mensaje se abre listo para confirmar.',
    },
    {
      question: 'Cuando aplica el precio de mayoreo?',
      answer: 'La bolsa calcula el precio por piezas totales. Desde 3 piezas entra precio 3+ y desde 10 piezas entra el mejor precio por volumen.',
    },
    {
      question: 'Como funciona el paquete cerrado?',
      answer: 'El paquete cerrado es del mismo modelo con diferentes tallas disponibles. En el producto puedes elegir paquete y ajustar cantidades segun stock.',
    },
    {
      question: 'Que pasa si una talla esta agotada?',
      answer: 'Las tallas sin stock aparecen bloqueadas y no se pueden agregar a la bolsa.',
    },
    {
      question: 'Como reviso el estatus de mi pedido?',
      answer: 'En la seccion Estatus de pedido escribe el telefono con el que solicitaste tu apartado para ver el avance.',
    },
    {
      question: 'Como entro con precio especial?',
      answer: 'Si tienes codigo de cliente, puedes escribirlo o escanear tu QR para activar tu tarifa especial.',
    },
  ]

  return (
    <section id="ayuda" style={{ background: '#f7f4ef', padding: isMobile ? '34px 0' : '52px 0' }}>
      <div style={styles.container}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr .82fr', gap: 18, alignItems: 'stretch' }}>
            <div style={{ ...styles.card, borderRadius: isMobile ? 0 : 8, padding: isMobile ? 20 : 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <HelpCircle size={28} />
                <div>
                  <p style={{ margin: 0, color: '#9a6b16', fontWeight: 950, fontSize: 12, textTransform: 'uppercase' }}>Ayuda</p>
                  <h2 style={{ margin: '4px 0 0', fontSize: isMobile ? 28 : 38, lineHeight: 1.02 }}>Preguntas frecuentes</h2>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
                {faqs.map((item) => (
                  <details
                    key={item.question}
                    style={{
                      border: '1px solid #e5dfd4',
                      borderRadius: 8,
                      background: '#fff',
                      padding: '14px 16px',
                    }}
                  >
                    <summary style={{ cursor: 'pointer', fontWeight: 950, color: '#111315' }}>{item.question}</summary>
                    <p style={{ margin: '10px 0 0', color: '#4b5563', lineHeight: 1.55 }}>{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ ...styles.card, borderRadius: isMobile ? 0 : 8, padding: isMobile ? 20 : 26, background: '#111315', color: '#fff' }}>
                <Headphones size={28} color="#f7d38a" />
                <h2 style={{ margin: '14px 0 0', fontSize: isMobile ? 26 : 32 }}>Soporte</h2>
                <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,.72)', lineHeight: 1.6 }}>
                  Si tienes dudas sobre tallas, stock, apartado, envio o seguimiento, contactanos directo por WhatsApp.
                </p>
                <a
                  href={supportLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...styles.buttonPrimary,
                    marginTop: 18,
                    display: 'inline-flex',
                    textDecoration: 'none',
                    background: '#fff',
                    color: '#111315',
                    borderRadius: 999,
                  }}
                >
                  <MessageCircle size={18} />
                  Contactar soporte
                </a>
              </div>

              <div style={{ ...styles.card, borderRadius: isMobile ? 0 : 8, padding: isMobile ? 20 : 26 }}>
                <p style={{ margin: 0, color: '#9a6b16', fontWeight: 950, fontSize: 12, textTransform: 'uppercase' }}>Informacion</p>
                <h2 style={{ margin: '8px 0 0', fontSize: isMobile ? 26 : 32 }}>Quienes somos</h2>
                <p style={{ margin: '10px 0 0', color: '#4b5563', lineHeight: 1.65 }}>
                  En Denim Click somos una tienda especializada en mezclilla y moda casual, enfocada en ayudarte a comprar mejor y vender mas. Usamos tecnologia para brindarte un servicio mas rapido, claro y seguro: puedes revisar disponibilidad, calcular precios por pieza o mayoreo y hacer tus apartados con mayor confianza. Nuestro objetivo es que tomes decisiones rapidas y aproveches cada oportunidad para crecer tu negocio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function OrderStatusLookup({ specialClientSession, isMobile, variant = 'section', open = true, onClose, initialQuery = '', autoSearchKey = 0 }) {
  const activeClient = Boolean(specialClientSession?.active)
  const specialPhone = specialClientSession?.phone || ''
  const specialCodeValue = specialClientSession?.client_code || ''
  const specialName = specialClientSession?.name || ''
  const [query, setQuery] = useState(specialPhone)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (activeClient && specialPhone) setQuery(specialPhone)
    if (!activeClient && initialQuery) setQuery(initialQuery)
  }, [activeClient, initialQuery, specialPhone])

  const findOrders = useCallback(async (options = {}) => {
    const rawQuery = options.queryOverride ?? (activeClient
      ? specialPhone || specialCodeValue || specialName || query
      : query)
    const normalized = String(rawQuery || '').trim().toLowerCase()
    const digits = normalized.replace(/\D/g, '')

    if (!activeClient && normalized.length < 4) {
      alert('Escribe tu numero de pedido o telefono.')
      return
    }

    setLoading(true)
    setHasSearched(true)
    let request = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(activeClient ? 80 : 160)

    if (activeClient && specialPhone) {
      const phoneDigits = String(specialPhone).replace(/\D/g, '')
      request = request.in('customer_phone', uniqueValues([specialPhone, phoneDigits]))
    }

    const { data, error } = await request
    setLoading(false)

    if (error) {
      if (!options.silent) alert('No se pudo consultar tu pedido: ' + error.message)
      return
    }

    const lowerName = String(specialName || '').toLowerCase()
    const lowerCode = String(specialCodeValue || '').toLowerCase()
    const filtered = (data || []).filter((order) => {
      const orderPhone = String(order.customer_phone || '').replace(/\D/g, '')
      const orderNumber = getOrderNumber(order).toLowerCase()
      const orderNotes = String(order.notes || '').toLowerCase()
      const orderName = String(order.customer_name || '').toLowerCase()

      if (activeClient) {
        if (digits && orderPhone.includes(digits)) return true
        if (lowerCode && orderNotes.includes(lowerCode)) return true
        if (lowerName && (orderNotes.includes(lowerName) || orderName.includes(lowerName))) return true
      }

      return (
        orderNumber.includes(normalized) ||
        orderNotes.includes(normalized) ||
        (digits.length >= 8 && orderPhone.includes(digits))
      )
    })

    setOrders(filtered)
  }, [activeClient, query, specialCodeValue, specialName, specialPhone])

  useEffect(() => {
    if (!activeClient) return
    if (variant === 'modal' && !open) return
    findOrders({ silent: true })
  }, [activeClient, findOrders, open, variant])

  useEffect(() => {
    if (variant !== 'modal' || !open || activeClient) return
    const clean = String(initialQuery || '').trim()
    if (clean.length < 4) return
    findOrders({ silent: true, queryOverride: clean })
  }, [activeClient, autoSearchKey, findOrders, initialQuery, open, variant])

  const orderList = orders.length > 0 ? (
    <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
      {orders.map((order) => {
        const meta = getOrderStatusMeta(order.status)
        return (
          <div
            key={order.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              border: variant === 'footer' ? '1px solid rgba(255,255,255,.12)' : '1px solid #e5e7eb',
              borderRadius: 14,
              padding: 12,
              background: variant === 'footer' ? 'rgba(255,255,255,.04)' : '#fff',
            }}
          >
            <div>
              <strong>{getOrderNumber(order)}</strong>
              <div style={{ color: variant === 'footer' ? 'rgba(255,255,255,.68)' : '#6b7280', marginTop: 4 }}>
                {formatShortDate(order.created_at)} | {order.total_pieces || 0} piezas | {mxn(order.subtotal)}
              </div>
            </div>
            <span style={{ borderRadius: 999, padding: '8px 12px', background: meta.bg, color: meta.color, fontWeight: 900 }}>
              {meta.label}
            </span>
          </div>
        )
      })}
    </div>
  ) : hasSearched && !loading ? (
    <p style={{ margin: '14px 0 0', color: variant === 'footer' ? 'rgba(255,255,255,.66)' : '#6b7280' }}>
      No encontramos pedidos con esos datos.
    </p>
  ) : null

  const queryControls = activeClient ? (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <div
        style={{
          border: variant === 'footer' ? '1px solid rgba(255,255,255,.14)' : '1px solid #e5e7eb',
          borderRadius: 16,
          padding: '12px 14px',
          color: variant === 'footer' ? 'rgba(255,255,255,.82)' : '#111827',
          background: variant === 'footer' ? 'rgba(255,255,255,.05)' : '#fff',
          flex: '1 1 220px',
        }}
      >
        Cliente activo: <strong>{specialName || specialCodeValue}</strong>
      </div>
      <button type="button" style={variant === 'footer' ? styles.buttonSecondary : styles.buttonPrimary} onClick={() => findOrders()} disabled={loading}>
        {loading ? 'Buscando...' : 'Actualizar'}
      </button>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <input
        style={{
          ...styles.input,
          minWidth: isMobile ? '100%' : 260,
          flex: '1 1 260px',
          background: variant === 'footer' ? '#0b0c0d' : '#fff',
          color: variant === 'footer' ? '#fff' : '#111827',
          border: variant === 'footer' ? '1px solid rgba(255,255,255,.16)' : styles.input.border,
        }}
        placeholder="Numero de pedido o telefono"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="button" style={variant === 'footer' ? styles.buttonSecondary : styles.buttonPrimary} onClick={() => findOrders()} disabled={loading}>
        {loading ? 'Buscando...' : 'Consultar'}
      </button>
    </div>
  )

  if (variant === 'modal') {
    if (!open) return null

    return (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 95,
          background: 'rgba(0,0,0,.62)',
          display: 'grid',
          placeItems: 'center',
          padding: isMobile ? 12 : 24,
        }}
        onClick={onClose}
      >
        <div
          style={{
            ...styles.card,
            width: '100%',
            maxWidth: 720,
            borderRadius: isMobile ? 22 : 28,
            padding: isMobile ? 20 : 28,
            maxHeight: '86vh',
            overflowY: 'auto',
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 30 : 38 }}>Estatus de pedido</h2>
              <p style={{ margin: '8px 0 0', color: '#6b7280', lineHeight: 1.45 }}>
                {activeClient ? 'Tus pedidos aparecen con tu cliente activo.' : 'Escribe tu numero de pedido o telefono para consultar tu apartado.'}
              </p>
            </div>
            <button type="button" aria-label="Cerrar estatus" onClick={onClose} style={{ ...styles.buttonSecondary, borderRadius: 999, padding: 12 }}>
              <X size={22} />
            </button>
          </div>

          <div style={{ marginTop: 18 }}>{queryControls}</div>
          {orderList}
        </div>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 22 }}>Estatus de pedido</h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,.68)', lineHeight: 1.6 }}>
          Consulta como va tu apartado con tu numero de pedido o telefono.
        </p>
        {queryControls}
        {orderList}
      </div>
    )
  }

  return (
    <section style={{ padding: isMobile ? '8px 0 24px' : '16px 0 32px' }}>
      <div style={styles.container}>
        <div style={{ ...styles.card, borderRadius: isMobile ? 0 : 8, padding: isMobile ? 18 : 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: 16, alignItems: 'end' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 24 : 30 }}>Estatus de pedido</h2>
              <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Consulta como va tu apartado con tu numero de pedido o telefono.</p>
            </div>
            {queryControls}
          </div>
          {orderList}
        </div>
      </div>
    </section>
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
  addPackageToCart,
  cart,
  setCart,
  customer,
  setCustomer,
  sendOrder,
  orderLoading,
  gallery,
  setGallery,
  specialClientSession,
  specialCode,
  setSpecialCode,
  loginSpecialClient,
  logoutSpecialClient,
  getCartUnitPrice,
}) {
  const [openMegaMenu, setOpenMegaMenu] = useState(false)
  const [megaAudience, setMegaAudience] = useState('Hombre')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(() => !specialClientSession?.active)
  const [bagOpen, setBagOpen] = useState(false)
  const [orderStatusOpen, setOrderStatusOpen] = useState(false)
  const [statusInitialQuery, setStatusInitialQuery] = useState('')
  const [statusSearchToken, setStatusSearchToken] = useState(0)
  const [footerStatusQuery, setFooterStatusQuery] = useState('')
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [showHomeCatalog, setShowHomeCatalog] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [page, setPage] = useState(1)
  const [promoIndex, setPromoIndex] = useState(0)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [featuredPaused, setFeaturedPaused] = useState(false)
  const [heroVideoReady, setHeroVideoReady] = useState(false)
  const featuredResumeRef = useRef(null)

  useEffect(() => {
    if (specialClientSession?.active) setLoginOpen(false)
  }, [specialClientSession?.active])

  const visibleBrands = uniqueValues([...BRANDS, ...products.map((p) => p.brand)])
  const visibleCategories = getAudienceCategories(storeAudience, customCategories).filter((c) => c !== 'Playera')
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products])
  const featuredProducts = useMemo(() => activeProducts.filter((p) => getCover(p)), [activeProducts])
  const heroProduct = useMemo(() => {
    return [...featuredProducts].sort((a, b) => Number(b.sales_count || 0) - Number(a.sales_count || 0) || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0]
  }, [featuredProducts])
  const promoProducts = useMemo(() => activeProducts.filter((p) => p.is_offer && getCover(p)), [activeProducts])
  const offerProduct = promoProducts.length ? promoProducts[promoIndex % promoProducts.length] : heroProduct
  const homeHeroProduct = offerProduct || heroProduct
  const topProducts = useMemo(() => {
    return [...featuredProducts]
      .sort((a, b) => Number(b.sales_count || 0) - Number(a.sales_count || 0) || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3)
  }, [featuredProducts])
  const totalPieces = useMemo(() => getCartTotalPieces(cart), [cart])
  
  const firstClientName = specialClientSession?.name
    ? String(specialClientSession.name).trim().split(' ')[0]
    : ''
  const isHomeView = storeAudience === 'Todo' && storeCategory === 'Todos' && storeBrand === 'Todas' && storeFit === 'Todos' && !search.trim()

  const openOrderStatusModal = (queryValue = '') => {
    setStatusInitialQuery(String(queryValue || '').trim())
    setStatusSearchToken((value) => value + 1)
    setOrderStatusOpen(true)
    setHelpMenuOpen(false)
  }

  const scrollToHelpSection = () => {
    setHelpMenuOpen(false)
    const target = document.getElementById('ayuda')
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openImprovePriceInfo = () => {
    setHelpMenuOpen(false)
    setLoginOpen(true)
  }

  const filteredProducts = useMemo(() => {
    let list = [...products].filter((p) => p.active)

    if (storeAudience !== 'Todo') list = list.filter((p) => p.audience === storeAudience)
    if (storeCategory !== 'Todos') list = list.filter((p) => p.category === storeCategory)
    if (storeBrand !== 'Todas') list = list.filter((p) => p.brand === storeBrand)
    if (storeFit === LAST_UNITS_FILTER) list = list.filter((p) => isLastUnitsProduct(p))
    else if (storeFit !== 'Todos') list = list.filter((p) => p.subcategory === storeFit)

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

  useEffect(() => {
    setPage(1)
  }, [storeAudience, storeCategory, storeBrand, storeFit, search])

  const pageSize = isMobile ? PRODUCT_PAGE_SIZE_MOBILE : PRODUCT_PAGE_SIZE_DESKTOP
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, currentPage, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    if (!isHomeView || promoProducts.length <= 1) return undefined
    const id = window.setInterval(() => setPromoIndex((prev) => (prev + 1) % promoProducts.length), PROMO_ROTATE_MS)
    return () => window.clearInterval(id)
  }, [isHomeView, promoProducts.length])

  useEffect(() => {
    if (!isHomeView) {
      setHeroVideoReady(false)
      return undefined
    }
    const id = window.setTimeout(() => setHeroVideoReady(true), isMobile ? 1800 : 250)
    return () => window.clearTimeout(id)
  }, [isHomeView, isMobile])

  useEffect(() => {
    if (!isHomeView || !isMobile || topProducts.length <= 1 || featuredPaused) return undefined
    const id = window.setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % topProducts.length)
    }, 3600)
    return () => window.clearInterval(id)
  }, [featuredPaused, isHomeView, isMobile, topProducts.length])

  useEffect(() => {
    if (featuredIndex >= topProducts.length) setFeaturedIndex(0)
  }, [featuredIndex, topProducts.length])

  useEffect(() => {
    return () => {
      if (featuredResumeRef.current) window.clearTimeout(featuredResumeRef.current)
    }
  }, [])

  const pauseFeaturedCarousel = () => {
    if (!isMobile) return
    setFeaturedPaused(true)
    if (featuredResumeRef.current) window.clearTimeout(featuredResumeRef.current)
  }

  const resumeFeaturedCarouselSoon = () => {
    if (!isMobile) return
    if (featuredResumeRef.current) window.clearTimeout(featuredResumeRef.current)
    featuredResumeRef.current = window.setTimeout(() => setFeaturedPaused(false), 1600)
  }

  const goHome = () => {
    setStoreAudience('Todo')
    setStoreCategory('Todos')
    setStoreFit('Todos')
    setStoreBrand('Todas')
    setSearch('')
    setOpenMegaMenu(false)
    setMobileMenuOpen(false)
    setHelpMenuOpen(false)
    setQuickViewProduct(null)
    setShowHomeCatalog(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
          width: '100%',
          overflow: 'visible',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ ...styles.container, position: 'relative', maxWidth: isMobile ? 'none' : styles.container.maxWidth, width: '100%', padding: isMobile ? '0 8px' : styles.container.padding, boxSizing: 'border-box' }}>
          <div
            style={{
              minHeight: isMobile ? 76 : 82,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: isMobile ? 8 : 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18 }}>
              {isMobile ? (
                <button
                  type="button"
                  aria-label="Abrir menu"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                >
                  <Menu size={30} />
                </button>
              ) : null}

              <button
                type="button"
                aria-label="Ir al inicio"
                onClick={goHome}
                style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', maxWidth: isMobile ? 176 : 'none', overflow: 'hidden' }}
              >
                <DenimClickLogo variant="light" size={isMobile ? 'mobile' : 'md'} />
              </button>
            </div>

            {!isMobile ? (
              <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                {['Hombre', 'Dama', 'Niño', 'Accesorios', 'Oferta'].map((aud) => (
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

                <TopHelpMenu
                  isMobile={false}
                  open={helpMenuOpen}
                  setOpen={setHelpMenuOpen}
                  onOpenMenu={() => setOpenMegaMenu(false)}
                  onOrderStatus={() => openOrderStatusModal()}
                  onImprovePrice={openImprovePriceInfo}
                  onHelp={scrollToHelpSection}
                />
              </nav>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, flex: '0 0 auto' }}>
              {isMobile ? (
                <TopHelpMenu
                  isMobile={true}
                  open={helpMenuOpen}
                  setOpen={setHelpMenuOpen}
                  onOpenMenu={() => setOpenMegaMenu(false)}
                  onOrderStatus={() => openOrderStatusModal()}
                  onImprovePrice={openImprovePriceInfo}
                  onHelp={scrollToHelpSection}
                />
              ) : null}

              <button
                type="button"
                aria-label="Abrir bolsa de apartados"
                onClick={() => setBagOpen(true)}
                style={{
                  width: isMobile ? 40 : 52,
                  height: isMobile ? 40 : 52,
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,.16)',
                  background: '#fff',
                  color: '#111315',
                  display: 'grid',
                  placeItems: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  flex: '0 0 auto',
                }}
              >
                <ShoppingBag size={22} />
                {totalPieces > 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      right: -4,
                      top: -5,
                      minWidth: 22,
                      height: 22,
                      borderRadius: 999,
                      background: '#f7d38a',
                      border: '2px solid #111315',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {totalPieces}
                  </span>
                ) : null}
              </button>

              {!isMobile ? (
                <div style={{ position: 'relative', width: 250 }}>
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

                            {specialClientSession?.active ? (
                <button
                  type="button"
                  aria-label="Ver sesion de cliente"
                  title={isMobile ? 'Cliente activo' : 'Cliente activo: ' + firstClientName}
                  style={{
                    width: isMobile ? 44 : 52,
                    height: isMobile ? 44 : 52,
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,.16)',
                    background: '#f7d38a',
                    color: '#111315',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    flex: '0 0 auto',
                  }}
                  onClick={() => setLoginOpen(true)}
                >
                  <User size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Iniciar sesion"
                  title="Iniciar sesion"
                  style={{
                    width: isMobile ? 44 : 52,
                    height: isMobile ? 44 : 52,
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,.16)',
                    background: '#fff',
                    color: '#111315',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    flex: '0 0 auto',
                  }}
                  onClick={() => setLoginOpen(true)}
                >
                  <User size={20} />
                </button>
              )}


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

      {isHomeView && !showHomeCatalog ? (
        <>
          <section style={{ padding: 0, background: '#111315', width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
            <div style={{ maxWidth: 'none', margin: 0, padding: 0 }}>
              <div
                style={{
                  position: 'relative',
                  minHeight: isMobile ? 'calc(100svh - 76px)' : 680,
                  overflow: 'hidden',
                  background: '#111315',
                  color: '#fff',
                  borderRadius: 0,
                }}
              >
                {homeHeroProduct && getCover(homeHeroProduct) ? (
                  <img
                    src={getCover(homeHeroProduct)}
                    alt={homeHeroProduct.name}
                    loading="eager"
                    decoding="async"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#1f2937' }}>
                    <DenimClickLogo variant="light" size="lg" />
                  </div>
                )}

                {HOME_APARTADO_VIDEO_URL && heroVideoReady ? (
                  <video
                    src={HOME_APARTADO_VIDEO_URL}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={isMobile ? 'none' : 'metadata'}
                    poster={homeHeroProduct && getCover(homeHeroProduct) ? getCover(homeHeroProduct) : undefined}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.10) 20%, rgba(0,0,0,.82) 100%)' }} />

                <div style={{ position: 'absolute', left: isMobile ? 20 : 42, right: isMobile ? 20 : 42, bottom: isMobile ? 28 : 44 }}>
                  <h1 style={{ margin: '10px 0 0', fontSize: isMobile ? 44 : 78, lineHeight: .94, maxWidth: 880 }}>
                    Apartado por mayoreo
                  </h1>
                  <p style={{ margin: '14px 0 0', color: 'rgba(255,255,255,.82)', fontSize: isMobile ? 17 : 21, maxWidth: 720, lineHeight: 1.5 }}>
                    Arma tu bolsa, revisa disponibilidad por talla y solicita tu apartado directo por WhatsApp.
                  </p>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHomeCatalog(true)
                        window.setTimeout(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }), 0)
                      }}
                      style={{ ...styles.buttonPrimary, background: '#fff', color: '#111315', boxShadow: 'none', borderRadius: 999 }}
                    >
                      Ver catalogo
                    </button>
                    <button
                      type="button"
                      onClick={() => setBagOpen(true)}
                      style={{ ...styles.buttonSecondary, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.38)', borderRadius: 999 }}
                    >
                      <ShoppingBag size={18} />
                      Ver bolsa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ padding: isMobile ? '10px 0 28px' : '18px 0 38px' }}>
            <div style={isMobile ? { maxWidth: 'none', margin: 0, padding: '0 0 0 18px', overflow: 'hidden' } : styles.container}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'end', marginBottom: 16, paddingRight: isMobile ? 18 : 0 }}>
                <div>
                  <h2 style={{ margin: '6px 0 0', fontSize: isMobile ? 30 : 42 }}>Productos destacados</h2>
                </div>
              </div>

              <div
                className={isMobile ? 'featured-mobile-window' : undefined}
                style={{
                  display: isMobile ? 'block' : 'grid',
                  overflow: isMobile ? 'hidden' : 'visible',
                }}
              >
                <div
                  className={isMobile ? 'featured-mobile-track' : undefined}
                  onTouchStart={pauseFeaturedCarousel}
                  onTouchEnd={resumeFeaturedCarouselSoon}
                  onMouseEnter={pauseFeaturedCarousel}
                  onMouseLeave={resumeFeaturedCarouselSoon}
                  style={{
                    display: isMobile ? 'flex' : 'grid',
                    gap: isMobile ? 14 : 22,
                    gridTemplateColumns: isMobile ? undefined : 'repeat(3, minmax(0, 1fr))',
                    alignItems: 'start',
                    width: isMobile ? 'max-content' : 'auto',
                    transform: isMobile ? 'translateX(calc(-' + featuredIndex * 100 + 'vw + ' + featuredIndex * 22 + 'px))' : undefined,
                    transition: isMobile ? 'transform .55s ease' : undefined,
                  }}
                >
                  {topProducts.map((product) => (
                    <HomeFeaturedProductCard
                      key={product.id}
                      product={product}
                      isMobile={isMobile}
                      onOpenGallery={(prod, imageIndex = 0) =>
                        setGallery({
                          open: true,
                          product: prod,
                          imageIndex,
                        })
                      }
                      onOpenQuickView={(prod) => setQuickViewProduct(prod)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <HelpInfoSection isMobile={isMobile} />
        </>
      ) : null}

      {(!isHomeView || showHomeCatalog) ? (
        <>
      <section style={{ paddingBottom: 18 }}>
        <div style={styles.container}>
          <div
            style={{
              display: 'grid',
              gap: 14,
              gridTemplateColumns: isMobile ? '1fr' : '1.25fr .9fr .9fr',
              alignItems: 'center',
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
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              style={styles.input}
              value={storeBrand}
              onChange={(e) => setStoreBrand(e.target.value)}
            >
              <option value="Todas">Todas las marcas</option>
              {visibleBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section id="catalogo" style={{ paddingBottom: 42 }}>
        <div style={styles.container}>
          {filteredProducts.length === 0 ? (
            <div style={{ ...styles.card, padding: 30, textAlign: 'center', color: '#6b7280' }}>
              No encontramos productos con ese filtro.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gap: isMobile ? 12 : 22,
                  gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
                  alignItems: 'start',
                }}
              >
                {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedConfig={selectedConfig}
                  setSelectedConfig={setSelectedConfig}
                  onAddToCart={addToCart}
                  onOpenGallery={(prod, imageIndex = 0) =>
                    setGallery({
                      open: true,
                      product: prod,
                      imageIndex,
                    })
                  }
                  onOpenQuickView={(prod) => setQuickViewProduct(prod)}
                  specialClientSession={specialClientSession}
                  isMobile={isMobile}
                />
                ))}
              </div>
              <PaginationControls page={currentPage} totalPages={totalPages} setPage={setPage} isMobile={isMobile} totalItems={filteredProducts.length} />
            </>
          )}
        </div>
      </section>
        </>
      ) : null}

      <OrderStatusLookup
        specialClientSession={specialClientSession}
        isMobile={isMobile}
        variant="modal"
        open={orderStatusOpen}
        onClose={() => setOrderStatusOpen(false)}
        initialQuery={statusInitialQuery}
        autoSearchKey={statusSearchToken}
      />

      <ProductQuickView
        open={!!quickViewProduct}
        product={quickViewProduct}
        isMobile={isMobile}
        selectedConfig={selectedConfig}
        setSelectedConfig={setSelectedConfig}
        onAddToCart={addToCart}
        onAddPackageToCart={addPackageToCart}
        onClose={() => setQuickViewProduct(null)}
        onOpenGallery={(prod, imageIndex = 0) =>
          setGallery({
            open: true,
            product: prod,
            imageIndex,
          })
        }
        specialClientSession={specialClientSession}
        totalPieces={totalPieces}
        getCartUnitPrice={getCartUnitPrice}
      />

      <CartDrawer
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        isMobile={isMobile}
        cart={cart}
        setCart={setCart}
        customer={customer}
        setCustomer={setCustomer}
        sendOrder={sendOrder}
        orderLoading={orderLoading}
        specialClientSession={specialClientSession}
        getCartUnitPrice={getCartUnitPrice}
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

      <footer style={{ background: '#111315', color: '#fff', padding: isMobile ? '30px 0' : '42px 0', marginTop: 0 }}>
        <div style={styles.container}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1.1fr auto',
              gap: isMobile ? 24 : 34,
              alignItems: 'start',
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
              >
                <DenimClickLogo variant="light" size="md" />
              </button>
              <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,.62)', lineHeight: 1.55 }}>
                Apartados, mayoreo y seguimiento directo por WhatsApp.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 22 }}>Estatus de pedido</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,.68)', lineHeight: 1.6 }}>
                Consulta como va tu apartado con tu numero de pedido o telefono.
              </p>
              {specialClientSession?.active ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div
                    style={{
                      border: '1px solid rgba(255,255,255,.14)',
                      borderRadius: 16,
                      padding: '12px 14px',
                      color: 'rgba(255,255,255,.82)',
                      background: 'rgba(255,255,255,.05)',
                      flex: '1 1 220px',
                    }}
                  >
                    Cliente activo: <strong>{specialClientSession.name || specialClientSession.client_code}</strong>
                  </div>
                  <button type="button" style={styles.buttonSecondary} onClick={() => openOrderStatusModal()}>
                    Actualizar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    style={{
                      ...styles.input,
                      minWidth: isMobile ? '100%' : 260,
                      flex: '1 1 260px',
                      background: '#0b0c0d',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,.16)',
                    }}
                    placeholder="Numero de pedido o telefono"
                    value={footerStatusQuery}
                    onChange={(event) => setFooterStatusQuery(event.target.value)}
                  />
                  <button type="button" style={styles.buttonSecondary} onClick={() => openOrderStatusModal(footerStatusQuery)}>
                    Consultar
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Redes sociales</h3>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                {SOCIAL_LINKS.map((social) => {
                  const isReady = Boolean(social.href)

                  return isReady ? (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,.18)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        textDecoration: 'none',
                        background: 'rgba(255,255,255,.06)',
                      }}
                    >
                      <SocialIcon icon={social.icon} />
                    </a>
                  ) : (
                    <span
                      key={social.label}
                      aria-label={social.label + ' proximamente'}
                      title={social.label + ' proximamente'}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,.10)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'rgba(255,255,255,.36)',
                        background: 'rgba(255,255,255,.03)',
                      }}
                    >
                      <SocialIcon icon={social.icon} />
                    </span>
                  )
                })}
              </div>

            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,.10)',
              marginTop: 30,
              paddingTop: 18,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              color: 'rgba(255,255,255,.52)',
              fontSize: 13,
            }}
          >
            <span>Denim Click</span>
            <span>Soporte WhatsApp: 56 4112 4995</span>
          </div>
        </div>
      </footer>

      <LoginClientModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        specialCode={specialCode}
        setSpecialCode={setSpecialCode}
        loginSpecialClient={loginSpecialClient}
        specialClientSession={specialClientSession}
        logoutSpecialClient={logoutSpecialClient}
      />
    </>
  )
}

function AdminView({
  products,
  setProducts,
  fetchProductImages,
  fetchProducts,
  loading,
  setLoading,
  specialClients,
  fetchSpecialClients,
  productTierPrices,
  fetchTierPrices,
  specialPriceRules,
  setSpecialPriceRules,
  orders,
  fetchOrders,
}) {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('resumen')
  const [adminSearch, setAdminSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingDraft, setEditingDraft] = useState(null)
  const [newProductDraft, setNewProductDraft] = useState(buildEmptyProduct())
  const [showProductForm, setShowProductForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [audienceFilter, setAudienceFilter] = useState('Todo')
  const [expandedPrices, setExpandedPrices] = useState({})

  const productCategories = useMemo(() => uniqueValues(products.map((p) => p.category)), [products])

  const filteredProducts = useMemo(() => {
    let list = [...products]
    if (categoryFilter !== 'Todos') list = list.filter((p) => p.category === categoryFilter)
    if (audienceFilter !== 'Todo') list = list.filter((p) => p.audience === audienceFilter)
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase()
      list = list.filter((p) => (p.name + ' ' + p.category + ' ' + p.subcategory + ' ' + p.brand + ' ' + p.audience).toLowerCase().includes(q))
    }
    return list
  }, [products, adminSearch, categoryFilter, audienceFilter])

  const groupedProducts = useMemo(() => {
    return productCategories
      .filter((category) => categoryFilter === 'Todos' || category === categoryFilter)
      .map((category) => ({
        category,
        items: filteredProducts.filter((product) => product.category === category),
      }))
      .filter((group) => group.items.length > 0)
  }, [productCategories, filteredProducts, categoryFilter])

  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => !orderIsArchived(order.status)).length
    return {
      total: products.length,
      active: products.filter((p) => p.active).length,
      stock: products.reduce((sum, p) => sum + Number(p.stock_total || 0), 0),
      clients: specialClients.length,
      orders: activeOrders,
    }
  }, [products, specialClients.length, orders])

  const prepareDraftForSave = (draft) => {
    const finalCategory = draft.customCategory?.trim() || draft.category
    const finalSubcategory = draft.customSubcategory?.trim() || draft.subcategory || ''
    const finalBrand = draft.customBrand?.trim() || draft.brand
    return { ...draft, category: finalCategory, subcategory: finalSubcategory, brand: finalBrand }
  }

  const addProduct = async () => {
    if (!newProductDraft.name.trim()) {
      alert('Pon nombre al producto')
      return
    }

    setLoading(true)
    const clean = prepareDraftForSave(newProductDraft)
    const imageOptimizedProduct = { ...clean, images: await compressProductImages(clean.images) }
    const payload = productToDb(imageOptimizedProduct)
    const { data, error } = await supabase.from('products').insert([payload]).select(PRODUCT_LIST_COLUMNS).single()
    setLoading(false)

    if (error) {
      alert('No se pudo crear el producto: ' + getFriendlyProductError(error))
      return
    }

    const inserted = data
    if (inserted?.id) {
      setProducts((prev) => [normalizeProduct(inserted), ...prev.filter((product) => String(product.id) !== String(inserted.id))])
      const defaultTierPrices = getDefaultTierPricesForProduct(clean, specialPriceRules)
      await Promise.all(
        CLIENT_TIERS.map((tier) =>
          supabase.from('product_customer_prices').insert([{ product_id: inserted.id, client_tier: tier, price: Number(defaultTierPrices[tier] || 0) }])
        )
      )
      await fetchTierPrices()
    }

    setNewProductDraft(buildEmptyProduct())
    setShowProductForm(false)
  }

  const startEdit = async (product) => {
    setEditingId(product.id)
    setEditingDraft({ ...product, customCategory: '', customSubcategory: '', customBrand: '' })
    const images = await fetchProductImages(product.id)
    if (images.length) {
      setEditingDraft((prev) => (prev && String(prev.id) === String(product.id) ? { ...prev, images } : prev))
    }
  }

  const saveEdit = async () => {
    if (!editingDraft?.name?.trim()) {
      alert('Pon nombre al producto')
      return
    }

    setLoading(true)
    const clean = prepareDraftForSave(editingDraft)
    const originalProduct = products.find((product) => String(product.id) === String(editingId))
    const includeImages = !originalProduct || !imagesAreEqual(originalProduct.images || [], clean.images || [])
    const imageOptimizedProduct = includeImages ? { ...clean, images: await compressProductImages(clean.images) } : clean
    const payload = productToDb(imageOptimizedProduct, { includeImages })
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', editingId)
      .select(PRODUCT_LIST_COLUMNS)
      .single()
    setLoading(false)

    if (error) {
      alert('No se pudo actualizar el producto: ' + getFriendlyProductError(error))
      return
    }

    const nextProduct = normalizeProduct(data)
    setProducts((prev) =>
      prev.map((product) =>
        String(product.id) === String(editingId)
          ? { ...nextProduct, images: includeImages ? imageOptimizedProduct.images : product.images }
          : product
      )
    )
    setEditingId(null)
    setEditingDraft(null)
  }

  const toggleActive = async (id, next) => {
    const { error } = await supabase.from('products').update({ active: next }).eq('id', id)
    if (error) {
      alert('No se pudo cambiar el estado: ' + error.message)
      return
    }
    setProducts((prev) => prev.map((product) => (String(product.id) === String(id) ? { ...product, active: next } : product)))
  }

  const deleteProduct = async (id) => {
    const ok = window.confirm('Seguro que deseas eliminar este producto?')
    if (!ok) return

    await supabase.from('product_customer_prices').delete().eq('product_id', id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('No se pudo eliminar: ' + error.message)
      return
    }
    setProducts((prev) => prev.filter((product) => String(product.id) !== String(id)))
    await fetchTierPrices()
  }

  const tabButton = (tab) => (
    <button
      key={tab.key}
      type="button"
      onClick={() => setActiveTab(tab.key)}
      style={{
        border: '1px solid ' + (activeTab === tab.key ? '#111315' : '#d1d5db'),
        background: activeTab === tab.key ? '#111315' : '#fff',
        color: activeTab === tab.key ? '#fff' : '#111315',
        borderRadius: 999,
        padding: '12px 16px',
        fontWeight: 900,
        cursor: 'pointer',
      }}
    >
      {tab.label}
    </button>
  )

  const renderProductCard = (product) => (
    <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 16, background: '#fff' }}>
      {editingId === product.id && editingDraft ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 22 }}>Editando producto</h4>
            <button type="button" onClick={() => { setEditingId(null); setEditingDraft(null) }} style={styles.buttonSecondary}>
              <X size={16} />
            </button>
          </div>
          <ProductForm draft={editingDraft} setDraft={setEditingDraft} onSave={saveEdit} onCancel={() => { setEditingId(null); setEditingDraft(null) }} loading={loading} saveLabel="Guardar cambios" products={products} />
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '92px 1fr' : '120px 1fr auto', alignItems: 'start' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#f3f4f6', minHeight: 110 }}>
              {getCover(product) ? (
                <img src={getCover(product)} alt={product.name} style={{ width: '100%', height: 118, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: 118, display: 'grid', placeItems: 'center' }}><ImageIcon size={32} color="#9ca3af" /></div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: 22 }}>{product.name}</h4>
                <Badge>{product.audience}</Badge>
                <Badge bg="#fff" border="1px solid #d1d5db">{product.brand}</Badge>
                {product.subcategory ? <Badge bg="#dbeafe" color="#1d4ed8">{product.subcategory}</Badge> : null}
                {product.is_offer ? <Badge bg="#fef3c7" color="#92400e">Oferta</Badge> : null}
              </div>
              <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{product.category} | Stock {product.stock_total} | Paquetes {product.package_stock || 0}</p>

              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', marginTop: 12 }}>
                {[
                  ['1 pz', product.price],
                  ['3+ pz', product.price_tier3],
                  ['10+ pz', product.price_tier10],
                  ['Paquete', product.special_price],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#f3f4f6', borderRadius: 12, padding: 10 }}>
                    <small style={{ color: '#6b7280' }}>{label}</small>
                    <div style={{ fontWeight: 900 }}>{mxn(value)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 8, gridColumn: isMobile ? '1 / -1' : 'auto' }}>
              <button type="button" style={styles.buttonSecondary} onClick={() => startEdit(product)}><Pencil size={16} />Editar</button>
              <button type="button" style={styles.buttonSecondary} onClick={() => toggleActive(product.id, !product.active)}>{product.active ? 'Ocultar' : 'Activar'}</button>
              <button type="button" style={styles.buttonSecondary} onClick={() => deleteProduct(product.id)}><Trash2 size={16} />Eliminar</button>
              <button type="button" style={styles.buttonSecondary} onClick={() => setExpandedPrices((prev) => ({ ...prev, [product.id]: !prev[product.id] }))}>
                Tarifas
              </button>
            </div>
          </div>

          {expandedPrices[product.id] ? (
            <ProductTierPricesEditor product={product} priceRows={productTierPrices} fetchTierPrices={fetchTierPrices} />
          ) : null}
        </>
      )}
    </div>
  )

  return (
    <section style={{ padding: '28px 0 50px' }}>
      <div style={styles.container}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ ...styles.card, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 34 }}>Panel admin</h2>
                <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Productos, clientes, tarifas y pedidos en secciones separadas.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{ADMIN_TABS.map(tabButton)}</div>
            </div>
          </div>

          {activeTab === 'resumen' ? (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)' }}>
                {[
                  ['Productos', stats.total],
                  ['Activos', stats.active],
                  ['Stock', stats.stock],
                  ['Clientes', stats.clients],
                  ['Pedidos activos', stats.orders],
                ].map(([label, value]) => (
                  <div key={label} style={{ ...styles.card, padding: 18 }}>
                    <p style={{ margin: 0, color: '#6b7280', fontWeight: 800 }}>{label}</p>
                    <p style={{ margin: '8px 0 0', fontWeight: 950, fontSize: 30 }}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{ ...styles.card, padding: 24 }}>
                <h3 style={{ marginTop: 0, fontSize: 24 }}>Acciones rapidas</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" style={styles.buttonPrimary} onClick={() => { setActiveTab('productos'); setShowProductForm(true) }}>Agregar producto</button>
                  <button type="button" style={styles.buttonSecondary} onClick={() => setActiveTab('clientes')}>Agregar cliente especial</button>
                  <button type="button" style={styles.buttonSecondary} onClick={() => setActiveTab('pedidos')}>Revisar pedidos</button>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'productos' ? (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ ...styles.card, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 28 }}>Productos</h3>
                    <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Filtra por categoria y abre solo el producto que quieres editar.</p>
                  </div>
                  <button type="button" style={styles.buttonPrimary} onClick={() => setShowProductForm((value) => !value)}>
                    <Plus size={18} />
                    {showProductForm ? 'Cerrar formulario' : 'Nuevo producto'}
                  </button>
                </div>

                {showProductForm ? (
                  <div style={{ marginTop: 18, borderTop: '1px solid #e5e7eb', paddingTop: 18 }}>
                    <ProductForm draft={newProductDraft} setDraft={setNewProductDraft} onSave={addProduct} onCancel={() => { setNewProductDraft(buildEmptyProduct()); setShowProductForm(false) }} loading={loading} saveLabel="Guardar producto" products={products} />
                  </div>
                ) : null}
              </div>

              <div style={{ ...styles.card, padding: 24 }}>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '1fr 220px 220px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 14 }} />
                    <input style={{ ...styles.input, paddingLeft: 36 }} value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} placeholder="Buscar producto, marca, fit o modelo" />
                  </div>
                  <select style={styles.input} value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)}>
                    {AUDIENCES.map((aud) => <option key={aud} value={aud}>{aud}</option>)}
                  </select>
                  <select style={styles.input} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="Todos">Todas las categorias</option>
                    {productCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  <button type="button" style={{ ...styles.buttonSecondary, background: categoryFilter === 'Todos' ? '#111315' : '#fff', color: categoryFilter === 'Todos' ? '#fff' : '#111315' }} onClick={() => setCategoryFilter('Todos')}>
                    Todos ({products.length})
                  </button>
                  {productCategories.map((category) => (
                    <button key={category} type="button" style={{ ...styles.buttonSecondary, background: categoryFilter === category ? '#111315' : '#fff', color: categoryFilter === category ? '#fff' : '#111315' }} onClick={() => setCategoryFilter(category)}>
                      {category} ({products.filter((product) => product.category === category).length})
                    </button>
                  ))}
                </div>
              </div>

              {groupedProducts.map((group) => (
                <div key={group.category} style={{ ...styles.card, padding: 24 }}>
                  <h3 style={{ marginTop: 0, fontSize: 24 }}>{group.category}</h3>
                  <div style={{ display: 'grid', gap: 14 }}>{group.items.map(renderProductCard)}</div>
                </div>
              ))}

              {filteredProducts.length === 0 ? (
                <div style={{ border: '1px dashed #d1d5db', borderRadius: 18, padding: 22, textAlign: 'center', color: '#6b7280' }}>
                  No hay productos con ese criterio.
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'clientes' ? (
            <SpecialClientsAdmin specialClients={specialClients} fetchSpecialClients={fetchSpecialClients} />
          ) : null}

          {activeTab === 'tarifas' ? (
            <SpecialPricingAdmin products={products} productTierPrices={productTierPrices} fetchTierPrices={fetchTierPrices} specialPriceRules={specialPriceRules} setSpecialPriceRules={setSpecialPriceRules} />
          ) : null}

          {activeTab === 'promociones' ? (
            <PromotionsAdmin products={products} fetchProducts={fetchProducts} />
          ) : null}

          {activeTab === 'pedidos' ? (
            <OrdersAdmin orders={orders} fetchOrders={fetchOrders} />
          ) : null}
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
              Aquí administrarás productos, precios y clientes especiales.
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
  const [products, setProducts] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const cached = localStorage.getItem(PRODUCTS_CACHE_KEY)
      const parsed = cached ? JSON.parse(cached) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [specialClients, setSpecialClients] = useState([])
  const [orders, setOrders] = useState([])
  const [productTierPrices, setProductTierPrices] = useState([])
  const [specialPriceRules, setSpecialPriceRules] = useState(() => {
    if (typeof window === 'undefined') return SPECIAL_PRICE_RULE_PRESETS
    try {
      const saved = localStorage.getItem(SPECIAL_PRICE_RULES_STORAGE_KEY)
      const parsed = saved ? JSON.parse(saved) : null
      return Array.isArray(parsed) && parsed.length ? parsed : SPECIAL_PRICE_RULE_PRESETS
    } catch {
      return SPECIAL_PRICE_RULE_PRESETS
    }
  })
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
  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [customer, setCustomer] = useState(emptyCustomer)

  const [gallery, setGallery] = useState({
    open: false,
    product: null,
    imageIndex: 0,
  })

  const [specialCode, setSpecialCode] = useState('')
  const [specialClientSession, setSpecialClientSession] = useState(null)

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_LIST_COLUMNS)
      .order('created_at', { ascending: false })
    if (error) {
      if (!products.length) alert(`No se pudieron leer los productos: ${error.message}`)
      return
    }
    const normalized = (data || []).map(normalizeProduct)
    setProducts(normalized)
    try {
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(normalized))
    } catch {
      // Keep live data even when browser storage is full.
    }
  }

  async function fetchProductImages(productId) {
    const { data, error } = await supabase
      .from('products')
      .select('id,images,images_json')
      .eq('id', productId)
      .single()
    if (error || !data) return []

    if (Array.isArray(data.images_json)) return data.images_json.filter(Boolean)
    if (typeof data.images_json === 'string' && data.images_json.trim()) {
      try {
        const parsed = JSON.parse(data.images_json)
        return Array.isArray(parsed) ? parsed.filter(Boolean) : []
      } catch {
        return data.images ? [data.images] : []
      }
    }
    return data.images ? [data.images] : []
  }

  async function fetchSpecialClients() {
    const { data, error } = await supabase.from('special_clients').select('*').order('created_at', { ascending: false })
    if (error) {
      alert(`No se pudieron leer clientes especiales: ${error.message}`)
      return
    }
    setSpecialClients(data || [])
  }

  async function fetchTierPrices() {
    const { data, error } = await supabase.from('product_customer_prices').select('*')
    if (error) {
      alert(`No se pudieron leer precios por categoría: ${error.message}`)
      return
    }
    setProductTierPrices(data || [])
  }

  async function fetchOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) {
      console.warn('No se pudieron leer pedidos:', error.message)
      setOrders([])
      return
    }
    setOrders(data || [])
  }

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (route === 'admin' && isAdminAuthenticated) {
      fetchProducts({ full: true })
      fetchSpecialClients()
      fetchTierPrices()
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, isAdminAuthenticated])

  useEffect(() => {
    if (specialClientSession?.active && productTierPrices.length === 0) {
      fetchTierPrices()
    }
  }, [specialClientSession, productTierPrices.length])

  useEffect(() => {
    try {
      localStorage.setItem(SPECIAL_PRICE_RULES_STORAGE_KEY, JSON.stringify(specialPriceRules))
    } catch {
      // Ignore storage quota issues.
    }
  }, [specialPriceRules])

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // Ignore storage quota issues.
    }
  }, [cart])

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_SESSION_KEY)
    if (saved === 'true') setIsAdminAuthenticated(true)

    const specialSaved = localStorage.getItem(SPECIAL_CLIENT_SESSION_KEY)
    if (specialSaved) {
      try {
        const parsed = JSON.parse(specialSaved)
        setSpecialClientSession(parsed)
      } catch {
        // Ignore invalid stored client sessions.
      }
    }
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
      products.map((p) => p.subcategory).filter((sub) => sub && !JEANS_FITS.includes(sub))
    )
  }, [products])

  const totalPieces = useMemo(() => getCartTotalPieces(cart), [cart])
  const tier = currentTier(totalPieces)

  const findTierPrice = (productId, clientTier) => {
    return productTierPrices.find((row) => row.product_id === productId && row.client_tier === clientTier)
  }

  const getCartUnitPrice = (product) => {
    const normalPrice = tier.key === 'price'
      ? getProductBasePrice(product)
      : Number(product[tier.key] || getProductBasePrice(product))

    if (specialClientSession?.active) {
      const tierName = specialClientSession.client_tier || ''
      const specialUnlocked = tierName !== 'Plata' || totalPieces >= 10
      if (specialUnlocked) {
        const specialPrice = getSpecialTierPrice(product, tierName, productTierPrices, specialPriceRules)
        if (specialPrice > 0) return specialPrice
        const row = findTierPrice(product.id, tierName)
        if (row) return Number(row.price || 0)
        return Number(product.price_tier10 || product.price_tier3 || normalPrice || 0)
      }
    }

    return normalPrice
  }

  const addToCart = (product) => {
    const selection = selectedConfig[product.id]
    if (!selection?.size || Number(selection.quantity || 0) <= 0) return false

    const stock = Number(product.stock?.[selection.size] || 0)
    if (Number(selection.quantity || 0) > stock) {
      alert('La cantidad supera el stock disponible.')
      return false
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (item) => !item.packageMode && item.product.id === product.id && item.size === selection.size
      )

      if (index >= 0) {
        const next = [...prev]
        const currentQty = Number(next[index].quantity || 0)
        const newQty = Math.min(stock, currentQty + Number(selection.quantity || 0))
        next[index] = { ...next[index], product, quantity: newQty }
        return next
      }

      return [...prev, { product, size: selection.size, quantity: Number(selection.quantity || 0), packageMode: false }]
    })

    setSelectedConfig((prev) => ({
      ...prev,
      [product.id]: {
        size: selection.size,
        quantity: 0,
      },
    }))

    return true
  }

  const addPackageToCart = (product, quantity = 1) => {
    const packageStock = Number(product.package_stock || 0)
    const cleanQty = Math.max(1, Math.min(Number(quantity || 1), packageStock))

    if (packageStock <= 0) {
      alert('Este producto no tiene paquetes cerrados disponibles.')
      return false
    }

    setCart((prev) => {
      const index = prev.findIndex((item) => item.packageMode && item.product.id === product.id)

      if (index >= 0) {
        const next = [...prev]
        const currentQty = Number(next[index].quantity || 0)
        next[index] = {
          ...next[index],
          product,
          quantity: Math.min(packageStock, currentQty + cleanQty),
          packagePieces: getPackagePieces(product),
        }
        return next
      }

      return [
        ...prev,
        {
          product,
          size: 'Paquete cerrado',
          quantity: cleanQty,
          packageMode: true,
          packagePieces: getPackagePieces(product),
        },
      ]
    })

    return true
  }

  const loginSpecialClient = async (rawCode) => {
    const code = String(rawCode || '').trim()
    if (!code) {
      alert('Escribe o escanea un codigo.')
      return false
    }

    const { data, error } = await supabase
      .from('special_clients')
      .select('*')
      .or(`client_code.eq.${code},qr_value.eq.${code}`)
      .eq('active', true)
      .limit(1)

    if (error) {
      alert(`No se pudo validar codigo: ${error.message}`)
      return false
    }

    if (!data || !data.length) {
      alert('Codigo no encontrado o inactivo.')
      return false
    }

    const client = data[0]
    setSpecialClientSession(client)
    localStorage.setItem(SPECIAL_CLIENT_SESSION_KEY, JSON.stringify(client))
    setSpecialCode('')
    return client
  }

  const logoutSpecialClient = () => {
    setSpecialClientSession(null)
    localStorage.removeItem(SPECIAL_CLIENT_SESSION_KEY)
  }

  const sendOrder = async () => {
    if (cart.length === 0) {
      alert('Agrega productos a la bolsa.')
      return
    }

    if (!customer.name.trim() || !customer.phone.trim()) {
      alert('Pon al menos nombre y telefono.')
      return
    }

    const phoneDigits = customer.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      alert('Numero de telefono invalido.')
      return
    }

    if (customer.delivery === 'envios') {
      if (!customer.receiver.trim() || !customer.receiver_phone.trim() || !customer.address.trim()) {
        alert('Completa nombre, telefono y direccion de envio.')
        return
      }
    }

    const orderNumber = generateOrderNumber()
    const subtotal = getCartSubtotal(cart, getCartUnitPrice)
    const shippingLabel =
      customer.delivery === 'envios'
        ? 'Envio por paqueteria'
        : customer.delivery === 'punto'
          ? 'Entrega en punto medio'
          : 'Recoge en sucursal'
    const totalFinal = subtotal
    const specialLabel = specialClientSession?.active
      ? 'Cliente ' + specialClientSession.client_tier
      : tier.label

    const shippingDetails =
      customer.delivery === 'envios'
        ? 'Recibe: ' + customer.receiver +
          ' | Tel: ' + customer.receiver_phone +
          ' | Direccion: ' + customer.address +
          ' | Referencia: ' + (customer.reference || '-')
        : shippingLabel

    const itemRows = cart.map((item) => ({
      product_id: item.product.id,
      name: item.product.name,
      size: item.size,
      quantity: item.quantity,
      package_mode: Boolean(item.packageMode),
      package_pieces: item.packageMode ? getPackagePieces(item.product) : null,
      pieces: getCartItemPieces(item),
      unit_price: getCartItemUnitPrice(item, getCartUnitPrice),
      total: getCartLineTotal(item, getCartUnitPrice),
      package_breakdown: item.packageMode ? item.product.package_breakdown || item.product.package_fit || '' : '',
      image: getCover(item.product),
    }))

    const noteParts = [
      'Numero pedido: ' + orderNumber,
      customer.notes ? 'Observacion cliente: ' + customer.notes : '',
      'Entrega: ' + shippingDetails,
      specialClientSession?.active
        ? 'Cliente especial: ' + specialClientSession.name + ' (' + specialClientSession.client_tier + ')'
        : '',
    ].filter(Boolean)

    const orderPayload = {
      customer_name: customer.name || '',
      customer_phone: phoneDigits,
      customer_city: customer.city || '',
      delivery: shippingLabel,
      notes: noteParts.join(' | '),
      items_json: itemRows,
      total_pieces: totalPieces,
      subtotal,
      price_level: specialLabel,
      status: 'nuevo',
      whatsapp_sent: true,
    }

    const itemsText = itemRows
      .map((item, idx) => {
        const detail = item.package_mode
          ? '   Paquete cerrado: ' + item.quantity + ' paquete(s) x ' + item.package_pieces + ' pz\n' +
            '   Corrida: ' + (item.package_breakdown || 'Por confirmar') + '\n'
          : '   Talla: ' + item.size + '\n' +
            '   Cantidad: ' + item.quantity + ' pz\n'

        return (
          (idx + 1) + '. ' + item.name + '\n' +
          detail +
          '   Piezas: ' + item.pieces + '\n' +
          '   Importe: ' + mxn(item.total)
        )
      })
      .join('\n\n')

    const shippingText =
      customer.delivery === 'envios'
        ? '\nDATOS DE ENVIO\n' +
          'Recibe: ' + customer.receiver + '\n' +
          'Telefono: ' + customer.receiver_phone + '\n' +
          'Direccion: ' + customer.address + '\n' +
          'Referencia: ' + (customer.reference || '-')
        : ''

    const clientText = specialClientSession?.active
      ? '\nCLIENTE ESPECIAL\n' +
        'Nombre: ' + specialClientSession.name + '\n' +
        'Codigo: ' + specialClientSession.client_code + '\n' +
        'Categoria: ' + specialClientSession.client_tier
      : ''

    const msg =
      'PEDIDO DENIM CLICK\n\n' +
      'Numero de pedido: ' + orderNumber + '\n' +
      'Cliente: ' + customer.name + '\n' +
      'Telefono: ' + customer.phone + '\n' +
      'Ciudad: ' + (customer.city || '-') + '\n' +
      'Tipo de entrega: ' + shippingLabel +
      shippingText +
      clientText +
      '\n\nPRODUCTOS SOLICITADOS\n' +
      itemsText +
      '\n\nTotal de piezas: ' + totalPieces + '\n' +
      'Monto total a pagar: ' + mxn(totalFinal) + '\n' +
      'Observacion del cliente: ' + (customer.notes || '-') + '\n\n' +
      'Solicito apartado y confirmacion de existencia.'

    const productUpdates = new Map()
    for (const item of cart) {
      const product = products.find((p) => p.id === item.product.id)
      if (!product) continue
      const entry = productUpdates.get(product.id) || {
        product,
        stock: { ...product.stock },
        package_stock: Number(product.package_stock || 0),
        sales_count: Number(product.sales_count || 0),
      }
      if (item.packageMode) {
        entry.package_stock = Math.max(0, entry.package_stock - Number(item.quantity || 0))
      } else {
        entry.stock[item.size] = Math.max(0, Number(entry.stock?.[item.size] || 0) - Number(item.quantity || 0))
      }
      entry.sales_count += getCartItemPieces(item)
      productUpdates.set(product.id, entry)
    }

    const link = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg)

    setLoading(true)
    setCart([])
    setCustomer(emptyCustomer)
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const entry = productUpdates.get(product.id)
        if (!entry) return product
        return {
          ...product,
          stock: entry.stock,
          stock_total: totalStock(entry.stock),
          package_stock: entry.package_stock,
          sales_count: entry.sales_count,
        }
      })
    )

    let opened = null
    try {
      opened = window.open(link, '_blank', 'noopener,noreferrer')
    } catch {
      opened = null
    }

    if (!opened) {
      window.location.assign(link)
    }

    setLoading(false)

    Promise.resolve()
      .then(async () => {
        const orderResult = await supabase.from('orders').insert([orderPayload])
        if (orderResult.error) throw orderResult.error

        const stockResults = await Promise.all(
          [...productUpdates.values()].map((entry) => {
            const payload = {
              stock_json: entry.stock,
              stock: totalStock(entry.stock),
              sales_count: entry.sales_count,
              description: composeProductDescription({ ...entry.product, package_stock: entry.package_stock }),
            }
            return supabase.from('products').update(payload).eq('id', entry.product.id)
          })
        )

        const stockError = stockResults.find((result) => result.error)?.error
        if (stockError) throw stockError

        fetchProducts()
        if (route === 'admin' && isAdminAuthenticated) fetchOrders()
      })
      .catch((error) => {
        console.error('WhatsApp abierto, pero fallo el guardado en Supabase:', error)
      })
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
          addPackageToCart={addPackageToCart}
          cart={cart}
          setCart={setCart}
          customer={customer}
          setCustomer={setCustomer}
          sendOrder={sendOrder}
          orderLoading={loading}
          gallery={gallery}
          setGallery={setGallery}
          specialClientSession={specialClientSession}
          specialCode={specialCode}
          setSpecialCode={setSpecialCode}
          loginSpecialClient={loginSpecialClient}
          logoutSpecialClient={logoutSpecialClient}
          getCartUnitPrice={getCartUnitPrice}
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
                <DenimClickLogo variant="light" size="sm" />
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
            setProducts={setProducts}
            fetchProductImages={fetchProductImages}
            fetchProducts={fetchProducts}
            loading={loading}
            setLoading={setLoading}
            specialClients={specialClients}
            fetchSpecialClients={fetchSpecialClients}
            productTierPrices={productTierPrices}
            fetchTierPrices={fetchTierPrices}
            specialPriceRules={specialPriceRules}
            setSpecialPriceRules={setSpecialPriceRules}
            orders={orders}
            fetchOrders={fetchOrders}
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
