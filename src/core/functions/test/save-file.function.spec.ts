import * as fs from 'fs';
import * as path from 'path';
import saveFile from '../save-file.function';

jest.mock('fs');

describe('saveFile', () => {
  const uploadPath = '/path/to/upload';
  const filename = 'test-file.jpg';
  const buffer = Buffer.from('test-image-buffer');
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create directory if not exists', async () => {
    mockFs.existsSync.mockReturnValueOnce(false); // Simulate directory does not exist

    await saveFile(uploadPath, filename, buffer);

    expect(fs.mkdirSync).toHaveBeenCalledWith(uploadPath, { recursive: true });
  });

  it('should save file to specified path', async () => {
    mockFs.existsSync.mockReturnValueOnce(true); // Simulate directory exists

    await saveFile(uploadPath, filename, buffer);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(uploadPath, filename),
      buffer,
    );
  });

  it('should return filename', async () => {
    mockFs.existsSync.mockReturnValueOnce(true); // Simulate directory exists

    const result = await saveFile(uploadPath, filename, buffer);

    expect(result).toBe(filename);
  });

  it('should throw error if directory creation fails', async () => {
    mockFs.existsSync.mockReturnValueOnce(false); // Simulate directory does not exist
    mockFs.mkdirSync.mockImplementationOnce(() => {
      throw new Error('Failed to create directory');
    });

    await expect(saveFile(uploadPath, filename, buffer)).rejects.toThrowError(
      'Error al guardar el archivo: Failed to create directory',
    );
  });

  it('should throw error if file write fails', async () => {
    mockFs.existsSync.mockReturnValueOnce(true); // Simulate directory exists
    mockFs.writeFileSync.mockImplementationOnce(() => {
      throw new Error('Failed to write file');
    });

    await expect(saveFile(uploadPath, filename, buffer)).rejects.toThrowError(
      'Error al guardar el archivo: Failed to write file',
    );
  });
});
