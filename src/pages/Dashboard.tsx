import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, MessageSquare, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

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
  senderProfile?: Profile | null; // Add senderProfile
  receiverProfile?: Profile | null; // Add receiverProfile
}

const Dashboard = () => {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      toast.error('Failed to log out.');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchMessagesAndProfiles = async () => {
      if (sessionLoading || !user) {
        setMessagesLoading(false);
        return;
      }

      setMessagesLoading(true);
      try {
        // Fetch latest 3 sent messages
        const { data: sentData, error: sentError } = await supabase
          .from('messages')
          .select('*') // Select all columns from messages
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (sentError) {
          console.error('Error fetching sent messages:', sentError.message);
          toast.error('Failed to load sent messages.');
        }

        // Fetch latest 3 received messages
        const { data: receivedData, error: receivedError } = await supabase
          .from('messages')
          .select('*') // Select all columns from messages
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

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

    fetchMessagesAndProfiles();
  }, [user, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground">
        <p className="text-xl">Loading user session...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome, {user.user_metadata.nickname || user.email}!</h1>
          <div className="flex space-x-4">
            <Link to="/edit-profile">
              <Button variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="w-5 h-5 mr-2" /> Edit Profile
              </Button>
            </Link>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800">
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p><strong>Nickname:</strong> {user.user_metadata.nickname || 'Not set'}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Partner Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p><strong>Partner Email:</strong> {user.user_metadata.partner_email || 'Not set'}</p>
              <p><strong>Partner Alias:</strong> {user.user_metadata.partner_nickname || 'Not set'}</p> {/* Display partner_nickname */}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/send-message" className="w-full">
            <Button size="lg" className="w-full bg-pink-600 hover:bg-pink-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700 py-6 text-lg">
              <MessageSquare className="w-6 h-6 mr-3" /> Send New Message
            </Button>
          </Link>
          <Link to="/messages" className="w-full">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 py-6 text-lg">
              <Inbox className="w-6 h-6 mr-3" /> View Inbox & Outbox
            </Button>
          </Link>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Recent Messages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Outbox ({sentMessages.length})</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {messagesLoading ? (
                <p>Loading sent messages...</p>
              ) : sentMessages.length > 0 ? (
                <ul className="space-y-2">
                  {sentMessages.map((message, index) => (
                    <li 
                      key={message.id} 
                      className={`border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0 ${
                        index === 0 ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 p-2 rounded-md' : ''
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">Subject: {message.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To: {message.receiverProfile?.username || message.receiverProfile?.email || 'Unknown Partner'} | Sent: {new Date(message.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No messages sent yet.</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Inbox ({receivedMessages.length})</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {messagesLoading ? (
                <p>Loading received messages...</p>
              ) : receivedMessages.length > 0 ? (
                <ul className="space-y-2">
                  {receivedMessages.map((message, index) => (
                    <li 
                      key={message.id} 
                      className={`border-b border-gray-20:0 dark:border-gray-700 pb-2 last:border-b-0 ${
                        index === 0 ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700 p-2 rounded-md' : ''
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">Subject: {message.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        From: {message.senderProfile?.username || message.senderProfile?.email || 'Unknown Sender'} | Received: {new Date(message.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No messages received yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;