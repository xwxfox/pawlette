import { Component, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Warning, ArrowClockwise } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 w-full">
          <Alert variant="destructive">
            <Warning className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              This component encountered an error. You can try resetting it.
            </AlertDescription>
          </Alert>
          {this.state.error && (
            <div className="mt-4 bg-muted/50 p-3 rounded border">
              <pre className="text-xs text-destructive overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            </div>
          )}
          <Button 
            onClick={this.handleReset} 
            className="w-full mt-4"
            variant="outline"
            size="sm"
          >
            <ArrowClockwise className="mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
