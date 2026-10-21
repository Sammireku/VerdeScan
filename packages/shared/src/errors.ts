// T-001 / T-003: Error codes and error mappings
export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  LIMIT_REACHED: 'LIMIT_REACHED',
  INVALID_INPUT: 'INVALID_INPUT',
  IMAGES_MISSING: 'IMAGES_MISSING',
  IMAGE_INVALID: 'IMAGE_INVALID',
  IMAGE_HAS_GPS: 'IMAGE_HAS_GPS',
  IMAGE_LOW_QUALITY: 'IMAGE_LOW_QUALITY',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  KB_EMPTY: 'KB_EMPTY',
  INTERNAL: 'INTERNAL',
} as const;

export type AppErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ErrorDefinition {
  detailsCode: AppErrorCode;
  firebaseCode:
    | 'unauthenticated'
    | 'resource-exhausted'
    | 'invalid-argument'
    | 'failed-precondition'
    | 'unavailable'
    | 'internal';
  when: string;
  clientBehaviour: string;
}

export const ERROR_DEFINITIONS: Record<AppErrorCode, ErrorDefinition> = {
  AUTH_REQUIRED: {
    detailsCode: 'AUTH_REQUIRED',
    firebaseCode: 'unauthenticated',
    when: 'No valid token',
    clientBehaviour: 'Prompt sign-in',
  },
  LIMIT_REACHED: {
    detailsCode: 'LIMIT_REACHED',
    firebaseCode: 'resource-exhausted',
    when: 'Monthly or hourly limit exceeded',
    clientBehaviour: 'Show upgrade or wait message',
  },
  INVALID_INPUT: {
    detailsCode: 'INVALID_INPUT',
    firebaseCode: 'invalid-argument',
    when: 'Schema validation failed',
    clientBehaviour: 'Show generic error; log id',
  },
  IMAGES_MISSING: {
    detailsCode: 'IMAGES_MISSING',
    firebaseCode: 'failed-precondition',
    when: 'Uploaded files not found at uploadPaths',
    clientBehaviour: 'Retry upload',
  },
  IMAGE_INVALID: {
    detailsCode: 'IMAGE_INVALID',
    firebaseCode: 'invalid-argument',
    when: 'Unsupported type, oversize, or corrupt',
    clientBehaviour: 'Ask for a new photo',
  },
  IMAGE_HAS_GPS: {
    detailsCode: 'IMAGE_HAS_GPS',
    firebaseCode: 'invalid-argument',
    when: 'Location metadata present',
    clientBehaviour: 'Re-encode and re-upload automatically',
  },
  IMAGE_LOW_QUALITY: {
    detailsCode: 'IMAGE_LOW_QUALITY',
    firebaseCode: 'failed-precondition',
    when: 'Blurry, dark, or no plant detected',
    clientBehaviour: 'Show framing tips',
  },
  MODEL_UNAVAILABLE: {
    detailsCode: 'MODEL_UNAVAILABLE',
    firebaseCode: 'unavailable',
    when: 'Primary and fallback model both failed',
    clientBehaviour: 'Queue and retry; show offline-style message',
  },
  KB_EMPTY: {
    detailsCode: 'KB_EMPTY',
    firebaseCode: 'failed-precondition',
    when: 'No KB entries for the crop and region',
    clientBehaviour: 'Return generic guidance and flag for content team',
  },
  INTERNAL: {
    detailsCode: 'INTERNAL',
    firebaseCode: 'internal',
    when: 'Anything else',
    clientBehaviour: 'Show generic error; log id',
  },
};
