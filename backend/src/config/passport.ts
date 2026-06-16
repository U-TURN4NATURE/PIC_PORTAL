import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import prisma from './database';
import { PICStatus } from '@prisma/client';

// ─────────────────────────────────────────────────
// Passport Google OAuth2 Strategy — Stateless (no sessions)
// Only registered if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are present.
// Server boots normally without them — Google login returns 503 if unconfigured.
// ─────────────────────────────────────────────────

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

if (googleClientId && googleClientSecret && googleCallbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile: Profile, done) => {
        try {
          const googleEmail = profile.emails?.[0]?.value;
          if (!googleEmail) {
            return done(new Error('No email returned from Google'), undefined);
          }

          const googleName = profile.displayName || googleEmail.split('@')[0];

          // Helper: attach role so TypeScript is satisfied (Express.User extends JWTPayload)
          const withRole = (p: any) => ({ ...p, role: 'PIC' as const });

          // 1. Check if a PIC account with this googleId already exists
          let pic = await prisma.pICPartner.findUnique({
            where: { googleId: profile.id },
          });

          if (pic) {
            return done(null, withRole(pic));
          }

          // 2. Check if an EMAIL account already exists with the same email
          const existingByEmail = await prisma.pICPartner.findUnique({
            where: { email: googleEmail },
          });

          if (existingByEmail) {
            // Link the Google ID to the existing account
            pic = await prisma.pICPartner.update({
              where: { email: googleEmail },
              data: {
                googleId: profile.id,
                authProvider: 'GOOGLE',
                isEmailVerified: true,
              },
            });
            return done(null, withRole(pic));
          }

          // 3. Brand new user — create a PENDING account automatically
          pic = await prisma.pICPartner.create({
            data: {
              fullName: googleName,
              email: googleEmail,
              phone: '',
              password: '',
              address: '',
              state: '',
              city: '',
              pincode: '',
              googleId: profile.id,
              authProvider: 'GOOGLE',
              status: PICStatus.PENDING,
              isEmailVerified: true,
              profileCompleted: false,
            },
          });

          return done(null, withRole(pic));
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy registered');
} else {
  console.warn('⚠️  Google OAuth not configured — GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing. Google login will be unavailable.');
}

// No serializeUser/deserializeUser needed — we use stateless JWT

export default passport;

