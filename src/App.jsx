import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, Menu, X, ChevronRight, ShoppingBag,
  LogOut, Lock, User, Eye, EyeOff,
  Plus, Minus, Pencil, Trash2, Save,
  Image as ImageIcon, Settings, QrCode, ScanLine
} from 'lucide-react'
import { supabase } from './supabase'

const STORE_NAME = 'Denim Click'
const STORE_LOGO = '/logo-denim-click.png'
const ADMIN_USERNAME = 'Denim'
const ADMIN_PASSWORD = 'Denimzoa2026'
const WHATSAPP_NUMBER = '525572665573'

const CLIENT_TIERS = ['Plata','Oro','Esmeralda','Platino','Diamante']

function mxn(n){return `$${Number(n||0).toLocaleString('es-MX')}`}
function ScannerModal({ open, onClose, onScan }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [scanned,setScanned]=useState(false)

  useEffect(()=>{
    if(open) startScanner()
    return stopScanner
  },[open])

  const stopScanner=()=>{
    if(streamRef.current){
      streamRef.current.getTracks().forEach(t=>t.stop())
      streamRef.current=null
    }
  }

  const startScanner=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
      videoRef.current.srcObject=stream
      streamRef.current=stream

      if('BarcodeDetector' in window){
        const detector=new window.BarcodeDetector({
          formats:[
            'qr_code','ean_13','code_128','code_39','upc_a'
          ]
        })

        const scan=async()=>{
          if(!videoRef.current || scanned) return
          const codes=await detector.detect(videoRef.current)
          if(codes.length){
            setScanned(true)
            onScan(codes[0].rawValue)
            stopScanner()
          }
          requestAnimationFrame(scan)
        }
        scan()
      }
    }catch(e){
      alert('No se pudo abrir la cámara')
    }
  }

  if(!open) return null

  return(
    <div style={{position:'fixed',inset:0,background:'#000a',zIndex:999}}>
      <div style={{display:'grid',placeItems:'center',height:'100%'}}>
        <div style={{background:'#000',padding:20,borderRadius:20}}>
          
          <p style={{color:'#fff',textAlign:'center'}}>
            Escanea tu código para desbloquear precios especiales
          </p>

          <div style={{position:'relative'}}>
            <video ref={videoRef} autoPlay playsInline style={{width:300,borderRadius:10}}/>

            {/* Marco escaneo */}
            <div style={{
              position:'absolute',
              inset:0,
              border:'2px solid #00ffcc',
              borderRadius:10
            }}/>
          </div>

          <button onClick={onClose} style={{marginTop:10}}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
function LoginClientModal({open,onClose,loginSpecialClient}){

  const [code,setCode]=useState('')
  const [scannerOpen,setScannerOpen]=useState(false)

  if(!open) return null

  return(
    <div style={{position:'fixed',inset:0,background:'#0006'}}>
      <div style={{background:'#fff',padding:20,maxWidth:400,margin:'auto',marginTop:100,borderRadius:20}}>
        
        <h3>Inicia sesión</h3>

        <input
          placeholder="Código cliente"
          value={code}
          onChange={e=>setCode(e.target.value)}
        />

        <button onClick={()=>loginSpecialClient(code)}>
          Entrar
        </button>

        <button onClick={()=>setScannerOpen(true)}>
          Escanear código
        </button>

        <ScannerModal
          open={scannerOpen}
          onClose={()=>setScannerOpen(false)}
          onScan={(value)=>{
            setScannerOpen(false)
            loginSpecialClient(value)
          }}
        />

      </div>
    </div>
  )
}
function PriceBox({product,totalPieces}){

  return(
    <div style={{marginTop:10}}>
      <div><strong>{mxn(product.price)}</strong></div>

      <div style={{fontSize:12,color:'#666'}}>
        3+ piezas: {mxn(product.price_tier3)}
      </div>

      <div style={{fontSize:12,color:'#666'}}>
        10+ piezas: {mxn(product.price_tier10)}
      </div>
    </div>
  )
}
function sendToWhatsApp(cart,customer,total){

  const items = cart.map((item,i)=>
    `${i+1}. ${item.name} x${item.qty} - ${mxn(item.price)}`
  ).join('%0A')

  const msg=
`🧾 *PEDIDO DENIM CLICK*

👤 ${customer.name}
📞 ${customer.phone}

🛍️ PRODUCTOS:
${items}

💰 TOTAL: ${mxn(total)}
`

  window.location.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`
}