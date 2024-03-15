import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

function checkInterfaceProperties(
  objeto: any,
  interfaceKeys: string[],
  name: string,
): boolean {
  const objectKey = Object.keys(objeto);
  for (let i = 0; i < interfaceKeys.length; i++) {
    if (!objectKey.includes(interfaceKeys[i]))
      throw new InvalidDataException(`invalid ${name}`);
  }
  return true;
}

export default checkInterfaceProperties;
