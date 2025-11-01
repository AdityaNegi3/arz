import { useEffect, useState } from 'react';
import { supabase, Event } from '../lib/supabaseClient';
import { EventCard } from '../components/EventCard';
import { Sparkles } from 'lucide-react';

type HomePageProps = {
  onSelectEvent: (event: Event) => void;
};

export const HomePage = ({ onSelectEvent }: HomePageProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (data) {
      setEvents(data);
      setFeaturedEvent(data[0] || null);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {featuredEvent && (
        <div className="relative h-[70vh] overflow-hidden rounded-b-3xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent z-10"></div>

          <img
            src={featuredEvent.banner_image}
            alt={featuredEvent.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="text-blue-500" size={24} />
                  <span className="text-blue-600 font-semibold uppercase tracking-wide">
                    Featured Event
                  </span>
                </div>

                <h1 className="text-5xl font-bold text-gray-900 mb-3 leading-tight">
                  {featuredEvent.title}
                </h1>

                <p className="text-lg text-gray-700 mb-5 leading-relaxed">
                  {featuredEvent.description.slice(0, 200)}...
                </p>

                <div className="flex items-center flex-wrap gap-6 text-gray-600 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Date</div>
                    <div className="text-base font-semibold">
                      {formatDate(featuredEvent.event_date)}
                    </div>
                  </div>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Venue</div>
                    <div className="text-base font-semibold">{featuredEvent.venue}</div>
                  </div>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">From</div>
                    <div className="text-base font-semibold text-blue-600">
                      ₹{featuredEvent.price}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectEvent(featuredEvent)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105"
                >
                  Get Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Upcoming Events</h2>
          <p className="text-gray-600 text-lg">
            Discover exciting concerts, parties, and shows happening near you 🎉
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onSelectEvent(event)}
            />
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No events available at the moment 😔</p>
          </div>
        )}
      </div>
    </div>
  );
};
