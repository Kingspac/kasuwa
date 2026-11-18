// Wraps an async route so any thrown error or rejected promise is passed to
// Express's error handler instead of crashing the request.
export default (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
