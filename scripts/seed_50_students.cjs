const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../data/campusguard_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const salt = bcrypt.genSaltSync(10);
const studentPasswordHash = bcrypt.hashSync('Student@123', salt);

const rawStudents = [
  {
    num: 1,
    name: 'Abebe Bikila',
    amharic: 'አበበ ቢቂላ',
    studentId: 'HU/14022/13',
    department: 'Software Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 4,
    phone: '+251 92 456 7890',
    hasPc: true
  },
  {
    num: 2,
    name: 'Selamawit Alemu',
    amharic: 'ሰላማዊት አለሙ',
    studentId: 'HU/15881/14',
    department: 'Computer Science',
    faculty: 'Institute of Technology (IoT)',
    year: 3,
    phone: '+251 92 567 8901',
    hasPc: true
  },
  {
    num: 3,
    name: 'Dawit Haile',
    amharic: 'ዳዊት ኃይሌ',
    studentId: 'HU/16109/15',
    department: 'Electrical & Computer Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 2,
    phone: '+251 92 678 9012',
    hasPc: false
  },
  {
    num: 4,
    name: 'Almaz Ayana',
    amharic: 'አልማዝ አያና',
    studentId: 'HU/16234/15',
    department: 'Accounting & Finance',
    faculty: 'College of Business and Economics',
    year: 3,
    phone: '+251 92 789 0123',
    hasPc: true
  },
  {
    num: 5,
    name: 'Kenenisa Bekele',
    amharic: 'ቀነኒሳ በቀለ',
    studentId: 'HU/16540/15',
    department: 'Mechanical Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 3,
    phone: '+251 92 890 1234',
    hasPc: true
  },
  {
    num: 6,
    name: 'Derartu Tulu',
    amharic: 'ደራርቱ ቱሉ',
    studentId: 'HU/16712/15',
    department: 'Medicine (MD)',
    faculty: 'College of Medicine and Health Sciences',
    year: 4,
    phone: '+251 92 901 2345',
    hasPc: false
  },
  {
    num: 7,
    name: 'Haile Gebrselassie',
    amharic: 'ኃይሌ ገብረሥላሴ',
    studentId: 'HU/17001/16',
    department: 'Civil Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 2,
    phone: '+251 93 112 2334',
    hasPc: false
  },
  {
    num: 8,
    name: 'Tigist Assefa',
    amharic: 'ትዕግሥት አሰፋ',
    studentId: 'HU/17015/16',
    department: 'Pharmacy',
    faculty: 'College of Medicine and Health Sciences',
    year: 3,
    phone: '+251 93 223 3445',
    hasPc: false
  },
  {
    num: 9,
    name: 'Tamirat Tola',
    amharic: 'ታምራት ቶላ',
    studentId: 'HU/17042/16',
    department: 'Information Technology',
    faculty: 'Institute of Technology (IoT)',
    year: 2,
    phone: '+251 93 334 4556',
    hasPc: false
  },
  {
    num: 10,
    name: 'Genzebe Dibaba',
    amharic: 'ገንዘቤ ዲባባ',
    studentId: 'HU/17088/16',
    department: 'Economics',
    faculty: 'College of Business and Economics',
    year: 2,
    phone: '+251 93 445 5667',
    hasPc: false
  },
  {
    num: 11,
    name: 'Yohannes Mengistu',
    amharic: 'ዮሐንስ መንግሥቱ',
    studentId: 'HU/17110/16',
    department: 'Computer Science',
    faculty: 'Institute of Technology (IoT)',
    year: 3,
    phone: '+251 93 556 6778',
    hasPc: false
  },
  {
    num: 12,
    name: 'Bethelhem Tadesse',
    amharic: 'ቤተልሔም ታደሰ',
    studentId: 'HU/17145/16',
    department: 'Architecture',
    faculty: 'Institute of Technology (IoT)',
    year: 4,
    phone: '+251 93 667 7889',
    hasPc: false
  },
  {
    num: 13,
    name: 'Samuel Girma',
    amharic: 'ሳሙኤል ግርማ',
    studentId: 'HU/17180/16',
    department: 'Software Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 2,
    phone: '+251 93 778 8990',
    hasPc: false
  },
  {
    num: 14,
    name: 'Meron Worku',
    amharic: 'ሜሮን ወርቁ',
    studentId: 'HU/17215/16',
    department: 'Comprehensive Nursing',
    faculty: 'College of Medicine and Health Sciences',
    year: 3,
    phone: '+251 93 889 9001',
    hasPc: false
  },
  {
    num: 15,
    name: 'Eyob Kassahun',
    amharic: 'ኢዮብ ካሣሁን',
    studentId: 'HU/17240/16',
    department: 'Law (LL.B)',
    faculty: 'College of Law and Governance',
    year: 3,
    phone: '+251 93 990 0112',
    hasPc: false
  },
  {
    num: 16,
    name: 'Tsion Fikru',
    amharic: 'ጽዮን ፍቅሩ',
    studentId: 'HU/17277/16',
    department: 'Management',
    faculty: 'College of Business and Economics',
    year: 2,
    phone: '+251 94 111 2233',
    hasPc: false
  },
  {
    num: 17,
    name: 'Natnael Getachew',
    amharic: 'ናትናኤል ጌታቸው',
    studentId: 'HU/17305/16',
    department: 'Chemical Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 3,
    phone: '+251 94 222 3344',
    hasPc: false
  },
  {
    num: 18,
    name: 'Rahel Kebede',
    amharic: 'ራሔል ከበደ',
    studentId: 'HU/17332/16',
    department: 'Public Health',
    faculty: 'College of Medicine and Health Sciences',
    year: 3,
    phone: '+251 94 333 4455',
    hasPc: false
  },
  {
    num: 19,
    name: 'Henok Tefera',
    amharic: 'ሄኖክ ተፈራ',
    studentId: 'HU/17360/16',
    department: 'Plant Science',
    faculty: 'College of Agriculture',
    year: 2,
    phone: '+251 94 444 5566',
    hasPc: false
  },
  {
    num: 20,
    name: 'Mahlet Assefa',
    amharic: 'ማህሌት አሰፋ',
    studentId: 'HU/17395/16',
    department: 'Medical Laboratory Science',
    faculty: 'College of Medicine and Health Sciences',
    year: 3,
    phone: '+251 94 555 6677',
    hasPc: false
  },
  {
    num: 21,
    name: 'Yared Belay',
    amharic: 'ያሬድ በላይ',
    studentId: 'HU/17420/16',
    department: 'Mathematics',
    faculty: 'College of Natural and Computational Sciences',
    year: 2,
    phone: '+251 94 666 7788',
    hasPc: false
  },
  {
    num: 22,
    name: 'Kalkidan Demisse',
    amharic: 'ቃልኪዳን ደሚሴ',
    studentId: 'HU/17455/16',
    department: 'Biotechnology',
    faculty: 'College of Natural and Computational Sciences',
    year: 3,
    phone: '+251 94 777 8899',
    hasPc: false
  },
  {
    num: 23,
    name: 'Fitsum Abera',
    amharic: 'ፍጹም አበራ',
    studentId: 'HU/17482/16',
    department: 'Statistics',
    faculty: 'College of Natural and Computational Sciences',
    year: 2,
    phone: '+251 94 888 9900',
    hasPc: false
  },
  {
    num: 24,
    name: 'Kidist Hailu',
    amharic: 'ቅድስት ኃይሉ',
    studentId: 'HU/17510/16',
    department: 'Journalism & Communication',
    faculty: 'College of Social Sciences and Humanities',
    year: 2,
    phone: '+251 94 999 0011',
    hasPc: false
  },
  {
    num: 25,
    name: 'Abel Negash',
    amharic: 'አቤል ነጋሽ',
    studentId: 'HU/17544/16',
    department: 'Electrical & Computer Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 3,
    phone: '+251 95 111 1222',
    hasPc: false
  },
  {
    num: 26,
    name: 'Senait Mulugeta',
    amharic: 'ሰናይት ሙሉጌታ',
    studentId: 'HU/17578/16',
    department: 'Food Science & Technology',
    faculty: 'College of Agriculture',
    year: 3,
    phone: '+251 95 222 2333',
    hasPc: false
  },
  {
    num: 27,
    name: 'Kirubel Desta',
    amharic: 'ኪሩቤል ደስታ',
    studentId: 'HU/17602/16',
    department: 'Computer Science',
    faculty: 'Institute of Technology (IoT)',
    year: 2,
    phone: '+251 95 333 3444',
    hasPc: false
  },
  {
    num: 28,
    name: 'Bilen Sisay',
    amharic: 'ቢለን ሲሳይ',
    studentId: 'HU/17639/16',
    department: 'Marketing Management',
    faculty: 'College of Business and Economics',
    year: 2,
    phone: '+251 95 444 4555',
    hasPc: false
  },
  {
    num: 29,
    name: 'Solomon Berhanu',
    amharic: 'ሰለሞን ብርሃኑ',
    studentId: 'HU/17670/16',
    department: 'Physics',
    faculty: 'College of Natural and Computational Sciences',
    year: 3,
    phone: '+251 95 555 5666',
    hasPc: false
  },
  {
    num: 30,
    name: 'Martha Getnet',
    amharic: 'ማርታ ጌትነት',
    studentId: 'HU/17705/16',
    department: 'Medicine (MD)',
    faculty: 'College of Medicine and Health Sciences',
    year: 2,
    phone: '+251 95 666 6777',
    hasPc: false
  },
  {
    num: 31,
    name: 'Daniel Bogale',
    amharic: 'ዳንኤል ቦጋለ',
    studentId: 'HU/17733/16',
    department: 'Civil Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 4,
    phone: '+251 95 777 7888',
    hasPc: false
  },
  {
    num: 32,
    name: 'Eden Teshome',
    amharic: 'ኤደን ተሾመ',
    studentId: 'HU/17768/16',
    department: 'Sociology',
    faculty: 'College of Social Sciences and Humanities',
    year: 2,
    phone: '+251 95 888 8999',
    hasPc: false
  },
  {
    num: 33,
    name: 'Surafel Ayele',
    amharic: 'ሱራፌል አየለ',
    studentId: 'HU/17801/16',
    department: 'Software Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 3,
    phone: '+251 95 999 9000',
    hasPc: false
  },
  {
    num: 34,
    name: 'Feven Chernet',
    amharic: 'ፈቨን ቸርነት',
    studentId: 'HU/17835/16',
    department: 'Agricultural Economics',
    faculty: 'College of Agriculture',
    year: 2,
    phone: '+251 96 111 2345',
    hasPc: false
  },
  {
    num: 35,
    name: 'Nahom Sintayehu',
    amharic: 'ናሆም ስንታየሁ',
    studentId: 'HU/17870/16',
    department: 'Chemistry',
    faculty: 'College of Natural and Computational Sciences',
    year: 3,
    phone: '+251 96 222 3456',
    hasPc: false
  },
  {
    num: 36,
    name: 'Rediet Berhe',
    amharic: 'ረዲኤት በርሄ',
    studentId: 'HU/17904/16',
    department: 'Psychology',
    faculty: 'College of Social Sciences and Humanities',
    year: 2,
    phone: '+251 96 333 4567',
    hasPc: false
  },
  {
    num: 37,
    name: 'Ermias Zeleke',
    amharic: 'ኤርሚያስ ዘለቀ',
    studentId: 'HU/17938/16',
    department: 'Mechanical Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 2,
    phone: '+251 96 444 5678',
    hasPc: false
  },
  {
    num: 38,
    name: 'Liya Wolde',
    amharic: 'ሊያ ወልዴ',
    studentId: 'HU/17972/16',
    department: 'Horticulture',
    faculty: 'College of Agriculture',
    year: 3,
    phone: '+251 96 555 6789',
    hasPc: false
  },
  {
    num: 39,
    name: 'Robel Kassa',
    amharic: 'ሮቤል ካሳ',
    studentId: 'HU/18005/17',
    department: 'Information Technology',
    faculty: 'Institute of Technology (IoT)',
    year: 1,
    phone: '+251 96 666 7890',
    hasPc: false
  },
  {
    num: 40,
    name: 'Hana Mekonnen',
    amharic: 'ሃና መኮንን',
    studentId: 'HU/18040/17',
    department: 'Banking & Insurance',
    faculty: 'College of Business and Economics',
    year: 2,
    phone: '+251 96 777 8901',
    hasPc: false
  },
  {
    num: 41,
    name: 'Tomas Hailemariam',
    amharic: 'ቶማስ ኃይለማርያም',
    studentId: 'HU/18076/17',
    department: 'Biology',
    faculty: 'College of Natural and Computational Sciences',
    year: 2,
    phone: '+251 96 888 9012',
    hasPc: false
  },
  {
    num: 42,
    name: 'Hiwot Gashaw',
    amharic: 'ህይወት ጋሻው',
    studentId: 'HU/18112/17',
    department: 'Water Resources Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 3,
    phone: '+251 96 999 0123',
    hasPc: false
  },
  {
    num: 43,
    name: 'Brook Mesfin',
    amharic: 'ብሩክ መስፍን',
    studentId: 'HU/18149/17',
    department: 'Architecture',
    faculty: 'Institute of Technology (IoT)',
    year: 1,
    phone: '+251 97 111 3456',
    hasPc: false
  },
  {
    num: 44,
    name: 'Helen Gebre',
    amharic: 'ሄለን ገብሬ',
    studentId: 'HU/18185/17',
    department: 'Governance & Development Studies',
    faculty: 'College of Law and Governance',
    year: 2,
    phone: '+251 97 222 4567',
    hasPc: false
  },
  {
    num: 45,
    name: 'Ephrem Fenta',
    amharic: 'ኤፍሬም ፈንታ',
    studentId: 'HU/18220/17',
    department: 'Animal Science',
    faculty: 'College of Agriculture',
    year: 2,
    phone: '+251 97 333 5678',
    hasPc: false
  },
  {
    num: 46,
    name: 'Sara Million',
    amharic: 'ሳራ ሚሊዮን',
    studentId: 'HU/18256/17',
    department: 'English Language & Literature',
    faculty: 'College of Social Sciences and Humanities',
    year: 1,
    phone: '+251 97 444 6789',
    hasPc: false
  },
  {
    num: 47,
    name: 'Elias Regassa',
    amharic: 'ኤልያስ ረጋሳ',
    studentId: 'HU/18292/17',
    department: 'Computer Science',
    faculty: 'Institute of Technology (IoT)',
    year: 2,
    phone: '+251 97 555 7890',
    hasPc: false
  },
  {
    num: 48,
    name: 'Blen Tsegaye',
    amharic: 'ብሌን ፀጋዬ',
    studentId: 'HU/18328/17',
    department: 'Midwifery',
    faculty: 'College of Medicine and Health Sciences',
    year: 3,
    phone: '+251 97 666 8901',
    hasPc: false
  },
  {
    num: 49,
    name: 'Mikiyas Alemayehu',
    amharic: 'ሚኪያስ አለማየሁ',
    studentId: 'HU/18365/17',
    department: 'Software Engineering',
    faculty: 'Institute of Technology (IoT)',
    year: 1,
    phone: '+251 97 777 9012',
    hasPc: false
  },
  {
    num: 50,
    name: 'Bethlehem Girma',
    amharic: 'ቤተልሔም ግርማ',
    studentId: 'HU/18400/17',
    department: 'Environmental Science',
    faculty: 'College of Natural and Computational Sciences',
    year: 2,
    phone: '+251 97 888 0123',
    hasPc: false
  }
];

