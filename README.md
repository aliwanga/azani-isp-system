# AZANI ISP SYSTEM

An internet service provider (ISP) management website built with HTML, CSS and JavaScript for the KCSE Computer Studies Paper 3 (Project).

## Features
- Register, search, filter, sort and delete customers
- Four internet packages with automatic monthly billing
- Mark payments Paid/Unpaid and Suspend/Activate connections with one click
- Live dashboard: total customers, active connections, revenue collected, outstanding balance
- Package distribution chart
- Input validation (required fields, Kenyan phone numbers, unique account numbers)
- Export customers to CSV (opens in Excel)
- Light and dark mode
- Responsive design for phones, tablets and computers
- Data saved in the browser using localStorage

## Files
| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `style.css` | Styling, themes and responsive layout |
| `script.js` | Logic, validation and storage |
| `manifest.webmanifest` | App name, colours and icons |
| `sw.js` | Offline support (service worker) |
| `icons/` | App icons |

## Install as an app (PWA)
Once the site is live on GitHub Pages (HTTPS), open it in Chrome or Edge:
- **Computer:** click the **Install App** button (or the install icon in the address bar).
- **Android:** Chrome menu > **Install app** / **Add to Home screen**.
- **iPhone:** Safari > Share > **Add to Home Screen**.

The app then opens in its own window and works offline. Note: installing needs the site served over HTTPS (GitHub Pages) or localhost, not by double-clicking `index.html`.

## Run locally
Open `index.html` in any browser. No installation needed.

## Publish on GitHub Pages
1. Create a new repository on GitHub (e.g. `azani-isp-system`).
2. Upload all files and the `icons` folder.
3. Go to **Settings > Pages**.
4. Under **Branch**, choose `main` and `/ (root)`, then **Save**.
5. Your site will be live at `https://<your-username>.github.io/azani-isp-system/`.

---
&copy; 2026 ACPS HUB. All rights reserved.
Developed by Allan.
Building smart solutions for better communities through technology and innovation.
