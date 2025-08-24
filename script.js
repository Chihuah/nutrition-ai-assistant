class FoodAnalyzer {
    constructor() {
        this.imageInput = document.getElementById('imageInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.scrollToTopBtn = document.getElementById('scrollToTop');
        this.scrollHint = document.getElementById('scrollHint');
        this.imagePreview = document.getElementById('imagePreview');
        this.messages = document.getElementById('messages');
        this.currentImage = null;
        
        this.initEventListeners();
        this.initScrollHandling();
    }
    
    initEventListeners() {
        this.uploadBtn.addEventListener('click', () => {
            this.imageInput.click();
        });
        
        this.imageInput.addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });
        
        this.analyzeBtn.addEventListener('click', () => {
            this.analyzeFood();
        });
        
        this.resetBtn.addEventListener('click', () => {
            this.resetUpload();
        });
        
        this.scrollToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });
    }
    
    initScrollHandling() {
        // 監聽頁面滾動，顯示/隱藏回到頂部按鈕和滾動提示
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            
            // 顯示/隱藏回到頂部按鈕
            if (scrollY > 300) {
                this.scrollToTopBtn.style.display = 'block';
            } else {
                this.scrollToTopBtn.style.display = 'none';
            }
            
            // 隱藏滾動提示
            if (scrollY > 50) {
                this.scrollHint.style.opacity = '0';
                setTimeout(() => {
                    if (this.scrollHint.style.opacity === '0') {
                        this.scrollHint.style.display = 'none';
                    }
                }, 500);
            }
        });
        
        // 5秒後自動隱藏滾動提示
        setTimeout(() => {
            if (this.scrollHint) {
                this.scrollHint.style.opacity = '0';
                setTimeout(() => {
                    this.scrollHint.style.display = 'none';
                }, 500);
            }
        }, 5000);
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 檢查文件類型
        if (!file.type.startsWith('image/')) {
            this.addMessage('請上傳圖片文件！', 'bot');
            return;
        }
        
        // 檢查文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.addMessage('圖片文件太大，請選擇小於 5MB 的圖片。', 'bot');
            return;
        }
        
        this.currentImage = file;
        this.displayImagePreview(file);
        this.analyzeBtn.disabled = false;
        this.resetBtn.style.display = 'block';
        
        this.addMessage('📷 已上傳圖片，點擊「分析營養成分」開始分析！', 'user');
    }
    
    displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imagePreview.innerHTML = `
                <img src="${e.target.result}" alt="上傳的食物圖片">
                <p>已選擇圖片: ${file.name}</p>
            `;
        };
        reader.readAsDataURL(file);
    }
    
    async analyzeFood() {
        if (!this.currentImage) {
            this.addMessage('請先上傳食物圖片！', 'bot');
            return;
        }
        
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.innerHTML = '<span class="loading"></span>分析中...';
        
        try {
            // 將圖片轉換為 base64
            const base64Image = await this.fileToBase64(this.currentImage);
            
            // 調用 AI API 分析
            const analysis = await this.callAIAPI(base64Image);
            
            // 顯示分析結果
            this.displayAnalysisResult(analysis);
            
        } catch (error) {
            console.error('分析失敗:', error);
            this.addMessage('抱歉，分析過程中發生錯誤。請稍後再試。', 'bot');
        } finally {
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.innerHTML = '🔍 分析營養成分';
        }
    }
    
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async callAIAPI(base64Image) {
        try {
            // 調用後端 API 進行分析
            const response = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    prompt: "請分析這張食物圖片的營養成分，包括熱量、蛋白質、碳水化合物、脂肪等，並給出健康建議。請用繁體中文回答。"
                })
            });
            
            if (!response.ok) {
                throw new Error(`API 調用失敗: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('API 調用錯誤:', error);
            
            // 如果 API 失敗，使用本地模擬數據
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockAnalysis = {
                foodName: "烤雞便當",
                description: "這是一份看起來很豐盛的烤雞便當，包含烤雞腿、白飯、蔬菜配菜等。",
                nutrition: {
                    calories: "約 650-750 大卡",
                    protein: "35-40 公克",
                    carbs: "60-70 公克", 
                    fat: "25-30 公克",
                    fiber: "5-8 公克",
                    sodium: "1200-1500 毫克"
                },
                healthTips: [
                    "蛋白質含量豐富，有助於肌肉維護",
                    "建議搭配更多蔬菜增加纖維攝取",
                    "注意鈉含量較高，建議多喝水"
                ]
            };
            
            return mockAnalysis;
        }
    }
    
    displayAnalysisResult(analysis) {
        const nutritionHTML = `
            <div class="nutrition-info">
                <h4>🍽️ ${analysis.foodName}</h4>
                <p>${analysis.description}</p>
                
                <h4>📊 營養成分 (每份)</h4>
                <div class="nutrition-item">
                    <span>熱量</span>
                    <span>${analysis.nutrition.calories}</span>
                </div>
                <div class="nutrition-item">
                    <span>蛋白質</span>
                    <span>${analysis.nutrition.protein}</span>
                </div>
                <div class="nutrition-item">
                    <span>碳水化合物</span>
                    <span>${analysis.nutrition.carbs}</span>
                </div>
                <div class="nutrition-item">
                    <span>脂肪</span>
                    <span>${analysis.nutrition.fat}</span>
                </div>
                <div class="nutrition-item">
                    <span>膳食纖維</span>
                    <span>${analysis.nutrition.fiber}</span>
                </div>
                <div class="nutrition-item">
                    <span>鈉</span>
                    <span>${analysis.nutrition.sodium}</span>
                </div>
                
                <h4>💡 健康建議</h4>
                <ul>
                    ${analysis.healthTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
        
        this.addMessage(nutritionHTML, 'bot', true);
    }
    
    resetUpload() {
        // 清除當前圖片
        this.currentImage = null;
        this.imageInput.value = '';
        
        // 清除圖片預覽
        this.imagePreview.innerHTML = '';
        
        // 重置按鈕狀態
        this.analyzeBtn.disabled = true;
        this.resetBtn.style.display = 'none';
        
        // 添加重置消息
        this.addMessage('🔄 已清除圖片，請重新上傳食物照片。', 'bot');
    }
    
    addMessage(content, sender, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👤' : '👩‍⚕️';
        
        messageDiv.innerHTML = `
            <div class="avatar">${avatar}</div>
            <div class="content">
                ${isHTML ? content : `<p>${content}</p>`}
            </div>
        `;
        
        this.messages.appendChild(messageDiv);
        
        // 平滑滾動到底部
        setTimeout(() => {
            this.messages.scrollTo({
                top: this.messages.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
}

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
    new FoodAnalyzer();
});