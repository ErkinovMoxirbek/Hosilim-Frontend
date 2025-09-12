import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config";

const LandingPageOld = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
  };

  // Animation on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);


  const handleLogin = async () => {
    const token = localStorage.getItem("authToken");
    console.log(token);
    if(!token){
      navigate('/login');
    }
    try {
    const res = await fetch(`${API_BASE_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const user = await res.json();
      if (user.data.status === "ACTIVE") {
        console.log("Foydalanuvchi aktiv, tizimga kiritildi:", user);
        navigate("/dashboard"); // yoki kerakli sahifa
      } else {
        console.log("Foydalanuvchi aktiv emas!");
        navigate("/login");
      }
    } else {
      console.log("Token noto‘g‘ri yoki muddati tugagan");
      navigate("/login");
    }
  } catch (error) {
    console.error("Xatolik:", error);
    navigate("/login");
  }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">Hosilim</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {['home', 'features', 'about', 'contact'].map(section => (
                <button 
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`font-medium transition-colors capitalize ${
                    activeSection === section ? 'text-green-700' : 'text-gray-700 hover:text-green-700'
                  }`}
                >
                  {section === 'home' ? 'Bosh sahifa' : 
                   section === 'features' ? 'Xizmatlar' :
                   section === 'about' ? 'Haqimizda' : 'Aloqa'}
                </button>
              ))}
            </nav>
            
            {/* Auth buttons */}
            <div className="flex space-x-4">
              <button 
                onClick={handleLogin}
                className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
              >
                Tizimga kirish
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center relative overflow-hidden">
        {/* Background fruits */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>
            <div className="w-20 h-20 text-red-500">🍎</div>
          </div>
          <div className="absolute top-32 right-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>
            <div className="w-16 h-16 text-orange-500">🍊</div>
          </div>
          <div className="absolute bottom-32 left-16 animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>
            <div className="w-18 h-18 text-purple-500">🍇</div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in opacity-0 translate-y-8 transition-all duration-1000">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Hosilingizni onlayn soting va 
                <span className="text-green-700"> tezkor xaridor</span> toping!
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Dehqonlar va xaridorlarni bog'laydigan raqamli platforma. 
                Mevalarni yig'ish, saralash va sotish endi yanada oson.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleLogin}
                  className="bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-800 transition-colors shadow-lg"
                >
                  Boshlash
                </button>
                <button 
                  onClick={handleLogin}
                  className="border-2 border-green-700 text-green-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Tizimga kirish
                </button>
              </div>
            </div>
            
            <div className="relative fade-in opacity-0 translate-y-8 transition-all duration-1000 delay-300">
              <div className="grid grid-cols-2 gap-6">
                {[
                  {emoji: '🍎', name: 'Olma', desc: 'Toza va mazali'},
                  {emoji: '🍇', name: 'Uzum', desc: 'Shirin va sog\'lom'},
                  {emoji: '🍒', name: 'Gilos', desc: 'Yangi va xush'},
                  {emoji: '🍑', name: 'Shaftoli', desc: 'Yumshoq va lazzatli'}
                ].map((fruit, index) => (
                  <div 
                    key={fruit.name}
                    className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${index % 2 === 1 ? 'mt-8' : 'mt-3'}`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-3">{fruit.emoji}</div>
                      <h3 className="font-semibold text-gray-800 text-lg">{fruit.name}</h3>
                      <p className="text-sm text-gray-600">{fruit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Bizning afzalliklarimiz</h2>
            <p className="text-xl text-gray-600">Nima uchun Hosilimni tanlashingiz kerak</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🍎',
                title: 'Sifatli mahsulot',
                desc: 'To\'g\'ridan-to\'g\'ri dehqonlardan yangi va sifatli mevalar',
                bg: 'bg-red-50',
                iconBg: 'bg-red-100'
              },
              {
                icon: '💰',
                title: 'Tezkor savdo',
                desc: 'Oson va tezkor onlayn savdo jarayoni, vaqtingizni tejang',
                bg: 'bg-green-50',
                iconBg: 'bg-green-100'
              },
              {
                icon: '📦',
                title: 'Quvvatli logistika',
                desc: 'Yuklaringizni kuzatish va tez yetkazib berish xizmati',
                bg: 'bg-blue-50',
                iconBg: 'bg-blue-100'
              },
              {
                icon: '📱',
                title: 'Mobil imkoniyatlar',
                desc: 'Telefon orqali ham qulay foydalanish imkoniyati',
                bg: 'bg-purple-50',
                iconBg: 'bg-purple-100'
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className={`text-center p-6 ${feature.bg} rounded-2xl fade-in opacity-0 translate-y-8 transition-all duration-1000 hover:shadow-lg hover:-translate-y-1`}
                style={{transitionDelay: `${index * 200}ms`}}
              >
                <div className={`w-16 h-16 ${feature.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Qanday ishlaydi</h2>
            <p className="text-xl text-gray-600">Oddiy 3 qadamda muvaffaqiyat</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Mahsulot qo\'shish',
                desc: 'Dehqon o\'z mahsulotini tizimga qo\'shadi, narx va miqdorni belgilaydi'
              },
              {
                step: '2', 
                title: 'Buyurtma berish',
                desc: 'Xaridor kerakli mahsulotni tanlaydi va buyurtma beradi'
              },
              {
                step: '3',
                title: 'Yetkazib berish', 
                desc: 'Mahsulot yetkazib beriladi va to\'lov amalga oshiriladi'
              }
            ].map((step, index) => (
              <div 
                key={step.step}
                className="text-center fade-in opacity-0 translate-y-8 transition-all duration-1000"
                style={{transitionDelay: `${index * 300}ms`}}
              >
                <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-green-800 transition-colors">
                  <span className="text-3xl text-white font-bold">{step.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Foydalanuvchi fikrlari</h2>
            <p className="text-xl text-gray-600">Mijozlarimiz bizni qanday baholaydi</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Aziz aka',
                location: 'Farg\'ona viloyati',
                avatar: '👨‍🌾',
                quote: 'Hosilim orqali men mahsulotimni bozordan ko\'ra tezroq sotdim. Juda qulay va ishonchli platforma!',
                bg: 'bg-green-50'
              },
              {
                name: 'Dilshod',
                location: 'Toshkent shahri', 
                avatar: '👨‍💼',
                quote: 'Endi xarid qilish juda oson va ishonchli. Yangi mevalarni uyimgacha yetkazib berishadi!',
                bg: 'bg-blue-50'
              }
            ].map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className={`${testimonial.bg} p-8 rounded-2xl fade-in opacity-0 translate-y-8 transition-all duration-1000 hover:shadow-lg`}
                style={{transitionDelay: `${index * 200}ms`}}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                    <span className="text-2xl">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-lg italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Bugunoq tizimga qo'shiling!</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Minglab dehqon va xaridorlar bizga ishonishadi. Siz ham ulardan biri bo'ling!
            </p>
            <button 
              onClick={handleLogin}
              className="bg-green-700 text-white px-12 py-4 rounded-xl text-xl font-semibold hover:bg-green-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Tizimga kirish
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo and description */}
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold">Hosilim</span>
              </div>
              <p className="text-gray-400 mb-6">
                Dehqonlar va xaridorlarni bog'laydigan ishonchli raqamli platforma. 
                Sifatli mahsulotlar, tez yetkazib berish.
              </p>
              <div className="flex space-x-4">
                {['f', 'IG', 'TG'].map((social, index) => (
                  <button 
                    key={social}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      index === 0 ? 'bg-blue-600 hover:bg-blue-700' :
                      index === 1 ? 'bg-pink-600 hover:bg-pink-700' :
                      'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    <span className="text-sm font-bold">{social}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Contact info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span>📞</span>
                  <span className="text-gray-400">+998 90 123 45 67</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>✉️</span>
                  <span className="text-gray-400">info@hosilim.uz</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>📍</span>
                  <span className="text-gray-400">Toshkent, O'zbekiston</span>
                </div>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Linklar</h3>
              <div className="space-y-2">
                {[
                  {label: 'Haqimizda', action: () => scrollToSection('about')},
                  {label: 'Maxfiylik siyosati', action: () => console.log('Privacy policy')},
                  {label: 'Foydalanish shartlari', action: () => console.log('Terms')},
                  {label: 'Yordam', action: () => scrollToSection('contact')}
                ].map(link => (
                  <button 
                    key={link.label}
                    onClick={link.action}
                    className="block text-gray-400 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Hosilim – Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageOld;