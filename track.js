(function() {
  var SUPABASE_URL = 'https://nbbkbsdikayrdocvpmea.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmtic2Rpa2F5cmRvY3ZwbWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDMwMjEsImV4cCI6MjA5ODgxOTAyMX0.t5EV8_mahMxP2VDYoFmv1sgW3RYjxeUlQkqbN9EHd2U';

  // Session ID
  var sid = localStorage.getItem('al_session');
  if (!sid) { sid = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); localStorage.setItem('al_session', sid); }

  // Track start time
  var startTime = Date.now();
  var pageUnloaded = false;

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

  // Pageview on load
  if (document.readyState === 'complete') {
    track('pageview');
  } else {
    window.addEventListener('load', function() { track('pageview'); });
  }

  // Pageleave (for time-on-page)
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
            event_data: { duration_ms: dur },
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
