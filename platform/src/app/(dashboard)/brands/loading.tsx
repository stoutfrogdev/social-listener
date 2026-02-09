import { Card, CardContent } from '@/components/ui/card'

export default function BrandsLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="h-9 w-32 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-5 w-32 bg-muted rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
