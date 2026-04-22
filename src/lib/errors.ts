import { NextResponse } from 'next/server'

export function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ code, message }, { status })
}

export const unauthorized = () => errorResponse('UNAUTHORIZED', 'You must be logged in', 401)
export const forbidden = () => errorResponse('FORBIDDEN', 'Admin access required', 403)
export const notFound = (resource = 'Resource') =>
  errorResponse('NOT_FOUND', `${resource} not found`, 404)
export const conflict = (message: string) => errorResponse('CONFLICT', message, 409)
export const validationError = (message: string) =>
  errorResponse('VALIDATION_ERROR', message, 422)