// Keep non-student users (admin, officer, gate)
const nonStudentUsers = db.users.filter(u => u.role !== 'STUDENT');

// Build 50 students and corresponding users
const newStudents = [];
const newStudentUsers = [];

rawStudents.forEach((s) => {
  const stuId = `stu-${s.num}`;
  const userId = `usr-student-${s.num}`;
  const emailName = s.name.toLowerCase().replace(/[^a-z]/g, '.');
  const email = `${emailName}@hu.edu.et`;
  const username = `student.${s.name.split(' ')[0].toLowerCase()}${s.num > 1 ? s.num : ''}`;

  newStudents.push({
    id: stuId,
    userId: userId,
    fullName: s.name,
    studentNameAmharic: s.amharic,
    studentId: s.studentId,
    institutionalEmail: email,
    department: s.department,
    faculty: s.faculty,
    academicYear: s.year,
    phone: s.phone,
    accountStatus: 'ACTIVE',
    createdAt: new Date(2026, 1, 1 + (s.num % 25)).toISOString()
  });

  newStudentUsers.push({
    id: userId,
    username: username,
    email: email,
    fullName: s.name,
    role: 'STUDENT',
    phone: s.phone,
    studentId: s.studentId,
    active: true,
    createdAt: new Date(2026, 1, 1 + (s.num % 25)).toISOString(),
    passwordHash: studentPasswordHash
  });
});

