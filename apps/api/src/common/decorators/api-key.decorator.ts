import { SetMetadata } from '@nestjs/common';

export const API_KEY_ONLY_KEY = 'apiKeyOnly';
export const ALLOW_API_KEY_KEY = 'allowApiKey';

export const ApiKeyOnly = () => SetMetadata(API_KEY_ONLY_KEY, true);
export const AllowApiKey = () => SetMetadata(ALLOW_API_KEY_KEY, true);
