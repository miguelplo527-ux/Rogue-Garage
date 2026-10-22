import { supabase } from './supabaseClient';

export const storageService = {
  async uploadImage(file) {
    try {
      // 1. Validar que sea una imagen (por si acaso)
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo seleccionado no es una imagen válida.');
      }

      // 2. Limpiar el nombre del archivo (quitar espacios y caracteres raros)
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileNameLimpio = file.name
        .split('.')[0]
        .replace(/[^a-zA-Z0-9]/g, '_') // Reemplaza todo lo que no sea letra o número por guion bajo
        .toLowerCase();
      
      // 3. Crear un nombre único con la fecha actual
      const filePath = `productos/${Date.now()}_${fileNameLimpio}.${fileExt}`;

      // 4. Subir el archivo al bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Error de Supabase Storage:', uploadError);
        throw new Error('Error al subir la imagen. Revisa tu conexión o el tamaño de la foto.');
      }

      // 5. Obtener la URL pública para guardarla en la base de datos
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;

    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  }
};