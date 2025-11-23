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
  const [classPrice, setClassPrice] = useState(2.5);
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
          setClassPrice(doc.data().value || 2.5);
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
            href="mailto:koreanteacherhannah@gmail.com" 
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
          
          <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-4">✨ 1:1 Chat — 15-Minute Real Korean Conversation</h3>
          <p className="text-sm md:text-base text-gray-700 mb-6">Practice real Korean with a certified native tutor. Short, practical, and designed for natural fluency.</p>
          
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3">What You'll Get</h3>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>Real conversation with a native Korean speaker</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>Certified tutor with official teaching qualification</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>Topics & difficulty adjusted to your level</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>Natural expressions you can use right away</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>No textbooks. No heavy grammar lessons. Just real communication.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>Zoom online</span>
              </li>
            </ul>
          </div>

          <div className="mb-6 md:mb-8 bg-[#B9F1E8] bg-opacity-20 border-2 border-[#B9F1E8] rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3">Why This Class</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">Many learners study Korean but rarely get to speak with a real Korean. This class gives you that missing practice:</p>
            <ul className="space-y-2 text-sm md:text-base text-gray-700 mb-4">
              <li className="flex items-start">
                <span className="text-[#4A2E2A] mr-2 flex-shrink-0">✓</span>
                <span>No Korean speakers around</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#4A2E2A] mr-2 flex-shrink-0">✓</span>
                <span>Know grammar but can't speak confidently</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#4A2E2A] mr-2 flex-shrink-0">✓</span>
                <span>Want natural, everyday Korean</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#4A2E2A] mr-2 flex-shrink-0">✓</span>
                <span>Need short, low-pressure sessions</span>
              </li>
            </ul>
            <div className="bg-[#4A2E2A] bg-opacity-10 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base font-bold text-[#4A2E2A]">My goal: Help you speak naturally, easily, and confidently in real conversations.</p>
            </div>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3">Flexible for Busy Learners</h3>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>15 minutes = quick, effective practice</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>Want longer? Book two slots for 30 minutes</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B9F1E8] mr-2 md:mr-3 mt-1 flex-shrink-0 text-xl">•</span>
                <span>Stay consistent and keep your speaking skills active</span>
              </li>
            </ul>
          </div>

          <div className="mb-6 md:mb-8 bg-amber-50 border-2 border-amber-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3 md:mb-4">💰 Class Fees</h3>
            <div className="space-y-2">
              <p className="text-lg md:text-xl font-bold text-[#14B8A6]">🌟 First lesson – FREE</p>
              <p className="text-base md:text-lg font-bold text-[#14B8A6]">December promotion – $2.5</p>
              <p className="text-base md:text-lg font-bold text-amber-800">Starting Jan 2026 – $3</p>
            </div>
            <p className="text-xs md:text-sm text-[#4A2E2A] mt-3 md:mt-4"><span className="font-bold">Payment:</span> Please pay in advance via PayPal</p>
          </div>

          <div className="mb-6 md:mb-8 bg-stone-50 border-2 border-stone-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-[#4A2E2A] mb-3">📘 Want Grammar or Textbook-Based Lessons?</h3>
            <p className="text-sm md:text-base text-gray-700">
              Check the{' '}
              <button 
                onClick={() => setCurrentPage('group')} 
                className="text-[#14B8A6] font-bold hover:text-[#0f9c8a] underline transition-colors"
              >
                Group Lessons
              </button>
              {' '}page for structured curriculum and step-by-step learning.
            </p>
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
                <p className="text-[#4A2E2A] text-xs md:text-sm">All times are <span className="font-bold">Korea Standard Time (KST / UTC+9)</span>. Use <a href="https://www.worldtimebuddy.com/" target="_blank" rel="noopener noreferrer" className="text-[#14B8A6] hover:underline font-bold">worldtimebuddy.com</a> to check your local time.</p>
              </div>
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  <button 
                    onClick={() => changeMonth(-1)} 
                    className="text-[#4A2E2A] font-bold text-xl px-4 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h3 className="text-xl font-bold">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={() => changeMonth(1)} className="text-[#4A2E2A] font-bold text-xl px-4 hover:bg-stone-100 rounded-lg transition-colors">→</button>
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
        options: ['열시 오십분', '열시 십분 전', '아홉시 십분 전', '구시 오십분'],
        correct: 1,
        explanation: '21:50은 "열시 십분 전"입니다. 22시 10분 전이기 때문입니다.',
        explanationEn: '21:50 is "열시 십분 전" (10 minutes before 10 PM). It means 10 minutes before 22:00.'
      },
      {
        instruction: '다음 문장에서 밑줄 친 단어와 가장 의미가 가까운 단어를 고르세요.\nChoose the word closest in meaning to the underlined word.',
        q: '이 음식은 정말 맛없어요.',
        underline: '맛없어요',
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
        extraQ: '질문: 옷이 마음에 든다',
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
          '내일-오늘-어제',
          '지난주에-내일-오늘'
        ],
        correct: 3,
        explanation: '과거(왔습니다) - 미래(돌아갑니다) - 현재(만나려고)의 순서이므로 "지난주에-내일-오늘"이 정답입니다.',
        explanationEn: 'The sequence is past (came) - future (will return) - present (will meet), so "지난주에-내일-오늘" (last week-tomorrow-today) is correct.'
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
                  <p className="text-base md:text-lg text-[#4A2E2A] whitespace-pre-line">
                    {q.underline ? (
                      <>
                        {q.q.split(q.underline).map((part, i) => (
                          <span key={i}>
                            {part}
                            {i < q.q.split(q.underline).length - 1 && (
                              <span className="underline decoration-2">{q.underline}</span>
                            )}
                          </span>
                        ))}
                      </>
                    ) : q.q}
                  </p>
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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    // 한국 시간대(KST) 헬퍼 함수들
    const getKSTDate = () => {
      const now = new Date();
      const kstOffset = 9 * 60; // KST는 UTC+9
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const kstTime = new Date(utcTime + (kstOffset * 60000));
      return kstTime;
    };
    
    const toKSTDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // 이번 주 일요일로 초기화 (한국 시간 기준)
    const getThisSunday = () => {
      const kstTime = getKSTDate();
      const day = kstTime.getDay(); // 0(일요일) ~ 6(토요일)
      const sunday = new Date(kstTime);
      sunday.setDate(kstTime.getDate() - day); // 현재 주의 일요일
      sunday.setHours(0, 0, 0, 0);
      return sunday;
    };
    
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getThisSunday());

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

    const deleteOldSlots = async () => {
      // 한국 시간 기준 오늘 날짜
      const kstToday = getKSTDate();
      kstToday.setHours(0, 0, 0, 0);
      const todayStr = toKSTDateString(kstToday);
      
      const oldDates = Object.keys(timeSlots).filter(date => date < todayStr);
      
      if (oldDates.length === 0) {
        alert('No old slots to delete');
        return;
      }

      if (window.confirm(`Delete ${oldDates.length} past dates?`)) {
        try {
          await Promise.all(
            oldDates.map(date => deleteDoc(doc(db, 'timeSlots', date)))
          );
          alert(`Deleted ${oldDates.length} past dates!`);
        } catch (error) {
          console.error('Error deleting old slots:', error);
          alert('Failed to delete old slots');
        }
      }
    };

    const addBulkSlots = async () => {
      if (!startDate || !endDate || !startTime || !endTime) {
        alert('Please fill in all fields');
        return;
      }

      try {
        const dates = generateDateRange(startDate, endDate);
        const times = generateTimeSlots(startTime, endTime);
        
        if (times.length === 0) {
          alert('Invalid time range');
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
        
        alert(`Added ${dates.length} days × ${times.length} slots!`);
        setStartDate('');
        setEndDate('');
        setStartTime('');
        setEndTime('');
      } catch (error) {
        console.error('Error adding slots:', error);
        alert('Failed to add slots');
      }
    };

    const deleteBulkSlots = async () => {
      if (!startDate || !endDate || !startTime || !endTime) {
        alert('Please fill in all fields');
        return;
      }

      const dates = generateDateRange(startDate, endDate);
      const times = generateTimeSlots(startTime, endTime);

      if (window.confirm(`Delete ${dates.length} days × ${times.length} slots?`)) {
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
          
          alert('Deleted!');
          setStartDate('');
          setEndDate('');
          setStartTime('');
          setEndTime('');
        } catch (error) {
          console.error('Error deleting slots:', error);
          alert('Failed to delete');
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
      if (window.confirm(`Set class price to $${price}?`)) {
        try {
          await setDoc(doc(db, 'settings', 'classPrice'), { value: price });
          setClassPrice(price);
          alert('Price updated!');
        } catch (error) {
          console.error('Error updating price:', error);
          alert('Failed to update price');
        }
      }
    };

    const getWeekDates = (startDate) => {
      const dates = [];
      const current = new Date(startDate);
      for (let i = 0; i < 7; i++) {
        dates.push(toKSTDateString(current));
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    const changeWeek = (direction) => {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(newStart.getDate() + (direction * 7));
      setCurrentWeekStart(newStart);
    };

    const sortedDates = Object.keys(timeSlots).sort();
    const weekDates = getWeekDates(currentWeekStart);
    const weekSlots = weekDates.filter(date => sortedDates.includes(date));

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end items-center mb-6 gap-2">
            <button onClick={() => setCurrentPage('adminBookings')} className="bg-[#B9F1E8] text-[#4A2E2A] px-4 py-2 rounded-lg font-bold hover:bg-[#A0DED1]">예약현황</button>
            <button onClick={() => signOut(auth)} className="bg-red-600 text-white px-4 py-2 rounded-lg">Logout</button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Class Price</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => updatePrice(2.5)} 
                className={`px-6 py-3 rounded-lg font-bold transition-all ${classPrice === 2.5 ? 'bg-[#14B8A6] text-white' : 'bg-stone-200 hover:bg-stone-300'}`}
              >
                $2.5
              </button>
              <button 
                onClick={() => updatePrice(3)} 
                className={`px-6 py-3 rounded-lg font-bold transition-all ${classPrice === 3 ? 'bg-[#14B8A6] text-white' : 'bg-stone-200 hover:bg-stone-300'}`}
              >
                $3
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Slot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addBulkSlots} className="flex-1 bg-[#B9F1E8] text-[#4A2E2A] font-bold px-6 py-3 rounded-lg hover:bg-[#A0DED1]">
                Add Slots
              </button>
              <button onClick={deleteBulkSlots} className="flex-1 bg-red-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-600">
                Delete Slots
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Current Slots</h3>
              <button onClick={deleteOldSlots} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-bold text-sm">
                Delete Old Slots
              </button>
            </div>
            {sortedDates.length === 0 ? <p className="text-center text-gray-500 py-8">No slots</p> : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => changeWeek(-1)} className="px-4 py-2 bg-stone-200 rounded-lg hover:bg-stone-300 font-bold">
                    ← Prev Week
                  </button>
                  <span className="font-medium text-gray-600">
                    {weekDates[0]} ~ {weekDates[6]}
                  </span>
                  <button onClick={() => changeWeek(1)} className="px-4 py-2 bg-stone-200 rounded-lg hover:bg-stone-300 font-bold">
                    Next Week →
                  </button>
                </div>
                <div className="space-y-3">
                  {weekSlots.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No slots this week</p>
                  ) : (
                    weekSlots.map(date => (
                      <div key={date} className="border border-stone-200 rounded-lg p-3">
                        <h4 className="font-bold mb-2">{date}</h4>
                        <div className="flex flex-wrap gap-2">
                          {timeSlots[date].map(slot => (
                            <div key={slot} className="bg-stone-100 px-3 py-1 rounded flex items-center gap-2 text-sm">
                              <span>{slot}</span>
                              <button onClick={() => deleteSlot(date, slot)} className="text-red-600 font-bold hover:text-red-800">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };



  const AdminBookingsPage = () => {
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);
    const [reschedulingBooking, setReschedulingBooking] = useState(null);
    const [selectedNewSlot, setSelectedNewSlot] = useState(null);
    
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

    const getAvailableSlotsForReschedule = () => {
      if (!reschedulingBooking) return [];
      
      // 예약된 날짜 가져오기
      const bookedDateStr = reschedulingBooking.oldDate;
      const bookedDate = new Date(bookedDateStr + 'T00:00:00');
      
      // 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
      const toDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const next7Days = [];
      
      // 예약된 날짜부터 다음 6일까지 (총 7일)
      for (let i = 0; i < 7; i++) {
        const date = new Date(bookedDate);
        date.setDate(bookedDate.getDate() + i);
        const dateStr = toDateString(date);
        
        const availableSlots = timeSlots[dateStr] || [];
        const bookedSlots = bookings
          .filter(b => b.id !== reschedulingBooking?.id)
          .flatMap(b => {
            if (b.bookings) {
              return b.bookings
                .filter(booking => booking.date === dateStr)
                .flatMap(booking => booking.slots || []);
            }
            return b.date === dateStr ? (b.slots || []) : [];
          });
        
        const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));
        
        if (freeSlots.length > 0) {
          next7Days.push({ date: dateStr, slots: freeSlots });
        }
      }
      
      return next7Days;
    };

    const rescheduleBooking = async () => {
      if (!selectedNewSlot) {
        alert('Please select a new time slot');
        return;
      }

      try {
        const [newDate, newSlot] = selectedNewSlot.split('|');
        
        // 기존 예약 업데이트
        const updatedBookings = reschedulingBooking.bookings.map(b => 
          b.date === reschedulingBooking.oldDate && b.slots.includes(reschedulingBooking.oldSlot)
            ? { ...b, date: newDate, slots: [newSlot] }
            : b
        );

        await setDoc(doc(db, 'bookings', reschedulingBooking.id), {
          ...reschedulingBooking,
          bookings: updatedBookings,
          lastRescheduled: new Date().toISOString()
        });

        alert('Booking rescheduled successfully!');
        setReschedulingBooking(null);
        setSelectedNewSlot(null);
      } catch (error) {
        console.error('Error rescheduling:', error);
        alert('Failed to reschedule booking');
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

    const getTimeStatus = (booking) => {
      if (booking.paymentConfirmed) return { text: 'Paid', color: 'text-green-600' };
      
      const now = new Date();
      const bookedAt = new Date(booking.bookedAt);
      const hoursPassed = (now - bookedAt) / (1000 * 60 * 60);
      const hoursLeft = 24 - hoursPassed;
      
      if (hoursLeft <= 0) {
        return { text: `${Math.abs(Math.floor(hoursLeft))}h overdue`, color: 'text-red-600' };
      } else {
        return { text: `${Math.floor(hoursLeft)}h left`, color: 'text-orange-600' };
      }
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
    const displayBookings = showOverdueOnly ? overdueBookings : bookings;
    const availableSlots = reschedulingBooking ? getAvailableSlotsForReschedule() : [];

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Bookings ({bookings.length})</h2>
              {overdueBookings.length > 0 && (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                  {overdueBookings.length} Overdue
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {overdueBookings.length > 0 && (
                <button onClick={deleteOverdueBookings} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold">
                  Delete {overdueBookings.length} Overdue
                </button>
              )}
              <button onClick={() => setCurrentPage('admin')} className="bg-stone-200 px-4 py-2 rounded-lg hover:bg-stone-300">Back</button>
            </div>
          </div>

          {overdueBookings.length > 0 && (
            <div className="mb-4 flex gap-2">
              <button 
                onClick={() => setShowOverdueOnly(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${!showOverdueOnly ? 'bg-[#14B8A6] text-white' : 'bg-white border-2 border-stone-200 hover:bg-stone-50'}`}
              >
                All Bookings ({bookings.length})
              </button>
              <button 
                onClick={() => setShowOverdueOnly(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${showOverdueOnly ? 'bg-red-600 text-white' : 'bg-white border-2 border-red-200 hover:bg-red-50'}`}
              >
                Overdue Only ({overdueBookings.length})
              </button>
            </div>
          )}

          {/* Reschedule Modal */}
          {reschedulingBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Reschedule Booking</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Student: <span className="font-bold">{reschedulingBooking.name}</span></p>
                  <p className="text-sm text-gray-600">Current: <span className="font-bold">{reschedulingBooking.oldDate} {reschedulingBooking.oldSlot}</span></p>
                </div>
                <div className="mb-4">
                  <p className="font-medium mb-2">Available slots (next 7 days):</p>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-500">No available slots in the next 7 days</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableSlots.map(({ date, slots }) => (
                        <div key={date} className="border rounded-lg p-2">
                          <p className="text-sm font-medium mb-1">{date}</p>
                          <div className="flex flex-wrap gap-1">
                            {slots.map(slot => (
                              <button
                                key={`${date}|${slot}`}
                                onClick={() => setSelectedNewSlot(`${date}|${slot}`)}
                                className={`px-2 py-1 text-xs rounded transition-all ${
                                  selectedNewSlot === `${date}|${slot}`
                                    ? 'bg-[#14B8A6] text-white font-bold'
                                    : 'bg-stone-100 hover:bg-stone-200'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={rescheduleBooking}
                    disabled={!selectedNewSlot}
                    className="flex-1 bg-[#14B8A6] text-white px-4 py-2 rounded-lg hover:bg-[#0f9c8a] disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setReschedulingBooking(null);
                      setSelectedNewSlot(null);
                    }}
                    className="flex-1 bg-stone-200 px-4 py-2 rounded-lg hover:bg-stone-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            {displayBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {showOverdueOnly ? 'No overdue bookings' : 'No bookings'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">Name</th>
                      <th className="px-4 py-3 text-left text-sm">Email</th>
                      <th className="px-4 py-3 text-left text-sm">Date & Time</th>
                      <th className="px-4 py-3 text-left text-sm">Status</th>
                      <th className="px-4 py-3 text-left text-sm">Time</th>
                      <th className="px-4 py-3 text-left text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBookings.map(b => {
                      const isOverdue = overdueBookings.some(ob => ob.id === b.id);
                      const timeStatus = getTimeStatus(b);
                      return (
                        <tr key={b.id} className={`border-t ${isOverdue ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3 text-sm">{b.name}</td>
                          <td className="px-4 py-3 text-sm">{b.email}</td>
                          <td className="px-4 py-3 text-sm">
                            {b.bookings ? b.bookings.map((booking, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span>{booking.date}: {booking.slots.join(', ')}</span>
                                <button
                                  onClick={() => setReschedulingBooking({
                                    ...b,
                                    oldDate: booking.date,
                                    oldSlot: booking.slots[0]
                                  })}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                  title="Reschedule"
                                >
                                  ✏️
                                </button>
                              </div>
                            )) : (
                              <div className="flex items-center gap-2">
                                <span>{b.date}: {b.slots?.join(', ')}</span>
                                <button
                                  onClick={() => setReschedulingBooking({
                                    ...b,
                                    oldDate: b.date,
                                    oldSlot: b.slots?.[0]
                                  })}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                  title="Reschedule"
                                >
                                  ✏️
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${b.paymentConfirmed ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {b.paymentConfirmed ? 'Confirmed' : isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold ${timeStatus.color}`}>
                              {timeStatus.text}
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
