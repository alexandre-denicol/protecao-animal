export default function AdoptionStoriesSkeleton() {
  return (
    <div aria-busy="true" data-testid="adoption-stories-loading" className="mt-8">
      <p role="status" className="sr-only">
        Carregando histórias…
      </p>

      <div aria-hidden="true">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="grid gap-x-4 gap-y-5 border-t border-white/10 py-8 sm:py-10 md:grid-cols-12 md:items-center"
          >
            <div className="aspect-[3/2] animate-pulse rounded-2xl bg-white/5 motion-reduce:animate-none md:col-span-5 md:aspect-[4/3]" />
            <div className="space-y-3 md:col-span-7 md:px-6">
              <div className="h-4 w-40 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
              <div className="h-8 w-56 max-w-full animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
              <div className="h-4 w-full max-w-md animate-pulse rounded-full bg-white/5 motion-reduce:animate-none" />
              <div className="h-4 w-3/4 max-w-md animate-pulse rounded-full bg-white/5 motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
