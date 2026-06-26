import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  Menu,
  X,
  ChevronLeft,
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
const PRODUCTS_CACHE_KEY = 'denimclick_products_cache_v5'
const SPECIAL_PRICE_RULES_STORAGE_KEY = 'denimclick_special_price_rules_v5'
const PRODUCT_PAGE_SIZE_DESKTOP = 24
const PRODUCT_PAGE_SIZE_MOBILE = 12
const NEW_PRODUCT_DAYS = 7
const PUBLIC_PRICE_SINGLE_MARKUP = 200
const PUBLIC_PRICE_TIER3_MARKUP = 100
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
const CLIENT_TIERS = ['Plata', 'Oro', 'Esmeralda', 'Platino', 'Diamante', 'Colaborador', 'Imperial']

const CLIENT_PRICE_OVERRIDES = [
  {
    id: 'alejandro-bandera-606-levis-jeans',
    client_code: '606',
    client_name: 'Alejandro Bandera',
    brand: 'Levi',
    audience: 'Hombre,Dama',
    category: 'Jeans',
    price: 239,
  },
]

const QUALITY_PRICE_PRESETS = [
  { quality: 'JEANS LINEA', group: 'PANTALON', prices: { Plata: 285, Oro: 275, Esmeralda: 265, Platino: 255, Diamante: 245, Colaborador: 275, Imperial: 0 }, retail: { offer_price: 249, price_tier10: 289, price_tier3: 310, price: 350 } },
  { quality: 'JEANS PREMIUM', group: 'PANTALON', prices: { Plata: 305, Oro: 299, Esmeralda: 299, Platino: 299, Diamante: 299, Colaborador: 299, Imperial: 0 }, retail: { offer_price: 259, price_tier10: 315, price_tier3: 325, price: 350 } },
  { quality: 'BASICO', group: 'PANTALON', prices: { Plata: 255, Oro: 245, Esmeralda: 235, Platino: 225, Diamante: 215, Colaborador: 245, Imperial: 0 }, retail: { offer_price: 219, price_tier10: 259, price_tier3: 280, price: 320 } },
  { quality: 'JEANS DELUX', group: 'PANTALON', prices: { Plata: 355, Oro: 355, Esmeralda: 350, Platino: 350, Diamante: 350, Colaborador: 350, Imperial: 0 }, retail: { offer_price: 320, price_tier10: 360, price_tier3: 399, price: 450 } },
  { quality: 'C DLX PRO', group: 'PANTALON', prices: { Plata: 355, Oro: 355, Esmeralda: 350, Platino: 350, Diamante: 350, Colaborador: 350, Imperial: 0 }, retail: { offer_price: 320, price_tier10: 360, price_tier3: 399, price: 450 } },
  { quality: 'C PRIME', group: 'PANTALON', prices: { Plata: 355, Oro: 355, Esmeralda: 350, Platino: 350, Diamante: 350, Colaborador: 350, Imperial: 0 }, retail: { offer_price: 320, price_tier10: 360, price_tier3: 399, price: 450 } },
  { quality: 'D PRIME', group: 'PANTALON', prices: { Plata: 355, Oro: 355, Esmeralda: 350, Platino: 350, Diamante: 350, Colaborador: 350, Imperial: 0 }, retail: { offer_price: 320, price_tier10: 360, price_tier3: 399, price: 450 } },
  { quality: 'KID', group: 'PANTALON', prices: { Plata: 235, Oro: 230, Esmeralda: 230, Platino: 225, Diamante: 225, Colaborador: 230, Imperial: 0 }, retail: { offer_price: 189, price_tier10: 245, price_tier3: 275, price: 289 } },
  { quality: 'SHORT CABALLERO', group: 'PANTALON', prices: { Plata: 239, Oro: 235, Esmeralda: 235, Platino: 229, Diamante: 229, Colaborador: 235, Imperial: 0 }, retail: { offer_price: 199, price_tier10: 249, price_tier3: 275, price: 289 } },
  { quality: 'SHORT MARCAS', group: 'PANTALON', prices: { Plata: 255, Oro: 250, Esmeralda: 250, Platino: 250, Diamante: 250, Colaborador: 250, Imperial: 0 }, retail: { offer_price: 220, price_tier10: 259, price_tier3: 279, price: 299 } },
  { quality: 'SHORT DAMA', group: 'PANTALON', prices: { Plata: 199, Oro: 199, Esmeralda: 199, Platino: 199, Diamante: 199, Colaborador: 199, Imperial: 0 }, retail: { offer_price: 199, price_tier10: 199, price_tier3: 199, price: 199 } },
  { quality: 'W', group: 'PANTALON', prices: { Plata: 249, Oro: 249, Esmeralda: 249, Platino: 249, Diamante: 249, Colaborador: 249, Imperial: 0 }, retail: { offer_price: 199, price_tier10: 255, price_tier3: 265, price: 279 } },
  { quality: 'W STRAIGHT', group: 'PANTALON', prices: { Plata: 279, Oro: 275, Esmeralda: 275, Platino: 265, Diamante: 265, Colaborador: 275, Imperial: 0 }, retail: { offer_price: 249, price_tier10: 289, price_tier3: 299, price: 320 } },
  { quality: 'COLOMBIANO', group: 'PANTALON', prices: { Plata: 299, Oro: 299, Esmeralda: 299, Platino: 299, Diamante: 299, Colaborador: 299, Imperial: 0 }, retail: { offer_price: 269, price_tier10: 299, price_tier3: 299, price: 320 } },
  { quality: 'DC', group: 'PANTALON', prices: { Plata: 350, Oro: 350, Esmeralda: 350, Platino: 350, Diamante: 350, Colaborador: 350, Imperial: 0 }, retail: { offer_price: 299, price_tier10: 350, price_tier3: 365, price: 370 } },
  { quality: 'AM&CO', group: 'PANTALON', prices: { Plata: 320, Oro: 320, Esmeralda: 320, Platino: 320, Diamante: 320, Colaborador: 320, Imperial: 0 }, retail: { offer_price: 299, price_tier10: 320, price_tier3: 329, price: 350 } },
  { quality: 'L REMATE', group: 'PANTALON', prices: { Plata: 205, Oro: 205, Esmeralda: 205, Platino: 205, Diamante: 205, Colaborador: 205, Imperial: 0 }, retail: { offer_price: 205, price_tier10: 209, price_tier3: 209, price: 209 } },
  { quality: 'PY L', group: 'PLAYERAS', prices: { Plata: 150, Oro: 145, Esmeralda: 145, Platino: 145, Diamante: 145, Colaborador: 145, Imperial: 0 }, retail: { offer_price: 99, price_tier10: 150, price_tier3: 160, price: 180 } },
  { quality: 'PYP', group: 'PLAYERAS', prices: { Plata: 175, Oro: 175, Esmeralda: 175, Platino: 159, Diamante: 159, Colaborador: 175, Imperial: 0 }, retail: { offer_price: 139, price_tier10: 185, price_tier3: 220, price: 250 } },
  { quality: 'PY DLX', group: 'PLAYERAS', prices: { Plata: 215, Oro: 215, Esmeralda: 215, Platino: 215, Diamante: 215, Colaborador: 215, Imperial: 0 }, retail: { offer_price: 199, price_tier10: 230, price_tier3: 239, price: 250 } },
  { quality: 'PY ML', group: 'PLAYERAS', prices: { Plata: 210, Oro: 195, Esmeralda: 195, Platino: 185, Diamante: 185, Colaborador: 195, Imperial: 0 }, retail: { offer_price: 185, price_tier10: 210, price_tier3: 220, price: 250 } },
  { quality: 'PY OVER', group: 'PLAYERAS', prices: { Plata: 250, Oro: 240, Esmeralda: 240, Platino: 240, Diamante: 240, Colaborador: 240, Imperial: 0 }, retail: { offer_price: 199, price_tier10: 250, price_tier3: 275, price: 299 } },
  { quality: 'PY ML W', group: 'PLAYERAS', prices: { Plata: 179, Oro: 175, Esmeralda: 175, Platino: 159, Diamante: 159, Colaborador: 175, Imperial: 0 }, retail: { offer_price: 139, price_tier10: 185, price_tier3: 239, price: 249 } },
  { quality: 'PLAYERA TIPO SUETER', group: 'PLAYERAS', prices: { Plata: 290, Oro: 290, Esmeralda: 290, Platino: 290, Diamante: 290, Colaborador: 290, Imperial: 0 }, retail: { offer_price: 290, price_tier10: 290, price_tier3: 299, price: 499 } },
  { quality: 'PIMA', group: 'PLAYERAS', prices: { Plata: 185, Oro: 185, Esmeralda: 185, Platino: 185, Diamante: 185, Colaborador: 185, Imperial: 0 }, retail: { offer_price: 185, price_tier10: 185, price_tier3: 199, price: 220 } },
  { quality: 'PYPIMA', group: 'PLAYERAS', prices: { Plata: 185, Oro: 185, Esmeralda: 185, Platino: 185, Diamante: 185, Colaborador: 185, Imperial: 0 }, retail: { offer_price: 185, price_tier10: 185, price_tier3: 199, price: 220 } },
  { quality: 'PY KID', group: 'PLAYERAS', prices: { Plata: 145, Oro: 140, Esmeralda: 140, Platino: 140, Diamante: 140, Colaborador: 140, Imperial: 0 }, retail: { offer_price: 99, price_tier10: 145, price_tier3: 165, price: 175 } },
  { quality: 'POLO', group: 'POLOS,CAMISAS,SUDADERAS', prices: { Plata: 215, Oro: 195, Esmeralda: 195, Platino: 189, Diamante: 189, Colaborador: 195, Imperial: 0 }, retail: { offer_price: 155, price_tier10: 219, price_tier3: 239, price: 250 } },
  { quality: 'POLO DELUX', group: 'POLOS,CAMISAS,SUDADERAS', prices: { Plata: 299, Oro: 299, Esmeralda: 299, Platino: 299, Diamante: 299, Colaborador: 299, Imperial: 0 }, retail: { offer_price: 299, price_tier10: 299, price_tier3: 320, price: 350 } },
  { quality: 'CAM', group: 'POLOS,CAMISAS,SUDADERAS', prices: { Plata: 279, Oro: 275, Esmeralda: 275, Platino: 269, Diamante: 269, Colaborador: 275, Imperial: 0 }, retail: { offer_price: 239, price_tier10: 285, price_tier3: 289, price: 299 } },
  { quality: 'CAM OAKTREE', group: 'POLOS,CAMISAS,SUDADERAS', prices: { Plata: 289, Oro: 289, Esmeralda: 289, Platino: 289, Diamante: 289, Colaborador: 289, Imperial: 0 }, retail: { offer_price: 239, price_tier10: 289, price_tier3: 299, price: 320 } },
  { quality: 'CAMISA P', group: 'POLOS,CAMISAS,SUDADERAS', prices: { Plata: 359, Oro: 359, Esmeralda: 359, Platino: 359, Diamante: 359, Colaborador: 359, Imperial: 0 }, retail: { offer_price: 359, price_tier10: 359, price_tier3: 375, price: 399 } },
  { quality: 'SUD', group: 'POLOS,CAMISAS,SUDADERAS', prices: { Plata: 355, Oro: 355, Esmeralda: 355, Platino: 355, Diamante: 355, Colaborador: 355, Imperial: 0 }, retail: { offer_price: 299, price_tier10: 355, price_tier3: 375, price: 399 } },
  { quality: 'SUETER', group: 'POLOS,CAMISAS,SUDADERAS', prices: { Plata: 320, Oro: 310, Esmeralda: 310, Platino: 299, Diamante: 299, Colaborador: 310, Imperial: 0 }, retail: { offer_price: 299, price_tier10: 320, price_tier3: 330, price: 350 } },
  { quality: 'CHM L', group: 'CHAMARRAS', prices: { Plata: 520, Oro: 515, Esmeralda: 515, Platino: 509, Diamante: 509, Colaborador: 515, Imperial: 0 }, retail: { offer_price: 399, price_tier10: 525, price_tier3: 550, price: 599 } },
  { quality: 'CHM CAP L', group: 'CHAMARRAS', prices: { Plata: 450, Oro: 450, Esmeralda: 450, Platino: 450, Diamante: 450, Colaborador: 450, Imperial: 0 }, retail: { offer_price: 399, price_tier10: 450, price_tier3: 489, price: 499 } },
  { quality: 'CHM CAP P', group: 'CHAMARRAS', prices: { Plata: 550, Oro: 550, Esmeralda: 550, Platino: 550, Diamante: 550, Colaborador: 550, Imperial: 0 }, retail: { offer_price: 499, price_tier10: 550, price_tier3: 589, price: 599 } },
  { quality: 'CHM NFL P', group: 'CHAMARRAS', prices: { Plata: 550, Oro: 550, Esmeralda: 550, Platino: 550, Diamante: 550, Colaborador: 550, Imperial: 0 }, retail: { offer_price: 499, price_tier10: 550, price_tier3: 589, price: 599 } },
  { quality: 'CHM CAP DLX', group: 'CHAMARRAS', prices: { Plata: 650, Oro: 650, Esmeralda: 650, Platino: 650, Diamante: 650, Colaborador: 650, Imperial: 0 }, retail: { offer_price: 599, price_tier10: 650, price_tier3: 689, price: 699 } },
  { quality: 'CHM NFL DLX', group: 'CHAMARRAS', prices: { Plata: 650, Oro: 650, Esmeralda: 650, Platino: 650, Diamante: 650, Colaborador: 650, Imperial: 0 }, retail: { offer_price: 599, price_tier10: 650, price_tier3: 689, price: 699 } },
  { quality: 'BLS', group: 'ACCESORIOS', prices: { Plata: 79, Oro: 69, Esmeralda: 69, Platino: 69, Diamante: 69, Colaborador: 69, Imperial: 0 }, retail: { offer_price: 69, price_tier10: 79, price_tier3: 89, price: 99 } },
  { quality: 'MONEDEROS', group: 'ACCESORIOS', prices: { Plata: 199, Oro: 199, Esmeralda: 199, Platino: 199, Diamante: 199, Colaborador: 199, Imperial: 0 }, retail: { offer_price: 99, price_tier10: 199, price_tier3: 220, price: 250 } },
  { quality: 'BOLSAS LINEA', group: 'ACCESORIOS', prices: { Plata: 299, Oro: 299, Esmeralda: 299, Platino: 299, Diamante: 299, Colaborador: 299, Imperial: 0 }, retail: { offer_price: 199, price_tier10: 299, price_tier3: 320, price: 350 } },
  { quality: 'BOLSAS PREMIUN', group: 'ACCESORIOS', prices: { Plata: 399, Oro: 399, Esmeralda: 399, Platino: 399, Diamante: 399, Colaborador: 399, Imperial: 0 }, retail: { offer_price: 299, price_tier10: 399, price_tier3: 420, price: 450 } },
  { quality: 'BOLSAS DELUXE', group: 'ACCESORIOS', prices: { Plata: 499, Oro: 499, Esmeralda: 499, Platino: 499, Diamante: 499, Colaborador: 499, Imperial: 0 }, retail: { offer_price: 399, price_tier10: 499, price_tier3: 520, price: 550 } },
]

const BRAND_SPECIAL_PRICE_RULE_PRESETS = [
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
    id: 'boss-jeans',
    label: 'Boss jeans dama/caballero',
    brand: 'Boss',
    audience: 'Hombre,Dama',
    category: 'Jeans',
    exclude_text: '',
    prices: {
      Plata: 355,
      Oro: 355,
      Esmeralda: 350,
      Platino: 350,
      Diamante: 350,
      Imperial: 0,
    },
  },
  {
    id: 'ck-mk-jeans',
    label: 'CK y MK jeans dama/caballero',
    brand: 'CK,MK',
    audience: 'Hombre,Dama',
    category: 'Jeans',
    exclude_text: '',
    prices: {
      Plata: 305,
      Oro: 299,
      Esmeralda: 299,
      Platino: 299,
      Diamante: 299,
      Imperial: 0,
    },
  },
  {
    id: 'american-eagle-jeans',
    label: 'American Eagle jeans dama/caballero',
    brand: 'American Eagle',
    audience: 'Hombre,Dama',
    category: 'Jeans',
    exclude_text: '',
    prices: {
      Plata: 355,
      Oro: 355,
      Esmeralda: 350,
      Platino: 350,
      Diamante: 350,
      Imperial: 0,
    },
  },
  {
    id: 'playeras-todas',
    label: 'Playeras todas las marcas dama/caballero',
    brand: 'Todas',
    audience: 'Hombre,Dama',
    category: 'Playeras',
    exclude_text: '',
    prices: {
      Plata: 175,
      Oro: 175,
      Esmeralda: 175,
      Platino: 159,
      Diamante: 159,
      Imperial: 0,
    },
  },
  {
    id: 'sudaderas-todas',
    label: 'Sudaderas todas las marcas dama/caballero',
    brand: 'Todas',
    audience: 'Hombre,Dama',
    category: 'Sudaderas',
    exclude_text: '',
    prices: {
      Plata: 355,
      Oro: 355,
      Esmeralda: 355,
      Platino: 355,
      Diamante: 355,
      Imperial: 0,
    },
  },
]

