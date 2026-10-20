# Lays rendered frames out as a contact sheet: python3 sheet.py out.png cols width file...
import sys
from PIL import Image
out, cols, width, files = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]
w = (width - 20 * (cols + 1)) // cols
ims = [i.resize((w, int(i.height * w / i.width)), Image.LANCZOS) for i in ims]
h = max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (width, rows * (h + 20) + 20), (11, 8, 7))
for k, im in enumerate(ims): sheet.paste(im, (20 + (k % cols) * (w + 20), 20 + (k // cols) * (h + 20)))
sheet.save(out)
