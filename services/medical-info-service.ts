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
 * Generates professional medical camp information responses
 */
export async function generateMedicalInfoResponse(
  userMessage: string,
  userId: string
): Promise<MedicalInfoResponse> {
  try {
    await connectToDatabase();
    
    // Extract keywords from user message
    const keywords = extractKeywords(userMessage.toLowerCase());
    
    // Get all active medical camps
    const camps = await MedicalCamp.find({ isActive: true }).sort({ createdAt: -1 });
    
    if (camps.length === 0) {
      return {
        success: true,
        response: "ขออภัยครับ ขณะนี้ยังไม่มีข้อมูลค่ายแพทย์ศิริราช 2025 ที่เปิดให้บริการ กรุณาติดต่อสอบถามโดยตรงที่โรงพยาบาลศิริราช หรือติดตามข่าวสารผ่านช่องทางต่างๆ ของโรงพยาบาลครับ"
      };
    }

    // Determine response based on keywords and message content
    let response = "";
    let relevantCamps = camps;

    if (keywords.includes('cardiology') || keywords.includes('heart') || keywords.includes('หัวใจ')) {
      relevantCamps = camps.filter(camp => camp.category === 'specialized');
      response = generateCardiologyResponse(relevantCamps);
    } else if (keywords.includes('diabetes') || keywords.includes('เบาหวาน')) {
      relevantCamps = camps.filter(camp => camp.category === 'workshop');
      response = generateDiabetesResponse(relevantCamps);
    } else if (keywords.includes('general') || keywords.includes('ทั่วไป') || keywords.includes('สุขภาพ')) {
      relevantCamps = camps.filter(camp => camp.category === 'general');
      response = generateGeneralHealthResponse(relevantCamps);
    } else if (keywords.includes('register') || keywords.includes('สมัคร') || keywords.includes('ลงทะเบียน')) {
      response = generateRegistrationResponse(camps);
    } else if (keywords.includes('contact') || keywords.includes('ติดต่อ') || keywords.includes('โทร')) {
      response = generateContactResponse(camps);
    } else if (keywords.includes('location') || keywords.includes('สถานที่') || keywords.includes('ที่ไหน')) {
      response = generateLocationResponse(camps);
    } else if (keywords.includes('date') || keywords.includes('วันที่') || keywords.includes('เมื่อไหร่')) {
      response = generateDateResponse(camps);
    } else {
      // General overview
      response = generateGeneralOverviewResponse(camps);
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
  
  // Medical terms
  if (message.includes('cardiology') || message.includes('heart') || message.includes('หัวใจ')) {
    keywords.push('cardiology', 'heart', 'หัวใจ');
  }
  if (message.includes('diabetes') || message.includes('เบาหวาน')) {
    keywords.push('diabetes', 'เบาหวาน');
  }
  if (message.includes('general') || message.includes('สุขภาพ') || message.includes('ตรวจ')) {
    keywords.push('general', 'สุขภาพ', 'ตรวจ');
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
  if (message.includes('date') || message.includes('วันที่') || message.includes('เมื่อไหร่')) {
    keywords.push('date', 'วันที่', 'เมื่อไหร่');
  }
  
  return keywords;
}

function generateGeneralOverviewResponse(camps: any[]): string {
  const generalCamp = camps.find(camp => camp.category === 'general');
  const specializedCamp = camps.find(camp => camp.category === 'specialized');
  const workshopCamp = camps.find(camp => camp.category === 'workshop');

  let response = "🏥 **ค่ายแพทย์ศิริราช 2025**\n\n";
  response += "โรงพยาบาลศิริราชขอเชิญเข้าร่วมค่ายแพทย์ปี 2025 ซึ่งมีบริการหลากหลายประเภท:\n\n";

  if (generalCamp) {
    response += `📋 **ตรวจสุขภาพทั่วไป**\n`;
    response += `📅 วันที่: ${generalCamp.date}\n`;
    response += `📍 สถานที่: ${generalCamp.location}\n`;
    response += `✅ ฟรี ไม่ต้องนัดหมาย\n\n`;
  }

  if (specializedCamp) {
    response += `❤️ **ตรวจโรคหัวใจ**\n`;
    response += `📅 วันที่: ${specializedCamp.date}\n`;
    response += `📍 สถานที่: ${specializedCamp.location}\n`;
    response += `⚠️ ต้องลงทะเบียนล่วงหน้า\n\n`;
  }

  if (workshopCamp) {
    response += `📚 **เวิร์คช็อปเบาหวาน**\n`;
    response += `📅 วันที่: ${workshopCamp.date}\n`;
    response += `📍 สถานที่: ${workshopCamp.location}\n`;
    response += `💰 ค่าใช้จ่าย: ${workshopCamp.registrationInfo.includes('500 THB') ? '500 บาท' : 'มีค่าใช้จ่าย'}\n\n`;
  }

  response += "สำหรับข้อมูลเพิ่มเติมหรือการลงทะเบียน กรุณาติดต่อ:\n";
  response += "📞 โทร: 02-419-7000\n";
  response += "🌐 เว็บไซต์: www.siriraj.hospital/medicalcamp2025";

  return response;
}

function generateCardiologyResponse(camps: any[]): string {
  const cardiologyCamp = camps.find(camp => camp.category === 'specialized');
  
  if (!cardiologyCamp) {
    return "ขออภัยครับ ขณะนี้ยังไม่มีค่ายตรวจโรคหัวใจที่เปิดให้บริการ กรุณาติดต่อสอบถามโดยตรงที่แผนกโรคหัวใจ โรงพยาบาลศิริราช โทร 02-419-7500";
  }

  let response = "❤️ **ค่ายตรวจโรคหัวใจ ศิริราช 2025**\n\n";
  response += `${cardiologyCamp.description}\n\n`;
  response += `📅 **วันที่**: ${cardiologyCamp.date}\n`;
  response += `📍 **สถานที่**: ${cardiologyCamp.location}\n`;
  response += `🏥 **จัดโดย**: ${cardiologyCamp.organizer}\n\n`;
  
  response += "🔍 **บริการที่ได้รับ**:\n";
  cardiologyCamp.activities.forEach((activity: string, index: number) => {
    response += `${index + 1}. ${activity}\n`;
  });
  
  response += "\n📋 **เงื่อนไขการเข้าร่วม**:\n";
  cardiologyCamp.requirements.forEach((req: string, index: number) => {
    response += `${index + 1}. ${req}\n`;
  });
  
  response += `\n📝 **การลงทะเบียน**: ${cardiologyCamp.registrationInfo}\n\n`;
  response += "📞 **ติดต่อสอบถาม**:\n";
  response += `โทร: ${cardiologyCamp.contactInfo.phone}\n`;
  response += `อีเมล: ${cardiologyCamp.contactInfo.email}`;

  return response;
}

function generateDiabetesResponse(camps: any[]): string {
  const diabetesCamp = camps.find(camp => camp.category === 'workshop');
  
  if (!diabetesCamp) {
    return "ขออภัยครับ ขณะนี้ยังไม่มีเวิร์คช็อปเบาหวานที่เปิดให้บริการ กรุณาติดต่อสอบถามโดยตรงที่แผนกต่อมไร้ท่อ โรงพยาบาลศิริราช โทร 02-419-7800";
  }

  let response = "📚 **เวิร์คช็อปจัดการเบาหวาน ศิริราช 2025**\n\n";
  response += `${diabetesCamp.description}\n\n`;
  response += `📅 **วันที่**: ${diabetesCamp.date}\n`;
  response += `📍 **สถานที่**: ${diabetesCamp.location}\n`;
  response += `🏥 **จัดโดย**: ${diabetesCamp.organizer}\n\n`;
  
  response += "📖 **เนื้อหาการอบรม**:\n";
  diabetesCamp.activities.forEach((activity: string, index: number) => {
    response += `${index + 1}. ${activity}\n`;
  });
  
  response += "\n📋 **เงื่อนไขการเข้าร่วม**:\n";
  diabetesCamp.requirements.forEach((req: string, index: number) => {
    response += `${index + 1}. ${req}\n`;
  });
  
  response += `\n💰 **ค่าใช้จ่าย**: ${diabetesCamp.registrationInfo}\n\n`;
  response += "📞 **ติดต่อสอบถาม**:\n";
  response += `โทร: ${diabetesCamp.contactInfo.phone}\n`;
  response += `อีเมล: ${diabetesCamp.contactInfo.email}`;

  return response;
}

function generateGeneralHealthResponse(camps: any[]): string {
  const generalCamp = camps.find(camp => camp.category === 'general');
  
  if (!generalCamp) {
    return "ขออภัยครับ ขณะนี้ยังไม่มีค่ายตรวจสุขภาพทั่วไปที่เปิดให้บริการ กรุณาติดต่อสอบถามโดยตรงที่โรงพยาบาลศิริราช โทร 02-419-7000";
  }

  let response = "📋 **ค่ายตรวจสุขภาพทั่วไป ศิริราช 2025**\n\n";
  response += `${generalCamp.description}\n\n`;
  response += `📅 **วันที่**: ${generalCamp.date}\n`;
  response += `📍 **สถานที่**: ${generalCamp.location}\n`;
  response += `🏥 **จัดโดย**: ${generalCamp.organizer}\n\n`;
  
  response += "🔍 **บริการที่ได้รับ**:\n";
  generalCamp.activities.forEach((activity: string, index: number) => {
    response += `${index + 1}. ${activity}\n`;
  });
  
  response += "\n📋 **สิ่งที่ต้องเตรียม**:\n";
  generalCamp.requirements.forEach((req: string, index: number) => {
    response += `${index + 1}. ${req}\n`;
  });
  
  response += `\n📝 **การลงทะเบียน**: ${generalCamp.registrationInfo}\n\n`;
  response += "✅ **ประโยชน์ที่ได้รับ**:\n";
  generalCamp.benefits.forEach((benefit: string, index: number) => {
    response += `${index + 1}. ${benefit}\n`;
  });

  return response;
}

function generateRegistrationResponse(camps: any[]): string {
  let response = "📝 **วิธีการลงทะเบียนค่ายแพทย์ศิริราช 2025**\n\n";
  
  camps.forEach((camp, index) => {
    response += `${index + 1}. **${camp.title}**\n`;
    response += `   📅 วันที่: ${camp.date}\n`;
    response += `   📝 ${camp.registrationInfo}\n`;
    response += `   📞 โทร: ${camp.contactInfo.phone}\n\n`;
  });
  
  response += "🌐 **ลงทะเบียนออนไลน์**: www.siriraj.hospital/medicalcamp2025\n";
  response += "📧 **อีเมล**: medicalcamp@siriraj.hospital";

  return response;
}

function generateContactResponse(camps: any[]): string {
  let response = "📞 **ข้อมูลการติดต่อค่ายแพทย์ศิริราช 2025**\n\n";
  
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
}

function generateLocationResponse(camps: any[]): string {
  let response = "📍 **สถานที่จัดค่ายแพทย์ศิริราช 2025**\n\n";
  
  camps.forEach((camp, index) => {
    response += `${index + 1}. **${camp.title}**\n`;
    response += `   📍 ${camp.location}\n`;
    response += `   📅 วันที่: ${camp.date}\n\n`;
  });
  
  response += "🗺️ **แผนที่**:\n";
  response += "โรงพยาบาลศิริราช ตั้งอยู่ที่ ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ\n";
  response += "🚇 รถไฟฟ้า: สถานีสนามไชย (MRT)\n";
  response += "🚌 รถเมล์: สาย 3, 6, 9, 32, 33, 43, 47, 53, 82";

  return response;
}

function generateDateResponse(camps: any[]): string {
  let response = "📅 **ตารางเวลาค่ายแพทย์ศิริราช 2025**\n\n";
  
  camps.forEach((camp, index) => {
    response += `${index + 1}. **${camp.title}**\n`;
    response += `   📅 วันที่: ${camp.date}\n`;
    response += `   📍 สถานที่: ${camp.location}\n\n`;
  });
  
  response += "📝 **หมายเหตุ**:\n";
  response += "• กรุณามาถึงก่อนเวลาเริ่มงาน 30 นาที\n";
  response += "• สำหรับค่ายที่ต้องลงทะเบียนล่วงหน้า กรุณาติดต่อสอบถามก่อนวันงาน\n";
  response += "• วันที่อาจมีการเปลี่ยนแปลง กรุณาติดตามข่าวสารล่าสุด";

  return response;
}
