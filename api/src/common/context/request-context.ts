export type AuthType = 'jwt' | 'api-key' | 'anonymous';

export interface RequestContext {
  requestId: string;
  companyId?: string;
  userId?: string;
  roles?: string[];
  authType: AuthType;
  ip?: string;
  userAgent?: string;
}
