import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  Camera,
  CheckCircle2,
  Package,
  Truck,
} from 'lucide-react'
import { supabase } from './supabase'

/* =========================
   CONFIGURACIÓN GENERAL
========================= */
const STORE_NAME = 'Denim Click'
const STORE_LOGO = '/logo-denim-click.png'

const ADMIN_USERNAME = 'Denim'
const ADMIN_PASSWORD = 'Denimzoa2026'

const ADMIN_SESSION_KEY = 'denimclick_admin_session_v3'
const SPECIAL_CLIENT_SESSION_KEY = 'denimclick_special_client_v3'

const WHATSAPP_NUMBER = '525572665573'

const CLIENT_TIERS = [
  'Plata',
  'Oro',
  'Esmeralda',
  'Platino',
  'Diamante',
]

const AUDIENCES = [
  'Todo',
  'Hombre',
  'Dama',
  'Niño',
  'Accesorios',
  'Oferta',
]

const JEANS_FITS = [
  'Straight',
  'Slim',
  'Skinny',
  'Regular',
  'Relaxed',
  'Baggy',
]

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

/* =========================
   HELPERS
========================= */
const formatMoney = (amount = 0) => {
  return `$${Number(amount || 0).toLocaleString('es-MX')}`
}

const getFirstName = (fullName = '') => {
  return fullName.trim().split(' ')[0] || ''
}

const normalizeSizes = (sizes) => {
  if (!sizes) return []

  if (Array.isArray(sizes)) return sizes

  if (typeof sizes === 'string') {
    return sizes.split(',').map((s) => s.trim())
  }

  return []
}

const getVolumePrice = (product, qty) => {
  const base = Number(product?.price || 0)

  if (qty >= 10) return Math.round(base * 0.85)
  if (qty >= 3) return Math.round(base * 0.93)

  return base
}

