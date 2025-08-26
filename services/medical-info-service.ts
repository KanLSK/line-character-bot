import { connectToDatabase } from '../lib/db-utils';
import MedicalCamp from '../models/MedicalCamp';
import { logger } from '../utils/logger';

export interface MedicalInfoResponse {
  success: boolean;
  response: string;
  camps?: any[];
  error?: string;
}

/**
 * Detects if the user message is in Thai or English
 */
function detectLanguage(message: string): 'thai' | 'english' {
  const thaiPattern = /[\u0E00-\u0E7F]/;
  return thaiPattern.test(message) ? 'thai' : 'english';
}

/**
 * Generates professional medical camp information responses
 */
export async function generateMedicalInfoResponse(
  userMessage: string,
  userId: string
): Promise<MedicalInfoResponse> {
  try {
    await connectToDatabase();
    
    // Detect language
    const language = detectLanguage(userMessage);
    
    // Extract keywords from user message
    const keywords = extractKeywords(userMessage.toLowerCase());
    
    // Get all active medical camps
    const camps = await MedicalCamp.find({ isActive: true }).sort({ createdAt: -1 });
    
    if (camps.length === 0) {
      return {
        success: true,
        response: language === 'thai' 
          ? "ขออภัยครับ ขณะนี้ยังไม่มีข้อมูลค่ายแพทย์ศิริราช 2025 ที่เปิดให้บริการ กรุณาติดต่อสอบถามโดยตรงที่โรงพยาบาลศิริราช หรือติดตามข่าวสารผ่านช่องทางต่างๆ ของโรงพยาบาลครับ"
          : "Sorry, there is currently no information about Siriraj Medical Camp 2025 available. Please contact Siriraj Hospital directly or follow updates through various hospital channels."
      };
    }

    // Determine response based on keywords and message content
    let response = "";
    let relevantCamps = camps;

    if (keywords.includes('career') || keywords.includes('เส้นทาง') || keywords.includes('หมอ') || keywords.includes('medical school')) {
      relevantCamps = camps.filter(camp => camp.category === 'career_camp');
      response = generateCareerCampResponse(relevantCamps, language);
    } else if (keywords.includes('register') || keywords.includes('สมัคร') || keywords.includes('ลงทะเบียน')) {
      response = generateRegistrationResponse(camps, language);
    } else if (keywords.includes('contact') || keywords.includes('ติดต่อ') || keywords.includes('โทร')) {
      response = generateContactResponse(camps, language);
    } else if (keywords.includes('location') || keywords.includes('สถานที่') || keywords.includes('ที่ไหน')) {
      response = generateLocationResponse(camps, language);
    } else if (keywords.includes('date') || keywords.includes('วันที่') || keywords.includes('เมื่อไหร่') || keywords.includes('timeline')) {
      response = generateDateResponse(camps, language);
    } else {
      // General overview
      response = generateGeneralOverviewResponse(camps, language);
    }

    return {
      success: true,
      response,
      camps: relevantCamps
    };

  } catch (error) {
    logger.error('Error generating medical info response', { error, userId });
    return {
      success: false,
      response: 'เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้งครับ',
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้งครับ'
    };
  }
}

function extractKeywords(message: string): string[] {
  const keywords = [];
  
  // Career camp terms
  if (message.includes('career') || message.includes('เส้นทาง') || message.includes('หมอ') || message.includes('medical school')) {
    keywords.push('career', 'เส้นทาง', 'หมอ', 'medical school');
  }
  
  // Action terms
  if (message.includes('register') || message.includes('สมัคร') || message.includes('ลงทะเบียน')) {
    keywords.push('register', 'สมัคร', 'ลงทะเบียน');
  }
  if (message.includes('contact') || message.includes('ติดต่อ') || message.includes('โทร')) {
    keywords.push('contact', 'ติดต่อ', 'โทร');
  }
  if (message.includes('location') || message.includes('สถานที่') || message.includes('ที่ไหน')) {
    keywords.push('location', 'สถานที่', 'ที่ไหน');
  }
  if (message.includes('date') || message.includes('วันที่') || message.includes('เมื่อไหร่') || message.includes('timeline')) {
    keywords.push('date', 'วันที่', 'เมื่อไหร่', 'timeline');
  }
  
  return keywords;
}

