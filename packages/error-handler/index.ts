export class AppError extends Error {
public readonly statusCode: number;
public readonly isOperational: boolean; 
public readonly details?: any;
constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    details?: any
) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);

}}

export class NotFoundError extends AppError {
    constructor(
        message= 'Resource not found'
    ) {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(
        message = 'Validation error',
        details?: any
    ) {
        super(message, 400, true, details);
    }
}

export class AuthError extends AppError {
    constructor(
        message = 'Authentication failed'
    ) {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {  
    constructor(
        message = 'Access forbidden'
    ) {
        super(message, 403);
    }
}

export class DatabaseError extends AppError {   
    constructor(
        message = 'Database error',
        details?: any
    ) {
        super(message, 500, false, details);
    }
}

export class InternalServerError extends AppError {         
    constructor(
        message = 'Internal server error',
        details?: any
    ) {
        super(message, 500, false, details);
    }
}   

export class RateLimitError extends AppError {           
    constructor(
        message = 'Too many requests, please try again later.'
    ) {
        super(message, 429);
    }
}

export class ConflictError extends AppError {               
    constructor(
        message = 'Conflict error',
        details?: any
    ) {
        super(message, 409, true, details);
    }
}

export class ServiceUnavailableError extends AppError {       
    constructor(
        message = 'Service unavailable',
        details?: any
    ) {
        super(message, 503, false, details);
    }
}

export class UnauthorizedError extends AppError {   
    constructor(
        message = 'Unauthorized access',
        details?: any
    ) {
        super(message, 401, true, details);
    }
}

export class BadRequestError extends AppError {
    constructor(
        message = 'Bad request',
        details?: any
    ) {
        super(message, 400, true, details);
    }
}
export class MethodNotAllowedError extends AppError {
    constructor(
        message = 'Method not allowed',
        details?: any
    ) {
        super(message, 405, true, details);
    }
}
export class NotAcceptableError extends AppError {
    constructor(
        message = 'Not acceptable',
        details?: any
    ) {
        super(message, 406, true, details);
    }
}
