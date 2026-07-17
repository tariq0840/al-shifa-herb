import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ color: '#ef4444', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{this.state.error.message}</p>
          <pre style={{ marginTop: 12, padding: 12, background: '#f3f4f6', borderRadius: 8, fontSize: 12, overflow: 'auto', maxHeight: 400 }}>
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { localStorage.removeItem('admin_auth'); window.location.reload() }}
            style={{ marginTop: 16, padding: '8px 24px', background: '#0f3d2e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Reset & Relogin
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