const getAppliedLabel = (qty) => {
  if (qty >= 10) return '10+ piezas'
  if (qty >= 3) return '3+ piezas'
  return 'Público / volumen'
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function App() {
  const [products, setProducts] = useState([])
  const [specialClients, setSpecialClients] = useState([])

  const [loading, setLoading] = useState(true)

  const [activeMenu, setActiveMenu] = useState('Todo')
  const [activeFit, setActiveFit] = useState('')
  const [activeBrand, setActiveBrand] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [cart, setCart] = useState([])

  const [clientSession, setClientSession] = useState(() => {
    const saved = localStorage.getItem(SPECIAL_CLIENT_SESSION_KEY)
    return saved ? JSON.parse(saved) : null
  })

  const [customerData, setCustomerData] = useState({
    customerName: '',
    phone: '',
    city: '',
    deliveryType: 'Envíos',
    shippingMode: 'Domicilio',
    recipientName: '',
    shippingAddress: '',
    shippingPhone: '',
    postalCode: '',
    notes: '',
  })

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [manualCode, setManualCode] = useState('')

  /* =========================
     CARGA INICIAL
  ========================= */
  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (clientSession) {
      localStorage.setItem(
        SPECIAL_CLIENT_SESSION_KEY,
        JSON.stringify(clientSession)
      )
    } else {
      localStorage.removeItem(SPECIAL_CLIENT_SESSION_KEY)
    }
  }, [clientSession])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })

      const { data: clientsData } = await supabase
        .from('special_clients')
        .select('*')
        .order('id', { ascending: false })

      setProducts(productsData || [])
      setSpecialClients(clientsData || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     FILTROS
  ========================= */
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (activeMenu !== 'Todo') {
      result = result.filter(
        (p) =>
          p.audience === activeMenu ||
          p.category === activeMenu ||
          p.section === activeMenu
      )
    }

    if (activeBrand) {
      result = result.filter((p) =>
        (p.brand || '').toLowerCase().includes(activeBrand.toLowerCase())
      )
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()

      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(search) ||
          (p.brand || '').toLowerCase().includes(search)
      )
    }

    return result
  }, [products, activeMenu, activeBrand, searchTerm])

  /* =========================
     CARRITO
  ========================= */
  const totalPieces = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.qty, 0)
  }, [cart])

  const totalAmount = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + item.qty * item.priceApplied
    }, 0)
  }, [cart])

  const appliedPriceLabel = useMemo(() => {
    return getAppliedLabel(totalPieces)
  }, [totalPieces])
  /* =========================
     LOGIN CLIENTE
  ========================= */
  const loginSpecialClient = (code) => {
    if (!code?.trim()) return

    const normalizedCode = code.trim().toLowerCase()

    const client = specialClients.find(
      (c) =>
        String(c.client_code || '').trim().toLowerCase() === normalizedCode ||
        String(c.code || '').trim().toLowerCase() === normalizedCode ||
        String(c.id_code || '').trim().toLowerCase() === normalizedCode
    )

    if (!client) {
      alert('Código no encontrado')
      return
    }

    setClientSession(client)
    setShowLoginModal(false)
    setManualCode('')
  }

  const logoutClient = () => {
    setClientSession(null)
  }

  /* =========================
     CARRITO
  ========================= */
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id)

    if (existing) {
      const updated = cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              qty: item.qty + 1,
              priceApplied: getVolumePrice(product, item.qty + 1),
            }
          : item
      )

      setCart(updated)
      return
    }

    setCart([
      ...cart,
      {
        ...product,
        qty: 1,
        size: normalizeSizes(product.sizes)[0] || '',
        priceApplied: getVolumePrice(product, 1),
      },
    ])
  }

  const increaseQty = (productId) => {
    const updated = cart.map((item) => {
      if (item.id !== productId) return item

      const newQty = item.qty + 1

      return {
        ...item,
        qty: newQty,
        priceApplied: getVolumePrice(item, newQty),
      }
    })

    setCart(updated)
  }

  const decreaseQty = (productId) => {
    const updated = cart
      .map((item) => {
        if (item.id !== productId) return item

        const newQty = item.qty - 1

        if (newQty <= 0) return null

        return {
          ...item,
          qty: newQty,
          priceApplied: getVolumePrice(item, newQty),
        }
      })
      .filter(Boolean)

    setCart(updated)
  }

  const updateCartSize = (productId, size) => {
    const updated = cart.map((item) =>
      item.id === productId ? { ...item, size } : item
    )

    setCart(updated)
  }

  /* =========================
     ENVÍO / WHATSAPP
  ========================= */
  const handleCustomerChange = (field, value) => {
    setCustomerData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const buildWhatsappMessage = () => {
    let message = `🧾 *PEDIDO DENIM CLICK*%0A%0A`

    if (clientSession) {
      message += `👤 Cliente especial: ${clientSession.name}%0A`
      message += `🏅 Nivel: ${clientSession.tier || 'Especial'}%0A%0A`
    }

    message += `👤 Nombre: ${customerData.customerName}%0A`
    message += `📱 Teléfono: ${customerData.phone}%0A`
    message += `📍 Ciudad/Estado: ${customerData.city}%0A`
    message += `🚚 Entrega: ${customerData.deliveryType}%0A`

    if (customerData.deliveryType === 'Envíos') {
      message += `📦 Tipo envío: ${customerData.shippingMode}%0A`

      if (customerData.shippingMode === 'Domicilio') {
        message += `👥 Recibe: ${customerData.recipientName}%0A`
        message += `🏠 Dirección: ${customerData.shippingAddress}%0A`
        message += `📞 Contacto: ${customerData.shippingPhone}%0A`
        message += `📮 CP: ${customerData.postalCode}%0A`
      }
    }

    message += `%0A🛒 *PRODUCTOS*%0A`

    cart.forEach((item) => {
      message += `• ${item.name} | ${item.size} | ${item.qty} pz | ${formatMoney(
        item.priceApplied
      )}%0A`
    })

    message += `%0A💰 Total: *${formatMoney(totalAmount)}*%0A`
    message += `🏷️ Precio aplicado: ${appliedPriceLabel}%0A`

    if (customerData.notes) {
      message += `%0A📝 Notas: ${customerData.notes}%0A`
    }

    return message
  }

  const sendOrderWhatsapp = () => {
    if (!cart.length) {
      alert('Tu carrito está vacío')
      return
    }

    const message = buildWhatsappMessage()

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`

    window.open(url, '_blank')
  }

  /* =========================
     UI HEADER
  ========================= */
  const renderLoginButton = () => {
    if (clientSession) {
      return (
        <button
          onClick={logoutClient}
          className="rounded-full bg-white px-6 py-3 font-semibold text-black"
        >
          Bienvenido {getFirstName(clientSession.name)}
        </button>
      )
    }

    return (
      <button
        onClick={() => setShowLoginModal(true)}
        className="rounded-full bg-white px-6 py-3 font-semibold text-black"
      >
        Inicia sesión
      </button>
    )
  }
  /* =========================
     RENDER
  ========================= */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Cargando Denim Click...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b bg-black text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <img
              src={STORE_LOGO}
              alt={STORE_NAME}
              className="h-10 object-contain"
            />

            <nav className="hidden gap-6 md:flex">
              {AUDIENCES.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveMenu(item)}
                  className={`font-medium ${
                    activeMenu === item ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {item}
                </button>
              ))}

              <button className="font-medium text-white">
                Mejora tu precio
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {renderLoginButton()}

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="border-b bg-white p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {AUDIENCES.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveMenu(item)
                  setMobileMenuOpen(false)
                }}
                className="text-left font-medium"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl bg-gray-100 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h1 className="text-3xl font-bold md:text-5xl">
                Aparta mercancía y mejora tu precio
              </h1>

              <p className="mt-4 text-gray-600">
                Precio inteligente por volumen y clientes especiales.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Piezas</p>
              <p className="text-4xl font-bold">{totalPieces}</p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-100 p-4">
                  <p className="text-sm text-gray-500">Precio</p>
                  <p className="font-bold">{appliedPriceLabel}</p>
                </div>

                <div className="rounded-xl bg-gray-100 p-4">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold">
                    {formatMoney(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH ================= */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Buscar producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-2xl border p-4"
          />

          <select
            value={activeBrand}
            onChange={(e) => setActiveBrand(e.target.value)}
            className="rounded-2xl border p-4"
          >
            <option value="">Todas las marcas</option>

            {BRANDS.map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={activeFit}
            onChange={(e) => setActiveFit(e.target.value)}
            className="rounded-2xl border p-4"
          >
            <option value="">Todos los fits</option>

            {JEANS_FITS.map((fit) => (
              <option key={fit}>{fit}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-3xl border bg-white shadow-sm"
            >
              <img
                src={product.image_url || product.image}
                alt={product.name}
                className="h-72 w-full object-cover"
              />

              <div className="p-4">
                <p className="text-xs text-gray-500">
                  {product.brand}
                </p>

                <h3 className="mt-1 font-bold">{product.name}</h3>

                <p className="mt-2 text-lg font-bold">
                  {formatMoney(product.price)}
                </p>

                <div className="mt-2 text-sm text-gray-500">
                  3 pz: {formatMoney(product.price * 0.93)}
                </div>

                <div className="text-sm text-gray-500">
                  10 pz: {formatMoney(product.price * 0.85)}
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="mt-4 w-full rounded-2xl bg-black py-3 text-white"
                >
                  Agregar producto
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ================= CARRITO + DATOS CLIENTE ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          {/* CARRITO */}
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Package size={22} />
              <h2 className="text-2xl font-bold">Carrito</h2>
            </div>

            {!cart.length ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
                Tu carrito está vacío.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border p-4"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.image_url || item.image}
                        alt={item.name}
                        className="h-24 w-20 rounded-xl object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.brand || 'Sin marca'}
                        </p>

                        <div className="mt-3">
                          <label className="mb-1 block text-sm font-medium">
                            Talla
                          </label>

                          <select
                            value={item.size}
                            onChange={(e) =>
                              updateCartSize(item.id, e.target.value)
                            }
                            className="w-full rounded-xl border p-3"
                          >
                            {normalizeSizes(item.sizes || item.size || '').map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="rounded-full border p-2"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="min-w-[30px] text-center font-bold">
                              {item.qty}
                            </span>

                            <button
                              onClick={() => increaseQty(item.id)}
                              className="rounded-full border p-2"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {formatMoney(item.priceApplied)} c/u
                            </p>
                            <p className="font-bold">
                              {formatMoney(item.priceApplied * item.qty)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="grid gap-3 pt-2 md:grid-cols-3">
                  <div className="rounded-2xl bg-gray-100 p-4">
                    <p className="text-sm text-gray-500">Piezas</p>
                    <p className="text-2xl font-bold">{totalPieces}</p>
                  </div>

                  <div className="rounded-2xl bg-gray-100 p-4">
                    <p className="text-sm text-gray-500">Precio aplicado</p>
                    <p className="font-bold">{appliedPriceLabel}</p>
                  </div>

                  <div className="rounded-2xl bg-gray-100 p-4">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">
                      {formatMoney(totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DATOS CLIENTE */}
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Truck size={22} />
              <h2 className="text-2xl font-bold">Datos del cliente</h2>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={customerData.customerName}
                onChange={(e) =>
                  handleCustomerChange('customerName', e.target.value)
                }
                className="w-full rounded-2xl border p-4"
              />

              <input
                type="text"
                placeholder="Teléfono"
                value={customerData.phone}
                onChange={(e) =>
                  handleCustomerChange('phone', e.target.value)
                }
                className="w-full rounded-2xl border p-4"
              />

              <input
                type="text"
                placeholder="Ciudad o estado"
                value={customerData.city}
                onChange={(e) =>
                  handleCustomerChange('city', e.target.value)
                }
                className="w-full rounded-2xl border p-4"
              />

              <select
                value={customerData.deliveryType}
                onChange={(e) =>
                  handleCustomerChange('deliveryType', e.target.value)
                }
                className="w-full rounded-2xl border p-4"
              >
                <option value="Envíos">Envíos</option>
                <option value="Entrega en sucursal">Entrega en sucursal</option>
                <option value="Entrega en punto medio">Entrega en punto medio</option>
              </select>

              {customerData.deliveryType === 'Envíos' && (
                <>
                  <select
                    value={customerData.shippingMode}
                    onChange={(e) =>
                      handleCustomerChange('shippingMode', e.target.value)
                    }
                    className="w-full rounded-2xl border p-4"
                  >
                    <option value="Domicilio">Domicilio</option>
                    <option value="Ocurre">Ocurre</option>
                  </select>

                  {customerData.shippingMode === 'Domicilio' ? (
                    <>
                      <input
                        type="text"
                        placeholder="Nombre de quien recibe"
                        value={customerData.recipientName}
                        onChange={(e) =>
                          handleCustomerChange('recipientName', e.target.value)
                        }
                        className="w-full rounded-2xl border p-4"
                      />

                      <input
                        type="text"
                        placeholder="Dirección completa"
                        value={customerData.shippingAddress}
                        onChange={(e) =>
                          handleCustomerChange('shippingAddress', e.target.value)
                        }
                        className="w-full rounded-2xl border p-4"
                      />

                      <input
                        type="text"
                        placeholder="Teléfono de contacto"
                        value={customerData.shippingPhone}
                        onChange={(e) =>
                          handleCustomerChange('shippingPhone', e.target.value)
                        }
                        className="w-full rounded-2xl border p-4"
                      />

                      <input
                        type="text"
                        placeholder="Código postal"
                        value={customerData.postalCode}
                        onChange={(e) =>
                          handleCustomerChange('postalCode', e.target.value)
                        }
                        className="w-full rounded-2xl border p-4"
                      />
                    </>
                  ) : (
                    <div className="rounded-2xl bg-gray-100 p-4 text-sm text-gray-600">
                      En modo <strong>Ocurre</strong>, el pedido se enviará para
                      recogerse en la paquetería correspondiente.
                    </div>
                  )}
                </>
              )}

              <textarea
                placeholder="Notas o comentarios"
                value={customerData.notes}
                onChange={(e) =>
                  handleCustomerChange('notes', e.target.value)
                }
                className="min-h-[120px] w-full rounded-2xl border p-4"
              />

              <button
                onClick={sendOrderWhatsapp}
                className="w-full rounded-2xl bg-black py-4 font-semibold text-white"
              >
                Solicitar pedido
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODAL LOGIN CLIENTE ================= */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Inicia sesión</h3>
                <p className="text-sm text-gray-500">
                  Escanea tu código para desbloquear precios especiales
                </p>
              </div>

              <button onClick={() => setShowLoginModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="rounded-3xl border-2 border-dashed p-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Camera size={28} />
              </div>

              <p className="font-medium">Escaneo por cámara</p>
              <p className="mt-1 text-sm text-gray-500">
                Aquí queda listo el marco profesional para QR o código de barras.
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">
                  También puedes ingresar el código manualmente
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Escribe tu código"
                className="w-full rounded-2xl border p-4"
              />

              <button
                onClick={() => loginSpecialClient(manualCode)}
                className="w-full rounded-2xl bg-black py-4 font-semibold text-white"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}