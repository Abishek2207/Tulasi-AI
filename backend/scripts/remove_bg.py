import os
import glob
try:
    from PIL import Image
except ImportError:
    print("Error: Pillow library is not installed. Run 'pip install Pillow'")
    Image = None

def get_latest_image():
    # Priority 1: Specific logo in frontend
    script_dir = os.path.dirname(os.path.abspath(__file__))
    logo_path = os.path.abspath(os.path.join(script_dir, "..", "frontend", "public", "images", "logo.jpg"))
    if os.path.exists(logo_path):
        print(f"Found logo at: {logo_path}")
        return logo_path

    # Priority 2: Artifacts or temp location
    base_dirs = [
        os.path.join(os.path.expanduser("~"), ".gemini", "antigravity"),
        os.path.dirname(os.path.abspath(__file__))
    ]
    
    files = []
    for base_dir in base_dirs:
        if os.path.exists(base_dir):
            for ext in ("*.webp", "*.jpeg", "*.jpg", "*.png"):
                files.extend(glob.glob(os.path.join(base_dir, "**", ext), recursive=True))
    
    if not files:
        print("No images found for processing.")
        return None
        
    latest = max(files, key=os.path.getmtime)
    print(f"Latest image found: {latest}")
    return latest

def remove_white_bg(img_path, out_path):
    if Image is None:
        print("Error: Image logic cannot run without Pillow.")
        return
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
    if Image is None:
        exit(1)
    latest_img = get_latest_image()
    if latest_img:
        # Resolve path relative to script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        out_path = os.path.abspath(os.path.join(script_dir, "..", "frontend", "public", "images", "logo-transparent.png"))
        remove_white_bg(latest_img, out_path)
