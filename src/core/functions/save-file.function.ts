import * as fs from 'fs';
import * as path from 'path';

const saveFile = async (
  uploadPath: string,
  filename: string,
  buffer: Buffer,
): Promise<string> => {
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Crear directorio si no existe
    }

    fs.writeFileSync(path.join(uploadPath, filename), buffer); // Guardar el archivo en disco

    return filename;
  } catch (error: Error | any) {
    throw new Error(`Error al guardar el archivo: ${error.message}`);
  }
};

export default saveFile;
