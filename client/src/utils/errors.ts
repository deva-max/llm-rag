export class HttpErrorResponse extends Error {
  public statusCode: number
  public data?: any

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message)
    this.name = 'HttpErrorResponse'
    this.statusCode = statusCode
    this.data = data
  }
}
