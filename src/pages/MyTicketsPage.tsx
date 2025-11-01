import { useEffect, useState } from 'react';
import { supabase, Ticket, Event } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Ticket as TicketIcon, Calendar, MapPin, MessageSquare } from 'lucide-react';

type TicketWithEvent = Ticket & {
  events: Event;
};

type MyTicketsPageProps = {
  onChatClick: (eventId: string) => void;
};

export const MyTicketsPage = ({ onChatClick }: MyTicketsPageProps) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', user!.id)
      .order('purchase_date', { ascending: false });

    if (data) {
      setTickets(data as TicketWithEvent[]);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-gray-400">View and manage your concert tickets</p>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-black via-gray-900 to-black border border-red-900/30 rounded-2xl">
            <TicketIcon size={64} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No tickets yet</h3>
            <p className="text-gray-500">Browse events and get your first ticket!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-gradient-to-br from-black via-gray-900 to-black border border-red-900/30 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all shadow-lg shadow-red-900/10"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                    <img
                      src={ticket.events.thumbnail_image}
                      alt={ticket.events.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-600/80 to-purple-600/80 rounded-full text-xs font-semibold text-white mb-2">
                          {ticket.status.toUpperCase()}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {ticket.events.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Ticket #{ticket.ticket_number}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <Calendar className="text-red-500" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Event Date</div>
                          <div className="text-white font-semibold">
                            {formatDate(ticket.events.event_date)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="text-red-500" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Time</div>
                          <div className="text-white font-semibold">
                            {formatTime(ticket.events.event_date)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="text-red-500" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Venue</div>
                          <div className="text-white font-semibold">
                            {ticket.events.venue}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <TicketIcon className="text-red-500" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Price Paid</div>
                          <div className="text-white font-semibold">
                            ${ticket.events.price}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => onChatClick(ticket.events.id)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white font-semibold rounded-lg hover:from-red-500 hover:to-purple-500 transition-all shadow-lg shadow-red-900/30"
                      >
                        <MessageSquare size={20} />
                        <span>Join Event Chat</span>
                      </button>

                      <div className="text-sm text-gray-500">
                        Purchased on {formatDate(ticket.purchase_date)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
