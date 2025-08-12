import { logger } from './logger';
import { CharacterResponseStyle } from './response-templates';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export interface ResponseQualityMetrics {
  naturalness: number; // 0-100
  personalityConsistency: number; // 0-100
  relevance: number; // 0-100
  originality: number; // 0-100
  overall: number; // 0-100
}

export class ResponseValidator {
  private static readonly REPETITIVE_PHRASES = [
    'ค่อยๆ', 'เข้าใจ', 'ไม่ต้องกดดัน', 'ผมเชื่อในตัวคุณ',
    'ผมอยู่ตรงนี้เสมอ', 'ทุกอย่างจะผ่านไป', 'ลอง', 'ครับ'
  ];

  private static readonly GENERIC_PHRASES = [
    'โอ้โห', 'โอ้', 'อืม', 'เอ่อ', 'อ่า',
    'oh', 'well', 'um', 'uh', 'hmm'
  ];

  private static readonly PERSONALITY_MARKERS = {
    velorien: {
      positive: ['ผม', 'ครับ', 'อ่อนโยน', 'เข้าใจ', 'เคียงข้าง', 'เงียบๆ'],
      negative: ['ค่ะ', 'ดิฉัน', 'แข็งกร้าว', 'สั่งสอน', 'แก้ไข']
    },
    sherlock: {
      positive: ['analyze', 'deduce', 'logical', 'elementary', 'fascinating', 'observe'],
      negative: ['emotional', 'irrational', 'guess', 'assume']
    },
    hermione: {
      positive: ['read', 'study', 'book', 'learn', 'knowledge', 'help', 'encourage'],
      negative: ['ignore', 'give up', 'lazy', 'stupid']
    }
  };

  static validateResponse(
    response: string,
    characterStyle: CharacterResponseStyle,
    userMessage: string,
    conversationHistory: string[] = []
  ): ValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for repetitive phrases
    const repetitiveCount = this.countRepetitivePhrases(response);
    if (repetitiveCount > 2) {
      issues.push(`Too many repetitive phrases (${repetitiveCount})`);
      score -= 20;
      suggestions.push('Vary your vocabulary and sentence structure');
    }

    // Check for generic AI phrases
    const genericCount = this.countGenericPhrases(response);
    if (genericCount > 1) {
      issues.push(`Contains generic AI phrases (${genericCount})`);
      score -= 15;
      suggestions.push('Use more natural, character-specific language');
    }

    // Check personality consistency
    const personalityScore = this.checkPersonalityConsistency(response, characterStyle);
    if (personalityScore < 70) {
      issues.push('Response doesn\'t match character personality');
      score -= 25;
      suggestions.push(`Stay true to ${characterStyle.characterId}'s personality`);
    }

    // Check response length appropriateness
    const lengthScore = this.checkResponseLength(response, characterStyle);
    if (lengthScore < 70) {
      issues.push('Response length doesn\'t match character style');
      score -= 10;
      suggestions.push(`Adjust response length for ${characterStyle.characterId}`);
    }

    // Check for repetition with conversation history
    const historyRepetition = this.checkHistoryRepetition(response, conversationHistory);
    if (historyRepetition > 0.3) {
      issues.push('Response too similar to previous messages');
      score -= 15;
      suggestions.push('Make your response more unique and fresh');
    }

    // Check language consistency
    const languageScore = this.checkLanguageConsistency(response, characterStyle);
    if (languageScore < 80) {
      issues.push('Language doesn\'t match character style');
      score -= 15;
      suggestions.push(`Use ${characterStyle.language} language appropriately`);
    }

    // Ensure minimum score
    score = Math.max(0, score);

