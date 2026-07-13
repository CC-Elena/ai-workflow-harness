const SECRET_KEY = /^(?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|password|passwd|secret|cookie|authorization)$/i;
const ASSIGNMENT = /\b(api[_-]?key|token|password|passwd|secret|cookie|authorization)\s*[:=]\s*([^\s,;]+)/gi;
const BEARER = /bearer\s+[a-z0-9._~+/=-]+/gi;
const PRIVATE_URL = /https?:\/\/(?:localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01]))[^\s]*/gi;
const INJECTION = /ignore\s+(?:all\s+)?previous|system\s+prompt|developer\s+message|elevate\s+(?:my\s+)?authority|disable\s+(?:the\s+)?guard/i;

/**
 * Public Harness API.
 */
export function redact(value, key = '') {
  if (SECRET_KEY.test(key)) return '[REDACTED]';
  if (typeof value === 'string') {
    return value
      .replace(ASSIGNMENT, '$1=[REDACTED]')
      .replace(BEARER, 'Bearer [REDACTED]')
      .replace(PRIVATE_URL, '[PRIVATE_URL]');
  }
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redact(item, name)]));
  }
  return value;
}

/**
 * Public Harness API.
 */
export function assessUntrustedText(content) {
  const promptInjection = INJECTION.test(String(content));
  return {
    trusted: false,
    promptInjection,
    maxAuthority: promptInjection ? 0 : 20,
    handling: promptInjection ? 'quarantine_as_data' : 'treat_as_untrusted_data'
  };
}

/**
 * Public Harness API.
 */
export function safeEnvironment(environment = process.env) {
  return Object.fromEntries(
    Object.entries(environment)
      .filter(([key]) => /^(CI|NODE_ENV|PATH|HOME|SHELL|LANG)$/.test(key))
      .map(([key, value]) => [key, key === 'PATH' || key === 'HOME' ? '[REDACTED_PATH]' : value])
  );
}
