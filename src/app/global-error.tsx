'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        {error.digest && <pre>{error.digest}</pre>}
        <p>
          <button onClick={() => reset()}>Try again</button>
        </p>
      </body>
    </html>
  )
}