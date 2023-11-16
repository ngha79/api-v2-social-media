'use strict'

const StatusCode = {
  CREATED: 201,
  OK: 200,
  ERROR: 401,
}

const ReasonStatusCode = {
  CREATED: 'Created!',
  ERROR: 'Error',
  OK: 'Sucess',
}

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message
    this.status = statusCode
    this.metadata = metadata
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this)
  }
}

class ErrorResponse {
  constructor({
    message,
    statusCode = StatusCode.ERROR,
    reasonStatusCode = ReasonStatusCode.ERROR,
  }) {
    this.message = !message ? reasonStatusCode : message
    this.status = statusCode
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this)
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata })
  }
}

class ErrorMessage extends ErrorResponse {
  constructor({ message }) {
    super({ message })
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    metadata,
    statusCode = StatusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    options = {},
  }) {
    super({ message, metadata, statusCode, reasonStatusCode })
    this.options = options
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
  ErrorMessage,
}
