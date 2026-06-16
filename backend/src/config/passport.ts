import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import prisma from './database';
import { PICStatus } from '@prisma/client';

// ─────────────────────────────────────────────────
// Passport Google OAuth2 Strategy — Stateless (no sessions)
// ─────────────────────────────────────────────────

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
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
            phone: '',           // required field — user must complete profile
            password: '',        // no password for Google users
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

// No serializeUser/deserializeUser needed — we use stateless JWT

export default passport;
