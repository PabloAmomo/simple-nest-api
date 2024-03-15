import * as bcrypt from 'bcrypt';

const createPasswordHash = async (
  password: string,
  salt?: number,
): Promise<string> => {
  return await bcrypt.hash(password, salt ?? 10);
};

export default createPasswordHash;
