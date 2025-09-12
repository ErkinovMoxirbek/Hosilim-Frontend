import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Apple, Truck, Users, DollarSign, MapPin, Phone, Mail,
  CheckCircle, Star, TrendingUp, Shield, Clock, Award
} from 'lucide-react';
import API_BASE_URL from "../config";

const HosilimLanding = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [stats, setStats] = useState({
    totalUsers: 1200,
    totalTransactions: 5400,
    activeBrokers: 85,
    platformRevenue: '25M'
  });

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

  const handleAuth = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate('/login');
      return;
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
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center">
                <img src='/logo.png' alt='Logo'></img>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">
                  Hosilim
                </span>
                <p className="text-xs text-gray-500 -mt-1">Qishloq xo'jaligi platformasi</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {[
                { id: 'home', label: 'Bosh sahifa' },
                { id: 'features', label: 'Imkoniyatlar' },
                { id: 'how-it-works', label: 'Qanday ishlaydi' },
                { id: 'pricing', label: 'Narxlar' },
                { id: 'contact', label: 'Aloqa' }
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`font-medium transition-colors ${activeSection === section.id
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                      : 'text-gray-700 hover:text-blue-600'
                    }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>

            {/* Auth buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleAuth}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Tizimga kirish
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in opacity-0 translate-y-8 transition-all duration-1000">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-6">
                <Award className="w-4 h-4 mr-2" />
                O'zbekistondagi №1 qishloq xo'jaligi platformasi
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Fermerdan
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> to'g'ridan-to'g'ri</span>
                brokerga
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Bog'bonlar, brokerlar va eksportchilarni birlashtiruvchi zamonaviy raqamli platforma.
                Mahsulotingizni samarali sotish va xarid qilish uchun barcha imkoniyatlar.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Foydalanuvchi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalTransactions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Tranzaksiya</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.activeBrokers}</div>
                  <div className="text-sm text-gray-600">Faol broker</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.platformRevenue}</div>
                  <div className="text-sm text-gray-600">So'm aylanma</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAuth}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Ro'yxatdan o'tish
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  Qanday ishlaydi
                </button>
              </div>
            </div>

            {/* Right side - Visual */}
            <div className="relative fade-in opacity-0 translate-y-8 transition-all duration-1000 delay-300">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Apple className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Yangi e'lon</h3>
                        <p className="text-sm text-gray-500">5 daqiqa oldin</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Faol
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mahsulot:</span>
                      <span className="font-medium">Olma (1-nav)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Miqdor:</span>
                      <span className="font-medium">2.5 tonna</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Narx:</span>
                      <span className="font-bold text-green-600">8,500 so'm/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joylashuv:</span>
                      <span className="font-medium">Toshkent vil.</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Taklif berish
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                  12 taklif
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 transform hover:scale-105 transition-all">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Yetkazib berish</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platformamizning imkoniyatlari</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fermerlar, brokerlar va eksportchilar uchun barcha kerakli vositalar bir joyda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Apple,
                title: 'Fermerlar uchun',
                desc: 'Mahsulotingizni osongina e\'lon qiling, eng yaxshi narxlarni oling',
                features: ['Tez e\'lon berish', 'Narx monitoring', 'To\'lov kafolati'],
                bg: 'bg-green-50',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600'
              },
              {
                icon: Truck,
                title: 'Brokerlar uchun',
                desc: 'Ko\'p fermerlardan mahsulot yig\'ing, samarali logistika',
                features: ['Ommaviy xarid', 'Logistika boshqaruvi', 'Kredit tizimi'],
                bg: 'bg-blue-50',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600'
              },
              {
                icon: DollarSign,
                title: 'Moliya boshqaruvi',
                desc: 'Xavfsiz to\'lovlar, hisobot va analitika',
                features: ['Xavfsiz to\'lov', 'Moliyaviy hisobot', 'Daromad tahlili'],
                bg: 'bg-purple-50',
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600'
              },
              {
                icon: Shield,
                title: 'Xavfsizlik',
                desc: 'Tasdiqlangan foydalanuvchilar, himoyalangan ma\'lumotlar',
                features: ['KYC tasdiqlash', 'SSL himoya', '24/7 monitoring'],
                bg: 'bg-red-50',
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600'
              },
              {
                icon: TrendingUp,
                title: 'Real-time bozor',
                desc: 'Jonli narxlar, bozor tendensiyalari va prognozlar',
                features: ['Jonli narxlar', 'Bozor tahlili', 'Narx prognozi'],
                bg: 'bg-orange-50',
                iconBg: 'bg-orange-100',
                iconColor: 'text-orange-600'
              },
              {
                icon: Users,
                title: 'Hamjamiyat',
                desc: 'Fermerlar va brokerlar uchun bilim almashish',
                features: ['Forum', 'Maslahatlar', 'Networking'],
                bg: 'bg-teal-50',
                iconBg: 'bg-teal-100',
                iconColor: 'text-teal-600'
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`${feature.bg} p-6 rounded-2xl fade-in opacity-0 translate-y-8 transition-all duration-1000 hover:shadow-lg hover:-translate-y-1 group`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.desc}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Qanday ishlaydi?</h2>
            <p className="text-xl text-gray-600">Oddiy 4 qadamda muvaffaqiyat</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Ro\'yxatdan o\'tish',
                desc: 'Fermer yoki broker sifatida tizimga ro\'yxatdan o\'ting',
                icon: Users,
                color: 'from-green-500 to-green-600'
              },
              {
                step: '02',
                title: 'E\'lon berish',
                desc: 'Mahsulotingizni e\'lon qiling yoki kerakli mahsulotni toping',
                icon: Apple,
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: '03',
                title: 'Kelishuv',
                desc: 'Narx va shartlarni kelishing, shartnoma tuzing',
                icon: DollarSign,
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: '04',
                title: 'Yetkazib berish',
                desc: 'Mahsulotni yetkazib bering va to\'lovni oling',
                icon: Truck,
                color: 'from-orange-500 to-orange-600'
              }
            ].map((step, index) => (
              <div
                key={step.step}
                className="text-center fade-in opacity-0 translate-y-8 transition-all duration-1000 group"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-gray-700">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Narx siyosati</h2>
            <p className="text-xl text-gray-600">Shaffof va adolatli narxlar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Fermerlar',
                price: 'BEPUL',
                desc: 'Mahsulot e\'lon qilish va sotish',
                features: [
                  'Cheksiz e\'lon',
                  'Bozor narxlari monitoring',
                  'Asosiy hisobot',
                  'SMS xabarnomalar'
                ],
                bg: 'bg-white',
                border: 'border-gray-200',
                textColor: 'text-gray-900',
                buttonColor: 'bg-green-600 hover:bg-green-700'
              },
              {
                title: 'Brokerlar',
                price: '2%',
                desc: 'Har bir tranzaksiyadan komissiya',
                features: [
                  'Cheksiz xarid',
                  'Logistika boshqaruvi',
                  'Kredit tizimi',
                  'Batafsil analitika',
                  'Premium support'
                ],
                bg: 'bg-gradient-to-br from-blue-50 to-purple-50',
                border: 'border-blue-200',
                textColor: 'text-gray-900',
                buttonColor: 'bg-blue-600 hover:bg-blue-700',
                popular: true
              },
              {
                title: 'Enterprise',
                price: 'Kelishuv',
                desc: 'Katta kompaniyalar uchun',
                features: [
                  'Maxsus integrasiya',
                  'Shaxsiy menejer',
                  'API kirish',
                  'Maxsus hisobot',
                  '24/7 support'
                ],
                bg: 'bg-white',
                border: 'border-gray-200',
                textColor: 'text-gray-900',
                buttonColor: 'bg-purple-600 hover:bg-purple-700'
              }
            ].map((plan, index) => (
              <div
                key={plan.title}
                className={`${plan.bg} border ${plan.border} rounded-2xl p-8 relative fade-in opacity-0 translate-y-8 transition-all duration-1000 hover:shadow-xl hover:-translate-y-2`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                      Eng mashhur
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== 'BEPUL' && plan.price !== 'Kelishuv' && (
                      <span className="text-gray-600 ml-1">komissiya</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleAuth}
                  className={`w-full ${plan.buttonColor} text-white py-3 rounded-xl font-semibold transition-colors`}
                >
                  Boshlash
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Mijozlarimiz fikri</h2>
            <p className="text-xl text-gray-600">Bizning platformamizdan foydalanuvchilar nima deyishadi</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmadjon Karimov',
                role: 'Fermer',
                location: 'Farg\'ona viloyati',
                rating: 5,
                comment: 'Hosilim orqali olma hosilimni juda tez va yaxshi narxda sotdim. Platformaning ishonchliligidan mamnunman.',
                avatar: 'bg-green-500'
              },
              {
                name: 'Dilshod Usmonov',
                role: 'Broker',
                location: 'Samarqand viloyati',
                rating: 5,
                comment: 'Ko\'p fermerlar bilan aloqa o\'rnatdim. Logistika boshqaruvi juda qulay, vaqt ko\'p tejayapman.',
                avatar: 'bg-blue-500'
              },
              {
                name: 'Malika Azimova',
                role: 'Eksportchi',
                location: 'Toshkent shahri',
                rating: 5,
                comment: 'Sifatli mahsulotlarni osongina topdim. Hujjatlashtirishda ham yordam berishadi.',
                avatar: 'bg-purple-500'
              }
            ].map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white p-6 rounded-2xl shadow-lg fade-in opacity-0 translate-y-8 transition-all duration-1000 hover:shadow-xl hover:-translate-y-2"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${testimonial.avatar} rounded-full flex items-center justify-center text-white font-bold text-lg mr-4`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{testimonial.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="fade-in opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-4xl font-bold mb-6">Bugunoq bizga qo'shiling!</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Yuzlab fermer va brokerlar bizga ishonishadi.
              O'zbekiston qishloq xo'jaligi sohasida yangi imkoniyatlarni kashf eting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAuth}
                className="bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Ro'yxatdan o'tish
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-700 transition-colors flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Aloqa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company info */}
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/logo-white.png" alt="Logo" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <span className="text-2xl font-bold">Hosilim</span>
                  <p className="text-xs text-gray-400 -mt-1">Qishloq xo'jaligi platformasi</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                O'zbekistondagi fermerlar, brokerlar va eksportchilarni birlashtiruvchi
                eng katta raqamli platforma. Bizning maqsadimiz - qishloq xo'jaligi
                mahsulotlari savdosini zamonaviylashtirish.
              </p>

              {/* Social media */}
              <div className="flex space-x-4">
                {[
                  { name: 'Telegram', color: 'bg-blue-500 hover:bg-blue-600' },
                  { name: 'Instagram', color: 'bg-pink-500 hover:bg-pink-600' },
                  { name: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' }
                ].map((social) => (
                  <button
                    key={social.name}
                    className={`w-10 h-10 ${social.color} rounded-lg flex items-center justify-center transition-colors`}
                  >
                    <span className="text-sm font-bold">{social.name.charAt(0)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Aloqa</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">+998 XX XXX-XX-XX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">info@hosilim.uz</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-400">Toshkent shahri, Shayxontohur tumani</span>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tezkor havolalar</h3>
              <div className="space-y-2">
                {[
                  { label: 'Haqimizda', action: () => scrollToSection('about') },
                  { label: 'Imkoniyatlar', action: () => scrollToSection('features') },
                  { label: 'Narxlar', action: () => scrollToSection('pricing') },
                  { label: 'Qo\'llab-quvvatlash', action: () => console.log('Support') },
                  { label: 'Maxfiylik siyosati', action: () => console.log('Privacy') },
                  { label: 'Shartlar', action: () => console.log('Terms') }
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

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 Hosilim. Barcha huquqlar himoyalangan.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Ishlab chiquvchi:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-md"></div>
                  <span className="text-sm font-medium">Tech Solutions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HosilimLanding;