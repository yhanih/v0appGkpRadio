// Global error handler to suppress non-critical errors in development
// AbortErrors are common in React Strict Mode and Next.js development

if (typeof window !== 'undefined') {
  // Suppress AbortError in console
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Filter out AbortError messages and navigatorLock errors
    const hasAbortError = args.some(arg => 
      arg?.name === 'AbortError' ||
      arg?.name === 'DOMException' ||
      arg?.message === 'The operation was aborted.' ||
      (typeof arg === 'string' && (arg.includes('aborted') || arg.includes('navigatorLock'))) ||
      (typeof arg === 'object' && (
        arg?.constructor?.name === 'AbortError' ||
        arg?.constructor?.name === 'DOMException' ||
        arg?.stack?.includes('navigatorLock')
      ))
    );
    
    if (!hasAbortError) {
      originalError.apply(console, args);
    }
  };

  // Handle unhandled promise rejections (AbortErrors)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (
      error?.name === 'AbortError' ||
      error?.name === 'DOMException' ||
      error?.message === 'The operation was aborted.' ||
      error?.message?.includes('aborted') ||
      error?.stack?.includes('navigatorLock')
    ) {
      // Suppress AbortError rejections
      event.preventDefault();
    }
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    if (
      event.error?.name === 'AbortError' ||
      event.error?.name === 'DOMException' ||
      event.error?.message === 'The operation was aborted.' ||
      event.message?.includes('aborted') ||
      event.message?.includes('navigatorLock')
    ) {
      // Suppress AbortError
      event.preventDefault();
    }
  });
}