function generateGeneralOverviewResponse(camps: any[], language: 'thai' | 'english'): string {
  const careerCamp = camps.find(camp => camp.category === 'career_camp');

  if (language === 'thai') {
    let response = "🏥 **ค่ายเส้นทางสู่หมอศิริราช 2025**\n\n";
    response += "คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล ขอเชิญนักเรียนมัธยมปลายเข้าร่วมค่ายเส้นทางสู่หมอศิริราช 2025\n\n";

    if (careerCamp) {
      response += `📚 **ค่ายเส้นทางสู่หมอศิริราช**\n`;
      response += `📅 วันที่: ${careerCamp.date}\n`;
      response += `📍 สถานที่: ${careerCamp.location}\n`;
      response += `👥 จำนวนที่รับ: 260 คน\n`;
      response += `💰 ค่าใช้จ่าย: 1,000 บาท (สำหรับผู้ผ่านการคัดเลือก)\n\n`;
    }

    response += "สำหรับข้อมูลเพิ่มเติมหรือการลงทะเบียน กรุณาติดต่อ:\n";
    response += "📞 โทร: 02-419-7000\n";
    response += "🌐 เว็บไซต์: www.siriraj.hospital/medicalcamp2025";
  } else {
    let response = "🏥 **Siriraj Medical Career Path Camp 2025**\n\n";
    response += "Faculty of Medicine Siriraj Hospital, Mahidol University invites high school students to join Siriraj Medical Career Path Camp 2025\n\n";

    if (careerCamp) {
      response += `📚 **Medical Career Path Camp**\n`;
      response += `📅 Date: ${careerCamp.dateEn}\n`;
      response += `📍 Location: ${careerCamp.locationEn}\n`;
      response += `👥 Capacity: 260 participants\n`;
      response += `💰 Fee: 1,000 THB (for selected participants)\n\n`;
    }

    response += "For more information or registration, please contact:\n";
    response += "📞 Phone: 02-419-7000\n";
    response += "🌐 Website: www.siriraj.hospital/medicalcamp2025";
  }

  return response;
}

function generateCareerCampResponse(camps: any[], language: 'thai' | 'english'): string {
  const careerCamp = camps.find(camp => camp.category === 'career_camp');
  
  if (!careerCamp) {
    return language === 'thai' 
      ? "ขออภัยครับ ขณะนี้ยังไม่มีค่ายเส้นทางสู่หมอศิริราชที่เปิดให้บริการ กรุณาติดต่อสอบถามโดยตรงที่คณะแพทยศาสตร์ศิริราชพยาบาล โทร 02-419-7000"
      : "Sorry, there is currently no Siriraj Medical Career Path Camp available. Please contact Faculty of Medicine Siriraj Hospital directly at 02-419-7000";
  }

  if (language === 'thai') {
    let response = "📚 **ค่ายเส้นทางสู่หมอศิริราช 2025**\n\n";
    response += `${careerCamp.description}\n\n`;
    response += `📅 **วันที่**: ${careerCamp.date}\n`;
    response += `📍 **สถานที่**: ${careerCamp.location}\n`;
    response += `🏥 **จัดโดย**: ${careerCamp.organizer}\n\n`;
    
    response += "🎯 **กิจกรรมที่ได้รับ**:\n";
    careerCamp.activities.forEach((activity: string, index: number) => {
      response += `${index + 1}. ${activity}\n`;
    });
    
    response += "\n📋 **คุณสมบัติผู้สมัคร**:\n";
    careerCamp.requirements.forEach((req: string, index: number) => {
      response += `${index + 1}. ${req}\n`;
    });
    
    response += `\n📝 **การลงทะเบียน**: ${careerCamp.registrationInfo}\n\n`;
    response += "✅ **ประโยชน์ที่ได้รับ**:\n";
    careerCamp.benefits.forEach((benefit: string, index: number) => {
      response += `${index + 1}. ${benefit}\n`;
    });
    
    response += "\n📅 **ไทม์ไลน์**:\n";
    careerCamp.timeline?.forEach((timeline: string, index: number) => {
      response += `${index + 1}. ${timeline}\n`;
    });
    
    response += "\n📞 **ติดต่อสอบถาม**:\n";
    response += `โทร: ${careerCamp.contactInfo.phone}\n`;
    response += `อีเมล: ${careerCamp.contactInfo.email}`;
    
    return response;
  } else {
    let response = "📚 **Siriraj Medical Career Path Camp 2025**\n\n";
    response += `${careerCamp.descriptionEn}\n\n`;
    response += `📅 **Date**: ${careerCamp.dateEn}\n`;
    response += `📍 **Location**: ${careerCamp.locationEn}\n`;
    response += `🏥 **Organized by**: ${careerCamp.organizerEn}\n\n`;
    
    response += "🎯 **Activities**:\n";
    careerCamp.activitiesEn?.forEach((activity: string, index: number) => {
      response += `${index + 1}. ${activity}\n`;
    });
    
    response += "\n📋 **Requirements**:\n";
    careerCamp.requirementsEn?.forEach((req: string, index: number) => {
      response += `${index + 1}. ${req}\n`;
    });
    
    response += `\n📝 **Registration**: ${careerCamp.registrationInfoEn}\n\n`;
    response += "✅ **Benefits**:\n";
    careerCamp.benefitsEn?.forEach((benefit: string, index: number) => {
      response += `${index + 1}. ${benefit}\n`;
    });
    
    response += "\n📅 **Timeline**:\n";
    careerCamp.timelineEn?.forEach((timeline: string, index: number) => {
      response += `${index + 1}. ${timeline}\n`;
    });
    
    response += "\n📞 **Contact**:\n";
    response += `Phone: ${careerCamp.contactInfo.phone}\n`;
    response += `Email: ${careerCamp.contactInfo.email}`;
    
    return response;
  }
}



