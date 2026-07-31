/* ==========================================================================
   ADMIN.JS
   A minimal authenticated dashboard for viewing and managing submissions
   from the three Supabase tables. Uses Supabase's Auth (GoTrue) REST API
   directly — no SDK, matching the rest of the site.

   SECURITY MODEL (read this before deploying):
   - The public site's "anon" role can only INSERT into these tables — it
     can never read them (see README > Supabase setup).
   - This page requires a real, logged-in Supabase user before it will read
     anything. That user must be created ahead of time in the Supabase
     Dashboard (Authentication -> Users) — there is no public sign-up form
     here, by design.
   - The session token lives only in memory (a plain JS variable), never in
     localStorage/sessionStorage/cookies. Refreshing the page requires
     logging in again. This is a deliberate, safer default for a page that
     handles residents' personal contact information.
   - Every value pulled from the database is HTML-escaped before being
     inserted into the page (see escapeHtml) so a submitted message can
     never execute as code in an admin's browser.
   ========================================================================== */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://boremnendxebtivsgazw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_nZ4KIgw-TStt-XsMsLu6pA_NlfvK8jI';

  let session = null; // { access_token, email } — memory only, never persisted

  function toast(message, type) {
    if (window.PLSToast) window.PLSToast(message, type);
    else window.alert(message);
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (_) { return iso; }
  }

  /* ---------------- Auth (Supabase GoTrue REST API) ---------------- */
  async function signIn(email, password) {
    const res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ email: email, password: password })
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      throw new Error((data && (data.error_description || data.msg)) || 'Invalid email or password.');
    }
    session = { access_token: data.access_token, email: (data.user && data.user.email) || email };
    return session;
  }

  async function signOut() {
    if (session) {
      try {
        await fetch(SUPABASE_URL + '/auth/v1/logout', {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + session.access_token }
        });
      } catch (_) { /* best effort — clear locally regardless */ }
    }
    session = null;
  }

  /* ---------------- Data (authenticated REST calls) ---------------- */
  async function fetchTable(table) {
    if (!session) throw new Error('Not signed in.');
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?select=*&order=created_at.desc', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + session.access_token }
    });
    if (res.status === 401) { session = null; throw new Error('Your session has expired — please log in again.'); }
    if (!res.ok) throw new Error('Could not load data (status ' + res.status + '). Have the "authenticated" SELECT policies been added? See README.');
    return res.json();
  }

  async function deleteRow(table, id) {
    if (!session) throw new Error('Not signed in.');
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + session.access_token }
    });
    if (!res.ok) throw new Error('Could not delete this entry.');
  }

  /* ---------------- Table definitions ---------------- */
  const TABLES = {
    contact_messages: {
      columns: [
        { key: 'created_at', label: 'Date', format: formatDate },
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'subject', label: 'Subject' },
        { key: 'message', label: 'Message' }
      ]
    },
    volunteer_signups: {
      columns: [
        { key: 'created_at', label: 'Date', format: formatDate },
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'ward_area', label: 'Ward' },
        { key: 'interests', label: 'Interests', format: function (v) { return Array.isArray(v) ? v.join(', ') : v; } },
        { key: 'availability', label: 'Availability' },
        { key: 'message', label: 'Note' }
      ]
    },
    newsletter_subscribers: {
      columns: [
        { key: 'created_at', label: 'Date', format: formatDate },
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' }
      ]
    }
  };

  function renderTable(table, rows) {
    const cfg = TABLES[table];
    const container = document.getElementById('tablePanel-' + table);
    if (!rows.length) {
      container.innerHTML = '<p class="placeholder-note">No entries yet.</p>';
      return;
    }
    let html = '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>';
    cfg.columns.forEach(function (c) { html += '<th>' + escapeHtml(c.label) + '</th>'; });
    html += '<th>Action</th></tr></thead><tbody>';
    rows.forEach(function (row) {
      html += '<tr>';
      cfg.columns.forEach(function (c) {
        const raw = c.format ? c.format(row[c.key]) : row[c.key];
        html += '<td>' + escapeHtml(raw) + '</td>';
      });
      html += '<td><button type="button" class="btn btn--sm btn--secondary" data-delete-table="' + table + '" data-delete-id="' + escapeHtml(row.id) + '">Delete</button></td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;

    container.querySelectorAll('[data-delete-id]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (!window.confirm('Delete this entry? This cannot be undone.')) return;
        try {
          await deleteRow(btn.dataset.deleteTable, btn.dataset.deleteId);
          toast('Entry deleted.', 'success');
          loadTable(table);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });
  }

  async function loadTable(table) {
    const container = document.getElementById('tablePanel-' + table);
    container.innerHTML = '<p class="placeholder-note">Loading&hellip;</p>';
    try {
      const rows = await fetchTable(table);
      renderTable(table, rows);
      const countEl = document.getElementById('tabCount-' + table);
      if (countEl) countEl.textContent = rows.length;
    } catch (err) {
      container.innerHTML = '<p class="placeholder-note" style="color:var(--color-error-text);">' + escapeHtml(err.message) + '</p>';
      if (/expired|not signed in/i.test(err.message)) showLogin();
    }
  }

  function loadAllTables() {
    Object.keys(TABLES).forEach(loadTable);
  }

  function showDashboard(email) {
    document.getElementById('adminLoginCard').hidden = true;
    document.getElementById('adminDashboard').hidden = false;
    document.getElementById('adminUserEmail').textContent = email;
    loadAllTables();
  }
  function showLogin() {
    document.getElementById('adminDashboard').hidden = true;
    document.getElementById('adminLoginCard').hidden = false;
  }

  function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('is-active'); });
        document.querySelectorAll('.admin-panel').forEach(function (p) { p.hidden = true; });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        document.getElementById('tablePanel-' + btn.dataset.table).hidden = false;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();

    const loginForm = document.getElementById('adminLoginForm');
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      const btn = loginForm.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Signing in…';
      try {
        const s = await signIn(email, password);
        loginForm.reset();
        showDashboard(s.email);
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Log In';
      }
    });

    document.getElementById('adminLogoutBtn').addEventListener('click', async function () {
      await signOut();
      showLogin();
      toast('Signed out.', 'success');
    });

    document.getElementById('refreshAllBtn').addEventListener('click', loadAllTables);
  });
})();
