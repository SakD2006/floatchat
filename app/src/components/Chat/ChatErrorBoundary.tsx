"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ChatErrorBoundary] Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/70 max-w-md">
              <div className="text-lg font-light mb-4">
                ⚠️ Something went wrong with the chat
              </div>
              <div className="text-sm text-white/50 mb-4">
                {this.state.error?.message || "An unexpected error occurred"}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="
                  px-4 py-2 text-sm
                  bg-blue-500 hover:bg-blue-600
                  rounded-lg transition-colors
                  text-white
                "
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
