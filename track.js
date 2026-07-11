(function() {
  var SUPABASE_URL = 'https://nbbkbsdikayrdocvpmea.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmtic2Rpa2F5cmRvY3ZwbWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDMwMjEsImV4cCI6MjA5ODgxOTAyMX0.t5EV8_mahMxP2VDYoFmv1sgW3RYjxeUlQkqbN9EHd2U';

  // Session ID
  var sid = localStorage.getItem('al_session');
  if (!sid) { sid = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); localStorage.setItem('al_session', sid); }

  var startTime = Date.now();
  var pageUnloaded = false;

  // Capture UTM + source params from URL
  var params = new URLSearchParams(window.location.search);
  var utmSource = params.get('utm_source') || '';
  var utmMedium = params.get('utm_medium') || '';
  var utmCampaign = params.get('utm_campaign') || '';
  var gclid = params.get('gclid') || '';
  var fbclid = params.get('fbclid') || '';

  // Detect source from referrer if no UTM
  function detectSource() {
    if (utmSource) return utmSource;
    var ref = document.referrer || '';
    if (!ref) return 'direct';
    if (ref.includes('facebook.com') || ref.includes('fb.com') || fbclid) return 'facebook';
    if (ref.includes('instagram.com')) return 'instagram';
    if (ref.includes('google.') || ref.includes('googleadservices.com') || gclid) return 'google';
    if (ref.includes('bing.com')) return 'bing';
    if (ref.includes('youtube.com')) return 'youtube';
    if (ref.includes('twitter.com') || ref.includes('x.com')) return 'twitter';
    if (ref.includes('whatsapp.com')) return 'whatsapp';
    try { return new URL(ref).hostname; } catch(e) { return 'other'; }
  }

  function detectMedium() {
    if (utmMedium) return utmMedium;
    var src = detectSource();
    if (gclid || fbclid) return 'cpc';
    if (src === 'direct') return 'none';
    if (['facebook','instagram','twitter','youtube','whatsapp'].includes(src)) return 'social';
    if (src === 'google' || src === 'bing') return 'organic';
    return 'referral';
  }

  function track(type, data) {
    try {
      var payload = {
        event_type: type,
        event_data: data || {},
        session_id: sid,
        path: window.location.pathname,
        referrer: document.referrer || '',
        page_title: document.title
      };
      // Add source tracking data
      payload.event_data.utm_source = detectSource();
      payload.event_data.utm_medium = detectMedium();
      if (utmCampaign) payload.event_data.utm_campaign = utmCampaign;
      if (gclid) payload.event_data.gclid = gclid;
      if (fbclid) payload.event_data.fbclid = fbclid;

      fetch(SUPABASE_URL + '/rest/v1/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      }).catch(function() {});
    } catch(e) {}
  }

  if (document.readyState === 'complete') {
    track('pageview');
  } else {
    window.addEventListener('load', function() { track('pageview'); });
  }

  function onLeave() {
    if (pageUnloaded) return;
    pageUnloaded = true;
    var dur = Date.now() - startTime;
    if (dur > 1000) {
      try {
        fetch(SUPABASE_URL + '/rest/v1/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            event_type: 'pageleave',
            event_data: { duration_ms: dur, utm_source: detectSource(), utm_medium: detectMedium() },
            session_id: sid,
            path: window.location.pathname,
            page_title: document.title
          })
        }).catch(function() {});
      } catch(e) {}
    }
  }

  window.addEventListener('beforeunload', onLeave);
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') onLeave();
  });

  window.trackEvent = track;
})();
