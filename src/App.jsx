import React, { useState, useEffect } from 'react';
import { Calendar, User, BookOpen, Award, Globe } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

const KoreanLearningSite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [classPrice, setClassPrice] = useState(2);
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState({});

  // Firebase에서 시간 슬롯 실시간 로드
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'timeSlots'), (snapshot) => {
      const slots = {};
      snapshot.forEach((doc) => {
        slots[doc.id] = doc.data().slots || [];
      });
      setTimeSlots(slots);
    });
    return () => unsubscribe();
  }, []);

  // Firebase에서 예약 실시간 로드
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingsList = [];
      snapshot.forEach((doc) => {
        bookingsList.push({ id: doc.id, ...doc.data() });
      });
      setBookings(bookingsList);
    });
    return () => unsubscribe();
  }, []);

  // Firebase에서 가격 로드
  useEffect(() => {
    const loadPrice = async () => {
      const priceDoc = await getDocs(collection(db, 'settings'));
      priceDoc.forEach((doc) => {
        if (doc.id === 'classPrice') {
          setClassPrice(doc.data().value || 2);
        }
      });
    };
    loadPrice();
  }, []);

  const Navigation = () => (
    <nav className="bg-gradient-to-r from-amber-950 to-amber-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button onClick={() => setCurrentPage('home')} className="hover:text-stone-300 text-sm">Home</button>
        <h1 className="text-2xl md:text-3xl font-bold">Real Korean Talk</h1>
        <button onClick={() => setCurrentPage('admin')} className="hover:text-stone-300 text-sm">Admin</button>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-b from-stone-200 to-stone-100">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-xl md:text-5xl font-bold text-amber-950 mb-3 px-2">당신의 한국어가 진짜 한국어가 될 때까지!</h1>
          <p className="text-lg md:text-xl text-stone-700">With certified expert tutor Hannah!</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 max-w-6xl mx-auto">
          <button onClick={() => setCurrentPage('levelTest')} className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400">
            <div className="text-stone-600 mb-2 flex justify-center"><Award size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold text-amber-950">Level Test</h3>
          </button>
          <button onClick={() => setCurrentPage('booking')} className="bg-gradient-to-br from-sky-200 to-sky-300 p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-amber-950">
            <div className="mb-2 flex justify-center"><Calendar size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold">Book a Class</h3>
          </button>
          <button onClick={() => setCurrentPage('tutors')} className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400">
            <div className="text-stone-600 mb-2 flex justify-center"><User size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold text-amber-950">Tutor Info</h3>
          </button>
          <button onClick={() => setCurrentPage('oneOnOne')} className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400">
            <div className="text-stone-600 mb-2 flex justify-center gap-0">
              <User size={24} className="md:w-7 md:h-7" />
              <User size={24} className="md:w-7 md:h-7 -ml-[10px]" />
            </div>
            <h3 className="text-base md:text-xl font-bold text-amber-950">1:1 Chat 15min</h3>
          </button>
          <a href="https://realkoreantalk.wordpress.com" target="_blank" rel="noopener noreferrer" className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400 flex flex-col items-center justify-center">
            <div className="text-stone-600 mb-2 flex justify-center"><Globe size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold text-amber-950 text-center">Blog</h3>
          </a>
          <button onClick={() => setCurrentPage('group')} className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400">
            <div className="text-stone-600 mb-2 flex justify-center"><BookOpen size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold text-amber-950">Group Lesson</h3>
          </button>
        </div>
      </div>
    </div>
  );

  const OneOnOnePage = () => (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="bg-gradient-to-r from-sky-100 to-sky-200 border-2 border-sky-300 rounded-lg p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <User size={24} className="md:w-7 md:h-7 text-amber-950" />
              <h2 className="text-xl md:text-2xl font-bold text-amber-950">15-min 1:1 Chat</h2>
              <User size={24} className="md:w-7 md:h-7 text-amber-950" />
            </div>
            <p className="text-sm md:text-base text-gray-600 mt-2">(Beginner–Advanced)</p>
          </div>
          <p className="text-base md:text-lg text-gray-700 mb-6">Practice real-life Korean conversations while improving fluency and expression.</p>
          
          <div className="mb-6 md:mb-8">
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Choose topics based on learner's level & interests</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Learn natural expressions and common phrases</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>No textbook, no grammar drills, just real conversation</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Zoom online</span>
              </li>
            </ul>
          </div>

          <div className="mb-6 md:mb-8 bg-amber-50 border-2 border-amber-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-amber-950 mb-3 md:mb-4">💰 Class Fees</h3>
            <div className="space-y-2">
              <p className="text-xl md:text-2xl font-bold text-sky-600">$2 for Dec (promo price)</p>
              <p className="text-base md:text-lg font-bold text-amber-800">$3 from January 2026</p>
            </div>
            <p className="text-xs md:text-sm text-gray-700 mt-3 md:mt-4"><span className="font-bold">Payment:</span> Please pay in advance via PayPal</p>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold text-amber-950 mb-3 md:mb-4">Recommended For</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">Learners who want to practice Korean conversation in short, convenient sessions</p>
            <ul className="space-y-2 text-sm md:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-amber-800 mr-2 md:mr-3 mt-1 flex-shrink-0">✓</span>
                <span>Those who want to speak real Korean even briefly, daily or weekly</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-2 md:mr-3 mt-1 flex-shrink-0">✓</span>
                <span>Focused on speaking and listening practice rather than textbooks or grammar</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-2 md:mr-3 mt-1 flex-shrink-0">✓</span>
                <span>Learners who want immediate feedback on pronunciation and expressions</span>
              </li>
            </ul>
          </div>

          <button onClick={() => setCurrentPage('booking')} className="w-full bg-gradient-to-r from-sky-200 to-sky-300 text-amber-950 px-6 md:px-8 py-3 md:py-4 rounded-lg hover:from-sky-300 hover:to-sky-400 font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-md">Book Now</button>
        </div>
      </div>
    </div>
  );

  const GroupPage = () => (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="bg-gradient-to-r from-sky-100 to-sky-200 border-2 border-sky-300 rounded-lg p-4 mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-amber-950">📚 Group Class</h2>
            <p className="text-sm md:text-base text-gray-600 mt-2">Textbook-Based (Beginner–Intermediate)</p>
          </div>
          <p className="text-base md:text-lg text-gray-700 mb-6">Learn step-by-step through structured lessons using a student book and workbook.</p>
          
          <div className="mb-6 md:mb-8">
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Student Book & Workbook provided</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Grammar explanations & exercises included</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Relevant videos & images used for better understanding</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Homework provided after each class</span>
              </li>
            </ul>
          </div>

          <div className="mb-6 md:mb-8 bg-amber-50 border-2 border-amber-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-amber-950 mb-3 md:mb-4">💰 Class Fees</h3>
            <p className="text-sm md:text-base font-bold text-gray-700 mb-3">Group Zoom (50 min)</p>
            <p className="text-xs md:text-sm text-gray-600 mb-4">Group classes are monthly packages — all sessions must be booked for the month.</p>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border-2 border-sky-200">
                <p className="text-lg md:text-xl font-bold text-sky-600">$15 per month → 4 sessions</p>
                <p className="text-xs md:text-sm text-gray-600">Once a week, 6–8 students</p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-sky-200">
                <p className="text-lg md:text-xl font-bold text-sky-600">$28 per month → 8 sessions</p>
                <p className="text-xs md:text-sm text-gray-600">Twice a week, 6–8 students</p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-700 mt-3 md:mt-4"><span className="font-bold">Payment:</span> Please pay in advance via PayPal</p>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold text-amber-950 mb-3 md:mb-4">Recommended For</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">Learners who enjoy practicing conversation with others, want to learn through interaction, and prefer a more affordable option while still receiving guidance and correction from the tutor.</p>
            <ul className="space-y-2 text-sm md:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-amber-800 mr-2 md:mr-3 mt-1 flex-shrink-0">✓</span>
                <span>For a light start: 4-session package</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-2 md:mr-3 mt-1 flex-shrink-0">✓</span>
                <span>For steady progress and immersion: 8-session package</span>
              </li>
            </ul>
          </div>

          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfubG-1EArswG0RmolUfQHXFLZpFB4OKQbFPJfu_FS7z7U6kw/viewform" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-sky-200 to-sky-300 text-amber-950 px-6 md:px-8 py-3 md:py-4 rounded-lg hover:from-sky-300 hover:to-sky-400 font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-md text-center">Register for Group Lesson</a>
        </div>
      </div>
    </div>
  );

  const BookingPage = () => {
    const [agreed, setAgreed] = useState(false);
    const [selDate, setSelDate] = useState(null);
    const [allSlots, setAllSlots] = useState({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [month, setMonth] = useState(new Date());

    const getDays = (d) => {
      const y = d.getFullYear(), m = d.getMonth();
      const first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
      const days = [];
      for (let i = 0; i < first.getDay(); i++) days.push(null);
      for (let i = 1; i <= last.getDate(); i++) days.push(i);
      return days;
    };

    const changeMonth = (delta) => {
      setMonth(new Date(month.getFullYear(), month.getMonth() + delta));
      setAllSlots({});
      setSelDate(null);
    };

    const selectDay = (day) => {
      if (day) {
        const ds = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelDate(ds);
      }
    };

    const toggleSlot = (slot) => {
      const curr = allSlots[selDate] || [];
      const upd = { ...allSlots };
      if (curr.includes(slot)) {
        upd[selDate] = curr.filter(s => s !== slot);
        if (upd[selDate].length === 0) delete upd[selDate];
      } else {
        upd[selDate] = [...curr, slot];
      }
      setAllSlots(upd);
    };

    const submit = async () => {
      const total = Object.values(allSlots).flat().length;
      if (!name || !email || total === 0) {
        alert('Please fill all info');
        return;
      }
      
      try {
        // Firebase에 예약 저장
        for (const date of Object.keys(allSlots)) {
          await addDoc(collection(db, 'bookings'), {
            name,
            email,
            date,
            slots: allSlots[date],
            bookedAt: new Date().toISOString()
          });
        }
        
        alert('Thanks for booking! Check your email to complete payment.');
        setName('');
        setEmail('');
        setAllSlots({});
        setSelDate(null);
        setAgreed(false);
      } catch (error) {
        console.error('Error booking:', error);
        alert('Booking failed. Please try again.');
      }
    };

    // 예약된 슬롯 필터링
    const getAvailableSlots = (date) => {
      const allSlots = timeSlots[date] || [];
      const bookedSlots = bookings
        .filter(b => b.date === date)
        .flatMap(b => b.slots || []);
      return allSlots.filter(slot => !bookedSlots.includes(slot));
    };

    const avail = selDate ? getAvailableSlots(selDate) : [];
    const curr = allSlots[selDate] || [];
    const total = Object.values(allSlots).flat().length;

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {!agreed ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-950 mb-6">Policy</h2>
              <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-6 mb-6">
                <ul className="space-y-3 text-gray-700">
                  <li>• Classes are non-refundable.</li>
                  <li>• Notify 1hr before to reschedule once.</li>
                  <li>• Missed class counts as completed.</li>
                  <li>• Late arrival = ends at scheduled time.</li>
                </ul>
              </div>
              <button onClick={() => setAgreed(true)} className="w-full bg-sky-200 text-amber-950 font-bold py-4 rounded-lg hover:bg-sky-300">OK</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-950">Book 1:1 Chat</h2>
                <div className="text-lg font-bold text-amber-950">🕐 KST</div>
              </div>
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  <button onClick={() => changeMonth(-1)} className="text-amber-950 font-bold text-xl px-4">←</button>
                  <h3 className="text-xl font-bold">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={() => changeMonth(1)} className="text-amber-950 font-bold text-xl px-4">→</button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-sm font-bold py-2">{d}</div>)}
                  {getDays(month).map((day, i) => {
                    const ds = day ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const availableSlots = ds ? getAvailableSlots(ds) : [];
                    const hasS = availableSlots.length > 0;
                    const hasSel = ds && allSlots[ds]?.length > 0;
                    return <button key={i} onClick={() => selectDay(day)} disabled={!day || !hasS} className={`aspect-square rounded-lg text-sm ${!day ? 'invisible' : !hasS ? 'bg-stone-100 text-gray-300' : selDate === ds ? 'bg-sky-200 font-bold' : hasSel ? 'bg-sky-100 font-bold' : 'bg-stone-50 hover:bg-sky-100'}`}>{day}</button>;
                  })}
                </div>
              </div>
              {selDate && avail.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Slots - {selDate}</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {avail.map(slot => <button key={slot} onClick={() => toggleSlot(slot)} className={`py-3 rounded-lg font-medium ${curr.includes(slot) ? 'bg-sky-200 font-bold' : 'bg-stone-50 hover:bg-sky-100'}`}>{slot}</button>)}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Selected: {curr.length}</p>
                </div>
              )}
              {total > 0 && (
                <>
                  <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-4 mb-6">
                    <h4 className="font-bold mb-2">Booking Summary</h4>
                    {Object.keys(allSlots).map(date => (
                      <div key={date} className="text-sm mb-1">
                        <span className="font-medium">{date}:</span> {allSlots[date].join(', ')}
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-sky-300">
                      <p className="font-bold">Total: {total} sessions × ${classPrice} = ${total * classPrice}</p>
                    </div>
                  </div>
                  <div className="mb-8 space-y-4">
                    <h3 className="text-xl font-bold">Your Info</h3>
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" />
                      <p className="text-sm text-amber-800 mt-2 bg-amber-50 p-3 rounded-lg">⚠️ Accurate email for payment info</p>
                    </div>
                  </div>
                </>
              )}
              {total > 0 && name && email && <button onClick={submit} className="w-full bg-sky-200 text-amber-950 font-bold py-4 rounded-lg hover:bg-sky-300">Book</button>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const TutorsPage = () => (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="bg-gradient-to-r from-pink-100 to-pink-200 border-2 border-pink-300 rounded-lg p-4 mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-amber-950">Real Korean with Hannah</h2>
            <p className="text-sm md:text-base text-gray-700 mt-2">Learn to speak naturally with a certified Korean tutor.</p>
          </div>

          <div className="mb-6 md:mb-8">
            <p className="text-base md:text-lg text-gray-700 mb-3">🌸 Hello! I'm Hannah</p>
            <p className="text-base md:text-lg text-gray-700 mb-4">
              I'm a certified Korean tutor with <span className="font-bold text-amber-950">4 years of experience</span> teaching Korean to foreign learners.
            </p>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              Since 2022, I've been teaching online to students from Indonesia 🇮🇩, Vietnam 🇻🇳, Nicaragua 🇳🇮, Ukraine 🇺🇦, Venezuela 🇻🇪, and Colombia 🇨🇴.
            </p>
            <p className="text-sm md:text-base text-gray-700">
              <span className="font-bold">I'm friendly, patient, and responsible</span>, and I'll help you speak Korean naturally and confidently.
            </p>
          </div>

          <div className="mb-6 md:mb-8 bg-sky-50 border-2 border-sky-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-amber-950 mb-4">Class Features</h3>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>One-on-one & small group classes</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Textbook-based + practical conversation focus</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Grammar & pronunciation correction included</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Learn Korean culture along the way</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-400 mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Customized lessons to fit your needs</span>
              </li>
            </ul>
          </div>

          <p className="text-base md:text-lg font-bold text-amber-950 text-center mb-6">
            <span className="font-bold">Until your Korean becomes truly natural — start now!</span>
          </p>

          <button onClick={() => setCurrentPage('booking')} className="w-full bg-gradient-to-r from-sky-200 to-sky-300 text-amber-950 px-6 md:px-8 py-3 md:py-4 rounded-lg hover:from-sky-300 hover:to-sky-400 font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-md">Book a Class</button>
        </div>
      </div>
    </div>
  );

  const LevelTestPage = () => {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);

    const questions = [
      {
        instruction: 'Choose the correct word for the blank.',
        q: '저는 매일 학교__ 갑니다.',
        options: ['는', '이', '에', '가'],
        correct: 2,
        explanation: '장소를 나타내는 조사는 "에"입니다. "학교에 갑니다"가 맞습니다.'
      },
      {
        instruction: 'Choose the most natural expression for the blank.',
        q: '날씨가 너무 ____ 창문을 열었어요.',
        options: ['덥워서', '더워서', '더어서', '더아서'],
        correct: 1,
        explanation: '"덥다"의 활용형은 "더워서"입니다.'
      },
      {
        instruction: 'What time is it?',
        q: '21:50',
        options: ['스물한시 오십분이에요.', '이십일시 십분 전이에요.', '아홉시 쉰분이에요.', '열시 십분전이에요.'],
        correct: 3,
        explanation: '21:50은 "밤 9시 50분" 또는 "열 시 십 분 전"으로 표현합니다.'
      },
      {
        instruction: 'Choose the word with the closest meaning to the underlined word.',
        q: '이 음식은 정말 맛없어요.',
        options: ['맛있어요', '좋아요', '괜찮아요', '별로예요'],
        correct: 3,
        explanation: '"맛없어요"는 부정적인 표현이므로 "별로예요"가 가장 가까운 의미입니다.'
      },
      {
        instruction: 'Read the passage and answer the question.',
        q: '오늘은 일찍 일어나서 아침을 먹고 학교에 갔다. 수업 후에는 친구와 카페에 가서 커피를 마셨다. 집에 돌아오자마자 티비를 봤다. 그리고 저녁을 먹고 잤다.',
        extraQ: 'What did you do first when you came home?',
        options: ['저녁을 먹었어요', '커피를 마셨어요', '텔레비전을 봤어요', '학교에 갔어요'],
        correct: 2,
        explanation: '"집에 돌아오자마자 티비를 봤다"라고 했으므로 정답은 3번입니다.'
      },
      {
        instruction: 'Read the passage. True (O) or False (X)?',
        q: '옷이 좀 작은 것 같아요. 다른 옷도 봤으면 좋겠어요.',
        extraQ: '옷이 마음에 안 든다.',
        options: ['O', 'X'],
        correct: 0,
        explanation: '옷이 작고 다른 옷을 보고 싶다고 했으므로 마음에 안 드는 것이 맞습니다.'
      },
      {
        instruction: 'Fill in the blanks with the correct words.',
        q: '저는 ____ 한국에 왔습니다. 한국은 아주 예쁘고 좋았습니다. 저는 ____ 고향으로 돌아갑니다. 그래서 ____ 마지막으로 한국 친구를 만나려고 합니다.',
        options: ['다음주에 - 오늘 - 오늘', '오늘 - 지난주 - 내일', '내일 - 다음주 - 오늘', '지난주에 - 내일 - 오늘'],
        correct: 3,
        explanation: '시간 순서상 "지난주 왔고, 내일 돌아가고, 오늘 친구를 만난다"가 자연스럽습니다.'
      }
    ];

    const selectAnswer = (idx) => {
      setAnswers({...answers, [currentQ]: idx});
    };

    const getScore = () => {
      let score = 0;
      Object.keys(answers).forEach(q => {
        if (answers[q] === questions[q].correct) score++;
      });
      return score;
    };

    const getRecommendation = () => {
      const score = getScore();
      const percentage = (score / questions.length) * 100;
      if (percentage >= 85) return {level: 'Advanced', class: '1:1 Chat'};
      if (percentage >= 60) return {level: 'Intermediate', class: 'Group Class'};
      return {level: 'Beginner', class: 'Group Class'};
    };

    const reset = () => {
      setCurrentQ(0);
      setAnswers({});
      setShowResult(false);
    };

    if (showResult) {
      const score = getScore();
      const rec = getRecommendation();
      return (
        <div className="min-h-screen bg-stone-100 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-amber-950 mb-6 text-center">Test Results</h2>
              <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-6 mb-6 text-center">
                <p className="text-4xl font-bold text-sky-600 mb-2">{score} / {questions.length}</p>
                <p className="text-xl font-bold text-amber-950">Level: {rec.level}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-amber-950 mb-4">Review</h3>
                {questions.map((q, i) => (
                  answers[i] !== q.correct && (
                    <div key={i} className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-3">
                      <p className="font-bold text-amber-950 mb-2">Question {i + 1}</p>
                      <p className="text-sm text-gray-700">{q.explanation}</p>
                    </div>
                  )
                ))}
              </div>
              <div className="bg-gradient-to-r from-sky-100 to-sky-200 border-2 border-sky-300 rounded-lg p-4 mb-6">
                <p className="text-center font-bold text-amber-950 mb-2">Recommended Class</p>
                <p className="text-center text-lg font-bold text-sky-600">{rec.class}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 bg-stone-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-stone-300">Retake Test</button>
                <button onClick={() => setCurrentPage(rec.class === '1:1 Chat' ? 'oneOnOne' : 'group')} className="flex-1 bg-sky-200 text-amber-950 font-bold py-3 rounded-lg hover:bg-sky-300">View Recommended Class</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const q = questions[currentQ];
    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-amber-950">Korean Level Test</h2>
              <span className="text-sm md:text-base text-gray-600">{currentQ + 1} / {questions.length}</span>
            </div>
            <div className="mb-6">
              <p className="text-sm md:text-base text-gray-600 mb-3">{q.instruction}</p>
              <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-4 mb-4">
                <p className="text-base md:text-lg text-gray-800 whitespace-pre-line">{q.q}</p>
              </div>
              {q.extraQ && (
                <p className="text-base md:text-lg font-bold text-gray-800 mb-4">{q.extraQ}</p>
              )}
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => selectAnswer(i)} className={`w-full p-4 rounded-lg border-2 text-left transition-all ${answers[currentQ] === i ? 'bg-sky-200 border-sky-400 font-bold' : 'bg-stone-50 border-stone-200 hover:bg-sky-100'}`}>
                    {i + 1}. {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex-1 bg-stone-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-stone-300 disabled:opacity-50">← Previous</button>
              {currentQ < questions.length - 1 ? (
                <button onClick={() => setCurrentQ(currentQ + 1)} className="flex-1 bg-sky-200 text-amber-950 font-bold py-3 rounded-lg hover:bg-sky-300">Next →</button>
              ) : (
                <button onClick={() => setShowResult(true)} className="flex-1 bg-sky-200 text-amber-950 font-bold py-3 rounded-lg hover:bg-sky-300">Submit</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminPage = () => {
    const [pwd, setPwd] = useState('');
    const [m, setM] = useState('');
    const [d, setD] = useState('');
    const [sh, setSh] = useState('9');
    const [sm, setSm] = useState('0');
    const [eh, setEh] = useState('12');
    const [em, setEm] = useState('0');

    const login = () => {
      if (pwd === 'admin1234') setIsAdminAuth(true);
      else alert('Wrong password');
    };

    const genSlots = (startH, startM, endH, endM) => {
      const slots = [];
      let h = parseInt(startH), min = parseInt(startM);
      const eH = parseInt(endH), eM = parseInt(endM);
      while (h < eH || (h === eH && min < eM)) {
        slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
        min += 30;
        if (min >= 60) { min = 0; h++; }
      }
      return slots;
    };

    const add = async () => {
      if (!m || !d || !sh || !eh) return alert('Fill all');
      const st = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
      const et = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
      if (st >= et) return alert('Invalid time');
      const y = new Date().getFullYear();
      const sd = new Date(y, m - 1, d);
      const dow = sd.getDay();
      const slots = genSlots(sh, sm, eh, em);
      
      try {
        const upd = { ...timeSlots };
        for (let day = 1; day <= 31; day++) {
          const curr = new Date(y, m - 1, day);
          if (curr.getMonth() === m - 1 && curr.getDay() === dow) {
            const ds = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
            if (!upd[ds]) upd[ds] = [];
            slots.forEach(s => { if (!upd[ds].includes(s)) upd[ds].push(s); });
            upd[ds].sort();
            
            // Firebase에 저장
            await setDoc(doc(db, 'timeSlots', ds), {
              slots: upd[ds]
            });
          }
        }
        alert(`Added ${slots.length} slots to all ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow]}s in month ${m}`);
      } catch (error) {
        console.error('Error adding slots:', error);
        alert('Failed to add slots. Please try again.');
      }
    };

    if (!isAdminAuth) {
      return (
        <div className="min-h-screen bg-stone-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-amber-950 mb-6 text-center">Admin</h2>
            <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && login()} className="w-full px-4 py-3 border-2 rounded-lg mb-4" />
            <button onClick={login} className="w-full bg-sky-200 text-amber-950 font-bold py-3 rounded-lg mb-3">Login</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold text-amber-950">Admin</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage('adminBookings')} className="bg-amber-200 px-4 py-2 rounded-lg text-sm font-medium">Bookings</button>
              <button onClick={() => { setIsAdminAuth(false); setPwd(''); setCurrentPage('home'); }} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">Logout</button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Price</h3>
            <div className="flex gap-3">
              <button onClick={async () => {
                setClassPrice(2);
                await setDoc(doc(db, 'settings', 'classPrice'), { value: 2 });
              }} className={`flex-1 py-3 rounded-lg font-bold ${classPrice === 2 ? 'bg-sky-200' : 'bg-stone-100'}`}>$2</button>
              <button onClick={async () => {
                setClassPrice(3);
                await setDoc(doc(db, 'settings', 'classPrice'), { value: 3 });
              }} className={`flex-1 py-3 rounded-lg font-bold ${classPrice === 3 ? 'bg-sky-200' : 'bg-stone-100'}`}>$3</button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Add Slots</h3>
            <p className="text-sm text-gray-600 mb-4">Repeats all same weekdays in month</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm mb-2">Month</label><input type="number" min="1" max="12" value={m} onChange={(e) => setM(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" /></div>
                <div><label className="block text-sm mb-2">Day</label><input type="number" min="1" max="31" value={d} onChange={(e) => setD(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div><label className="block text-sm mb-2">Start Hour</label><input type="number" min="0" max="23" value={sh} onChange={(e) => setSh(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" placeholder="9" /></div>
                <div><label className="block text-sm mb-2">Min</label><input type="number" min="0" max="59" step="30" value={sm} onChange={(e) => setSm(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" placeholder="0" /></div>
                <div><label className="block text-sm mb-2">End Hour</label><input type="number" min="0" max="23" value={eh} onChange={(e) => setEh(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" placeholder="12" /></div>
                <div><label className="block text-sm mb-2">Min</label><input type="number" min="0" max="59" step="30" value={em} onChange={(e) => setEm(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" placeholder="0" /></div>
              </div>
              <button onClick={add} className="w-full bg-sky-200 font-bold py-3 rounded-lg">Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminBookingsPage = () => {
    if (!isAdminAuth) { setCurrentPage('admin'); return null; }
    const del = async (id) => { 
      if (window.confirm('Delete this booking?')) {
        try {
          await deleteDoc(doc(db, 'bookings', id));
        } catch (error) {
          console.error('Error deleting booking:', error);
          alert('Failed to delete booking. Please try again.');
        }
      }
    };
    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">Bookings ({bookings.length})</h2>
            <button onClick={() => setCurrentPage('admin')} className="bg-stone-200 px-4 py-2 rounded-lg">Back</button>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            {bookings.length === 0 ? <p className="text-center text-gray-500 py-8">No bookings</p> : (
              <div className="overflow-x-auto"><table className="w-full"><thead className="bg-stone-100"><tr><th className="px-4 py-3 text-left text-sm">Name</th><th className="px-4 py-3 text-left text-sm">Email</th><th className="px-4 py-3 text-left text-sm">Date & Time</th><th className="px-4 py-3 text-left text-sm">Action</th></tr></thead><tbody>{bookings.map(b => <tr key={b.id} className="border-t"><td className="px-4 py-3 text-sm">{b.name}</td><td className="px-4 py-3 text-sm">{b.email}</td><td className="px-4 py-3 text-sm">{b.date} | {b.slots.join(', ')}</td><td className="px-4 py-3"><button onClick={() => del(b.id)} className="text-red-600 font-bold hover:text-red-800">Del</button></td></tr>)}</tbody></table></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'oneOnOne' && <OneOnOnePage />}
      {currentPage === 'group' && <GroupPage />}
      {currentPage === 'booking' && <BookingPage />}
      {currentPage === 'tutors' && <TutorsPage />}
      {currentPage === 'levelTest' && <LevelTestPage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'adminBookings' && <AdminBookingsPage />}
    </div>
  );
};

export default KoreanLearningSite;
