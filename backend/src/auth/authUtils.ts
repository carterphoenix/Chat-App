import jwt from 'jsonwebtoken';

export function generateToken(userId: string, username: string): string {
  const token = jwt.sign({ id: userId, username: username }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  return token;
}
