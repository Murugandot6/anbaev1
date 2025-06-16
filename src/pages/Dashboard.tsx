import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, MessageSquare, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground">
        <p className="text-xl">Loading user session...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the SessionContext redirect,
    // but as a fallback:
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground p-4 pt-20">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome, {user.user_metadata.nickname || user.email}!</h1>
          <div className="flex space-x-4">
            <Button variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="w-5 h-5 mr-2" /> Edit Profile
            </Button>
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
              <p><strong>Partner Nickname:</strong> Not set (will be updated by partner)</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700 py-6 text-lg">
            <MessageSquare className="w-6 h-6 mr-3" /> Send New Message
          </Button>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 py-6 text-lg">
            <Inbox className="w-6 h-6 mr-3" /> View Inbox & Outbox
          </Button>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Recent Messages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Outbox (0)</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>No messages sent yet.</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Inbox (0)</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>No messages received yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;