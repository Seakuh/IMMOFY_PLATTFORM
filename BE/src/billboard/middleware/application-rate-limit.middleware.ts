import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BillboardApplicationRepository } from '../repositories/billboard-application.repository';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Injectable()
export class ApplicationRateLimitMiddleware implements NestMiddleware {
  constructor(
    private readonly applicationRepository: BillboardApplicationRepository,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Only apply rate limiting to application creation endpoints
    if (req.method !== 'POST' || !req.path.includes('/apply')) {
      return next();
    }

    if (!req.user?.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const userId = req.user.id;
    const todayApplicationCount = await this.applicationRepository.countUserApplicationsToday(userId);

    if (todayApplicationCount >= 3) {
      throw new HttpException(
        {
          message: 'Application limit exceeded. You can only apply to 3 billboards per day.',
          error: 'RATE_LIMIT_EXCEEDED',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfter: this.getSecondsUntilMidnight()
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    next();
  }

  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
  }
}