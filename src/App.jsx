import React, { useState, useEffect } from 'react';
import { Calendar, User, BookOpen, Award, Globe } from 'lucide-react';
import { db, auth, googleProvider, ADMIN_UID } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import emailjs from '@emailjs/browser';

const KoreanLearningSite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [classPrice, setClassPrice] = useState(2);
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState({});

  // URL 파라미터로 예약 페이지 직접 접근
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'booking') {
      setCurrentPage('booking');
    }
  }, []);

  // Firebase Auth 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.uid === ADMIN_UID) {
        setIsAdminAuth(true);
      } else {
        setIsAdminAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

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
    <nav className="bg-[#4A2E2A] text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-center items-center">
        <button 
          onClick={() => setCurrentPage('home')} 
          className="text-2xl md:text-3xl font-bold hover:text-stone-300 transition-colors"
        >
          Real Korean Talk
        </button>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-xl md:text-5xl font-bold text-[#4A2E2A] mb-3 px-2">당신의 한국어가 진짜 한국어가 될 때까지!</h1>
          <p className="text-lg md:text-xl text-stone-700">With certified expert tutor Hannah!</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 max-w-6xl mx-auto">
          <button onClick={() => setCurrentPage('levelTest')} className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400">
            <div className="text-stone-600 mb-2 flex justify-center"><Award size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold text-[#4A2E2A]">Level Test</h3>
          </button>
          <button onClick={() => setCurrentPage('booking')} className="bg-[#B9F1E8] p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-[#4A2E2A]">
            <div className="mb-2 flex justify-center"><Calendar size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold">Book Now</h3>
          </button>
          <button onClick={() => setCurrentPage('oneOnOne')} className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400">
            <div className="text-stone-600 mb-2 flex justify-center gap-0">
              <User size={24} className="md:w-7 md:h-7" />
              <User size={24} className="md:w-7 md:h-7 -ml-[10px]" />
            </div>
            <h3 className="text-base md:text-xl font-bold text-[#4A2E2A]">1:1 Chat</h3>
          </button>
          <button onClick={() => setCurrentPage('group')} className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400">
            <div className="text-stone-600 mb-2 flex justify-center"><BookOpen size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold text-[#4A2E2A]">Group Class</h3>
          </button>
          <button onClick={() => setCurrentPage('tutors')} className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400">
            <div className="text-stone-600 mb-2 flex justify-center"><User size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold text-[#4A2E2A]">Tutor Info</h3>
          </button>
          <a href="https://realkoreantalk.wordpress.com/" target="_blank" rel="noopener noreferrer" className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 hover:border-stone-400 text-center">
            <div className="text-stone-600 mb-2 flex justify-center"><Globe size={24} className="md:w-7 md:h-7" /></div>
            <h3 className="text-base md:text-xl font-bold text-[#4A2E2A]">Blog</h3>
          </a>
        </div>
        <div className="text-center mt-12 md:mt-16">
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSeZkzwZ8eJbKqV3TFvV5olma1ly-xBw1Td83BXXZ2izUBV_tg/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#B9F1E8] text-[#4A2E2A] px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-[#A0DED1] font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-md"
          >
            Any questions? Contact me, Hannah! 💌
          </a>
        </div>
        
        {/* Copyright - 관리자 페이지로 이동 */}
        <div className="text-center mt-16 md:mt-20">
          <button 
            onClick={() => setCurrentPage('admin')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            © 2025 Real Korean Talk — All Rights Reserved.
          </button>
        </div>
      </div>
    </div>
  );

  const OneOnOnePage = () => (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="bg-[#B9F1E8] border-2 border-[#B9F1E8] rounded-lg p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <User size={24} className="md:w-7 md:h-7 text-[#4A2E2A]" />
              <h2 className="text-xl md:text-2xl font-bold text-[#4A2E2A]">15-min 1:1 Chat</h2>
              <User size={24} className="md:w-7 md:h-7 text-[#4A2E2A]" />
            </div>
            <p className="text-sm md:text-base text-gray-600 mt-2">(Beginner–Advanced)</p>
          </div>
          <p className="text-base md:text-lg text-[#4A2E2A] mb-6">Practice real-life Korean conversations while improving fluency and expression.</p>
          
          <div className="mb-6 md:mb-8">
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-[#4A2E2A]">
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Choose topics based on learner's level & interests</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Learn natural expressions and common phrases</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>No textbook, no grammar drills, just real conversation</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Zoom online</span>
              </li>
            </ul>
          </div>

          <div className="mb-6 md:mb-8 bg-amber-50 border-2 border-amber-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3 md:mb-4">💰 Class Fees</h3>
            <div className="space-y-2">
              <p className="text-xl md:text-2xl font-bold text-[#14B8A6]">$2 for December (promo price)</p>
              <p className="text-base md:text-lg font-bold text-amber-800">$3 from January 2026</p>
            </div>
            <p className="text-xs md:text-sm text-[#4A2E2A] mt-3 md:mt-4"><span className="font-bold">Payment:</span> Please pay in advance via PayPal</p>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3 md:mb-4">Recommended For</h3>
            <p className="text-sm md:text-base text-[#4A2E2A] mb-3">Learners who want to improve speaking and listening naturally, enjoy conversation, and prefer cost-effective short lessons over traditional textbook-based study.</p>
            <ul className="space-y-2 text-sm md:text-base text-[#4A2E2A]">
              <li className="flex items-start">
                <span className="text-amber-800 mr-2 md:mr-3 mt-1 flex-shrink-0">✓</span>
                <span>For quick daily practice or warm-up before group lessons</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-2 md:mr-3 mt-1 flex-shrink-0">✓</span>
                <span>Perfect for busy schedules and flexible learning</span>
              </li>
            </ul>
          </div>

          <button onClick={() => setCurrentPage('booking')} className="w-full bg-[#B9F1E8] text-[#4A2E2A] px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-[#A0DED1] font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-md">Book a Class</button>
        </div>
      </div>
    </div>
  );

  const GroupPage = () => (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="bg-[#B9F1E8] border-2 border-[#B9F1E8] rounded-lg p-4 mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#4A2E2A]">📚 Group Class</h2>
            <p className="text-sm md:text-base text-gray-600 mt-2">Textbook-Based (Beginner–Intermediate)</p>
          </div>
          <p className="text-base md:text-lg text-[#4A2E2A] mb-6">Learn step-by-step through structured lessons using a student book and workbook.</p>
          
          <div className="mb-6 md:mb-8">
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-[#4A2E2A]">
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Student Book & Workbook provided</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Grammar explanations & exercises included</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Relevant videos & images used for better understanding</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Homework provided after each class</span>
              </li>
            </ul>
          </div>

          <div className="mb-6 md:mb-8 bg-amber-50 border-2 border-amber-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3 md:mb-4">💰 Class Fees</h3>
            <p className="text-sm md:text-base font-bold text-[#4A2E2A] mb-3">Group Zoom (50 min)</p>
            <p className="text-xs md:text-sm text-gray-600 mb-4">Group classes are monthly packages — all sessions must be booked for the month.</p>
            <div className="space-y-3">
              <div className="bg-amber-50 rounded-lg p-3 border-2 border-[#14B8A6]">
                <p className="text-lg md:text-xl font-bold text-[#14B8A6]">$15 per month → 4 sessions</p>
                <p className="text-xs md:text-sm text-gray-600">Once a week, 6–8 students</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border-2 border-[#14B8A6]">
                <p className="text-lg md:text-xl font-bold text-[#14B8A6]">$28 per month → 8 sessions</p>
                <p className="text-xs md:text-sm text-gray-600">Twice a week, 6–8 students</p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-[#4A2E2A] mt-3 md:mt-4"><span className="font-bold">Payment:</span> Please pay in advance via PayPal</p>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3 md:mb-4">Recommended For</h3>
            <p className="text-sm md:text-base text-[#4A2E2A] mb-3">Learners who enjoy practicing conversation with others, want to learn through interaction, and prefer a more affordable option while still receiving guidance and correction from the tutor.</p>
            <ul className="space-y-2 text-sm md:text-base text-[#4A2E2A]">
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

          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfubG-1EArswG0RmolUfQHXFLZpFB4OKQbFPJfu_FS7z7U6kw/viewform" target="_blank" rel="noopener noreferrer" className="block w-full bg-[#B9F1E8] text-[#4A2E2A] px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-[#A0DED1] font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-md text-center">Register for Group Lesson</a>
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
    const [emailError, setEmailError] = useState(false);
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
      const newMonth = new Date(month.getFullYear(), month.getMonth() + delta);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newMonthStart = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
      
      // 이전 달로 이동 방지
      if (delta < 0 && newMonthStart < today) {
        return;
      }
      
      setMonth(newMonth);
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
        const bookingId = crypto.randomUUID();
        
        const allBookings = Object.entries(allSlots).map(([date, slots]) => ({
          date,
          slots
        }));
        
        await setDoc(doc(db, 'bookings', bookingId), {
          id: bookingId,
          name,
          email,
          bookings: allBookings,
          bookedAt: new Date().toISOString(),
          rescheduleCount: 0
        });
        
        const bookingInfo = Object.entries(allSlots)
          .map(([date, slots]) => `${date}: ${slots.join(', ')}`)
          .join('\n');
        const totalPrice = total * classPrice;
        
        emailjs.init('1eD9dTRJPfHenqguL');
        
        await emailjs.send(
          'service_c58vlqm',
          'template_cahc4d6',
          {
            student_name: name,
            student_email: email,
            booking_info: bookingInfo,
            total_sessions: total,
            total_price: totalPrice
          }
        );
        
        alert('Thanks for booking! The admin will send you payment instructions via email shortly.');
        setName('');
        setEmail('');
        setEmailError(false);
        setAllSlots({});
        setSelDate(null);
      } catch (error) {
        console.error('Error booking:', error);
        alert('Booking failed. Please try again.');
      }
    };

    const getAvailableSlots = (date) => {
      const allSlots = timeSlots[date] || [];
      const now = new Date();
      const selectedDate = new Date(date);
      const isToday = selectedDate.toDateString() === now.toDateString();

      const bookedSlots = bookings
        .flatMap(b => {
          if (b.bookings) {
            return b.bookings
              .filter(booking => booking.date === date)
              .flatMap(booking => booking.slots || []);
          } else if (b.date === date) {
            return b.slots || [];
          }
          return [];
        });

      return allSlots.filter(slot => {
        if (bookedSlots.includes(slot)) return false;
        
        if (isToday) {
          const [hour, minute] = slot.split(':').map(Number);
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const slotTime = hour * 60 + minute;
          const currentTime = currentHour * 60 + currentMinute;
          return slotTime > currentTime + 60;
        }
        
        return true;
      });
    };

    const getAvailableSlots2 = (date) => {
      return getAvailableSlots(date);
    };

    const avail = selDate ? getAvailableSlots2(selDate) : [];
    const curr = allSlots[selDate] || [];
    const total = Object.values(allSlots).flat().length;

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {!agreed ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#4A2E2A] mb-6 text-center">Booking Policy</h2>
              <div className="bg-[#DCF8F3] border-2 border-[#DCF8F3] rounded-lg p-6 mb-6">
                <ul className="space-y-3 text-[#4A2E2A]">
                  <li>• Classes are non-refundable.</li>
                  <li>• <span className="font-bold text-red-700">Bookings will be cancelled if payment is not received within 24 hours.</span></li>
                  <li>• You can reschedule once with at least 1 hour's notice.</li>
                  <li>• Missed classes are marked as completed.</li>
                  <li>• Late arrivals still end at the scheduled time.</li>
                </ul>
              </div>
              <div className="mb-6 text-[#4A2E2A] space-y-2 text-sm md:text-base">
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>Only <span className="font-bold">1:1 Chat</span> sessions can be booked here.</span></p>
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>For <span className="font-bold">Group Lessons</span>, please use the Group Lesson page.</span></p>
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>Each session is <span className="font-bold">15 minutes</span>.</span></p>
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>If you book 9:00, your class is <span className="font-bold">09:00–09:15</span>.</span></p>
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>All times are in <span className="font-bold">KST</span>.</span></p>
              </div>
              <button onClick={() => setAgreed(true)} className="w-full bg-[#B9F1E8] text-[#4A2E2A] font-bold py-4 rounded-lg hover:bg-[#A0DED1]">OK</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setAgreed(false)} className="text-gray-600 hover:text-[#4A2E2A] font-medium flex items-center gap-1">
                  ← Back
                </button>
                <h2 className="text-2xl font-bold text-[#4A2E2A]">Book 1:1 Chat</h2>
                <div className="text-lg font-bold text-[#4A2E2A]">🕐 KST</div>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-[#4A2E2A] font-bold mb-1 text-sm md:text-base">🌍 Time Zone Tip</p>
                <p className="text-[#4A2E2A] text-xs md:text-sm">All times are <span className="font-bold">Korea Standard Time (KST / UTC+9)</span>. Use <a href="https://www.worldtimebuddy.com/" target="_blank" rel="noopener noreferrer" className="text-[#B9F1E8] hover:underline font-medium">worldtimebuddy.com</a> to check your local time.</p>
              </div>
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  <button 
                    onClick={() => changeMonth(-1)} 
                    disabled={true}
                    className="text-[#4A2E2A] font-bold text-xl px-4 opacity-0 cursor-not-allowed"
                  >
                    ←
                  </button>
                  <h3 className="text-xl font-bold">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={() => changeMonth(1)} className="text-[#4A2E2A] font-bold text-xl px-4">→</button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-sm font-bold py-2">{d}</div>)}
                  {getDays(month).map((day, i) => {
                    const ds = day ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const availableSlots = ds ? getAvailableSlots(ds) : [];
                    const hasS = availableSlots.length > 0;
                    const hasSel = ds && allSlots[ds]?.length > 0;
                    return <button key={i} onClick={() => selectDay(day)} disabled={!day || !hasS} className={`aspect-square rounded-lg text-sm ${!day ? 'invisible' : !hasS ? 'bg-stone-100 text-gray-300' : selDate === ds ? 'bg-[#B9F1E8] font-bold' : hasSel ? 'bg-[#B9F1E8] font-bold' : 'bg-stone-50 hover:bg-[#A0DED1]'}`}>{day}</button>;
                  })}
                </div>
              </div>
              {selDate && avail.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Slots - {selDate}</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {avail.map(slot => <button key={slot} onClick={() => toggleSlot(slot)} className={`py-3 rounded-lg font-medium transition-all ${curr.includes(slot) ? 'bg-[#14B8A6] text-white font-bold border-2 border-[#14B8A6]' : 'bg-white border-2 border-stone-300 hover:border-[#B9F1E8] hover:bg-stone-50'}`}>{slot}</button>)}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Selected: {curr.length}</p>
                </div>
              )}
              {total > 0 && (
                <>
                  <div className="bg-[#B9F1E8] border-2 border-[#B9F1E8] rounded-lg p-4 mb-6">
                    <h4 className="font-bold mb-2">Booking Summary</h4>
                    {Object.keys(allSlots).map(date => (
                      <div key={date} className="text-sm mb-1">
                        <span className="font-medium">{date}:</span> {allSlots[date].join(', ')}
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-[#B9F1E8]">
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
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => {
                          setEmail(e.target.value);
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          setEmailError(e.target.value && !emailRegex.test(e.target.value));
                        }}
                        onBlur={() => {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          setEmailError(email && !emailRegex.test(email));
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-lg ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {emailError && <p className="text-sm text-red-600 mt-1">⚠️ Please enter a valid email address</p>}
                      <p className="text-sm text-amber-800 mt-2 bg-amber-50 p-3 rounded-lg">⚠️ Accurate email for payment info</p>
                    </div>
                  </div>
                </>
              )}
              {total > 0 && name && email && !emailError && <button onClick={submit} className="w-full bg-[#B9F1E8] text-[#4A2E2A] font-bold py-4 rounded-lg hover:bg-[#A0DED1]">Book</button>}
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
            <h2 className="text-xl md:text-2xl font-bold text-[#4A2E2A]">Real Korean with Hannah</h2>
            <p className="text-sm md:text-base text-[#4A2E2A] mt-2">Learn to speak naturally with a certified Korean tutor.</p>
          </div>

          <div className="mb-6 md:mb-8">
            <p className="text-base md:text-lg text-[#4A2E2A] mb-3">🌸 Hello! I'm Hannah</p>
            <p className="text-base md:text-lg text-[#4A2E2A] mb-4">
              I'm a certified Korean tutor with <span className="font-bold text-[#4A2E2A]">4 years of experience</span> teaching Korean to foreign learners.
            </p>
            <p className="text-sm md:text-base text-[#4A2E2A] mb-4">
              Since 2022, I've been teaching online to students from Indonesia 🇮🇩, Vietnam 🇻🇳, Nicaragua 🇳🇮, Ukraine 🇺🇦, Venezuela 🇻🇪, and Colombia 🇨🇴.
            </p>
            <p className="text-sm md:text-base text-[#4A2E2A]">
              <span className="font-bold">I'm friendly, patient, and responsible</span>, and I'll help you speak Korean naturally and confidently.
            </p>
          </div>

          <div className="mb-6 md:mb-8 bg-[#DCF8F3] border-2 border-[#DCF8F3] rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-4">Class Features</h3>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-[#4A2E2A]">
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>One-on-one & small group classes</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Textbook-based + practical conversation focus</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Grammar & pronunciation correction included</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Learn Korean culture along the way</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                <span>Customized lessons to fit your needs</span>
              </li>
            </ul>
          </div>

          <p className="text-base md:text-lg font-bold text-[#4A2E2A] text-center mb-6">
            <span className="font-bold">Until your Korean becomes truly natural — start now!</span>
          </p>

          <button onClick={() => setCurrentPage('booking')} className="w-full bg-[#B9F1E8] text-[#4A2E2A] px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-[#A0DED1] font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-md">Book a Class</button>
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
        instruction: '다음 문장에서 알맞은 말을 고르세요.\nChoose the correct word for the blank.',
        q: '저는 매일 학교___ 갑니다.',
        options: ['는', '이', '에', '가'],
        correct: 2,
        explanation: '장소를 나타내는 조사는 "에"입니다.',
        explanationEn: 'The particle for location is "에" (to/at). The correct answer is "학교에 갑니다" (I go to school every day).'
      },
      {
        instruction: '다음 문장에서 빈칸에 들어갈 가장 자연스러운 표현을 고르세요.\nChoose the most natural expression for the blank.',
        q: '날씨가 너무 ____ 창문을 열었어요.',
        options: ['덥워서', '더워서', '더어서', '더아서'],
        correct: 1,
        explanation: '"덥다"의 활용형은 "더워서"입니다.',
        explanationEn: 'The correct conjugation of "덥다" (hot) is "더워서". The sentence means "It was so hot that I opened the window."'
      },
      {
        instruction: '지금 몇 시예요?\nWhat time is it?',
        q: '21:50',
        options: ['스물한시 오십분이에요', '이십일시 십분 전이에요', '아홉시 쉰분이에요', '열시 십분전이에요'],
        correct: 2,
        explanation: '21시는 밤 9시입니다. "아홉시 쉰분"이 정답입니다.',
        explanationEn: '21:50 in Korean is "아홉시 쉰분이에요" (9:50 PM). Korean uses native numbers for hours and Sino-Korean numbers for minutes.'
      },
      {
        instruction: '다음 문장에서 밑줄 친 단어와 가장 의미가 가까운 단어를 고르세요.\nChoose the word closest in meaning to the underlined word.',
        q: '이 음식은 정말 맛없어요.',
        options: ['맛있어요', '좋아요', '괜찮아요', '별로예요'],
        correct: 3,
        explanation: '"맛없다"와 의미가 가까운 단어는 "별로다"입니다.',
        explanationEn: '"맛없어요" (not tasty) is closest in meaning to "별로예요" (not good/not really). Both express negative evaluation.'
      },
      {
        instruction: '다음 글을 읽고 질문에 답하세요.\nRead the passage and answer the question.',
        extraQ: '질문: 집에 와서 가장 먼저 한 일은 무엇인가요?\nQuestion: What did you do first when you came home?',
        q: '오늘은 일찍 일어나서 아침을 먹고 학교에 갔다. 수업 후에는 친구와 카페에 가서 커피를 마셨다. 집에 돌아오자마자 티비를 봤다. 그리고 저녁을 먹고 잤다.',
        options: ['밥을 먹었어요', '커피를 마셨어요', '텔레비전을 봤어요', '학교에 갔어요'],
        correct: 2,
        explanation: '"집에 돌아오자마자 티비를 봤다"라고 했으므로 정답은 "텔레비전을 봤어요"입니다.',
        explanationEn: 'The passage states "집에 돌아오자마자 티비를 봤다" (As soon as I got home, I watched TV), so the correct answer is "텔레비전을 봤어요".'
      },
      {
        instruction: '다음 글을 읽고 맞으면 O, 틀리면 X를 고르세요.\nRead the passage and choose O if true, X if false.',
        extraQ: '질문: 옷이 마음에 든다\nStatement: The person likes the clothes',
        q: '옷이 좀 작은 것 같아요. 다른 옷도 봤으면 좋겠어요.',
        options: ['O', 'X'],
        correct: 1,
        explanation: '"다른 옷도 봤으면 좋겠어요"라고 했으므로 옷이 마음에 들지 않습니다.',
        explanationEn: 'The person says "다른 옷도 봤으면 좋겠어요" (I wish I could see other clothes), indicating they don\'t like the current clothes. The answer is X (false).'
      },
      {
        instruction: '빈칸에 들어갈 알맞은 시간 표현을 고르세요.\nChoose the correct time expressions for the blanks.',
        q: '저는____ 한국에 왔습니다. 한국 여행은 정말 좋았습니다. 저는 _____ 고향으로 돌아갑니다. 그래서 _____ 친구를 만나려고 합니다.',
        options: [
          '다음주에-내일-오늘',
          '오늘-어제-내일',
          '어제-오늘-내일',
          '지난주에-내일-오늘'
        ],
        correct: 2,
        explanation: '과거(왔습니다) - 현재(돌아갑니다) - 미래(만나려고)의 순서이므로 "어제-오늘-내일"이 정답입니다.',
        explanationEn: 'The sequence is past (came) - present (return) - future (will meet), so "어제-오늘-내일" (yesterday-today-tomorrow) is correct.'
      }
    ];

    const selectAnswer = (i) => {
      setAnswers({ ...answers, [currentQ]: i });
    };

    const getScore = () => {
      let score = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.correct) score++;
      });
      return score;
    };

    const getRecommendation = () => {
      const score = getScore();
      if (score <= 2) {
        return { level: 'Beginner', class: 'Group Class' };
      } else if (score <= 4) {
        return { level: 'Pre-Intermediate', class: 'Group Class or 1:1 Chat' };
      } else if (score <= 5) {
        return { level: 'Intermediate', class: 'Group Class or 1:1 Chat' };
      } else {
        return { level: 'Advanced', class: '1:1 Chat' };
      }
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
              <h2 className="text-2xl md:text-3xl font-bold text-[#4A2E2A] mb-6 text-center">Test Results</h2>
              <div className="bg-[#B9F1E8] border-2 border-[#B9F1E8] rounded-lg p-6 mb-6 text-center">
                <p className="text-4xl font-bold text-[#4A2E2A] mb-2">{score} / {questions.length}</p>
                <p className="text-xl font-bold text-[#4A2E2A]">Level: {rec.level}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#4A2E2A] mb-4">Review</h3>
                {questions.map((q, i) => (
                  answers[i] !== q.correct && (
                    <div key={i} className="bg-stone-100 border-2 border-stone-300 rounded-lg p-4 mb-3">
                      <p className="font-bold text-[#4A2E2A] mb-2">Question {i + 1}</p>
                      <p className="text-sm text-[#4A2E2A] mb-2">{q.explanation}</p>
                      <p className="text-sm text-gray-600 italic">{q.explanationEn}</p>
                    </div>
                  )
                ))}
              </div>
              <div className="bg-[#B9F1E8] border-2 border-[#B9F1E8] rounded-lg p-4 mb-6">
                <p className="text-center font-bold text-[#4A2E2A] mb-2">Recommended Class</p>
                <p className="text-center text-lg font-bold text-[#4A2E2A]">{rec.class}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 bg-[#4A2E2A] text-white font-bold py-3 rounded-lg hover:bg-[#3a241f]">Retake Test</button>
                {rec.class === 'Group Class or 1:1 Chat' ? (
                  <>
                    <button onClick={() => setCurrentPage('group')} className="flex-1 bg-[#B9F1E8] text-[#4A2E2A] font-bold py-3 rounded-lg hover:bg-[#A0DED1]">Group Class</button>
                    <button onClick={() => setCurrentPage('oneOnOne')} className="flex-1 bg-[#B9F1E8] text-[#4A2E2A] font-bold py-3 rounded-lg hover:bg-[#A0DED1]">1:1 Chat</button>
                  </>
                ) : (
                  <button onClick={() => setCurrentPage(rec.class === '1:1 Chat' ? 'oneOnOne' : 'group')} className="flex-1 bg-[#B9F1E8] text-[#4A2E2A] font-bold py-3 rounded-lg hover:bg-[#A0DED1]">Go to Class</button>
                )}
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
              <h2 className="text-xl md:text-2xl font-bold text-[#4A2E2A]">Korean Level Test</h2>
              <span className="text-sm md:text-base text-gray-600">{currentQ + 1} / {questions.length}</span>
            </div>
            <div className="mb-6">
              <p className="text-sm md:text-base text-gray-600 mb-3 whitespace-pre-line">{q.instruction}</p>
              {q.q && (
                <div className="bg-[#B9F1E8] border-2 border-[#B9F1E8] rounded-lg p-4 mb-4">
                  <p className="text-base md:text-lg text-[#4A2E2A] whitespace-pre-line">{q.q}</p>
                </div>
              )}
              {q.extraQ && (
                <p className="text-base md:text-lg font-bold text-[#4A2E2A] mb-4 whitespace-pre-line">{q.extraQ}</p>
              )}
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => selectAnswer(i)} className={`w-full p-4 rounded-lg border-2 text-left transition-all ${answers[currentQ] === i ? 'bg-stone-300 border-stone-400 font-bold' : 'bg-stone-50 border-stone-200 hover:bg-stone-200'}`}>
                    {i + 1}. {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex-1 bg-[#4A2E2A] text-white font-bold py-3 rounded-lg hover:bg-[#3a241f] disabled:opacity-50">← Previous</button>
              {currentQ < questions.length - 1 ? (
                <button onClick={() => setCurrentQ(currentQ + 1)} className="flex-1 bg-[#B9F1E8] text-[#4A2E2A] font-bold py-3 rounded-lg hover:bg-[#A0DED1]">Next →</button>
              ) : (
                <button onClick={() => setShowResult(true)} className="flex-1 bg-[#B9F1E8] text-[#4A2E2A] font-bold py-3 rounded-lg hover:bg-[#A0DED1]">Submit</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminPage = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [newPrice, setNewPrice] = useState(classPrice);

    if (!isAdminAuth) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
            <button onClick={() => signInWithPopup(auth, googleProvider)} className="bg-[#4A2E2A] text-white px-6 py-3 rounded-lg hover:bg-[#3a241f]">Login with Google</button>
          </div>
        </div>
      );
    }

    // 30분 단위 시간 생성
    const generateTimeSlots = (start, end) => {
      const slots = [];
      const startHour = parseInt(start.split(':')[0]);
      const startMin = parseInt(start.split(':')[1]);
      const endHour = parseInt(end.split(':')[0]);
      const endMin = parseInt(end.split(':')[1]);
      
      let currentHour = startHour;
      let currentMin = startMin;
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour++;
        }
      }
      
      return slots;
    };

    // 날짜 범위 생성
    const generateDateRange = (start, end) => {
      const dates = [];
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      while (startDate <= endDate) {
        dates.push(startDate.toISOString().split('T')[0]);
        startDate.setDate(startDate.getDate() + 1);
      }
      
      return dates;
    };

    const addBulkSlots = async () => {
      if (!startDate || !endDate || !startTime || !endTime) {
        alert('모든 필드를 입력해주세요 / Please fill in all fields');
        return;
      }

      try {
        const dates = generateDateRange(startDate, endDate);
        const times = generateTimeSlots(startTime, endTime);
        
        if (times.length === 0) {
          alert('시간 범위가 올바르지 않습니다 / Invalid time range');
          return;
        }

        for (const date of dates) {
          const docRef = doc(db, 'timeSlots', date);
          const docSnap = await getDocs(collection(db, 'timeSlots'));
          
          let existingSlots = [];
          docSnap.forEach((d) => {
            if (d.id === date) {
              existingSlots = d.data().slots || [];
            }
          });

          const newSlots = [...new Set([...existingSlots, ...times])].sort();
          
          await setDoc(docRef, { slots: newSlots });
        }
        
        alert(`총 ${dates.length}일 × ${times.length}슬롯 추가 완료!\nAdded ${dates.length} days × ${times.length} slots!`);
        setStartDate('');
        setEndDate('');
        setStartTime('');
        setEndTime('');
      } catch (error) {
        console.error('Error adding slots:', error);
        alert('슬롯 추가 실패 / Failed to add slots');
      }
    };

    const deleteBulkSlots = async () => {
      if (!startDate || !endDate || !startTime || !endTime) {
        alert('모든 필드를 입력해주세요 / Please fill in all fields');
        return;
      }

      const dates = generateDateRange(startDate, endDate);
      const times = generateTimeSlots(startTime, endTime);

      if (window.confirm(`${dates.length}일 × ${times.length}슬롯 삭제하시겠습니까?\nDelete ${dates.length} days × ${times.length} slots?`)) {
        try {
          for (const date of dates) {
            const docRef = doc(db, 'timeSlots', date);
            const docSnap = await getDocs(collection(db, 'timeSlots'));
            
            let existingSlots = [];
            docSnap.forEach((d) => {
              if (d.id === date) {
                existingSlots = d.data().slots || [];
              }
            });

            const updatedSlots = existingSlots.filter(s => !times.includes(s));
            
            if (updatedSlots.length === 0) {
              await deleteDoc(docRef);
            } else {
              await setDoc(docRef, { slots: updatedSlots });
            }
          }
          
          alert('삭제 완료! / Deleted!');
          setStartDate('');
          setEndDate('');
          setStartTime('');
          setEndTime('');
        } catch (error) {
          console.error('Error deleting slots:', error);
          alert('삭제 실패 / Failed to delete');
        }
      }
    };

    const deleteSlot = async (date, slot) => {
      if (window.confirm(`Delete ${slot} on ${date}?`)) {
        try {
          const docRef = doc(db, 'timeSlots', date);
          const docSnap = await getDocs(collection(db, 'timeSlots'));
          
          let existingSlots = [];
          docSnap.forEach((d) => {
            if (d.id === date) {
              existingSlots = d.data().slots || [];
            }
          });

          const updatedSlots = existingSlots.filter(s => s !== slot);
          
          if (updatedSlots.length === 0) {
            await deleteDoc(docRef);
          } else {
            await setDoc(docRef, { slots: updatedSlots });
          }
          
          alert('Slot deleted!');
        } catch (error) {
          console.error('Error deleting slot:', error);
          alert('Failed to delete slot');
        }
      }
    };

    const updatePrice = async (price) => {
      if (window.confirm(`수업료를 $${price}로 변경하시겠습니까?\nSet class price to $${price}?`)) {
        try {
          await setDoc(doc(db, 'settings', 'classPrice'), { value: price });
          setClassPrice(price);
          setNewPrice(price);
          alert('가격 변경 완료! / Price updated!');
        } catch (error) {
          console.error('Error updating price:', error);
          alert('가격 변경 실패 / Failed to update price');
        }
      }
    };

    const sortedDates = Object.keys(timeSlots).sort();

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage('adminBookings')} className="bg-[#B9F1E8] text-[#4A2E2A] px-4 py-2 rounded-lg font-bold hover:bg-[#A0DED1]">예약 현황</button>
              <button onClick={() => signOut(auth)} className="bg-red-600 text-white px-4 py-2 rounded-lg">Logout</button>
            </div>
          </div>

          {/* 가격 설정 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">수업료 설정 / Class Price</h3>
            <div className="flex items-center gap-4">
              <p className="text-lg">현재 가격 / Current Price: <span className="font-bold text-2xl text-[#4A2E2A]">${classPrice}</span></p>
              <button 
                onClick={() => updatePrice(2)} 
                className={`px-6 py-3 rounded-lg font-bold transition-all ${classPrice === 2 ? 'bg-[#14B8A6] text-white' : 'bg-stone-200 hover:bg-stone-300'}`}
              >
                $2
              </button>
              <button 
                onClick={() => updatePrice(3)} 
                className={`px-6 py-3 rounded-lg font-bold transition-all ${classPrice === 3 ? 'bg-[#14B8A6] text-white' : 'bg-stone-200 hover:bg-stone-300'}`}
              >
                $3
              </button>
            </div>
          </div>

          {/* 범위 기반 슬롯 추가/삭제 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">범위 설정 슬롯 관리 / Bulk Slot Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">시작 날짜 / Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">종료 날짜 / End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">시작 시간 / Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">종료 시간 / End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">💡 30분 단위로 자동 생성됩니다 / Slots will be generated every 30 minutes</p>
            <div className="flex gap-3">
              <button onClick={addBulkSlots} className="flex-1 bg-[#B9F1E8] text-[#4A2E2A] font-bold px-6 py-3 rounded-lg hover:bg-[#A0DED1]">
                ➕ 슬롯 추가 / Add Slots
              </button>
              <button onClick={deleteBulkSlots} className="flex-1 bg-red-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-600">
                ➖ 슬롯 삭제 / Delete Slots
              </button>
            </div>
          </div>

          {/* 현재 슬롯 목록 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">현재 슬롯 / Current Slots</h3>
            {sortedDates.length === 0 ? <p className="text-center text-gray-500 py-8">슬롯이 없습니다 / No slots</p> : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sortedDates.map(date => (
                  <div key={date} className="border-2 border-stone-200 rounded-lg p-4">
                    <h4 className="font-bold mb-2">{date}</h4>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots[date].map(slot => (
                        <div key={slot} className="bg-stone-100 px-3 py-1 rounded-lg flex items-center gap-2">
                          <span>{slot}</span>
                          <button onClick={() => deleteSlot(date, slot)} className="text-red-600 font-bold hover:text-red-800">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  const AdminBookingsPage = () => {
    if (!isAdminAuth) { setCurrentPage('admin'); return null; }

    const deleteBooking = async (id) => {
      if (window.confirm('Delete this booking?')) {
        try {
          await deleteDoc(doc(db, 'bookings', id));
        } catch (error) {
          console.error('Error deleting booking:', error);
          alert('Failed to delete booking');
        }
      }
    };

    const confirmPayment = async (booking) => {
      if (window.confirm(`Confirm payment for ${booking.name}?`)) {
        try {
          await setDoc(doc(db, 'bookings', booking.id), {
            ...booking,
            paymentConfirmed: true,
            paymentConfirmedAt: new Date().toISOString()
          });

          emailjs.init('1eD9dTRJPfHenqguL');
          
          const allBookingInfo = booking.bookings
            ? booking.bookings.map(b => `${b.date}: ${b.slots.join(', ')}`).join('\n')
            : `${booking.date}: ${booking.slots.join(', ')}`;

          await emailjs.send(
            'service_c58vlqm',
            'template_confirm',
            {
              student_email: booking.email,
              student_name: booking.name,
              booking_info: allBookingInfo
            }
          );

          alert('Payment confirmed! Confirmation email sent to student.');
        } catch (error) {
          console.error('Error confirming payment:', error);
          alert('Failed to send confirmation email. Please try again.');
        }
      }
    };

    const getOverdueBookings = () => {
      const now = new Date();
      return bookings.filter(b => {
        if (b.paymentConfirmed) return false;
        const bookedAt = new Date(b.bookedAt);
        const hoursPassed = (now - bookedAt) / (1000 * 60 * 60);
        return hoursPassed > 24;
      });
    };

    const deleteOverdueBookings = async () => {
      const overdueBookings = getOverdueBookings();
      if (window.confirm(`Delete all ${overdueBookings.length} overdue bookings?`)) {
        try {
          await Promise.all(
            overdueBookings.map(b => deleteDoc(doc(db, 'bookings', b.id)))
          );
          alert('Overdue bookings deleted');
        } catch (error) {
          console.error('Error deleting overdue bookings:', error);
          alert('Failed to delete some bookings');
        }
      }
    };

    const overdueBookings = getOverdueBookings();

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">Bookings ({bookings.length})</h2>
            <div className="flex gap-2">
              {overdueBookings.length > 0 && (
                <button onClick={deleteOverdueBookings} className="bg-red-600 text-white px-4 py-2 rounded-lg">
                  Delete {overdueBookings.length} Overdue
                </button>
              )}
              <button onClick={() => setCurrentPage('admin')} className="bg-stone-200 px-4 py-2 rounded-lg">Back</button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            {bookings.length === 0 ? <p className="text-center text-gray-500 py-8">No bookings</p> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">Name</th>
                      <th className="px-4 py-3 text-left text-sm">Email</th>
                      <th className="px-4 py-3 text-left text-sm">Date & Time</th>
                      <th className="px-4 py-3 text-left text-sm">Status</th>
                      <th className="px-4 py-3 text-left text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => {
                      const isOverdue = overdueBookings.some(ob => ob.id === b.id);
                      return (
                        <tr key={b.id} className={`border-t ${isOverdue ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3 text-sm">{b.name}</td>
                          <td className="px-4 py-3 text-sm">{b.email}</td>
                          <td className="px-4 py-3 text-sm">
                            {b.bookings ? b.bookings.map(booking => (
                              <div key={booking.date}>{booking.date}: {booking.slots.join(', ')}</div>
                            )) : `${b.date}: ${b.slots?.join(', ')}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${b.paymentConfirmed ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {b.paymentConfirmed ? 'Confirmed' : isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {!b.paymentConfirmed && (
                                <button 
                                  onClick={() => confirmPayment(b)} 
                                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                  Confirm
                                </button>
                              )}
                              <button onClick={() => deleteBooking(b.id)} className="text-red-600 font-bold hover:text-red-800">Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navigation />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'levelTest' && <LevelTestPage />}
      {currentPage === 'booking' && <BookingPage />}
      {currentPage === 'oneOnOne' && <OneOnOnePage />}
      {currentPage === 'group' && <GroupPage />}
      {currentPage === 'tutors' && <TutorsPage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'adminBookings' && <AdminBookingsPage />}
    </div>
  );
};

export default KoreanLearningSite;
