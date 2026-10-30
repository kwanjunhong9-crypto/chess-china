import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-stone-900 border border-red-500/40 rounded-2xl text-center max-w-md mx-auto my-6 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto mb-3 text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-100 mb-1">
            {this.props.fallbackTitle || '内容渲染遇到异常'}
          </h3>
          <p className="text-xs text-stone-400 mb-4 font-mono break-all">
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 mx-auto transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复并重新加载</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