function fillClientTierPrices(prices = {}) {
  return Object.fromEntries(CLIENT_TIERS.map((tier) => [tier, Number(prices[tier] || 0)]))
}

const SPECIAL_PRICE_RULE_PRESETS = [
  ...QUALITY_PRICE_PRESETS.map((preset) => ({
    id: 'quality-' + normalizeRuleText(preset.quality).replace(/\s+/g, '-'),
    label: preset.quality + ' por calidad',
    brand: 'Todas',
    quality: preset.quality,
    audience: 'Todo',
    category: '',
    exclude_text: '',
    prices: fillClientTierPrices(preset.prices),
  })),
  ...BRAND_SPECIAL_PRICE_RULE_PRESETS.map((rule) => ({
    ...rule,
    prices: fillClientTierPrices(rule.prices),
  })),
]

const BASE_CATEGORY_MAP = {
  Hombre: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Polo', 'Camisas', 'Suéter'],
  Dama: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Suéter'],
  Niño: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Suéter'],
  Accesorios: ['Accesorios'],
  Oferta: ['Jeans', 'Playeras', 'Sudaderas', 'Chamarras', 'Shorts', 'Polo', 'Camisas', 'Suéter', 'Accesorios'],
}

const JEANS_FITS = ['Straight', 'Slim', 'Skinny', 'Regular', 'Relaxed', 'Baggy']

const QUALITY_OPTIONS = QUALITY_PRICE_PRESETS.map((preset) => preset.quality)
const QUALITY_SELECT_BLOCKLIST = new Set(['JEANS PREMIUM TOMMY', 'JEANS DLX', 'C DLX', 'JEANS BASICO 514', 'PYDLX', 'PDLX'])

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
  { value: 'entrega_inmediata', label: 'Compra/entrega inmediata', color: '#9a3412', bg: '#ffedd5' },
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
  { key: 'rankingTallas', label: 'Ranking tallas' },
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

function productHasVisibleStock(product) {
  return product?.active !== false && (totalStock(product.stock) > 0 || Number(product.package_stock || 0) > 0)
}

function productMatchesStoreAudience(product, audience) {
  if (audience === 'Todo') return true
  if (audience === 'Oferta') return Boolean(product?.is_offer)
  return product?.audience === audience
}

function getStoreAudiences(products) {
  const activeAudiences = uniqueValues(
    products
      .filter(productHasVisibleStock)
      .map((product) => product.audience)
  )
  const ordered = ['Hombre', 'Dama', 'Niño', 'Accesorios'].filter((audience) => activeAudiences.includes(audience))
  const hasOffers = products.some((product) => productHasVisibleStock(product) && product.is_offer)
  return hasOffers ? [...ordered, 'Oferta'] : ordered
}

function getStoreCategories(products, audience) {
  return uniqueValues(
    products
      .filter(productHasVisibleStock)
      .filter((product) => productMatchesStoreAudience(product, audience))
      .map((product) => product.category)
  ).filter((category) => category !== 'Playera')
}

