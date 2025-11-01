import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase, Message, Event } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Send, MessageSquare } from 'lucide-react';

// ---------- Types ----------

type GroupWithEvent = {
  id: string;
  event_id: string;
  events: Event;
};

type MessageWithProfile = Message & {
  profiles: {
    full_name: string;
    avatar_url?: string;
  } | null;
};

type ChatPageProps = {
  selectedEventId?: string;
};

// ---------- Component ----------

export const ChatPage = ({ selectedEventId }: ChatPageProps) => {
  const { user, profile } = useAuth();

  const [groups, setGroups] = useState<GroupWithEvent[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithEvent | null>(null);

  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ---------- Effects ----------

  // Load groups for the current user
  useEffect(() => {
    if (!user) return;

    const loadGroups = async () => {
      setLoading(true);
      setErrorText(null);

      const { data, error } = await supabase
        .from('group_members')
        .select(
          `
          group_id,
          event_groups!inner (
            id,
            event_id,
            events (*)
          )
        `
        )
        .eq('user_id', user.id);

      if (error) {
        console.error(error);
        setErrorText(error.message);
        setGroups([]);
      } else if (data) {
        // Deduplicate in case of multiple memberships
        const unique = new Map<string, GroupWithEvent>();
        (data as any[]).forEach((row) => {
          const g = row.event_groups as GroupWithEvent;
          if (!unique.has(g.id)) unique.set(g.id, g);
        });
        const list = Array.from(unique.values());
        setGroups(list);

        // Select initial group
        const bySelectedEvent = selectedEventId
          ? list.find((g) => g.event_id === selectedEventId)
          : null;
        setSelectedGroup(bySelectedEvent || list[0] || null);
      }

      setLoading(false);
    };

    loadGroups();
  }, [user, selectedEventId]);

  // When selected group changes, load messages & (re)subscribe
  useEffect(() => {
    if (!selectedGroup) return;

    const loadMessages = async () => {
      setErrorText(null);
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          profiles (
            full_name,
            avatar_url
          )
        `
        )
        .eq('group_id', selectedGroup.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        setErrorText(error.message);
        setMessages([]);
      } else if (data) {
        setMessages(data as MessageWithProfile[]);
      }
    };

    // Load existing
    loadMessages();

    // Clean up any previous channel BEFORE creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Subscribe to new messages for this group
    const channel = supabase
      .channel(`messages:${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${selectedGroup.id}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(
              `
              *,
              profiles (
                full_name,
                avatar_url
              )
            `
            )
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as MessageWithProfile]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup on unmount or when selectedGroup changes
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedGroup]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus the input when group changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedGroup]);

  // ---------- Helpers ----------

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getInitials = (name?: string | null) => {
    const safe = (name || 'U N').trim();
    return safe
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Computed selected group id (stable)
  const selectedGroupId = selectedGroup?.id;

  // ---------- Actions ----------

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGroupId) return;

    const content = newMessage.trim();
    if (!content) return;

    setSending(true);
    setErrorText(null);

    // Optimistic UI
    const optimistic: MessageWithProfile = {
      id: `optimistic-${Date.now()}` as any,
      group_id: selectedGroupId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: profile?.full_name || 'You',
        avatar_url: profile?.avatar_url || undefined,
      },
    } as MessageWithProfile;

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      group_id: selectedGroupId,
      user_id: user.id,
      content,
    });

    if (error) {
      console.error(error);
      setErrorText(error.message);
      // Rollback optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setNewMessage(content); // restore text so the user can retry
    }

    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Send on Enter (but allow Shift+Enter to insert newline if you later switch to textarea)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Manually trigger submit
      const form = (e.target as HTMLInputElement).form;
      form?.requestSubmit();
    }
  };

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <div className="text-center">
          <MessageSquare size={64} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No chats yet</h3>
          <p className="text-gray-500">Purchase a ticket to join event chats!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900 to-black border-r border-red-900/30 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Event Chats</h2>
          </div>

          <div className="space-y-2 px-4">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedGroup?.id === group.id
                    ? 'bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-500/50'
                    : 'bg-black/30 border border-gray-800 hover:border-red-900/50'
                }`}
              >
                <h3 className="font-semibold text-white mb-1 truncate">{group.events.title}</h3>
                <p className="text-sm text-gray-400 truncate">{group.events.venue}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {selectedGroup && (
            <>
              <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-900/30 p-6">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedGroup.events.title}</h2>
                <p className="text-gray-400">{selectedGroup.events.venue}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.user_id === user?.id;
                  const name = isOwnMessage ? 'You' : message.profiles?.full_name || 'User';

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                          isOwnMessage
                            ? 'bg-gradient-to-br from-red-600 to-purple-600'
                            : 'bg-gradient-to-br from-gray-700 to-gray-600'
                        }`}
                      >
                        {getInitials(message.profiles?.full_name)}
                      </div>

                      <div className={`max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-gray-500">{name}</span>
                          <span className="text-xs text-gray-600">{formatTime(message.created_at)}</span>
                        </div>

                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-br-sm'
                              : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-gradient-to-r from-black via-gray-900 to-black border-t border-red-900/30 p-6">
                {errorText && (
                  <div className="mb-3 text-sm text-red-400">{errorText}</div>
                )}
                <form onSubmit={sendMessage} className="flex items-center space-x-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    autoComplete="off"
                    disabled={!user || !selectedGroup}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending || !user || !selectedGroup}
                    className="p-3 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg hover:from-red-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30"
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
