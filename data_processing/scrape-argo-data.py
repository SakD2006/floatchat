"""
ARGO Float Data Download Script with Date Range Filter
- MODIFIED to exclude the 'profiles/' subdirectory.
"""

import os
import time
import argparse
import requests
import shutil
from urllib.parse import urljoin, urlparse
from pathlib import Path
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime


class ArgoDownloader:
    def __init__(self, base_url: str, download_dir: str = "downloads",
                 delay: float = 0.5, max_retries: int = 3,
                 start_date: str = None, end_date: str = None,
                 workers: int = 8):
        self.base_url = base_url.rstrip("/") + "/"
        self.download_dir = Path(download_dir)
        self.delay = delay
        self.max_retries = max_retries
        self.workers = workers

        # parse start and end date
        self.start_date = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        self.end_date = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None

        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (compatible; ArgoDownloader/1.0)"
        })

        self.download_dir.mkdir(parents=True, exist_ok=True)

    def get_links_with_dates(self, url: str):
        """Fetch links and their 'Last Modified' timestamps from Apache index page."""
        try:
            resp = self.session.get(url, timeout=30)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            results = []
            rows = soup.find_all("tr")
            for row in rows:
                cols = row.find_all("td")
                if len(cols) >= 2:
                    a = cols[1].find("a") or cols[0].find("a")
                    if not a or "href" not in a.attrs:
                        continue
                    href = a["href"]
                    if href in ("../", "./") or href.startswith("#"):
                        continue
                    lastmod = cols[2].get_text(strip=True) if len(cols) > 2 else ""
                    results.append((urljoin(url, href), lastmod))
            return results
        except requests.RequestException as e:
            print(f"[ERROR] Could not fetch {url}: {e}")
            return []

    def parse_date(self, lastmod: str):
        """Extract datetime from 'Last Modified' string like '2025-09-13 12:45'."""
        try:
            return datetime.strptime(lastmod, "%Y-%m-%d %H:%M")
        except Exception:
            return None

    def download_file(self, url: str, local_path: Path):
        """Download a single file with retries."""
        local_path.parent.mkdir(parents=True, exist_ok=True)

        for attempt in range(self.max_retries + 1):
            try:
                if local_path.exists():
                    return f"[SKIP] {local_path}"

                with self.session.get(url, stream=True, timeout=60) as r:
                    if r.status_code == 200:
                        with open(local_path, "wb") as f:
                            for chunk in r.iter_content(chunk_size=65536):  # 64KB chunks
                                if chunk:
                                    f.write(chunk)
                        return f"[OK] {local_path}"
                    else:
                        return f"[ERROR] HTTP {r.status_code} for {url}"

            except requests.RequestException as e:
                if attempt < self.max_retries:
                    time.sleep(2 ** attempt)
                else:
                    return f"[FAIL] Could not download {url}: {e}"

    def save_nc(self, file_url: str):
        """Helper: save .nc file preserving directory structure."""
        parsed = urlparse(file_url)
        rel_path = os.path.relpath(parsed.path, start=urlparse(self.base_url).path)
        local_path = self.download_dir / rel_path
        result = self.download_file(file_url, local_path)
        if self.delay > 0:
            time.sleep(self.delay)
        return result

    def download_all(self):
        """Download root .nc files from float directories last modified in the specified date range."""
        print(f"[START] {self.base_url}")
        print(f"[SAVE TO] {self.download_dir.absolute()}")

        num_dirs = [(link, self.parse_date(lastmod))
                    for link, lastmod in self.get_links_with_dates(self.base_url)
                    if link.rstrip("/").split("/")[-1].isdigit()]

        for num_dir, dt in num_dirs:
            folder_name = num_dir.rstrip("/").split("/")[-1]

            if not dt:
                print(f"[SKIP] {folder_name} (no date)")
                continue

            if (self.start_date and dt < self.start_date) or (self.end_date and dt > self.end_date):
                print(f"[SKIP] {folder_name} (last modified {dt})")
                continue

            print(f"\n[DIR] {num_dir} (last modified {dt})")

            links = [l for l, _ in self.get_links_with_dates(num_dir)]
            
            # <<< MODIFICATION IS HERE >>>
            # Find only .nc files directly within this directory, ignoring subdirectories.
            nc_files = [link for link in links if link.endswith(".nc")]

            with ThreadPoolExecutor(max_workers=self.workers) as executor:
                futures = {executor.submit(self.save_nc, url): url for url in nc_files}
                for future in as_completed(futures):
                    print(future.result())

        print("\n[COMPLETE] All downloads finished.")


def main():
    parser = argparse.ArgumentParser(description="Download Argo INCOIS .nc files (filtered by date range, parallel)")
    parser.add_argument("url", help="Base URL of incois directory")
    parser.add_argument("-d", "--dir", default="downloads", help="Local directory (default: downloads)")
    parser.add_argument("--delay", type=float, default=0.0, help="Delay between downloads (default: 0s)")
    parser.add_argument("--retries", type=int, default=3, help="Max retries per file (default: 3)")
    parser.add_argument("--start", type=str, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", type=str, help="End date (YYYY-MM-DD)")
    parser.add_argument("-w", "--workers", type=int, default=8, help="Number of parallel downloads (default: 8)")
    args = parser.parse_args()

    downloader = ArgoDownloader(args.url, args.dir, args.delay, args.retries,
                                args.start, args.end, args.workers)
    downloader.download_all()


if __name__ == "__main__":
    if len(os.sys.argv) == 1:
        # default: INCOIS, last modified between 10–14 Sept 2025
        url = "https://data-argo.ifremer.fr/dac/incois/?C=M;O=A"
        downloader = ArgoDownloader(url, "argo_data",
                                    delay=0, max_retries=4,
                                    start_date="2025-09-1", end_date="2025-09-15",
                                    workers=8)
        downloader.download_all()
    else:
        main()