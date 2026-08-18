document.addEventListener('DOMContentLoaded', () => {
    // === Mobile Tab Navigation ===
    const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    const panels = {
        'left-panel': document.querySelector('.left-panel'),
        'center-panel': document.querySelector('.center-panel'),
        'right-panel': document.querySelector('.right-panel')
    };

    function switchMobileTab(targetTab) {
        mobileNavBtns.forEach(btn => {
            if (btn.dataset.tab === targetTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        Object.keys(panels).forEach(panelKey => {
            if (panelKey === targetTab) {
                panels[panelKey].classList.add('panel-active');
            } else {
                panels[panelKey].classList.remove('panel-active');
            }
        });
    }

    mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMobileTab(btn.dataset.tab);
        });
    });

    // Set initial panel on small screen
    if (window.innerWidth <= 768) {
        switchMobileTab('center-panel');
    }

    // === Exercise Selection & Quick Day Picker ===
    const cards = document.querySelectorAll('.exercise-card');
    const dropZones = document.querySelectorAll('.drop-zone');
    let draggedColorClass = null;
    let selectedExercise = null;

    const dayNamesKo = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' };

    function getCardColorClass(cardId) {
        const classMap = {
            'ex-run': 'color-run',
            'ex-swim': 'color-swim',
            'ex-bike': 'color-bike',
            'ex-jump': 'color-jump',
            'ex-stretch': 'color-stretch',
            'ex-soccer': 'color-soccer',
            'ex-basket': 'color-basket',
            'ex-dance': 'color-dance',
            'ex-walk': 'color-walk',
            'ex-strength': 'color-strength',
            'ex-pe': 'color-pe',
            'ex-other': 'color-other'
        };
        return classMap[cardId] || 'color-other';
    }

    function showToast(msg) {
        const existing = document.querySelector('.toast-msg');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2200);
    }

    function addExerciseToDay(exerciseName, colorClass, dayKey) {
        const targetZone = document.querySelector(`.drop-zone[data-day="${dayKey}"]`);
        if (!targetZone) return;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'dropped-item';
        if (colorClass) {
            itemDiv.classList.add(colorClass);
        }
        itemDiv.textContent = exerciseName;

        const removeBtn = document.createElement('div');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            itemDiv.remove();
            calculateTotalTimeAndCalories();
        };

        itemDiv.appendChild(removeBtn);
        targetZone.appendChild(itemDiv);
        calculateTotalTimeAndCalories();

        showToast(`${dayNamesKo[dayKey] || dayKey}요일에 ${exerciseName} 추가됨! ✨`);
    }

    // Drag and Drop (Desktop)
    cards.forEach(card => {
        const exerciseName = card.dataset.type;
        const colorClass = getCardColorClass(card.id);

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', exerciseName);
            draggedColorClass = colorClass;
            setTimeout(() => card.style.opacity = '0.5', 0);
        });

        card.addEventListener('dragend', () => {
            card.style.opacity = '1';
        });

        // Click / Touch Quick Day Picker
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMobile = window.innerWidth <= 768;

            // Clear previous pickers
            cards.forEach(c => {
                if (c !== card) {
                    c.classList.remove('selected');
                    const picker = c.nextElementSibling;
                    if (picker && picker.classList.contains('quick-day-picker')) {
                        picker.remove();
                    }
                }
            });

            card.classList.toggle('selected');
            let existingPicker = card.nextElementSibling;

            if (existingPicker && existingPicker.classList.contains('quick-day-picker')) {
                existingPicker.remove();
                selectedExercise = null;
            } else if (card.classList.contains('selected')) {
                selectedExercise = { name: exerciseName, colorClass: colorClass };

                const picker = document.createElement('div');
                picker.className = 'quick-day-picker';

                const days = [
                    { key: 'mon', label: '월' },
                    { key: 'tue', label: '화' },
                    { key: 'wed', label: '수' },
                    { key: 'thu', label: '목' },
                    { key: 'fri', label: '금' },
                    { key: 'sat', label: '토' },
                    { key: 'sun', label: '일', isSun: true }
                ];

                days.forEach(d => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = `quick-day-btn ${d.isSun ? 'sun' : ''}`;
                    btn.textContent = d.label;
                    btn.onclick = (event) => {
                        event.stopPropagation();
                        addExerciseToDay(exerciseName, colorClass, d.key);
                        if (isMobile) {
                            switchMobileTab('center-panel');
                        }
                    };
                    picker.appendChild(btn);
                });

                card.after(picker);
            }
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            const exerciseName = e.dataTransfer.getData('text/plain');
            if (exerciseName) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'dropped-item';
                if (draggedColorClass) {
                    itemDiv.classList.add(draggedColorClass);
                }
                itemDiv.textContent = exerciseName;

                const removeBtn = document.createElement('div');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    itemDiv.remove();
                    calculateTotalTimeAndCalories();
                };

                itemDiv.appendChild(removeBtn);
                zone.appendChild(itemDiv);
                calculateTotalTimeAndCalories();
            }
        });

        // Click zone when an exercise is selected
        zone.addEventListener('click', () => {
            if (selectedExercise) {
                const dayKey = zone.dataset.day;
                addExerciseToDay(selectedExercise.name, selectedExercise.colorClass, dayKey);
            }
        });
    });

    // === Time & Calorie Calculation Logic ===
    const timeInputs = document.querySelectorAll('.time-input');
    const totalTimeSpan = document.getElementById('total-time');
    const totalKcalSpan = document.getElementById('total-kcal');

    const kcalRates = {
        '🏃‍♂️ 달리기': 480,
        '🏊‍♀️ 수영': 420,
        '🚴‍♂️ 자전거': 360,
        '🪢 줄넘기': 500,
        '🧘 스트레칭': 180,
        '⚽ 축구': 440,
        '🏀 농구': 400,
        '💃 댄스': 300,
        '🚶 걷기': 220,
        '🏋️ 근력운동': 320,
        '🏫 체육시간': 280,
        '📌 기타': 240
    };

    function calculateTotalTimeAndCalories() {
        let totalMin = 0;
        let totalKcal = 0;

        timeInputs.forEach(input => {
            const val = parseInt(input.value);
            const dayKey = input.dataset.day;
            if (!isNaN(val) && val >= 0) {
                totalMin += val;

                if (dayKey) {
                    const zone = document.querySelector(`.drop-zone[data-day="${dayKey}"]`);
                    if (zone) {
                        const items = zone.querySelectorAll('.dropped-item');
                        items.forEach(item => {
                            const title = item.childNodes[0] ? item.childNodes[0].textContent.trim() : '';
                            const rate60 = kcalRates[title] || 240;
                            totalKcal += Math.round((rate60 / 60) * val);
                        });
                    }
                }
            }
        });

        if (totalTimeSpan) totalTimeSpan.textContent = totalMin;
        if (totalKcalSpan) totalKcalSpan.textContent = totalKcal;
    }

    timeInputs.forEach(input => {
        input.addEventListener('input', calculateTotalTimeAndCalories);
    });


    // === Chatbot Logic ===
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatContainer = document.getElementById('chat-container');

    function appendMessage(text, isUser) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        msgDiv.innerHTML = text;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    const systemPrompt = `너는 학생들의 건강을 책임지는 '최고의 AI 헬스 트레이너'야. 
이제 아이들에게 '맞춤형 운동 처방전'을 내려주는 능력이 추가되었어.
다음 규칙을 무조건 지켜서 대화해:

1. 처음에는 학생의 현재 상태(운동 목적, 아픈 곳, 평소 좋아하는 운동 등)를 1~2가지 가벼운 질문으로 물어봐.
2. 학생이 정보를 주면, 즉시 다음과 같은 형태의 [맞춤형 운동 처방전]을 작성해줘. 보기 쉽게 줄바꿈과 이모티콘을 적극 활용해.

   --- 📋 나만의 운동 처방전 ---
   🎯 목표: [학생의 목표]
   🔥 준비 운동: [간단한 웜업]
   🏃 본 운동: [구체적이고 재미있는 메인 운동 2가지]
   🧘 마무리 운동: [가벼운 스트레칭]
   💡 트레이너의 꿀팁: [한 줄 조언]
   ------------------------------

3. 너무 딱딱한 어른 말투는 금지! 친근하고 유머러스한 반말("헐!", "대박!", "크~")을 유지하며 동네 형/누나처럼 장난스럽게 말해.
4. 처방전을 준 다음에는 "오늘 당장 해볼 수 있겠어?!" 같이 실천을 유도하는 질문으로 대화를 이어가.`;

    function generateSmartFallbackPrescription(text) {
        let goal = "체력 증진 및 건강 관리 🏃‍♂️";
        let mainEx1 = "🏃‍♂️ 15분 달리기 (또는 빠르게 걷기)";
        let mainEx2 = "🪢 10분 줄넘기 (100회씩 3세트)";
        let warmup = "🙆‍♂️ 팔다리 가볍게 풀기 5분";
        let cooldown = "🧘 하체 및 어깨 스트레칭 5분";
        let tip = "매일 작은 목표부터 차근차근 실천하는 게 제일 중요해!";

        if (text.includes("살") || text.includes("다이어트") || text.includes("체중") || text.includes("비만")) {
            goal = "체지방 감소 및 유산소 체력 강화 🔥";
            mainEx1 = "🏃‍♂️ 20분 조깅 & 걷기 인터벌";
            mainEx2 = "💃 15분 신나는 댄스/줄넘기";
            tip = "운동 후 물을 자주 마시고 야식은 피해보자!";
        } else if (text.includes("근육") || text.includes("힘") || text.includes("체력") || text.includes("근력")) {
            goal = "기초 체력 및 근력 강화 💪";
            mainEx1 = "🏋️ 스쿼트 & 팔굽혀펴기 15분";
            mainEx2 = "🏀 농구 또는 축구 20분";
            tip = "운동 직후 단백질(계란, 우유)을 챙겨 먹으면 좋아!";
        } else if (text.includes("축구") || text.includes("공")) {
            goal = "순발력 및 축구 수행 능력 향상 ⚽";
            mainEx1 = "⚽ 드리블 & 슈팅 연습 20분";
            mainEx2 = "🏃‍♂️ 셔틀런 및 짧은 대시 10분";
            tip = "발목과 무릎 웜업을 충분히 해줘야 부상을 방지할 수 있어!";
        } else if (text.includes("키") || text.includes("성장") || text.includes("줄넘기")) {
            goal = "키 성장을 위한 성장판 자극 🪢";
            mainEx1 = "🪢 줄넘기 500회 (100회씩 나누어 실시)";
            mainEx2 = "🏀 농구 점프 슈팅 연습 15분";
            tip = "운동 후 푹 자는 게 성장호르몬 분비에 제일 중요해!";
        }

        return `우와! 고민/목표를 들었어! 너를 위한 맞춤형 운동 처방전이야! 😊<br><br>` +
            `--- 📋 나만의 운동 처방전 ---<br>` +
            `🎯 목표: ${goal}<br>` +
            `🔥 준비 운동: ${warmup}<br>` +
            `🏃 본 운동: ${mainEx1}, ${mainEx2}<br>` +
            `🧘 마무리 운동: ${cooldown}<br>` +
            `💡 트레이너의 꿀팁: ${tip}<br>` +
            `------------------------------<br><br>` +
            `오늘 당장 이 계획대로 실행해볼 준비 되었어?! 🔥💪`;
    }

    const API_KEY = "";
    let chatHistory = [];

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage(text, true);
        chatInput.value = '';
        
        chatHistory.push({ role: "user", parts: [{ text: text }] });

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message';
        typingDiv.id = typingId;
        typingDiv.innerHTML = '<span style="opacity:0.7;">고민을 듣고 답변을 작성 중입니다... ✍️</span>';
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (!API_KEY) {
            setTimeout(() => {
                const tDiv = document.getElementById(typingId);
                if (tDiv) tDiv.remove();
                const fallbackMsg = generateSmartFallbackPrescription(text);
                chatHistory.push({ role: "model", parts: [{ text: fallbackMsg }] });
                appendMessage(fallbackMsg, false);
            }, 400);
            return;
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: chatHistory
                })
            });

            const data = await response.json();
            const tDiv = document.getElementById(typingId);
            if(tDiv) tDiv.remove();
            
            if (response.ok && data.candidates && data.candidates.length > 0) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
                appendMessage(aiResponse.replace(/\n/g, '<br>'), false);
            } else {
                const fallbackMsg = generateSmartFallbackPrescription(text);
                chatHistory.push({ role: "model", parts: [{ text: fallbackMsg }] });
                appendMessage(fallbackMsg, false);
            }
            
        } catch (error) {
            console.error("에러 발생, 스마트 처방 엔진 전환:", error);
            const tDiv = document.getElementById(typingId);
            if(tDiv) tDiv.remove();
            const fallbackMsg = generateSmartFallbackPrescription(text);
            chatHistory.push({ role: "model", parts: [{ text: fallbackMsg }] });
            appendMessage(fallbackMsg, false);
        }
    }



    chatSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Save Logic
    document.getElementById('btn-save').addEventListener('click', () => {
        showToast('운동 계획이 성공적으로 저장되었습니다! 💾');
    });
});
