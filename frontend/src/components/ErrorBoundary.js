import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Oops, algo salió mal.</h1>
          <p className="text-gray-600">Por favor, intenta recargar la página.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
