#!/usr/bin/env node

/**
 * 測試 OpenAI 模型配置
 * 使用方法: node test-model.js [model-name]
 */

require('dotenv').config();
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

async function testModel(modelName) {
    console.log(`🧪 測試模型: ${modelName}`);
    console.log('─'.repeat(50));
    
    if (!process.env.OPENAI_API_KEY) {
        console.log('❌ 錯誤: 未設置 OPENAI_API_KEY');
        return;
    }
    
    if (!SUPPORTED_MODELS.includes(modelName)) {
        console.log(`⚠️  警告: 模型 "${modelName}" 可能不支持視覺功能`);
    }
    
    try {
        // 測試簡單的文本對話
        console.log('📝 測試文本對話...');
        const textResponse = await openai.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: "user",
                    content: "請用繁體中文說 Hello World"
                }
            ],
            max_completion_tokens: 50
        });
        
        console.log('✅ 文本對話測試成功');
        console.log('回應:', textResponse.choices[0].message.content);
        console.log('使用 tokens:', textResponse.usage?.total_tokens || 'N/A');
        
        // 測試視覺功能（使用一個簡單的測試圖片）
        console.log('\n👁️  測試視覺功能...');
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        const visionResponse = await openai.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "這是什麼圖片？請用繁體中文回答。"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/png;base64,${testImageBase64}`
                            }
                        }
                    ]
                }
            ],
            max_completion_tokens: 100
        });
        
        console.log('✅ 視覺功能測試成功');
        console.log('回應:', visionResponse.choices[0].message.content);
        console.log('使用 tokens:', visionResponse.usage?.total_tokens || 'N/A');
        
        console.log('\n🎉 模型測試完成！');
        
    } catch (error) {
        console.log('❌ 測試失敗:', error.message);
        
        if (error.code === 'model_not_found') {
            console.log('💡 建議: 檢查模型名稱是否正確，或嘗試其他模型');
        } else if (error.code === 'insufficient_quota') {
            console.log('💡 建議: 檢查 API 配額或付費狀態');
        }
    }
}

// 主程序
async function main() {
    const modelName = process.argv[2] || process.env.OPENAI_MODEL || 'gpt-5-nano';
    
    console.log('🤖 OpenAI 模型測試工具');
    console.log('═'.repeat(50));
    console.log(`環境變數模型: ${process.env.OPENAI_MODEL || '未設置'}`);
    console.log(`測試模型: ${modelName}`);
    console.log('');
    
    await testModel(modelName);
}

if (require.main === module) {
    main().catch(console.error);
}