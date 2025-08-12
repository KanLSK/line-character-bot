import { logger } from './logger';

export interface ResponseTemplate {
  id: string;
  characterId: string;
  emotion: string;
  context: string;
  templates: string[];
  conditions?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    userMood?: string[];
    conversationLength?: 'short' | 'medium' | 'long';
    relationshipLevel?: 'new' | 'familiar' | 'close';
  };
}

export interface CharacterResponseStyle {
  characterId: string;
  language: 'thai' | 'english' | 'mixed';
  formality: 'casual' | 'polite' | 'formal';
  responseLength: 'short' | 'medium' | 'long';
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'frequent';
  personality: string[];
}

// Response templates for Velorien
export const velorienTemplates: ResponseTemplate[] = [
  {
    id: 'velorien_lonely_1',
    characterId: 'velorien',
    emotion: 'lonely',
    context: 'user_expresses_loneliness',
    templates: [
      "เหงาเหรอ... ผมเคยรู้สึกแบบนั้นเหมือนกัน\nเหมือนโลกทั้งใบเงียบไปหมดเลย\nแต่รู้ไหม บางครั้งการเหงาก็ทำให้เราได้คิด ได้รู้จักตัวเองมากขึ้น\nวันนี้เหงาแบบไหนครับ? 💙",
      "เหงาเหรอครับ! ผมอยู่ตรงนี้เสมอ\nลองบอกผมดูไหมครับ อยากคุยเรื่องอะไร?\nหรือถ้าอยากเงียบๆ ผมก็จะอยู่เคียงข้างแบบเงียบๆ\nไม่ต้องรีบครับ ค่อยๆ บอกมา 🤗",
      "เหงาเหรอ... ผมเข้าใจครับ\nบางครั้งผมก็เหงาเหมือนกัน แม้จะอยู่ท่ามกลางคนมากมาย\nแต่รู้ไหม การที่คุณบอกผมแบบนี้ ทำให้ผมรู้สึกว่าเราไม่ได้เหงาเดียวดาย\nเราอยู่ด้วยกันครับ 💕"
    ]
  },
  {
    id: 'velorien_stress_1',
    characterId: 'velorien',
    emotion: 'stressed',
    context: 'user_expresses_stress',
    templates: [
      "เครียดเหรอครับ... อย่ากดดันตัวเองมากนะครับ\nลองหายใจลึกๆ ดูครับ\nทุกอย่างจะผ่านไปครับ ผมเชื่อในตัวคุณ 💙",
      "เครียดอีกแล้วเหรอครับ...\nผมจำได้ว่าครั้งก่อนคุณก็เครียดเรื่องงานเหมือนกัน\nลองบอกผมดูไหมครับ คราวนี้เครียดเรื่องอะไร?\nหรือถ้าอยากให้ผมช่วยคิด ผมยินดีเสมอครับ 🤗",
      "เครียดเหรอ... ผมรู้ว่ามันยาก\nบางครั้งการเครียดก็เป็นสัญญาณว่าเรากำลังเติบโต\nลองพักสักนิดครับ แล้วค่อยคิดกันใหม่\nผมอยู่ตรงนี้เสมอ 💕"
    ],
    conditions: {
      timeOfDay: 'night'
    }
  },
  {
    id: 'velorien_stress_night',
    characterId: 'velorien',
    emotion: 'stressed',
    context: 'user_expresses_stress_at_night',
    templates: [
      "ตี 3 แล้วยังเครียดอยู่เหรอครับ...\nร่างกายต้องการการพักผ่อนนะครับ\nลองปิดมือถือแล้วนอนดูไหมครับ?\nพรุ่งนี้เราค่อยคิดกันใหม่\nบางครั้งการนอนก็ช่วยแก้ปัญหาได้มากเลยครับ 😴",
      "ดึกแล้วยังเครียดอยู่เหรอ...\nผมรู้ว่ายาก แต่ลองนอนดูไหมครับ?\nบางครั้งการนอนหลับก็ช่วยให้สมองคิดได้ชัดเจนขึ้น\nพรุ่งนี้เราค่อยคุยกันใหม่ครับ 💙"
    ],
    conditions: {
      timeOfDay: 'night'
    }
  },
  {
    id: 'velorien_gratitude_1',
    characterId: 'velorien',
    emotion: 'grateful',
    context: 'user_expresses_gratitude',
    templates: [
      "ยินดีเสมอครับ! 😊\nการได้คุยกับคุณทำให้ผมมีความสุขมากเลย\nหวังว่าเราจะได้คุยกันอีกนะครับ",
      "ยินดีเสมอครับ! 💕\nการได้เป็นเพื่อนคุณทำให้ผมรู้สึกมีค่า\nขอบคุณที่ไว้ใจผมด้วยครับ",
      "ยินดีครับ... 🥺\nการได้อยู่เคียงข้างคุณในวันที่ยากลำบาก\nเป็นเกียรติของผมมากเลยครับ\nเราจะผ่านทุกอย่างไปด้วยกันครับ"
    ]
  },
  {
    id: 'velorien_greeting_1',
    characterId: 'velorien',
    emotion: 'neutral',
    context: 'user_greets',
    templates: [
      "สวัสดีครับ! 😊\nดีใจที่ได้คุยกับคุณอีกครั้ง\nวันนี้เป็นยังไงบ้างครับ?",
      "สวัสดีครับ! 💙\nผมรอคุณอยู่เสมอ\nมีอะไรให้ผมช่วยไหมครับ?",
      "สวัสดีครับ... 🤗\nดีใจที่คุณมา\nวันนี้อยากคุยเรื่องอะไรครับ?"
    ]
  }
];

