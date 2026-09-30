// ReUnite Family/Reporter Portal
// Demo-first frontend. Replace demo calls with authenticated backend endpoints when the API is ready.
(() => {
  const demoCases = [
    {
      id: 'RU-2026-00125', name: 'Rahul Sharma', status: 'Under AI Analysis',
      reported_at: '2026-09-29T10:30:00', last_seen_location: 'Thane',
      updates: [
        { title: 'Report submitted', message: 'Your missing-person report was received.', time: '29 Sep 2026, 10:30 AM', done: true },
        { title: 'Case verified', message: 'The submitted information was verified by the administrator.', time: '29 Sep 2026, 12:10 PM', done: true },
        { title: 'AI analysis', message: 'Authorized camera footage is being analyzed for possible matches.', time: '30 Sep 2026, 09:00 AM', current: true },
        { title: 'Possible match / resolution', message: 'Further updates will be provided by the authorized team.', time: 'Pending', done: false }
      ]
    }
  ];

  let cases = [...demoCases];

  const $ = (id) => document.getElementById(id);

  function showPage(name) {
    document.querySelectorAll('.family-page').forEach((el) => el.classList.remove('active'));
    const target = $(`family-${name}`);
    if (target) target.classList.add('active');
    document.querySelectorAll('[data-family-page]').forEach((el) => {
      el.classList.toggle('active', el.dataset.familyPage === name);
    });
    if (name === 'cases') renderCases();
    if (name === 'updates') renderUpdates();
  }

  function renderCases() {
    const list = $('case-list');
    if (!cases.length) {
      list.innerHTML = '<div class="family-card"><h3>No cases yet</h3><p class="text-muted">Submit a missing-person report to create a case.</p></div>';
      return;
    }
    list.innerHTML = cases.map((item) => `
      <article class="family-card">
        <div class="flex justify-between items-center" style="gap:12px">
          <div><div class="case-id">${escapeHtml(item.id)}</div><h3>${escapeHtml(item.name)}</h3></div>
          <span class="case-status">${escapeHtml(item.status)}</span>
        </div>
        <p class="text-muted">Last seen: ${escapeHtml(item.last_seen_location || 'Not provided')}</p>
        <p class="family-note">Reported: ${formatDate(item.reported_at)}</p>
        <button class="btn btn-primary btn-sm" data-family-action="open-case" data-case-id="${escapeHtml(item.id)}">View Case</button>
      </article>
    `).join('');
  }

  function renderCaseDetail(caseId) {
    const item = cases.find((entry) => entry.id === caseId);
    if (!item) return;
    $('case-detail').innerHTML = `
      <div class="family-grid two">
        <section class="family-card">
          <div class="case-id">${escapeHtml(item.id)}</div>
          <h2>${escapeHtml(item.name)}</h2>
          <span class="case-status">${escapeHtml(item.status)}</span>
          <p><strong>Last seen:</strong> ${escapeHtml(item.last_seen_location || 'Not provided')}</p>
          <p><strong>Reported:</strong> ${formatDate(item.reported_at)}</p>
          <p class="family-note">Sensitive camera locations, face-search results, and investigative evidence are restricted to authorized personnel.</p>
          <button class="btn btn-outline" data-family-page="updates">View Case Updates</button>
        </section>
        <section class="family-card">
          <h3>Case Progress</h3>
          ${(item.updates || []).map((step) => `
            <div class="case-step">
              <span class="step-dot ${step.done ? 'done' : step.current ? 'current' : ''}"></span>
              <div><strong>${escapeHtml(step.title)}</strong><div class="text-muted">${escapeHtml(step.message)}</div><div class="family-note">${escapeHtml(step.time)}</div></div>
            </div>
          `).join('')}
        </section>
      </div>
      <section class="family-card" style="margin-top:16px">
        <h3>Submit Additional Information</h3>
        <form id="additional-info-form" class="family-form" data-case-id="${escapeHtml(item.id)}">
          <div><label>New information</label><textarea name="message" required placeholder="Provide new information that may help the investigating team."></textarea></div>
          <div><label>Supporting file (optional)</label><input type="file" name="attachment" accept="image/*,.pdf,.doc,.docx"></div>
          <button class="btn btn-primary" type="submit">Send Information</button>
        </form>
      </section>
    `;
    showPage('case-detail');
  }

  function renderUpdates() {
    const all = cases.flatMap((item) => (item.updates || []).map((u) => ({ ...u, caseId: item.id, name: item.name })));
    $('updates-list').innerHTML = all.length ? all.map((u) => `
      <div class="update-item"><strong>${escapeHtml(u.title)}</strong><div class="text-muted">${escapeHtml(u.name)} • ${escapeHtml(u.caseId)}</div><div>${escapeHtml(u.message)}</div><div class="family-note">${escapeHtml(u.time)}</div></div>
    `).join('') : '<p class="text-muted">No updates yet.</p>';
  }

  async function submitReport(form) {
    const data = new FormData(form);
    const file = data.get('photo');
    if (!(file instanceof File) || !file.name) {
      alert('Please select a recent photograph.');
      return;
    }

    try {
      if (window.api?.postForm) {
        // This endpoint will be implemented in the ReUnite backend later.
        const result = await window.api.postForm('/family/reports', data);
        if (result?.case_id) {
          cases.unshift({ id: result.case_id, name: data.get('name'), status: 'Submitted', reported_at: new Date().toISOString(), last_seen_location: data.get('last_seen_location'), updates: [{ title: 'Report submitted', message: 'Your report was received.', time: 'Just now', done: true }] });
        }
      } else {
        throw new Error('API unavailable');
      }
      alert('Report submitted successfully. Your case has been created.');
      form.reset();
      showPage('cases');
    } catch (error) {
      // Demo mode keeps the page usable until the family backend endpoints exist.
      const newCase = {
        id: `RU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        name: data.get('name'), status: 'Submitted', reported_at: new Date().toISOString(), last_seen_location: data.get('last_seen_location'),
        updates: [{ title: 'Report submitted', message: 'Demo case created locally. Connect the backend to persist it.', time: 'Just now', done: true }]
      };
      cases.unshift(newCase);
      alert(`Demo report created: ${newCase.id}\nConnect the backend to save real reports.`);
      form.reset();
      showPage('cases');
    }
  }

  async function submitAdditionalInfo(form) {
    const data = new FormData(form);
    const caseId = form.dataset.caseId;
    try {
      if (window.api?.postForm) await window.api.postForm(`/family/cases/${encodeURIComponent(caseId)}/information`, data);
      alert('Information submitted to the case.');
      form.reset();
    } catch (error) {
      alert('Demo mode: information was prepared but is not persisted until the backend endpoint is connected.');
      form.reset();
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  }

  document.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-family-page]');
    if (pageButton) {
      event.preventDefault();
      showPage(pageButton.dataset.familyPage);
      return;
    }
    const action = event.target.closest('[data-family-action]');
    if (!action) return;
    if (action.dataset.familyAction === 'open-case') renderCaseDetail(action.dataset.caseId);
    if (action.dataset.familyAction === 'refresh') renderCases();
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id === 'missing-report-form') { event.preventDefault(); submitReport(event.target); }
    if (event.target.id === 'additional-info-form') { event.preventDefault(); submitAdditionalInfo(event.target); }
  });

  renderCases();
  renderUpdates();
})();
