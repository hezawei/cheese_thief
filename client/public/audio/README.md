# 游戏音频文件

将以下音频文件放到此目录 (`client/public/audio/`)。

## BGM (背景音乐) - MP3格式，建议 < 1MB

| 文件名 | 用途 | 搜索链接 |
|--------|------|----------|
| `bgm-lobby.mp3` | 大厅等待（轻松卡通） | [Pixabay: cute game loop](https://pixabay.com/music/search/cute%20game%20loop/) |
| `bgm-night.mp3` | 夜晚阶段（神秘悬疑） | [Pixabay: mystery loop](https://pixabay.com/music/search/mystery%20loop/) |
| `bgm-day.mp3` | 白天讨论（紧张活跃） | [Pixabay: tense discussion](https://pixabay.com/music/search/tense%20discussion/) |
| `bgm-vote.mp3` | 投票阶段（倒计时紧迫） | [Pixabay: countdown tension](https://pixabay.com/music/search/countdown%20tension/) |
| `bgm-result.mp3` | 结算画面（揭晓胜利） | [Pixabay: victory fanfare](https://pixabay.com/music/search/victory%20fanfare/) |

## SFX (音效) - MP3格式，建议 < 100KB

| 文件名 | 用途 | 搜索链接 |
|--------|------|----------|
| `sfx-transition.mp3` | 阶段切换 | [Pixabay: whoosh](https://pixabay.com/sound-effects/search/whoosh/) |
| `sfx-steal.mp3` | 偷奶酪 | [Pixabay: sneak cartoon](https://pixabay.com/sound-effects/search/sneak%20cartoon/) |
| `sfx-dice-reveal.mp3` | 骰盅揭开 | [Pixabay: reveal sparkle](https://pixabay.com/sound-effects/search/reveal%20sparkle/) |
| `sfx-vote.mp3` | 投票确认 | [Pixabay: confirm ui](https://pixabay.com/sound-effects/search/confirm%20ui/) |
| `sfx-tick.mp3` | 倒计时滴答 | [Pixabay: tick](https://pixabay.com/sound-effects/search/tick/) |
| `sfx-victory.mp3` | 胜利欢呼 | [Pixabay: victory](https://pixabay.com/sound-effects/search/victory%20game/) |
| `sfx-click.mp3` | 按钮点击 | [Pixabay: click ui](https://pixabay.com/sound-effects/search/click%20ui/) |
| `sfx-warning.mp3` | 最后几秒警告 | [Pixabay: warning beep](https://pixabay.com/sound-effects/search/warning%20beep/) |

## 下载步骤

1. 点击上方搜索链接，在 Pixabay 中试听
2. 选择合适的音频，点击 **Free Download** 按钮
3. 下载 MP3 格式
4. 重命名为上表中的文件名
5. 放入 `client/public/audio/` 目录

## 注意事项
- 所有文件必须是 **MP3** 格式
- BGM 应该可以无缝循环（选带 "loop" 标签的）
- 缺少的文件会被自动跳过，**不会导致报错**
- Pixabay 所有音频完全免费，无需署名
