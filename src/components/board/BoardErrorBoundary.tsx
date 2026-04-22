'use client'

import { Component, type ReactNode } from 'react'

type State = { hasError: boolean; error: Error | null }

export class BoardErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="mb-4 text-sm text-red-600">
            An unexpected error occurred. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
