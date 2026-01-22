export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="inline-flex mt-8 items-center justify-center rounded-xl bg-secondary px-6 py-3 text-white font-semibold hover:bg-secondary/90 transition-colors"
        >
          Go home
        </a>
      </div>
    </main>
  );
}

