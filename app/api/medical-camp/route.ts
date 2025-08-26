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
          title: "Siriraj Medical Camp 2025 - General Health Check",
          description: "Comprehensive health screening and consultation for the general public. Free basic health check including blood pressure, blood sugar, and BMI measurement.",
          date: "March 15-20, 2025",
          location: "Siriraj Hospital, Bangkok",
          organizer: "Faculty of Medicine Siriraj Hospital, Mahidol University",
          contactInfo: {
            phone: "02-419-7000",
            email: "medicalcamp@siriraj.hospital",
            website: "https://www.siriraj.hospital/medicalcamp2025"
          },
          activities: [
            "Free health screening",
            "Consultation with specialists",
            "Health education workshops",
            "Nutrition counseling",
            "Exercise demonstration"
          ],
          requirements: [
            "Thai ID card or passport",
            "No appointment needed",
            "Fasting for 8-12 hours (for blood tests)"
          ],
          registrationInfo: "Walk-in registration available. Online pre-registration recommended at www.siriraj.hospital/medicalcamp2025",
          benefits: [
            "Free comprehensive health check",
            "Personalized health advice",
            "Follow-up care recommendations",
            "Health education materials"
          ],
          category: "general"
        },
        {
          title: "Siriraj Medical Camp 2025 - Specialized Cardiology",
          description: "Specialized cardiac screening and consultation for individuals with heart-related concerns or family history of heart disease.",
          date: "March 22-25, 2025",
          location: "Siriraj Heart Center, Bangkok",
          organizer: "Division of Cardiology, Siriraj Hospital",
          contactInfo: {
            phone: "02-419-7500",
            email: "cardiology@siriraj.hospital",
            website: "https://www.siriraj.hospital/cardiology-camp"
          },
          activities: [
            "ECG examination",
            "Echocardiogram screening",
            "Cardiac consultation",
            "Risk factor assessment",
            "Lifestyle modification guidance"
          ],
          requirements: [
            "Age 40+ or family history of heart disease",
            "Pre-registration required",
            "Bring previous medical records if available"
          ],
          registrationInfo: "Pre-registration required. Limited slots available. Call 02-419-7500 or register online.",
          benefits: [
            "Comprehensive cardiac assessment",
            "Early detection of heart conditions",
            "Personalized treatment plans",
            "Follow-up care coordination"
          ],
          category: "specialized"
        },
        {
          title: "Siriraj Medical Camp 2025 - Diabetes Management Workshop",
          description: "Educational workshop for diabetes patients and their families. Learn about proper diabetes management, diet, and lifestyle modifications.",
          date: "March 28-30, 2025",
          location: "Siriraj Diabetes Center, Bangkok",
          organizer: "Division of Endocrinology, Siriraj Hospital",
          contactInfo: {
            phone: "02-419-7800",
            email: "diabetes@siriraj.hospital",
            website: "https://www.siriraj.hospital/diabetes-workshop"
          },
          activities: [
            "Diabetes education sessions",
            "Blood glucose monitoring training",
            "Nutrition planning workshops",
            "Exercise programs for diabetics",
            "Medication management guidance"
          ],
          requirements: [
            "Diabetes patients and family members",
            "Pre-registration required",
            "Bring current medication list"
          ],
          registrationInfo: "Pre-registration required. Workshop fee: 500 THB. Scholarships available for low-income patients.",
          benefits: [
            "Comprehensive diabetes education",
            "Practical management skills",
            "Support group access",
            "Ongoing follow-up care"
          ],
          category: "workshop"
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
