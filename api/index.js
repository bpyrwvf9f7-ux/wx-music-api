
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { name, type = "wy" } = req.query;

  if (!name) {
    return res.status(400).json({
      code: 400,
      msg: "请输入歌曲名称",
      example: "/api?name=稻香"
    });
  }

  const servers = {
    wy: "netease",
    qq: "tencent",
    kg: "kugou",
    kw: "kuwo"
  };

  const server = servers[type];

  if (!server) {
    return res.status(400).json({
      code: 400,
      msg: "不支持的音乐平台"
    });
  }

  try {
    const api = new URL("https://api.injahow.cn/meting/");
    api.searchParams.set("type", "search");
    api.searchParams.set("server", server);
    api.searchParams.set("name", name);

    const response = await fetch(api);
    if (!response.ok) throw new Error("音乐搜索服务暂不可用");

    const data = await response.json();

    return res.status(200).json({
      code: 200,
      title: name,
      data
    });
  } catch (error) {
    return res.status(502).json({
      code: 502,
      msg: error.message
    });
  }
}
