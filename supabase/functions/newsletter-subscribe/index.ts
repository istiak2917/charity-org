import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, name, action } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (action === 'unsubscribe') {
      await supabase.from('newsletter_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
        .eq('email', email)
      return new Response(JSON.stringify({ success: true, message: 'Unsubscribed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Subscribe
    const { data: existing } = await supabase.from('newsletter_subscribers')
      .select('id, status').eq('email', email).maybeSingle()

    if (existing) {
      if (existing.status === 'active') {
        return new Response(JSON.stringify({ success: true, message: 'Already subscribed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      // Re-subscribe
      await supabase.from('newsletter_subscribers')
        .update({ status: 'active', name, unsubscribed_at: null })
        .eq('id', existing.id)
    } else {
      await supabase.from('newsletter_subscribers').insert({
        email, name, status: 'active',
      })
    }

    return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
