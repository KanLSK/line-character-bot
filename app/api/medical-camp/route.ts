import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db-utils';
import MedicalCamp from '../../../models/MedicalCamp';
import { logger } from '../../../utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category');

    await connectToDatabase();
    
    const filter: { isActive: boolean; category?: string } = { isActive: true };
    
    if (category) {
      filter.category = category;
    }

    const camps = await MedicalCamp.find(filter).sort({ createdAt: -1 });

    if (query) {
      // Search functionality
      const searchRegex = new RegExp(query, 'i');
      const searchResults = camps.filter(camp => 
        camp.title.match(searchRegex) ||
        camp.description.match(searchRegex) ||
        camp.activities.some(activity => activity.match(searchRegex))
      );
      
      return NextResponse.json({
        success: true,
        camps: searchResults,
        total: searchResults.length,
        query
      });
    }

    return NextResponse.json({
      success: true,
      camps,
      total: camps.length
    });

  } catch (error) {
    logger.error('Error fetching medical camp information', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    await connectToDatabase();

    if (action === 'seed') {
      // Seed medical camp data
      const medicalCamps = [
        {
          title: "ค่ายเส้นทางสู่หมอศิริราช 2025",
          titleEn: "Siriraj Medical Career Path Camp 2025",
          description: "ค่ายเส้นทางสู่หมอศิริราชคือกิจกรรมที่นักศึกษาแพทย์ศิริราชจัดขึ้นภายใต้การกำกับดูแลของฝ่ายกิจการนักศึกษา คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล จัดขึ้นเพื่อเปิดโอกาสให้นักเรียนมัธยมปลายทั่วประเทศ ได้สัมผัสการเรียนแพทย์ทั้งชั้น pre-clinic และ clinic ได้รู้จักคณะแพทยศาสตร์ศิริราชพยาบาลมากขึ้น และมีปฏิสัมพันธ์กับนักศึกษาแพทย์ เพื่อเรียนรู้ชีวิตความเป็นอยู่และสร้างความสัมพันธ์อันดีระหว่างกัน",
          descriptionEn: "Siriraj Medical Career Path Camp is an activity organized by Siriraj medical students under the supervision of the Student Affairs Division, Faculty of Medicine Siriraj Hospital, Mahidol University. It is organized to provide opportunities for high school students nationwide to experience medical studies in both pre-clinic and clinic classes, to get to know the Faculty of Medicine Siriraj Hospital better, and to interact with medical students to learn about their lifestyle and build good relationships.",
          date: "13-14 ธันวาคม 2568 (เสาร์-อาทิตย์)",
          dateEn: "December 13-14, 2025 (Saturday-Sunday)",
          location: "คณะแพทยศาสตร์ศิริราชพยาบาล",
          locationEn: "Faculty of Medicine Siriraj Hospital",
          organizer: "ฝ่ายกิจการนักศึกษา คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล",
          organizerEn: "Student Affairs Division, Faculty of Medicine Siriraj Hospital, Mahidol University",
          contactInfo: {
            phone: "02-419-7000",
            email: "medicalcamp@siriraj.hospital",
            website: "https://www.siriraj.hospital/medicalcamp2025"
          },
          activities: [
            "สัมผัสการเรียนแพทย์ชั้น pre-clinic",
            "สัมผัสการเรียนแพทย์ชั้น clinic",
            "เรียนรู้ชีวิตความเป็นอยู่ของนักศึกษาแพทย์",
            "สร้างความสัมพันธ์กับนักศึกษาแพทย์",
            "กิจกรรมค้างคืนที่ศูนย์ฝึกอบรมและปฏิบัติธรรมศิริราช (ไม่บังคับ)"
          ],
          activitiesEn: [
            "Experience pre-clinic medical studies",
            "Experience clinic medical studies",
            "Learn about medical students' lifestyle",
            "Build relationships with medical students",
            "Overnight activities at Siriraj Training and Meditation Center (optional)"
          ],
          requirements: [
            "เป็นนักเรียนชั้นมัธยมศึกษาตอนปลาย (ม.4 - ม.6)",
            "สำเนาบัตรประชาชน",
            "ไม่มีค่าใช้จ่ายในการสมัคร",
            "ผู้ผ่านการคัดเลือกมีค่าใช้จ่าย 1,000 บาท"
          ],
          requirementsEn: [
            "High school students (Grade 10-12)",
            "Copy of ID card",
            "No application fee",
            "Selected participants pay 1,000 THB"
          ],
          registrationInfo: "เปิดรับสมัคร 5 กันยายน 18:00 น. - 28 กันยายน 23:59 น. ประกาศผล 26 ตุลาคม 18:00 น. จำนวนที่รับ 260 คน",
          registrationInfoEn: "Application opens September 5, 18:00 - September 28, 23:59. Results announced October 26, 18:00. Limited to 260 participants.",
          benefits: [
            "ประสบการณ์การเรียนแพทย์จริง",
            "ความรู้เกี่ยวกับคณะแพทยศาสตร์ศิริราช",
            "ความสัมพันธ์กับนักศึกษาแพทย์",
            "โอกาสในการเข้าศึกษาต่อคณะแพทยศาสตร์"
          ],
          benefitsEn: [
            "Real medical study experience",
            "Knowledge about Siriraj Faculty of Medicine",
            "Relationships with medical students",
            "Opportunity for medical school admission"
          ],
          timeline: [
            "5 กันยายน 18:00 น. - เปิดรับสมัคร กรอกข้อมูลส่วนตัว สำเนาบัตรประชาชน และทำข้อสอบบนเว็บไซต์",
            "28 กันยายน 23:59 น. - ปิดรับสมัคร",
            "26 ตุลาคม 18:00 น. - ประกาศผลผู้ผ่านการคัดเลือก 260 คน และรายชื่อเรียกสำรอง 50 คน",
            "2 พฤศจิกายน - ผู้ผ่านการคัดเลือกกรอกข้อมูลเพิ่มเติม ชำระค่าสมัคร 1,000 บาท และส่งใบปพ.7",
            "9 พฤศจิกายน - การรายชื่อสำรองสิ้นสุด"
          ],
          timelineEn: [
            "September 5, 18:00 - Application opens, fill personal information, ID card copy, and take online test",
            "September 28, 23:59 - Application closes",
            "October 26, 18:00 - Announce 260 selected participants and 50 waitlist",
            "November 2 - Selected participants fill additional information, pay 1,000 THB fee, and submit transcript",
            "November 9 - Waitlist process ends"
          ],
          category: "career_camp"
        }
      ];

      await MedicalCamp.deleteMany({}); // Clear existing data
      await MedicalCamp.insertMany(medicalCamps);

      return NextResponse.json({
        success: true,
        message: 'Medical camp data seeded successfully',
        count: medicalCamps.length
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    logger.error('Error seeding medical camp data', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
