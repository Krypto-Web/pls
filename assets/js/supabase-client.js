/* ==========================================================================
   SUPABASE-CLIENT.JS
   Minimal fetch-based Supabase REST (PostgREST) client. No SDK dependency,
   so the site has zero external JS runtime dependencies.

   Handles inserts for: contact_messages, volunteer_signups,
   newsletter_subscribers. See README.md > "Supabase setup" for the SQL
   to create these tables and the Row Level Security policies required.
   ========================================================================== */

(function () {
  'use strict';

  // This is Supabase's PUBLISHABLE key (new sb_publishable_... format).
  // It is designed to be shipped in client-side code — that is its purpose —
  // and on its own it grants no access. What it can actually do is entirely
  // controlled by the Row Level Security (RLS) policies on each table.
  // See README.md before going live: without an INSERT policy for the
  // "anon" role, these forms will fail with a permissions error.
  const SUPABASE_URL = 'https://boremnendxebtivsgazw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_nZ4KIgw-TStt-XsMsLu6pA_NlfvK8jI';

  /**
   * Insert a row into a Supabase table via the PostgREST API.
   *
   * IMPORTANT: with Supabase's newer sb_publishable_/sb_secret_ key format,
   * the key must be sent on the "apikey" header ONLY. Do not also add an
   * "Authorization: Bearer" header with this key — Supabase's gateway tries
   * to parse that header as a JWT and will reject the request. (This is a
   * change from the older anon-key convention, which used both headers.)
   *
   * @param {string} table - e.g. 'contact_messages'
   * @param {object} payload - column/value pairs to insert
   * @returns {Promise<boolean>} resolves true on success, throws on failure
   */
  async function insert(table, payload) {
    const response = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        // return=minimal avoids requiring SELECT rights after INSERT,
        // which matters because the anon role should only ever get INSERT.
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let detail = '';
      try { detail = await response.text(); } catch (_) { /* ignore */ }
      const error = new Error('Supabase insert into "' + table + '" failed (' + response.status + ')');
      error.status = response.status;
      error.detail = detail;
      throw error;
    }
    return true;
  }

  // Small public namespace used by forms.js
  window.PLSData = { insert: insert };
})();
