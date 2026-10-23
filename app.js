(() => {
  'use strict';

  const NAMES = window.BABY_NAMES;
  const RATINGS = ['Like', 'Meh', "Don't like"];
  const EMOJI = { Like: '❤️', Meh: '😐', "Don't like": '❌' };
  const LABEL = { Like: 'Like', Meh: 'Meh', "Don't like": 'Don’t like' };

  // localStorage keys. Ratings look like { "Cleo": "Meh", "Maia": "Like" }.
  const RATINGS_KEY = 'babyNames.ratings';
  const INDEX_KEY = 'babyNames.index';

  const SELECT_DELAY = 220; // ms to show the selected state before moving on
  const SWAP_DELAY = 130;   // ms for the name fade-out

  const $ = (id) => document.getElementById(id);

  let ratings = loadRatings();
  let index = loadIndex();
  let locked = false; // blocks double taps while moving between names
  let filter = 'All';

  // ---------- Storage ----------

  function loadRatings() {
    try {
      const stored = JSON.parse(localStorage.getItem(RATINGS_KEY)) || {};
      const clean = {};
      for (const [name, rating] of Object.entries(stored)) {
        if (RATINGS.includes(rating)) clean[name] = rating;
      }
      return clean;
    } catch {
      return {};
    }
  }

  function loadIndex() {
    const i = Number(localStorage.getItem(INDEX_KEY));
    return Number.isInteger(i) && i >= 0 && i < NAMES.length ? i : 0;
  }

  function save() {
    try {
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
      localStorage.setItem(INDEX_KEY, String(index));
    } catch {
      // Storage unavailable (e.g. some private modes) — the app still works for this visit.
    }
  }

  const ratingOf = (name) => ratings[name];
  const ratedCount = () => NAMES.filter(ratingOf).length;
  const allRated = () => ratedCount() === NAMES.length;
  const firstUnrated = () => Math.max(0, NAMES.findIndex((n) => !ratingOf(n)));
  const countOf = (rating) => NAMES.filter((n) => ratings[n] === rating).length;

  // ---------- Screens ----------

  function show(id) {
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.id !== id; });
    window.scrollTo(0, 0);
  }

  function showStart() {
    const count = ratedCount();
    const started = count > 0;
    $('btn-start').hidden = started;
    $('btn-continue').hidden = !started;
    $('btn-restart').hidden = !started;
    $('start-progress').hidden = !started;
    $('start-progress').textContent = `${count} of ${NAMES.length} rated so far.`;
    show('screen-start');
  }

  function showRate(i) {
    index = i;
    save();
    renderRate();
    show('screen-rate');
  }

  function showDone() {
    $('done-count').textContent = `${ratedCount()} names rated`;
    $('tally-like').textContent = countOf('Like');
    $('tally-meh').textContent = countOf('Meh');
    $('tally-nope').textContent = countOf("Don't like");
    show('screen-done');
  }

  function showReview() {
    filter = 'All';
    renderReview();
    show('screen-review');
  }

  // ---------- Rating ----------

  const nameEl = $('current-name');
  const choiceButtons = document.querySelectorAll('.choice');

  function renderRate() {
    const name = NAMES[index];
    nameEl.textContent = name;
    markChoices(ratingOf(name));
    renderProgress();
    $('btn-back').classList.toggle('is-hidden', index === 0);
    // "Next" only appears on names already rated, e.g. after going back.
    $('btn-fwd').classList.toggle('is-hidden', !ratingOf(name));
  }

  function markChoices(rating) {
    choiceButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rating === rating)));
  }

  function renderProgress() {
    const count = ratedCount();
    $('progress-text').textContent = `${count} of ${NAMES.length}`;
    $('progress-bar').style.width = `${(count / NAMES.length) * 100}%`;
  }

  function rate(rating) {
    if (locked) return;
    locked = true;
    ratings[NAMES[index]] = rating;
    save();
    markChoices(rating);
    renderProgress();
    setTimeout(goForward, SELECT_DELAY);
  }

  function goForward() {
    if (allRated()) {
      locked = false;
      showDone();
    } else if (index + 1 < NAMES.length) {
      swapTo(index + 1);
    } else {
      swapTo(firstUnrated());
    }
  }

  function goBack() {
    if (locked || index === 0) return;
    locked = true;
    swapTo(index - 1);
  }

  function skipForward() {
    if (locked || !ratingOf(NAMES[index])) return;
    locked = true;
    goForward();
  }

  // Quick fade between names, then unlock.
  function swapTo(i) {
    nameEl.classList.add('leaving');
    setTimeout(() => {
      index = i;
      save();
      renderRate();
      nameEl.classList.remove('leaving');
      nameEl.classList.add('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => nameEl.classList.remove('entering')));
      locked = false;
    }, SWAP_DELAY);
  }

  // ---------- Review ----------

  function renderReview() {
    const filters = ['All', ...RATINGS];
    $('filters').innerHTML = filters.map((f) => {
      const label = f === 'All' ? `All ${NAMES.length}` : `${EMOJI[f]} ${LABEL[f]} ${countOf(f)}`;
      return `<button type="button" class="chip" data-filter="${escapeAttr(f)}" aria-pressed="${f === filter}">${label}</button>`;
    }).join('');

    const names = NAMES.filter((n) => filter === 'All' || ratings[n] === filter);
    $('review-list').innerHTML = names.length
      ? names.map(reviewRow).join('')
      : '<li class="empty">No names here.</li>';
  }

  function reviewRow(name) {
    const buttons = RATINGS.map((r) =>
      `<button type="button" data-rating="${escapeAttr(r)}" aria-pressed="${ratings[name] === r}" aria-label="${escapeAttr(LABEL[r])}">${EMOJI[r]}</button>`
    ).join('');
    return `<li class="review-row" data-name="${escapeAttr(name)}">
      <span class="review-name">${escapeHtml(name)}</span>
      <span class="seg" role="group" aria-label="Rating for ${escapeAttr(name)}">${buttons}</span>
    </li>`;
  }

  // Change a rating in place. The row stays visible even if it no longer matches the
  // current filter, so it doesn't vanish from under the user's finger.
  function changeReviewRating(row, rating) {
    ratings[row.dataset.name] = rating;
    save();
    row.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rating === rating)));
    document.querySelectorAll('.chip').forEach((chip) => {
      const f = chip.dataset.filter;
      if (f !== 'All') chip.textContent = `${EMOJI[f]} ${LABEL[f]} ${countOf(f)}`;
    });
  }

  // ---------- Export ----------

  function csvCell(value) {
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }

  function buildCsv() {
    const rows = NAMES.map((n) => `${csvCell(n)},${csvCell(ratings[n] || '')}`);
    return ['Name,Rating', ...rows].join('\r\n') + '\r\n';
  }

  function downloadCsv() {
    // The BOM makes Excel read the file as UTF-8 (matters for accented names).
    const blob = new Blob(['﻿' + buildCsv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'baby-name-ratings.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyResults() {
    const text = NAMES.map((n) => `${n},${ratings[n] || ''}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const btn = $('btn-copy');
    btn.textContent = 'Copied!';
    clearTimeout(copyResults.timer);
    copyResults.timer = setTimeout(() => { btn.textContent = 'Copy results'; }, 1600);
  }

  // ---------- Reset ----------

  function startAgain() {
    if (!confirm('This will delete all of your ratings on this device. Are you sure?')) return;
    ratings = {};
    showRate(0);
  }

  // ---------- Helpers ----------

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const escapeAttr = escapeHtml;

  // ---------- Wiring ----------

  $('btn-start').addEventListener('click', () => showRate(0));
  $('btn-continue').addEventListener('click', () => {
    if (allRated()) showDone();
    else showRate(ratingOf(NAMES[index]) ? firstUnrated() : index);
  });
  $('btn-restart').addEventListener('click', startAgain);
  $('btn-restart-done').addEventListener('click', startAgain);

  choiceButtons.forEach((b) => b.addEventListener('click', () => rate(b.dataset.rating)));
  $('btn-back').addEventListener('click', goBack);
  $('btn-fwd').addEventListener('click', skipForward);

  $('btn-download').addEventListener('click', downloadCsv);
  $('btn-copy').addEventListener('click', copyResults);
  $('btn-review').addEventListener('click', showReview);
  $('btn-review-done').addEventListener('click', () => (allRated() ? showDone() : showRate(firstUnrated())));

  $('filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    filter = chip.dataset.filter;
    renderReview();
  });

  $('review-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-rating]');
    if (btn) changeReviewRating(btn.closest('.review-row'), btn.dataset.rating);
  });

  // Keyboard shortcuts on desktop: 1/2/3 to rate, arrows to move.
  document.addEventListener('keydown', (e) => {
    if ($('screen-rate').hidden || e.metaKey || e.ctrlKey || e.altKey) return;
    const keyRating = { 1: 'Like', 2: 'Meh', 3: "Don't like" }[e.key];
    if (keyRating) rate(keyRating);
    else if (e.key === 'ArrowLeft') goBack();
    else if (e.key === 'ArrowRight') skipForward();
  });

  showStart();
})();
