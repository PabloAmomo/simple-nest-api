import * as crypto from 'crypto';

function generateRandomToken(seed: string): string {
  const tokenLength = 64;

  const randomValue = crypto
    .createHash('sha256')
    .update(seed + Date.now() + (Math.random() + 1).toString(36).substring(7))
    .digest('hex');

  const buffer = Buffer.alloc(tokenLength);
  buffer.write(randomValue);

  return buffer.toString('hex');
}

export default generateRandomToken;
