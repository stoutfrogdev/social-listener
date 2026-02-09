import { Card, CardContent } from '@/components/ui/card'

export default function BrandDetailLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="h-9 w-48 bg-muted rounded animate-pulse" />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="h-6 w-36 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
