import express, { Request, Response, NextFunction } from 'express'
import path from 'path'

export const clientFallbackMiddleware = () => {
  const router = express.Router()
  const clientBuildPath = path.join(__dirname, '../../../client/dist')
  
  // Serve static files
  router.use(express.static(clientBuildPath))

  // Fallback for React Router (only if it's not an API request)
  router.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
      if (err) {
        res.send('API Server active. Run `pnpm dev` to start React frontend in development.')
      }
    })
  })

  return router
}
