// @ts-nocheck
import React, { useMemo, useState } from 'react';

// Minimal single-file clickable prototype (no backend). Tailwind is available.
// Screens: Landing, Auth, Onboarding, Feed, Search, Profile, Add Quote (modal), Approvals, Collections, Admin.
// Notes: This is a low‑fi wireframe: gray blocks, simple layout, keyboard accessible.

// ---- Fake data ----
const sampleTags = ['motivatsiya', "o'qituvchi", "do'stlik", 'ota-ona', 'mehr'];
const sampleQuotes = [
  {
    id: 1,
    text: 'Har kuni kichik qadam – katta natija sari.',
    about: 'Sherdor E.',
    author: 'Nigora M.',
    lang: 'UZ',
    tags: ['motivatsiya'],
    likes: 12,
  },
  {
    id: 2,
    text: "Ilm – yo'l, sabr – yo'ldosh.",
    about: 'Ustoz Anvar',
    author: 'Javlon',
    lang: 'UZ',
    tags: ["o'qituvchi"],
    likes: 7,
  },
  {
    id: 3,
    text: 'Kind words build strong bridges.',
    about: 'Aisha',
    author: 'Michael',
    lang: 'EN',
    tags: ["do'stlik"],
    likes: 19,
  },
];

// ---- Utilities ----
function Chip({ children, onClick, selected }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm mr-2 mb-2 ${
        selected ? 'bg-gray-800 text-white' : 'bg-white hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function Card({ children, onClick }) {
  return (
    <div
      className="rounded-2xl border border-gray-200 p-4 shadow-sm bg-white hover:shadow-md transition cursor-default"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>

          <button
            aria-label="Close"
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
        {actions && (
          <div className="mt-6 flex justify-end gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}

function Nav({ go, onOpenAddQuote, showSearch = true, showCreate = true }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        <button className="font-semibold" onClick={() => go('landing')}>
          Iqtibos
        </button>
        {showSearch && (
          <div className="flex-1">
            <input
              placeholder="Qidirish: muallif, mavzu, odam..."
              className="w-full max-w-md border rounded-xl px-3 py-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') go('search');
              }}
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {showCreate && (
            <button
              className="px-4 py-2 rounded-xl bg-gray-900 text-white"
              onClick={onOpenAddQuote}
            >
              + Iqtibos qo'shish
            </button>
          )}
          <button
            className="px-3 py-2 rounded-xl border"
            onClick={() => go('auth')}
          >
            Kirish
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-10 text-sm text-gray-500">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="font-semibold text-gray-700 mb-2">Iqtibos</div>
          <p>iliq so'zlar — bir joyda.</p>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-2">Havolalar</div>
          <ul className="space-y-1">
            <li>Fikr-mulohaza</li>
            <li>Maxfiylik</li>
            <li>Qoidalar</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-2">Til</div>
          <div className="flex gap-2">
            <Chip>UZ</Chip>
            <Chip>RU</Chip>
            <Chip>EN</Chip>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---- Screens ----
function Landing({ go }) {
  return (
    <div className="">
      <section className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-semibold leading-tight mb-4">
            Iliq so'zlar — bir joyda.
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Siz haqingizdagi iqtiboslarni to'plang, boshqalar bilan baham
            ko'ring va tasdiqlang.
          </p>
          <div className="flex gap-3">
            <button
              className="px-5 py-3 rounded-xl bg-gray-900 text-white"
              onClick={() => go('onboarding')}
            >
              Devor yaratish
            </button>
            <button
              className="px-5 py-3 rounded-xl border"
              onClick={() => go('feed')}
            >
              Iqtiboslarni ko'rish
            </button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            30+ kolleksiya · 1k+ iqtibos
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-4">Qanday ishlaydi?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="h-10 w-10 rounded-xl bg-gray-100 mb-3" />
              <div className="font-medium mb-1">Qadam {i}</div>
              <p className="text-sm text-gray-600">
                Soddalashtirilgan tavsif matni joyi.
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Auth({ go }) {
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Card>
        <h2 className="text-xl font-semibold mb-4">
          Kirish / Ro'yxatdan o'tish
        </h2>
        <div className="grid gap-3 mb-4">
          <button className="px-4 py-2 rounded-xl border">
            Google bilan davom etish
          </button>
          <button className="px-4 py-2 rounded-xl border">
            Telegram bilan davom etish
          </button>
        </div>
        <div className="grid gap-2 mb-3">
          <input className="border rounded-xl px-3 py-2" placeholder="Email" />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Parol"
            type="password"
          />
        </div>
        <div className="flex justify-between">
          <button
            className="px-4 py-2 rounded-xl bg-gray-900 text-white"
            onClick={() => go('feed')}
          >
            Kirish
          </button>
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() => go('onboarding')}
          >
            Ro'yxatdan o'tish
          </button>
        </div>
      </Card>
    </div>
  );
}

function Onboarding({ go }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Til va maqsad</h2>
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">UI tili</div>
          <div className="flex gap-2">
            <Chip>UZ</Chip>
            <Chip>RU</Chip>
            <Chip>EN</Chip>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Sizning maqsadingiz</div>
          <div className="grid grid-cols-2 gap-3">
            <Card onClick={() => go('profile')}>Devor yaratish</Card>
            <Card onClick={() => go('feed')}>Iqtibos topish</Card>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 rounded-xl bg-gray-900 text-white"
            onClick={() => go('feed')}
          >
            Davom etish
          </button>
        </div>
      </Card>
    </div>
  );
}

function QuoteCard({ q, onOpenProfile }) {
  return (
    <Card>
      <p className="text-gray-800 mb-3">“{q.text}”</p>
      <div className="text-sm text-gray-600">
        Muallif: <b>{q.author}</b>
      </div>
      <div className="text-sm text-gray-600">
        Kim haqida:{' '}
        <button className="underline" onClick={onOpenProfile}>
          {q.about}
        </button>
      </div>
      <div className="flex flex-wrap mt-3">
        {q.tags.map((t) => (
          <span
            key={t}
            className="text-xs mr-2 mb-2 px-2 py-1 rounded-full bg-gray-100"
          >
            #{t}
          </span>
        ))}
      </div>
      <div className="mt-3 text-sm text-gray-500">❤ {q.likes}</div>
    </Card>
  );
}

function Feed({ go, onOpenAddQuote }) {
  const [activeTag, setActiveTag] = useState('barchasi');
  const filtered = useMemo(() => {
    if (activeTag === 'barchasi') return sampleQuotes;
    return sampleQuotes.filter((q) => q.tags.includes(activeTag));
  }, [activeTag]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center">
        <Chip
          selected={activeTag === 'barchasi'}
          onClick={() => setActiveTag('barchasi')}
        >
          barchasi
        </Chip>
        {sampleTags.map((t) => (
          <Chip
            key={t}
            selected={activeTag === t}
            onClick={() => setActiveTag(t)}
          >
            #{t}
          </Chip>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((q) => (
          <QuoteCard key={q.id} q={q} onOpenProfile={() => go('profile')} />
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button
          className="px-4 py-2 rounded-xl border"
          onClick={onOpenAddQuote}
        >
          + Iqtibos qo'shish
        </button>
      </div>
    </div>
  );
}

function Search({ go }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <Card>
            <div className="font-medium mb-2">Filtrlar</div>
            <div className="text-sm text-gray-600 mb-2">Til</div>
            <div className="flex flex-wrap mb-4">
              <Chip>UZ</Chip>
              <Chip>RU</Chip>
              <Chip>EN</Chip>
            </div>
            <div className="text-sm text-gray-600 mb-2">Taglar</div>
            <div className="flex flex-wrap">
              {sampleTags.map((t) => (
                <Chip key={t}>#{t}</Chip>
              ))}
            </div>
          </Card>
        </aside>
        <main className="md:col-span-3">
          <div className="mb-3 flex gap-3">
            <button className="px-3 py-2 rounded-xl border" aria-pressed>
              Quotes
            </button>
            <button className="px-3 py-2 rounded-xl border">People</button>
            <button className="px-3 py-2 rounded-xl border">Collections</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {sampleQuotes.map((q) => (
              <QuoteCard key={q.id} q={q} onOpenProfile={() => go('profile')} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function Profile({ go }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start gap-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="text-2xl font-semibold">Sherdor E.</div>
          <div className="text-gray-600">
            Bio: tadbirkor, mentor, iqtiboslar ixlosmandi.
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="px-4 py-2 rounded-xl bg-gray-900 text-white"
              onClick={() => go('approve')}
            >
              Tasdiqlarni ko'rish
            </button>
            <button
              className="px-4 py-2 rounded-xl border"
              onClick={() => go('collections')}
            >
              Kolleksiyalar
            </button>
            <button
              className="px-4 py-2 rounded-xl border"
              onClick={() => go('feed')}
            >
              Bosh sahifa
            </button>
          </div>
        </div>
        <div className="ml-auto">
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() => go('share')}
          >
            Ulashish
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {sampleQuotes.map((q) => (
          <QuoteCard key={q.id} q={q} onOpenProfile={() => {}} />
        ))}
      </div>
    </div>
  );
}

function Approvals() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Tasdiqlash navbati</h2>
      <Card>
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2">
            <div className="text-gray-800 mb-2">
              “Sherdor ishga doimo vaqtida yetib keladi.”
            </div>
            <div className="text-sm text-gray-600">
              Yozgan: <b>Nigora M.</b>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 rounded-xl border">Rad etish</button>
            <button className="px-4 py-2 rounded-xl bg-gray-900 text-white">
              Tasdiqlash
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Collections() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kolleksiyalar</h2>
        <button className="px-4 py-2 rounded-xl border">+ Yaratish</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {['Top 50', "O'qituvchilar kuni", 'Motivatsiya'].map((t) => (
          <Card key={t}>
            <div className="h-28 rounded-xl bg-gray-100 mb-3" />
            <div className="font-medium">{t}</div>
            <div className="text-sm text-gray-600">24 iqtibos</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminModeration() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Moderatsiya</h2>
      <div className="grid md:grid-cols-4 gap-4">
        <aside className="md:col-span-1">
          <Card>
            <div className="font-medium mb-3">Filtrlar</div>
            <div className="text-sm text-gray-600">Risk darajasi</div>
            <div className="flex gap-2 mt-2">
              <Chip>Past</Chip>
              <Chip>O'rta</Chip>
              <Chip>Yuqori</Chip>
            </div>
          </Card>
        </aside>
        <main className="md:col-span-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="grid md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                  <div className="text-gray-800 mb-2">
                    “Namuna iqtibos matni {i}.”
                  </div>
                  <div className="text-sm text-gray-600">
                    Yozgan: Foydalanuvchi {i}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="px-4 py-2 rounded-xl border">Spam</button>
                  <button className="px-4 py-2 rounded-xl border">
                    Rad etish
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-gray-900 text-white">
                    Tasdiqlash
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState('landing');
  const [addOpen, setAddOpen] = useState(false);

  const go = (r) => setRoute(r);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Nav
        go={go}
        onOpenAddQuote={() => setAddOpen(true)}
        showSearch={route !== 'auth'}
      />

      {route === 'landing' && <Landing go={go} />}
      {route === 'auth' && <Auth go={go} />}
      {route === 'onboarding' && <Onboarding go={go} />}
      {route === 'feed' && (
        <Feed go={go} onOpenAddQuote={() => setAddOpen(true)} />
      )}
      {route === 'search' && <Search go={go} />}
      {route === 'profile' && <Profile go={go} />}
      {route === 'approve' && <Approvals />}
      {route === 'collections' && <Collections />}
      {route === 'admin' && <AdminModeration />}

      <Footer />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Iqtibos qo'shish"
        actions={[
          <button
            key="cancel"
            className="px-4 py-2 rounded-xl border"
            onClick={() => setAddOpen(false)}
          >
            Bekor qilish
          </button>,
          <button
            key="submit"
            className="px-4 py-2 rounded-xl bg-gray-900 text-white"
            onClick={() => setAddOpen(false)}
          >
            Yuborish
          </button>,
        ]}
      >
        <div className="grid gap-3">
          <textarea
            className="w-full border rounded-xl px-3 py-2 min-h-[100px]"
            placeholder="Iqtibos matni"
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Kim haqida? (foydalanuvchi yoki ism)"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              className="border rounded-xl px-3 py-2"
              placeholder="Til (UZ/RU/EN)"
            />
            <input
              className="border rounded-xl px-3 py-2"
              placeholder="Taglar (vergul bilan)"
            />
            <input
              className="border rounded-xl px-3 py-2"
              placeholder="Manba URL (ixtiyoriy)"
            />
          </div>
          <div className="text-xs text-gray-500">
            Yuborilgach, egasi tasdiqlaguncha ko'rinmaydi.
          </div>
        </div>
      </Modal>
    </div>
  );
}
