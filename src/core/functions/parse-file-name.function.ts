const parseFileName = (text: string = '', maxLength: number = 100): string => {
  if (!text) return '';
  // Remove unwanted characters except letters, numbers, underscores, dots, and hyphens
  let fileName = text.replace(/\s+/g, '_');
  fileName = fileName.replace(/[^a-zA-Z0-9-_\.]/g, '');
  // Max length
  fileName = fileName.slice(0, maxLength);
  return fileName;
};

export default parseFileName;