    return {
      isValid: score >= 60,
      score,
      issues,
      suggestions
    };
  }

  static getResponseQualityMetrics(
    response: string,
    characterStyle: CharacterResponseStyle,
    userMessage: string
  ): ResponseQualityMetrics {
    const naturalness = this.calculateNaturalness(response);
    const personalityConsistency = this.checkPersonalityConsistency(response, characterStyle);
    const relevance = this.calculateRelevance(response, userMessage);
    const originality = this.calculateOriginality(response);

    const overall = Math.round((naturalness + personalityConsistency + relevance + originality) / 4);

    return {
      naturalness,
      personalityConsistency,
      relevance,
      originality,
      overall
    };
  }

  private static countRepetitivePhrases(response: string): number {
    const lowerResponse = response.toLowerCase();
    return this.REPETITIVE_PHRASES.filter(phrase => 
      lowerResponse.includes(phrase.toLowerCase())
    ).length;
  }

  private static countGenericPhrases(response: string): number {
    const lowerResponse = response.toLowerCase();
    return this.GENERIC_PHRASES.filter(phrase => 
      lowerResponse.includes(phrase.toLowerCase())
    ).length;
  }

  private static checkPersonalityConsistency(response: string, characterStyle: CharacterResponseStyle): number {
    const characterId = characterStyle.characterId.toLowerCase();
    const markers = this.PERSONALITY_MARKERS[characterId as keyof typeof this.PERSONALITY_MARKERS];
    
    if (!markers) return 80; // Default score for unknown characters

    const lowerResponse = response.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    // Count positive markers
    markers.positive.forEach(marker => {
      if (lowerResponse.includes(marker.toLowerCase())) {
        positiveCount++;
      }
    });

    // Count negative markers
    markers.negative.forEach(marker => {
      if (lowerResponse.includes(marker.toLowerCase())) {
        negativeCount++;
      }
    });

    // Calculate score
    const totalMarkers = markers.positive.length + markers.negative.length;
    const positiveScore = (positiveCount / markers.positive.length) * 100;
    const negativePenalty = (negativeCount / markers.negative.length) * 50;

    return Math.max(0, Math.min(100, positiveScore - negativePenalty));
  }

  private static checkResponseLength(response: string, characterStyle: CharacterResponseStyle): number {
    const wordCount = response.split(/\s+/).length;
    const charCount = response.length;

    switch (characterStyle.responseLength) {
      case 'short':
        return wordCount <= 20 ? 100 : Math.max(0, 100 - (wordCount - 20) * 2);
      case 'medium':
        return wordCount >= 15 && wordCount <= 50 ? 100 : Math.max(0, 100 - Math.abs(wordCount - 32) * 2);
      case 'long':
        return wordCount >= 30 ? 100 : Math.max(0, 100 - (30 - wordCount) * 2);
      default:
        return 80;
    }
  }

  private static checkHistoryRepetition(response: string, conversationHistory: string[]): number {
    if (conversationHistory.length === 0) return 0;

    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    let totalSimilarity = 0;

    conversationHistory.forEach(historyMessage => {
      const historyWords = new Set(historyMessage.toLowerCase().split(/\s+/));
      const intersection = new Set([...responseWords].filter(x => historyWords.has(x)));
      const union = new Set([...responseWords, ...historyWords]);
      const similarity = intersection.size / union.size;
      totalSimilarity += similarity;
    });

    return totalSimilarity / conversationHistory.length;
  }

  private static checkLanguageConsistency(response: string, characterStyle: CharacterResponseStyle): number {
    const thaiWords = (response.match(/[\u0E00-\u0E7F]/g) || []).length;
    const englishWords = (response.match(/[a-zA-Z]+/g) || []).length;
    const totalWords = thaiWords + englishWords;

    if (totalWords === 0) return 80;

    switch (characterStyle.language) {
      case 'thai':
        return thaiWords / totalWords * 100;
      case 'english':
        return englishWords / totalWords * 100;
      case 'mixed':
        return Math.min(100, (Math.min(thaiWords, englishWords) / Math.max(thaiWords, englishWords)) * 100);
      default:
        return 80;
    }
  }

  private static calculateNaturalness(response: string): number {
    let score = 100;

    // Check for overly formal or robotic language
    const formalIndicators = ['therefore', 'thus', 'hence', 'consequently', 'furthermore'];
    const formalCount = formalIndicators.filter(indicator => 
      response.toLowerCase().includes(indicator)
    ).length;
    score -= formalCount * 10;

    // Check for natural conversation flow
    const hasQuestions = /\?/.test(response);
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(response);
    const hasEllipsis = /\.{3,}/.test(response);

    if (hasQuestions) score += 5;
    if (hasEmojis) score += 5;
    if (hasEllipsis) score += 3;

    return Math.max(0, Math.min(100, score));
  }

  private static calculateRelevance(response: string, userMessage: string): number {
    const userWords = new Set(userMessage.toLowerCase().split(/\s+/));
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...userWords].filter(x => responseWords.has(x)));
    const union = new Set([...userWords, ...responseWords]);
    
    return intersection.size / union.size * 100;
  }

  private static calculateOriginality(response: string): number {
    let score = 100;

    // Check for unique vocabulary
    const words = response.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const uniquenessRatio = uniqueWords.size / words.length;
    score = uniquenessRatio * 100;

    // Bonus for creative language
    const creativeElements = [
      /metaphor|simile|analogy/i,
      /story|example|experience/i,
      /imagine|suppose|consider/i
    ];

    creativeElements.forEach(element => {
      if (element.test(response)) score += 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  static suggestImprovements(response: string, characterStyle: CharacterResponseStyle): string[] {
    const suggestions: string[] = [];
    const lowerResponse = response.toLowerCase();

    // Check for repetitive phrases
    if (this.countRepetitivePhrases(response) > 1) {
      suggestions.push('Try using different words instead of repeating the same phrases');
    }

    // Check for generic phrases
    if (this.countGenericPhrases(response) > 0) {
      suggestions.push('Replace generic phrases with more character-specific language');
    }

    // Check personality consistency
    const personalityScore = this.checkPersonalityConsistency(response, characterStyle);
    if (personalityScore < 70) {
      suggestions.push(`Make the response more consistent with ${characterStyle.characterId}'s personality`);
    }

    // Check language consistency
    const languageScore = this.checkLanguageConsistency(response, characterStyle);
    if (languageScore < 80) {
      suggestions.push(`Adjust the language to match ${characterStyle.characterId}'s style`);
    }

    return suggestions;
  }
} 