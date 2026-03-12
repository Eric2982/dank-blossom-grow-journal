import https from 'https';

/**
 * Cloud Run Custom Audience authentication utilities.
 *
 * Cloud Run supports custom audiences so that services can verify incoming
 * ID tokens were issued specifically for them.  Set a custom audience on
 * a service with:
 *
 *   gcloud run services update SERVICE --add-custom-audiences=AUDIENCE
 *
 * The AUDIENCE value is then embedded in the `aud` claim of every ID token
 * that Cloud Run issues for that service.  The application should reject any
 * token whose `aud` does not match the configured audience.
 *
 * See: https://cloud.google.com/run/docs/configuring/custom-audiences
 */

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

/**
 * Decodes the payload of a JWT without verifying the signature.
 *
 * @param {string} token  A compact serialisation JWT (header.payload.signature).
 * @returns {object} The decoded JSON payload.
 * @throws {Error}   If the token is malformed.
 */
function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT: expected three dot-separated parts');
  }
  const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(padded, 'base64').toString('utf-8');
  return JSON.parse(json);
}

/**
 * Returns true when the token payload contains the expected audience.
 *
 * The `aud` claim may be a single string or an array of strings; this
 * function handles both forms.
 *
 * @param {object}          payload          Decoded JWT payload.
 * @param {string|string[]} expectedAudience  The audience(s) to accept.
 * @returns {boolean}
 */
function hasExpectedAudience(payload, expectedAudience) {
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const expected = Array.isArray(expectedAudience)
    ? expectedAudience
    : [expectedAudience];
  return expected.some((aud) => audiences.includes(aud));
}

/**
 * Returns true when the token has not yet expired.
 *
 * @param {object} payload  Decoded JWT payload.
 * @param {number} [nowSec] Current time as Unix seconds (injectable for testing).
 * @returns {boolean}
 */
function isTokenExpired(payload, nowSec) {
  const now = nowSec !== undefined ? nowSec : Math.floor(Date.now() / 1000);
  return typeof payload.exp === 'number' && payload.exp <= now;
}

/**
 * Fetches the Google public certificates used to sign Cloud Run ID tokens.
 *
 * @returns {Promise<object>} A key/value map of keyId → PEM certificate.
 */
function fetchGoogleCerts() {
  return new Promise((resolve, reject) => {
    https
      .get(GOOGLE_CERTS_URL, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error('Failed to parse Google certificates: ' + err.message));
          }
        });
      })
      .on('error', reject);
  });
}

/**
 * Express middleware that authenticates incoming requests using a Google
 * OIDC ID token and verifies the token audience against
 * `process.env.CLOUD_RUN_CUSTOM_AUDIENCE`.
 *
 * Requests that do not supply a valid bearer token with the correct audience
 * are rejected with HTTP 401.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function cloudRunAuthMiddleware(req, res, next) {
  const audience = process.env.CLOUD_RUN_CUSTOM_AUDIENCE;
  if (!audience) {
    // No audience configured — skip audience verification and proceed.
    return next();
  }

  const authHeader = req.headers && req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = decodeJwtPayload(token);
  } catch (err) {
    return res.status(401).json({ error: 'Malformed token: ' + err.message });
  }

  if (isTokenExpired(payload)) {
    return res.status(401).json({ error: 'Token has expired' });
  }

  if (!hasExpectedAudience(payload, audience)) {
    return res.status(401).json({ error: 'Token audience mismatch' });
  }

  // Attach the decoded claims to the request for downstream handlers.
  req.cloudRunClaims = payload;
  next();
}

/**
 * Verifies a Cloud Run OIDC ID token payload against the configured custom
 * audience.  This is the lightweight, pure-logic entry point that is easy
 * to unit-test without standing up a real HTTP server.
 *
 * @param {string} token                  Raw JWT string.
 * @param {string} expectedAudience       The audience string to accept.
 * @param {object} [opts]
 * @param {number} [opts.nowSec]          Current time as Unix seconds.
 * @returns {{ valid: boolean, payload: object|null, error: string|null }}
 */
function verifyCloudRunToken(token, expectedAudience, opts = {}) {
  let payload;
  try {
    payload = decodeJwtPayload(token);
  } catch (err) {
    return { valid: false, payload: null, error: err.message };
  }

  if (isTokenExpired(payload, opts.nowSec)) {
    return { valid: false, payload, error: 'Token has expired' };
  }

  if (!hasExpectedAudience(payload, expectedAudience)) {
    return {
      valid: false,
      payload,
      error: `Audience mismatch: expected "${expectedAudience}", got "${payload.aud}"`,
    };
  }

  return { valid: true, payload, error: null };
}

export {
  decodeJwtPayload,
  hasExpectedAudience,
  isTokenExpired,
  fetchGoogleCerts,
  cloudRunAuthMiddleware,
  verifyCloudRunToken,
};
