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
  const [bookingId, setBookingId] = useState(null);

  // URL 파라미터에서 booking ID 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('booking');
    if (id) {
      setBookingId(id);
      setCurrentPage('studentBooking');
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
        <div className="text-center mt-12 pb-8">
          <a 
            href="mailto:koreanteacherhannah@gmail.com" 
            className="inline-block text-lg md:text-xl text-amber-950 hover:text-amber-800 font-medium transition-all hover:scale-105"
          >
            Any questions? Contact me, Hannah! 💌
          </a>
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
              <p className="text-xl md:text-2xl font-bold text-sky-600">$2 for December (promo price)</p>
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
              <div className="bg-amber-50 rounded-lg p-3 border-2 border-sky-200">
                <p className="text-lg md:text-xl font-bold text-sky-600">$15 per month → 4 sessions</p>
                <p className="text-xs md:text-sm text-gray-600">Once a week, 6–8 students</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border-2 border-sky-200">
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
        const bookingIds = [];
        
        // Firebase에 예약 저장 (UUID 포함)
        for (const date of Object.keys(allSlots)) {
          const bookingId = crypto.randomUUID(); // UUID 생성
          await setDoc(doc(db, 'bookings', bookingId), {
            id: bookingId,
            name,
            email,
            date,
            slots: allSlots[date],
            bookedAt: new Date().toISOString(),
            rescheduleCount: 0 // 변경 횟수 추적
          });
          bookingIds.push(bookingId);
        }
        
        // 예약 정보 정리
        const bookingDates = Object.keys(allSlots).join(', ');
        const allTimeSlots = Object.entries(allSlots)
          .map(([date, slots]) => `${date}: ${slots.join(', ')}`)
          .join('\n');
        const totalPrice = total * classPrice;
        
        // EmailJS 초기화
        emailjs.init('1eD9dTRJPfHenqguL');
        
        // 관리자에게만 이메일 전송
        await emailjs.send(
          'service_c58vlqm',
          'template_cahc4d6',
          {
            student_name: name,
            student_email: email,
            booking_date: bookingDates,
            time_slots: allTimeSlots,
            total_sessions: total,
            total_price: totalPrice
          }
        );
        
        alert('Thanks for booking! The admin will send you payment instructions via email shortly.');
        setName('');
        setEmail('');
        setAllSlots({});
        setSelDate(null);
        // setAgreed(false)를 제거하여 달력 화면에 계속 머물도록 함
      } catch (error) {
        console.error('Error booking:', error);
        alert('Booking failed. Please try again.');
      }
    };

    // 예약된 슬롯 필터링 및 지나간 시간 제외
    const getAvailableSlots = (date) => {
      const allSlots = timeSlots[date] || [];
      const bookedSlots = bookings
        .filter(b => b.date === date)
        .flatMap(b => b.slots || []);
      
      // 현재 날짜와 시간 확인
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      return allSlots.filter(slot => {
        // 이미 예약된 슬롯 제외
        if (bookedSlots.includes(slot)) return false;
        
        // 오늘 날짜인 경우에만 시간 체크
        if (date === today) {
          const [slotHour, slotMinute] = slot.split(':').map(Number);
          const slotTime = slotHour * 60 + slotMinute;
          const currentTime = currentHour * 60 + currentMinute;
          
          // 현재 시간 + 60분(1시간) 이후만 표시
          return slotTime >= currentTime + 60;
        }
        
        return true;
      });
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
                  <li>• <span className="font-bold text-red-700">Bookings will be cancelled if payment is not received within 24 hours.</span></li>
                  <li>• You can reschedule once with at least 1 hour's notice.</li>
                  <li>• Missed classes are marked as completed.</li>
                  <li>• Late arrivals still end at the scheduled time.</li>
                </ul>
              </div>
              <div className="mb-6 text-gray-700 space-y-2 text-sm md:text-base">
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>Only <span className="font-bold">1:1 Chat</span> sessions can be booked here.</span></p>
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>For <span className="font-bold">Group Lessons</span>, please use the Group Lesson page.</span></p>
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>Each session is <span className="font-bold">15 minutes</span>.</span></p>
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>If you book 9:00, your class is <span className="font-bold">09:00–09:15</span>.</span></p>
                <p className="flex items-start"><span className="text-amber-800 mr-2 mt-1 flex-shrink-0">✓</span><span>All times are in <span className="font-bold">KST</span>.</span></p>
              </div>
              <button onClick={() => setAgreed(true)} className="w-full bg-sky-200 text-amber-950 font-bold py-4 rounded-lg hover:bg-sky-300">OK</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setAgreed(false)} className="text-gray-600 hover:text-amber-950 font-medium flex items-center gap-1">
                  ← Back
                </button>
                <h2 className="text-2xl font-bold text-amber-950">Book 1:1 Chat</h2>
                <div className="text-lg font-bold text-amber-950">🕐 KST</div>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-950 font-bold mb-1 text-sm md:text-base">🌍 Time Zone Tip</p>
                <p className="text-gray-700 text-xs md:text-sm">All times are <span className="font-bold">Korea Standard Time (KST / UTC+9)</span>. Use <a href="https://www.worldtimebuddy.com/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-medium">worldtimebuddy.com</a> to check your local time.</p>
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
        explanation: '장소를 나타내는 조사는 "에"입니다. "학교에 갑니다"가 맞습니다.',
        explanationEn: 'The particle for location is "에" (to/at). The correct answer is "학교에 갑니다" (I go to school).'
      },
      {
        instruction: 'Choose the most natural expression for the blank.',
        q: '날씨가 너무 ____ 창문을 열었어요.',
        options: ['덥워서', '더워서', '더어서', '더아서'],
        correct: 1,
        explanation: '"덥다"의 활용형은 "더워서"입니다.',
        explanationEn: 'The conjugated form of "덥다" (hot) is "더워서" (because it\'s hot).'
      },
      {
        instruction: 'What time is it?',
        q: '21:50',
        options: ['스물한시 오십분이에요.', '이십일시 십분 전이에요.', '아홉시 쉰분이에요.', '열시 십분전이에요.'],
        correct: 3,
        explanation: '21:50은 "밤 9시 50분" 또는 "열 시 십 분 전"으로 표현합니다.',
        explanationEn: '21:50 is expressed as "9:50 PM" or "ten minutes before 10" in Korean.'
      },
      {
        instruction: 'Choose the word with the closest meaning to the underlined word.',
        q: '이 음식은 정말 맛없어요.',
        options: ['맛있어요', '좋아요', '괜찮아요', '별로예요'],
        correct: 3,
        explanation: '"맛없어요"는 부정적인 표현이므로 "별로예요"가 가장 가까운 의미입니다.',
        explanationEn: '"맛없어요" (not tasty) is a negative expression, so "별로예요" (not really/not good) has the closest meaning.'
      },
      {
        instruction: 'Read the passage and answer the question.',
        q: '오늘은 일찍 일어나서 아침을 먹고 학교에 갔다. 수업 후에는 친구와 카페에 가서 커피를 마셨다. 집에 돌아오자마자 티비를 봤다. 그리고 저녁을 먹고 잤다.',
        extraQ: 'What did you do first when you came home?',
        options: ['저녁을 먹었어요', '커피를 마셨어요', '텔레비전을 봤어요', '학교에 갔어요'],
        correct: 2,
        explanation: '"집에 돌아오자마자 티비를 봤다"라고 했으므로 정답은 3번입니다.',
        explanationEn: 'The passage says "집에 돌아오자마자 티비를 봤다" (watched TV as soon as I got home), so the answer is #3.'
      },
      {
        instruction: 'Read the passage. True (O) or False (X)?',
        q: '옷이 좀 작은 것 같아요. 다른 옷도 봤으면 좋겠어요.',
        extraQ: '옷이 마음에 안 든다.',
        options: ['O', 'X'],
        correct: 0,
        explanation: '옷이 작고 다른 옷을 보고 싶다고 했으므로 마음에 안 드는 것이 맞습니다.',
        explanationEn: 'The passage says the clothes are too small and wants to see other options, so "doesn\'t like the clothes" is True (O).'
      },
      {
        instruction: 'Fill in the blanks with the correct words.',
        q: '저는 ____ 한국에 왔습니다. 한국은 아주 예쁘고 좋았습니다. 저는 ____ 고향으로 돌아갑니다. 그래서 ____ 마지막으로 한국 친구를 만나려고 합니다.',
        options: ['다음주에 - 오늘 - 오늘', '오늘 - 지난주 - 내일', '내일 - 다음주 - 오늘', '지난주에 - 내일 - 오늘'],
        correct: 3,
        explanation: '시간 순서상 "지난주 왔고, 내일 돌아가고, 오늘 친구를 만난다"가 자연스럽습니다.',
        explanationEn: 'In chronological order: "came last week, leaving tomorrow, meeting friends today" makes the most sense.'
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
      // 난이도별 문제 번호 (0-based index)
      const beginner = [0, 2]; // 1번, 3번
      const preBeginner = [4, 6]; // 5번, 7번
      const intermediate = [1, 3, 5]; // 2번, 4번, 6번
      
      // 각 난이도별 맞춘 개수 계산
      const beginnerCorrect = beginner.filter(i => answers[i] === questions[i].correct).length;
      const preBeginnerCorrect = preBeginner.filter(i => answers[i] === questions[i].correct).length;
      const intermediateCorrect = intermediate.filter(i => answers[i] === questions[i].correct).length;
      
      // 난이도별 이해도 계산 (%)
      const beginnerRate = (beginnerCorrect / beginner.length) * 100;
      const preBeginnerRate = (preBeginnerCorrect / preBeginner.length) * 100;
      const intermediateRate = (intermediateCorrect / intermediate.length) * 100;
      
      // 이해도 판단 함수
      const getUnderstanding = (rate) => {
        if (rate <= 33) return 'low';
        if (rate <= 66) return 'partial';
        return 'good';
      };
      
      const beginnerLevel = getUnderstanding(beginnerRate);
      const intermediateLevel = getUnderstanding(intermediateRate);
      
      // 레벨 판단
      if (beginnerLevel === 'low') {
        return { level: 'Beginner', class: 'Group Class' };
      } else if (beginnerLevel === 'partial') {
        return { level: 'Pre-Intermediate', class: 'Group Class or 1:1 Chat' };
      } else if (beginnerLevel === 'good' && intermediateCorrect > 0) {
        return { level: 'Intermediate+', class: '1:1 Chat' };
      } else {
        return { level: 'Pre-Intermediate', class: 'Group Class or 1:1 Chat' };
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
              <h2 className="text-2xl md:text-3xl font-bold text-amber-950 mb-6 text-center">Test Results</h2>
              <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-6 mb-6 text-center">
                <p className="text-4xl font-bold text-sky-600 mb-2">{score} / {questions.length}</p>
                <p className="text-xl font-bold text-amber-950">Level: {rec.level}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-amber-950 mb-4">Review</h3>
                {questions.map((q, i) => (
                  answers[i] !== q.correct && (
                    <div key={i} className="bg-stone-100 border-2 border-stone-300 rounded-lg p-4 mb-3">
                      <p className="font-bold text-amber-950 mb-2">Question {i + 1}</p>
                      <p className="text-sm text-gray-700 mb-2">{q.explanation}</p>
                      <p className="text-sm text-gray-600 italic">{q.explanationEn}</p>
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
                {rec.class === 'Group Class or 1:1 Chat' ? (
                  <>
                    <button onClick={() => setCurrentPage('group')} className="flex-1 bg-sky-200 text-amber-950 font-bold py-3 rounded-lg hover:bg-sky-300">Group Class</button>
                    <button onClick={() => setCurrentPage('oneOnOne')} className="flex-1 bg-sky-200 text-amber-950 font-bold py-3 rounded-lg hover:bg-sky-300">1:1 Chat</button>
                  </>
                ) : (
                  <button onClick={() => setCurrentPage(rec.class === '1:1 Chat' ? 'oneOnOne' : 'group')} className="flex-1 bg-sky-200 text-amber-950 font-bold py-3 rounded-lg hover:bg-sky-300">Go to Class</button>
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
                  <button key={i} onClick={() => selectAnswer(i)} className={`w-full p-4 rounded-lg border-2 text-left transition-all ${answers[currentQ] === i ? 'bg-stone-300 border-stone-400 font-bold' : 'bg-stone-50 border-stone-200 hover:bg-stone-200'}`}>
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

  const StudentBookingPage = () => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
      const loadBooking = async () => {
        if (!bookingId) return;
        
        try {
          const bookingDoc = await getDocs(collection(db, 'bookings'));
          let foundBooking = null;
          bookingDoc.forEach((doc) => {
            if (doc.id === bookingId) {
              foundBooking = { id: doc.id, ...doc.data() };
            }
          });
          
          if (foundBooking) {
            setBooking(foundBooking);
            // 1주일 이내의 사용 가능한 슬롯 찾기
            findAvailableSlots(foundBooking);
          }
        } catch (error) {
          console.error('Error loading booking:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadBooking();
    }, [bookingId]);

    const findAvailableSlots = (currentBooking) => {
      const now = new Date();
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const available = [];

      // 현재 예약 날짜와 시간
      const currentDate = currentBooking.date;
      const currentSlot = currentBooking.slots[0];

      // 모든 슬롯을 순회하며 1주일 이내의 슬롯 찾기
      Object.keys(timeSlots).forEach(date => {
        const slotDate = new Date(date);
        
        // 1주일 이내인지 확인
        if (slotDate >= now && slotDate <= oneWeekLater) {
          const bookedSlotsOnDate = bookings
            .filter(b => b.date === date && b.id !== bookingId)
            .flatMap(b => b.slots || []);

          timeSlots[date].forEach(slot => {
            // 이미 예약된 슬롯이 아니고, 현재 예약과 다른 슬롯만
            if (!bookedSlotsOnDate.includes(slot) && 
                !(date === currentDate && slot === currentSlot)) {
              
              // 1시간 후 슬롯만 표시
              const [slotHour, slotMinute] = slot.split(':').map(Number);
              const slotDateTime = new Date(date);
              slotDateTime.setHours(slotHour, slotMinute, 0, 0);
              
              const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
              
              if (slotDateTime > oneHourLater) {
                available.push({ date, slot });
              }
            }
          });
        }
      });

      setAvailableSlots(available);
    };

    const reschedule = async () => {
      if (!selectedSlot || !booking) return;

      // 변경 가능 여부 확인
      if (booking.rescheduleCount >= 1) {
        alert('You have already used your one-time reschedule. Please contact the admin for further changes.');
        return;
      }

      // 수업 시간 1시간 전 확인
      const classDateTime = new Date(booking.date);
      const [classHour, classMinute] = booking.slots[0].split(':').map(Number);
      classDateTime.setHours(classHour, classMinute, 0, 0);
      
      const now = new Date();
      const oneHourBefore = new Date(classDateTime.getTime() - 60 * 60 * 1000);
      
      if (now > oneHourBefore) {
        alert('Cannot reschedule within 1 hour of class time. Please contact the admin.');
        return;
      }

      if (!window.confirm(`Reschedule to ${selectedSlot.date} at ${selectedSlot.slot}?`)) {
        return;
      }

      try {
        // 예약 업데이트 (이메일 발송 없이 Firebase만 업데이트)
        await setDoc(doc(db, 'bookings', bookingId), {
          ...booking,
          oldDate: booking.date, // 이전 날짜 저장
          oldSlots: booking.slots, // 이전 시간 저장
          date: selectedSlot.date,
          slots: [selectedSlot.slot],
          rescheduleCount: (booking.rescheduleCount || 0) + 1,
          rescheduledAt: new Date().toISOString(),
          rescheduled: true // 변경됨 표시
        });

        alert('Class rescheduled successfully! The admin will be notified.');
        
        // 페이지 새로고침
        window.location.reload();
      } catch (error) {
        console.error('Error rescheduling:', error);
        alert('Failed to reschedule. Please try again or contact the admin.');
      }
    };

    if (loading) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      );
    }

    if (!booking) {
      return (
        <div className="min-h-screen bg-stone-100 p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">The booking link is invalid or has been deleted.</p>
            <button onClick={() => window.location.href = '/'} className="bg-sky-200 text-amber-950 px-6 py-3 rounded-lg font-bold hover:bg-sky-300">
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    const canReschedule = (booking.rescheduleCount || 0) < 1;
    const classDateTime = new Date(booking.date);
    const [classHour, classMinute] = booking.slots[0].split(':').map(Number);
    classDateTime.setHours(classHour, classMinute, 0, 0);
    const oneHourBefore = new Date(classDateTime.getTime() - 60 * 60 * 1000);
    const isWithinOneHour = new Date() > oneHourBefore;

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-950">My Booking</h2>
              <button onClick={() => window.location.href = '/'} className="text-gray-600 hover:text-amber-950">
                ← Home
              </button>
            </div>

            {/* 예약 정보 */}
            <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-amber-950 mb-4">Class Information</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-bold">Name:</span> {booking.name}</p>
                <p><span className="font-bold">Email:</span> {booking.email}</p>
                <p><span className="font-bold">Date:</span> {booking.date}</p>
                <p><span className="font-bold">Time:</span> {booking.slots.join(', ')} (KST)</p>
                <p><span className="font-bold">Status:</span> {
                  booking.paymentConfirmed ? 
                    <span className="text-green-700 font-medium">Confirmed ✓</span> : 
                    <span className="text-amber-700 font-medium">Payment Pending</span>
                }</p>
                {booking.rescheduleCount > 0 && (
                  <p className="text-sm text-gray-500">
                    You have already rescheduled this class.
                  </p>
                )}
              </div>
            </div>

            {/* 시간 변경 섹션 */}
            {!booking.paymentConfirmed ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                <p className="text-amber-800">
                  Please complete payment within 24 hours to confirm your booking.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-amber-950 mb-4">Reschedule Class</h3>
                
                {!canReschedule ? (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <p className="text-red-700 font-medium">
                      You have already used your one-time reschedule option.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Please contact the admin at koreanteacherhannah@gmail.com if you need to make further changes.
                    </p>
                  </div>
                ) : isWithinOneHour ? (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <p className="text-red-700 font-medium">
                      Cannot reschedule within 1 hour of class time.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Please contact the admin at koreanteacherhannah@gmail.com for urgent changes.
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                    <p className="text-amber-800 font-medium mb-2">
                      No available slots within the next 7 days.
                    </p>
                    <p className="text-sm text-gray-600">
                      Please contact the admin at koreanteacherhannah@gmail.com to reschedule your class.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800">
                        ✓ You can reschedule <span className="font-bold">once</span> for free
                      </p>
                      <p className="text-sm text-green-800">
                        ✓ Available slots within the next 7 days are shown below
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-3">
                        Select a new time slot (showing slots 1+ hours from now):
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {availableSlots.map((slot, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              selectedSlot?.date === slot.date && selectedSlot?.slot === slot.slot
                                ? 'bg-sky-200 border-sky-400 font-bold'
                                : 'bg-stone-50 border-stone-200 hover:bg-sky-100'
                            }`}
                          >
                            <div className="font-bold text-amber-950">{slot.date}</div>
                            <div className="text-gray-700">{slot.slot} KST</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedSlot && (
                      <button
                        onClick={reschedule}
                        className="w-full bg-sky-200 text-amber-950 font-bold py-4 rounded-lg hover:bg-sky-300"
                      >
                        Confirm Reschedule
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AdminPage = () => {
    const [m, setM] = useState('');
    const [d, setD] = useState('');
    const [sh, setSh] = useState('9');
    const [sm, setSm] = useState('0');
    const [eh, setEh] = useState('12');
    const [em, setEm] = useState('0');
    // 슬롯 삭제용 상태
    const [delM, setDelM] = useState('');
    const [delD, setDelD] = useState('');
    const [delSh, setDelSh] = useState('');
    const [delSm, setDelSm] = useState('0');
    const [delEh, setDelEh] = useState('');
    const [delEm, setDelEm] = useState('0');

    const loginWithGoogle = async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user.uid !== ADMIN_UID) {
          await signOut(auth);
          alert('Unauthorized. Admin only.');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
    };

    const logout = async () => {
      try {
        await signOut(auth);
        setCurrentPage('home');
      } catch (error) {
        console.error('Logout error:', error);
      }
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

    const deleteSlot = async () => {
      if (!delM || !delD || !delSh || !delEh) return alert('Fill all fields');
      const st = `${String(delSh).padStart(2, '0')}:${String(delSm).padStart(2, '0')}`;
      const et = `${String(delEh).padStart(2, '0')}:${String(delEm).padStart(2, '0')}`;
      if (st >= et) return alert('Invalid time');
      
      const y = new Date().getFullYear();
      const ds = `${y}-${String(delM).padStart(2, '0')}-${String(delD).padStart(2, '0')}`;
      const slotsToDelete = genSlots(delSh, delSm, delEh, delEm);
      
      try {
        const currentSlots = timeSlots[ds] || [];
        const updatedSlots = currentSlots.filter(slot => !slotsToDelete.includes(slot));
        
        if (updatedSlots.length === currentSlots.length) {
          return alert('No matching slots found to delete');
        }
        
        if (updatedSlots.length === 0) {
          // 모든 슬롯이 삭제되면 문서 자체를 삭제
          await deleteDoc(doc(db, 'timeSlots', ds));
        } else {
          // 일부 슬롯만 삭제
          await setDoc(doc(db, 'timeSlots', ds), {
            slots: updatedSlots
          });
        }
        
        alert(`Deleted ${currentSlots.length - updatedSlots.length} slot(s) from ${ds}`);
        setDelM('');
        setDelD('');
        setDelSh('');
        setDelSm('0');
        setDelEh('');
        setDelEm('0');
      } catch (error) {
        console.error('Error deleting slots:', error);
        alert('Failed to delete slots. Please try again.');
      }
    };

    if (!isAdminAuth) {
      return (
        <div className="min-h-screen bg-stone-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-amber-950 mb-6 text-center">Admin Login</h2>
            <p className="text-gray-600 text-center mb-6">Sign in with your Google account</p>
            <button onClick={loginWithGoogle} className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
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
              <button onClick={logout} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">Logout</button>
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
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Delete Slots</h3>
            <p className="text-sm text-gray-600 mb-4">Delete specific slots from a single date</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm mb-2">Month</label><input type="number" min="1" max="12" value={delM} onChange={(e) => setDelM(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" /></div>
                <div><label className="block text-sm mb-2">Day</label><input type="number" min="1" max="31" value={delD} onChange={(e) => setDelD(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div><label className="block text-sm mb-2">Start Hour</label><input type="number" min="0" max="23" value={delSh} onChange={(e) => setDelSh(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" placeholder="9" /></div>
                <div><label className="block text-sm mb-2">Min</label><input type="number" min="0" max="59" step="30" value={delSm} onChange={(e) => setDelSm(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" placeholder="0" /></div>
                <div><label className="block text-sm mb-2">End Hour</label><input type="number" min="0" max="23" value={delEh} onChange={(e) => setDelEh(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" placeholder="12" /></div>
                <div><label className="block text-sm mb-2">Min</label><input type="number" min="0" max="59" step="30" value={delEm} onChange={(e) => setDelEm(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" placeholder="0" /></div>
              </div>
              <button onClick={deleteSlot} className="w-full bg-red-100 text-red-700 font-bold py-3 rounded-lg hover:bg-red-200">Delete</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminBookingsPage = () => {
    if (!isAdminAuth) { setCurrentPage('admin'); return null; }
    const [filterType, setFilterType] = useState('all'); // 'all', 'overdue', 'rescheduled'
    
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

    const confirmPayment = async (booking) => {
      if (window.confirm(`Confirm payment for ${booking.name}?`)) {
        try {
          // Firebase에 결제 확인 상태 업데이트
          await setDoc(doc(db, 'bookings', booking.id), {
            ...booking,
            paymentConfirmed: true,
            paymentConfirmedAt: new Date().toISOString()
          });

          // EmailJS 초기화
          emailjs.init('1eD9dTRJPfHenqguL');

          // 학생 전용 링크 생성
          const bookingLink = `${window.location.origin}/?booking=${booking.id}`;

          // 학생에게 확정 이메일 발송 (학생 링크 + 모든 안내사항 포함)
          await emailjs.send(
            'service_c58vlqm',
            'template_confirm',
            {
              to_email: booking.email,
              cc_email: 'koreanteacherhannah@gmail.com',
              student_name: booking.name,
              booking_date: booking.date,
              time_slots: booking.slots.join(', '),
              booking_link: bookingLink
            }
          );

          alert('Payment confirmed! Confirmation email sent to student.');
        } catch (error) {
          console.error('Error confirming payment:', error);
          alert('Failed to confirm payment. Please try again.');
        }
      }
    };

    // 24시간 이상 경과한 미결제 예약 필터링
    const getOverdueBookings = () => {
      const now = new Date();
      return bookings.filter(b => {
        if (b.paymentConfirmed) return false;
        const bookedTime = new Date(b.bookedAt);
        const hoursPassed = (now - bookedTime) / (1000 * 60 * 60);
        return hoursPassed >= 24;
      });
    };

    // 변경된 예약 필터링
    const getRescheduledBookings = () => {
      return bookings.filter(b => b.rescheduled === true);
    };

    const overdueBookings = getOverdueBookings();
    const rescheduledBookings = getRescheduledBookings();
    
    const displayBookings = 
      filterType === 'overdue' ? overdueBookings :
      filterType === 'rescheduled' ? rescheduledBookings :
      bookings;

    const deleteAllOverdue = async () => {
      if (window.confirm(`Delete all ${overdueBookings.length} overdue bookings?`)) {
        try {
          for (const booking of overdueBookings) {
            await deleteDoc(doc(db, 'bookings', booking.id));
          }
          alert(`Deleted ${overdueBookings.length} overdue bookings.`);
        } catch (error) {
          console.error('Error deleting overdue bookings:', error);
          alert('Failed to delete some bookings. Please try again.');
        }
      }
    };

    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Bookings ({displayBookings.length})</h2>
            <button onClick={() => setCurrentPage('admin')} className="bg-stone-200 px-4 py-2 rounded-lg">Back</button>
          </div>

          {/* 필터 버튼 */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <div className="flex gap-3 items-center flex-wrap">
              <button 
                onClick={() => setFilterType('all')} 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'all' ? 'bg-sky-200 text-amber-950' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'}`}
              >
                All Bookings ({bookings.length})
              </button>
              <button 
                onClick={() => setFilterType('overdue')} 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'overdue' ? 'bg-red-200 text-red-900' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'}`}
              >
                Overdue 24h+ ({overdueBookings.length})
              </button>
              <button 
                onClick={() => setFilterType('rescheduled')} 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'rescheduled' ? 'bg-purple-200 text-purple-900' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'}`}
              >
                Rescheduled ({rescheduledBookings.length})
              </button>
              {filterType === 'overdue' && overdueBookings.length > 0 && (
                <button 
                  onClick={deleteAllOverdue}
                  className="ml-auto bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200"
                >
                  Delete All Overdue
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            {displayBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {filterType === 'overdue' ? 'No overdue bookings' : 
                 filterType === 'rescheduled' ? 'No rescheduled bookings' : 
                 'No bookings'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">Name</th>
                      <th className="px-4 py-3 text-left text-sm">Email</th>
                      <th className="px-4 py-3 text-left text-sm">Date & Time</th>
                      <th className="px-4 py-3 text-left text-sm">Booked At</th>
                      <th className="px-4 py-3 text-left text-sm">Status</th>
                      <th className="px-4 py-3 text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBookings.map(b => {
                      const bookedTime = new Date(b.bookedAt);
                      const hoursPassed = ((new Date() - bookedTime) / (1000 * 60 * 60)).toFixed(1);
                      
                      return (
                        <tr key={b.id} className={`border-t ${b.rescheduled ? 'bg-purple-50' : ''}`}>
                          <td className="px-4 py-3 text-sm">{b.name}</td>
                          <td className="px-4 py-3 text-sm">{b.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              {b.rescheduled && b.oldDate && (
                                <div className="text-xs text-gray-400 line-through mb-1">
                                  {b.oldDate} | {b.oldSlots?.join(', ')}
                                </div>
                              )}
                              <div className={b.rescheduled ? 'font-bold text-purple-700' : ''}>
                                {b.date} | {b.slots.join(', ')}
                                {b.rescheduled && <span className="ml-2 text-xs">🔄</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="text-xs text-gray-500">
                              {bookedTime.toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              <div className={hoursPassed >= 24 ? 'text-red-600 font-medium' : ''}>
                                ({hoursPassed}h ago)
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {b.paymentConfirmed ? (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Confirmed</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {!b.paymentConfirmed && (
                                <button 
                                  onClick={() => confirmPayment(b)} 
                                  className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium hover:bg-green-200"
                                >
                                  Confirm
                                </button>
                              )}
                              <button 
                                onClick={() => del(b.id)} 
                                className="text-red-600 font-bold hover:text-red-800 text-sm"
                              >
                                Del
                              </button>
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'oneOnOne' && <OneOnOnePage />}
      {currentPage === 'group' && <GroupPage />}
      {currentPage === 'booking' && <BookingPage />}
      {currentPage === 'tutors' && <TutorsPage />}
      {currentPage === 'levelTest' && <LevelTestPage />}
      {currentPage === 'studentBooking' && <StudentBookingPage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'adminBookings' && <AdminBookingsPage />}
    </div>
  );
};

export default KoreanLearningSite;
