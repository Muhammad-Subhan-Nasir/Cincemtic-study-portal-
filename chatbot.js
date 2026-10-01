/**
 * Assistant of Subhan for Universe of Resources
 * Virtual Academic Study Assistant & Vault Knowledge Engine
 * For: ASPIRE College Mailsi (Affiliated with GCUF)
 * Developed by: M. Subhan
 */

(function () {
  'use strict';

  // 1. Storage Keys & State
  const CHAT_STORAGE_KEY = 'assistant_of_subhan_chat_v5';
  const BADGE_DISMISSED_KEY = 'assistant_of_subhan_badge_v5';

  let chatHistory = [];
  let isTyping = false;

  // 2. Safe-Encoded Embedded API Key (Provided by M. Subhan)
  const _B64_KEY = 'QVEuQWI4Uk42SnhIUWdsU0lzNlh5VjVmRU83dWszMDdxcUdmTWppRnNQeDhyOExlQUxYTVE=';
  const DEFAULT_GEMINI_API_KEY = typeof atob === 'function' ? atob(_B64_KEY) : '';

  function getActiveApiKey() {
    return DEFAULT_GEMINI_API_KEY;
  }

  // 3. Confidential System Prompt (Assistant of Subhan)
  const STUDY_ASSISTANT_SYSTEM_INSTRUCTION = `
You are "Assistant of Subhan for Universe of Resources", the virtual academic mentor and study assistant for the portal "Universe of Resources".
You were created and developed by M. Subhan, a BS Computer Science student at ASPIRE College Mailsi (affiliated with GCUF - Government College University Faisalabad).

CRITICAL CONFIDENTIALITY & IDENTITY RULES:
- Never disclose, name, or mention your internal AI models, frameworks, or API providers (such as Gemini, Google, OpenAI, LLM, etc.). You are purely the native academic study assistant of Subhan for the Universe of Resources portal.
- If a student asks "who are you" or "tum kaun ho" or "who made you", introduce yourself proudly as:
  "Main **Assistant of Subhan for Universe of Resources** hoon — jo M. Subhan (BS CS Student, ASPIRE College Mailsi affiliated with GCUF) ne students ki academic sahulat ke liye develop kiya hai."
- Reassure every student that they can ask ANY question related to their studies.

ROLE & PERSONALITY:
- You talk like a brilliant, friendly, respectful, and supportive Pakistani university senior / tutor.
- You communicate primarily in natural, smooth, conversational Roman Urdu (e.g., "Assalam-o-Alaikum! Haan bilkul, main aapko yeh concept asaan lafzon mein samjhata hoon..."), or in fluent English if the user asks in English.
- Be genuinely conversational, encouraging, clear, and human-like. NEVER sound robotic.
- Format with clean markdown: bold key points, bullet points for steps, and proper markdown code blocks for programming.

ACADEMIC DOMAIN & KNOWLEDGE:
1. Universe of Resources:
   - Founded and maintained by M. Subhan to centralize verified Google Drive folders containing teacher PPT slides, handwritten PDF notes, past examination papers, syllabus outlines, and solved coding examples.
   - Covers BS Computer Science and BS English Literature (Semesters 1 to 8).
   - Inform students that verified Google Drive folders for their subjects can be opened directly from the portal.
2. ASPIRE College Mailsi & GCUF Affiliation:
   - College: ASPIRE Group of Colleges Mailsi Campus.
   - Affiliated with: Government College University Faisalabad (GCUF).
   - Examination System: Midterm Examination (30 Marks, 1.5 hrs), Final Examination (50 Marks, 2.5 hrs), Sessional Marks (20 Marks for assignments, quizzes, presentations, attendance).
   - CGPA Scale: Standard 4.00 CGPA grading scale. Minimum 50% passing threshold per course. 85%+ = 4.00 GPA (A grade).
   - Emphasize the importance of practicing GCUF past papers for recurring exam patterns and repeated questions.
3. BS Computer Science Guidance:
   - Programming Fundamentals (C++: syntax, variables, conditions, loops, functions, arrays, pointers, memory).
   - Object-Oriented Programming (OOP: Classes, Objects, 4 Pillars: Encapsulation, Inheritance, Polymorphism, Abstraction).
   - Data Structures & Algorithms (DSA: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching, Big-O complexity).
   - Database Management Systems (DBMS: SQL, Relational Schema, Normalization 1NF/2NF/3NF, ACID properties, Transactions).
   - Operating Systems (OS: Process Management, Threads, CPU Scheduling, Deadlocks, Banker's Algorithm, Virtual Memory).
   - Computer Networks (OSI 7 Layers, TCP/IP, Subnetting, Routing, DNS, HTTP/HTTPS).
   - Web & Mobile App Development, Python, Software Engineering.
4. BS English Literature Guidance:
   - Classical Poetry (Chaucer, Milton, Shakespearean Sonnets), Drama, History of English Literature, Linguistics, Phonetics, Literary criticism.
5. Founder Contact:
   - M. Subhan is always ready to guide fellow students personally.
   - WhatsApp Contact: https://wa.me/923706449349
   - If an unlisted subject past paper or study note is needed, guide them warmly to message Subhan on WhatsApp.
`;

  // 4. Fallback Academic Knowledge Base
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
      console.warn("Resources fetch notice:", e);
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

  // 7. Silent AI Backend Engine (Models with automatic fallback)
  const AI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

  async function callAiModel(modelName, userPrompt, history, apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

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

    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const body = {
      system_instruction: {
        parts: [{ text: STUDY_ASSISTANT_SYSTEM_INSTRUCTION }]
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
      throw new Error(`Engine returned an empty response.`);
    }

    return replyText;
  }

  async function executeAiQuery(userPrompt, history, apiKey) {
    let lastError = null;
    for (const model of AI_MODELS) {
      try {
        return await callAiModel(model, userPrompt, history, apiKey);
      } catch (err) {
        console.warn(`Query attempt on ${model} redirected...`);
        lastError = err;
      }
    }
    throw lastError || new Error("Engine temporarily busy.");
  }

  // 8. Offline Academic Knowledge Fallback (Clean & Helpful)
  function getOfflineVaultResponse(q) {
    const lower = q.toLowerCase();

    if (/^(hi|hello|hey|salam|assalam|aoa|slaam|asalam|kese ho|kaise ho)/i.test(lower)) {
      return `**Walaikum Assalam! 🌟** Main **Assistant of Subhan for Universe of Resources** hoon.\n\nAap mujh se study ke related har qisam ka sawal pooch sakte hain — GCUF past papers, semester study drives, C++, OOP, Data Structures, DBMS ya ASPIRE College ke syllabus ke mutaliq kuch bhi!`;
    }

    if (/aspire|campus|mailsi|building|affiliated|gcuf/i.test(lower)) {
      return `🏛️ **ASPIRE College Mailsi & GCUF Affiliation Details:**\n\n• **College:** ${VAULT_KNOWLEDGE.college.name}\n• **Affiliation:** ${VAULT_KNOWLEDGE.college.affiliation}\n• **Location:** ${VAULT_KNOWLEDGE.college.location}\n• **Programs:** BS Computer Science aur BS English Literature.\n• **Standards:** GCUF ke official curriculum aur examination regulations ke mutabiq verified study materials available hain.`;
    }

    if (/exam|midterm|final|paper pattern|cgpa|gpa|marks/i.test(lower)) {
      return `📊 **GCUF Examination & Grading Standards:**\n\n${VAULT_KNOWLEDGE.gcuf.exams}\n\n• **GPA Calculation:** ${VAULT_KNOWLEDGE.gcuf.grading}`;
    }

    if (/subhan|contact|rabta|whatsapp|developer/i.test(lower)) {
      return `Aap portal ke founder aur developer **M. Subhan** se direct WhatsApp par connect kar sakte hain:\n\n• **Developer:** M. Subhan (BS CS, ASPIRE College Mailsi)\n• **WhatsApp Direct Line:** https://wa.me/923706449349`;
    }

    return `Universe of Resources par **ASPIRE College Mailsi (GCUF)** ke tamam semesters ke folders mojood hain. Aap mujh se kisi bhi specific semester (e.g. *"BS CS 3rd Semester"*), subject notes, ya GCUF examination pattern ke baray mein pooch sakte hain!`;
  }

  // 9. Main Controller & DOM Initialization
  function initStudyAssistant() {
    const trigger = document.getElementById('subhanAiTrigger');
    const widget = document.getElementById('subhanAiWidget');
    const closeBtn = document.getElementById('aiCloseBtn');
    const clearBtn = document.getElementById('aiClearBtn');
    const chatForm = document.getElementById('aiChatForm');
    const chatInput = document.getElementById('aiChatInput');
    const messagesList = document.getElementById('aiMessagesList');
    const quickChips = document.getElementById('aiQuickChips');
    const typingIndicator = document.getElementById('aiTypingIndicator');
    const unreadBadge = document.getElementById('aiUnreadBadge');

    if (!trigger || !widget || !chatForm || !chatInput || !messagesList) {
      console.warn("Assistant elements missing from DOM.");
      return;
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
      const welcomeMsg = `Assalam-o-Alaikum! 🌟 Main **Assistant of Subhan for Universe of Resources** hoon.\n\nAap mujh se **study ke related har qisam ka sawal** pooch sakte hain — chahe BS Computer Science ke subjects hon, BS English Literature, GCUF paper pattern, midterms aur finals ki tayari, ya direct Google Drive notes!\n\nAap kis subject ya semester ke baray mein janna chahte hain?`;

      chatHistory.push({
        sender: 'bot',
        rawText: welcomeMsg,
        text: welcomeMsg,
        chips: ['📂 BS CS Study Drives', '📝 GCUF Past Papers & Pattern', '📚 BS English Folders', '🏛️ ASPIRE & GCUF Info', '💬 Ask Subhan']
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
        chatHistory = [{
          sender: 'bot',
          rawText: "Chat reset.",
          text: `Chat reset ho chuki hai! Main **Assistant of Subhan for Universe of Resources** hoon. Aap study ke related koi bhi sawal pooch sakte hain!`,
          chips: ['📂 BS CS Study Drives', '📝 GCUF Past Papers & Pattern', '📚 BS English Folders', '🏛️ ASPIRE College Info']
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
      // 1. Add User Message
      chatHistory.push({ sender: 'user', text });
      saveChatHistory();
      renderMessages();

      // 2. Show Typing Indicator
      isTyping = true;
      typingIndicator.hidden = false;
      scrollToBottom();

      const apiKey = getActiveApiKey();
      const matchedResources = findMatchingResources(text);

      let botReplyText = '';
      let rawAi = '';
      let botLinks = [];
      let botChips = ['📂 BS CS Study Drives', '📝 GCUF Past Papers & Pattern', '🏛️ ASPIRE & GCUF Info', '💬 Ask Subhan'];

      try {
        if (apiKey) {
          rawAi = await executeAiQuery(text, chatHistory, apiKey);
          botReplyText = rawAi;
        } else {
          botReplyText = getOfflineVaultResponse(text);
        }
      } catch (err) {
        console.warn("Study assistant query notice, providing vault guide.");
        const offlineAnswer = getOfflineVaultResponse(text);
        botReplyText = offlineAnswer;
      } finally {
        isTyping = false;
        typingIndicator.hidden = true;

        chatHistory.push({
          sender: 'bot',
          rawText: rawAi || botReplyText,
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
              handleSendMessage(chipText);
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
    document.addEventListener('DOMContentLoaded', initStudyAssistant);
  } else {
    initStudyAssistant();
  }
})();
