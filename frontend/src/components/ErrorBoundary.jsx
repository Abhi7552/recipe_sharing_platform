import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center">
          <p className="font-display text-3xl font-semibold text-ink">Something went wrong.</p>
          <p className="mt-2 max-w-sm text-sm text-ink/55">
            Try refreshing the page. If the problem keeps happening, please let us know.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-6">
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
