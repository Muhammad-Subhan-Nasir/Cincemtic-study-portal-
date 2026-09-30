/**
 * Subhan AI — Virtual Academic Assistant & Vault Knowledge Engine
 * For: Universe of Resources (ASPIRE College Mailsi · GCUF Affiliated)
 * Developed by: M. Subhan
 * Engine: Google Gemini 1.5 Flash (Generative Language API) + Hybrid Live Drive Vault
 */

(function () {
  'use strict';

  // 1. Storage Keys & State
  const CHAT_STORAGE_KEY = 'subhan_ai_chat_history_v2';
  const BADGE_DISMISSED_KEY = 'subhan_ai_badge_dismissed_v2';
  const API_KEY_STORAGE = 'subhan_ai_gemini_api_key_v1';

  let chatHistory = [];
  let isTyping = false;

  // 2. Gemini System Prompt & Academic Context
  const GEMINI_SYSTEM_INSTRUCTION = `
You are "Subhan AI", an intelligent, warm, inspiring, and highly capable virtual academic mentor and study assistant for the portal "Universe of Resources".
You were created and developed by M. Subhan, a BS Computer Science student at ASPIRE College Mailsi (affiliated with GCUF - Government College University Faisalabad).

ROLE & PERSONALITY:
- You talk like a brilliant, friendly, and supportive Pakistani university senior / tutor.
- You communicate primarily in natural, smooth, conversational Roman Urdu (e.g., "Assalam-o-Alaikum! Haan bilkul, main aapko yeh concept asaan lafzon mein samjhata hoon..."), or in fluent English if the user asks in English.
- Be genuinely conversational, encouraging, and human. NEVER sound like a robotic automated bot.
- Use neat markdown: bold key terms, use bullet points for steps, and format programming code inside proper markdown code blocks.

CORE ACADEMIC DOMAIN & KNOWLEDGE:
1. Institution & Affiliation:
   - College: ASPIRE Group of Colleges Mailsi Campus (Vehari District, Punjab).
   - University Affiliation: Government College University Faisalabad (GCUF).
   - Principal & Faculty Vision: Providing a unified digital study portal so students have seamless access to academic materials.
   - Programs: BS Computer Science (4 Years / 8 Semesters) and BS English Literature (4 Years / 8 Semesters).
2. Universe of Resources Portal:
   - Founded and coded by M. Subhan.
   - Centralizes verified Google Drive folders containing teacher PPT lecture slides, handwritten PDF notes, past examination papers, syllabus outlines, and solved coding examples.
   - Students can select their degree and semester directly on the website to access verified Google Drive folders.
3. GCUF Examination & Grading System:
   - Standard 4.00 CGPA grading scale. Minimum 50% marks to pass a course. 85%+ = 4.00 GPA (A grade).
   - Semester Exam Distribution:
     • Midterm Examination: 30 Marks (approx 8th-9th week, 1.5 Hours duration)
     • Final Examination: 50 Marks (Comprehensive syllabus coverage, 2.5 Hours duration)
     • Sessional Marks: 20 Marks (Assignments, Quizzes, Class Presentations, and Attendance)
   - Emphasize the importance of practicing GCUF past papers for recurring exam patterns and repeated questions.
4. Computer Science Subjects Guidance:
   - Programming Fundamentals (C++: syntax, variables, conditional statements, loops, functions, arrays, pointers, dynamic memory).
   - Object-Oriented Programming (OOP: Classes, Objects, 4 Pillars: Encapsulation, Inheritance, Polymorphism, Abstraction).
   - Data Structures & Algorithms (DSA: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching, Big-O complexity).
   - Database Management Systems (DBMS: ER Diagrams, SQL Queries, Normalization 1NF/2NF/3NF/BCNF, ACID properties, Transactions).
   - Operating Systems (OS: Process Management, Threads, CPU Scheduling, Deadlocks, Banker's Algorithm, Virtual Memory & Paging).
   - Computer Networks (OSI 7 Layers, TCP/IP, Subnetting, Routing, DNS, HTTP/HTTPS).
   - Web Development, Python, Software Engineering.
5. BS English Literature Guidance:
   - Classical Poetry (Chaucer, Milton, Shakespearean Sonnets), Drama, History of English Literature, Linguistics, Phonetics, Literary criticism.
6. Founder Contact:
   - M. Subhan is always ready to guide fellow students and teachers.
   - WhatsApp Contact: https://wa.me/923706449349
   - If an unlisted subject past paper or study note is needed, guide them warmly to message Subhan on WhatsApp.
`;

  // 3. Fallback Knowledge for Offline / Instant Mode
  const VAULT_KNOWLEDGE = {
    college: {
      name: "ASPIRE Group of Colleges Mailsi Campus",
      affiliation: "Officially affiliated with Government College University Faisalabad (GCUF).",
      location: "Mailsi Campus, Punjab, Pakistan.",
      programs: ["BS Computer Science (4 Years / 8 Semesters)", "BS English Literature (4 Years / 8 Semesters)"],
      description: "ASPIRE College Mailsi is a premier academic institution affiliated with GCUF, dedicated to quality higher education and comprehensive student academic support."
    },
    gcuf: {
      grading: "GCUF operates on a 4.00 CGPA scale. Minimum passing marks per course is 50%. A grade of 85%+ represents 4.00 GPA (A Grade).",
      exams: "GCUF semester examinations typically consist of:\n• **Midterm Examination:** 30 Marks (1.5 Hours duration)\n• **Final Examination:** 50 Marks (2.5 Hours duration)\n• **Sessional Marks:** 20 Marks (Assignments, Quizzes, Presentations & Attendance)",
      pastPapers: "Past examination papers for GCUF affiliated colleges help understand paper patterns and repeated questions. You can filter by semester on this portal or ask me for any subject's papers!"
    },
    founder: {
      name: "M. Subhan",
      role: "Founder & Lead Developer of Universe of Resources",
      details: "BS Computer Science student at ASPIRE College Mailsi (GCUF Affiliated).",
      whatsapp: "https://wa.me/923706449349?text=Hi%20M.%20Subhan,%20I%20need%20help%20with%20study%20notes%20/%20past%20papers."
    }
  };

  // 4. API Key Accessors
  function getSavedApiKey() {
    try {
      return (localStorage.getItem(API_KEY_STORAGE) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function setSavedApiKey(key) {
    try {
      const trimmed = (key || '').trim();
      if (trimmed) {
        localStorage.setItem(API_KEY_STORAGE, trimmed);
      } else {
        localStorage.removeItem(API_KEY_STORAGE);
      }
      return true;
    } catch (e) {
      console.error("Failed to save API key:", e);
      return false;
    }
  }

  // 5. Helper: Retrieve Live Portal Resources (Google Drive Folders)
  function getLiveResources() {
    try {
      if (typeof window.getVaultResources === 'function') {
        const res = window.getVaultResources();
        if (Array.isArray(res) && res.length > 0) return res;
      }
      const raw = localStorage.getItem('vaultcampus-resources-v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Subhan AI resources fetch notice:", e);
    }
    return [];
  }

  // 6. Search Portal Resources for Attached Cards
  function findMatchingResources(query) {
    const q = query.toLowerCase();
    const allResources = getLiveResources();
    if (!allResources || allResources.length === 0) return [];

    // Detect Semester
    const semMatch = q.match(/(\b1st\b|\b2nd\b|\b3rd\b|\b4th\b|\b5th\b|\b6th\b|\b7th\b|\b8th\b|semester\s*([1-8])|sem\s*([1-8]))/i);
    let targetSem = null;
    if (semMatch) {
      const numStr = (semMatch[1] || semMatch[2] || semMatch[3]).toLowerCase();
      if (numStr.includes('1')) targetSem = 'Semester 1';
      else if (numStr.includes('2')) targetSem = 'Semester 2';
      else if (numStr.includes('3')) targetSem = 'Semester 3';
      else if (numStr.includes('4')) targetSem = 'Semester 4';
      else if (numStr.includes('5')) targetSem = 'Semester 5';
      else if (numStr.includes('6')) targetSem = 'Semester 6';
      else if (numStr.includes('7')) targetSem = 'Semester 7';
      else if (numStr.includes('8')) targetSem = 'Semester 8';
    }

    let targetProgram = null;
    if (/english|literature|linguistics/i.test(q)) {
      targetProgram = 'BS English';
    } else if (/cs|computer|coding|programming|it|software/i.test(q)) {
      targetProgram = 'BS Computer Science';
    }

    let matches = [];
    if (targetSem) {
      matches = allResources.filter(r => {
        const progOk = !targetProgram || (r.program === targetProgram) || !r.program;
        const semOk = (r.semester === targetSem) || (r.semester === 'All Semesters');
        return progOk && semOk;
      });
    }

    // Keyword Match if no exact semester match or few results
    if (matches.length === 0) {
      const keywords = q
        .replace(/notes|drive|folder|papers|past|give|mujhe|chahiye|do|karo|batao|ka|ki|ke|please|plz/gi, '')
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 2);

      if (keywords.length > 0) {
        matches = allResources.filter(r => {
          const title = (r.title || '').toLowerCase();
          const desc = (r.desc || '').toLowerCase();
          const sem = (r.semester || '').toLowerCase();
          return keywords.some(k => title.includes(k) || desc.includes(k) || sem.includes(k));
        });
      }
    }

    return matches.slice(0, 4);
  }

  // 7. Google Gemini 1.5 Flash API Caller
  async function callGeminiFlashAPI(userPrompt, history, apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    // Build multi-turn context (last 6 turns)
    const recent = history.slice(-6);
    const contents = [];

    recent.forEach(msg => {
      if (msg.sender === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.text }]
        });
      } else if (msg.sender === 'bot' && msg.rawText) {
        contents.push({
          role: 'model',
          parts: [{ text: msg.rawText }]
        });
      }
    });

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const body = {
      system_instruction: {
        parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 900
      }
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${resp.status}`;
      throw new Error(msg);
    }

    const json = await resp.json();
    const candidate = json.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error('Gemini API returned an empty candidate text.');
    }

    return replyText;
  }

  // 8. Offline Knowledge Fallback (When no key or network issue)
  function getOfflineVaultResponse(q) {
    const lower = q.toLowerCase();

    if (/^(hi|hello|hey|salam|assalam|aoa|slaam|asalam|kese ho|kaise ho)/i.test(lower)) {
      return `**Walaikum Assalam! 🌟** Main **Subhan AI** hoon — ASPIRE College Mailsi (GCUF) ka virtual academic assistant.\n\nAap mujh se GCUF past papers, semester study drives, C++, OOP, Data Structures ya ASPIRE College ke mutaliq kuch bhi pooch sakte hain!`;
    }

    if (/aspire|campus|mailsi|building|affiliated|gcuf/i.test(lower)) {
      return `🏛️ **ASPIRE College Mailsi & GCUF Affiliation Details:**\n\n• **College:** ${VAULT_KNOWLEDGE.college.name}\n• **Affiliation:** ${VAULT_KNOWLEDGE.college.affiliation}\n• **Location:** ${VAULT_KNOWLEDGE.college.location}\n• **Programs:** BS Computer Science aur BS English Literature.\n• **Standards:** GCUF ke official curriculum aur examination regulations ke mutabiq certified study material available hai.`;
    }

    if (/exam|midterm|final|paper pattern|cgpa|gpa|marks/i.test(lower)) {
      return `📊 **GCUF Examination & Grading Standards:**\n\n${VAULT_KNOWLEDGE.gcuf.exams}\n\n• **GPA Calculation:** ${VAULT_KNOWLEDGE.gcuf.grading}`;
    }

    if (/subhan|contact|rabta|whatsapp|developer/i.test(lower)) {
      return `Aap portal ke founder aur developer **M. Subhan** se direct WhatsApp par connect kar sakte hain:\n\n• **Developer:** M. Subhan (BS CS, ASPIRE College Mailsi)\n• **WhatsApp Direct Line:** https://wa.me/923706449349`;
    }

    return `Universe of Resources par **ASPIRE College Mailsi (GCUF)** ke tamam semesters ke folders mojood hain. Aap mujh se kisi bhi specific semester (e.g. *"BS CS 3rd Semester"*), subject notes, ya GCUF paper pattern ke baray mein pooch sakte hain!`;
  }

  // 9. Main Controller & DOM Initialization
  function initSubhanAi() {
    const trigger = document.getElementById('subhanAiTrigger');
    const widget = document.getElementById('subhanAiWidget');
    const closeBtn = document.getElementById('aiCloseBtn');
    const clearBtn = document.getElementById('aiClearBtn');
    const keyBtn = document.getElementById('aiKeyBtn');
    const chatForm = document.getElementById('aiChatForm');
    const chatInput = document.getElementById('aiChatInput');
    const messagesList = document.getElementById('aiMessagesList');
    const quickChips = document.getElementById('aiQuickChips');
    const typingIndicator = document.getElementById('aiTypingIndicator');
    const unreadBadge = document.getElementById('aiUnreadBadge');
    const statusText = document.getElementById('aiStatusText');

    // Key Drawer Elements
    const keyDrawer = document.getElementById('aiKeyDrawer');
    const apiKeyInput = document.getElementById('aiApiKeyInput');
    const saveKeyBtn = document.getElementById('aiSaveKeyBtn');
    const clearKeyBtn = document.getElementById('aiClearKeyBtn');
    const closeKeyDrawer = document.getElementById('aiCloseKeyDrawer');

    if (!trigger || !widget || !chatForm || !chatInput || !messagesList) {
      console.warn("Subhan AI elements missing from DOM.");
      return;
    }

    // Update UI based on API key state
    function refreshApiKeyState() {
      const currentKey = getSavedApiKey();
      if (currentKey) {
        if (keyBtn) keyBtn.classList.add('has-key');
        if (statusText) {
          statusText.textContent = "⚡ Gemini 1.5 Flash Connected · Real AI Intelligence Active";
        }
        if (apiKeyInput) {
          apiKeyInput.value = currentKey;
        }
      } else {
        if (keyBtn) keyBtn.classList.remove('has-key');
        if (statusText) {
          statusText.textContent = "🔑 Gemini Key Pending · Click 🔑 to Activate Real AI";
        }
        if (apiKeyInput) {
          apiKeyInput.value = '';
        }
      }
    }

    refreshApiKeyState();

    // Toggle Key Drawer
    function openKeyDrawer() {
      if (!keyDrawer) return;
      keyDrawer.hidden = false;
      const current = getSavedApiKey();
      if (apiKeyInput) {
        apiKeyInput.value = current;
        apiKeyInput.focus();
      }
    }

    function hideKeyDrawer() {
      if (keyDrawer) keyDrawer.hidden = true;
    }

    if (keyBtn) {
      keyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (keyDrawer.hidden) {
          openKeyDrawer();
        } else {
          hideKeyDrawer();
        }
      });
    }

    if (closeKeyDrawer) {
      closeKeyDrawer.addEventListener('click', hideKeyDrawer);
    }

    if (saveKeyBtn) {
      saveKeyBtn.addEventListener('click', () => {
        const val = apiKeyInput ? apiKeyInput.value.trim() : '';
        if (!val) {
          alert("Barah-e-karam apni Google Gemini API Key enter karein.");
          return;
        }
        setSavedApiKey(val);
        refreshApiKeyState();
        hideKeyDrawer();

        // Push confirmation bot message
        chatHistory.push({
          sender: 'bot',
          rawText: "Gemini 1.5 Flash AI connected!",
          text: `🎉 **Google Gemini 1.5 Flash AI successfully connected!**\n\nAb Subhan AI real generative intelligence se operate karega! Aap mujh se Roman Urdu ya English mein koi bhi sawal pooch sakte hain — coding problems, GCUF past papers, assignment help, ya semester guidance!`,
          chips: ['📂 BS CS 3rd Sem Folders', '📝 GCUF Past Papers', '🏛️ ASPIRE College Info', '💬 Ask Subhan']
        });
        saveChatHistory();
        renderMessages();
      });
    }

    if (clearKeyBtn) {
      clearKeyBtn.addEventListener('click', () => {
        if (confirm("Kya aap saved Gemini API Key remove karna chahte hain?")) {
          setSavedApiKey('');
          refreshApiKeyState();
          hideKeyDrawer();
          chatHistory.push({
            sender: 'bot',
            text: `ℹ️ **Gemini API Key remove kar di gayi hai.**\n\nSubhan AI ab offline vault mode mein chalay ga. Dubara connect karne ke liye upar 🔑 icon dabayein!`
          });
          saveChatHistory();
          renderMessages();
        }
      });
    }

    // Load Chat History from sessionStorage
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        chatHistory = JSON.parse(saved);
      }
    } catch (e) {
      chatHistory = [];
    }

    // Initial Welcome Message
    if (chatHistory.length === 0) {
      const hasKey = !!getSavedApiKey();
      let welcomeMsg = '';

      if (hasKey) {
        welcomeMsg = `Assalam-o-Alaikum! 🌟 Main **Subhan AI** hoon — ASPIRE College Mailsi (GCUF) ka official virtual study mentor.\n\n⚡ **Google Gemini 1.5 Flash AI** active hai! Main aapko teacher lecture slides, past examination papers, syllabus aur complex CS/English academic guidance provide kar sakta hoon.\n\nAap Roman Urdu ya English mein kuch bhi pooch sakte hain!`;
      } else {
        welcomeMsg = `Assalam-o-Alaikum! 🌟 Main **Subhan AI** hoon — ASPIRE College Mailsi (GCUF) ka virtual academic mentor.\n\nMain aapko real Google Gemini 1.5 Flash AI se connect kar ke smart aur human-like jawab deta hoon.\n\n🔑 **Gemini AI Activate Kaise Karein?**\nUpar header mein **🔑 icon** dabayein ya neeche **"Enter Gemini Key"** par click karein. Agar key nahi hai toh Google AI Studio se 30 second mein free le lein!`;
      }

      chatHistory.push({
        sender: 'bot',
        rawText: welcomeMsg,
        text: welcomeMsg,
        chips: hasKey 
          ? ['📂 BS CS 3rd Sem Folders', '📝 GCUF Past Papers', '🏛️ ASPIRE & GCUF Info', '💬 Ask M. Subhan']
          : ['🔑 Enter Gemini Key', '📂 BS CS 3rd Sem', '📝 GCUF Past Papers', '💬 Ask Subhan']
      });
      saveChatHistory();
    }

    renderMessages();

    // Toggle Chat Window
    function openWidget() {
      widget.hidden = false;
      widget.classList.add('widget-open');
      trigger.classList.add('trigger-active');
      if (unreadBadge) {
        unreadBadge.style.display = 'none';
        sessionStorage.setItem(BADGE_DISMISSED_KEY, 'true');
      }
      setTimeout(() => {
        chatInput.focus();
        scrollToBottom();
      }, 150);
    }

    function closeWidget() {
      widget.classList.remove('widget-open');
      trigger.classList.remove('trigger-active');
      setTimeout(() => {
        widget.hidden = true;
      }, 250);
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (widget.hidden) {
        openWidget();
      } else {
        closeWidget();
      }
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeWidget();
    });

    if (sessionStorage.getItem(BADGE_DISMISSED_KEY) && unreadBadge) {
      unreadBadge.style.display = 'none';
    }

    // Clear Chat Handler
    clearBtn.addEventListener('click', () => {
      if (confirm("Kya aap chat history clear karna chahte hain?")) {
        const hasKey = !!getSavedApiKey();
        chatHistory = [{
          sender: 'bot',
          rawText: "Chat reset.",
          text: `Chat reset ho chuki hai! Main **Subhan AI** hoon. Aap kis subject, semester ya past paper ke baray mein janna chahte hain?`,
          chips: hasKey 
            ? ['📂 BS CS 3rd Sem Folders', '📝 GCUF Past Papers', '🏛️ ASPIRE College Info']
            : ['🔑 Enter Gemini Key', '📂 BS CS 3rd Sem', '📝 GCUF Past Papers']
        }];
        saveChatHistory();
        renderMessages();
      }
    });

    // Handle Quick Action Chips Clicks
    if (quickChips) {
      quickChips.addEventListener('click', (e) => {
        const btn = e.target.closest('.ai-chip');
        if (btn) {
          const prompt = btn.getAttribute('data-prompt') || btn.textContent.trim();
          handleSendMessage(prompt);
        }
      });
    }

    // Form Submission
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val || isTyping) return;
      chatInput.value = '';
      handleSendMessage(val);
    });

    // Send Message Execution
    async function handleSendMessage(text) {
      // Check if user clicked Key Setup chip
      if (/enter gemini key|api key|set key|configure key/i.test(text.toLowerCase())) {
        openKeyDrawer();
        return;
      }

      // 1. Add User Message
      chatHistory.push({ sender: 'user', text });
      saveChatHistory();
      renderMessages();

      // 2. Show Typing Indicator
      isTyping = true;
      typingIndicator.hidden = false;
      scrollToBottom();

      const apiKey = getSavedApiKey();
      const matchedResources = findMatchingResources(text);

      let botReplyText = '';
      let rawGemini = '';
      let botLinks = [];
      let botChips = ['📂 BS CS 3rd Sem', '📝 GCUF Past Papers', '🏛️ ASPIRE College Info', '💬 Ask Subhan'];

      try {
        if (apiKey) {
          // Live Gemini 1.5 Flash Call
          rawGemini = await callGeminiFlashAPI(text, chatHistory, apiKey);
          botReplyText = rawGemini;
        } else {
          // No API key configured: explain clearly & provide offline knowledge
          const offlineAnswer = getOfflineVaultResponse(text);
          botReplyText = `🔑 **Gemini AI API Key Required for Real AI Responses:**\n\nMain abhi offline knowledge mode mein hoon kyun ke Gemini API key connect nahi hui. Agar aap chahte hain ke main natural Roman Urdu mein har sawal ka human-like jawab doon, toh upar **🔑 icon** par click karein ya neeche **"Enter Gemini Key"** dabayein!\n\n---\n\n${offlineAnswer}`;
          
          botChips = ['🔑 Enter Gemini Key', '📂 BS CS 3rd Sem', '📝 GCUF Past Papers', '💬 Ask Subhan'];
          botLinks = [
            { title: "Get Free Gemini Key (Google AI Studio) ↗", url: "https://aistudio.google.com/app/apikey", isExternal: true },
            { title: "💬 Contact M. Subhan on WhatsApp", url: VAULT_KNOWLEDGE.founder.whatsapp, isExternal: true }
          ];
        }
      } catch (err) {
        console.error("Gemini API execution error:", err);
        const offlineAnswer = getOfflineVaultResponse(text);
        botReplyText = `⚠️ **Gemini AI Notice (${err.message}):**\n\nAPI call mein issue aaya (key check karein ya quota verify karein). Lekin portal database se aapke sawal ka jawab yeh hai:\n\n${offlineAnswer}`;
        botChips = ['🔑 Enter Gemini Key', '📂 BS CS 3rd Sem', '📝 GCUF Past Papers', '💬 Ask Subhan'];
      } finally {
        isTyping = false;
        typingIndicator.hidden = true;

        chatHistory.push({
          sender: 'bot',
          rawText: rawGemini || botReplyText,
          text: botReplyText,
          resources: matchedResources,
          links: botLinks,
          chips: botChips
        });
        saveChatHistory();
        renderMessages();
      }
    }

    // Save Chat to Storage
    function saveChatHistory() {
      try {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory.slice(-25)));
      } catch (e) {}
    }

    // Render Messages Function
    function renderMessages() {
      messagesList.innerHTML = '';

      chatHistory.forEach((msg) => {
        const bubble = document.createElement('div');
        bubble.className = `ai-msg-bubble ${msg.sender === 'user' ? 'msg-user' : 'msg-bot'}`;

        // Format Markdown
        let formattedText = escapeHtml(msg.text)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/```([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$1</code></pre>')
          .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
          .replace(/•\s/g, '✦ ')
          .replace(/\n/g, '<br/>');

        bubble.innerHTML = `<div class="msg-content">${formattedText}</div>`;

        // Render Attached Resource Cards
        if (Array.isArray(msg.resources) && msg.resources.length > 0) {
          const resWrap = document.createElement('div');
          resWrap.className = 'ai-msg-resources';

          msg.resources.forEach(r => {
            const card = document.createElement('div');
            card.className = 'ai-res-card';
            card.innerHTML = `
              <div class="ai-res-card-left">
                <span class="ai-res-folder-icon">📂</span>
                <div>
                  <strong class="ai-res-title">${escapeHtml(r.title)}</strong>
                  <span class="ai-res-meta">${escapeHtml(r.program || 'BS CS')} · ${escapeHtml(r.semester || 'Academic')}</span>
                </div>
              </div>
              <a href="${escapeHtml(r.driveUrl || '#')}" target="_blank" rel="noopener noreferrer" class="ai-res-btn">
                <span>Drive</span> ↗
              </a>
            `;
            resWrap.appendChild(card);
          });
          bubble.appendChild(resWrap);
        }

        // Render Action Links
        if (Array.isArray(msg.links) && msg.links.length > 0) {
          const linksWrap = document.createElement('div');
          linksWrap.className = 'ai-msg-links';
          msg.links.forEach(l => {
            const a = document.createElement('a');
            a.className = 'ai-inline-link-btn';
            a.href = l.url;
            if (l.isExternal) {
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
            }
            a.innerHTML = `<span>${escapeHtml(l.title)}</span> ↗`;
            linksWrap.appendChild(a);
          });
          bubble.appendChild(linksWrap);
        }

        // Render Interactive Inline Chips
        if (Array.isArray(msg.chips) && msg.chips.length > 0 && msg.sender === 'bot') {
          const chipBox = document.createElement('div');
          chipBox.className = 'ai-inline-chips';
          msg.chips.forEach(chipText => {
            const chipBtn = document.createElement('button');
            chipBtn.type = 'button';
            chipBtn.className = 'ai-chip-inline';
            chipBtn.textContent = chipText;
            chipBtn.addEventListener('click', () => {
              if (chipText === '🔑 Enter Gemini Key') {
                openKeyDrawer();
              } else {
                handleSendMessage(chipText);
              }
            });
            chipBox.appendChild(chipBtn);
          });
          bubble.appendChild(chipBox);
        }

        messagesList.appendChild(bubble);
      });

      scrollToBottom();
    }

    function scrollToBottom() {
      messagesList.scrollTop = messagesList.scrollHeight;
    }

    function escapeHtml(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  }

  // 10. Bootstrap when DOM is Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubhanAi);
  } else {
    initSubhanAi();
  }
})();
