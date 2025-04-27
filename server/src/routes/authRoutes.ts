import express, { Request, Response } from 'express';
import passport from 'passport';
import { wrapAsync } from '../utils/wrapAsync';

const router = express.Router();

router.get('/signin/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  (req: Request, res: Response) => {
    res.redirect(process.env.CLIENT_URL!);
  }
);

router.get('/logout', wrapAsync(async (req: Request, res: Response) => {
  req.logout(() => {
    res.redirect('/');
  });
}));

router.get('/auth/me', (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
