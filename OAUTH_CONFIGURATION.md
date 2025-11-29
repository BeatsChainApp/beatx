# Google OAuth Configuration for beatx-six.vercel.app

## Add to Google Cloud Console

### Authorized JavaScript Origins
```
https://beatx-six.vercel.app
https://beatx-six.vercel.app/
```

### Authorized Redirect URIs
```
https://beatx-six.vercel.app/auth/callback
https://beatx-six.vercel.app/api/auth/callback/google
```

### Environment Variables to Update
```env
NEXTAUTH_URL=https://beatx-six.vercel.app
GOOGLE_CLIENT_ID=your_existing_client_id
GOOGLE_CLIENT_SECRET=your_existing_client_secret
```

## Railway MCP Server Environment Variables
```env
PINATA_JWT=your_pinata_jwt_token
ALLOWED_ORIGINS=https://beatx-six.vercel.app,http://localhost:3000
```