// Extra laptops for student 4 (Almaz Ayana) and student 5 (Kenenisa Bekele) if not present
const existingLaptops = db.laptops || [];
const existingRegs = db.registrations || [];

// Ensure student 4 (Almaz Ayana) has a registered laptop
if (!existingLaptops.some(l => l.studentIdNumber === 'HU/16234/15')) {
  existingLaptops.push({
    id: 'lpt-almaz-1',
    pcId: 'CG-LPT-000005',
    registrationId: 'reg-almaz-1',
    studentId: 'stu-4',
    studentName: 'Almaz Ayana',
    studentNameAmharic: 'አልማዝ አያና',
    studentIdNumber: 'HU/16234/15',
    department: 'Accounting & Finance',
    faculty: 'College of Business and Economics',
    brand: 'Acer',
    model: 'Aspire 5 A515',
    serialNumber: 'SN-AC-778210',
    deviceType: 'Laptop',
    processor: 'Intel Core i5-1235U',
    ram: '16GB DDR4',
    storage: '512GB NVMe SSD',
    os: 'Windows 11 Home',
    color: 'Steel Gray',
    physicalDescription: 'Economics department sticker on cover lid',
    ownerPhone: '+251 92 789 0123',
    status: 'APPROVED',
    securityStatus: 'NORMAL',
    qrToken: 'CG-SEC-QR-HU1623415-005',
    currentMovementStatus: 'IN',
    createdAt: '2026-02-15T09:00:00.000Z'
  });
  existingRegs.push({
    id: 'reg-almaz-1',
    studentId: 'stu-4',
    studentName: 'Almaz Ayana',
    studentNameAmharic: 'አልማዝ አያና',
    studentIdNumber: 'HU/16234/15',
    department: 'Accounting & Finance',
    faculty: 'College of Business and Economics',
    brand: 'Acer',
    model: 'Aspire 5 A515',
    serialNumber: 'SN-AC-778210',
    deviceType: 'Laptop',
    processor: 'Intel Core i5-1235U',
    ram: '16GB DDR4',
    storage: '512GB NVMe SSD',
    os: 'Windows 11 Home',
    color: 'Steel Gray',
    physicalDescription: 'Economics department sticker on cover lid',
    ownerPhone: '+251 92 789 0123',
    status: 'APPROVED',
    registrationDate: '2026-02-14T10:00:00.000Z',
    submittedByRole: 'STUDENT',
    submittedByUserId: 'usr-student-4',
    reviewedByOfficerId: 'usr-officer-1',
    reviewedByOfficerName: 'Inspector Kebede Wolde',
    reviewDate: '2026-02-15T09:00:00.000Z',
    pcId: 'CG-LPT-000005'
  });
}