function getStoreBrands(products, audience) {
  return uniqueValues(
    products
      .filter(productHasVisibleStock)
      .filter((product) => productMatchesStoreAudience(product, audience))
      .map((product) => product.brand)
  )
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

function getQualityPricePreset(quality) {
  const normalizedQuality = normalizeQualityText(quality)
  if (!normalizedQuality) return null
  return QUALITY_PRICE_PRESETS.find((preset) => normalizeQualityText(preset.quality) === normalizedQuality) || null
}

function getPublicPricingFromRetail(retail = {}) {
  const tier10 = Number(retail.price_tier10 || retail.special_price || retail.price_tier3 || retail.price || 0)
  if (!tier10) {
    return {
      price: Number(retail.price || 0),
      price_tier3: Number(retail.price_tier3 || retail.price || 0),
      price_tier10: 0,
      special_price: 0,
    }
  }

  return {
    price: tier10 + PUBLIC_PRICE_SINGLE_MARKUP,
    price_tier3: tier10 + PUBLIC_PRICE_TIER3_MARKUP,
    price_tier10: tier10,
    special_price: tier10,
  }
}

function getQualityDefaultPricing(quality) {
  const preset = getQualityPricePreset(quality)
  if (!preset) return null
  return getPublicPricingFromRetail(preset.retail)
}

function getDefaultProductPricing(audience, category, current = {}) {
  const qualityPricing = getQualityDefaultPricing(current.customQuality?.trim() || current.quality)
  if (qualityPricing) return qualityPricing

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

function normalizeQualityText(value) {
  const normalized = normalizeRuleText(value)
  const aliases = {
    'c dlx': 'jeans delux',
    'jeans dlx': 'jeans delux',
    'jeans delux': 'jeans delux',
    'jeans deluxe': 'jeans delux',
    'bolsas premium': 'bolsas premiun',
    'bolsas premiun': 'bolsas premiun',
  }
  return aliases[normalized] || normalized
}

function productMatchesSpecialRule(product, rule) {
  if (!product || !rule) return false
  const audiences = normalizeMetaList(rule.audience || 'Todo')
  const audienceOk =
    audiences.length === 0 ||
    audiences.includes('Todo') ||
    audiences.some((audience) => normalizeRuleText(audience) === normalizeRuleText(product.audience))
  const categoryOk = !rule.category || normalizeRuleText(rule.category) === normalizeRuleText(product.category)
  const brands = normalizeMetaList(rule.brand || 'Todas')
  const brandOk =
    brands.length === 0 ||
    brands.some((brand) => {
      const normalizedBrand = normalizeRuleText(brand)
      return (
        normalizedBrand === 'todas' ||
        normalizedBrand === 'todos' ||
        normalizeRuleText(product.brand).includes(normalizedBrand)
      )
    })
  const qualities = normalizeMetaList(rule.quality || 'Todas')
  const qualityOk =
    qualities.length === 0 ||
    qualities.some((quality) => {
      const normalizedQuality = normalizeQualityText(quality)
      const productQuality = normalizeQualityText(product.quality)
      return (
        normalizedQuality === 'todas' ||
        normalizedQuality === 'todos' ||
        (productQuality && productQuality === normalizedQuality)
      )
    })
  const combinedText = normalizeRuleText(product.name + ' ' + product.category + ' ' + product.subcategory + ' ' + product.brand + ' ' + (product.quality || ''))
  const excludeOk = !rule.exclude_text || !combinedText.includes(normalizeRuleText(rule.exclude_text))
  return audienceOk && categoryOk && brandOk && qualityOk && excludeOk
}

function clientMatchesPriceOverride(client, override) {
  if (!client || !override) return false
  const clientCode = normalizeRuleText(client.client_code || client.qr_value || '')
  const overrideCode = normalizeRuleText(override.client_code || '')
  const clientName = normalizeRuleText(client.name || '')
  const overrideName = normalizeRuleText(override.client_name || '')
  const codeMatches = Boolean(overrideCode && clientCode === overrideCode)
  const nameMatches = Boolean(overrideName && clientName.includes(overrideName))
  return codeMatches || nameMatches
}

function getClientProductPriceOverride(product, client) {
  if (!product || !client?.active) return 0
  const override = CLIENT_PRICE_OVERRIDES.find((item) => (
    clientMatchesPriceOverride(client, item) && productMatchesSpecialRule(product, item)
  ))
  return Number(override?.price || 0)
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

function orderIsImmediate(order) {
  return order?.status === 'entrega_inmediata' || String(order?.notes || '').toLowerCase().includes('entrega inmediata')
}

function getClientCartStorageKey(client) {
  if (!client?.active) return ''
  const rawKey = client.client_code || client.qr_value || client.phone || client.name || client.id
  const key = String(rawKey || '').trim().toLowerCase().replace(/\s+/g, '-')
  return key ? `${CART_STORAGE_KEY}_${key}` : ''
}

function readClientCart(client) {
  if (typeof window === 'undefined') return []
  const key = getClientCartStorageKey(client)
  if (!key) return []
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveClientCart(client, cart) {
  if (typeof window === 'undefined') return
  const key = getClientCartStorageKey(client)
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(Array.isArray(cart) ? cart : []))
  } catch {
    // Ignore storage quota issues.
  }
}

function getOrderItemQuantity(item) {
  return Math.max(0, Number(item?.quantity || 0))
}

function getOrderItemPieces(item) {
  return Math.max(0, Number(item?.pieces || item?.quantity || 0))
}

function getScaledOrderItem(item, quantity) {
  const originalQuantity = Math.max(1, getOrderItemQuantity(item))
  const nextQuantity = Math.max(0, Math.min(Number(quantity || 0), originalQuantity))
  const ratio = nextQuantity / originalQuantity
  const originalPieces = getOrderItemPieces(item)
  const originalTotal = Number(item?.total || 0)
  return {
    ...item,
    quantity: nextQuantity,
    pieces: Math.round(originalPieces * ratio),
    total: Math.round(originalTotal * ratio),
  }
}

function summarizeOrderItems(items) {
  return normalizeOrderItems(items).reduce(
    (summary, item) => ({
      pieces: summary.pieces + getOrderItemPieces(item),
      subtotal: summary.subtotal + Number(item.total || 0),
    }),
    { pieces: 0, subtotal: 0 }
  )
}

function getOrderItemProductId(item) {
  return item?.product_id || item?.product?.id || item?.id || ''
}

function parsePackageSizeCounts(text, multiplier = 1) {
  const counts = new Map()
  String(text || '')
    .replace(/[,\n;/]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .forEach((token) => {
      let size = ''
      let qty = 1
      const countFirst = token.match(/^(\d+)\s*[-xX]\s*([A-Za-z0-9]+)$/)
      const sizeFirst = token.match(/^([A-Za-z0-9]+)\s*[-xX]\s*(\d+)$/)
      if (countFirst) {
        qty = Number(countFirst[1] || 1)
        size = countFirst[2]
      } else if (sizeFirst) {
        size = sizeFirst[1]
        qty = Number(sizeFirst[2] || 1)
      } else if (!/^\d+$/.test(token)) {
        size = token
      }
      if (!size) return
      const cleanSize = size.toUpperCase()
      counts.set(cleanSize, (counts.get(cleanSize) || 0) + qty * Math.max(1, Number(multiplier || 1)))
    })
  return counts
}

function normalizePackageSizeLabel(value) {
  const raw = String(value || '').trim().toUpperCase()
  if (!raw) return ''
  const countFirst = raw.match(/^\d+\s*[-xX]\s*([A-Z0-9]+)$/)
  if (countFirst) return countFirst[1]
  const sizeFirst = raw.match(/^([A-Z0-9]+)\s*[-xX]\s*\d+$/)
  if (sizeFirst) return sizeFirst[1]
  return raw
}

function packageCountsToText(counts) {
  const entries = counts instanceof Map ? [...counts.entries()] : Object.entries(counts || {})
  return entries
    .filter(([, qty]) => Number(qty || 0) > 0)
    .map(([size, qty]) => Number(qty || 0) + '-' + String(size).toUpperCase())
    .join(' ')
}

function countsTotal(counts) {
  const entries = counts instanceof Map ? [...counts.values()] : Object.values(counts || {})
  return entries.reduce((sum, qty) => sum + Number(qty || 0), 0)
}

function filterCountsToProductSizes(counts, product) {
  const allowedSizes = new Set((product?.sizes || []).map(normalizePackageSizeLabel).filter(Boolean))
  if (!allowedSizes.size) return counts
  const filtered = new Map()
  counts.forEach((qty, size) => {
    const cleanSize = normalizePackageSizeLabel(size)
    if (allowedSizes.has(cleanSize) && Number(qty || 0) > 0) filtered.set(cleanSize, Number(qty || 0))
  })
  return filtered
}

function buildPackageSelectionStock(product, packageQty = 1) {
  const sources = [product?.package_breakdown, product?.package_fit].filter(Boolean)
  for (const source of sources) {
    const counts = filterCountsToProductSizes(parsePackageSizeCounts(source, packageQty), product)
    if (counts.size > 0) return counts
  }
  return new Map((product?.sizes || []).map((size) => [normalizePackageSizeLabel(size), 0]).filter(([size]) => Boolean(size)))
}

function mergeProductSizes(product, stock = product?.stock || {}) {
  const sizes = new Set((product?.sizes || []).map(normalizePackageSizeLabel).filter(Boolean))
  Object.entries(stock || {}).forEach(([size, qty]) => {
    const cleanSize = normalizePackageSizeLabel(size)
    if (cleanSize && Number(qty || 0) > 0) sizes.add(cleanSize)
  })
  return [...sizes]
}

function normalizeStockBySize(stock = {}) {
  return Object.entries(stock || {}).reduce((next, [size, qty]) => {
    const cleanSize = normalizePackageSizeLabel(size)
    if (!cleanSize) return next
    next[cleanSize] = Number(next[cleanSize] || 0) + Number(qty || 0)
    return next
  }, {})
}

async function restoreOrderStock(order) {
  const items = normalizeOrderItems(order?.items_json)
  const productIds = uniqueValues(items.map(getOrderItemProductId).filter(Boolean).map(String))
  if (!productIds.length) return

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_COLUMNS)
    .in('id', productIds)

  if (error) throw error

  const latestProducts = new Map((data || []).map((row) => {
    const product = normalizeProduct(row)
    return [String(product.id), product]
  }))
  const updates = new Map()

  items.forEach((item) => {
    const productId = String(getOrderItemProductId(item))
    const product = latestProducts.get(productId)
    if (!product) return
    const entry = updates.get(productId) || {
      product,
      stock: { ...product.stock },
      package_stock: Number(product.package_stock || 0),
      sales_count: Number(product.sales_count || 0),
    }
    const quantity = Number(item.quantity || 0)
    if (quantity <= 0) return

    if (item.package_partial || item.packagePartial) {
      const selectedStock = item.selected_stock || item.selectedStock || {}
      Object.entries(selectedStock).forEach(([size, qty]) => {
        const cleanSize = String(size || '').trim().toUpperCase()
        if (!cleanSize) return
        entry.stock[cleanSize] = Number(entry.stock?.[cleanSize] || 0) + Number(qty || 0)
      })
      entry.sales_count = Math.max(0, entry.sales_count - Number(item.pieces || quantity || 0))
    } else if (item.package_mode || item.packageMode) {
      entry.package_stock += quantity
      entry.sales_count = Math.max(0, entry.sales_count - Number(item.pieces || getPackagePieces(product) * quantity || 0))
    } else {
      const size = String(item.size || '').trim()
      if (size) entry.stock[size] = Number(entry.stock?.[size] || 0) + quantity
      entry.sales_count = Math.max(0, entry.sales_count - quantity)
    }
    updates.set(productId, entry)
  })

  const results = await Promise.all(
    [...updates.values()].map((entry) => {
      const nextProduct = {
        ...entry.product,
        stock: entry.stock,
        package_stock: entry.package_stock,
        sales_count: entry.sales_count,
      }
      const hasAnyStock = totalStock(entry.stock) > 0 || entry.package_stock > 0
      return supabase
        .from('products')
        .update({
          sizes: mergeProductSizes(entry.product, entry.stock).join(','),
          stock_json: entry.stock,
          stock: totalStock(entry.stock),
          sales_count: entry.sales_count,
          active: hasAnyStock,
          description: composeProductDescription(nextProduct),
        })
        .eq('id', entry.product.id)
    })
  )

  const restoreError = results.find((result) => result.error)?.error
  if (restoreError) throw restoreError
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

function productHasOnlyOneImage(product) {
  const images = Array.isArray(product?.images)
    ? product.images
    : product?.images
      ? [product.images]
      : []
  const uniqueImages = new Set(
    images
      .map((image) => String(image || '').trim())
      .filter(Boolean)
  )
  return uniqueImages.size <= 1
}

function isLastUnitsProduct(product) {
  if (Number(product?.package_stock || 0) > 0) return false
  const stockEntries = Object.entries(product?.stock || {}).filter(([, qty]) => Number(qty || 0) > 0)
  const loosePieces = totalStock(product?.stock)
  if (loosePieces <= 0) return false
  return loosePieces < 5 && stockEntries.length < 4
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
    quality: product.customQuality?.trim() || product.quality || '',
    model_po: product.model_po || '',
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
    Boolean(meta.quality) ||
    Boolean(meta.model_po) ||
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
  return Number(product?.price_tier10 || product?.special_price || product?.price || 0)
}

function getCartItemPieces(item) {
  if (item?.packageMode) {
    return getPackagePieces(item.product) * Number(item.quantity || 0)
  }
  return Number(item?.quantity || 0)
}

function getCartItemMaxQuantity(item) {
  if (item?.packageMode) {
    return Number(item.quantity || 0) + Number(item.product?.package_stock || 0)
  }
  if (item?.packagePartial) {
    return Number(item.quantity || 0)
  }
  return Number(item.quantity || 0) + Number(item.product?.stock?.[item.size] || 0)
}

function getCartItemUnitPrice(item, getProductUnitPrice) {
  if (Number(item?.unitPriceOverride || 0) > 0) return Number(item.unitPriceOverride)
  if (item?.packageMode) return getProductUnitPrice(item.product)
  return getProductUnitPrice(item.product)
}

function getCartItemStockMap(item, quantity = Number(item?.quantity || 0)) {
  if (!item) return {}
  if (item.packagePartial && item.selectedStock) {
    const currentPieces = countsTotal(item.selectedStock)
    if (currentPieces <= 0 || Number(quantity || 0) >= currentPieces) return { ...item.selectedStock }
    let remaining = Number(quantity || 0)
    const next = {}
    Object.entries(item.selectedStock).forEach(([size, qty]) => {
      if (remaining <= 0) return
      const take = Math.min(Number(qty || 0), remaining)
      if (take > 0) next[size] = take
      remaining -= take
    })
    return next
  }
  if (!item.packageMode && item.size) return { [item.size]: Number(quantity || 0) }
  return {}
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

  const rawSizes =
    typeof row.sizes === 'string' && row.sizes.trim()
      ? row.sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : ['CH', 'M', 'G']

  const rawStock =
    row.stock_json && typeof row.stock_json === 'object' && !Array.isArray(row.stock_json)
      ? row.stock_json
      : Object.fromEntries(rawSizes.map((s) => [s, 0]))
  const stock = normalizeStockBySize(rawStock)
  const sizes = uniqueValues([
    ...rawSizes.map(normalizePackageSizeLabel).filter(Boolean),
    ...Object.keys(stock),
  ])

  const parsedDescription = splitProductDescription(row.description || '')
  const productMeta = parsedDescription.meta || {}
  const offerActive = row.is_offer === true && isOfferCurrentlyActive(productMeta, row)
  const qualityPricing = getQualityDefaultPricing(productMeta.quality)
  const publicPrice = qualityPricing?.price ?? Number(row.price_base ?? row.price ?? 0)
  const publicTier3 = qualityPricing?.price_tier3 ?? Number(row.price_tier3 ?? row.price_base ?? row.price ?? 0)
  const publicTier10 = qualityPricing?.price_tier10 ?? Number(row.price_tier10 ?? row.price_base ?? row.price ?? 0)
  const publicSpecial = qualityPricing?.special_price ?? Number(row.special_price ?? row.price_tier10 ?? row.price_base ?? row.price ?? 0)

  return {
    id: row.id,
    created_at: row.created_at,
    name: row.name || '',
    description: parsedDescription.description,
    category: row.category || 'Jeans',
    subcategory: row.subcategory || '',
    audience: row.audience || 'Hombre',
    brand: row.brand || 'Otras',
    quality: productMeta.quality || '',
    model_po: productMeta.model_po || '',
    images,
    sizes,
    stock,
    stock_total: Number(row.stock || totalStock(stock)),
    price: publicPrice,
    price_base: publicPrice,
    offer_price: Number(productMeta.offer_price || 0),
    offer_duration_days: Number(productMeta.offer_duration_days || 0),
    offer_forever: productMeta.offer_forever === true,
    offer_started_at: productMeta.offer_started_at || row.created_at || '',
    promotion_title: productMeta.promotion_title || '',
    promotion_note: productMeta.promotion_note || '',
    promo_discount_percent: Number(productMeta.promo_discount_percent || 0),
    promo_free_shipping: productMeta.promo_free_shipping === true,
    promo_terms: productMeta.promo_terms || '',
    price_tier3: publicTier3,
    price_tier10: publicTier10,
    special_price: publicSpecial,
    active: row.active !== false,
    is_new: row.is_new !== false && isWithinDays(row.created_at, NEW_PRODUCT_DAYS) && !productHasOnlyOneImage({ images }),
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
    is_new: product.is_new !== false && !productHasOnlyOneImage(product),
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
    quality: '',
    model_po: '',
    customCategory: '',
    customSubcategory: '',
    customBrand: '',
    customQuality: '',
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
  customFits,
}) {
  const [hoveredCategory, setHoveredCategory] = useState('')
  const hasLastUnits = products.some((product) => productHasVisibleStock(product) && (activeAudience === 'Todo' || product.audience === activeAudience) && isLastUnitsProduct(product))
  const categories = [
    ...getStoreCategories(products, activeAudience),
    ...(hasLastUnits ? ['Ultimas piezas'] : []),
  ]
  const brands = getStoreBrands(products, activeAudience)
  const fitList = getFitsForAudience(products.filter(productHasVisibleStock), activeAudience, customFits)

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

  const availableAudiences = getStoreAudiences(products)
  const hasLastUnits = products.some((product) => productHasVisibleStock(product) && (selectedAudience === 'Todo' || product.audience === selectedAudience) && isLastUnitsProduct(product))
  const categories = [
    ...getStoreCategories(products, selectedAudience),
    ...(hasLastUnits ? ['Ultimas piezas'] : []),
  ]
  const brands = getStoreBrands(products, selectedAudience)
  const fits = getFitsForAudience(products.filter(productHasVisibleStock), selectedAudience, customFits)

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
            availableAudiences.map((aud) => (
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
  fetchProductImages,
}) {
  const initialImages = Array.isArray(product.images) && product.images.length ? product.images : []
  const [loadedImages, setLoadedImages] = useState(initialImages)
  const images = loadedImages.length ? loadedImages : initialImages
  const [imageIndex, setImageIndex] = useState(0)
  const eagerFirstImage = variant === 'quick' || (!isMobile && variant !== 'card')
  const touchStartX = useRef(0)
  const swipedRef = useRef(false)
  const carouselRef = useRef(null)
  const loadingFullImagesRef = useRef(false)

  useEffect(() => {
    setImageIndex(0)
    setLoadedImages(Array.isArray(product.images) && product.images.length ? product.images : [])
    loadingFullImagesRef.current = false
  }, [product.id, product.images])

  const ensureFullImages = () => {
    if (!fetchProductImages || !product?.id || loadingFullImagesRef.current || images.length > 1) return
    loadingFullImagesRef.current = true
    fetchProductImages(product.id)
      .then((fullImages) => {
        if (Array.isArray(fullImages) && fullImages.length > images.length) {
          setLoadedImages(fullImages)
        }
      })
      .finally(() => {
        loadingFullImagesRef.current = false
      })
  }

  useEffect(() => {
    if (variant !== 'card' || !fetchProductImages || images.length > 1) return undefined
    const node = carouselRef.current
    if (!node) return undefined

    const loadVisibleImages = () => {
      if (loadingFullImagesRef.current || images.length > 1) return
      loadingFullImagesRef.current = true
      fetchProductImages(product.id)
        .then((fullImages) => {
          if (Array.isArray(fullImages) && fullImages.length > images.length) {
            setLoadedImages(fullImages)
          }
        })
        .finally(() => {
          loadingFullImagesRef.current = false
        })
    }

    let delayId = null
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      delayId = window.setTimeout(loadVisibleImages, isMobile ? 180 : 260)
      observer.disconnect()
    }, { rootMargin: isMobile ? '180px 0px' : '360px 0px' })

    observer.observe(node)
    return () => {
      if (delayId) window.clearTimeout(delayId)
      observer.disconnect()
    }
  }, [isMobile, variant, fetchProductImages, product.id, images.length])

  const goTo = (nextIndex) => {
    if (!images.length) return
    setImageIndex((nextIndex + images.length) % images.length)
  }

  const openDetail = () => {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    const hydratedProduct = images.length > initialImages.length ? { ...product, images } : product
    if (isMobile) {
      onOpenQuickView(hydratedProduct)
      return
    }
    onOpenGallery(hydratedProduct, imageIndex)
  }

  return (
    <div
      ref={carouselRef}
      data-product-media="true"
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
        ensureFullImages()
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
        aspectRatio: variant === 'quick' ? '4 / 5.1' : variant === 'featured' ? (isMobile ? '4 / 4.35' : '4 / 4.05') : isMobile ? '4 / 4.9' : '4 / 4.35',
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
          {images.map((image, idx) => {
            const distance = Math.abs(idx - imageIndex)
            const wrapDistance = Math.abs(images.length - distance)
            const nearActiveSlide = Math.min(distance, wrapDistance) <= 1
            const shouldRenderSlide = images.length <= 3 || nearActiveSlide || (!isMobile && variant === 'card')

            return shouldRenderSlide ? (
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
            ) : (
              <div
                key={image + idx}
                aria-hidden="true"
                style={{
                  width: '100%',
                  height: '100%',
                  flex: '0 0 100%',
                  background: '#ebe6dc',
                }}
              />
            )
          })}
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
            onOpenQuickView(images.length > initialImages.length ? { ...product, images } : product)
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
  onAddPackageToCart,
  onOpenGallery,
  onOpenQuickView,
  specialClientSession,
  getCartUnitPrice,
  totalPieces,
  isMobile,
  fetchProductImages,
}) {
  const current = selectedConfig[product.id] || { size: '', quantity: 0 }
  const [pickerMode, setPickerMode] = useState('sizes')
  const [packageQty, setPackageQty] = useState(1)
  const [packageBreakdown, setPackageBreakdown] = useState(product.package_breakdown || product.package_fit || '')
  const [selectPackageSizes, setSelectPackageSizes] = useState(false)
  const [packageSelection, setPackageSelection] = useState({})
  const [packageReady, setPackageReady] = useState(true)
  const activeSize = current.size
  const stockForSelected = Number(product.stock?.[activeSize] || 0)
  const availableStock = totalStock(product.stock)
  const packageStock = Number(product.package_stock || 0)
  const hasSizeStock = availableStock > 0
  const hasPackageStock = packageStock > 0
  const isCompletelyOut = !hasSizeStock && !hasPackageStock
  const specialPriceUnlocked = specialClientSession?.active && (specialClientSession.client_tier !== 'Plata' || Number(totalPieces || 0) >= 10)
  const packageUnitPrice = specialPriceUnlocked && getCartUnitPrice
    ? Number(getCartUnitPrice(product) || getPackageUnitPrice(product))
    : getPackageUnitPrice(product)
  const offerUnitPrice = product?.is_offer && Number(product.offer_price || 0) > 0
    ? Number(product.offer_price || 0)
    : 0
  const visiblePrice = offerUnitPrice || Number(product.price || 0)
  const visibleTier3Price = offerUnitPrice || Number(product.price_tier3 || product.price || 0)
  const visibleTier10Price = offerUnitPrice || Number(product.price_tier10 || product.price_tier3 || product.price || 0)
  const visibleSpecialPrice = offerUnitPrice || (
    specialPriceUnlocked && getCartUnitPrice
      ? Number(getCartUnitPrice(product) || product.special_price || visibleTier10Price)
      : visibleTier10Price
  )

  useEffect(() => {
    if (pickerMode === 'sizes' && !hasSizeStock && hasPackageStock) setPickerMode('package')
    if (pickerMode === 'package' && !hasPackageStock && hasSizeStock) setPickerMode('sizes')
  }, [pickerMode, hasSizeStock, hasPackageStock])

  useEffect(() => {
    setPackageQty(1)
    setPackageBreakdown(product.package_breakdown || product.package_fit || '')
    setSelectPackageSizes(false)
    setPackageSelection({})
    setPackageReady(true)
  }, [product.id, product.package_breakdown, product.package_fit])

  const setPackageQuantity = (qty) => {
    const clean = Math.max(1, Math.min(Number(qty || 1), Math.max(1, packageStock)))
    setPackageQty(clean)
    setPackageSelection({})
    setPackageReady(true)
  }

  const packageSizeOptions = useMemo(() => {
    const counts = buildPackageSelectionStock(product, packageQty)
    return [...counts.entries()].map(([size, qty]) => ({ size, max: Number(qty || 0) }))
  }, [product, packageQty])

  const selectedPackagePieces = countsTotal(packageSelection)

  const updatePackageSelection = (size, qty) => {
    const option = packageSizeOptions.find((entry) => entry.size === size)
    const max = Number(option?.max || 0)
    const clean = Math.max(0, Math.min(Number(qty || 0), max))
    setPackageSelection((prev) => {
      const next = { ...prev }
      if (clean > 0) next[size] = clean
      else delete next[size]
      return next
    })
    setPackageReady(true)
  }

  const addPackage = () => {
    if (!onAddPackageToCart) return false
    const added = onAddPackageToCart(product, packageQty, packageBreakdown, selectPackageSizes ? packageSelection : null)
    if (added !== false) setPackageReady(false)
    return added
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

  return (
    <article
      style={{
        ...styles.card,
        overflow: 'hidden',
        borderRadius: isMobile ? 0 : 8,
        boxShadow: isMobile ? 'none' : styles.card.boxShadow,
        border: isMobile ? 'none' : styles.card.border,
        background: '#fff',
        minWidth: 0,
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
        fetchProductImages={fetchProductImages}
      />

      <div style={{ padding: isMobile ? '11px 0 18px' : 18 }}>
        {!isMobile ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <Badge bg="#fff" border="1px solid #d1d5db">{product.brand}</Badge>
            {product.subcategory ? <Badge bg="#f6f4ef" border="1px solid #e5dfd4">{product.subcategory}</Badge> : null}
            {product.quality ? <Badge bg="#f5f3ff" color="#6d28d9">{product.quality}</Badge> : null}
            {product.is_new ? <Badge bg="#111315" color="#fff">Nuevo</Badge> : null}
            {product.sales_count > 0 ? <Badge bg="#b7791f" color="#fff">Mas vendido</Badge> : null}
            <Badge
              bg={!isCompletelyOut ? '#ecfdf5' : '#fef2f2'}
              color={!isCompletelyOut ? '#065f46' : '#991b1b'}
            >
              {!isCompletelyOut ? (availableStock + packageStock * getPackagePieces(product)) + ' disponibles' : 'Agotado'}
            </Badge>
          </div>
        ) : null}

        {isMobile ? (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 7 }}>
            <Badge bg="#fff" border="1px solid #d1d5db">{product.brand}</Badge>
            {product.subcategory ? <Badge bg="#f6f4ef" border="1px solid #e5dfd4">{product.subcategory}</Badge> : null}
            {product.quality ? <Badge bg="#f5f3ff" color="#6d28d9">{product.quality}</Badge> : null}
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

        {product.model_po ? (
          <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: isMobile ? 11 : 12, fontWeight: 800 }}>
            Modelo/PO: {product.model_po}
          </p>
        ) : null}

        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['sizes', 'Tallas', hasSizeStock],
            ['package', 'Paquete', hasPackageStock],
          ].filter(([, , enabled]) => enabled || isCompletelyOut).map(([key, label, enabled]) => (
            <button
              key={key}
              type="button"
              onClick={() => enabled && setPickerMode(key)}
              disabled={!enabled}
              style={{
                border: pickerMode === key ? '2px solid #111315' : '1px solid #d1d5db',
                background: !enabled ? '#f3f4f6' : pickerMode === key ? '#111315' : '#fff',
                color: !enabled ? '#9ca3af' : pickerMode === key ? '#fff' : '#111315',
                borderRadius: 999,
                padding: isMobile ? '6px 10px' : '7px 12px',
                fontSize: isMobile ? 11 : 12,
                fontWeight: 900,
                cursor: enabled ? 'pointer' : 'not-allowed',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {isMobile ? (
          <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
            {!specialClientSession?.active ? (
              <div style={{ display: 'grid', gap: 5, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '7px 8px', border: '1px solid #e5e7eb', minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 800 }}>NORMAL</div>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{mxn(visiblePrice)}</div>
                </div>
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '7px 8px', border: '1px solid #bfdbfe', minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 800 }}>3+ PZ</div>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{mxn(visibleTier3Price)}</div>
                </div>
                <div style={{ background: '#ecfdf5', borderRadius: 10, padding: '7px 8px', border: '1px solid #a7f3d0', minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: '#047857', fontWeight: 800 }}>10+ PZ</div>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{mxn(visibleTier10Price)}</div>
                </div>
              </div>
            ) : specialPriceUnlocked ? (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: 9, fontSize: 12, color: '#065f46', fontWeight: 800 }}>
                Precio especial activo para cliente {specialClientSession.client_tier}: {mxn(visibleSpecialPrice)}
              </div>
            ) : (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 9, fontSize: 12, color: '#9a3412', fontWeight: 800 }}>
                Precio Plata se activa al completar 10 piezas.
              </div>
            )}

            {pickerMode === 'package' && hasPackageStock ? (
              <div style={{ border: '1px solid #e5dfd4', borderRadius: 12, padding: 9, background: '#fbfaf7', display: 'grid', gap: 8, minWidth: 0 }}>
                <div style={{ display: 'grid', gap: 2 }}>
                  <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 900 }}>Entallado</span>
                  <strong style={{ fontSize: 12, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{product.package_fit || product.package_breakdown || 'Por confirmar'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 900 }}>Precio c/u</span>
                  <strong style={{ fontSize: 13 }}>{mxn(packageUnitPrice)}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectPackageSizes((value) => !value)
                    setPackageSelection({})
                    setPackageReady(true)
                  }}
                  style={{
                    ...styles.buttonSecondary,
                    minHeight: 34,
                    borderRadius: 999,
                    padding: '7px 10px',
                    fontSize: 11,
                    background: selectPackageSizes ? '#111315' : '#fff',
                    color: selectPackageSizes ? '#fff' : '#111315',
                  }}
                >
                  Seleccionar tallas
                </button>
                {selectPackageSizes ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {packageSizeOptions.map(({ size, max }) => (
                      <div key={size} style={{ display: 'grid', gap: 6, padding: 7, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'center' }}>
                          <strong style={{ fontSize: 13 }}>{size}</strong>
                          <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 900 }}>max {max}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '30px minmax(28px, 1fr) 30px', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 999, overflow: 'hidden', background: '#fff' }}>
                          <button type="button" onClick={() => updatePackageSelection(size, Number(packageSelection[size] || 0) - 1)} disabled={max <= 0 || Number(packageSelection[size] || 0) <= 0} style={{ border: 'none', background: '#fff', height: 32, cursor: max > 0 ? 'pointer' : 'not-allowed', padding: 0 }}><Minus size={13} /></button>
                          <input
                            type="number"
                            min="0"
                            max={max}
                            value={packageSelection[size] || 0}
                            onChange={(event) => updatePackageSelection(size, event.target.value)}
                            style={{ border: 'none', outline: 'none', textAlign: 'center', fontSize: 14, fontWeight: 900, minWidth: 0, width: '100%', padding: 0 }}
                          />
                          <button type="button" onClick={() => updatePackageSelection(size, Number(packageSelection[size] || 0) + 1)} disabled={max <= 0 || Number(packageSelection[size] || 0) >= max} style={{ border: 'none', background: '#fff', height: 32, cursor: max > 0 ? 'pointer' : 'not-allowed', padding: 0 }}><Plus size={13} /></button>
                        </div>
                      </div>
                    ))}
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 12, fontWeight: 800 }}>
                      Seleccionadas: {selectedPackagePieces} pz. El resto vuelve a tallas.
                    </p>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 12, fontWeight: 800 }}>
                    Paquete completo: {packageQty} x {getPackagePieces(product)} pz
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d8d3c8', borderRadius: 999, overflow: 'hidden' }}>
                    <button type="button" onClick={() => setPackageQuantity(packageQty - 1)} style={{ border: 'none', background: '#fff', width: 30, height: 30, cursor: 'pointer', padding: 0 }}><Minus size={13} /></button>
                    <input type="number" min="1" max={packageStock} value={packageQty} onChange={(event) => setPackageQuantity(event.target.value)} style={{ width: 34, height: 30, textAlign: 'center', border: 'none', outline: 'none', fontWeight: 900, fontSize: 14 }} />
                    <button type="button" onClick={() => setPackageQuantity(packageQty + 1)} style={{ border: 'none', background: '#fff', width: 30, height: 30, cursor: 'pointer', padding: 0 }}><Plus size={13} /></button>
                  </div>
                  <button type="button" onClick={addPackage} disabled={packageStock <= 0 || !packageReady || (selectPackageSizes && selectedPackagePieces <= 0)} style={{ ...styles.buttonPrimary, minHeight: 34, borderRadius: 999, padding: '7px 10px', fontSize: 11, opacity: packageStock <= 0 || !packageReady || (selectPackageSizes && selectedPackagePieces <= 0) ? 0.5 : 1 }}>
                    Agregar producto
                  </button>
                </div>
              </div>
            ) : hasSizeStock ? (
              <>
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
              </>
            ) : (
              <p style={{ margin: 0, color: '#991b1b', fontWeight: 900, fontSize: 12 }}>Producto agotado.</p>
            )}
          </div>
        ) : (
          <>
            <p style={{ display: 'none' }}>{product.description || 'Sin descripcion'}</p>

            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {!specialClientSession?.active ? (
                <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: 8, border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>NORMAL</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{mxn(visiblePrice)}</div>
                  </div>
                  <div style={{ background: '#eff6ff', borderRadius: 12, padding: 8, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 700 }}>3+ PZ</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{mxn(visibleTier3Price)}</div>
                  </div>
                  <div style={{ background: '#ecfdf5', borderRadius: 12, padding: 8, border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: 10, color: '#047857', fontWeight: 700 }}>10+ PZ</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{mxn(visibleTier10Price)}</div>
                  </div>
                </div>
              ) : specialPriceUnlocked ? (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: 10, fontSize: 13, color: '#065f46', fontWeight: 700 }}>
                  Precio especial activo para cliente {specialClientSession.client_tier}: {mxn(visibleSpecialPrice)}
                </div>
              ) : (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: 10, fontSize: 13, color: '#9a3412', fontWeight: 700 }}>
                  Precio Plata se activa al completar 10 piezas.
                </div>
              )}
            </div>

            {pickerMode === 'package' && hasPackageStock ? (
              <div style={{ marginTop: 10, border: '1px solid #e5dfd4', borderRadius: 12, padding: 12, background: '#fbfaf7', display: 'grid', gap: 10 }}>
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div><small style={{ color: '#6b7280', fontWeight: 800 }}>Entallado</small><div style={{ fontWeight: 900 }}>{product.package_fit || product.package_breakdown || 'Por confirmar'}</div></div>
                  <div><small style={{ color: '#6b7280', fontWeight: 800 }}>Precio c/u</small><div style={{ fontWeight: 900 }}>{mxn(packageUnitPrice)}</div></div>
                  <div><small style={{ color: '#6b7280', fontWeight: 800 }}>Paquetes</small><div style={{ fontWeight: 900 }}>{packageStock}</div></div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectPackageSizes((value) => !value)
                    setPackageSelection({})
                    setPackageReady(true)
                  }}
                  style={{
                    ...styles.buttonSecondary,
                    justifySelf: 'start',
                    background: selectPackageSizes ? '#111315' : '#fff',
                    color: selectPackageSizes ? '#fff' : '#111315',
                  }}
                >
                  Seleccionar tallas
                </button>
                {selectPackageSizes ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                      {packageSizeOptions.map(({ size, max }) => (
                        <label key={size} style={{ display: 'grid', gap: 5, fontWeight: 900 }}>
                          {size} <span style={{ color: '#6b7280', fontSize: 12 }}>max {max}</span>
                          <input
                            type="number"
                            min="0"
                            max={max}
                            value={packageSelection[size] || ''}
                            onChange={(event) => updatePackageSelection(size, event.target.value)}
                            placeholder="0"
                            style={{ ...styles.input, padding: '10px 12px', textAlign: 'center' }}
                          />
                        </label>
                      ))}
                    </div>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 13, fontWeight: 800 }}>
                      Seleccionadas: {selectedPackagePieces} pz. El resto del paquete se suma a tallas.
                    </p>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 13, fontWeight: 800 }}>
                    Se agregara el paquete completo: {packageQty} x {getPackagePieces(product)} pz.
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setPackageQuantity(packageQty - 1)} style={{ ...styles.buttonSecondary, padding: '8px 10px' }}><Minus size={14} /></button>
                  <input type="number" min="1" max={packageStock} value={packageQty} onChange={(event) => setPackageQuantity(event.target.value)} style={{ ...styles.input, width: 86, textAlign: 'center', padding: '12px 14px' }} />
                  <button type="button" onClick={() => setPackageQuantity(packageQty + 1)} style={{ ...styles.buttonSecondary, padding: '8px 10px' }}><Plus size={14} /></button>
                  <button type="button" onClick={addPackage} disabled={packageStock <= 0 || !packageReady || (selectPackageSizes && selectedPackagePieces <= 0)} style={{ ...styles.buttonPrimary, flex: 1, opacity: packageStock <= 0 || !packageReady || (selectPackageSizes && selectedPackagePieces <= 0) ? 0.5 : 1 }}>Agregar producto</button>
                </div>
              </div>
            ) : hasSizeStock ? (
              <>
            <div style={{ marginTop: 10 }}>
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

            </>
            ) : null}

            <button
              type="button"
              onClick={() => onAddToCart(product)}
              disabled={pickerMode !== 'sizes' || !activeSize || Number(current.quantity || 0) <= 0}
              style={{
                ...styles.buttonPrimary,
                width: '100%',
                marginTop: 12,
                opacity: pickerMode !== 'sizes' || !activeSize || Number(current.quantity || 0) <= 0 ? 0.5 : 1,
                cursor: pickerMode !== 'sizes' || !activeSize || Number(current.quantity || 0) <= 0 ? 'not-allowed' : 'pointer',
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

function HomeFeaturedProductCard({ product, isMobile, onOpenGallery, onOpenQuickView, fetchProductImages, cardBasis }) {
  return (
    <article
      style={{
        ...styles.card,
        overflow: 'hidden',
        borderRadius: 8,
        border: isMobile ? '1px solid #e5e7eb' : styles.card.border,
        boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.05)' : styles.card.boxShadow,
        background: '#fff',
        flex: cardBasis ? `0 0 ${cardBasis}` : isMobile ? '0 0 calc(100vw - 36px)' : undefined,
      }}
    >
      <ProductMediaCarousel
        product={product}
        isMobile={isMobile}
        variant="featured"
        onOpenGallery={onOpenGallery}
        onOpenQuickView={onOpenQuickView}
        fetchProductImages={fetchProductImages}
      />
      <div style={{ padding: isMobile ? '12px 0 18px' : '14px 16px 18px' }}>
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
          <h3 style={{ margin: 0, fontSize: isMobile ? 17 : 19, lineHeight: 1.12, fontWeight: 950 }}>
            {product.name}
          </h3>
        </button>
        {product.model_po ? (
          <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: isMobile ? 11 : 12, fontWeight: 800 }}>
            Modelo/PO: {product.model_po}
          </p>
        ) : null}
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
  const [packageBreakdown, setPackageBreakdown] = useState(product?.package_breakdown || product?.package_fit || '')
  const [selectPackageSizes, setSelectPackageSizes] = useState(false)
  const [packageSelection, setPackageSelection] = useState({})
  const [packageReady, setPackageReady] = useState(true)
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
  const displayTier3Price = product?.is_offer && Number(product.offer_price || 0) > 0
    ? Number(product.offer_price || 0)
    : Number(product?.price_tier3 || displayPrice || 0)
  const packagePieces = product ? getPackagePieces(product) : 10
  const packageStock = product ? Number(product.package_stock || 0) : 0
  const hasSizeStock = availableStock > 0
  const hasPackageStock = packageStock > 0
  const isCompletelyOut = !hasSizeStock && !hasPackageStock
  const packageUnitPrice = product ? (specialPriceUnlocked ? Number(getCartUnitPrice?.(product) || getPackageUnitPrice(product)) : getPackageUnitPrice(product)) : 0
  const [detailMode, setDetailMode] = useState('sizes')

  useEffect(() => {
    if (!open || !product) return
    setImageIndex(0)
    setPackageQty(1)
    setPackageBreakdown(product.package_breakdown || product.package_fit || '')
    setSelectPackageSizes(false)
    setPackageSelection({})
    setPackageReady(true)
    setDetailMode(totalStock(product.stock) > 0 ? 'sizes' : Number(product.package_stock || 0) > 0 ? 'package' : 'sizes')
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

  useEffect(() => {
    if (!open || !product) return
    if (detailMode === 'sizes' && !hasSizeStock && hasPackageStock) setDetailMode('package')
    if (detailMode === 'package' && !hasPackageStock && hasSizeStock) setDetailMode('sizes')
  }, [open, product, detailMode, hasSizeStock, hasPackageStock])

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
    setPackageSelection({})
    setPackageReady(true)
  }

  const addPackageAndClose = () => {
    const added = onAddPackageToCart(product, packageQty, packageBreakdown, selectPackageSizes ? packageSelection : null)
    if (added !== false) {
      setPackageReady(false)
      onClose()
    }
  }

  const packageSizeOptions = useMemo(() => {
    if (!product) return []
    const counts = buildPackageSelectionStock(product, packageQty)
    return [...counts.entries()].map(([size, qty]) => ({ size, max: Number(qty || 0) }))
  }, [product, packageQty])

  const selectedPackagePieces = countsTotal(packageSelection)

  const updatePackageSelection = (size, qty) => {
    const option = packageSizeOptions.find((entry) => entry.size === size)
    const max = Number(option?.max || 0)
    const clean = Math.max(0, Math.min(Number(qty || 0), max))
    setPackageSelection((prev) => {
      const next = { ...prev }
      if (clean > 0) next[size] = clean
      else delete next[size]
      return next
    })
    setPackageReady(true)
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
            {product.model_po ? (
              <p style={{ margin: '7px 0 0', color: '#6b7280', fontSize: 12, fontWeight: 900 }}>
                Modelo/PO: {product.model_po}
              </p>
            ) : null}
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
              {!specialClientSession?.active && !product.is_offer && displayTier3Price < displayPrice ? (
                <span style={{ display: 'block', color: '#9a6b16', fontSize: 14, marginTop: 4 }}>
                  Compra 3+ piezas desde {mxn(displayTier3Price)}
                </span>
              ) : null}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              ['sizes', 'Tallas', hasSizeStock],
              ['package', 'Paquete', hasPackageStock],
            ].filter(([, , enabled]) => enabled || isCompletelyOut).map(([key, label, enabled]) => (
              <button
                key={key}
                type="button"
                onClick={() => enabled && setDetailMode(key)}
                disabled={!enabled}
                style={{
                  border: detailMode === key ? '2px solid #111315' : '1px solid #d1d5db',
                  background: !enabled ? '#f3f4f6' : detailMode === key ? '#111315' : '#fff',
                  color: !enabled ? '#9ca3af' : detailMode === key ? '#fff' : '#111315',
                  borderRadius: 999,
                  padding: '9px 14px',
                  fontWeight: 900,
                  cursor: enabled ? 'pointer' : 'not-allowed',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {isCompletelyOut ? (
            <div style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', borderRadius: 8, padding: 14, fontWeight: 900 }}>
              Producto agotado por tallas y por paquete.
            </div>
          ) : null}

          {detailMode === 'sizes' && hasSizeStock ? (
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
          ) : null}

          {detailMode === 'package' && hasPackageStock ? (
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
                <small style={{ color: '#6b7280', fontWeight: 800 }}>Precio c/u</small>
                <div style={{ fontWeight: 950 }}>{mxn(packageUnitPrice)}</div>
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
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectPackageSizes((value) => !value)
                  setPackageSelection({})
                  setPackageReady(true)
                }}
                style={{
                  ...styles.buttonSecondary,
                  justifySelf: 'start',
                  background: selectPackageSizes ? '#111315' : '#fff',
                  color: selectPackageSizes ? '#fff' : '#111315',
                }}
              >
                Seleccionar tallas
              </button>
              {selectPackageSizes ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(128px, 1fr))', gap: 8 }}>
                    {packageSizeOptions.map(({ size, max }) => (
                      <label key={size} style={{ display: 'grid', gap: 5, fontWeight: 900 }}>
                        {size} <span style={{ color: '#6b7280', fontSize: 12 }}>max {max}</span>
                        <input
                          type="number"
                          min="0"
                          max={max}
                          value={packageSelection[size] || ''}
                          onChange={(event) => updatePackageSelection(size, event.target.value)}
                          placeholder="0"
                          style={{ ...styles.input, padding: '10px 12px', textAlign: 'center' }}
                        />
                      </label>
                    ))}
                  </div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 13, fontWeight: 800 }}>
                    Seleccionadas: {selectedPackagePieces} pz. El resto del paquete se suma a tallas.
                  </p>
                </div>
              ) : (
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13, fontWeight: 800 }}>
                  Se agregara el paquete completo: {packageQty} x {packagePieces} pz.
                </p>
              )}
            </div>
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
                <button
                  type="button"
                  disabled={!packageReady || (selectPackageSizes && selectedPackagePieces <= 0)}
                  style={{
                    ...styles.buttonSecondary,
                    background: '#111315',
                    color: '#fff',
                    opacity: packageReady && (!selectPackageSizes || selectedPackagePieces > 0) ? 1 : .52,
                    cursor: packageReady && (!selectPackageSizes || selectedPackagePieces > 0) ? 'pointer' : 'not-allowed',
                  }}
                  onClick={addPackageAndClose}
                >
                  Agregar producto
                </button>
              </div>
            ) : (
              <p style={{ margin: '10px 0 0', color: '#991b1b', fontWeight: 900 }}>Paquete cerrado agotado.</p>
            )}
          </div>
          ) : null}

          {detailMode === 'sizes' && hasSizeStock ? (
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
          ) : null}

          <button
            type="button"
            onClick={addAndClose}
            disabled={detailMode !== 'sizes' || !activeSize || Number(current.quantity || 0) <= 0}
            style={{
              ...styles.buttonPrimary,
              width: '100%',
              minHeight: 56,
              borderRadius: 0,
              opacity: detailMode !== 'sizes' || !activeSize || Number(current.quantity || 0) <= 0 ? .52 : 1,
              cursor: detailMode !== 'sizes' || !activeSize || Number(current.quantity || 0) <= 0 ? 'not-allowed' : 'pointer',
            }}
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
  onUpdateCartItemQty,
  onRemoveCartItem,
  customer,
  setCustomer,
  sendOrder,
  orderLoading,
  specialClientSession,
  getCartUnitPrice,
}) {
  const [policyOpen, setPolicyOpen] = useState(false)
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
    if (onUpdateCartItemQty) {
      onUpdateCartItemQty(index, nextQty)
      return
    }
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
    if (onRemoveCartItem) {
      onRemoveCartItem(index)
      return
    }
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const registeredClientActive = Boolean(specialClientSession?.active)

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
                              {item.packagePartial
                                ? 'Tallas seleccionadas de paquete: ' + item.quantity + ' pz'
                                : item.packageMode
                                ? 'Paquete cerrado: ' + item.quantity + ' paquete(s) x ' + getPackagePieces(item.product) + ' pz'
                                : 'Talla ' + item.size}
                            </p>
                            {(item.packageMode || item.packagePartial) && (item.packageBreakdown || item.product.package_breakdown || item.product.package_fit) ? (
                              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
                                Corrida: {item.packageBreakdown || item.product.package_breakdown || item.product.package_fit}
                              </p>
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

                        <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 13 }}>{item.packageMode || item.packagePartial ? 'Precio c/u' : 'Unitario'}: {mxn(unit)}</p>
                        {item.packageMode ? (
                          <p style={{ margin: '4px 0 0', color: '#111827', fontSize: 13, fontWeight: 900 }}>
                            Paquete completo: {mxn(unit * getPackagePieces(item.product))}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>Datos para solicitar</h3>

            {registeredClientActive ? (
              <div
                style={{
                  border: '1px solid #d8d3c8',
                  borderRadius: 18,
                  padding: 14,
                  background: '#fbfaf7',
                  color: '#374151',
                  lineHeight: 1.45,
                }}
              >
                <strong style={{ color: '#111315' }}>Cliente registrado</strong>
                <p style={{ margin: '6px 0 0' }}>
                  {specialClientSession.name || specialClientSession.client_code}
                  {specialClientSession.phone ? ' · ' + specialClientSession.phone : ''}
                </p>
                <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                  Solo confirma como quieres recibir tu pedido.
                </p>
              </div>
            ) : null}

            {!registeredClientActive ? (
              <>
            <input
              style={{ ...styles.input, display: registeredClientActive ? 'none' : undefined }}
              placeholder="Nombre del cliente"
              value={customer.name}
              onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
            />

            <input
              style={{ ...styles.input, display: registeredClientActive ? 'none' : undefined }}
              placeholder="Telefono"
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
              </>
            ) : null}
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
            onClick={() => setPolicyOpen(true)}
            disabled={cart.length === 0 || orderLoading}
          >
            <ShoppingBag size={18} />
            {orderLoading ? 'Preparando apartado...' : 'Solicitar apartado por WhatsApp'}
          </button>
        </div>
      </aside>

      {policyOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Condiciones del apartado"
          onClick={(event) => event.stopPropagation()}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 95,
            background: 'rgba(17,19,21,.45)',
            display: 'grid',
            placeItems: 'center',
            padding: 18,
          }}
        >
          <div
            style={{
              width: 'min(520px, 100%)',
              background: '#fff',
              borderRadius: 26,
              padding: isMobile ? 22 : 28,
              boxShadow: '0 24px 70px rgba(17,19,21,.28)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'start' }}>
              <div>
                <p style={{ margin: 0, color: '#9a6b16', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>Condiciones</p>
                <h3 style={{ margin: '6px 0 0', fontSize: isMobile ? 28 : 34, lineHeight: 1 }}>Apartado Denim Click</h3>
              </div>
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={() => setPolicyOpen(false)}
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

            <p style={{ margin: '18px 0 0', color: '#374151', fontSize: 18, lineHeight: 1.55 }}>
              Los apartados se mantienen por 7 dias. Posterior a ese tiempo se necesitara un deposito para conservar el apartado activo.
            </p>
            <p style={{ margin: '10px 0 0', color: '#6b7280', lineHeight: 1.5 }}>
              Al continuar se guardara tu solicitud, se descontara la disponibilidad y se abrira WhatsApp con el mensaje listo para enviar.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <button type="button" style={styles.buttonSecondary} onClick={() => setPolicyOpen(false)}>
                Revisar bolsa
              </button>
              <button
                type="button"
                style={styles.buttonPrimary}
                disabled={orderLoading}
                onClick={() => {
                  setPolicyOpen(false)
                  sendOrder()
                }}
              >
                <ShoppingBag size={18} />
                Entiendo, solicitar apartado
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
  const customQualities = uniqueValues(
    products
      .map((p) => p.quality)
      .filter((q) => q && !QUALITY_OPTIONS.includes(q) && !QUALITY_SELECT_BLOCKLIST.has(String(q).trim().toUpperCase()))
  )

  const categories = getAudienceCategories(draft.audience, customCategories).filter((c) => c !== 'Playera')
  const fits = getFitsForAudience(products, draft.audience, customFits, { onlyWithStock: false })
  const brands = uniqueValues([...BRANDS, ...customBrands])
  const qualities = uniqueValues([...QUALITY_OPTIONS, ...customQualities])
    .filter((quality) => !QUALITY_SELECT_BLOCKLIST.has(String(quality).trim().toUpperCase()))
  const hasQualityPreset = Boolean(getQualityPricePreset(draft.customQuality?.trim() || draft.quality))
  const hasCategoryPreset = !isKidsAudience(draft.audience) && Boolean(ADMIN_PRICE_PRESETS[draft.category])
  const hasPreset = hasQualityPreset || hasCategoryPreset

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

  const applyQuality = (quality) => {
    const nextPricing = getDefaultProductPricing(draft.audience, draft.category, { ...draft, quality, customQuality: '' })
    setDraft((prev) => ({
      ...prev,
      quality,
      customQuality: '',
      ...nextPricing,
    }))
  }

  const applyCustomQuality = (customQuality) => {
    const preset = getQualityPricePreset(customQuality)
    const nextPricing = preset ? getDefaultProductPricing(draft.audience, draft.category, { ...draft, quality: '', customQuality }) : {}
    setDraft((prev) => ({
      ...prev,
      quality: preset ? preset.quality : prev.quality,
      customQuality,
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

      <input
        style={styles.input}
        placeholder="Modelo/PO"
        value={draft.model_po || ''}
        onChange={(e) => setDraft((p) => ({ ...p, model_po: e.target.value }))}
      />

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

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
        <select
          style={styles.input}
          value={draft.quality || ''}
          onChange={(e) => applyQuality(e.target.value)}
        >
          <option value="">Calidad sin definir</option>
          {qualities.map((quality) => (
            <option key={quality} value={quality}>{quality}</option>
          ))}
        </select>

        <input
          style={styles.input}
          placeholder="O crea una calidad personalizada"
          value={draft.customQuality || ''}
          onChange={(e) => applyCustomQuality(e.target.value)}
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
              {hasQualityPreset
                ? 'Tarifa por calidad cargada automaticamente. Puedes editar cualquier campo.'
                : isKidsAudience(draft.audience)
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
        quality: 'Todas',
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
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : '1.2fr .7fr .7fr .8fr .8fr .8fr', alignItems: 'end' }}>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
                    Nombre de regla
                    <input style={styles.input} value={rule.label || ''} onChange={(event) => updateRule(index, 'label', event.target.value)} />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
                    Marca
                    <input style={styles.input} value={rule.brand || ''} onChange={(event) => updateRule(index, 'brand', event.target.value)} placeholder="Todas o Levi" />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
                    Calidad
                    <input style={styles.input} value={rule.quality || 'Todas'} onChange={(event) => updateRule(index, 'quality', event.target.value)} placeholder="Todas o Premium" />
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

                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(7, 1fr)', marginTop: 12 }}>
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

function SizeRankingAdmin({ orders, products }) {
  const isMobile = useIsMobile()
  const productMap = useMemo(
    () => new Map((products || []).map((product) => [String(product.id), product])),
    [products]
  )

  const rankings = useMemo(() => {
    const byQuality = new Map()

    ;(orders || []).forEach((order) => {
      if (order.status === 'cancelado') return

      normalizeOrderItems(order.items_json).forEach((item) => {
        const product = productMap.get(String(getOrderItemProductId(item)))
        const quality = String(item.quality || product?.quality || 'Sin calidad').trim() || 'Sin calidad'
        if (!byQuality.has(quality)) byQuality.set(quality, new Map())
        const sizeMap = byQuality.get(quality)

        if (item.package_mode || item.packageMode) {
          const counts = parsePackageSizeCounts(
            item.package_breakdown || item.packageBreakdown || product?.package_breakdown || product?.package_fit || '',
            Number(item.quantity || 1)
          )

          if (counts.size) {
            counts.forEach((qty, size) => {
              sizeMap.set(size, (sizeMap.get(size) || 0) + Number(qty || 0))
            })
          } else {
            sizeMap.set(
              'Paquete cerrado',
              (sizeMap.get('Paquete cerrado') || 0) + Number(item.pieces || item.package_pieces || item.quantity || 0)
            )
          }
          return
        }

        const size = String(item.size || 'Sin talla').trim() || 'Sin talla'
        const pieces = Number(item.quantity || item.pieces || 0)
        sizeMap.set(size, (sizeMap.get(size) || 0) + pieces)
      })
    })

    return [...byQuality.entries()]
      .map(([quality, sizeMap]) => {
        const sizes = [...sizeMap.entries()]
          .map(([size, pieces]) => ({ size, pieces }))
          .sort((a, b) => b.pieces - a.pieces)
        return {
          quality,
          total: sizes.reduce((sum, item) => sum + Number(item.pieces || 0), 0),
          sizes,
        }
      })
      .filter((group) => group.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [orders, productMap])

  return (
    <div style={{ ...styles.card, padding: 24 }}>
      <h3 style={{ margin: 0, fontSize: 28 }}>Ranking de tallas por calidad</h3>
      <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
        Calculado con pedidos activos, confirmados, entregados y solicitudes inmediatas. Los cancelados no cuentan.
      </p>

      {rankings.length ? (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', marginTop: 18 }}>
          {rankings.map((group) => (
            <div key={group.quality} style={{ border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: 22 }}>{group.quality}</h4>
                <Badge bg="#ecfdf5" color="#047857">{group.total} pz</Badge>
              </div>
              <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                {group.sizes.slice(0, 10).map((item, index) => (
                  <div key={item.size} style={{ display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: 10, alignItems: 'center' }}>
                    <strong>{index + 1}.</strong>
                    <span style={{ fontWeight: 900 }}>{item.size}</span>
                    <span style={{ color: '#6b7280', fontWeight: 900 }}>{item.pieces} pz</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 18, border: '1px dashed #d1d5db', borderRadius: 18, padding: 22, color: '#6b7280' }}>
          Todavia no hay pedidos suficientes para generar ranking.
        </div>
      )}
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
    try {
      if (status === 'cancelado' && order.status !== 'cancelado') {
        await restoreOrderStock(order)
      }

      const { error } = await supabase.from('orders').update(payload).eq('id', order.id)
      if (error) throw error

      await fetchOrders()
    } catch (error) {
      alert('No se pudo actualizar pedido: ' + (error.message || error))
    } finally {
      setSavingId(null)
    }
  }

  const dashboard = useMemo(() => {
    const delivered = orders.filter((order) => order.status === 'entregado').length
    const canceled = orders.filter((order) => order.status === 'cancelado').length
    const immediate = orders.filter(orderIsImmediate).length
    const pending = orders.filter((order) => !orderIsArchived(order.status) && !orderIsImmediate(order)).length
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
      immediate,
      pending,
      topPieces: [...byPieces.values()].sort((a, b) => b.value - a.value).slice(0, 5),
      topOrders: [...byOrders.values()].sort((a, b) => b.value - a.value).slice(0, 5),
    }
  }, [orders])

  const visibleOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase()
    return orders
      .filter((order) => {
        if (mode === 'inmediata') return orderIsImmediate(order)
        if (mode === 'archivados') return orderIsArchived(order.status) && !orderIsImmediate(order)
        return !orderIsArchived(order.status) && !orderIsImmediate(order)
      })
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

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', marginTop: 18 }}>
        {[
          ['Pendientes', dashboard.pending],
          ['Entrega inmediata', dashboard.immediate],
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
          ['inmediata', 'Compra o entrega inmediata'],
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
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [takeQuantities, setTakeQuantities] = useState({})
  const [immediateLoading, setImmediateLoading] = useState(false)

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

  const setTakeQuantity = (order, itemIndex, value) => {
    const items = normalizeOrderItems(order.items_json)
    const max = getOrderItemQuantity(items[itemIndex])
    const clean = Math.max(0, Math.min(Number(value || 0), max))
    setTakeQuantities((prev) => ({ ...prev, [`${order.id}-${itemIndex}`]: clean }))
  }

  const requestImmediateDelivery = async (order) => {
    const originalItems = normalizeOrderItems(order.items_json)
    const selectedItems = []
    const remainingItems = []

    originalItems.forEach((item, idx) => {
      const originalQuantity = getOrderItemQuantity(item)
      const selectedQuantity = Math.max(0, Math.min(Number(takeQuantities[`${order.id}-${idx}`] || 0), originalQuantity))
      if (selectedQuantity > 0) selectedItems.push(getScaledOrderItem(item, selectedQuantity))
      if (originalQuantity - selectedQuantity > 0) remainingItems.push(getScaledOrderItem(item, originalQuantity - selectedQuantity))
    })

    if (!selectedItems.length) {
      alert('Selecciona al menos una pieza o paquete para entrega inmediata.')
      return
    }

    const sourceNumber = getOrderNumber(order)
    const immediateNumber = `${sourceNumber}-ENT-${String(Date.now()).slice(-5)}`
    const selectedSummary = summarizeOrderItems(selectedItems)
    const remainingSummary = summarizeOrderItems(remainingItems)
    const messageItems = selectedItems
      .map((item, idx) => {
        const detail = item.package_mode
          ? `${item.quantity} paquete(s) x ${item.package_pieces || item.pieces || ''} pz - ${item.package_breakdown || 'corrida por confirmar'}`
          : `Talla ${item.size || '-'} - ${item.quantity} pz`
        return `${idx + 1}. ${item.name}\n   ${detail}\n   Piezas: ${getOrderItemPieces(item)}\n   Importe: ${mxn(item.total)}`
      })
      .join('\n\n')

    setImmediateLoading(true)
    try {
      const { error: insertError } = await supabase.from('orders').insert([{
        customer_name: order.customer_name || '',
        customer_phone: order.customer_phone || '',
        customer_city: order.customer_city || '',
        delivery: 'Entrega inmediata',
        notes: [
          `Numero pedido: ${immediateNumber}`,
          `Entrega inmediata del apartado ${sourceNumber}`,
          order.price_level ? `Tarifa: ${order.price_level}` : '',
        ].filter(Boolean).join(' | '),
        items_json: selectedItems,
        total_pieces: selectedSummary.pieces,
        subtotal: selectedSummary.subtotal,
        price_level: order.price_level || '',
        status: 'entrega_inmediata',
        whatsapp_sent: true,
      }])

      if (insertError) throw insertError

      const nextNotes = [
        order.notes || '',
        `Entrega inmediata generada: ${immediateNumber}`,
      ].filter(Boolean).join(' | ')

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          items_json: remainingItems,
          total_pieces: remainingSummary.pieces,
          subtotal: remainingSummary.subtotal,
          notes: nextNotes,
          status: remainingItems.length ? (order.status || 'nuevo') : 'entregado',
        })
        .eq('id', order.id)

      if (updateError) throw updateError

      const msg =
        'ENTREGA INMEDIATA DENIM CLICK\n\n' +
        `Del apartado ${sourceNumber} quiero estas piezas en este momento.\n` +
        `Solicitud: ${immediateNumber}\n` +
        `Cliente: ${order.customer_name || '-'}\n` +
        `Telefono: ${order.customer_phone || '-'}\n\n` +
        messageItems +
        `\n\nTotal de piezas: ${selectedSummary.pieces}\n` +
        `Monto a pagar ahora: ${mxn(selectedSummary.subtotal)}`

      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer')
      setTakeQuantities((prev) => {
        const next = { ...prev }
        originalItems.forEach((_, idx) => delete next[`${order.id}-${idx}`])
        return next
      })
      await findOrders({ silent: true })
    } catch (error) {
      alert('No se pudo generar la entrega inmediata: ' + (error.message || 'Intenta de nuevo.'))
    } finally {
      setImmediateLoading(false)
    }
  }

  const orderList = orders.length > 0 ? (
    <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
      {orders.map((order) => {
        const meta = getOrderStatusMeta(order.status)
        const items = normalizeOrderItems(order.items_json)
        const canTakeNow = !orderIsArchived(order.status) && !orderIsImmediate(order) && items.some((item) => getOrderItemQuantity(item) > 0)
        const expanded = expandedOrderId === order.id
        return (
          <div
            key={order.id}
            style={{
              border: variant === 'footer' ? '1px solid rgba(255,255,255,.12)' : '1px solid #e5e7eb',
              borderRadius: 14,
              padding: 12,
              background: variant === 'footer' ? 'rgba(255,255,255,.04)' : '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
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
            {canTakeNow ? (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  style={styles.buttonSecondary}
                  onClick={() => setExpandedOrderId(expanded ? null : order.id)}
                >
                  {expanded ? 'Ocultar piezas' : 'Seleccionar piezas para llevar ahora'}
                </button>
              </div>
            ) : null}
            {expanded ? (
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {items.map((item, idx) => {
                  const max = getOrderItemQuantity(item)
                  if (max <= 0) return null
                  const key = `${order.id}-${idx}`
                  return (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: item.image ? '52px 1fr auto' : '1fr auto', gap: 10, alignItems: 'center', border: '1px solid #eef2f7', borderRadius: 14, padding: 10 }}>
                      {item.image ? <img src={item.image} alt={item.name} loading="lazy" decoding="async" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10 }} /> : null}
                      <div>
                        <strong>{item.name}</strong>
                        <div style={{ color: '#6b7280', marginTop: 3 }}>
                          {item.package_mode ? `Paquete cerrado (${max} disp.)` : `Talla ${item.size || '-'} (${max} disp.)`}
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={max}
                        value={takeQuantities[key] || 0}
                        onChange={(event) => setTakeQuantity(order, idx, event.target.value)}
                        style={{ ...styles.input, width: 82, textAlign: 'center' }}
                      />
                    </div>
                  )
                })}
                <button type="button" style={styles.buttonPrimary} onClick={() => requestImmediateDelivery(order)} disabled={immediateLoading}>
                  {immediateLoading ? 'Generando...' : 'Validar entrega inmediata'}
                </button>
              </div>
            ) : null}
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
  customFits,
  selectedConfig,
  setSelectedConfig,
  addToCart,
  addPackageToCart,
  cart,
  setCart,
  updateCartItemQty,
  removeCartItem,
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
  fetchProductImages,
  prefetchProductImages,
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
  const [lastUnitsSize, setLastUnitsSize] = useState('Todas')
  const [lastUnitsLength, setLastUnitsLength] = useState('Todos')
  const [heroVideoReady, setHeroVideoReady] = useState(false)
  const featuredResumeRef = useRef(null)
  const featuredTouchRef = useRef(null)

  useEffect(() => {
    if (specialClientSession?.active) setLoginOpen(false)
  }, [specialClientSession?.active])

  const visibleBrands = getStoreBrands(products, storeAudience)
  const visibleCategories = getStoreCategories(products, storeAudience)
  const visibleFits = useMemo(() => {
    return uniqueValues(
      products
        .filter(productHasVisibleStock)
        .filter((product) => productMatchesStoreAudience(product, storeAudience))
        .filter((product) => storeCategory === 'Todos' || product.category === storeCategory)
        .filter((product) => storeBrand === 'Todas' || product.brand === storeBrand)
        .map((product) => product.subcategory)
        .filter(Boolean)
    )
  }, [products, storeAudience, storeCategory, storeBrand])
  const lastUnitsSizeOptions = useMemo(() => {
    return uniqueValues(
      products
        .filter(productHasVisibleStock)
        .filter((product) => productMatchesStoreAudience(product, storeAudience))
        .filter((product) => storeCategory === 'Todos' || product.category === storeCategory)
        .filter((product) => storeBrand === 'Todas' || product.brand === storeBrand)
        .filter(isLastUnitsProduct)
        .flatMap((product) =>
          Object.entries(product.stock || {})
            .filter(([, qty]) => Number(qty || 0) > 0)
            .map(([size]) => size)
        )
    )
  }, [products, storeAudience, storeCategory, storeBrand])
  const lastUnitsLengthOptions = useMemo(() => {
    return uniqueValues(
      products
        .filter(productHasVisibleStock)
        .filter((product) => productMatchesStoreAudience(product, storeAudience))
        .filter((product) => storeCategory === 'Todos' || product.category === storeCategory)
        .filter((product) => storeBrand === 'Todas' || product.brand === storeBrand)
        .filter(isLastUnitsProduct)
        .flatMap((product) => String(product.lengths || '').split(/[,\s/]+/).map((length) => length.trim()).filter(Boolean))
    )
  }, [products, storeAudience, storeCategory, storeBrand])
  const activeProducts = useMemo(() => products.filter(productHasVisibleStock), [products])
  const featuredProducts = useMemo(() => activeProducts.filter((p) => getCover(p)), [activeProducts])
  const heroProduct = useMemo(() => {
    return [...featuredProducts].sort((a, b) => Number(b.sales_count || 0) - Number(a.sales_count || 0) || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0]
  }, [featuredProducts])
  const promoProducts = useMemo(() => activeProducts.filter((p) => p.is_offer && getCover(p)), [activeProducts])
  const offerProduct = promoProducts.length ? promoProducts[promoIndex % promoProducts.length] : heroProduct
  const homeHeroProduct = offerProduct || heroProduct
  const topRequestedProducts = useMemo(() => {
    return [...featuredProducts]
      .sort((a, b) => Number(b.sales_count || 0) - Number(a.sales_count || 0) || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 10)
  }, [featuredProducts])
  const topProducts = useMemo(() => {
    const selected = new Map()
    topRequestedProducts.forEach((product) => selected.set(String(product.id), product))
    promoProducts.forEach((product) => selected.set(String(product.id), product))
    return Array.from(selected.values())
  }, [promoProducts, topRequestedProducts])
  const totalPieces = useMemo(() => getCartTotalPieces(cart), [cart])
  
  const firstClientName = specialClientSession?.name
    ? String(specialClientSession.name).trim().split(' ')[0]
    : ''
  const isHomeView = storeAudience === 'Todo' && storeCategory === 'Todos' && storeBrand === 'Todas' && storeFit === 'Todos' && !search.trim()
  const featuredVisibleCount = isMobile ? 1 : 3
  const featuredMaxIndex = Math.max(0, topProducts.length - featuredVisibleCount)
  const featuredGap = isMobile ? 14 : 22
  const featuredCardBasis = isMobile ? '76vw' : 'clamp(300px, 28vw, 420px)'

  const openOrderStatusModal = (queryValue = '') => {
    setStatusInitialQuery(String(queryValue || '').trim())
    setStatusSearchToken((value) => value + 1)
    setOrderStatusOpen(true)
    setHelpMenuOpen(false)
  }

  const loadFullProductImages = useCallback((product, afterLoad) => {
    if (!product?.id || !fetchProductImages) return
    if (Array.isArray(product.images) && product.images.length > 1) return

    fetchProductImages(product.id).then((images) => {
      if (!Array.isArray(images) || images.length <= 1) return
      afterLoad({ ...product, images })
    })
  }, [fetchProductImages])

  const openQuickViewProduct = useCallback((product) => {
    if (!product) return
    setQuickViewProduct(product)
    loadFullProductImages(product, (hydratedProduct) => {
      setQuickViewProduct((current) =>
        current && String(current.id) === String(hydratedProduct.id)
          ? hydratedProduct
          : current
      )
    })
  }, [loadFullProductImages])

  const openGalleryProduct = useCallback((product, imageIndex = 0) => {
    if (!product) return
    setGallery({
      open: true,
      product,
      imageIndex,
    })
    loadFullProductImages(product, (hydratedProduct) => {
      setGallery((current) =>
        current.open && current.product && String(current.product.id) === String(hydratedProduct.id)
          ? { ...current, product: hydratedProduct }
          : current
      )
    })
  }, [loadFullProductImages, setGallery])

  const scrollToHelpSection = () => {
    setHelpMenuOpen(false)
    setStoreAudience('Todo')
    setStoreCategory('Todos')
    setStoreFit('Todos')
    setStoreBrand('Todas')
    setSearch('')
    setOpenMegaMenu(false)
    setMobileMenuOpen(false)
    setShowHomeCatalog(false)
    window.setTimeout(() => {
      const target = document.getElementById('ayuda')
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const openImprovePriceInfo = () => {
    setHelpMenuOpen(false)
    setLoginOpen(true)
  }

  const filteredProducts = useMemo(() => {
    let list = [...products].filter(productHasVisibleStock)

    if (storeAudience !== 'Todo') list = list.filter((p) => productMatchesStoreAudience(p, storeAudience))
    if (storeCategory !== 'Todos') list = list.filter((p) => p.category === storeCategory)
    if (storeBrand !== 'Todas') list = list.filter((p) => p.brand === storeBrand)
    if (storeFit === LAST_UNITS_FILTER) {
      list = list.filter((p) => isLastUnitsProduct(p))
      if (lastUnitsSize !== 'Todas') {
        list = list.filter((p) => Number(p.stock?.[lastUnitsSize] || 0) > 0)
      }
      if (lastUnitsLength !== 'Todos') {
        list = list.filter((p) => String(p.lengths || '').split(/[,\s/]+/).map((length) => length.trim()).includes(lastUnitsLength))
      }
    } else if (storeFit !== 'Todos') list = list.filter((p) => p.subcategory === storeFit)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        `${p.name} ${p.model_po || ''} ${p.category} ${p.subcategory} ${p.brand} ${p.quality || ''} ${p.audience}`.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      const lastUnitsFilterActive = storeFit === LAST_UNITS_FILTER
      const aTailCatalog = !lastUnitsFilterActive && (isLastUnitsProduct(a) || productHasOnlyOneImage(a))
      const bTailCatalog = !lastUnitsFilterActive && (isLastUnitsProduct(b) || productHasOnlyOneImage(b))
      if (aTailCatalog !== bTailCatalog) return aTailCatalog ? 1 : -1

      const aPriority = (a.is_offer ? 2000000 : 0) + (a.is_new ? 1000000 : 0) + Number(a.sales_count || 0) * 1000 + new Date(a.created_at || 0).getTime()
      const bPriority = (b.is_offer ? 2000000 : 0) + (b.is_new ? 1000000 : 0) + Number(b.sales_count || 0) * 1000 + new Date(b.created_at || 0).getTime()
      return bPriority - aPriority
    })

    return list
  }, [products, storeAudience, storeCategory, storeBrand, storeFit, lastUnitsSize, lastUnitsLength, search])

  useEffect(() => {
    setPage(1)
  }, [storeAudience, storeCategory, storeBrand, storeFit, search])

  useEffect(() => {
    if (storeFit !== 'Todos' && storeFit !== LAST_UNITS_FILTER && !visibleFits.includes(storeFit)) {
      setStoreFit('Todos')
    }
  }, [storeFit, visibleFits, setStoreFit])

  useEffect(() => {
    if (storeFit !== LAST_UNITS_FILTER) {
      if (lastUnitsSize !== 'Todas') setLastUnitsSize('Todas')
      if (lastUnitsLength !== 'Todos') setLastUnitsLength('Todos')
      return
    }
    if (lastUnitsSize !== 'Todas' && !lastUnitsSizeOptions.includes(lastUnitsSize)) {
      setLastUnitsSize('Todas')
    }
    if (lastUnitsLength !== 'Todos' && !lastUnitsLengthOptions.includes(lastUnitsLength)) {
      setLastUnitsLength('Todos')
    }
  }, [storeFit, lastUnitsSize, lastUnitsSizeOptions, lastUnitsLength, lastUnitsLengthOptions])

  const pageSize = isMobile ? PRODUCT_PAGE_SIZE_MOBILE : PRODUCT_PAGE_SIZE_DESKTOP
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, currentPage, pageSize])

  useEffect(() => {
    if (!prefetchProductImages) return undefined
    const visibleIds = [
      ...topProducts.slice(0, isMobile ? 6 : 10).map((product) => product.id),
      ...paginatedProducts.slice(0, isMobile ? 8 : 14).map((product) => product.id),
    ]
    const id = window.setTimeout(() => {
      prefetchProductImages(visibleIds)
    }, isMobile ? 450 : 250)
    return () => window.clearTimeout(id)
  }, [isMobile, paginatedProducts, prefetchProductImages, topProducts])

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
    const id = window.setTimeout(() => setHeroVideoReady(true), isMobile ? 250 : 250)
    return () => window.clearTimeout(id)
  }, [isHomeView, isMobile])

  useEffect(() => {
    if (!isHomeView || topProducts.length <= featuredVisibleCount || featuredPaused) return undefined
    const id = window.setInterval(() => {
      setFeaturedIndex((prev) => (prev >= featuredMaxIndex ? 0 : prev + 1))
    }, isMobile ? 3200 : 3000)
    return () => window.clearInterval(id)
  }, [featuredMaxIndex, featuredPaused, featuredVisibleCount, isHomeView, isMobile, topProducts.length])

  useEffect(() => {
    if (featuredIndex > featuredMaxIndex) setFeaturedIndex(0)
  }, [featuredIndex, featuredMaxIndex])

  useEffect(() => {
    return () => {
      if (featuredResumeRef.current) window.clearTimeout(featuredResumeRef.current)
    }
  }, [])

  const pauseFeaturedCarousel = () => {
    setFeaturedPaused(true)
    if (featuredResumeRef.current) window.clearTimeout(featuredResumeRef.current)
  }

  const resumeFeaturedCarouselSoon = () => {
    if (featuredResumeRef.current) window.clearTimeout(featuredResumeRef.current)
    featuredResumeRef.current = window.setTimeout(() => setFeaturedPaused(false), isMobile ? 1600 : 250)
  }

  const moveFeaturedCarousel = useCallback((direction) => {
    setFeaturedIndex((prev) => {
      if (featuredMaxIndex <= 0) return 0
      if (direction < 0) return prev <= 0 ? featuredMaxIndex : prev - 1
      return prev >= featuredMaxIndex ? 0 : prev + 1
    })
  }, [featuredMaxIndex])

  const handleFeaturedTouchStart = (event) => {
    pauseFeaturedCarousel()
    if (event.target?.closest?.('[data-product-media="true"]')) {
      featuredTouchRef.current = null
      return
    }
    featuredTouchRef.current = event.touches?.[0]?.clientX ?? null
  }

  const handleFeaturedTouchEnd = (event) => {
    const start = featuredTouchRef.current
    featuredTouchRef.current = null
    if (typeof start === 'number') {
      const end = event.changedTouches?.[0]?.clientX ?? start
      const diff = start - end
      if (Math.abs(diff) > 42) moveFeaturedCarousel(diff > 0 ? 1 : -1)
    }
    resumeFeaturedCarouselSoon()
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
                {getStoreAudiences(products).map((aud) => (
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
        customFits={customFits}
      />

      {isHomeView && !showHomeCatalog ? (
        <>
          <section style={{ padding: 0, background: '#111315', width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
            <div style={{ maxWidth: 'none', margin: 0, padding: 0 }}>
              <div
                style={{
                  position: 'relative',
                  minHeight: isMobile ? 'clamp(560px, calc(100svh - 82px), 760px)' : 680,
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
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: isMobile ? '50% 35%' : 'center' }}
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
                    preload="metadata"
                    poster={homeHeroProduct && getCover(homeHeroProduct) ? getCover(homeHeroProduct) : undefined}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: isMobile ? '50% 35%' : 'center' }}
                  />
                ) : null}

                <div style={{ position: 'absolute', inset: 0, background: isMobile ? 'linear-gradient(180deg, rgba(0,0,0,.06) 0%, rgba(0,0,0,.18) 44%, rgba(0,0,0,.86) 100%)' : 'linear-gradient(180deg, rgba(0,0,0,.10) 20%, rgba(0,0,0,.82) 100%)' }} />

                <div style={{ position: 'absolute', left: isMobile ? 18 : 42, right: isMobile ? 18 : 42, bottom: isMobile ? 22 : 44 }}>
                  <h1 style={{ margin: '10px 0 0', fontSize: isMobile ? 40 : 78, lineHeight: .96, maxWidth: 880 }}>
                    Apartado por mayoreo
                  </h1>
                  <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,.86)', fontSize: isMobile ? 16 : 21, maxWidth: 720, lineHeight: 1.45 }}>
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
                      onClick={() => {
                        setShowHomeCatalog(true)
                        setStoreAudience('Oferta')
                        setStoreCategory('Todos')
                        setStoreBrand('Todas')
                        setStoreFit('Todos')
                        setStoreQuality('Todas')
                        setStoreSearch('')
                        window.setTimeout(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }), 0)
                      }}
                      style={{ ...styles.buttonSecondary, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.38)', borderRadius: 999 }}
                    >
                      <ShoppingBag size={18} />
                      Ver ofertas
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
                {!isMobile && featuredMaxIndex > 0 ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      aria-label="Ver destacados anteriores"
                      onClick={() => moveFeaturedCarousel(-1)}
                      onMouseEnter={pauseFeaturedCarousel}
                      onMouseLeave={resumeFeaturedCarouselSoon}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 999,
                        border: '1px solid #d1d5db',
                        background: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      aria-label="Ver mas destacados"
                      onClick={() => moveFeaturedCarousel(1)}
                      onMouseEnter={pauseFeaturedCarousel}
                      onMouseLeave={resumeFeaturedCarouselSoon}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 999,
                        border: '1px solid #d1d5db',
                        background: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronRight size={22} />
                    </button>
                  </div>
                ) : null}
              </div>

              <div
                className="featured-products-window"
                style={{
                  display: 'block',
                  overflow: 'hidden',
                  touchAction: 'pan-y',
                }}
              >
                <div
                  className="featured-products-track"
                  onTouchStart={handleFeaturedTouchStart}
                  onTouchEnd={handleFeaturedTouchEnd}
                  onTouchCancel={() => {
                    featuredTouchRef.current = null
                    resumeFeaturedCarouselSoon()
                  }}
                  onMouseEnter={pauseFeaturedCarousel}
                  onMouseLeave={resumeFeaturedCarouselSoon}
                  style={{
                    display: 'flex',
                    gap: featuredGap,
                    alignItems: 'start',
                    width: 'max-content',
                    transform: `translateX(calc(-${featuredIndex} * (${featuredCardBasis} + ${featuredGap}px)))`,
                    transition: featuredPaused ? 'none' : 'transform .65s cubic-bezier(.2,.8,.2,1)',
                    willChange: 'transform',
                  }}
                >
                  {topProducts.map((product) => (
                    <HomeFeaturedProductCard
                      key={product.id}
                      product={product}
                      isMobile={isMobile}
                      onOpenGallery={openGalleryProduct}
                      onOpenQuickView={openQuickViewProduct}
                      fetchProductImages={fetchProductImages}
                      cardBasis={featuredCardBasis}
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
              gridTemplateColumns: isMobile ? '1fr 1fr' : '1.25fr .8fr .8fr .8fr',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', gridColumn: isMobile ? '1 / -1' : 'auto' }}>
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
              onChange={(e) => {
                setStoreBrand(e.target.value)
                setStoreFit('Todos')
              }}
            >
              <option value="Todas">Todas las marcas</option>
              {visibleBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              style={{ ...styles.input, gridColumn: isMobile && visibleFits.length <= 1 ? '1 / -1' : 'auto' }}
              value={storeFit}
              onChange={(e) => setStoreFit(e.target.value)}
            >
              <option value="Todos">Todos los fits</option>
              {visibleFits.map((fit) => (
                <option key={fit} value={fit}>{fit}</option>
              ))}
            </select>
          </div>

          {storeFit === LAST_UNITS_FILTER ? (
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: isMobile ? '1fr' : '260px 220px', marginTop: 12 }}>
              <select
                style={styles.input}
                value={lastUnitsSize}
                onChange={(e) => setLastUnitsSize(e.target.value)}
                aria-label="Filtrar ultimas piezas por talla"
              >
                <option value="Todas">Todas las tallas disponibles</option>
                {lastUnitsSizeOptions.map((size) => (
                  <option key={size} value={size}>Talla {size}</option>
                ))}
              </select>
              <select
                style={styles.input}
                value={lastUnitsLength}
                onChange={(e) => setLastUnitsLength(e.target.value)}
                aria-label="Filtrar ultimas piezas por largo"
              >
                <option value="Todos">Todos los largos</option>
                {lastUnitsLengthOptions.map((length) => (
                  <option key={length} value={length}>Largo {length}</option>
                ))}
              </select>
            </div>
          ) : null}
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
                  onAddPackageToCart={addPackageToCart}
                  onOpenGallery={openGalleryProduct}
                  onOpenQuickView={openQuickViewProduct}
                  specialClientSession={specialClientSession}
                  getCartUnitPrice={getCartUnitPrice}
                  totalPieces={totalPieces}
                  isMobile={isMobile}
                  fetchProductImages={fetchProductImages}
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
        onOpenGallery={openGalleryProduct}
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
        onUpdateCartItemQty={updateCartItemQty}
        onRemoveCartItem={removeCartItem}
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
    const finalQuality = draft.customQuality?.trim() || draft.quality || ''
    return { ...draft, category: finalCategory, subcategory: finalSubcategory, brand: finalBrand, quality: finalQuality }
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
    const { data, error } = await supabase.from('products').insert([payload]).select('id,created_at').single()
    setLoading(false)

    if (error) {
      alert('No se pudo crear el producto: ' + getFriendlyProductError(error))
      return
    }

    const inserted = { ...payload, ...data }
    if (inserted?.id) {
      setProducts((prev) => [normalizeProduct(inserted), ...prev.filter((product) => String(product.id) !== String(inserted.id))])
      const defaultTierPrices = getDefaultTierPricesForProduct(clean, specialPriceRules)
      await supabase.from('product_customer_prices').insert(
        CLIENT_TIERS.map((tier) => ({
          product_id: inserted.id,
          client_tier: tier,
          price: Number(defaultTierPrices[tier] || 0),
        }))
      )
      await fetchTierPrices()
    }

    setNewProductDraft(buildEmptyProduct())
    setShowProductForm(false)
  }

  const startEdit = async (product) => {
    setEditingId(product.id)
    setEditingDraft({ ...product, customCategory: '', customSubcategory: '', customBrand: '', customQuality: '' })
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
    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', editingId)
    setLoading(false)

    if (error) {
      alert('No se pudo actualizar el producto: ' + getFriendlyProductError(error))
      return
    }

    const nextProduct = normalizeProduct({
      ...(originalProduct ? productToDb(originalProduct) : {}),
      ...payload,
      id: editingId,
      created_at: originalProduct?.created_at,
    })
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
                {product.quality ? <Badge bg="#f5f3ff" color="#6d28d9">{product.quality}</Badge> : null}
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

          {activeTab === 'rankingTallas' ? (
            <SizeRankingAdmin orders={orders} products={products} />
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
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState(emptyCustomer)

  const [gallery, setGallery] = useState({
    open: false,
    product: null,
    imageIndex: 0,
  })

  const [specialCode, setSpecialCode] = useState('')
  const [specialClientSession, setSpecialClientSession] = useState(null)
  const productImagesCacheRef = useRef(new Map())

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
    const cacheKey = String(productId || '')
    if (!cacheKey) return []
    if (productImagesCacheRef.current.has(cacheKey)) {
      return productImagesCacheRef.current.get(cacheKey)
    }

    const { data, error } = await supabase
      .from('products')
      .select('id,images,images_json')
      .eq('id', productId)
      .single()
    if (error || !data) return []

    let images = []
    if (Array.isArray(data.images_json)) {
      images = data.images_json.filter(Boolean)
    } else if (typeof data.images_json === 'string' && data.images_json.trim()) {
      try {
        const parsed = JSON.parse(data.images_json)
        images = Array.isArray(parsed) ? parsed.filter(Boolean) : []
      } catch {
        images = data.images ? [data.images] : []
      }
    } else {
      images = data.images ? [data.images] : []
    }

    productImagesCacheRef.current.set(cacheKey, images)
    return images
  }

  async function prefetchProductImages(productIds) {
    const ids = uniqueValues((productIds || []).map((id) => String(id || '')).filter(Boolean))
      .filter((id) => !productImagesCacheRef.current.has(id))

    if (!ids.length) return

    const { data, error } = await supabase
      .from('products')
      .select('id,images,images_json')
      .in('id', ids)

    if (error) {
      console.warn('No se pudieron precargar imagenes:', error.message)
      return
    }

    ;(data || []).forEach((row) => {
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
      } else {
        images = row.images ? [row.images] : []
      }
      productImagesCacheRef.current.set(String(row.id), images)
    })
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
    if (!specialClientSession?.active) return
    saveClientCart(specialClientSession, cart)
  }, [cart, specialClientSession])

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_SESSION_KEY)
    if (saved === 'true') setIsAdminAuthenticated(true)

    const specialSaved = localStorage.getItem(SPECIAL_CLIENT_SESSION_KEY)
    if (specialSaved) {
      try {
        const parsed = JSON.parse(specialSaved)
        if (parsed && parsed.active !== false) {
          const restoredClient = { ...parsed, active: true }
          setSpecialClientSession(restoredClient)
          setCart(readClientCart(restoredClient))
        }
      } catch {
        // Ignore invalid stored client sessions.
      }
    }
  }, [])

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
    if (product?.is_offer && Number(product.offer_price || 0) > 0) {
      return Number(product.offer_price || 0)
    }

    const normalPrice = tier.key === 'price'
      ? getProductBasePrice(product)
      : Number(product[tier.key] || getProductBasePrice(product))

    if (specialClientSession?.active) {
      const tierName = specialClientSession.client_tier || ''
      const specialUnlocked = tierName !== 'Plata' || totalPieces >= 10
      if (specialUnlocked) {
        const clientOverridePrice = getClientProductPriceOverride(product, specialClientSession)
        if (clientOverridePrice > 0) return clientOverridePrice
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
    const size = selection?.size
    const quantity = Number(selection?.quantity || 0)
    if (!size || quantity <= 0) return false

    const stock = Number(product.stock?.[size] || 0)
    if (quantity > stock) {
      alert('La cantidad supera el stock disponible.')
      return false
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (item) => !item.packageMode && item.product.id === product.id && item.size === size
      )

      if (index >= 0) {
        const next = [...prev]
        const currentQty = Number(next[index].quantity || 0)
        const newQty = Math.min(currentQty + stock, currentQty + quantity)
        next[index] = { ...next[index], product, quantity: newQty }
        return next
      }

      return [...prev, { product, size, quantity, packageMode: false }]
    })

    setProducts((prevProducts) =>
      prevProducts.map((currentProduct) => {
        if (String(currentProduct.id) !== String(product.id)) return currentProduct
        const nextStock = { ...(currentProduct.stock || {}) }
        nextStock[size] = Math.max(0, Number(nextStock[size] || 0) - quantity)
        const nextStockTotal = totalStock(nextStock)
        return {
          ...currentProduct,
          stock: nextStock,
          stock_total: nextStockTotal,
          active: nextStockTotal > 0 || Number(currentProduct.package_stock || 0) > 0,
        }
      })
    )

    setSelectedConfig((prev) => ({
      ...prev,
      [product.id]: {
        size: '',
        quantity: 0,
      },
    }))

    return true
  }

  const addPackageToCart = (product, quantity = 1, packageBreakdown = '', selectedPackageSizes = null) => {
    const packageStock = Number(product.package_stock || 0)
    const cleanQty = Math.max(1, Math.min(Number(quantity || 1), packageStock))
    const packagePieces = getPackagePieces(product)
    const cleanBreakdown = String(packageBreakdown || product.package_breakdown || product.package_fit || '').trim()
    const selectionEntries = Object.entries(selectedPackageSizes || {})
      .map(([size, qty]) => [String(size).toUpperCase(), Number(qty || 0)])
      .filter(([, qty]) => qty > 0)
    const isPartialPackage = selectionEntries.length > 0
    const selectedPieces = selectionEntries.reduce((sum, [, qty]) => sum + qty, 0)
    const packageCounts = buildPackageSelectionStock(product, cleanQty)
    const fullPackagePieces = [...packageCounts.values()].reduce((sum, qty) => sum + Number(qty || 0), 0) || packagePieces * cleanQty

    if (packageStock <= 0) {
      alert('Este producto no tiene paquetes cerrados disponibles.')
      return false
    }

    if (isPartialPackage && selectedPieces <= 0) {
      alert('Selecciona al menos una pieza del paquete.')
      return false
    }

    if (isPartialPackage) {
      const invalid = selectionEntries.find(([size, qty]) => qty > Number(packageCounts.get(size) || 0))
      if (invalid) {
        alert('La talla ' + invalid[0] + ' supera la cantidad disponible en el paquete.')
        return false
      }
    }

    setCart((prev) => {
      if (isPartialPackage) {
        const selectedStock = Object.fromEntries(selectionEntries)
        const selectedText = packageCountsToText(selectedStock)
        const index = prev.findIndex(
          (item) =>
            item.packagePartial &&
            item.product.id === product.id &&
            String(item.packageBreakdown || '') === selectedText
        )

        if (index >= 0) {
          const next = [...prev]
          const currentQty = Number(next[index].quantity || 0)
          const mergedStock = {
            ...(next[index].selectedStock || {}),
            ...Object.fromEntries(
              Object.entries(selectedStock).map(([size, qty]) => [
                size,
                Number(next[index].selectedStock?.[size] || 0) + Number(qty || 0),
              ])
            ),
          }
          next[index] = {
            ...next[index],
            product,
            quantity: currentQty + selectedPieces,
            selectedStock: mergedStock,
            packageBreakdown: packageCountsToText(mergedStock),
            unitPriceOverride: Number(getCartUnitPrice(product) || getPackageUnitPrice(product)),
          }
          return next
        }

        return [
          ...prev,
          {
            product,
            size: 'Tallas de paquete',
            quantity: selectedPieces,
            packageMode: false,
            packagePartial: true,
            packagePieces: selectedPieces,
            packageBreakdown: selectedText,
            selectedStock,
            sourcePackageQty: cleanQty,
            unitPriceOverride: Number(getCartUnitPrice(product) || getPackageUnitPrice(product)),
          },
        ]
      }

      const index = prev.findIndex(
        (item) =>
          item.packageMode &&
          item.product.id === product.id &&
          String(item.packageBreakdown || '') === cleanBreakdown
      )

      if (index >= 0) {
        const next = [...prev]
        const currentQty = Number(next[index].quantity || 0)
        next[index] = {
          ...next[index],
          product,
          quantity: Math.min(packageStock, currentQty + cleanQty),
          packagePieces,
          packageBreakdown: cleanBreakdown,
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
          packagePieces,
          packageBreakdown: cleanBreakdown,
        },
      ]
    })

    setProducts((prevProducts) =>
      prevProducts.map((currentProduct) => {
        if (String(currentProduct.id) !== String(product.id)) return currentProduct
        const nextPackageStock = Math.max(0, Number(currentProduct.package_stock || 0) - cleanQty)
        const nextStock = { ...(currentProduct.stock || {}) }
        if (isPartialPackage) {
          const selectedMap = new Map(selectionEntries)
          const currentPackageCounts = buildPackageSelectionStock(currentProduct, cleanQty)
          currentPackageCounts.forEach((qty, size) => {
            const remaining = Math.max(0, Number(qty || 0) - Number(selectedMap.get(size) || 0))
            if (remaining > 0) nextStock[size] = Number(nextStock[size] || 0) + remaining
          })
        }
        const looseStock = totalStock(nextStock)
        return {
          ...currentProduct,
          sizes: mergeProductSizes(currentProduct, nextStock),
          stock: nextStock,
          stock_total: looseStock,
          package_stock: nextPackageStock,
          active: looseStock > 0 || nextPackageStock > 0,
        }
      })
    )

    return true
  }

  const returnCartItemStock = (item, quantity = Number(item?.quantity || 0)) => {
    if (!item || quantity <= 0) return
    setProducts((prevProducts) =>
      prevProducts.map((currentProduct) => {
        if (String(currentProduct.id) !== String(item.product.id)) return currentProduct
        if (item.packageMode) {
          const nextPackageStock = Number(currentProduct.package_stock || 0) + Number(quantity || 0)
          return {
            ...currentProduct,
            package_stock: nextPackageStock,
            active: totalStock(currentProduct.stock) > 0 || nextPackageStock > 0,
          }
        }

        const stockToReturn = getCartItemStockMap(item, quantity)
        const nextStock = { ...(currentProduct.stock || {}) }
        Object.entries(stockToReturn).forEach(([size, qty]) => {
          nextStock[size] = Number(nextStock[size] || 0) + Number(qty || 0)
        })
        const nextStockTotal = totalStock(nextStock)
        return {
          ...currentProduct,
          stock: nextStock,
          stock_total: nextStockTotal,
          active: nextStockTotal > 0 || Number(currentProduct.package_stock || 0) > 0,
        }
      })
    )
  }

  const takeCartItemStock = (item, quantity = 1) => {
    if (!item || quantity <= 0) return false
    let allowed = true
    setProducts((prevProducts) =>
      prevProducts.map((currentProduct) => {
        if (String(currentProduct.id) !== String(item.product.id)) return currentProduct
        if (item.packageMode) {
          const currentStock = Number(currentProduct.package_stock || 0)
          if (quantity > currentStock) {
            allowed = false
            return currentProduct
          }
          const nextPackageStock = currentStock - quantity
          return {
            ...currentProduct,
            package_stock: nextPackageStock,
            active: totalStock(currentProduct.stock) > 0 || nextPackageStock > 0,
          }
        }

        if (item.packagePartial) {
          allowed = false
          return currentProduct
        }

        const currentStock = Number(currentProduct.stock?.[item.size] || 0)
        if (quantity > currentStock) {
          allowed = false
          return currentProduct
        }
        const nextStock = { ...(currentProduct.stock || {}) }
        nextStock[item.size] = currentStock - quantity
        const nextStockTotal = totalStock(nextStock)
        return {
          ...currentProduct,
          stock: nextStock,
          stock_total: nextStockTotal,
          active: nextStockTotal > 0 || Number(currentProduct.package_stock || 0) > 0,
        }
      })
    )
    return allowed
  }

  const updateCartItemQty = (index, nextQty) => {
    const item = cart[index]
    if (!item) return
    const currentQty = Number(item.quantity || 0)
    const max = getCartItemMaxQuantity(item)
    const clean = Math.max(0, Math.min(Number(nextQty || 0), max))
    const diff = clean - currentQty
    if (diff > 0 && !takeCartItemStock(item, diff)) {
      alert('No hay stock suficiente para aumentar esa cantidad.')
      return
    }
    if (diff < 0) returnCartItemStock(item, Math.abs(diff))
    setCart((prev) => {
      const next = [...prev]
      const currentItem = next[index]
      if (!currentItem) return prev
      if (clean <= 0) return next.filter((_, i) => i !== index)
      const selectedStock = currentItem.packagePartial ? getCartItemStockMap(currentItem, clean) : currentItem.selectedStock
      next[index] = {
        ...currentItem,
        quantity: clean,
        selectedStock,
        packageBreakdown: currentItem.packagePartial ? packageCountsToText(selectedStock) : currentItem.packageBreakdown,
      }
      return next
    })
  }

  const removeCartItem = (index) => {
    const item = cart[index]
    if (item) returnCartItemStock(item)
    setCart((prev) => prev.filter((_, i) => i !== index))
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

    const client = { ...data[0], active: true }
    setSpecialClientSession(client)
    setCart(readClientCart(client))
    localStorage.setItem(SPECIAL_CLIENT_SESSION_KEY, JSON.stringify(client))
    setSpecialCode('')
    return client
  }

  const logoutSpecialClient = () => {
    if (specialClientSession?.active) saveClientCart(specialClientSession, cart)
    setSpecialClientSession(null)
    setCart([])
    localStorage.removeItem(SPECIAL_CLIENT_SESSION_KEY)
  }

  const sendOrder = async () => {
    if (cart.length === 0) {
      alert('Agrega productos a la bolsa.')
      return
    }

    const isRegisteredClient = Boolean(specialClientSession?.active)
    const requestCustomerName = isRegisteredClient
      ? String(specialClientSession.name || specialClientSession.client_code || '').trim()
      : String(customer.name || '').trim()
    const requestCustomerPhone = isRegisteredClient
      ? String(specialClientSession.phone || customer.phone || '').trim()
      : String(customer.phone || '').trim()

    if (!isRegisteredClient && (!requestCustomerName || !requestCustomerPhone)) {
      alert('Pon al menos nombre y telefono.')
      return
    }

    const phoneDigits = requestCustomerPhone.replace(/\D/g, '')
    if (!isRegisteredClient && phoneDigits.length < 10) {
      alert('Numero de telefono invalido.')
      return
    }

    if (!isRegisteredClient && customer.delivery === 'envios') {
      if (!customer.receiver.trim() || !customer.receiver_phone.trim() || !customer.address.trim()) {
        alert('Completa nombre, telefono y direccion de envio.')
        return
      }
    }

    const orderNumber = generateOrderNumber()
    const subtotal = getCartSubtotal(cart, getCartUnitPrice)
    const requestDelivery = isRegisteredClient ? 'registrado' : customer.delivery
    const requestCity = isRegisteredClient ? '' : customer.city
    const requestNotes = isRegisteredClient ? '' : customer.notes
    const shippingLabel = isRegisteredClient
      ? 'Cliente registrado / entrega por confirmar'
      : customer.delivery === 'envios'
        ? 'Envio por paqueteria'
        : customer.delivery === 'punto'
          ? 'Entrega en punto medio'
          : 'Recoge en sucursal'
    const totalFinal = subtotal
    const specialLabel = specialClientSession?.active
      ? 'Cliente ' + specialClientSession.client_tier
      : tier.label

    const shippingDetails =
      !isRegisteredClient && requestDelivery === 'envios'
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
      package_partial: Boolean(item.packagePartial),
      package_pieces: item.packageMode ? getPackagePieces(item.product) : null,
      source_package_qty: Number(item.sourcePackageQty || 0),
      selected_stock: item.selectedStock || null,
      pieces: getCartItemPieces(item),
      unit_price: getCartItemUnitPrice(item, getCartUnitPrice),
      total: getCartLineTotal(item, getCartUnitPrice),
      package_breakdown: item.packageMode || item.packagePartial ? item.packageBreakdown || item.product.package_breakdown || item.product.package_fit || '' : '',
      quality: item.product.quality || '',
      model_po: item.product.model_po || '',
      image: getCover(item.product),
    }))

    const noteParts = [
      'Numero pedido: ' + orderNumber,
      requestNotes ? 'Observacion cliente: ' + requestNotes : '',
      'Entrega: ' + shippingDetails,
      specialClientSession?.active
        ? 'Cliente especial: ' + specialClientSession.name + ' (' + specialClientSession.client_tier + ')'
        : '',
      specialClientSession?.active && specialClientSession.client_code
        ? 'Codigo cliente: ' + specialClientSession.client_code
        : '',
    ].filter(Boolean)

    const orderPayload = {
      customer_name: requestCustomerName || '',
      customer_phone: phoneDigits,
      customer_city: requestCity || '',
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
        const detail = item.package_partial
          ? '   Tallas de paquete: ' + (item.package_breakdown || 'Por confirmar') + '\n' +
            '   Cantidad: ' + item.quantity + ' pz\n'
          : item.package_mode
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
      !isRegisteredClient && requestDelivery === 'envios'
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
      'Cliente: ' + requestCustomerName + '\n' +
      'Telefono: ' + (requestCustomerPhone || '-') + '\n' +
      'Ciudad: ' + (requestCity || '-') + '\n' +
      'Tipo de entrega: ' + shippingLabel +
      shippingText +
      clientText +
      '\n\nPRODUCTOS SOLICITADOS\n' +
      itemsText +
      '\n\nTotal de piezas: ' + totalPieces + '\n' +
      'Monto total a pagar: ' + mxn(totalFinal) + '\n' +
      'Observacion del cliente: ' + (requestNotes || '-') + '\n\n' +
      'Solicito apartado y confirmacion de existencia.'

    const link = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg)

    setLoading(true)
    try {
      const productIds = uniqueValues(cart.map((item) => item.product?.id).filter(Boolean).map(String))
      if (!productIds.length) throw new Error('No se encontraron productos validos en la bolsa.')

      const { data: latestRows, error: latestError } = await supabase
        .from('products')
        .select(PRODUCT_LIST_COLUMNS)
        .in('id', productIds)

      if (latestError) throw latestError

      const latestProducts = new Map(
        (latestRows || []).map((row) => {
          const product = normalizeProduct(row)
          return [String(product.id), product]
        })
      )

      const productUpdates = new Map()
      for (const item of cart) {
        const product = latestProducts.get(String(item.product.id))
        if (!product) throw new Error('El producto "' + item.product.name + '" ya no esta disponible.')

        const entry = productUpdates.get(String(product.id)) || {
          product,
          stock: { ...product.stock },
          package_stock: Number(product.package_stock || 0),
          sales_count: Number(product.sales_count || 0),
        }

        const quantity = Number(item.quantity || 0)
        if (quantity <= 0) continue

        if (item.packagePartial) {
          const sourcePackageQty = Number(item.sourcePackageQty || 1)
          if (entry.package_stock < sourcePackageQty) {
            throw new Error('No hay paquetes suficientes de "' + product.name + '". Disponibles: ' + entry.package_stock + '.')
          }
          entry.package_stock -= sourcePackageQty
          const packageCounts = buildPackageSelectionStock(product, sourcePackageQty)
          const selectedMap = new Map(Object.entries(item.selectedStock || {}).map(([size, qty]) => [String(size).toUpperCase(), Number(qty || 0)]))
          selectedMap.forEach((qty, size) => {
            if (qty > Number(packageCounts.get(size) || 0)) {
              throw new Error('La talla ' + size + ' supera la corrida disponible de "' + product.name + '".')
            }
          })
          packageCounts.forEach((qty, size) => {
            const remaining = Math.max(0, Number(qty || 0) - Number(selectedMap.get(size) || 0))
            if (remaining > 0) entry.stock[size] = Number(entry.stock?.[size] || 0) + remaining
          })
          entry.sales_count += quantity
        } else if (item.packageMode) {
          if (entry.package_stock < quantity) {
            throw new Error('No hay paquetes suficientes de "' + product.name + '". Disponibles: ' + entry.package_stock + '.')
          }
          entry.package_stock -= quantity
          entry.sales_count += getPackagePieces(product) * quantity
        } else {
          const currentStock = Number(entry.stock?.[item.size] || 0)
          if (currentStock < quantity) {
            throw new Error('No hay stock suficiente de "' + product.name + '" talla ' + item.size + '. Disponibles: ' + currentStock + '.')
          }
          entry.stock[item.size] = currentStock - quantity
          entry.sales_count += quantity
        }

        productUpdates.set(String(product.id), entry)
      }

      const orderResult = await supabase.from('orders').insert([orderPayload])
      if (orderResult.error) throw orderResult.error

      const stockResults = await Promise.all(
        [...productUpdates.values()].map((entry) => {
          const nextProduct = {
            ...entry.product,
            stock: entry.stock,
            package_stock: entry.package_stock,
            sales_count: entry.sales_count,
          }
          const hasAnyStock = totalStock(entry.stock) > 0 || Number(entry.package_stock || 0) > 0
          const payload = {
            sizes: mergeProductSizes(entry.product, entry.stock).join(','),
            stock_json: entry.stock,
            stock: totalStock(entry.stock),
            sales_count: entry.sales_count,
            active: hasAnyStock,
            description: composeProductDescription(nextProduct),
          }
          return supabase.from('products').update(payload).eq('id', entry.product.id)
        })
      )

      const stockError = stockResults.find((result) => result.error)?.error
      if (stockError) throw stockError

      const updatedProducts = new Map(
        [...productUpdates.entries()].map(([id, entry]) => [
          id,
          {
            ...entry.product,
            stock: entry.stock,
            stock_total: totalStock(entry.stock),
            package_stock: entry.package_stock,
            sales_count: entry.sales_count,
            active: totalStock(entry.stock) > 0 || Number(entry.package_stock || 0) > 0,
          },
        ])
      )

      setProducts((prevProducts) =>
        prevProducts.map((product) => updatedProducts.get(String(product.id)) || product)
      )
      setCart([])
      if (specialClientSession?.active) saveClientCart(specialClientSession, [])
      setCustomer(emptyCustomer)

      let opened = null
      try {
        opened = window.open(link, '_blank', 'noopener,noreferrer')
      } catch {
        opened = null
      }

      if (!opened) {
        window.location.assign(link)
      }

      fetchProducts().catch((error) => console.error('No se pudieron refrescar productos despues del pedido:', error))
      if (route === 'admin' && isAdminAuthenticated) {
        fetchOrders().catch((error) => console.error('No se pudieron refrescar pedidos despues del pedido:', error))
      }
    } catch (error) {
      console.error('No se pudo solicitar el apartado:', error)
      alert('No se pudo solicitar el apartado: ' + (error.message || 'Revisa el stock e intenta de nuevo.'))
      fetchProducts().catch((refreshError) => console.error('No se pudieron recuperar productos despues del error:', refreshError))
    } finally {
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
            customFits={customFits}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          addToCart={addToCart}
          addPackageToCart={addPackageToCart}
          cart={cart}
          setCart={setCart}
          updateCartItemQty={updateCartItemQty}
          removeCartItem={removeCartItem}
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
          fetchProductImages={fetchProductImages}
          prefetchProductImages={prefetchProductImages}
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

