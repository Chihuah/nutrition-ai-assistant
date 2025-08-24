@echo off
echo 🍎 啟動食物營養分析助手...
echo.

REM 檢查是否安裝了 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未找到 Node.js，請先安裝 Node.js
    echo 下載地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 檢查是否存在 node_modules
if not exist "node_modules" (
    echo 📦 安裝依賴套件...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依賴安裝失敗
        pause
        exit /b 1
    )
)

REM 檢查環境變數文件
if not exist ".env" (
    echo ⚠️  未找到 .env 文件，將使用模擬數據
    echo 如需使用真實 AI 分析，請：
    echo 1. 複製 .env.example 為 .env
    echo 2. 在 .env 中填入你的 OpenAI API 密鑰
    echo 3. 可選：設置 OPENAI_MODEL 來選擇 AI 模型
    echo.
    echo 💡 提示：可以使用 npm run test-model 測試模型配置
    echo.
)

echo 🚀 啟動服務器...
echo 📱 請在瀏覽器中打開 http://localhost:3000
echo.
echo 按 Ctrl+C 停止服務器
echo.

npm start