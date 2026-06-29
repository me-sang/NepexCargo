import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env.config';
import { userService } from '@services/user.service';
import { ApiResponse } from '@common/helpers/api-response.helper';
import { UnauthorizedException } from '@common/exceptions';
import { logger } from '@common/helpers/logger';

/**
 * Register new user (auto-assigns 'user' role)
 */
export async function registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName } = req.body;
    const { verifyEmailToken } = await userService.registerUser(email, password, firstName, lastName);
    ApiResponse.created(res, { token: verifyEmailToken, scope: 'verify-email' });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, otp } = req.body as { token: string; otp: string };
    const user = await userService.verifyEmail(token, otp);
    const authToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userDetails } = user;
    ApiResponse.success(res, { user: userDetails, token: authToken });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export async function loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    let user;
    try {
      user = await userService.getUserByEmail(email);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await userService.validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userDetails } = user;

    ApiResponse.success(res, { user: userDetails, token });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user from token
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('User not found');
    }

    const user = await userService.getUserById(req.user.id);
    const { password: _, ...userDetails } = user;

    ApiResponse.success(res, userDetails);
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    const { password: _, ...userDetails } = user;

    ApiResponse.success(res, userDetails);
  } catch (error) {
    next(error);
  }
}

/**
 * Get all users
 */
export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await userService.getAllUsers();
    const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);

    ApiResponse.success(res, usersWithoutPasswords);
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    const resetToken = await userService.forgotPassword(email);
    ApiResponse.success(res, { resetToken });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { resetToken, otp, newPassword } = req.body as {
      resetToken: string;
      otp: string;
      newPassword: string;
    };
    await userService.resetPassword(resetToken, otp, newPassword);
    ApiResponse.success(res, { message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}
