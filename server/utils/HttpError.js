// An Error that carries an HTTP status code, so routes can write:
//   throw new HttpError(404, 'Product not found')
// and the central error handler in index.js turns it into a JSON response.
export default class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