function generateRegistrationResponse(camps: any[], language: 'thai' | 'english'): string {
  if (language === 'thai') {
    let response = "📝 **วิธีการลงทะเบียนค่ายเส้นทางสู่หมอศิริราช 2025**\n\n";
    
    camps.forEach((camp, index) => {
      response += `${index + 1}. **${camp.title}**\n`;
      response += `   📅 วันที่: ${camp.date}\n`;
      response += `   📝 ${camp.registrationInfo}\n`;
      response += `   📞 โทร: ${camp.contactInfo.phone}\n\n`;
    });
    
    response += "🌐 **ลงทะเบียนออนไลน์**: www.siriraj.hospital/medicalcamp2025\n";
    response += "📧 **อีเมล**: medicalcamp@siriraj.hospital";
    
    return response;
  } else {
    let response = "📝 **Registration Process for Siriraj Medical Career Path Camp 2025**\n\n";
    
    camps.forEach((camp, index) => {
      response += `${index + 1}. **${camp.titleEn}**\n`;
      response += `   📅 Date: ${camp.dateEn}\n`;
      response += `   📝 ${camp.registrationInfoEn}\n`;
      response += `   📞 Phone: ${camp.contactInfo.phone}\n\n`;
    });
    
    response += "🌐 **Online Registration**: www.siriraj.hospital/medicalcamp2025\n";
    response += "📧 **Email**: medicalcamp@siriraj.hospital";
    
    return response;
  }
}

function generateContactResponse(camps: any[], language: 'thai' | 'english'): string {
  if (language === 'thai') {
    let response = "📞 **ข้อมูลการติดต่อค่ายเส้นทางสู่หมอศิริราช 2025**\n\n";
    
    camps.forEach((camp, index) => {
      response += `${index + 1}. **${camp.title}**\n`;
      response += `   📞 โทร: ${camp.contactInfo.phone}\n`;
      response += `   📧 อีเมล: ${camp.contactInfo.email}\n`;
      if (camp.contactInfo.website) {
        response += `   🌐 เว็บไซต์: ${camp.contactInfo.website}\n`;
      }
      response += "\n";
    });
    
    response += "🏥 **ติดต่อทั่วไป**:\n";
    response += "📞 โทร: 02-419-7000\n";
    response += "🌐 เว็บไซต์: www.siriraj.hospital";
    
    return response;
  } else {
    let response = "📞 **Contact Information for Siriraj Medical Career Path Camp 2025**\n\n";
    
    camps.forEach((camp, index) => {
      response += `${index + 1}. **${camp.titleEn}**\n`;
      response += `   📞 Phone: ${camp.contactInfo.phone}\n`;
      response += `   📧 Email: ${camp.contactInfo.email}\n`;
      if (camp.contactInfo.website) {
        response += `   🌐 Website: ${camp.contactInfo.website}\n`;
      }
      response += "\n";
    });
    
    response += "🏥 **General Contact**:\n";
    response += "📞 Phone: 02-419-7000\n";
    response += "🌐 Website: www.siriraj.hospital";
    
    return response;
  }
}

