// Enca Insurance — small helpers for the open enrollment dates and the quote form.
(() => {
  // ----- Open enrollment timeline -----
  // Marks dates that have passed, highlights the next deadline,
  // and hides the whole band outside the enrollment period.
  const band = document.querySelector('[data-enrollment]');
  if (band) {
    const steps = [...band.querySelectorAll('.timeline-step')];
    const parse = (s) => {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = steps.map((li) => parse(li.dataset.date));
    const first = dates[0];
    const last = dates[dates.length - 1];

    if (today < first || today > last) {
      band.hidden = true;
    } else {
      let next = null;
      steps.forEach((li, i) => {
        // The first step is a start date: it counts as done from that day on.
        const done = i === 0 ? dates[i] <= today : dates[i] < today;
        if (done) li.classList.add('is-past');
        else if (!next) next = li;
      });
      if (next) {
        next.classList.add('is-next');
        const badge = document.createElement('span');
        badge.className = 'next-badge';
        badge.textContent = band.querySelector('.timeline').dataset.nextLabel;
        next.querySelector('.timeline-date').append(badge);
      }
    }
  }

  // ----- Links that pre-select the type of insurance in the form -----
  const typeSelect = document.querySelector('select[name="insurance_type"]');
  document.querySelectorAll('a[data-type]').forEach((a) => {
    a.addEventListener('click', () => {
      if (typeSelect) typeSelect.value = a.dataset.type;
    });
  });

  // ----- Quote form -----
  const form = document.querySelector('.quote-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const setStatus = (text, kind = '') => {
    status.textContent = text;
    status.className = `form-status${kind ? ` is-${kind}` : ''}`;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.querySelector('.hp').checked) return; // spam bot

    const data = Object.fromEntries(new FormData(form));
    delete data.botcheck;
    Object.keys(data).forEach((k) => { if (typeof data[k] === 'string') data[k] = data[k].trim(); if (data[k] === '') delete data[k]; });
    const subject = `New quote request: ${data.insurance_type} (${data.preferred_language})`;
    const key = form.dataset.key;

    // No form service connected yet: open the visitor's email app instead.
    if (!key) {
      const body = [
        `Name: ${data.name || ''}`,
        `Phone: ${data.phone || ''}`,
        `Email: ${data.email || '-'}`,
        `Insurance: ${data.insurance_type}`,
        `Preferred language: ${data.preferred_language}`,
        '',
        data.message || '',
      ].join('\n');
      window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus(form.dataset.mailtoNote);
      return;
    }

    button.disabled = true;
    setStatus(form.dataset.sending);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          access_key: key,
          subject,
          from_name: 'Enca Insurance website',
          website_language: form.dataset.lang === 'es' ? 'Spanish page' : 'English page',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || String(res.status));
      form.reset();
      setStatus(form.dataset.success, 'success');
    } catch (err) {
      setStatus(form.dataset.error, 'error');
    } finally {
      button.disabled = false;
    }
  });
})();
