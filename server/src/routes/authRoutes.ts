import express, { Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

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

router.get('/logout', async (req: any, res: any) => {
  req.logout(() => {
    res.redirect('/');
  });
});


router.post('/auth/token', async (req: any, res: any) => {
  const { email, password, sessionID } = req.body;  
  if (sessionID) {      
    return res.status(401).json({ 
      error: 'Not implemented',
      message: 'Autenticação via sessionID ainda não implementada'
    });
  }
  
  
  if (email && password) {
    try {
      
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      if (!user.active) {
        return res.status(401).json({ error: 'Account not activated' });
      }
      
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      
      const { password: _, activationToken: __, resetToken: ___, ...userSafe } = user;
      
      
      req.login(userSafe, (err: any) => {
        if (err) {
          console.error(`❌ Erro durante login com Passport (mobile): ${err.message}`, err);
          return res.status(500).json({ error: 'Internal server error' });
        }        
   
        return res.json({
          ...userSafe,
          sessionID: req.sessionID,
          isMobile: true
        });
      });
    } catch (error) {
      console.error('❌ Erro durante autenticação via token:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    
    return res.status(400).json({ error: 'Missing credentials' });
  }
});


router.get('/auth/debug', (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  
  const sessionInfo = {
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!req.user,
    sessionID: req.sessionID,
    cookies: req.headers.cookie,
    isMobile,
    userAgent,
    headers: {
      ...req.headers,
      
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers.cookie ? '[PRESENT]' : '[ABSENT]',
    },
  };
  
  res.json({
    status: 'success',
    debug: sessionInfo,
    user: req.user || null,
  });
});


router.get('/auth/me', (req: any, res: any) => {
  
  const querySessionID = req.query.sessionID as string | undefined;
  
  if (req.isAuthenticated() && req.user) {
    const user = req.user as any;    
    
    res.json({
      ...req.user,
      sessionID: req.sessionID
    });
  } else if (querySessionID) {
        
    try {
      const sessionStore = (req.sessionStore as any);
      
      if (!sessionStore || typeof sessionStore.get !== 'function') {
        console.error('❌ Erro: sessionStore não disponível ou não tem método get');
        return res.status(401).json({ 
          error: 'Not authenticated',
          message: 'Sessão inválida ou expirada. Por favor, faça login novamente.'
        });
      }
      
      
      sessionStore.get(querySessionID, async (err: any, session: any) => {
        if (err || !session || !session.passport || !session.passport.user) {
          return res.status(401).json({ 
            error: 'Not authenticated',
            message: 'Sessão inválida ou expirada. Por favor, faça login novamente.'
          });
        }
        
        
        const userId = session.passport.user;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (!user) {
          return res.status(401).json({ 
            error: 'Not authenticated',
            message: 'Usuário não encontrado. Por favor, faça login novamente.'
          });
        }
        
        
        const { password, activationToken, resetToken, ...userSafe } = user;        
        
        return res.json({
          ...userSafe,
          sessionID: querySessionID
        });
      });
    } catch (error) {
      console.error('❌ Erro ao verificar sessionID:', error);
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'Erro ao verificar sessão. Por favor, faça login novamente.'
      });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