function generateLocationResponse(camps: any[], language: 'thai' | 'english'): string {
  if (language === 'thai') {
    let response = "📍 **สถานที่จัดค่ายเส้นทางสู่หมอศิริราช 2025**\n\n";
    
    camps.forEach((camp, index) => {
      response += `${index + 1}. **${camp.title}**\n`;
      response += `   📍 ${camp.location}\n`;
      response += `   📅 วันที่: ${camp.date}\n\n`;
    });
    
    response += "🗺️ **แผนที่**:\n";
    response += "คณะแพทยศาสตร์ศิริราชพยาบาล ตั้งอยู่ที่ ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ\n";
    response += "🚇 รถไฟฟ้า: สถานีสนามไชย (MRT)\n";
    response += "🚌 รถเมล์: สาย 3, 6, 9, 32, 33, 43, 47, 53, 82";
    
    return response;
  } else {
    let response = "📍 **Location of Siriraj Medical Career Path Camp 2025**\n\n";
    
    camps.forEach((camp, index) => {
      response += `${index + 1}. **${camp.titleEn}**\n`;
      response += `   📍 ${camp.locationEn}\n`;
      response += `   📅 Date: ${camp.dateEn}\n\n`;
    });
    
    response += "🗺️ **Map**:\n";
    response += "Faculty of Medicine Siriraj Hospital is located at Wang Lang Road, Siriraj, Bangkok Noi, Bangkok\n";
    response += "🚇 MRT: Sanam Chai Station\n";
    response += "🚌 Bus: Routes 3, 6, 9, 32, 33, 43, 47, 53, 82";
    
    return response;
  }
}

function generateDateResponse(camps: any[], language: 'thai' | 'english'): string {
  if (language === 'thai') {
    let response = "📅 **ตารางเวลาค่ายเส้นทางสู่หมอศิริราช 2025**\n\n";
    
    camps.forEach((camp, index) => {
      response += `${index + 1}. **${camp.title}**\n`;
      response += `   📅 วันที่: ${camp.date}\n`;
      response += `   📍 สถานที่: ${camp.location}\n\n`;
    });
    
    if (camps[0]?.timeline) {
      response += "📅 **ไทม์ไลน์การสมัคร**:\n";
      camps[0].timeline.forEach((timeline: string, index: number) => {
        response += `${index + 1}. ${timeline}\n`;
      });
    }
    
    response += "\n📝 **หมายเหตุ**:\n";
    response += "• กรุณามาถึงก่อนเวลาเริ่มงาน 30 นาที\n";
    response += "• จำนวนที่รับจำกัด 260 คน\n";
    response += "• วันที่อาจมีการเปลี่ยนแปลง กรุณาติดตามข่าวสารล่าสุด";
    
    return response;
  } else {
    let response = "📅 **Schedule for Siriraj Medical Career Path Camp 2025**\n\n";
    
    camps.forEach((camp, index) => {
      response += `${index + 1}. **${camp.titleEn}**\n`;
      response += `   📅 Date: ${camp.dateEn}\n`;
      response += `   📍 Location: ${camp.locationEn}\n\n`;
    });
    
    if (camps[0]?.timelineEn) {
      response += "📅 **Application Timeline**:\n";
      camps[0].timelineEn.forEach((timeline: string, index: number) => {
        response += `${index + 1}. ${timeline}\n`;
      });
    }
    
    response += "\n📝 **Notes**:\n";
    response += "• Please arrive 30 minutes before the start time\n";
    response += "• Limited to 260 participants\n";
    response += "• Dates may be subject to change, please follow latest updates";
    
    return response;
  }
}
