export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}.` })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  if (error?.code === 11000) return res.status(409).json({ error: 'An account with that email already exists.' })
  if (error?.name === 'CastError') return res.status(400).json({ error: 'That record ID is not valid.' })
  console.error(error)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
}
