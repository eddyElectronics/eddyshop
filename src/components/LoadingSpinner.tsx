interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({ 
  size = 'md', 
  message = 'กำลังโหลด...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const content = (
    <div className="text-center">
      <div
        className={`animate-spin rounded-full border-blue-600 border-t-transparent mx-auto mb-4 ${sizeClasses[size]}`}
      />
      {message && (
        <p className="text-zinc-600 dark:text-zinc-400">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        {content}
      </div>
    );
  }

  return content;
}
