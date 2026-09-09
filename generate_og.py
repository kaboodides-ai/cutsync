from PIL import Image, ImageDraw, ImageFont, ImageFilter
from bidi.algorithm import get_display

def create_og_banner():
    width = 1200
    height = 630
    
    # 1. Base Dark Background
    img = Image.new("RGBA", (width, height), (10, 14, 26, 255))
    
    # Rich glows
    bg_glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_glow)
    
    # Purple glow top-right
    for r in range(400, 0, -10):
        alpha = int(55 * (1 - r / 400))
        bg_draw.ellipse(
            (width - 350 - r, 80 - r, width - 350 + r, 80 + r),
            fill=(147, 51, 234, alpha)
        )

    # Indigo glow bottom-left
    for r in range(450, 0, -10):
        alpha = int(45 * (1 - r / 450))
        bg_draw.ellipse(
            (250 - r, height - 100 - r, 250 + r, height - 100 + r),
            fill=(79, 70, 229, alpha)
        )

    # Emerald soft glow bottom-right
    for r in range(250, 0, -10):
        alpha = int(30 * (1 - r / 250))
        bg_draw.ellipse(
            (width - 150 - r, height - 120 - r, width - 150 + r, height - 120 + r),
            fill=(16, 185, 129, alpha)
        )

    bg_glow = bg_glow.filter(ImageFilter.GaussianBlur(35))
    img = Image.alpha_composite(img, bg_glow)
    
    draw = ImageDraw.Draw(img)
    
    # Fonts
    font_path_bold = "C:/Windows/Fonts/segoeuib.ttf"
    font_path_reg = "C:/Windows/Fonts/segoeui.ttf"
    
    font_logo = ImageFont.truetype(font_path_bold, 38)
    font_title = ImageFont.truetype(font_path_bold, 50)
    font_subtitle = ImageFont.truetype(font_path_bold, 30)
    font_desc = ImageFont.truetype(font_path_bold, 21)
    font_badge = ImageFont.truetype(font_path_bold, 15)
    font_card_title = ImageFont.truetype(font_path_bold, 18)
    font_card_sub = ImageFont.truetype(font_path_reg, 14)
    font_footer = ImageFont.truetype(font_path_bold, 15)

    # ── 1. Header ──
    # Logo Box
    logo_x = width - 80 - 54
    logo_y = 48
    draw.rounded_rectangle([logo_x, logo_y, logo_x + 54, logo_y + 54], radius=16, fill=(139, 92, 246, 250), outline=(192, 132, 252, 200), width=2)
    
    # Scissors icon
    draw.ellipse([logo_x + 12, logo_y + 12, logo_x + 24, logo_y + 24], outline=(255, 255, 255, 255), width=3)
    draw.ellipse([logo_x + 12, logo_y + 30, logo_x + 24, logo_y + 42], outline=(255, 255, 255, 255), width=3)
    draw.line([logo_x + 22, logo_y + 18, logo_x + 42, logo_y + 36], fill=(255, 255, 255, 255), width=3)
    draw.line([logo_x + 22, logo_y + 36, logo_x + 42, logo_y + 18], fill=(255, 255, 255, 255), width=3)

    # Brand text "CutSync"
    draw.text((logo_x - 165, logo_y + 6), "CutSync", font=font_logo, fill=(255, 255, 255, 255))
    
    # Creator Badge: "by kaboodi"
    badge_w = 145
    badge_h = 34
    badge_x = logo_x - 180 - badge_w
    badge_y = logo_y + 10
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=10, fill=(139, 92, 246, 45), outline=(168, 85, 247, 120), width=1)
    
    c_hebrew = get_display("נוצר ע״י")
    draw.text((badge_x + badge_w - 60, badge_y + 6), c_hebrew, font=font_badge, fill=(216, 180, 254, 255))
    draw.text((badge_x + 14, badge_y + 6), "kaboodi", font=font_badge, fill=(255, 255, 255, 255))

    # Left Pill: "הפלטפורמה הישראלית לעורכי וידאו"
    israel_text = get_display("פלטפורמת ביקורת הווידאו של ישראל")
    ibox = font_badge.getbbox(israel_text)
    ibadge_w = (ibox[2] - ibox[0]) + 38
    draw.rounded_rectangle([80, logo_y + 10, 80 + ibadge_w, logo_y + 10 + badge_h], radius=999, fill=(16, 185, 129, 35), outline=(16, 185, 129, 110), width=1)
    # Green pulse dot
    draw.ellipse([94, logo_y + 22, 102, logo_y + 30], fill=(52, 211, 153, 255))
    draw.text((114, logo_y + 16), israel_text, font=font_badge, fill=(110, 231, 183, 255))

    # ── 2. Main Headlines ──
    h1 = get_display("להפסיק להתווכח בוואטסאפ על תיקוני וידאו.")
    h2 = get_display("סבבי תיקונים מדויקים ישירות על הפריים!")
    desc_text = get_display("שולחים קישור ללקוח, הוא מצייר ומסמן על השנייה — והכל מיוצא ישר לפרמייר!")
    
    draw.text((width - 80 - font_title.getbbox(h1)[2], 155), h1, font=font_title, fill=(255, 255, 255, 255))
    draw.text((width - 80 - font_subtitle.getbbox(h2)[2], 228), h2, font=font_subtitle, fill=(192, 132, 252, 255))
    draw.text((width - 80 - font_desc.getbbox(desc_text)[2], 282), desc_text, font=font_desc, fill=(226, 232, 240, 255))

    # ── 3. Feature Cards (RTL Order) ──
    cards = [
      ("ציור והערות על הפריים", "חצים, סימונים והקלטות קוליות", (168, 85, 247)),
      ("ייצוא ישיר לפרמייר פרו", "מרקרים מדויקים לציר הזמן", (99, 102, 241)),
      ("בלי הודעות קוליות בוואטסאפ", "סבבי תיקונים מסודרים בקליק", (16, 185, 129)),
    ]

    card_w = 325
    card_h = 115
    total_w = len(cards) * card_w + (len(cards) - 1) * 22
    start_x = (width - total_w) // 2
    card_y = 360

    for i, (title_str, sub_str, accent_color) in enumerate(cards):
        cx = start_x + (len(cards) - 1 - i) * (card_w + 22)
        
        # Glassmorphism Card
        draw.rounded_rectangle([cx, card_y, cx + card_w, card_y + card_h], radius=20, fill=(19, 25, 44, 235), outline=(45, 58, 88, 220), width=1)
        
        # Accent top bar
        draw.rounded_rectangle([cx + 25, card_y, cx + card_w - 25, card_y + 3], radius=2, fill=accent_color)

        # Pip indicator
        draw.ellipse([cx + card_w - 32, card_y + 26, cx + card_w - 22, card_y + 36], fill=accent_color)
        
        t_disp = get_display(title_str)
        s_disp = get_display(sub_str)
        
        tx = cx + card_w - 44 - font_card_title.getbbox(t_disp)[2]
        draw.text((tx, card_y + 20), t_disp, font=font_card_title, fill=(255, 255, 255, 255))
        
        sx = cx + card_w - 20 - font_card_sub.getbbox(s_disp)[2]
        draw.text((sx, card_y + 58), s_disp, font=font_card_sub, fill=(148, 163, 184, 255))

    # ── 4. Bottom Footer Bar ──
    draw.line([(80, height - 60), (width - 80, height - 60)], fill=(255, 255, 255, 25), width=1)
    
    domain_text = "cutsync.vercel.app"
    draw.text((80, height - 44), domain_text, font=font_footer, fill=(192, 132, 252, 255))
    
    f_left = "CutSync  |  by kaboodi"
    draw.text((width - 80 - font_footer.getbbox(f_left)[2], height - 44), f_left, font=font_footer, fill=(148, 163, 184, 255))
    
    f_sub = get_display("מערכת סבבי תיקונים לווידאו —")
    draw.text((width - 80 - font_footer.getbbox(f_left)[2] - font_footer.getbbox(f_sub)[2] - 8, height - 44), f_sub, font=font_footer, fill=(100, 116, 139, 255))

    # Save to public
    rgb_img = img.convert("RGB")
    rgb_img.save("e:/first project/public/og-image.jpg", quality=95)
    rgb_img.save("e:/first project/public/og-image.png")
    print("V3 clean Israeli OG Banner generated!")

if __name__ == "__main__":
    create_og_banner()

