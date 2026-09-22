export default function CatalogResultsSkeleton() {
  return (
    <div aria-busy="true" data-testid="animals-loading">
      <p role="status" className="sr-only">
        Carregando animais…
      </p>

      <div
        aria-hidden="true"
        className="h-7 w-64 max-w-full animate-pulse rounded-full bg-white/10 motion-reduce:animate-none"
      />

      <ul
        aria-hidden="true"
        className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <li
            key={index}
            className="overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.84)]"
          >
            <div className="aspect-[4/3] animate-pulse bg-white/5 motion-reduce:animate-none sm:aspect-[4/4.2]" />
            <div className="space-y-3 p-4 sm:p-5">
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
              <div className="h-3 w-full animate-pulse rounded-full bg-white/5 motion-reduce:animate-none" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/5 motion-reduce:animate-none" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
