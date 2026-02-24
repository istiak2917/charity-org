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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: authError } = await supabase.auth.getClaims(token)
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const { subject, body } = await req.json()

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get active subscribers
    const { data: subscribers } = await serviceClient.from('newsletter_subscribers')
      .select('email, name').eq('status', 'active')

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'No active subscribers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@shishuful.org'
    const siteUrl = Deno.env.get('SITE_URL') || 'https://shishuful.org'

    let sent = 0
    for (const sub of subscribers) {
      const unsubLink = `${siteUrl}/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}`
      const htmlBody = `${body}<br/><hr/><p style="font-size:12px;color:#999;">আনসাবস্ক্রাইব করতে <a href="${unsubLink}">এখানে ক্লিক করুন</a></p>`

      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
          body: JSON.stringify({ from: fromEmail, to: [sub.email], subject, html: htmlBody }),
        })
      } else {
        await serviceClient.from('email_queue').insert({
          to_email: sub.email, subject, body: htmlBody, type: 'newsletter', status: 'queued',
        })
      }
      sent++
    }

    return new Response(JSON.stringify({ success: true, sent, total: subscribers.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
