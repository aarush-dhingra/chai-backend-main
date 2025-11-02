function LoadingSpinner({ size = 'large' }) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div
        className={`${sizeClasses[size]} border-[var(--color-neon-purple)] border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}

export default LoadingSpinner;
