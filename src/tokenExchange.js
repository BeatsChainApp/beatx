const fetch = require('node-fetch');

async function verifyGoogleToken(idToken) {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error_description || 'Invalid token');
    }
    
    // Verify the token is for our client ID
    if (process.env.GOOGLE_CLIENT_ID && data.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Token audience mismatch');
    }
    
    return {
      uid: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture
    };
  } catch (error) {
    throw new Error(`Google token verification failed: ${error.message}`);
  }
}

async function verifyAndCreateSession(idToken) {
  if (!idToken) return { success: false, message: 'idToken required' };
  
  try {
    const userData = await verifyGoogleToken(idToken);
    return {
      success: true,
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      sessionToken: 'google-session-' + Math.random().toString(36).slice(2, 12),
      expiresIn: 60 * 60
    };
  } catch (error) {
    console.warn('Token verification failed:', error.message);
    
    // Development fallback
    if (process.env.NODE_ENV !== 'production') {
      return {
        success: true,
        uid: 'dev-' + Math.random().toString(36).slice(2, 8),
        email: 'dev@example.com',
        sessionToken: 'dev-session-' + Math.random().toString(36).slice(2, 10),
        expiresIn: 60 * 60
      };
    }
    
    return { success: false, message: error.message };
  }
}

module.exports = { verifyAndCreateSession };