// Ensure student 5 (Kenenisa Bekele) has a registered laptop
if (!existingLaptops.some(l => l.studentIdNumber === 'HU/16540/15')) {
  existingLaptops.push({
    id: 'lpt-kenenisa-1',
    pcId: 'CG-LPT-000006',
    registrationId: 'reg-kenenisa-1',
    studentId: 'stu-5',
    studentName: 'Kenenisa Bekele',
    studentNameAmharic: 'ቀነኒሳ በቀለ',
    studentIdNumber: 'HU/16540/15',
    department: 'Mechanical Engineering',
    faculty: 'Institute of Technology (IoT)',
    brand: 'Asus',
    model: 'ZenBook 14 OLED',
    serialNumber: 'SN-AS-991204',
    deviceType: 'Laptop',
    processor: 'AMD Ryzen 7 7730U',
    ram: '16GB LPDDR4X',
    storage: '1TB NVMe SSD',
    os: 'Windows 11 Pro',
    color: 'Pine Grey',
    physicalDescription: 'Mechanical Engineering CAD lab tag affixed',
    ownerPhone: '+251 92 890 1234',
    status: 'APPROVED',
    securityStatus: 'NORMAL',
    qrToken: 'CG-SEC-QR-HU1654015-006',
    currentMovementStatus: 'OUT',
    createdAt: '2026-02-18T11:20:00.000Z'
  });
  existingRegs.push({
    id: 'reg-kenenisa-1',
    studentId: 'stu-5',
    studentName: 'Kenenisa Bekele',
    studentNameAmharic: 'ቀነኒሳ በቀለ',
    studentIdNumber: 'HU/16540/15',
    department: 'Mechanical Engineering',
    faculty: 'Institute of Technology (IoT)',
    brand: 'Asus',
    model: 'ZenBook 14 OLED',
    serialNumber: 'SN-AS-991204',
    deviceType: 'Laptop',
    processor: 'AMD Ryzen 7 7730U',
    ram: '16GB LPDDR4X',
    storage: '1TB NVMe SSD',
    os: 'Windows 11 Pro',
    color: 'Pine Grey',
    physicalDescription: 'Mechanical Engineering CAD lab tag affixed',
    ownerPhone: '+251 92 890 1234',
    status: 'APPROVED',
    registrationDate: '2026-02-17T14:00:00.000Z',
    submittedByRole: 'STUDENT',
    submittedByUserId: 'usr-student-5',
    reviewedByOfficerId: 'usr-officer-1',
    reviewedByOfficerName: 'Inspector Kebede Wolde',
    reviewDate: '2026-02-18T11:20:00.000Z',
    pcId: 'CG-LPT-000006'
  });
}

db.users = [...nonStudentUsers, ...newStudentUsers];
db.students = newStudents;
db.laptops = existingLaptops;
db.registrations = existingRegs;
if (db.nextPcIdSequence < 7) {
  db.nextPcIdSequence = 7;
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully seeded 50 students into campusguard_db.json!');
console.log('Total students:', db.students.length);
console.log('Total users:', db.users.length);
console.log('Total laptops:', db.laptops.length);

