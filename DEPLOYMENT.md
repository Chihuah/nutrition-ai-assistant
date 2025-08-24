# 🚀 部署到 Render 指南

## 準備工作

### 1. 創建 GitHub 儲存庫
```bash
git init
git add .
git commit -m "Initial commit: AI營養師專案開發"
git branch -M main
git remote add origin https://github.com/你的用戶名/nutrition-ai-assistant.git
git push -u origin main
```

### 2. 環境變數準備
確保你有以下環境變數：
- `OPENAI_API_KEY`: 你的 OpenAI API 金鑰
- `OPENAI_MODEL`: (可選) 預設為 "gpt-5-nano"

## Render 部署步驟

### 方法一：使用 render.yaml (推薦)

1. **登入 Render**
   - 前往 [render.com](https://render.com)
   - 使用 GitHub 帳號登入

2. **創建新服務**
   - 點擊 "New +" → "Blueprint"
   - 連接你的 GitHub 儲存庫
   - Render 會自動檢測 `render.yaml` 配置

3. **設置環境變數**
   - 在服務設置中添加 `OPENAI_API_KEY`
   - 值設為你的 OpenAI API 金鑰

### 方法二：手動創建 Web Service

1. **創建 Web Service**
   - 點擊 "New +" → "Web Service"
   - 連接 GitHub 儲存庫

2. **配置設置**
   ```
   Name: nutrition-ai-assistant
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **環境變數**
   - 添加 `OPENAI_API_KEY`
   - 添加 `OPENAI_MODEL`
   - 添加 `NODE_ENV=production`

## 部署後檢查

1. **健康檢查**
   - 訪問 `https://你的應用.onrender.com/health`
   - 應該返回 `{"status":"OK","message":"臨床營養師 AI 助手運行正常"}`

2. **功能測試**
   - 訪問主頁面
   - 測試圖片上傳功能
   - 確認 AI 分析正常運作

## 注意事項

### 免費方案限制
- Render 免費方案有以下限制：
  - 15 分鐘無活動後會休眠
  - 每月 750 小時運行時間
  - 較慢的冷啟動時間

### 優化建議
1. **添加 keep-alive 服務** (可選)
   - 使用 cron job 定期訪問你的應用
   - 防止免費方案休眠

2. **監控日誌**
   - 在 Render 控制台查看應用日誌
   - 監控錯誤和性能

3. **自定義域名** (付費功能)
   - 可以綁定自己的域名
   - 提供更專業的訪問體驗

## 故障排除

### 常見問題

1. **部署失敗**
   - 檢查 `package.json` 中的依賴
   - 確認 Node.js 版本兼容性

2. **API 錯誤**
   - 確認 `OPENAI_API_KEY` 設置正確
   - 檢查 API 配額是否足夠

3. **文件上傳問題**
   - Render 的臨時文件系統會定期清理
   - 考慮使用雲存儲服務 (如 Cloudinary)

### 日誌查看
```bash
# 在 Render 控制台中查看實時日誌
# 或使用 Render CLI
render logs -s 你的服務ID
```

## 升級到付費方案

如果需要更穩定的服務，考慮升級到 Render 的付費方案：
- 無休眠時間
- 更快的啟動速度
- 更多的資源配額
- 自定義域名支持