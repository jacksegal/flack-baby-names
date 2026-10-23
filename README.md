# Baby Names

A tiny static web app for rating a list of baby names one at a time — ❤️ Like, 😐 Meh or ❌ Don't like — then exporting the results as a CSV.

Plain HTML, CSS and JavaScript. No build step, no backend, no tracking.

## Running locally

Open `index.html` in a browser. That's it.

If you'd rather use a local server (closer to how GitHub Pages serves it):

```bash
python3 -m http.server 8000
```

then visit <http://localhost:8000>.

## Editing names

The list lives in **`names.js`** — one name per line:

```js
window.BABY_NAMES = [
  'Cleo',
  'Maia',
  // ...
];
```

Add, remove or reorder lines as you like. The order here is the order names are shown and exported. Ratings are saved by name, so existing ratings survive edits to the list; renaming an entry means that name needs rating again.

## Storage

Ratings are saved in the browser's `localStorage` (keys `babyNames.ratings` and `babyNames.index`). They stay on that device and in that browser only — nothing is sent anywhere. Rating on your phone and then opening the site on your laptop starts fresh. Clearing site data, or using "Start again", deletes them.

## Export

When every name is rated, the completion screen offers:

- **Download CSV** — saves `baby-name-ratings.csv` with `Name,Rating` columns, in the list's original order. Values are always `Like`, `Meh` or `Don't like`. Opens cleanly in Excel, Numbers and Google Sheets.
- **Copy results** — copies the same `Name,Rating` lines (without the header) to the clipboard, ready to paste into a message.
- **Review ratings** — see and change any answer; exports always use the latest answers.

## Deployment (GitHub Pages)

1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://<username>.github.io/<repo-name>/`.

All paths are relative, so it works from a project sub-path like that without changes.
