# Baby Names

A tiny static web app for rating a list of baby names one at a time — currently ✅ Yes or ❌ No — then exporting the results as a CSV.

Plain HTML, CSS and JavaScript. No build step, no backend, no tracking.

## Running locally

Open `index.html` in a browser. That's it.

If you'd rather use a local server (closer to how GitHub Pages serves it):

```bash
python3 -m http.server 8000
```

then visit <http://localhost:8000>.

## Rounds

- **Round 1** rated 87 names as Like, Meh or Don't like.
- **Round 2** has the 35 names that neither of us rated Don't like, rated as Love, Like or Meh.
- **Round 3** (current) has the 13 names we both rated Love or Like in round 2 — both love (3), one loves and one likes (5), both like (5) — shown as the full name, e.g. *Zadie* with *Guppy-Segal* underneath, and answered Yes or No.

## Editing names

The list lives in **`names.js`** — one name per line:

```js
window.BABY_NAMES = [
  'Mira',
  'Zadie',
  // ...
];

window.BABY_SURNAME = 'Guppy-Segal';
```

Add, remove or reorder lines as you like. The order here is the order names are shown and exported. Ratings are saved by name, so existing ratings survive edits to the list; renaming an entry means that name needs rating again.

## Updating the site

Browsers and GitHub Pages cache `style.css`, `names.js` and `app.js` for a few minutes. `index.html` loads them with a version suffix (`?v=3`). Bump that number whenever you change any of them, so a phone never mixes a new page with old scripts.

## Results

Each round's ratings are kept in [`data/`](data/README.md) as one CSV per round, with Jack's and Floss's answers side by side.

**`results.html`** compares the two of you across every round so far: what you both love, where you disagree, how ratings moved between rounds and how round 1 was cut. It's a standalone page with the ratings written into it, so it doesn't read the CSVs.

## Storage

Ratings are saved in the browser's `localStorage` (round 3 uses keys `babyNames.round3.ratings` and `babyNames.round3.index`; earlier rounds' keys are left untouched). They stay on that device and in that browser only — nothing is sent anywhere. Rating on your phone and then opening the site on your laptop starts fresh. Clearing site data, or using "Start again", deletes them.

## Export

When every name is rated, the completion screen offers:

- **Download CSV** — saves `baby-name-ratings-round-2.csv` with `Name,Rating` columns, in the list's original order. Values are always `Love`, `Like` or `Meh`. Opens cleanly in Excel, Numbers and Google Sheets.
- **Copy results** — copies the same `Name,Rating` lines (without the header) to the clipboard, ready to paste into a message.
- **Review ratings** — see and change any answer; exports always use the latest answers.

## Deployment (GitHub Pages)

1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://<username>.github.io/<repo-name>/`.

All paths are relative, so it works from a project sub-path like that without changes.
