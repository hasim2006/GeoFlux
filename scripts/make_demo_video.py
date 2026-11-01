import os
import subprocess
import imageio_ffmpeg

ffmpeg_bin = imageio_ffmpeg.get_ffmpeg_exe()
os.makedirs("assets", exist_ok=True)

beats = [
    ("assets/preview/01_logo_reveal.png", 1.1),
    ("assets/preview/02_navigation_dive.png", 2.0),
    ("assets/preview/03_get_a_bike.png", 2.3),
    ("assets/preview/04_rain_ahead.png", 3.4),
    ("assets/preview/05_galerie_vivienne.png", 1.9),
    ("assets/preview/06_meet_friends.png", 2.6),
    ("assets/preview/07_golden_hour.png", 3.4),
    ("assets/preview/08_arrival_reveal.png", 2.1),
    ("assets/preview/09_brand_lockup.png", 1.5),
    ("assets/preview/10_end_card.png", 1.7)
]

concat_file = "concat_list.txt"
with open(concat_file, "w", encoding="utf-8") as f:
    for img, dur in beats:
        abs_p = os.path.abspath(img).replace("\\", "/")
        f.write(f"file '{abs_p}'\nduration {dur}\n")
    last_p = os.path.abspath(beats[-1][0]).replace("\\", "/")
    f.write(f"file '{last_p}'\n")

out_mp4 = "assets/geoflux_demo.mp4"
cmd_mp4 = [
    ffmpeg_bin, "-y",
    "-f", "concat", "-safe", "0", "-i", concat_file,
    "-i", "spec_audio.wav",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "20",
    "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    "-shortest",
    out_mp4
]
subprocess.run(cmd_mp4, check=True)
print("MP4 generated successfully! Size:", os.path.getsize(out_mp4), "bytes")

out_gif = "assets/geoflux_preview.gif"
cmd_gif = [
    ffmpeg_bin, "-y",
    "-i", out_mp4,
    "-vf", "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer",
    out_gif
]
subprocess.run(cmd_gif, check=True)
print("GIF generated successfully! Size:", os.path.getsize(out_gif), "bytes")

if os.path.exists(concat_file):
    os.remove(concat_file)
