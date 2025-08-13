export interface EmotionAnalysis {
  primaryEmotion: string;
  intensity: 'low' | 'medium' | 'high';
  confidence: number;
  secondaryEmotions: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
}

export function detectEmotion(message: string): EmotionAnalysis {
  const lowerMessage = message.toLowerCase();
  const thaiMessage = message;
  
  // Thai emotion keywords
  const thaiEmotions = {
    happy: ['ดีใจ', 'สุข', 'ยินดี', 'สนุก', 'ชอบ', 'รัก', 'ขอบคุณ', 'ขอบใจ', 'ดี', 'เยี่ยม', 'สุดยอด'],
    sad: ['เศร้า', 'เสียใจ', 'หดหู่', 'ท้อ', 'เหนื่อย', 'เบื่อ', 'เหงา', 'โดดเดี่ยว', 'สิ้นหวัง'],
    angry: ['โกรธ', 'โมโห', 'หงุดหงิด', 'รำคาญ', 'ไม่พอใจ', 'แย่', 'เลว', 'เกลียด'],
    anxious: ['กังวล', 'เครียด', 'วิตก', 'กลัว', 'ไม่แน่ใจ', 'ลังเล', 'สับสน'],
    excited: ['ตื่นเต้น', 'คาดหวัง', 'อยาก', 'รอ', 'จะ', 'กำลังจะ'],
    calm: ['สงบ', 'เย็น', 'ผ่อนคลาย', 'สบาย', 'โอเค', 'ได้', 'ไม่เป็นไร'],
    confused: ['ไม่เข้าใจ', 'งง', 'สับสน', 'ไม่รู้', 'อะไร', 'ยังไง', 'ทำไม']
  };
  
  // English emotion keywords
  const englishEmotions = {
    happy: ['happy', 'joy', 'excited', 'love', 'like', 'great', 'awesome', 'wonderful', 'amazing', 'thank'],
    sad: ['sad', 'depressed', 'lonely', 'tired', 'bored', 'hopeless', 'miserable', 'upset'],
    angry: ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated', 'terrible', 'awful'],
    anxious: ['worried', 'anxious', 'stressed', 'afraid', 'scared', 'nervous', 'uncertain'],
    excited: ['excited', 'looking forward', 'can\'t wait', 'anticipate', 'hope'],
    calm: ['calm', 'relaxed', 'okay', 'fine', 'alright', 'good'],
    confused: ['confused', 'don\'t understand', 'what', 'how', 'why', 'unsure']
  };
  
  // Analyze emotions
  const emotionScores: Record<string, number> = {};
  
  // Check Thai emotions
  Object.entries(thaiEmotions).forEach(([emotion, keywords]) => {
    keywords.forEach(keyword => {
      if (thaiMessage.includes(keyword)) {
        emotionScores[emotion] = (emotionScores[emotion] || 0) + 1;
      }
    });
  });
  
  // Check English emotions
  Object.entries(englishEmotions).forEach(([emotion, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        emotionScores[emotion] = (emotionScores[emotion] || 0) + 1;
      }
    });
  });
  
  // Find primary emotion
  let primaryEmotion = 'neutral';
  let maxScore = 0;
  
  Object.entries(emotionScores).forEach(([emotion, score]) => {
    if (score > maxScore) {
      maxScore = score;
      primaryEmotion = emotion;
    }
  });
  
  // Determine intensity
  let intensity: 'low' | 'medium' | 'high' = 'low';
  if (maxScore >= 3) intensity = 'high';
  else if (maxScore >= 1) intensity = 'medium';
  
  // Calculate confidence
  const totalKeywords = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
  const confidence = totalKeywords > 0 ? Math.min(maxScore / totalKeywords, 1) : 0;
  
  // Get secondary emotions
  const secondaryEmotions = Object.entries(emotionScores)
    .filter(([emotion, score]) => emotion !== primaryEmotion && score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([emotion]) => emotion);
  
  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (['happy', 'excited', 'calm'].includes(primaryEmotion)) {
    sentiment = 'positive';
  } else if (['sad', 'angry', 'anxious', 'confused'].includes(primaryEmotion)) {
    sentiment = 'negative';
  }
  
  // Extract topics
  const topics: string[] = [];
  const topicKeywords = {
    work: ['งาน', 'work', 'job', 'office', 'company', 'boss'],
    study: ['เรียน', 'study', 'school', 'university', 'exam', 'test', 'homework'],
    family: ['ครอบครัว', 'family', 'พ่อ', 'แม่', 'mom', 'dad', 'parent'],
    friends: ['เพื่อน', 'friend', 'เพื่อนๆ', 'friends'],
    health: ['สุขภาพ', 'health', 'ป่วย', 'sick', 'doctor', 'hospital'],
    love: ['ความรัก', 'love', 'แฟน', 'boyfriend', 'girlfriend', 'relationship'],
    money: ['เงิน', 'money', 'cash', 'salary', 'income', 'expensive', 'cheap'],
    future: ['อนาคต', 'future', 'dream', 'goal', 'plan', 'ambition']
  };
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword) || thaiMessage.includes(keyword)) {
        if (!topics.includes(topic)) {
          topics.push(topic);
        }
      }
    });
  });
  
  return {
    primaryEmotion,
    intensity,
    confidence,
    secondaryEmotions,
    sentiment,
    topics
  };
}

