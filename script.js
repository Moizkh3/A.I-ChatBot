document.getElementById("userInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  async function sendMessage() {
    const input = document.getElementById("userInput");
    const chatWindow = document.getElementById("chatWindow");
    const userMessage = input.value.trim();
    if (!userMessage) return;
  
    appendMessage(userMessage, "user");
    input.value = "";
  
    const thinkingMsg = appendMessage("Thinking...", "bot", true);
  
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer ", // <-- Replace with your API key
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-prover-v2:free",
          messages: [
            {
              role: "user",
              content: userMessage
            }
          ]
        })
      });
  
      const data = await response.json();
      console.log("API response:", data);
  
      // Handle API errors
      if (data.error) {
        updateMessage(thinkingMsg, "API Error: " + data.error.message);
        return;
      }
  
      const rawReply = data.choices?.[0]?.message?.content;
      const cleanedReply = cleanLatex(rawReply || '');
  
      if (!rawReply) {
        updateMessage(thinkingMsg, "No response received.");
      } else {
        updateMessage(thinkingMsg, marked.parse(cleanedReply), true); // Markdown render
      }
  
    } catch (error) {
      updateMessage(thinkingMsg, "Fetch Error: " + error.message);
    }
  }
  
  function appendMessage(message, sender, isRaw = false) {
    const chatWindow = document.getElementById("chatWindow");
  
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = isRaw ? escapeHTML(message) : message;
  
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  
    return msgDiv; // Return the message element for future updates
  }
  
  function updateMessage(msgElement, newContent, isMarkdown = false) {
    msgElement.innerHTML = isMarkdown ? newContent : escapeHTML(newContent);
  }
  
  function escapeHTML(text) {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  
  function cleanLatex(text) {
    return text.replace(/\\boxed\{([^}]*)\}/g, '$1');
  }
  