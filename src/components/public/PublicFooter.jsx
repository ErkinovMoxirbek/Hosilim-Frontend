// src/components/public/PublicFooter.jsx
export default function PublicFooter() {
   const Container = ({ children, className = "" }) => (
      <div className={`mx-auto w-full max-w-7xl px-6 lg:px-12 ${className}`}>{children}</div>
   );
   return (

      <footer id="contact" className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Hosilim.uz bilan hududiy agro tizimni raqamlashtiring.</h2>
            <p className="text-gray-600 mb-8 text-lg">
                Hozircha tizim yopiq rejimda ishlamoqda. Demo versiyani olish uchun administrator bilan bog'laning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors w-full sm:w-auto">
                    +998 90 123 45 67
                </button>
                <button className="px-8 py-3 bg-white text-green-600 border border-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors w-full sm:w-auto">
                    Telegramdan yozish
                </button>
            </div>
            <div className="mt-16 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Hosilim Platformasi. Barcha huquqlar himoyalangan.
            </div>
        </div>
      </footer>
   );
}
