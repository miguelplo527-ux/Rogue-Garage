// ============================================================
//  COLECCIÓN DE CAMIONETAS · edita solo este archivo
//
//  image: pega una URL completa ('https://...') o una ruta de tu carpeta
//         public (ej: '/camionetas/txl.jpg'). Si lo dejas vacío ('')
//         se muestra un marcador de posición.
//  Puedes agregar o quitar camionetas. Lo ideal son 4 o más.
//  Funcionan mejor las fotos horizontales (3:2) con la camioneta centrada.
// ============================================================

export const TRUCKS = [
  {
    id: 'txl',
    name: 'Toyota TXL',
    description: 'Body kits, volantes, iluminación y tuning para la Toyota TXL.',
    image: '',
  },
  {
    id: 'land-cruiser',
    name: 'Land Cruiser 300',
    description: 'Accesorios y mejoras de diseño para un ícono todoterreno.',
    image: '',
  },
  {
    id: 'f150-raptor',
    name: 'Ford F-150 Raptor',
    description: 'Piezas de carácter para una pickup de alto rendimiento.',
    image: '',
  },
  {
    id: 'ram-trx',
    name: 'RAM 1500 TRX',
    description: 'Estilo y presencia para la pickup más potente de su clase.',
    image: '',
  },
  {
    id: 'silverado-zr2',
    name: 'Silverado ZR2',
    description: 'Accesorios pensados para pickups premium fuera de serie.',
    image: '',
  },
  {
    id: 'defender-110',
    name: 'Land Rover Defender 110',
    description: 'Detalles de lujo para una camioneta con carácter propio.',
    image: '',
  },
];

// ---- Marcador de posición (no necesitas tocar esto) ----
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const placeholder = (name) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#262e3c"/><stop offset="1" stop-color="#10141b"/></linearGradient></defs>
<rect width="900" height="600" fill="url(#g)"/>
<g transform="translate(450 330) scale(.58) translate(-450 -330)" fill="none" stroke="#c8a874" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" opacity=".9">
<path d="M170 380V330Q170 310 190 305L300 290L360 230Q370 220 385 220H520Q535 220 545 232L585 290L700 300Q725 304 730 330V380Z"/>
<circle cx="260" cy="385" r="42"/><circle cx="640" cy="385" r="42"/>
</g>
<text x="450" y="440" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" fill="#f2efe8">${esc(name)}</text>
<text x="450" y="478" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#aab2c0">Pega tu imagen en truckCollection.js</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getTruckImage = (truck) => truck.image || placeholder(truck.name);