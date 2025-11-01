import { Calendar, MapPin } from 'lucide-react';
import { Event } from '../lib/supabaseClient';

type EventCardProps = {
  event: Event;
  onClick: () => void;
};

export const EventCard = ({ event, onClick }: EventCardProps) => {
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

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-black via-gray-900 to-black border border-red-900/30 cursor-pointer transition-all duration-300 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-900/30 hover:scale-[1.02]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>

      <div className="aspect-[16/9] overflow-hidden">
        <img
          src={event.thumbnail_image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="relative z-20 p-6 -mt-20">
        <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-600/80 to-purple-600/80 backdrop-blur-sm rounded-full text-xs font-semibold text-white mb-3">
          {event.category}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-purple-400 transition-all">
          {event.title}
        </h3>

        <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin size={16} />
            <span>{event.venue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400">
              ${event.price}
            </span>
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-purple-600 text-white font-semibold rounded-lg hover:from-red-500 hover:to-purple-500 transition-all shadow-lg shadow-red-900/30">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
