import { Router, Request, Response } from "express";

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('about', { 
    title: 'About Hunt Hub',
    description: 'This is the about page rendered with EJS.'
  });
});

export default router;