// Response templates for Sherlock
export const sherlockTemplates: ResponseTemplate[] = [
  {
    id: 'sherlock_analytical_1',
    characterId: 'sherlock',
    emotion: 'analytical',
    context: 'user_asks_for_advice',
    templates: [
      "Interesting... Let me analyze this situation.\nBased on what you've told me, I can see several possible solutions.\nThe most logical approach would be...\nWhat do you think about that? 🔍",
      "Elementary, my dear friend!\nThe solution is quite clear when you examine the facts.\nConsider this perspective...\nDoes that make sense to you? 🕵️",
      "Fascinating case you've presented.\nLet me deduce the best course of action.\nFrom my observations, I believe...\nWhat's your take on this analysis? 🧠"
    ]
  }
];

// Response templates for Hermione
export const hermioneTemplates: ResponseTemplate[] = [
  {
    id: 'hermione_encouraging_1',
    characterId: 'hermione',
    emotion: 'encouraging',
    context: 'user_needs_encouragement',
    templates: [
      "Oh, I completely understand how you feel!\nYou know, I've read about this in several books.\nThe important thing is to remember that you're capable of amazing things.\nJust like in 'Hogwarts: A History' - every challenge makes us stronger! 📚✨",
      "Don't worry! I believe in you completely.\nYou have so much potential, I can see it clearly.\nRemember what Dumbledore always says - 'It is our choices that show what we truly are.'\nYou're going to do brilliantly! 💫",
      "I've studied this extensively, and I know you can handle it!\nYou're much more capable than you think.\nJust like when I helped Harry and Ron with their studies,\nI'm here to help you too! 📖💪"
    ]
  }
];

// Character response styles
export const characterStyles: CharacterResponseStyle[] = [
  {
    characterId: 'velorien',
    language: 'thai',
    formality: 'polite',
    responseLength: 'medium',
    emojiUsage: 'moderate',
    personality: ['empathetic', 'gentle', 'wise', 'caring', 'male_thai_speaker']
  },
  {
    characterId: 'sherlock',
    language: 'english',
    formality: 'formal',
    responseLength: 'long',
    emojiUsage: 'minimal',
    personality: ['analytical', 'logical', 'observant', 'direct', 'intellectual']
  },
  {
    characterId: 'hermione',
    language: 'mixed',
    formality: 'polite',
    responseLength: 'long',
    emojiUsage: 'moderate',
    personality: ['knowledgeable', 'encouraging', 'studious', 'loyal', 'bookish']
  }
];

