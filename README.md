# 👩‍⚕️ 臨床營養師 AI 助手

一個基於 AI 的專業營養分析聊天應用，由具備臨床營養師專業知識的 AI 助手提供服務。用戶可以上傳食物照片，獲得專業的營養分析、健康評估和個人化飲食建議。

## ✨ 功能特色

- 📷 **圖片上傳**: 支持拖拽或點擊上傳食物照片
- 🤖 **AI 分析**: 使用 OpenAI GPT-5 分析食物營養
- 💬 **聊天界面**: 友好的對話式用戶體驗
- 📊 **營養資訊**: 詳細的營養成分分析（熱量、蛋白質、碳水等）
- 💡 **健康建議**: 基於分析結果提供個性化健康建議
- 📱 **響應式設計**: 支持桌面和移動設備

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置環境變數

複製 `.env.example` 為 `.env` 並填入你的 API 密鑰：

```bash
cp .env.example .env
```

編輯 `.env` 文件：

```env
# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5-nano

# 可用的模型選項：
# gpt-5 (最新模型)
# gpt-5-mini (支持視覺功能)
# gpt-5-nano (預設，更快速、更經濟的選擇)
# gpt-4.1-2025-04-14 (舊版視覺模型)

# 服務器配置
PORT=3000
```

### 3. 啟動應用

```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

### 4. 訪問應用

打開瀏覽器訪問 `http://localhost:3000`

## 🛠️ 技術架構

### 前端
- **HTML5**: 語義化標記
- **CSS3**: 現代化樣式，支持響應式設計
- **JavaScript (ES6+)**: 原生 JavaScript，無框架依賴

### 後端
- **Node.js**: 服務器運行環境
- **Express.js**: Web 框架
- **OpenAI API**: GPT-5 圖像分析
- **Multer**: 文件上傳處理

### AI 服務
- **OpenAI GPT-5**: 主要的圖像分析服務
- **備用模擬數據**: 當 API 不可用時的降級方案

## 📁 項目結構

```
food-nutrition-analyzer/
├── index.html          # 主頁面
├── style.css           # 樣式文件
├── script.js           # 前端邏輯
├── server.js           # 後端服務器
├── package.json        # 項目配置
├── .env.example        # 環境變數範例
├── .kiro/              # Kiro IDE 配置
│   └── settings/
│       └── mcp.json    # MCP 服務器配置
└── README.md           # 說明文件
```

## ⚙️ 模型配置

### 支持的 OpenAI 模型

你可以通過 `OPENAI_MODEL` 環境變數來選擇使用的 AI 模型：

| 模型名稱 | 特點 | 適用場景 |
|---------|------|----------|
| `gpt-5` | 最新模型，更強性能 | 需要最佳分析效果 |
| `gpt-5-mini` | 平衡性能與成本 | 一般使用 |
| `gpt-5-nano` | 預設模型，更快速、更經濟 | 快速測試、成本敏感 |
| `gpt-4.1-2025-04-14` | 舊版視覺模型 | 兼容性需求 |

### 模型切換方法

1. 編輯 `.env` 文件
2. 修改 `OPENAI_MODEL` 的值
3. 重啟服務器

```bash
# 使用最新模型
OPENAI_MODEL=gpt-5

# 使用經濟模型
OPENAI_MODEL=gpt-5-nano
```

## 🔧 API 端點

### POST `/api/analyze-food`
分析食物圖片的營養成分

**請求體:**
```json
{
  "image": "base64_encoded_image",
  "prompt": "分析提示文字"
}
```

**回應:**
```json
{
  "foodName": "食物名稱",
  "description": "食物描述",
  "nutrition": {
    "calories": "熱量",
    "protein": "蛋白質",
    "carbs": "碳水化合物",
    "fat": "脂肪",
    "fiber": "纖維",
    "sodium": "鈉"
  },
  "healthTips": ["健康建議1", "健康建議2"]
}
```

### GET `/api/health`
健康檢查端點

## 🎯 使用方法

1. **上傳圖片**: 點擊「上傳食物照片」按鈕選擇食物圖片
2. **開始分析**: 點擊「分析營養成分」按鈕
3. **查看結果**: AI 會以對話形式回應營養分析結果
4. **獲得建議**: 根據分析結果獲得個性化健康建議

## 🔒 安全考量

- 圖片大小限制為 5MB
- 只允許上傳圖片格式文件
- API 密鑰通過環境變數安全存儲
- 前端輸入驗證和後端數據清理

## 🌐 部署

### 部署到 Render

這個應用已經配置好可以直接部署到 Render：

1. **準備 GitHub 儲存庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **在 Render 創建服務**
   - 登入 [Render](https://render.com)
   - 選擇 "New Blueprint" 或 "Web Service"
   - 連接你的 GitHub 儲存庫

3. **設置環境變數**
   - `OPENAI_API_KEY`: 你的 OpenAI API 金鑰
   - `NODE_ENV`: production

4. **自動部署**
   - Render 會自動檢測 `render.yaml` 配置
   - 使用 `npm install` 和 `npm start` 命令

詳細部署指南請參考 [DEPLOYMENT.md](DEPLOYMENT.md)

### 其他平台

此應用也可以部署到：
- Vercel
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 🚧 開發計劃

- [ ] 支持 Google Gemini API
- [ ] 添加用戶歷史記錄
- [ ] 營養目標設定功能
- [ ] 多語言支持
- [ ] 離線模式支持
- [ ] 營養數據導出功能

## 📝 注意事項

- 需要有效的 OpenAI API 密鑰才能使用完整功能
- 沒有 API 密鑰時會使用模擬數據進行演示
- AI 分析結果僅供參考，不能替代專業營養師建議

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個項目！

## 📄 授權

MIT License

## 🙏 致謝

本專案的程式碼由 [Kiro](https://kiro.dev) 協助生成和開發。Kiro 是一個強大的 AI 開發助手，能夠幫助開發者快速構建高品質的應用程式。

感謝 Kiro 在以下方面提供的協助：
- 🏗️ MVP專案架構設計
- 💻 前後端程式碼實現
- 🎨 用戶界面設計與優化
- 🚀 部署配置與指南
- 📚 完整的文檔撰寫

---

*Built with ❤️ and powered by Kiro AI*
