# 宣传片源（v2，跟官网同一套 UI）

上一版 `out/hydwind_intro.mp4` 是 11 月 3 日按"深色渐变 + 大标题"自己搭的风格，
和官网改版后的界面完全不是一套东西。这版改成**直接用官网的样式表渲染**：

- `film/index.html` 里的 `<link>` 指向 `../hydwind-web/src/styles/` 的
  `md3-tokens.css`、`fonts.css`、`base.css`——颜色、字体、圆角、间距、缓动全部是官网 token。
- 中文是官网自托管的 MiSans 子集，拉丁与数字是 Rubik，缺字才回落到 Noto Sans SC。
- 画面里的官网页面不是渲染图，是真正截下来的当前站点（`assets/shots/`）。

一句话：官网换了风格，这里换 `assets/shots/` 和 token 就是同一套；片子不会"过期"得那么快。

## 现在这版成片

| 项 | 值 |
| --- | --- |
| 文件 | `out/hydwind_promo_15s_v2.mp4` |
| 规格 | 1920×1080 · 30fps · H.264 + AAC · 15.0 秒 · 约 1.7 MB |
| 封面 | `out/cover_v2.png`（取自成片 14 秒处尾卡） |
| 声音 | `../out/bed.wav`，压到 -19dB，首尾各做淡入淡出 |

## 时间轴（`film.js` 里的 `scenes`）

| 时间 | 画面 | 内容 |
| --- | --- | --- |
| 0.0–3.0 | 片头 | 氢风 Hydwind + tagline + 地址 |
| 3.0–6.2 | 官网首页 | 左栏文案「这里还没有人」，右栏真实截图缓推 |
| 6.2–9.6 | 事实清单 | 四行 list-rows：原版就能进 / 免正版验证 / 暂时免费 / 测试筹备中 |
| 9.6–12.4 | 进服页 | 左栏「四步就能进来」，右栏真实截图减速 |
| 12.4–15.0 | 尾卡 | 地址 + 群号 + 一句收尾，**不淡出**，停到最后一帧 |

尾卡不淡出是有意的：截图的人要截得到地址，最后 2 秒画面必须静止可读。

## 重新出片

```bash
cd hydwind-promo
# 1) 先确认官网是最新的，并且 dist 能起来（film 用的是 src/styles，不依赖 dist）
# 2) 抓当前官网截图（换风格后必须重抓，否则画面又对不上）
#    gun 见 film/capture.mjs（先起 preview，再跑），输出 assets/shots/
# 3) 逐帧渲染
node film/render.mjs 30 15        # fps duration，输出 out/frames/f%05d.png
# 4) 编码
FF=$(/root/.local/share/uv/tools/astrbot/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FF" -y -framerate 30 -i out/frames/f%05d.png -i ../out/bed.wav \
  -filter_complex "[1:a]volume=-19dB,afade=t=in:st=0:d=0.9,afade=t=out:st=13.5:d=1.5,apad[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -t 15 -movflags +faststart out/hydwind_promo_15s_v2.mp4
```

`film/capture.mjs` 抓当前站点截图（需要官网 preview 在 4331 跑着）；
`film/render.mjs` 自己起一个 4335 端口的静态服务，把 `/styles/` 指到官网源码、
`/fonts/` 指到官网自托管字体、`/shots/` 指到 `assets/shots/`，渲染完自己关掉。

布局自检（文字溢出、字体、每屏内容）用 `node film/verify.mjs`。

## 改片子

- 改文案：`film/index.html` 里的中文；改完跑一遍 `verify.mjs` 看有没有溢出。
- 改节奏：`film.js` 顶部 `scenes` 的 start/end，和每段 `rise()` 的起止秒数。
- 想加一段：复制一个 `<section class="scene">`，在 `scenes` 里登记，再在 `render()` 里写它的动画。
- 做 30 秒版：片头后面加一场"这是什么"（MoJang/版本/人数都不要编，只说官网写了的），
  后面接现在这五场；《04-video-script.md》里有 30 秒版的分镜参考。

## 不要动的地方

- 别把 `film/index.html` 的样式改成写死的色值——它现在能跟官网同步，全靠只引用 token。
- 别在尾卡前面塞"人多热闹"的画面，没有这种素材，也不该造。
