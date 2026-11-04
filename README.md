# hydwind-promo

氢风（Hydwind）Minecraft 生存服的宣传文案。

写这些字的原因很直接：**服务器没人。** 所以这里不写"我们服务器多好"，
写"为什么现在进来"——因为现在它是空的，而空是有限的。

## 目录

```text
hydwind-promo/
├── source/notes.md        # 素材堆：唯一的事实来源，改文案先改这里
├── copy/
│   ├── 01-short.md        # 一句话 / 群公告 / 签名档
│   ├── 02-social.md       # 空间 / 朋友圈 / 群发
│   ├── 03-long.md         # 长版：给还在犹豫的人
│   └── 04-video-script.md # 宣传片 15s / 30s 脚本
├── docs/SKILLS.md         # 用了 mattpocock/skills 的哪几套、怎么用的
├── JOURNAL.md             # 日记：每次干了什么
└── HANDOFF.md             # 交接：现在到哪一步
```

## 规矩

1. **事实只从 `source/notes.md` 取。** 文案里出现的地址、版本、群号、收费，
   都能在 `hydwind-web/src/content/site/info.md` 里对上。对不上就是写错了。
2. **不写查不到的事。** 在线人数、未来玩法、玩过多少人，一律不写。
3. **测试期要写出来。** 世界可能重置这件事，宁可劝退，不能后置。
4. **改完就提交。** 一轮工作一个 commit，能推就推。
5. **收工写文档。** `JOURNAL.md` 记时间线，`HANDOFF.md` 记状态。

## 事实刷新

官网的服务器信息以 `hydwind-web/src/content/site/info.md` 为准（当前更新于 2026-10-31）。
那一页变了，这里要跟着改，尤其是地址、客户端版本、收费和群号。

## 相关

- 官网仓库：<https://github.com/NmouZh/hydwind-web>
- 官网：<https://hydwind.lovie.me>
- 写作方法：<https://github.com/mattpocock/skills>
