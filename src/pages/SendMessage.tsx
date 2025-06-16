import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Heart, Send, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/contexts/SessionContext';

const formSchema = z.object({
  subject: z.string().min(1, { message: 'Subject cannot be empty.' }).max(100, { message: 'Subject is too long.' }),
  content: z.string().min(1, { message: 'Message content cannot be empty.' }).max(1000, { message: 'Message is too long.' }),
});

const SendMessage = () => {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerNickname, setPartnerNickname] = useState<string | null>(null);
  const [fetchingPartner, setFetchingPartner] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      content: '',
    },
  });

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      if (sessionLoading || !user) {
        setFetchingPartner(false);
        return;
      }

      if (user?.user_metadata?.partner_email) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username') // Fetch username (nickname) as well
          .eq('email', user.user_metadata.partner_email)
          .single();

        if (error) {
          console.error('Error fetching partner ID:', error.message);
          toast.error('Could not find partner profile. Please ensure your partner has registered.');
          setPartnerId(null);
          setPartnerNickname(null);
        } else if (data) {
          setPartnerId(data.id);
          setPartnerNickname(data.username); // Assuming 'username' in profiles table stores nickname
        }
      } else {
        toast.error('Your profile does not have a partner email set. Please update your profile.');
      }
      setFetchingPartner(false);
    };
    fetchPartnerDetails();
  }, [user, sessionLoading]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !partnerId) {
      toast.error('Cannot send message: User or partner not identified.');
      return;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: partnerId,
        subject: values.subject,
        content: values.content,
      });

      if (error) {
        toast.error(error.message);
        console.error('Send message error:', error.message);
      } else {
        toast.success('Message sent successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected send message error:', error);
      toast.error('An unexpected error occurred while sending the message.');
    }
  };

  if (sessionLoading || fetchingPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!partnerId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 p-4 text-center">
        <Heart className="w-12 h-12 text-pink-600 dark:text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partner Not Found</h2>
        <p className="text-muted-foreground mb-6">
          It looks like your partner's profile isn't set up or linked. Please ensure your partner has registered with the email you provided.
        </p>
        <Link to="/dashboard">
          <Button className="bg-pink-600 hover:bg-pink-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Heart className="w-12 h-12 text-pink-600 dark:text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Send Message to {partnerNickname || 'Your Partner'}</h2>
          <p className="text-muted-foreground">Share your thoughts.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4" /> Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Regarding..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your message here..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
              <Send className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;