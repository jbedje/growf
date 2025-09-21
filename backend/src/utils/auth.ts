import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config/env';
import { JWTPayload } from '../types';
import redis from '../config/redis';
import { logger } from '../config/logger';

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcryptRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    } as jwt.SignOptions);
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JWTPayload;
    } catch (error) {
      logger.error('Error verifying access token:', error);
      throw new Error('Invalid token');
    }
  }

  static async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await redis.setEx(`blacklist:${token}`, expiresIn, 'true');
        }
      }
    } catch (error) {
      logger.error('Error blacklisting token:', error);
    }
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const result = await redis.get(`blacklist:${token}`);
      return result === 'true';
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      return false;
    }
  }

  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async storeVerificationToken(userId: string, token: string): Promise<void> {
    await redis.setEx(`verification:${token}`, 24 * 60 * 60, userId); // 24 hours
  }

  static async storeResetToken(userId: string, token: string): Promise<void> {
    await redis.setEx(`reset:${token}`, 60 * 60, userId); // 1 hour
  }

  static async getVerificationToken(token: string): Promise<string | null> {
    return redis.get(`verification:${token}`);
  }

  static async getResetToken(token: string): Promise<string | null> {
    return redis.get(`reset:${token}`);
  }

  static async deleteVerificationToken(token: string): Promise<void> {
    await redis.del(`verification:${token}`);
  }

  static async deleteResetToken(token: string): Promise<void> {
    await redis.del(`reset:${token}`);
  }
}