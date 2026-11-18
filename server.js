
import express from "express";
import Meting from "@meting/core";

const app = express();
const PORT = process.env.PORT || 3000;

const platforms = ["netease", "tencent", "kugou", "kuwo", "baidu"];

app.get("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const name = String(req.query.name || "").trim();

  if (!name) {
    return res.json({
      code: 200,
      message: "微信点歌 API 已启动",
      usage: "/?name=稻香",
      platforms
    });
  }

  const server = String(req.query.server || "netease").toLowerCase();

  if (!platforms.includes(server)) {
    return res.status(400).json({
      code: 400,
      message: "不支持的音乐平台",
      platforms
    });
  }

  try {
    const meting = new Meting(server);
    meting.format(true);

    const raw = await meting.search(name, {
      page: 1,
      limit: 10
    });

    const songs = JSON.parse(raw);

    if (!Array.isArray(songs) || songs.length === 0) {
      return res.json({
        code: 404,
        message: "没有找到歌曲"
      });
    }

    const song = songs[0];

    const url = JSON.parse(
      await meting.url(song.url_id || song.id, 320)
    );

    const pic = JSON.parse(
      await meting.pic(song.pic_id || song.id, 300)
    );

    return res.json({
      code: 200,
      title: song.name || "",
      singer: Array.isArray(song.artist)
        ? song.artist.join(" / ")
        : song.artist || "",
      album: song.album || "",
      cover: pic.url || "",
      link: "",
      music_url: url.url || "",
      id: String(song.id || ""),
      platform: server
    });

  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "搜索失败",
      detail: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("微信点歌 API 已启动，端口：" + PORT);
});