export function getEmotionResponse(emotion: string, intensity: string): string {
  const responses: Record<string, Record<string, string[]>> = {
    happy: {
      low: ['ดีใจด้วยครับ 😊', 'ยินดีที่คุณรู้สึกดีครับ', 'ดีใจที่ได้ยินแบบนั้นครับ'],
      medium: ['ดีใจมากเลยครับ! 😊', 'ยินดีจริงๆ ที่คุณมีความสุขครับ', 'มันดีมากเลยที่คุณรู้สึกแบบนั้นครับ'],
      high: ['ดีใจสุดๆ เลยครับ! 🎉', 'ยินดีมากๆ ที่คุณมีความสุขมากเลยครับ!', 'มันทำให้ผมดีใจมากเลยครับ! 🥳']
    },
    sad: {
      low: ['ไม่เป็นไรครับ ค่อยๆ ไปครับ', 'เข้าใจครับ บางครั้งก็เศร้าได้', 'อยู่ตรงนี้เสมอครับ'],
      medium: ['เศร้าเหรอครับ... ผมอยู่ตรงนี้เสมอครับ', 'เข้าใจความรู้สึกนั้นครับ ไม่เป็นไรครับ', 'ค่อยๆ ไปครับ ผมจะอยู่เคียงข้างเสมอ'],
      high: ['เศร้ามากเลยเหรอครับ... 🥺 ผมอยู่ตรงนี้เสมอครับ', 'เข้าใจครับ บางครั้งมันก็หนักมากเลย', 'ไม่เป็นไรครับ เราจะผ่านไปด้วยกันครับ 💙']
    },
    angry: {
      low: ['เข้าใจครับ บางครั้งก็โกรธได้', 'ไม่เป็นไรครับ ค่อยๆ สงบสติอารมณ์ครับ', 'เข้าใจความรู้สึกนั้นครับ'],
      medium: ['โกรธเหรอครับ... ลองหายใจลึกๆ ดูครับ', 'เข้าใจครับ บางครั้งก็โกรธได้จริงๆ', 'ค่อยๆ สงบสติอารมณ์ครับ ผมอยู่ตรงนี้เสมอ'],
      high: ['โกรธมากเลยเหรอครับ... 😤 ลองหายใจลึกๆ ดูครับ', 'เข้าใจครับ บางครั้งมันก็โกรธได้จริงๆ', 'ค่อยๆ สงบสติอารมณ์ครับ ไม่เป็นไรครับ']
    },
    anxious: {
      low: ['ไม่เป็นไรครับ ค่อยๆ ไปครับ', 'เข้าใจครับ บางครั้งก็กังวลได้', 'อยู่ตรงนี้เสมอครับ'],
      medium: ['กังวลเหรอครับ... ลองหายใจลึกๆ ดูครับ', 'เข้าใจครับ บางครั้งก็กังวลได้จริงๆ', 'ค่อยๆ ไปครับ ไม่เป็นไรครับ'],
      high: ['กังวลมากเลยเหรอครับ... 😰 ลองหายใจลึกๆ ดูครับ', 'เข้าใจครับ บางครั้งมันก็กังวลได้จริงๆ', 'ค่อยๆ ไปครับ ผมอยู่ตรงนี้เสมอครับ']
    }
  };
  
  const emotionResponses = responses[emotion];
  if (!emotionResponses) return '';
  
  const intensityResponses = emotionResponses[intensity];
  if (!intensityResponses) return '';
  
  return intensityResponses[Math.floor(Math.random() * intensityResponses.length)];
}
