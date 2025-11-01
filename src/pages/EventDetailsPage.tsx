import { useState } from 'react';
import { Event } from '../lib/supabaseClient';
import { Calendar, MapPin, Users, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/AuthModal';

type EventDetailsPageProps = {
  event: Event;
  onBack: () => void;
  onPurchase: (event: Event) => void;
};

export const EventDetailsPage = ({ event, onBack, onPurchase }: EventDetailsPageProps) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleBuyTicket = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onPurchase(event);
  };

  return (
    <>
      <div className="min-h-screen bg-black">
        <div className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>

          <img
            src={event.banner_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />

          <button
            onClick={onBack}
            className="absolute top-24 left-8 z-20 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-all border border-red-900/30"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
          <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-red-900/30 rounded-2xl shadow-2xl shadow-red-900/20 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
              <div className="flex-1 mb-6 md:mb-0">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-600/80 to-purple-600/80 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-4">
                  {event.category}
                </div>

                <h1 className="text-5xl font-bold text-white mb-4">{event.title}</h1>

                <div className="flex flex-wrap gap-6 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-red-500" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-semibold">{formatDate(event.event_date)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="text-red-500" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-semibold">{formatTime(event.event_date)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="text-red-500" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Venue</div>
                      <div className="font-semibold">{event.venue}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 backdrop-blur-md border border-red-900/50 rounded-xl p-6 md:ml-8 min-w-[240px]">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                    Ticket Price
                  </div>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400">
                    ${event.price}
                  </div>
                </div>

                <button
                  onClick={handleBuyTicket}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 text-white text-lg font-bold rounded-lg hover:from-red-500 hover:to-purple-500 transition-all shadow-lg shadow-red-900/50 hover:shadow-red-500/50 hover:scale-105"
                >
                  Buy Ticket
                </button>

                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Check size={16} className="text-green-500" />
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check size={16} className="text-green-500" />
                    <span>Mobile ticket</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check size={16} className="text-green-500" />
                    <span>Join event chat</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-gray-300 leading-relaxed mb-8">{event.description}</p>

              {event.artist_lineup.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Users className="text-red-500" />
                    <span>Artist Lineup</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.artist_lineup.map((artist, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 bg-black/50 border border-gray-800 rounded-lg hover:border-red-900/50 transition-all"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {artist.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{artist}</div>
                          <div className="text-sm text-gray-500">Performing Artist</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="h-24"></div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};
