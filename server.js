const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// 文件上傳配置
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允許上傳圖片文件'));
        }
    }
});

// OpenAI 配置
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 支持的模型列表
const SUPPORTED_MODELS = [
    'gpt-5',
    'gpt-5-mini',
    'gpt-5-nano',
    'gpt-4.1-2025-04-14'
];

// 驗證模型是否支持
function validateModel(model) {
    if (!SUPPORTED_MODELS.includes(model)) {
        console.warn(`⚠️  模型 "${model}" 可能不支持視覺功能，建議使用: ${SUPPORTED_MODELS.slice(0, 3).join(', ')}`);
    }
    return model;
}

// 食物分析 API
app.post('/api/analyze-food', async (req, res) => {
    try {
        const { image, prompt } = req.body;

        if (!image) {
            return res.status(400).json({ error: '請提供圖片數據' });
        }

        // 調用 OpenAI Vision API
        const model = validateModel(process.env.OPENAI_MODEL || "gpt-5-nano"); // 從環境變數讀取模型，預設為 gpt-5-nano
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `你是一位專業的臨床營養師，具有豐富的營養學知識和臨床經驗。你的職責是：

1. 專業分析食物的營養成分，包括但不限於熱量、蛋白質、碳水化合物、脂肪、維生素、礦物質等
2. 根據食物特性提供準確的營養價值評估
3. 給出專業的飲食建議和健康指導
4. 考慮不同人群的營養需求差異
5. 提醒潛在的飲食風險或注意事項

請以專業、親切、易懂的方式回答，使用繁體中文，並確保所有建議都基於營養學科學原理。`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt || `請以臨床營養師的專業角度，詳細分析這張食物圖片的營養成分。請提供以下資訊：

1. 食物名稱和詳細描述
2. 營養成分分析（熱量、蛋白質、碳水化合物、脂肪、膳食纖維、鈉、維生素、礦物質等）
3. 營養價值評估
4. 適合的人群和食用建議
5. 潛在的健康風險或注意事項
6. 專業的營養師建議

請用繁體中文回答，並以專業但易懂的方式呈現，格式請盡量結構化，方便閱讀。`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${image}`
                            }
                        }
                    ]
                }
            ],
            max_completion_tokens: 15000
        });

        const analysis = response.choices[0].message.content;

        // 解析 AI 回應並結構化
        const structuredAnalysis = parseAIResponse(analysis);

        res.json(structuredAnalysis);

    } catch (error) {
        console.error('分析錯誤:', error);

        // 如果是 API 錯誤，返回模擬數據
        if (error.code === 'insufficient_quota' || error.status === 429) {
            res.json(getMockAnalysis());
        } else {
            res.status(500).json({
                error: '分析失敗，請稍後再試',
                details: error.message
            });
        }
    }
});

// 解析 AI 回應的函數
function parseAIResponse(response) {
    try {
        // 嘗試從 AI 回應中提取結構化信息
        const lines = response.split('\n').filter(line => line.trim());

        let foodName = "AI 識別的食物";
        let description = "";
        const nutrition = {
            calories: "未知",
            protein: "未知",
            carbs: "未知",
            fat: "未知",
            fiber: "未知",
            sodium: "未知"
        };
        const healthTips = [];

        // 簡單的文本解析邏輯
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();

            // 提取食物名稱
            if (line.includes('食物') && line.includes('：')) {
                foodName = lines[i].split('：')[1]?.trim() || foodName;
            }

            // 提取營養信息
            if (line.includes('熱量') || line.includes('卡路里')) {
                const match = lines[i].match(/(\d+[-~]\d+|\d+)\s*(大卡|卡路里|kcal)/i);
                if (match) nutrition.calories = `約 ${match[1]} 大卡`;
            }

            if (line.includes('蛋白質')) {
                const match = lines[i].match(/(\d+[-~]\d+|\d+)\s*(公克|克|g)/i);
                if (match) nutrition.protein = `${match[1]} 公克`;
            }

            if (line.includes('碳水') || line.includes('醣類')) {
                const match = lines[i].match(/(\d+[-~]\d+|\d+)\s*(公克|克|g)/i);
                if (match) nutrition.carbs = `${match[1]} 公克`;
            }

            if (line.includes('脂肪')) {
                const match = lines[i].match(/(\d+[-~]\d+|\d+)\s*(公克|克|g)/i);
                if (match) nutrition.fat = `${match[1]} 公克`;
            }

            if (line.includes('纖維')) {
                const match = lines[i].match(/(\d+[-~]\d+|\d+)\s*(公克|克|g)/i);
                if (match) nutrition.fiber = `${match[1]} 公克`;
            }

            if (line.includes('鈉')) {
                const match = lines[i].match(/(\d+[-~]\d+|\d+)\s*(毫克|mg)/i);
                if (match) nutrition.sodium = `${match[1]} 毫克`;
            }

            // 提取健康建議
            if (line.includes('建議') || line.includes('注意') || line.includes('提醒')) {
                healthTips.push(lines[i].replace(/^\d+\.?\s*/, '').trim());
            }
        }

        // 如果沒有找到描述，使用前幾行作為描述
        if (!description) {
            description = lines.slice(0, 3).join(' ').substring(0, 200) + '...';
        }

        // 如果沒有找到健康建議，添加默認建議
        if (healthTips.length === 0) {
            healthTips.push("建議均衡飲食，適量攝取各種營養素");
            healthTips.push("注意食物新鮮度和衛生安全");
        }

        return {
            foodName,
            description: description || response.substring(0, 200) + '...',
            nutrition,
            healthTips,
            rawResponse: response // 保留原始回應供調試
        };

    } catch (error) {
        console.error('解析 AI 回應時發生錯誤:', error);

        // 如果解析失敗，返回基本格式
        return {
            foodName: "AI 識別的食物",
            description: response.substring(0, 200) + '...',
            nutrition: {
                calories: "分析中...",
                protein: "分析中...",
                carbs: "分析中...",
                fat: "分析中...",
                fiber: "分析中...",
                sodium: "分析中..."
            },
            healthTips: ["根據 AI 分析提供的建議"],
            rawResponse: response
        };
    }
}

// 模擬數據（當 API 不可用時使用）
function getMockAnalysis() {
    const mockFoods = [
        {
            foodName: "烤雞便當",
            description: "作為臨床營養師，我觀察到這是一份典型的台式烤雞便當，包含烤雞腿、白米飯和蔬菜配菜。整體營養組成相對均衡，但需要注意鈉含量和蔬菜比例。",
            nutrition: {
                calories: "約 650-750 大卡",
                protein: "35-40 公克（優質完全蛋白質）",
                carbs: "60-70 公克（主要來自白米飯）",
                fat: "25-30 公克（含飽和脂肪約8-10g）",
                fiber: "5-8 公克（建議增加）",
                sodium: "1200-1500 毫克（偏高，需注意）"
            },
            healthTips: [
                "【營養師建議】蛋白質含量充足，符合成人每日需求的60-70%",
                "【注意事項】鈉含量偏高，高血壓患者應謹慎食用，建議搭配大量水分",
                "【改善建議】可要求增加蔬菜份量，減少白飯，提升膳食纖維攝取",
                "【適合族群】適合體力勞動者、運動員，不建議腎臟病患者食用"
            ]
        },
        {
            foodName: "綜合蔬菜沙拉",
            description: "從營養學角度分析，這是一份營養密度高的綜合蔬菜沙拉，富含多種植化素、維生素和礦物質。顏色豐富表示營養素多樣性佳。",
            nutrition: {
                calories: "約 150-200 大卡（低熱量高營養）",
                protein: "8-12 公克（植物性蛋白質）",
                carbs: "15-20 公克（複合碳水化合物）",
                fat: "8-12 公克（來自堅果或橄欖油）",
                fiber: "8-12 公克（高纖維）",
                sodium: "300-500 毫克（適中）"
            },
            healthTips: [
                "【營養師推薦】膳食纖維含量優秀，有助腸道健康和血糖穩定",
                "【抗氧化效果】富含β-胡蘿蔔素、維生素C、E等抗氧化營養素",
                "【適合族群】特別適合糖尿病患者、減重者、便秘患者",
                "【搭配建議】可添加優質蛋白質如水煮蛋、雞胸肉增加飽足感"
            ]
        }
    ];

    return mockFoods[Math.floor(Math.random() * mockFoods.length)];
}

// 健康檢查端點
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 健康檢查端點
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: '臨床營養師 AI 助手運行正常' });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`🚀 服務器運行在 http://localhost:${PORT}`);
    console.log(`📱 打開瀏覽器訪問應用程序`);

    // 檢查環境變數
    const model = process.env.OPENAI_MODEL || "gpt-5-nano";
    console.log(`🤖 使用 AI 模型: ${model}`);

    if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️  未設置 OPENAI_API_KEY，將使用模擬數據');
    } else {
        console.log('✅ OpenAI API 已配置');
    }
});