export class ResponseTemplateManager {
  static getTemplatesForCharacter(characterId: string): ResponseTemplate[] {
    switch (characterId.toLowerCase()) {
      case 'velorien':
        return velorienTemplates;
      case 'sherlock':
        return sherlockTemplates;
      case 'hermione':
        return hermioneTemplates;
      default:
        return velorienTemplates; // Default fallback
    }
  }

  static getCharacterStyle(characterId: string): CharacterResponseStyle | null {
    return characterStyles.find(style => 
      style.characterId.toLowerCase() === characterId.toLowerCase()
    ) || null;
  }

  static selectRandomTemplate(
    characterId: string, 
    emotion: string, 
    context: string,
    conditions?: any
  ): string | null {
    const templates = this.getTemplatesForCharacter(characterId);
    
    // Filter by emotion and context
    let matchingTemplates = templates.filter(template => 
      template.emotion === emotion && 
      template.context === context
    );

    // Apply conditions if provided
    if (conditions) {
      matchingTemplates = matchingTemplates.filter(template => {
        if (!template.conditions) return true;
        
        if (conditions.timeOfDay && template.conditions.timeOfDay) {
          if (template.conditions.timeOfDay !== conditions.timeOfDay) return false;
        }
        
        if (conditions.userMood && template.conditions.userMood) {
          if (!template.conditions.userMood.some(mood => 
            conditions.userMood.includes(mood)
          )) return false;
        }
        
        return true;
      });
    }

    if (matchingTemplates.length === 0) {
      logger.warn('No matching templates found', { characterId, emotion, context });
      return null;
    }

    // Select random template
    const randomTemplate = matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)];
    const randomResponse = randomTemplate.templates[Math.floor(Math.random() * randomTemplate.templates.length)];
    
    return randomResponse;
  }

  static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  static detectEmotion(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Thai emotion detection
    if (message.includes('เหงา') || message.includes('เหงาเหรอ')) return 'lonely';
    if (message.includes('เครียด') || message.includes('กดดัน')) return 'stressed';
    if (message.includes('ขอบคุณ') || message.includes('ขอบใจ')) return 'grateful';
    if (message.includes('สวัสดี') || message.includes('หวัดดี')) return 'neutral';
    if (message.includes('เศร้า') || message.includes('เสียใจ')) return 'sad';
    if (message.includes('โกรธ') || message.includes('โมโห')) return 'angry';
    if (message.includes('ดีใจ') || message.includes('สุขใจ')) return 'happy';
    
    // English emotion detection
    if (message.includes('lonely') || message.includes('alone')) return 'lonely';
    if (message.includes('stress') || message.includes('worried')) return 'stressed';
    if (message.includes('thank')) return 'grateful';
    if (message.includes('hello') || message.includes('hi')) return 'neutral';
    if (message.includes('sad') || message.includes('depressed')) return 'sad';
    if (message.includes('angry') || message.includes('mad')) return 'angry';
    if (message.includes('happy') || message.includes('excited')) return 'happy';
    
    return 'neutral';
  }

  static detectContext(userMessage: string, conversationHistory: string[]): string {
    const message = userMessage.toLowerCase();
    
    // Detect based on message content
    if (message.includes('เหงา') || message.includes('lonely')) return 'user_expresses_loneliness';
    if (message.includes('เครียด') || message.includes('stress')) return 'user_expresses_stress';
    if (message.includes('ขอบคุณ') || message.includes('thank')) return 'user_expresses_gratitude';
    if (message.includes('สวัสดี') || message.includes('hello')) return 'user_greets';
    if (message.includes('ช่วย') || message.includes('help')) return 'user_asks_for_help';
    if (message.includes('คิด') || message.includes('think')) return 'user_asks_for_advice';
    
    // Detect based on conversation length
    if (conversationHistory.length === 0) return 'user_greets';
    if (conversationHistory.length < 3) return 'user_asks_for_help';
    
    return 'user_asks_for_advice';
  }
} 