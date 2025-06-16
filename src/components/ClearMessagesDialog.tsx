import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MessageSquareX, CheckCircle, XCircle, Info } from 'lucide-react';

interface ClearRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'denied' | 'completed';
  sender_message: string | null;
  receiver_response_message: string | null;
  created_at: string;
  updated_at: string;
  senderProfile?: { username: string | null; email: string | null } | null;
  receiverProfile?: { username: string | null; email: string | null } | null;
}

interface ClearMessagesDialogProps {
  partnerId: string | null;
  partnerNickname: string | null;
  currentUserId: string | null;
  onMessagesCleared?: () => void; // New prop for callback
}

const ClearMessagesDialog: React.FC<ClearMessagesDialogProps> = ({ partnerId, partnerNickname, currentUserId, onMessagesCleared }) => {
  const { user } = useSession();
  const [isSendRequestOpen, setIsSendRequestOpen] = useState(false);
  const [isPartnerResponseOpen, setIsPartnerResponseOpen] = useState(false);
  const [isSenderReconfirmOpen, setIsSenderReconfirmOpen] = useState(false);
  const [senderMessage, setSenderMessage] = useState('');
  const [receiverResponseMessage, setReceiverResponseMessage] = useState('');
  const [pendingIncomingRequest, setPendingIncomingRequest] = useState<ClearRequest | null>(null);
  const [pendingOutgoingRequest, setPendingOutgoingRequest] = useState<ClearRequest | null>(null); // For sender feedback

  // Function to fetch sender profile
  const fetchSenderProfile = useCallback(async (senderId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', senderId)
      .single();
    if (error) {
      console.error('Error fetching sender profile:', error.message);
      return null;
    }
    return data;
  }, []);

  // Fetch pending requests on component mount and subscribe to real-time updates
  useEffect(() => {
    const fetchAndSubscribeRequests = async () => {
      if (!currentUserId) return;

      // Fetch incoming pending requests
      const { data: incomingRequests, error: incomingError } = await supabase
        .from('clear_requests')
        .select('*') // Select all columns from messages, no direct join here
        .eq('receiver_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (incomingError) {
        console.error('Error fetching incoming clear requests:', incomingError.message);
      } else if (incomingRequests && incomingRequests.length > 0) {
        const newRequest = incomingRequests[0] as ClearRequest;
        const senderProfile = await fetchSenderProfile(newRequest.sender_id);
        setPendingIncomingRequest({ ...newRequest, senderProfile });
        setIsPartnerResponseOpen(true); // Open dialog if there's a pending request
      }

      // Fetch outgoing pending requests (for sender feedback)
      const { data: outgoingRequests, error: outgoingError } = await supabase
        .from('clear_requests')
        .select('*')
        .eq('sender_id', currentUserId)
        .in('status', ['accepted', 'denied']) // Check for responses
        .order('updated_at', { ascending: false })
        .limit(1);

      if (outgoingError) {
        console.error('Error fetching outgoing clear requests:', outgoingError.message);
      } else if (outgoingRequests && outgoingRequests.length > 0) {
        const latestOutgoing = outgoingRequests[0] as ClearRequest;
        setPendingOutgoingRequest(latestOutgoing);
        if (latestOutgoing.status === 'accepted') {
          setIsSenderReconfirmOpen(true);
        } else if (latestOutgoing.status === 'denied') {
            // Only show toast if the dialog is not already open for this request
            if (!isSenderReconfirmOpen) {
                toast.info(`Your partner denied the clear request: "${latestOutgoing.receiver_response_message || 'No message provided.'}"`);
            }
        }
      }
    };

    fetchAndSubscribeRequests();

    // Realtime subscription for new requests and updates
    const channel = supabase
      .channel('clear_requests_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clear_requests',
          filter: `receiver_id=eq.${currentUserId}` // Listen for requests sent to me
        },
        async (payload) => {
          console.log('Realtime payload (incoming):', payload);
          if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
            const newRequest = payload.new as ClearRequest;
            const senderProfile = await fetchSenderProfile(newRequest.sender_id);
            setPendingIncomingRequest({ ...newRequest, senderProfile });
            setIsPartnerResponseOpen(true);
            toast.info(`New clear message request from ${senderProfile?.username || senderProfile?.email || 'Your Partner'}!`);
          } else if (payload.eventType === 'UPDATE' && payload.new.status !== 'pending' && payload.new.sender_id === currentUserId) {
            // This part is for sender to receive updates on their sent requests
            setPendingOutgoingRequest(payload.new as ClearRequest);
            if (payload.new.status === 'accepted') {
              setIsSenderReconfirmOpen(true);
            } else if (payload.new.status === 'denied') {
              toast.info(`Your partner denied the clear request: "${payload.new.receiver_response_message || 'No message provided.'}"`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchSenderProfile, isSenderReconfirmOpen]);


  const handleSendRequest = async () => {
    if (!user || !partnerId) {
      toast.error('User or partner not identified.');
      console.log('Partner ID received by dialog:', partnerId); // Log partnerId here
      return;
    }

    try {
      const { data, error } = await supabase.from('clear_requests').insert({
        sender_id: user.id,
        receiver_id: partnerId,
        status: 'pending',
        sender_message: senderMessage,
      }).select().single();

      if (error) {
        toast.error(error.message);
        console.error('Error sending clear request:', error.message);
      } else {
        toast.success('Clear message request sent to your partner!');
        setSenderMessage('');
        setIsSendRequestOpen(false);
        setPendingOutgoingRequest(data); // Store the sent request for feedback
      }
    } catch (error) {
      console.error('Unexpected error sending clear request:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  const handlePartnerResponse = async (status: 'accepted' | 'denied') => {
    if (!pendingIncomingRequest || !user) return;

    try {
      const { error } = await supabase
        .from('clear_requests')
        .update({ status: status, receiver_response_message: receiverResponseMessage })
        .eq('id', pendingIncomingRequest.id);

      if (error) {
        toast.error(error.message);
        console.error('Error updating clear request status:', error.message);
      } else {
        toast.success(`Request ${status} successfully!`);
        setReceiverResponseMessage('');
        setIsPartnerResponseOpen(false);
        setPendingIncomingRequest(null); // Clear the incoming request
      }
    } catch (error) {
      console.error('Unexpected error responding to clear request:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  const handleFinalClearConfirmation = async () => {
    if (!pendingOutgoingRequest || pendingOutgoingRequest.status !== 'accepted' || !user) {
      toast.error('Invalid request or not accepted.');
      return;
    }

    const payload = {
      clearRequestId: pendingOutgoingRequest.id,
      userId: user.id,
      partnerId: pendingOutgoingRequest.receiver_id,
    };
    console.log('Invoking clear-messages Edge Function with payload:', payload); // Log payload

    // Call Edge Function to clear messages
    try {
      const { data, error } = await supabase.functions.invoke('clear-messages', {
        body: JSON.stringify(payload),
      });

      if (error) {
        toast.error(error.message);
        console.error('Error invoking clear-messages function:', error.message);
      } else if (data && data.success) {
        toast.success('All messages cleared successfully!');
        setIsSenderReconfirmOpen(false);
        setPendingOutgoingRequest(null); // Clear the outgoing request
        onMessagesCleared?.(); // Call the callback to trigger parent refresh
      } else {
        toast.error(data?.message || 'Failed to clear messages.');
        console.error('Clear messages function response:', data);
      }
    } catch (error) {
      console.error('Unexpected error calling clear-messages function:', error);
      toast.error('An unexpected error occurred during message clearing.');
    }
  };

  return (
    <div>
      <p>Clear Messages Dialog Placeholder</p>
    </div>
  );
};

export default ClearMessagesDialog;