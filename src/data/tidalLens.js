// ============================================================
//  COMPARADOR "TXL ORIGINAL vs TXL ROGUE GARAGE" · edita solo este archivo
//
//  before: foto de la TXL original (sin modificar)
//  after:  foto de la MISMA TXL ya modificada por Rogue Garage
//
//  Las dos fotos deben tener el mismo ángulo, el mismo encuadre y el
//  mismo tamaño (ideal: 4:3, máximo 2000 px de ancho), para que
//  coincidan al pasar el lente.
//
//  Puedes usar una ruta de public ('/images/txl-original.jpg') o una URL.
//  Si lo dejas vacío ('') se muestran dos dibujos de ejemplo.
// ============================================================

export const TIDAL_LENS = {
  before: '',
  after: '',
  beforeLabel: 'Toyota TXL original',
  afterLabel: 'Toyota TXL modificada por Rogue Garage',
};

// ---- Dibujos de ejemplo (no necesitas tocar esto) ----
const W = 1200;
const H = 900;

function drawScene(modified) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');

  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#2a3342');
  bg.addColorStop(1, '#10141b');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#0b0f15';
  g.fillRect(0, 650, W, H - 650);
  g.fillStyle = 'rgba(0,0,0,.5)';
  g.beginPath();
  g.ellipse(600, 662, 480, 28, 0, 0, Math.PI * 2);
  g.fill();

  // carrocería (la modificada va más baja)
  g.save();
  g.translate(0, modified ? 10 : 0);
  g.beginPath();
  g.moveTo(150, 600);
  g.lineTo(150, 500);
  g.quadraticCurveTo(150, 470, 185, 464);
  g.lineTo(380, 440);
  g.lineTo(470, 350);
  g.quadraticCurveTo(486, 334, 510, 334);
  g.lineTo(830, 334);
  g.quadraticCurveTo(856, 334, 874, 356);
  g.lineTo(940, 440);
  g.lineTo(1030, 452);
  g.quadraticCurveTo(1060, 458, 1060, 490);
  g.lineTo(1060, 600);
  g.closePath();
  const body = modified ? '#1c222d' : '#4b576b';
  g.fillStyle = body;
  g.fill();

  g.beginPath();
  g.moveTo(492, 362);
  g.lineTo(824, 362);
  g.lineTo(896, 440);
  g.lineTo(410, 440);
  g.closePath();
  g.fillStyle = modified ? '#0b0e13' : '#2a3342';
  g.fill();
  g.fillStyle = body;
  g.fillRect(650, 362, 14, 78);
  g.fillRect(780, 362, 14, 78);

  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(190, 500, 860, 3);
  g.fillStyle = '#c0392b';
  g.fillRect(150, 480, 14, 30);
  g.fillStyle = modified ? '#fff1c4' : '#cfd6e2';
  g.fillRect(1020, 470, 34, 18);

  if (modified) {
    g.fillStyle = '#c8a874';
    g.fillRect(190, 556, 840, 10); // franja dorada
    g.fillRect(520, 318, 300, 6); // parrilla de techo
    g.fillRect(540, 322, 6, 14);
    g.fillRect(794, 322, 6, 14);
    g.fillStyle = '#fff1c4';
    g.fillRect(600, 300, 160, 12); // barra de luces
    g.fillStyle = '#c8a874';
    g.beginPath(); // splitter delantero
    g.moveTo(960, 600);
    g.lineTo(1090, 600);
    g.lineTo(1090, 614);
    g.lineTo(950, 614);
    g.closePath();
    g.fill();
  } else {
    g.fillStyle = '#8a93a3';
    g.fillRect(1030, 492, 24, 46);
  }
  g.restore();

  // ruedas (mismo punto de apoyo en el piso; la modificada las lleva más grandes)
  const rr = modified ? 74 : 62;
  const wheel = (x) => {
    const cy = 658 - rr;
    g.fillStyle = '#07090d';
    g.beginPath();
    g.arc(x, cy, rr + 20, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#15181e';
    g.beginPath();
    g.arc(x, cy, rr, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = modified ? '#c8a874' : '#8a93a3';
    g.beginPath();
    g.arc(x, cy, rr * 0.64, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#151a22';
    g.beginPath();
    g.arc(x, cy, rr * 0.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = modified ? '#c8a874' : '#8a93a3';
    g.lineWidth = 6;
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      g.beginPath();
      g.moveTo(x, cy);
      g.lineTo(x + Math.cos(a) * rr * 0.5, cy + Math.sin(a) * rr * 0.5);
      g.stroke();
    }
  };
  wheel(330);
  wheel(880);

  return c.toDataURL('image/png');
}

export function getLensImages() {
  return {
    before: TIDAL_LENS.before || drawScene(false),
    after: TIDAL_LENS.after || drawScene(true),
  };
}