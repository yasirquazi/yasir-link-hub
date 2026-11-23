import sys, glob, os
from playwright.sync_api import sync_playwright
files = sorted(glob.glob('/home/claude/art/maps/*.html'))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = b.new_page(viewport={'width':1024,'height':1024})
    for fn in files:
        pg.goto('file://'+fn); pg.wait_for_timeout(150)
        pg.screenshot(path=fn.replace('.html','.png'), omit_background=fn.endswith('-c.html'))
    b.close()
print(len(files))
