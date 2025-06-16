import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clearRequestId, userId, partnerId } = await req.json();

    // Validate input
    if (!clearRequestId || !userId || !partnerId) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required parameters.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key for elevated privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Verify the clear request status
    const { data: clearRequest, error: fetchError } = await supabaseAdmin
      .from('clear_requests')
      .select('*')
      .eq('id', clearRequestId)
      .single();

    if (fetchError || !clearRequest) {
      console.error('Error fetching clear request:', fetchError?.message || 'Request not found');
      return new Response(JSON.stringify({ success: false, message: 'Clear request not found or error fetching.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    if (clearRequest.status !== 'accepted') {
      return new Response(JSON.stringify({ success: false, message: 'Clear request not accepted by partner.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 2. Verify that the user invoking the function is the sender of the accepted request
    if (clearRequest.sender_id !== userId) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized to clear messages for this request.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 3. Delete messages between the sender and receiver
    const { error: deleteError } = await supabaseAdmin
      .from('messages')
      .delete()
      .or(`sender_id.eq.${userId}.and.receiver_id.eq.${partnerId},sender_id.eq.${partnerId}.and.receiver_id.eq.${userId}`);

    if (deleteError) {
      console.error('Error deleting messages:', deleteError.message);
      return new Response(JSON.stringify({ success: false, message: 'Failed to delete messages.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 4. Update the clear request status to 'completed'
    const { error: updateRequestError } = await supabaseAdmin
      .from('clear_requests')
      .update({ status: 'completed' })
      .eq('id', clearRequestId);

    if (updateRequestError) {
      console.error('Error updating clear request status to completed:', updateRequestError.message);
    }

    return new Response(JSON.stringify({ success: true, message: 'Messages cleared successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function error:', error.message);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});