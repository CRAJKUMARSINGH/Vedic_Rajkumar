import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'vedic_correlation_id';
const REQUEST_KEY = 'vedic_request_id';

/** Stable per-session id — ties all events in a user session together. */
export const getCorrelationId = (): string => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return uuidv4();
  }
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
};

/** Fresh per-request id — ties a single user action across client→edge→db. */
export const newRequestId = (): string => {
  const id = uuidv4();
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem(REQUEST_KEY, id);
  }
  return id;
};

export const getRequestId = (): string => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return newRequestId();
  }
  return sessionStorage.getItem(REQUEST_KEY) ?? newRequestId();
};

export const withCorrelation = <T extends Record<string, unknown>>(meta: T) => ({
  correlationId: getCorrelationId(),
  requestId: getRequestId(),
  ...meta,
});
