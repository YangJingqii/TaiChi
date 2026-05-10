# 太极拳友小程序示例

## 页面

- `pages/album/album`：拳友相册，支持选择图片、上传云存储、保存打卡记录、按日期倒序浏览、分享照片。
- `pages/me/me`：我的页面，包含太极家书编辑和太极印记徽章展示。

## 云开发集合

建议创建以下集合：

- `album`：`id, user_id, image_url, date, description, created_at`
- `letters`：`id, user_id, content, created_at, updated_at`
- `badges`：`id, user_id, badge_key, badge_name, level, current, updated_at`
- `share_logs`：`id, user_id, share_type, target_id, created_at`
- `likes`：`id, user_id, album_id, created_at`

## 使用前配置

1. 在微信开发者工具中开通云开发。
2. 将 `app.js` 中的 `your-cloud-env-id` 改成你的云环境 ID。
3. 上传并部署 `cloudfunctions` 下的云函数。
4. 创建数据库集合，并按需要配置数据库读写权限。
