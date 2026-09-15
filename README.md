# 乡建 · 最小功能静态原型

用于讨论和审阅产品页面及核心流程。纯 HTML、CSS、JavaScript，无安装依赖或构建步骤。

## GitHub Pages

在本仓库的 **Settings → Pages → Build and deployment** 中选择：

- Source：**Deploy from a branch**
- Branch：**main**
- Folder：**/ (root)**

点击 Save，等待 GitHub 完成部署。启用后的默认地址为：

[https://haroldgin931.github.io/xjPrototype/](https://haroldgin931.github.io/xjPrototype/)

配置说明见 [GitHub 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。仓库已包含 `.nojekyll`，无需配置自定义构建。

## 可以体验

- 广场帖子、任务、活动和“我的”，以及全局搜索与通知。
- 正文加图片组：发布时添加／移除图片，列表显示首图和张数，详情正文下方展示图片组，点击查看大图并切换。
- 单人任务申请、选人、交付、退回修改和验收发放。
- 活动申请时冻结、主办方筛选、拒绝／移除／取消退款，以及确认结束结算。
- 社区身份、节点目录和独立入会申请。
- 演示资料编辑、退出登录及公开浏览；手机和桌面自适应。

顶部可切换林舟、陈言和管理员周禾，依次体验双方操作。“时间预览”可模拟活动开始：未入选者自动退回冻结费用，已通过者继续冻结，主办方确认结束才结算。“字号与间距”可以调整阅读和按钮尺度。

公开版本不包含示例图片。可以在发布弹窗选择自己的本地图片，体验添加、移除和查看大图；图片只在当前页面预览，不上传到任何服务，刷新或重置会清除。

所有身份、金额和业务变化均为本页内存演示；**不连接 Rice、PDS 或真实支付，不操作真实资产**。不同访客不会共享记录；刷新或重置会恢复初始演示数据。静态原型不代表正式接口和真实多账号验收已经完成。

## 本地打开

在仓库根目录运行：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

访问 `http://127.0.0.1:8080/`。页面使用 JavaScript 模块，需要通过 HTTP 访问。

图标来自 Lucide，许可见 [assets/lucide-LICENSE](assets/lucide-LICENSE)。
