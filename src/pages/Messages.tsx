import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Send, MessageSquare, Tag, Zap, Smile } from 'lucide-react';

interface Profile {
  id: string; // Add id to profile interface
  username: string | null;
  email: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type: string; // Add message_type
  priority: string;     // Add priority
  mood: string;         // Add mood
  senderProfile?: Profile | null; // Add senderProfile
  receiverProfile?: Profile | null; // Add receiverProfile
}

const Messages = () => {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  useEffect(() => {
    const fetchAllMessagesAndProfiles = async () => {
      if (sessionLoading || !user) {
        setMessagesLoading(false);
        return;
      }

      setMessagesLoading(true);
      try {
        // Fetch all sent messages
        const { data: sentData, error: sentError } = await supabase
          .from('messages')
          .select('*') // Select all columns from messages
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });

        if (sentError) {
          console.error('Error fetching sent messages:', sentError.message);
          toast.error('Failed to load sent messages.');
        }

        // Fetch all received messages
        const { data: receivedData, error: receivedError } = await supabase
          .from('messages')
          .select('*') // Select all columns from messages
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false });

        if (receivedError) {
          console.error('Error fetching received messages:', receivedError.message);
          toast.error('Failed to load received messages.');
        }

        const allRelatedUserIds = new Set<string>();
        sentData?.forEach(msg => allRelatedUserIds.add(msg.receiver_id));
        receivedData?.forEach(msg => allRelatedUserIds.add(msg.sender_id));
        allRelatedUserIds.add(user.id); // Include current user's ID for their own profile if needed

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, email')
          .in('id', Array.from(allRelatedUserIds));

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError.message);
          toast.error('Failed to load associated profiles.');
          setMessagesLoading(false);
          return;
        }

        const profilesMap = new Map<string, Profile>();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });

        const combinedSentMessages = sentData?.map(msg => ({
          ...msg,
          receiverProfile: profilesMap.get(msg.receiver_id) || null,
        })) || [];

        const combinedReceivedMessages = receivedData?.map(msg => ({
          ...msg,
          senderProfile: profilesMap.get(msg.sender_id) || null,
        })) || [];

        setSentMessages(combinedSentMessages);
        setReceivedMessages(combinedReceivedMessages);

      } catch (error) {
        console.error('Unexpected error fetching messages:', error);
        toast.error('An unexpected error occurred while loading messages.');
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchAllMessagesAndProfiles();
  }, [user, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground">
        <p className="text-xl">Loading messages...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground p-4 pt-20">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Your Messages</h1>
          <Link to="/dashboard">
            <Button variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="inbox">
              <Mail className="w-4 h-4 mr-2" /> Inbox ({receivedMessages.length})
            </TabsTrigger>
            <TabsTrigger value="outbox">
              <Send className="w-4 h-4 mr-2" /> Outbox ({sentMessages.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inbox">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Received Messages</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {messagesLoading ? (
                  <p>Loading received messages...</p>
                ) : receivedMessages.length > 0 ? (
                  <ul className="space-y-4">
                    {receivedMessages.map((message) => (
                      <li key={message.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <Link to={`/messages/${message.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
                          <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" /> Subject: {message.subject}
                            {message.is_read ? null : <span className="ml-2 text-xs font-bold text-blue-600 dark:text-blue-400">NEW!</span>}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> From: {message.senderProfile?.username || message.senderProfile?.email || 'Unknown Sender'} | Received: {new Date(message.created_at).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {message.message_type}</span>
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {message.priority}</span>
                            <span className="flex items-center gap-1"><Smile className="w-3 h-3" /> {message.mood}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No messages received yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="outbox">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Sent Messages</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {messagesLoading ? (
                  <p>Loading sent messages...</p>
                ) : sentMessages.length > 0 ? (
                  <ul className="space-y-4">
                    {sentMessages.map((message) => (
                      <li key={message.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <Link to={`/messages/${message.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
                          <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" /> Subject: {message.subject}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> To: {message.receiverProfile?.username || message.receiverProfile?.email || 'Unknown Partner'} | Sent: {new Date(message.created_at).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {message.message_type}</span>
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {message.priority}</span>
                            <span className="flex items-center gap-1"><Smile className="w-3 h-3" /> {message.mood}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No messages sent yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Messages;