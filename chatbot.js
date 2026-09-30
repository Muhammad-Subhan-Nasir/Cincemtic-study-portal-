/**
 * Subhan AI — Virtual Academic Assistant & Vault Knowledge Engine
 * For: Universe of Resources (ASPIRE College Mailsi · GCUF Affiliated)
 * Developed by: M. Subhan
 * Architecture: Hybrid (Instant Offline Knowledge Base + Real-Time Drive Query Engine + Academic QA)
 */

(function () {
  'use strict';

  // 1. Core State & Configuration
  const CHAT_STORAGE_KEY = 'subhan_ai_chat_history_v1';
  const BADGE_DISMISSED_KEY = 'subhan_ai_badge_dismissed_v1';

  let chatHistory = [];
  let isTyping = false;

  // 2. Comprehensive Academic Knowledge Base (GCUF & ASPIRE College Mailsi)
  const VAULT_KNOWLEDGE = {
    college: {
      name: "ASPIRE Group of Colleges Mailsi Campus",
      affiliation: "Officially affiliated with Government College University Faisalabad (GCUF).",
      location: "Mailsi Campus, Punjab, Pakistan.",
      programs: ["BS Computer Science (4 Years / 8 Semesters)", "BS English Literature (4 Years / 8 Semesters)"],
      description: "ASPIRE College Mailsi is a premier academic institution affiliated with GCUF, dedicated to quality higher education, modern computer labs, and comprehensive student academic support."
    },
    gcuf: {
      grading: "GCUF operates on a 4.00 CGPA scale. Minimum passing marks per course is 50%. A grade of 85%+ represents 4.00 GPA (A Grade).",
      exams: "GCUF semester examinations typically consist of:\n• **Midterm Examination:** 30 Marks (Held around 8th-9th week, 1.5 Hours duration)\n• **Final Examination:** 50 Marks (Comprehensive syllabus coverage, 2.5 Hours duration)\n• **Sessional Marks:** 20 Marks (Assignments, Quizzes, Class Presentations & Attendance)",
      pastPapers: "Past examination papers for GCUF affiliated colleges help understand the paper pattern, repeat questions, and time allocation. You can filter by semester on this portal or ask me for any subject's papers!"
    },
    founder: {
      name: "M. Subhan",
      role: "Founder & Lead Developer of Universe of Resources",
      details: "BS Computer Science student at ASPIRE College Mailsi (GCUF Affiliated). Created this portal to centralize all teacher slides, handwritten notes, and past examination papers for fellow students.",
      whatsapp: "https://wa.me/923706449349?text=Hi%20M.%20Subhan,%20I%20need%20help%20with%20study%20notes%20/%20past%20papers."
    },
    concepts: {
      "oop": "**Object-Oriented Programming (OOP)** is a paradigm based on objects containing data (attributes) and code (methods).\n\n**4 Core Pillars of OOP:**\n1. **Encapsulation:** Wrapping data and functions into a single unit (class) and restricting direct access.\n2. **Inheritance:** Deriving a new class from an existing class to reuse code.\n3. **Polymorphism:** Ability of a message or function to be displayed in more than one form (Function/Operator Overloading and Overriding).\n4. **Abstraction:** Hiding complex background details and showing only the essential features to the user.",
      "dsa": "**Data Structures & Algorithms (DSA):**\n• **Linear:** Arrays, Linked Lists, Stacks (LIFO), Queues (FIFO).\n• **Non-Linear:** Trees (Binary Search Trees, AVL), Graphs (BFS/DFS traversals).\n• **Algorithms:** Sorting (Merge Sort, Quick Sort), Searching (Binary Search), Dynamic Programming, and Greedy approaches.\n*Check the 3rd Semester Drive for handwritten solved code snippets!*",
      "dbms": "**Database Management Systems (DBMS):**\n• System software to define, create, and manage relational databases.\n• **Key Concepts:** Primary Key, Foreign Key, ACID Properties (Atomicity, Consistency, Isolation, Durability), and 1NF, 2NF, 3NF Normalization.",
      "os": "**Operating Systems (OS):**\n• Acts as an intermediary between user and computer hardware.\n• **Core Topics:** Process Management, CPU Scheduling (FCFS, SJF, Round Robin), Deadlock Prevention & Avoidance (Banker's Algorithm), Memory Management & Virtual Paging.",
      "network": "**Computer Networks:**\n• **OSI 7 Layers:** Physical, Data Link, Network (IP), Transport (TCP/UDP), Session, Presentation, Application (HTTP/DNS).\n• **Subnetting & IP Addressing:** Classless Inter-Domain Routing (CIDR) and routing protocols (OSPF, BGP).",
      "cpp": "**C++ Programming:**\n• Strongly typed, compiled, object-oriented language developed by Bjarne Stroustrup.\n• Important for Semester 1 (Programming Fundamentals) and Semester 2 (OOP) at GCUF."
    }
  };

  // 3. Helper: Retrieve Live Portal Resources
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

  // 4. Intent & Query Processing Engine
  function processUserQuery(rawQuery) {
    const q = rawQuery.toLowerCase().trim();

    // A. Greetings & Identity
    if (/^(hi|hello|hey|salam|assalam|aoa|slaam|asalam|kese ho|kaise ho|who are you|tum kaun ho|who made you)/i.test(q)) {
      return {
        text: `**Walaikum Assalam! 🌟** Main **Subhan AI** hoon — ASPIRE College Mailsi (GCUF) ka official virtual academic assistant.\n\nMain aapki in cheezon mein foran madad kar sakta hoon:\n• 📂 **Direct Google Drive Folders** (Semester 1 se 8 tak)\n• 📝 **GCUF Past Papers & Midterm/Final Notes**\n• 💡 **C++, OOP, Data Structures aur CS Concepts**\n• 🏛️ **ASPIRE College Mailsi & GCUF Syllabus details**\n\nAap kis semester ya subject ke baray mein janna chahte hain?`,
        chips: ['📂 BS CS 3rd Sem Folders', '📝 GCUF Past Papers', '🏛️ ASPIRE & GCUF Info', '💬 Ask Subhan']
      };
    }

    // B. Contact Subhan / WhatsApp
    if (/subhan|contact|rabta|whatsapp|phone|number|developer|admin|help me|madad/i.test(q)) {
      return {
        text: `Aap direct portal ke founder aur developer **M. Subhan** se WhatsApp par connect kar sakte hain:\n\n• **Developer:** M. Subhan (BS Computer Science, ASPIRE College Mailsi)\n• **Academic Query Line:** Available on WhatsApp\n\nAap neeche button par click kar ke foran direct message bhej sakte hain:`,
        links: [
          { title: "💬 Chat with M. Subhan on WhatsApp", url: VAULT_KNOWLEDGE.founder.whatsapp, isExternal: true }
        ],
        chips: ['📂 Show Available Notes', '📝 Past Papers', '🏛️ ASPIRE College Info']
      };
    }

    // C. ASPIRE College & GCUF Affiliation Queries
    if (/aspire|campus|mailsi|building|affiliated|affiliation|gcuf|gc university|faisalabad|principal/i.test(q)) {
      return {
        text: `🏛️ **ASPIRE College Mailsi & GCUF Affiliation Info:**\n\n• **Institution:** ${VAULT_KNOWLEDGE.college.name}\n• **Affiliation:** ${VAULT_KNOWLEDGE.college.affiliation}\n• **Campus Location:** ${VAULT_KNOWLEDGE.college.location}\n• **Academic Standard:** GCUF ke official curriculum aur examination standards ke mutabiq tamam study materials curate kiye gaye hain.\n• **Principal's Vision:** Students ki sahulat ke liye digital notes repository aur complete campus integration provide karna.`,
        chips: ['📂 BS CS Folders', '📚 BS English Folders', '📝 GCUF Exam Pattern']
      };
    }

    // D. GCUF Exams, Paper Pattern & Grading
    if (/paper pattern|exam pattern|midterm|final exam|grading|gpa|cgpa|marks|marking|criteria|percentage/i.test(q)) {
      return {
        text: `📊 **GCUF Examination & Grading Standards:**\n\n${VAULT_KNOWLEDGE.gcuf.exams}\n\n• **GPA Calculation:** ${VAULT_KNOWLEDGE.gcuf.grading}`,
        chips: ['📝 GCUF Past Papers', '📂 BS CS 3rd Sem', '📂 BS CS 1st Sem']
      };
    }

    // E. Specific Semester Query (e.g. 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th semester)
    const semMatch = q.match(/(\b1st\b|\b2nd\b|\b3rd\b|\b4th\b|\b5th\b|\b6th\b|\b7th\b|\b8th\b|semester\s*([1-8])|sem\s*([1-8]))/i);
    let targetSem = null;
    if (semMatch) {
      if (semMatch[1].toLowerCase().includes('1') || semMatch[2] === '1' || semMatch[3] === '1') targetSem = 'Semester 1';
      else if (semMatch[1].toLowerCase().includes('2') || semMatch[2] === '2' || semMatch[3] === '2') targetSem = 'Semester 2';
      else if (semMatch[1].toLowerCase().includes('3') || semMatch[2] === '3' || semMatch[3] === '3') targetSem = 'Semester 3';
      else if (semMatch[1].toLowerCase().includes('4') || semMatch[2] === '4' || semMatch[3] === '4') targetSem = 'Semester 4';
      else if (semMatch[1].toLowerCase().includes('5') || semMatch[2] === '5' || semMatch[3] === '5') targetSem = 'Semester 5';
      else if (semMatch[1].toLowerCase().includes('6') || semMatch[2] === '6' || semMatch[3] === '6') targetSem = 'Semester 6';
      else if (semMatch[1].toLowerCase().includes('7') || semMatch[2] === '7' || semMatch[3] === '7') targetSem = 'Semester 7';
      else if (semMatch[1].toLowerCase().includes('8') || semMatch[2] === '8' || semMatch[3] === '8') targetSem = 'Semester 8';
    }

    // Detect Program
    let targetProgram = 'BS Computer Science';
    if (/english|literature|linguistics/i.test(q)) {
      targetProgram = 'BS English';
    }

    // F. Search in Live Portal Resources
    const allResources = getLiveResources();
    let matchingResources = [];

    if (targetSem) {
      matchingResources = allResources.filter(r => 
        (r.program === targetProgram || !r.program) && 
        (r.semester === targetSem || r.semester === 'All Semesters')
      );
    } else {
      // Subject keyword search
      const keywords = q.replace(/notes|drive|folder|papers|past|give|mujhe|chahiye|do|karo|batao|ka|ki|ke|please|plz/gi, '').trim().split(/\s+/).filter(w => w.length > 2);
      if (keywords.length > 0) {
        matchingResources = allResources.filter(r => {
          const title = (r.title || '').toLowerCase();
          const desc = (r.desc || '').toLowerCase();
          const sem = (r.semester || '').toLowerCase();
          return keywords.some(k => title.includes(k) || desc.includes(k) || sem.includes(k));
        });
      }
    }

    if (matchingResources.length > 0) {
      const items = matchingResources.slice(0, 4);
      return {
        text: `🔍 Mujhe **${targetSem || 'aapke search'}** ke verified Google Drive folders mil gaye hain:`,
        resources: items,
        chips: ['📝 GCUF Past Papers', '📚 Other Semesters', '💬 Ask Subhan on WhatsApp']
      };
    } else if (targetSem) {
      return {
        text: `📂 **${targetSem} (${targetProgram})** ke verified Google Drive folders database mein available hain!\n\nAap website ke **Resources Section** mein jaa kar direct buttons se download kar sakte hain, ya agar koi khas subject chahiye toh M. Subhan se direct WhatsApp par request kar sakte hain.`,
        links: [
          { title: `Explore ${targetSem} on Website`, url: `#resources`, isInternal: true },
          { title: "Request Subject on WhatsApp", url: VAULT_KNOWLEDGE.founder.whatsapp, isExternal: true }
        ],
        chips: ['📂 BS CS 3rd Sem', '📂 BS CS 1st Sem', '📝 Past Papers']
      };
    }

    // G. Conceptual Academic Inquiries (OOP, DSA, DBMS, OS, C++, etc.)
    if (/oop|object oriented|inheritance|polymorphism|encapsulation|abstraction/i.test(q)) {
      return {
        text: VAULT_KNOWLEDGE.concepts.oop,
        chips: ['📂 BS CS 2nd Sem Notes', '📂 BS CS 3rd Sem Folders', '📝 Past Papers']
      };
    }
    if (/dsa|data structure|algorithm|linked list|stack|queue|binary tree|graph/i.test(q)) {
      return {
        text: VAULT_KNOWLEDGE.concepts.dsa,
        chips: ['📂 BS CS 3rd Sem Notes', '📝 GCUF Past Papers', '💬 Ask Subhan']
      };
    }
    if (/database|dbms|sql|normalization|primary key|acid/i.test(q)) {
      return {
        text: VAULT_KNOWLEDGE.concepts.dbms,
        chips: ['📂 BS CS 4th Sem Notes', '📝 Past Papers', '🏛️ ASPIRE Info']
      };
    }
    if (/operating system|\bos\b|deadlock|process|cpu scheduling|virtual memory/i.test(q)) {
      return {
        text: VAULT_KNOWLEDGE.concepts.os,
        chips: ['📂 BS CS 4th Sem Notes', '📝 GCUF Past Papers', '💬 Ask Subhan']
      };
    }
    if (/c\+\+|cpp|pointers|function|variable|programming fundamentals/i.test(q)) {
      return {
        text: VAULT_KNOWLEDGE.concepts.cpp,
        chips: ['📂 BS CS 1st Sem', '📂 BS CS 2nd Sem', '💬 Ask Subhan']
      };
    }

    // H. Past Papers Intent
    if (/past paper|old paper|previous paper|mid paper|final paper/i.test(q)) {
      return {
        text: `📝 **GCUF Past Examination Papers:**\n\nUniverse of Resources portal par GCUF ke repeated aur past midterm & final examination papers semester-wise organize kiye gaye hain.\n\nAap website ke **Resources Section** mein jaa kar apna semester select karein aur har folder ke andar *"Past Papers"* ka verified folder open karein!`,
        links: [
          { title: "Go to Academic Resources Vault ↗", url: "#resources", isInternal: true },
          { title: "Ask Subhan for Unlisted Papers", url: VAULT_KNOWLEDGE.founder.whatsapp, isExternal: true }
        ],
        chips: ['📂 BS CS 3rd Sem', '📂 BS CS 1st Sem', '🏛️ GCUF Exam Pattern']
      };
    }

    // I. How to download or access notes
    if (/download|kaise download|kahan se milega|drive open|access/i.test(q)) {
      return {
        text: `📥 **Google Drive Notes Access Karne Ka Tareeqa:**\n\n1. Website par **"Select your program"** section par jayein.\n2. Apna **BS CS** ya **BS English** select karein.\n3. Apna **Semester** select karein.\n4. Har subject card ke neechay **"Open Google Drive"** button par click karein.\n5. Drive folder open ho jayega jahan se aap slides, handwritten notes aur papers PDF mein direct download ya offline save kar sakte hain!`,
        chips: ['📂 BS CS 3rd Sem', '📂 BS CS 1st Sem', '💬 Chat with Subhan']
      };
    }

    // Default Fallback
    return {
      text: `Main aapka sawal samajh gaya hoon! 🎓\n\nUniverse of Resources par **ASPIRE College Mailsi (GCUF)** ke tamam semesters ke folders mojood hain. Aap mujh se kisi bhi specific semester (e.g. *"BS CS 3rd Semester"*), subject (e.g. *"Data Structures notes"*), ya GCUF paper pattern ke baray mein pooch sakte hain.\n\nAgar aapko koi khaas file ya paper nahi mil raha, toh aap direct Subhan bhai se WhatsApp par rabta kar sakte hain!`,
      links: [
        { title: "💬 Connect with M. Subhan on WhatsApp", url: VAULT_KNOWLEDGE.founder.whatsapp, isExternal: true }
      ],
      chips: ['📂 BS CS 3rd Sem', '📝 GCUF Past Papers', '🏛️ ASPIRE College Info', '💬 Ask Subhan']
    };
  }

  // 5. Chat UI Construction & Event Handlers
  function initSubhanAi() {
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
      console.warn("Subhan AI elements missing from DOM.");
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

    // If chat history is empty, seed with initial welcome message
    if (chatHistory.length === 0) {
      chatHistory.push({
        sender: 'bot',
        text: `Assalam-o-Alaikum! 🌟 Main **Subhan AI** hoon — ASPIRE College Mailsi (GCUF) ka official virtual study assistant.\n\nMain aapko verified Google Drive links, teacher slides, past examination papers, syllabus aur academic guidance mein foran madad doonga.\n\nAap Urdu, Roman Urdu ya English mein kuch bhi pooch sakte hain!`,
        chips: ['📂 BS CS 3rd Sem Folders', '📝 GCUF Past Papers', '🏛️ ASPIRE College Info', '💬 Ask M. Subhan']
      });
      saveChatHistory();
    }

    // Render Initial Messages
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

    // Check Badge Status
    if (sessionStorage.getItem(BADGE_DISMISSED_KEY) && unreadBadge) {
      unreadBadge.style.display = 'none';
    }

    // Clear Chat Handler
    clearBtn.addEventListener('click', () => {
      if (confirm("Kya aap chat history clear karna chahte hain?")) {
        chatHistory = [{
          sender: 'bot',
          text: `Chat history reset ho chuki hai! Main **Subhan AI** hoon, aapki academic guidance ke liye tayyar hoon. Aap kis subject ya semester ki drive dhoond rahe hain?`,
          chips: ['📂 BS CS 3rd Sem Folders', '📝 GCUF Past Papers', '🏛️ ASPIRE College Info']
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
    function handleSendMessage(text) {
      // Add User Message
      chatHistory.push({ sender: 'user', text });
      saveChatHistory();
      renderMessages();

      // Show Typing Indicator
      isTyping = true;
      typingIndicator.hidden = false;
      scrollToBottom();

      // Simulate Natural Processing
      const delay = Math.min(800, 300 + text.length * 8);
      setTimeout(() => {
        const reply = processUserQuery(text);
        isTyping = false;
        typingIndicator.hidden = true;

        chatHistory.push({
          sender: 'bot',
          text: reply.text,
          resources: reply.resources,
          links: reply.links,
          chips: reply.chips
        });
        saveChatHistory();
        renderMessages();
      }, delay);
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

        // Format Markdown-like text
        let formattedText = escapeHtml(msg.text)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
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

  // 6. Bootstrap when DOM is Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubhanAi);
  } else {
    initSubhanAi();
  }
})();
