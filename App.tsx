
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  Bookmark as BookmarkIcon, 
  Map as MapIcon, 
  Search, 
  MessageSquare, 
  Settings, 
  Volume2, 
  Clock, 
  Menu, 
  X,
  ChevronRight,
  ChevronDown,
  Star,
  PenTool,
  History,
  Info,
  Globe
} from 'lucide-react';
import { BIBLE_BOOKS, VERSES_OF_DAY } from './constants';
import { BibleBook, BibleSection, Bookmark, Verse, Prayer, Note } from './types';
import * as gemini from './services/geminiService';

// --- Sub-components (outside for performance) ---

const SidebarLink: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all ${
      active 
        ? 'bg-amber-100 text-amber-900 font-semibold shadow-sm' 
        : 'text-stone-600 hover:bg-stone-100'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'reader' | 'insights' | 'maps' | 'prayer' | 'notes' | 'bookmarks' | 'history'>('reader');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Bible Reader State
  const [selectedBook, setSelectedBook] = useState<BibleBook>(BIBLE_BOOKS[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [currentVerses, setCurrentVerses] = useState<Verse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  
  // AI Feature State
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [vOD, setVOD] = useState(VERSES_OF_DAY[0]);
  
  // Storage State (Persisted)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  // Initialize data
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bible_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    
    const savedPrayers = localStorage.getItem('bible_prayers');
    if (savedPrayers) setPrayers(JSON.parse(savedPrayers));

    const savedNotes = localStorage.getItem('bible_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));

    // Get a random Verse of the Day
    setVOD(VERSES_OF_DAY[Math.floor(Math.random() * VERSES_OF_DAY.length)]);
    
    fetchVerses(selectedBook, selectedChapter);
  }, []);

  const fetchVerses = async (book: BibleBook, chapter: number) => {
    setIsLoadingVerses(true);
    // In a real offline app, this would query a local SQLite/IndexedDB.
    // Here we simulate fetching the text.
    setTimeout(() => {
      const mockVerses = Array.from({ length: 20 }, (_, i) => ({
        book: book.name,
        chapter,
        verse: i + 1,
        text: `This is the placeholder text for ${book.name} Chapter ${chapter}, Verse ${i + 1}. Truly, I tell you, this developer Akin S. Sokpah has built this for the faithful of 2026. The Word lives on.`
      }));
      setCurrentVerses(mockVerses);
      setIsLoadingVerses(false);
    }, 400);
  };

  const handleBookChange = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    fetchVerses(book, 1);
  };

  const handleAddBookmark = (verse: Verse) => {
    const newBookmark: Bookmark = {
      id: Math.random().toString(36).substr(2, 9),
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      timestamp: Date.now()
    };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem('bible_bookmarks', JSON.stringify(updated));
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchDeepInsight = async () => {
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const insight = await gemini.getDeepInsight(selectedBook.name);
      setAiResponse(insight);
    } catch (e) {
      setAiResponse("Could not reach the divine archives at this moment. Check your connection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const playVerseAudio = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const base64 = await gemini.generateVerseAudio(text);
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      }
    } catch (e) {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 text-stone-900 font-inter">
      {/* Mobile Menu Overlay */}
      {!sidebarOpen && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 bg-white border-r border-stone-200 transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">Elysian Bible</h1>
          </div>
          <button onClick={toggleSidebar} className="text-stone-400 hover:text-stone-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-stone-400 px-3 mb-2 tracking-widest">Main Menu</p>
          <SidebarLink icon={<BookOpen size={20} />} label="Bible Reader" active={activeTab === 'reader'} onClick={() => setActiveTab('reader')} />
          <SidebarLink icon={<History size={20} />} label="Deep Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
          <SidebarLink icon={<Globe size={20} />} label="Bible Atlas" active={activeTab === 'maps'} onClick={() => setActiveTab('maps')} />
          <SidebarLink icon={<MessageSquare size={20} />} label="Prayer Journal" active={activeTab === 'prayer'} onClick={() => setActiveTab('prayer')} />
          <SidebarLink icon={<PenTool size={20} />} label="Personal Notes" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
          <SidebarLink icon={<BookmarkIcon size={20} />} label="Bookmarks" active={activeTab === 'bookmarks'} onClick={() => setActiveTab('bookmarks')} />

          <div className="pt-6">
            <p className="text-[10px] uppercase font-bold text-stone-400 px-3 mb-2 tracking-widest">Library</p>
            {Object.values(BibleSection).map((section) => (
              <div key={section} className="mb-4">
                <button className="flex items-center justify-between w-full p-2 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
                  <span>{section}</span>
                  <ChevronRight size={14} />
                </button>
                <div className="pl-4 space-y-1 mt-1">
                  {BIBLE_BOOKS.filter(b => b.section === section).map(book => (
                    <button 
                      key={book.id}
                      onClick={() => handleBookChange(book)}
                      className={`block w-full text-left p-2 text-xs rounded-md transition-all ${
                        selectedBook.id === book.id 
                          ? 'bg-amber-50 text-amber-700 font-medium' 
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {book.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="p-4 bg-stone-50 border-t border-stone-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-stone-300 overflow-hidden">
               <img src="https://picsum.photos/32/32?seed=akin" alt="Dev" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Dev by Akin S. Sokpah</p>
              <p className="text-[10px] text-stone-500">Liberia, 2026</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-stone-50 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
               <button onClick={toggleSidebar} className="p-2 hover:bg-stone-100 rounded-lg">
                <Menu size={20} />
              </button>
            )}
            <div>
               <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                {activeTab === 'reader' ? `${selectedBook.name} : Chapter ${selectedChapter}` : activeTab.toUpperCase()}
               </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search the scriptures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-stone-100 border-none rounded-full text-sm focus:ring-2 focus:ring-amber-500 w-48 lg:w-64 transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
            </div>
            <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-full">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="flex-1 p-6 lg:p-10">
          {activeTab === 'reader' && (
            <div className="max-w-4xl mx-auto">
              {/* Verse of the Day Card */}
              <div className="mb-10 p-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl text-white shadow-xl shadow-amber-200 relative overflow-hidden">
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                    Verse of the Day
                  </span>
                  <p className="text-2xl lg:text-3xl font-serif italic mb-6 leading-relaxed">
                    "{vOD.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-200">{vOD.ref}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => playVerseAudio(vOD.text)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <Volume2 size={18} />
                      </button>
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <Star size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              </div>

              {/* Bible Text View */}
              <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-stone-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 border-b border-stone-100 pb-6 gap-4">
                  <div>
                    <h1 className="text-4xl font-serif font-bold text-stone-900">{selectedBook.name}</h1>
                    <p className="text-stone-500 mt-1">{selectedBook.section} &bull; Chapter {selectedChapter}</p>
                  </div>
                  <div className="flex items-center space-x-4 bg-stone-100 p-1.5 rounded-xl self-start">
                    {Array.from({ length: Math.min(selectedBook.chapters, 10) }, (_, i) => (
                      <button 
                        key={i+1}
                        onClick={() => { setSelectedChapter(i+1); fetchVerses(selectedBook, i+1); }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                          selectedChapter === i+1 
                            ? 'bg-white text-amber-700 shadow-sm' 
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        {i+1}
                      </button>
                    ))}
                    {selectedBook.chapters > 10 && (
                      <button className="w-10 h-10 flex items-center justify-center text-stone-400">
                        <ChevronDown size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {isLoadingVerses ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="h-4 bg-stone-100 rounded w-full animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="bible-text text-xl lg:text-2xl leading-relaxed text-stone-800 space-y-8">
                    {currentVerses.map(v => (
                      <div key={v.verse} className="group flex items-start space-x-6">
                        <span className="text-xs font-bold text-amber-600 mt-2 flex-shrink-0 w-6">
                          {v.verse}
                        </span>
                        <div className="flex-1">
                          <p className="mb-2 transition-colors duration-200 group-hover:text-stone-950">
                            {v.text}
                          </p>
                          <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleAddBookmark(v)} className="text-[10px] uppercase font-bold text-stone-400 hover:text-amber-600 flex items-center space-x-1">
                              <BookmarkIcon size={12} /> <span>Save</span>
                            </button>
                            <button onClick={() => playVerseAudio(v.text)} className="text-[10px] uppercase font-bold text-stone-400 hover:text-amber-600 flex items-center space-x-1">
                              <Volume2 size={12} /> <span>Listen</span>
                            </button>
                            <button className="text-[10px] uppercase font-bold text-stone-400 hover:text-amber-600 flex items-center space-x-1">
                              <PenTool size={12} /> <span>Note</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-serif font-bold">Divine Archives</h2>
                    <p className="text-stone-500 mt-1">Deep historical and spiritual analysis of {selectedBook.name}</p>
                  </div>
                  <button 
                    onClick={fetchDeepInsight}
                    disabled={isAiLoading}
                    className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <History size={18} />
                    <span>{isAiLoading ? 'Unlocking...' : 'Seek Deep Insight'}</span>
                  </button>
                </div>

                {isAiLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
                    <p className="text-stone-400 animate-pulse font-medium">Consulting ancient scripts and scholarly works...</p>
                  </div>
                ) : aiResponse ? (
                  <div className="prose prose-stone prose-lg max-w-none text-stone-700 leading-relaxed font-serif">
                    <p className="whitespace-pre-line bg-amber-50/50 p-8 rounded-2xl border border-amber-100 italic">
                      {aiResponse}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                    <Info className="mx-auto text-stone-300 mb-4" size={48} />
                    <p className="text-stone-500 font-medium">Click the button above to discover hidden stories and deep insights about the Word.</p>
                  </div>
                )}
              </div>

              {/* Related "Hidden" Books Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-stone-900 text-white rounded-3xl p-8 overflow-hidden relative">
                  <h3 className="text-xl font-bold mb-2">The Book of Enoch</h3>
                  <p className="text-stone-400 text-sm mb-6">Explore the ancient celestial revelations and the origins of the Nephilim mentioned in Genesis 6.</p>
                  <button 
                    onClick={() => { setSelectedBook(BIBLE_BOOKS.find(b => b.id === 'eno')!); setActiveTab('reader'); }}
                    className="px-5 py-2 bg-white text-stone-900 rounded-lg text-xs font-bold hover:bg-stone-100 transition-colors"
                  >
                    Open Excluded Text
                  </button>
                  <BookOpen className="absolute -right-6 -bottom-6 text-white/10 rotate-12" size={120} />
                </div>
                <div className="bg-amber-100 text-amber-900 rounded-3xl p-8 overflow-hidden relative border border-amber-200">
                  <h3 className="text-xl font-bold mb-2">Gnostic Gospels</h3>
                  <p className="text-amber-700/80 text-sm mb-6">Read the sayings of Jesus from the Gospel of Thomas and the Gospel of Mary, found at Nag Hammadi.</p>
                  <button 
                    onClick={() => { setSelectedBook(BIBLE_BOOKS.find(b => b.id === 'tho')!); setActiveTab('reader'); }}
                    className="px-5 py-2 bg-amber-900 text-white rounded-lg text-xs font-bold hover:bg-amber-950 transition-colors"
                  >
                    Explore Manuscripts
                  </button>
                  <Clock className="absolute -right-6 -bottom-6 text-amber-900/5 rotate-12" size={120} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prayer' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif font-bold">Prayer Journal</h2>
                <button className="flex items-center space-x-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
                  <span>New Request</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prayers.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-stone-200">
                    <MessageSquare className="mx-auto text-stone-200 mb-4" size={48} />
                    <p className="text-stone-500 font-medium">"Ask, and it shall be given you; seek, and ye shall find."</p>
                    <p className="text-stone-400 text-sm mt-2">Start your first prayer request today.</p>
                  </div>
                ) : (
                  prayers.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-stone-900">{p.title}</h4>
                        <span className="text-[10px] text-stone-400">{new Date(p.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-stone-600 text-sm mb-6 leading-relaxed">{p.content}</p>
                      <button className="text-xs font-bold text-amber-600 flex items-center space-x-1 hover:text-amber-700">
                        <Star size={12} /> <span>Mark Answered</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-serif font-bold">Biblical Atlas</h2>
                    <p className="text-stone-500 mt-1">Explore the lands of the prophets and apostles</p>
                  </div>
                  <div className="flex items-center space-x-2">
                     <button className="p-2 bg-stone-100 rounded-lg text-stone-600 hover:bg-stone-200"><Search size={18} /></button>
                     <button className="p-2 bg-stone-100 rounded-lg text-stone-600 hover:bg-stone-200"><MapIcon size={18} /></button>
                  </div>
                </div>

                <div className="flex-1 bg-stone-100 rounded-2xl relative overflow-hidden group">
                  <img src="https://picsum.photos/1200/800?seed=holyland" alt="Holy Land" className="w-full h-full object-cover grayscale opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur px-8 py-6 rounded-2xl shadow-2xl text-center max-w-sm border border-white">
                      <Globe className="mx-auto text-amber-600 mb-4" size={32} />
                      <h4 className="text-xl font-bold text-stone-800 mb-2">Interactive Grounding</h4>
                      <p className="text-stone-600 text-sm mb-6">AI-powered mapping service is ready to show you locations mentioned in {selectedBook.name}.</p>
                      <button className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors">
                        Explore Places in {selectedBook.name}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Attribution */}
        <footer className="px-6 py-8 mt-auto border-t border-stone-200 bg-white text-center">
          <p className="text-xs text-stone-400 font-medium">
            &copy; 2026 Elysian Bible Explorer &bull; Built for Spiritual Enlightenment &bull; Dev by Akin S. Sokpah, Liberia
          </p>
        </footer>
      </main>

      {/* Floating Action Button (Mobile Reading Controls) */}
      <div className="fixed bottom-6 right-6 lg:hidden flex flex-col space-y-3">
        <button className="w-14 h-14 bg-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
          <Search size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
