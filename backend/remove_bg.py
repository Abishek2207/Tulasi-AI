import os
import glob
from PIL import Image

def get_latest_image():
    base_dir = r"C:\Users\Admin\.gemini\antigravity"
    files = []
    for ext in ("*.webp", "*.jpeg", "*.jpg", "*.png"):
        files.extend(glob.glob(os.path.join(base_dir, "**", ext), recursive=True))
    if not files:
        print("No images found.")
        return None
    latest = max(files, key=os.path.getmtime)
    print(f"Latest image: {latest}")
    return latest

def remove_white_bg(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is white or near white
        # The logo is blue/green/purple leaves. 
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0)) # Fully transparent
        elif item[0] > 210 and item[1] > 210 and item[2] > 210:
            # Soft edge
            avg = (item[0] + item[1] + item[2]) / 3
            alpha = int(255 - ((avg - 210) / 20) * 255)
            alpha = max(0, min(255, alpha))
            newData.append((item[0], item[1], item[2], alpha))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Crop empty space
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "PNG")
    print(f"Saved cleaned logo to {out_path}")

if __name__ == "__main__":
    latest_img = get_latest_image()
    if latest_img:
        out_path = r"c:\Users\Admin\Downloads\Desktop\Project\TulasiAI\frontend\public\images\logo-transparent.png"
        remove_white_bg(latest_img, out_path)
