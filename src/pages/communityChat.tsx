import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { 
  MessageCircle, 
  Send, 
  Hash, 
  Users, 
  Search, 
  Plus, 
  BookOpen, 
  Calculator, 
  Atom, 
  Code, 
  Palette, 
  Globe, 
  Lightbulb,
  GraduationCap,
  Zap,
  User,
  Clock,
  ChevronRight
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  channel_id: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  edited_at?: string;
  reply_to?: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  member_count: number;
  category: 'subject' | 'project' | 'general';
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  last_seen: string;
}

export const CommunityChat: React.FC = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('general');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Channel data
  const channels: Channel[] = [
    // Subject Channels
    {
      id: 'mathematics',
      name: 'Mathematics',
      description: 'Discuss math problems, formulas, and concepts',
      icon: <Calculator className="h-5 w-5" />,
      color: 'bg-blue-500',
      member_count: 245,
      category: 'subject'
    },
    {
      id: 'physics',
      name: 'Physics',
      description: 'Share physics theories and experiments',
      icon: <Atom className="h-5 w-5" />,
      color: 'bg-purple-500',
      member_count: 189,
      category: 'subject'
    },
    {
      id: 'programming',
      name: 'Programming',
      description: 'Code together, share solutions',
      icon: <Code className="h-5 w-5" />,
      color: 'bg-green-500',
      member_count: 324,
      category: 'subject'
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      description: 'Chemical reactions and lab discussions',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-yellow-500',
      member_count: 156,
      category: 'subject'
    },
    {
      id: 'english',
      name: 'English',
      description: 'Literature, writing, and language help',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-red-500',
      member_count: 178,
      category: 'subject'
    },
    {
      id: 'art-design',
      name: 'Art & Design',
      description: 'Creative projects and design critiques',
      icon: <Palette className="h-5 w-5" />,
      color: 'bg-pink-500',
      member_count: 142,
      category: 'subject'
    },
    // Project Channels
    {
      id: 'web-development',
      name: 'Web Dev Projects',
      description: 'Collaborate on web applications',
      icon: <Globe className="h-5 w-5" />,
      color: 'bg-indigo-500',
      member_count: 89,
      category: 'project'
    },
    {
      id: 'mobile-apps',
      name: 'Mobile Apps',
      description: 'iOS and Android app development',
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'bg-cyan-500',
      member_count: 67,
      category: 'project'
    },
    {
      id: 'research',
      name: 'Research Projects',
      description: 'Academic research collaboration',
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'bg-orange-500',
      member_count: 45,
      category: 'project'
    },
    // General Channels
    {
      id: 'general',
      name: 'General Discussion',
      description: 'General chat for all topics',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-gray-500',
      member_count: 567,
      category: 'general'
    }
  ];

  // Sample messages (in real app, fetch from database)
  const sampleMessages: Message[] = [
    {
      id: '1',
      content: "Hey everyone! Can someone help me with calculus derivatives?",
      sender_id: 'user1',
      sender_name: 'Alex Chen',
      channel_id: 'mathematics',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      message_type: 'text'
    },
    {
      id: '2',
      content: "Sure! What specific topic are you struggling with?",
      sender_id: 'user2',
      sender_name: 'Sarah Johnson',
      channel_id: 'mathematics',
      created_at: new Date(Date.now() - 3500000).toISOString(),
      message_type: 'text'
    },
    {
      id: '3',
      content: "I'm working on a React app and need help with state management. Anyone available?",
      sender_id: 'user3',
      sender_name: 'Mike Rodriguez',
      channel_id: 'programming',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      message_type: 'text'
    },
    {
      id: '4',
      content: "Looking for team members for a mobile app project. We're building a study planner!",
      sender_id: 'user4',
      sender_name: 'Emma Wilson',
      channel_id: 'mobile-apps',
      created_at: new Date(Date.now() - 900000).toISOString(),
      message_type: 'text'
    }
  ];

  // Sample online users
  const sampleOnlineUsers: OnlineUser[] = [
    { id: 'user1', name: 'Alex Chen', status: 'online', last_seen: new Date().toISOString() },
    { id: 'user2', name: 'Sarah Johnson', status: 'online', last_seen: new Date().toISOString() },
    { id: 'user3', name: 'Mike Rodriguez', status: 'away', last_seen: new Date(Date.now() - 300000).toISOString() },
    { id: 'user4', name: 'Emma Wilson', status: 'online', last_seen: new Date().toISOString() },
    { id: 'user5', name: 'David Kim', status: 'busy', last_seen: new Date().toISOString() },
  ];

  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    joinChannel(selectedChannel);

    // Set up real-time subscriptions for messages
    const messageSubscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const updatedMessage = payload.new as Message;
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const deletedMessage = payload.old as Message;
        setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
      })
      .subscribe();

    // Set up real-time subscriptions for user presence
    const presenceSubscription = supabase
      .channel('user_presence')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence'
      }, () => {
        fetchOnlineUsers();
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      presenceSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchMessages();
    joinChannel(selectedChannel);
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', selectedChannel)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
        // Fallback to sample data
        setMessages(sampleMessages.filter(msg => msg.channel_id === selectedChannel));
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to sample data
      setMessages(sampleMessages.filter(msg => msg.channel_id === selectedChannel));
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select(`
          user_id,
          status,
          last_seen,
          profiles:user_id (
            full_name
          )
        `)
        .in('status', ['online', 'away', 'busy']);

      if (error) {
        console.error('Error fetching online users:', error);
        setOnlineUsers(sampleOnlineUsers);
      } else {
        const users = data?.map(user => ({
          id: user.user_id,
          name: user.profiles?.full_name || 'Anonymous User',
          status: user.status as 'online' | 'away' | 'busy',
          last_seen: user.last_seen
        })) || [];
        setOnlineUsers(users);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
      setOnlineUsers(sampleOnlineUsers);
    }
  };

  const joinChannel = async (channelId: string) => {
    if (!user) return;

    try {
      // Add user to channel if not already a member
      await supabase
        .from('channel_members')
        .upsert({
          channel_id: channelId,
          user_id: user.id,
          last_read_at: new Date().toISOString()
        }, {
          onConflict: 'channel_id,user_id'
        });

      // Update user presence
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageData = {
      content: newMessage.trim(),
      sender_id: user.id,
      sender_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      channel_id: selectedChannel,
      message_type: 'text' as const
    };

    // Clear input immediately for better UX
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([messageData]);
      
      if (error) {
        console.error('Error sending message:', error);
        // Add message locally as fallback
        const localMessage: Message = {
          ...messageData,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, localMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add message locally as fallback
      const localMessage: Message = {
        ...messageData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, localMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChannelsByCategory = (category: string) => {
    return channels.filter(channel => channel.category === category);
  };

  const getCurrentChannel = () => {
    return channels.find(channel => channel.id === selectedChannel) || channels[0];
  };

  const getFilteredMessages = () => {
    return messages.filter(message => message.channel_id === selectedChannel);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar isAuthenticated={true} onLogout={signOut} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar isAuthenticated={true} onLogout={signOut} />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Channels */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Subject Channels */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  📚 Subject Channels
                </h3>
                <div className="space-y-1">
                  {getChannelsByCategory('subject').map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full flex items-center p-2 rounded-lg text-left transition-all ${
                        selectedChannel === channel.id
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${channel.color} text-white mr-3`}>
                        {channel.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{channel.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {channel.member_count} members
                        </p>
                      </div>
                      {selectedChannel === channel.id && (
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Channels */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  🚀 Project Channels
                </h3>
                <div className="space-y-1">
                  {getChannelsByCategory('project').map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full flex items-center p-2 rounded-lg text-left transition-all ${
                        selectedChannel === channel.id
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${channel.color} text-white mr-3`}>
                        {channel.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{channel.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {channel.member_count} members
                        </p>
                      </div>
                      {selectedChannel === channel.id && (
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* General Channels */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  💬 General
                </h3>
                <div className="space-y-1">
                  {getChannelsByCategory('general').map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full flex items-center p-2 rounded-lg text-left transition-all ${
                        selectedChannel === channel.id
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${channel.color} text-white mr-3`}>
                        {channel.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{channel.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {channel.member_count} members
                        </p>
                      </div>
                      {selectedChannel === channel.id && (
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getCurrentChannel().color} text-white mr-3`}>
                  {getCurrentChannel().icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {getCurrentChannel().name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getCurrentChannel().description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {getCurrentChannel().member_count}
                </Badge>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {getFilteredMessages().map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender_avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {message.sender_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.sender_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                    <div className="mt-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-900 dark:text-gray-100">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Input
                  placeholder={`Message #${getCurrentChannel().name.toLowerCase()}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="resize-none"
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Online Users Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Online Now
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {onlineUsers.filter(u => u.status === 'online').length} members online
            </p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-3">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(user.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
