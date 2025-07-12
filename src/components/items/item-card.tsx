import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ItemWithUser } from '@/models/Item'
import { formatPrice, capitalizeFirst, getConditionColor } from '@/lib/utils'

interface ItemCardProps {
  item: ItemWithUser
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/item-details/${item._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-square relative">
          <Image
            src={item.images[0] || '/placeholder-image.svg'}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2">
            <Badge className={getConditionColor(item.condition)}>
              {capitalizeFirst(item.condition)}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(item.sellingPrice)}
            </span>
            <Badge variant="outline">
              {capitalizeFirst(item.category)}
            </Badge>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 pb-4 pt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>by {item.user.name}</span>
            <span>•</span>
            <span>Size {item.size}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
