// import { useState } from 'react';
// import { AuthProvider } from './contexts/AuthContext';
// import { Navbar } from './components/Navbar';
// import { HomePage } from './pages/HomePage';
// import { EventDetailsPage } from './pages/EventDetailsPage';
// import { MyTicketsPage } from './pages/MyTicketsPage';
// import { ChatPage } from './pages/ChatPage';
// import { Event, supabase } from './lib/supabase';
// import { useAuth } from './contexts/AuthContext';
// import { AuthModal } from './components/AuthModal';
// import { Check } from 'lucide-react';

// type Page = 'home' | 'tickets' | 'chat' | 'eventDetails';

// function AppContent() {
//   const [currentPage, setCurrentPage] = useState<Page>('home');
//   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
//   const [selectedChatEventId, setSelectedChatEventId] = useState<string | undefined>();
//   const [showPurchaseModal, setShowPurchaseModal] = useState(false);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [purchaseSuccess, setPurchaseSuccess] = useState(false);
//   const { user } = useAuth();

//   const handleSelectEvent = (event: Event) => {
//     setSelectedEvent(event);
//     setCurrentPage('eventDetails');
//   };

//   const handleNavigate = (page: 'home' | 'tickets' | 'chat') => {
//     setCurrentPage(page);
//     setSelectedChatEventId(undefined);
//   };

//   const handlePurchase = (event: Event) => {
//     if (!user) {
//       setShowAuthModal(true);
//       return;
//     }
//     setSelectedEvent(event);
//     setShowPurchaseModal(true);
//   };

//   const confirmPurchase = async () => {
//     if (!selectedEvent || !user) return;

//     const { error } = await supabase.from('tickets').insert({
//       user_id: user.id,
//       event_id: selectedEvent.id,
//       ticket_number: '',
//     });

//     if (!error) {
//       setPurchaseSuccess(true);
//       setTimeout(() => {
//         setShowPurchaseModal(false);
//         setPurchaseSuccess(false);
//         setCurrentPage('tickets');
//       }, 2000);
//     }
//   };

//   const handleChatClick = (eventId: string) => {
//     setSelectedChatEventId(eventId);
//     setCurrentPage('chat');
//   };

//   return (
//     <div className="min-h-screen bg-black">
//       <Navbar currentPage={currentPage as any} onNavigate={handleNavigate} />

//       {currentPage === 'home' && <HomePage onSelectEvent={handleSelectEvent} />}

//       {currentPage === 'eventDetails' && selectedEvent && (
//         <EventDetailsPage
//           event={selectedEvent}
//           onBack={() => setCurrentPage('home')}
//           onPurchase={handlePurchase}
//         />
//       )}

//       {currentPage === 'tickets' && <MyTicketsPage onChatClick={handleChatClick} />}

//       {currentPage === 'chat' && <ChatPage selectedEventId={selectedChatEventId} />}

//       {showPurchaseModal && selectedEvent && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
//           <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-black via-gray-900 to-black border border-red-900/30 rounded-2xl shadow-2xl shadow-red-900/20 p-8">
//             {purchaseSuccess ? (
//               <div className="text-center">
//                 <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Check size={48} className="text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h3>
//                 <p className="text-gray-400">Your ticket has been confirmed</p>
//               </div>
//             ) : (
//               <>
//                 <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500 mb-6">
//                   Confirm Purchase
//                 </h2>

//                 <div className="bg-black/50 border border-gray-800 rounded-xl p-4 mb-6">
//                   <h3 className="font-semibold text-white mb-2">{selectedEvent.title}</h3>
//                   <p className="text-sm text-gray-400 mb-3">{selectedEvent.venue}</p>
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-400">Total Amount:</span>
//                     <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400">
//                       ${selectedEvent.price}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
//                   <p className="text-sm text-purple-200">
//                     By purchasing this ticket, you'll automatically join the event's private group chat
//                     to connect with other attendees!
//                   </p>
//                 </div>

//                 <div className="flex space-x-4">
//                   <button
//                     onClick={() => setShowPurchaseModal(false)}
//                     className="flex-1 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={confirmPurchase}
//                     className="flex-1 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white font-semibold rounded-lg hover:from-red-500 hover:to-purple-500 transition-all shadow-lg shadow-red-900/30"
//                   >
//                     Confirm Purchase
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
//     </div>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   );
// }

// export default App;
// src/App.tsx
// src/App.tsx
// src/App.tsx
// src/App.tsx
import React, { Component, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/**
 * Lazy-load pages so the app shell can render quickly and errors are caught
 * by the ErrorBoundary instead of producing a white screen.
 */
const QuestionnairePage = lazy(() => import("./pages/QuestionnairePage"));
const WaitlistPage = lazy(() => import("./pages/WaitlistPage"));
const HomeSplash = lazy(() => import("./pages/HomeSplash"));

/** Small UI shown while lazy pages are loading */
function LoadingFallback() {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ color: "#FF785A" }}>Loading…</h2>
      <p>Hold tight — loading the page.</p>
    </div>
  );
}

/** Error boundary so we don't get a white screen on runtime errors */
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // you can log to your error service here
    // console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ color: "#c53030" }}>Something went wrong</h1>
          <p style={{ color: "#444" }}>
            The app encountered an error while loading. You can try:
          </p>
          <ul style={{ color: "#444" }}>
            <li>Refreshing the page</li>
            <li>Checking the browser console for errors (Cmd+Option+J)</li>
            <li>Ensuring your `.env` values are correct and the dev server has been restarted</li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#FF785A",
                color: "white",
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                marginRight: 8,
              }}
            >
              Reload
            </button>
            <button
              onClick={this.reset}
              style={{
                background: "#efefef",
                color: "#111",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
          <details style={{ marginTop: 12, color: "#666" }}>
            <summary>Show error</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Default route redirects to the questionnaire */}
            <Route path="/" element={<Navigate to="/questionnaire" replace />} />

            {/* Step 1: Questionnaire */}
            <Route path="/questionnaire" element={<QuestionnairePage />} />

            {/* Step 2: Waitlist */}
            <Route path="/waitlist" element={<WaitlistPage />} />

            {/* Step 3: Final home splash */}
            <Route path="/home" element={<HomeSplash />} />

            {/* Unknown paths -> questionnaire */}
            <Route path="*" element={<Navigate to="/questionnaire" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
