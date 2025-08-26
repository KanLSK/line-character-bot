import { connectToDatabase } from '../lib/db-utils';
import MedicalCamp from '../models/MedicalCamp';

async function seedMedicalCampData() {
  console.log('🏥 Seeding Medical Camp Data...\n');

  try {
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Clear existing data
    await MedicalCamp.deleteMany({});
    console.log('✅ Cleared existing medical camp data');

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
      },
      {
        title: "Siriraj Medical Camp 2025 - Pediatric Health Seminar",
        description: "Specialized health seminar for parents and children. Focus on child development, nutrition, and preventive care.",
        date: "April 5-7, 2025",
        location: "Siriraj Children's Hospital, Bangkok",
        organizer: "Department of Pediatrics, Siriraj Hospital",
        contactInfo: {
          phone: "02-419-7600",
          email: "pediatrics@siriraj.hospital",
          website: "https://www.siriraj.hospital/pediatric-camp"
        },
        activities: [
          "Child health assessment",
          "Growth and development evaluation",
          "Vaccination consultation",
          "Parent education sessions",
          "Interactive health activities for children"
        ],
        requirements: [
          "Children aged 0-18 years",
          "Parent or guardian must accompany",
          "Bring child's health book",
          "Pre-registration recommended"
        ],
        registrationInfo: "Free for children under 12. 200 THB for children 12-18. Pre-registration recommended.",
        benefits: [
          "Comprehensive child health evaluation",
          "Expert pediatric consultation",
          "Vaccination schedule review",
          "Parenting guidance"
        ],
        category: "seminar"
      }
    ];

    await MedicalCamp.insertMany(medicalCamps);
    console.log(`✅ Successfully seeded ${medicalCamps.length} medical camp records`);

    // Display summary
    console.log('\n📋 Medical Camp Summary:');
    medicalCamps.forEach((camp, index) => {
      console.log(`${index + 1}. ${camp.title}`);
      console.log(`   📅 Date: ${camp.date}`);
      console.log(`   📍 Location: ${camp.location}`);
      console.log(`   🏷️ Category: ${camp.category}`);
      console.log('');
    });

    console.log('🎉 Medical camp data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding medical camp data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedMedicalCampData();
}

export { seedMedicalCampData };
