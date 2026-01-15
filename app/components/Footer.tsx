export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold">EddyShop</span>
            </div>
            <p className="text-zinc-400 text-sm">
              ร้านค้าออนไลน์คุณภาพ สินค้าหลากหลาย ราคาดี จัดส่งรวดเร็ว
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">เมนู</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a href="/products" className="hover:text-white transition-colors">
                  สินค้าทั้งหมด
                </a>
              </li>
              <li>
                <a href="/categories" className="hover:text-white transition-colors">
                  หมวดหมู่
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-white transition-colors">
                  ตะกร้าสินค้า
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">ติดต่อสั่งซื้อ</h3>
            <p className="text-sm text-zinc-400">
              <a 
                href="http://m.me/airportthai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                💬 m.me/airportthai
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-sm text-zinc-400">
          © {new Date().getFullYear()} EddyShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
