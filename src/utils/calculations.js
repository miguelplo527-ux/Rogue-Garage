export const gananciaNeta = ({ ventas = 0, compras = 0, gastos = 0 }) => ventas - compras - gastos;
export const valorInventario = (productos = []) => productos.reduce((acc, p) => acc + (p.sale_price * p.stock), 0);
