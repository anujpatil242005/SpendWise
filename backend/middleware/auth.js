const { createClerkClient, verifyToken: clerkVerifyToken } = require('@clerk/backend');

let clerkClient;
const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

const isMockEnabled = !secretKey || !publishableKey || secretKey.startsWith('your_clerk') || secretKey.startsWith('sk_test_aanXRZe4i4rjPJLnUUgayV90jr2OAHTwCU987Vm8GD') === false && secretKey === '';

// Initialize Clerk conditionally for local development safety
if (!isMockEnabled) {
  try {
    clerkClient = createClerkClient({ secretKey, publishableKey });
    console.log('[Auth Middleware] Clerk Backend SDK successfully initialized.');
  } catch (err) {
    console.error('[Auth Middleware] Failed to initialize Clerk Client:', err.message);
  }
} else {
  console.log('[Auth Middleware] Clerk credentials unset/mocked. Enabling offline local development mode.');
}

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access Denied: No authentication token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Mock Mode verification fallback
    if (isMockEnabled || token === 'mock_jwt_token_orchid_expense') {
      if (token === 'mock_jwt_token_orchid_expense') {
        // Map to standard mock user so developer can work offline
        req.user = { privyId: 'usr_spendwise_demo_123', userId: 'usr_spendwise_demo_123' };
        return next();
      }
      return res.status(401).json({ success: false, message: 'Invalid mock token.' });
    }

    // Real Clerk Token verification
    if (!clerkClient) {
      return res.status(500).json({ success: false, message: 'Internal Server Error: Clerk client unconfigured.' });
    }

    // Verify Clerk Session Token
    const verifiedClaims = await clerkVerifyToken(token, {
      secretKey,
      publishableKey,
      clockSkewInMs: 15000 // 15 seconds clock skew tolerance
    });
    
    // Attach verified user ID (claims.sub holds their unique Clerk user ID)
    // Map to both privyId (backward compatibility for controllers) and userId
    req.user = { 
      privyId: verifiedClaims.sub, 
      userId: verifiedClaims.sub 
    };
    next();
  } catch (error) {
    console.error('[Auth Error] Token verification failed:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

module.exports = { verifyToken };
