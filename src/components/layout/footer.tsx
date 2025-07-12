import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ReWear</h3>
            <p className="text-gray-600 mb-4">
              A community-driven platform for buying and selling pre-loved clothing. 
              Sustainable fashion for everyone.
            </p>
            <p className="text-sm text-gray-500">
              © 2024 ReWear. All rights reserved.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/?category=tops" className="text-gray-600 hover:text-gray-900">
                  Tops
                </Link>
              </li>
              <li>
                <Link href="/?category=bottoms" className="text-gray-600 hover:text-gray-900">
                  Bottoms
                </Link>
              </li>
              <li>
                <Link href="/?category=dresses" className="text-gray-600 hover:text-gray-900">
                  Dresses
                </Link>
              </li>
              <li>
                <Link href="/?category=shoes" className="text-gray-600 hover:text-gray-900">
                  Shoes
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
