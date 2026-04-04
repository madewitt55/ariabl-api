import type { Request } from 'express';

// Helper type to designate format of validated requests to their schema
export type TypedRequest<
  T extends {
    body?: any;
    params?: any;
    query?: any;
  }
> = Request<T['params'], any, T['body'], T['query']>;