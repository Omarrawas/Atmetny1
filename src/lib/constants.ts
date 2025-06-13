
import type { LucideIcon } from 'lucide-react';
import { Home, FileText, Brain, CreditCard, QrCode, Users, UserCircle, Settings, ShieldCheck, Zap, Sparkles, BookOpen, Newspaper, Megaphone, Atom, Feather } from 'lucide-react';
import type { Question } from './types';


export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  keywords?: string; // For search/filtering if ever implemented
  children?: NavItem[]; // For sub-menus
}

export const mainNavItems: NavItem[] = [
  { href: '/', label: 'الرئيسية', icon: Home, keywords: 'dashboard home main page' },
  { href: '/study', label: 'الدراسة', icon: BookOpen, keywords: 'study learn subjects courses' },
  { href: '/exams', label: 'الاختبارات العامة', icon: FileText, keywords: 'tests quizzes exams practice' },
  { href: '/news', label: 'آخر الأخبار', icon: Newspaper, keywords: 'updates articles information' },
  { href: '/announcements', label: 'الإعلانات', icon: Megaphone, keywords: 'notifications alerts important' },
  { href: '/ai-analysis', label: 'تحليل الأداء', icon: Sparkles, keywords: 'ai intelligence insights performance' },
  { href: '/subscribe', label: 'الاشتراكات', icon: CreditCard, keywords: 'pricing plans subscription payment' },
  { href: '/activate-qr', label: 'تفعيل QR', icon: QrCode, keywords: 'scan code activation redeem' },
  { href: '/community', label: 'المجتمع', icon: Users, keywords: 'forum discussion help support' },
  { href: '/settings', label: 'الإعدادات', icon: Settings, keywords: 'settings configuration options account' },
];

export const teacherNavItems: NavItem[] = [ // Example, not implemented in this iteration
  { href: '/teacher/dashboard', label: 'لوحة تحكم المعلم', icon: Settings, keywords: 'teacher panel content management' },
  { href: '/teacher/questions', label: 'إدارة الأسئلة', icon: FileText, keywords: 'question bank create edit' },
  { href: '/teacher/analytics', label: 'تحليلات الطلاب', icon: Zap, keywords: 'student performance data insights' },
];

export const accountNavItems: NavItem[] = [
  { href: '/profile', label: 'الملف الشخصي', icon: UserCircle },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
  { href: '/privacy', label: 'الخصوصية والأمان', icon: ShieldCheck },
];

export interface Subject {
  id: string;
  name: string;
  icon?: LucideIcon;
  section: 'scientific' | 'literary' | 'common';
  topics: string[];
}

export const subjects: Subject[] = [
  { id: 'math', name: 'الرياضيات', icon: Brain, section: 'scientific', topics: ['الجبر', 'الهندسة التحليلية', 'التفاضل والتكامل', 'الأعداد العقدية'] },
  { id: 'physics', name: 'الفيزياء', icon: Atom, section: 'scientific', topics: ['الميكانيكا', 'الكهرباء والمغناطيسية', 'الأمواج والضوء', 'الفيزياء الحديثة'] },
  { id: 'chemistry', name: 'الكيمياء', icon: Zap, section: 'scientific', topics: ['الكيمياء العضوية', 'الكيمياء غير العضوية', 'الكيمياء الفيزيائية', 'الكيمياء التحليلية'] },
  { id: 'biology', name: 'الأحياء', icon: Feather, section: 'scientific', topics: ['الخلية والأنسجة', 'الوراثة', 'التطور', 'علم البيئة', 'وظائف الأعضاء'] },
  { id: 'arabic_language', name: 'اللغة العربية', icon: BookOpen, section: 'common', topics: ['النحو والصرف', 'البلاغة', 'الأدب العربي', 'العروض'] },
  { id: 'english_language', name: 'اللغة الإنجليزية', icon: BookOpen, section: 'common', topics: ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing'] },
  { id: 'french_language', name: 'اللغة الفرنسية', icon: BookOpen, section: 'common', topics: ['Grammaire', 'Vocabulaire', 'Compréhension Écrite', 'Expression Écrite'] },
  { id: 'civics', name: 'التربية الوطنية', icon: Users, section: 'common', topics: ['الدستور والمواطنة', 'المؤسسات الوطنية', 'الحقوق والواجبات'] },
  { id: 'islamic_education', name: 'التربية الإسلامية', icon: BookOpen, section: 'common', topics: ['العقيدة الإسلامية', 'الفقه', 'السيرة النبوية', 'الأخلاق'] },
  { id: 'christian_education', name: 'التربية المسيحية', icon: BookOpen, section: 'common', topics: ['الكتاب المقدس', 'العقائد المسيحية', 'تاريخ الكنيسة', 'الحياة المسيحية'] },
  { id: 'history', name: 'التاريخ', icon: Newspaper, section: 'literary', topics: ['التاريخ القديم', 'التاريخ الوسيط', 'التاريخ الحديث والمعاصر', 'تاريخ سوريا'] },
  { id: 'geography', name: 'الجغرافيا', icon: Megaphone, section: 'literary', topics: ['الجغرافيا الطبيعية', 'الجغرافيا البشرية', 'جغرافية سوريا', 'الاقتصاد'] },
  { id: 'philosophy_psychology', name: 'الفلسفة وعلم النفس', icon: Sparkles, section: 'literary', topics: ['تاريخ الفلسفة', 'المنطق', 'علم النفس العام', 'علم الاجتماع'] },
];


export const allQuestions: Question[] = [
  // Math questions
  { id: 'm1', subjectId: 'math', subjectName: 'الرياضيات', questionText: 'ما هو ناتج 2 + 2 × 2؟', options: [{id: 'm1o1', text: '4'}, {id: 'm1o2', text: '6'}, {id: 'm1o3', text: '8'}, {id: 'm1o4', text: '10'}], correctOptionId: 'm1o2', topic: 'الجبر', difficulty: 'easy' },
  { id: 'm2', subjectId: 'math', subjectName: 'الرياضيات', questionText: 'ما هو جذر العدد 16؟', options: [{id: 'm2o1', text: '2'}, {id: 'm2o2', text: '4'}, {id: 'm2o3', text: '8'}, {id: 'm2o4', text: '3'}], correctOptionId: 'm2o2', topic: 'الجبر', difficulty: 'easy' },
  { id: 'm3', subjectId: 'math', subjectName: 'الرياضيات', questionText: 'حل المعادلة: س + 5 = 12', options: [{id: 'm3o1', text: '5'}, {id: 'm3o2', text: '7'}, {id: 'm3o3', text: '17'}], correctOptionId: 'm3o2', topic: 'الجبر', difficulty: 'easy' },
  { id: 'm4', subjectId: 'math', subjectName: 'الرياضيات', questionText: 'ما هو ميل المستقيم ص = 2س - 3؟', options: [{id: 'm4o1', text: '2'}, {id: 'm4o2', text: '-3'}, {id: 'm4o3', text: '1/2'}], correctOptionId: 'm4o1', topic: 'الهندسة التحليلية', difficulty: 'medium' },
  { id: 'm5', subjectId: 'math', subjectName: 'الرياضيات', questionText: 'ما هو تكامل الدالة س^2؟', options: [{id: 'm5o1', text: '2س'}, {id: 'm5o2', text: 'س^3 / 3'}, {id: 'm5o3', text: 'س^2 / 2'}], correctOptionId: 'm5o2', topic: 'التفاضل والتكامل', difficulty: 'hard' },
  { id: 'm6', subjectId: 'math', subjectName: 'الرياضيات', questionText: 'قيمة (i^4) حيث i هو الوحدة التخيلية؟', options: [{id: 'm6o1', text: '1'}, {id: 'm6o2', text: '-1'}, {id: 'm6o3', text: 'i'}, {id: 'm6o4', text: '-i'}], correctOptionId: 'm6o1', topic: 'الأعداد العقدية', difficulty: 'medium' },
  { id: 'm7', subjectId: 'math', subjectName: 'الرياضيات', questionText: 'ما هو مشتق الدالة الثابتة ص = 5؟', options: [{id: 'm7o1', text: '5'}, {id: 'm7o2', text: '0'}, {id: 'm7o3', text: '1'}, {id: 'm7o4', text: 'س'}], correctOptionId: 'm7o2', topic: 'التفاضل والتكامل', difficulty: 'easy' },


  // Physics questions
  { id: 'p1', subjectId: 'physics', subjectName: 'الفيزياء', questionText: 'من هو مكتشف قانون الجاذبية الأرضية؟', options: [{id: 'p1o1', text: 'ألبرت أينشتاين'}, {id: 'p1o2', text: 'إسحاق نيوتن'}, {id: 'p1o3', text: 'جاليليو جاليلي'}, {id: 'p1o4', text: 'نيكولا تسلا'}], correctOptionId: 'p1o2', topic: 'الميكانيكا', difficulty: 'easy' },
  { id: 'p2', subjectId: 'physics', subjectName: 'الفيزياء', questionText: 'ما هي وحدة قياس القوة؟', options: [{id: 'p2o1', text: 'الكيلوجرام'}, {id: 'p2o2', text: 'المتر'}, {id: 'p2o3', text: 'النيوتن'}, {id: 'p2o4', text: 'الثانية'}], correctOptionId: 'p2o3', topic: 'الميكانيكا', difficulty: 'easy' },
  { id: 'p3', subjectId: 'physics', subjectName: 'الفيزياء', questionText: 'ما هو قانون أوم؟', options: [{id: 'p3o1', text: 'V = IR'}, {id: 'p3o2', text: 'F = ma'}, {id: 'p3o3', text: 'E = mc^2'}], correctOptionId: 'p3o1', topic: 'الكهرباء والمغناطيسية', difficulty: 'medium' },
  { id: 'p4', subjectId: 'physics', subjectName: 'الفيزياء', questionText: 'الطول الموجي للضوء الأحمر أكبر من الطول الموجي للضوء الأزرق.', options: [{id: 'p4o1', text: 'صحيح'}, {id: 'p4o2', text: 'خاطئ'}], correctOptionId: 'p4o1', topic: 'الأمواج والضوء', difficulty: 'medium' },
  { id: 'p5', subjectId: 'physics', subjectName: 'الفيزياء', questionText: 'ما هي الظاهرة التي تصف تحول المادة مباشرة من الحالة الصلبة إلى الحالة الغازية؟', options: [{id: 'p5o1', text: 'التبخر'}, {id: 'p5o2', text: 'التسامي'}, {id: 'p5o3', text: 'الانصهار'}], correctOptionId: 'p5o2', topic: 'الفيزياء الحديثة', difficulty: 'hard' },


  // Chemistry questions
  { id: 'ch1', subjectId: 'chemistry', subjectName: 'الكيمياء', questionText: 'ما هو الرمز الكيميائي للماء؟', options: [{id: 'ch1o1', text: 'CO2'}, {id: 'ch1o2', text: 'O2'}, {id: 'ch1o3', text: 'H2O'}, {id: 'ch1o4', text: 'NaCl'}], correctOptionId: 'ch1o3', topic: 'الكيمياء غير العضوية', difficulty: 'easy' },
  { id: 'ch2', subjectId: 'chemistry', subjectName: 'الكيمياء', questionText: 'ما هو العنصر الأكثر وفرة في القشرة الأرضية؟', options: [{id: 'ch2o1', text: 'الحديد'}, {id: 'ch2o2', text: 'الأكسجين'}, {id: 'ch2o3', text: 'السيليكون'}], correctOptionId: 'ch2o2', topic: 'الكيمياء غير العضوية', difficulty: 'easy' },
  { id: 'ch3', subjectId: 'chemistry', subjectName: 'الكيمياء', questionText: 'ما هو نوع الرابطة في جزيء الميثان CH4؟', options: [{id: 'ch3o1', text: 'أيونية'}, {id: 'ch3o2', text: 'تساهمية'}, {id: 'ch3o3', text: 'فلزية'}], correctOptionId: 'ch3o2', topic: 'الكيمياء العضوية', difficulty: 'medium' },
  { id: 'ch4', subjectId: 'chemistry', subjectName: 'الكيمياء', questionText: 'ما هو الرقم الهيدروجيني (pH) لمحلول متعادل؟', options: [{id: 'ch4o1', text: 'أقل من 7'}, {id: 'ch4o2', text: 'يساوي 7'}, {id: 'ch4o3', text: 'أكبر من 7'}], correctOptionId: 'ch4o2', topic: 'الكيمياء الفيزيائية', difficulty: 'medium' },
  { id: 'ch5', subjectId: 'chemistry', subjectName: 'الكيمياء', questionText: 'ماذا ينتج عن تفاعل حمض مع قاعدة؟', options: [{id: 'ch5o1', text: 'ملح وماء'}, {id: 'ch5o2', text: 'أكسيد وهيدروجين'}, {id: 'ch5o3', text: 'حمض أقوى'}], correctOptionId: 'ch5o1', topic: 'الكيمياء التحليلية', difficulty: 'hard' },


  // Biology questions
  { id: 'b1', subjectId: 'biology', subjectName: 'الأحياء', questionText: 'ما هي وظيفة القلب الرئيسية؟', options: [{id: 'b1o1', text: 'التنفس'}, {id: 'b1o2', text: 'ضخ الدم'}, {id: 'b1o3', text: 'الهضم'}, {id: 'b1o4', text: 'الحركة'}], correctOptionId: 'b1o2', topic: 'وظائف الأعضاء', difficulty: 'easy' },
  { id: 'b2', subjectId: 'biology', subjectName: 'الأحياء', questionText: 'ما هو الجزء المسؤول عن عملية البناء الضوئي في النبات؟', options: [{id: 'b2o1', text: 'الجذر'}, {id: 'b2o2', text: 'الساق'}, {id: 'b2o3', text: 'الورقة'}], correctOptionId: 'b2o3', topic: 'الخلية والأنسجة', difficulty: 'easy' },
  { id: 'b3', subjectId: 'biology', subjectName: 'الأحياء', questionText: 'من هو مؤسس علم الوراثة؟', options: [{id: 'b3o1', text: 'داروين'}, {id: 'b3o2', text: 'مندل'}, {id: 'b3o3', text: 'باستور'}], correctOptionId: 'b3o2', topic: 'الوراثة', difficulty: 'medium' },
  { id: 'b4', subjectId: 'biology', subjectName: 'الأحياء', questionText: 'ما هي العملية التي تحول بها الكائنات الحية الغذاء إلى طاقة؟', options: [{id: 'b4o1', text: 'البناء الضوئي'}, {id: 'b4o2', text: 'التنفس الخلوي'}, {id: 'b4o3', text: 'التخمر'}], correctOptionId: 'b4o2', topic: 'وظائف الأعضاء', difficulty: 'medium' },
  { id: 'b5', subjectId: 'biology', subjectName: 'الأحياء', questionText: 'ما هو أكبر عضو في جسم الإنسان؟', options: [{id: 'b5o1', text: 'الدماغ'}, {id: 'b5o2', text: 'الكبد'}, {id: 'b5o3', text: 'الجلد'}], correctOptionId: 'b5o3', topic: 'وظائف الأعضاء', difficulty: 'hard' },


  // Arabic Language questions
  { id: 'ar1', subjectId: 'arabic_language', subjectName: 'اللغة العربية', questionText: 'ما هو جمع كلمة "كتاب"؟', options: [{id: 'ar1o1', text: 'كاتب'}, {id: 'ar1o2', text: 'كتب'}, {id: 'ar1o3', text: 'مكتبة'}, {id: 'ar1o4', text: 'كتيب'}], correctOptionId: 'ar1o2', topic: 'النحو والصرف', difficulty: 'easy' },
  { id: 'ar2', subjectId: 'arabic_language', subjectName: 'اللغة العربية', questionText: 'ما هو نوع "كان" في جملة "كان الجو صحوًا"؟', options: [{id: 'ar2o1', text: 'فعل تام'}, {id: 'ar2o2', text: 'فعل ناقص'}, {id: 'ar2o3', text: 'حرف ناسخ'}], correctOptionId: 'ar2o2', topic: 'النحو والصرف', difficulty: 'medium' },
  { id: 'ar3', subjectId: 'arabic_language', subjectName: 'اللغة العربية', questionText: 'من هو شاعر النيل؟', options: [{id: 'ar3o1', text: 'أحمد شوقي'}, {id: 'ar3o2', text: 'حافظ إبراهيم'}, {id: 'ar3o3', text: 'المتنبي'}], correctOptionId: 'ar3o2', topic: 'الأدب العربي', difficulty: 'medium' },
  { id: 'ar4', subjectId: 'arabic_language', subjectName: 'اللغة العربية', questionText: 'ما هو البحر العروضي لبيت الشعر: "إذا الشعب يومًا أراد الحياة ... فلا بد أن يستجيب القدر"؟', options: [{id: 'ar4o1', text: 'البحر الطويل'}, {id: 'ar4o2', text: 'البحر البسيط'}, {id: 'ar4o3', text: 'البحر الوافر'}], correctOptionId: 'ar4o2', topic: 'العروض', difficulty: 'hard' },


  // English Language questions
  { id: 'en1', subjectId: 'english_language', subjectName: 'اللغة الإنجليزية', questionText: 'What is the past tense of "go"?', options: [{id: 'en1o1', text: 'Goed'}, {id: 'en1o2', text: 'Went'}, {id: 'en1o3', text: 'Gone'}, {id: 'en1o4', text: 'Going'}], correctOptionId: 'en1o2', topic: 'Grammar', difficulty: 'easy' },
  { id: 'en2', subjectId: 'english_language', subjectName: 'اللغة الإنجليزية', questionText: 'Which word is a synonym for "happy"?', options: [{id: 'en2o1', text: 'Sad'}, {id: 'en2o2', text: 'Joyful'}, {id: 'en2o3', text: 'Angry'}], correctOptionId: 'en2o2', topic: 'Vocabulary', difficulty: 'easy' },
  { id: 'en3', subjectId: 'english_language', subjectName: 'اللغة الإنجليزية', questionText: 'Choose the correct sentence: "She ___ to the park yesterday."', options: [{id: 'en3o1', text: 'go'}, {id: 'en3o2', text: 'goes'}, {id: 'en3o3', text: 'went'}], correctOptionId: 'en3o3', topic: 'Grammar', difficulty: 'medium' },
  { id: 'en4', subjectId: 'english_language', subjectName: 'اللغة الإنجليزية', questionText: 'Identify the adjective in the sentence: "The quick brown fox jumps over the lazy dog."', options: [{id: 'en4o1', text: 'quick, brown, lazy'}, {id: 'en4o2', text: 'fox, dog'}, {id: 'en4o3', text: 'jumps, over'}], correctOptionId: 'en4o1', topic: 'Grammar', difficulty: 'medium' },


  // French Language questions
  { id: 'fr1', subjectId: 'french_language', subjectName: 'اللغة الفرنسية', questionText: 'Que signifie "bonjour" ?', options: [{id: 'fr1o1', text: 'Au revoir'}, {id: 'fr1o2', text: 'Bonjour'}, {id: 'fr1o3', text: 'Merci'}], correctOptionId: 'fr1o2', topic: 'Vocabulaire', difficulty: 'easy' },
  { id: 'fr2', subjectId: 'french_language', subjectName: 'اللغة الفرنسية', questionText: 'Comment dit-on "chat" en anglais ?', options: [{id: 'fr2o1', text: 'Dog'}, {id: 'fr2o2', text: 'Cat'}, {id: 'fr2o3', text: 'Mouse'}], correctOptionId: 'fr2o2', topic: 'Vocabulaire', difficulty: 'easy' },
  { id: 'fr3', subjectId: 'french_language', subjectName: 'اللغة الفرنسية', questionText: 'Conjuguez le verbe "être" au présent à la première personne du singulier.', options: [{id: 'fr3o1', text: ' suis'}, {id: 'fr3o2', text: 'es'}, {id: 'fr3o3', text: 'est'}], correctOptionId: 'fr3o1', topic: 'Grammaire', difficulty: 'medium' },
  { id: 'fr4', subjectId: 'french_language', subjectName: 'اللغة الفرنسية', questionText: 'Quel est le pluriel de "cheval" ?', options: [{id: 'fr4o1', text: 'Chevals'}, {id: 'fr4o2', text: 'Chevaux'}, {id: 'fr4o3', text: 'Chevales'}], correctOptionId: 'fr4o2', topic: 'Grammaire', difficulty: 'medium' },


  // Civics questions
  { id: 'cv1', subjectId: 'civics', subjectName: 'التربية الوطنية', questionText: 'ما هو دور المواطن في المجتمع؟', options: [{id: 'cv1o1', text: 'المشاركة الفعالة'}, {id: 'cv1o2', text: 'اللامبالاة'}, {id: 'cv1o3', text: 'النقد فقط'}, {id: 'cv1o4', text: 'الطاعة العمياء'}], correctOptionId: 'cv1o1', topic: 'الدستور والمواطنة', difficulty: 'easy' },
  { id: 'cv2', subjectId: 'civics', subjectName: 'التربية الوطنية', questionText: 'ما هي أعلى سلطة تشريعية في سوريا؟', options: [{id: 'cv2o1', text: 'مجلس الوزراء'}, {id: 'cv2o2', text: 'مجلس الشعب'}, {id: 'cv2o3', text: 'المحكمة الدستورية'}], correctOptionId: 'cv2o2', topic: 'المؤسسات الوطنية', difficulty: 'medium' },
  { id: 'cv3', subjectId: 'civics', subjectName: 'التربية الوطنية', questionText: 'حق التصويت يعتبر من الحقوق:', options: [{id: 'cv3o1', text: 'الاجتماعية'}, {id: 'cv3o2', text: 'السياسية'}, {id: 'cv3o3', text: 'الاقتصادية'}], correctOptionId: 'cv3o2', topic: 'الحقوق والواجبات', difficulty: 'medium' },


  // Islamic Education questions
  { id: 'rlis1', subjectId: 'islamic_education', subjectName: 'التربية الإسلامية', questionText: 'ما هو أحد أركان الإسلام الخمسة؟', options: [{id: 'rlis1o1', text: 'الصلاة'}, {id: 'rlis1o2', text: 'الصدق'}, {id: 'rlis1o3', text: 'الأمانة'}, {id: 'rlis1o4', text: 'التعاون'}], correctOptionId: 'rlis1o1', topic: 'العقيدة الإسلامية', difficulty: 'easy' },
  { id: 'rlis2', subjectId: 'islamic_education', subjectName: 'التربية الإسلامية', questionText: 'ما هو الكتاب المقدس في الإسلام؟', options: [{id: 'rlis2o1', text: 'الإنجيل'}, {id: 'rlis2o2', text: 'القرآن الكريم'}, {id: 'rlis2o3', text: 'التوراة'}], correctOptionId: 'rlis2o2', topic: 'العقيدة الإسلامية', difficulty: 'easy' },
  { id: 'rlis3', subjectId: 'islamic_education', subjectName: 'التربية الإسلامية', questionText: 'في أي شهر يصوم المسلمون؟', options: [{id: 'rlis3o1', text: 'شوال'}, {id: 'rlis3o2', text: 'رمضان'}, {id: 'rlis3o3', text: 'رجب'}], correctOptionId: 'rlis3o2', topic: 'الفقه', difficulty: 'easy' },


  // Christian Education questions
  { id: 'rlch1', subjectId: 'christian_education', subjectName: 'التربية المسيحية', questionText: 'ما هو أول أسفار العهد الجديد؟', options: [{id: 'rlch1o1', text: 'سفر التكوين'}, {id: 'rlch1o2', text: 'إنجيل متى'}, {id: 'rlch1o3', text: 'سفر الرؤيا'}, {id: 'rlch1o4', text: 'سفر الخروج'}], correctOptionId: 'rlch1o2', topic: 'الكتاب المقدس', difficulty: 'easy' },
  { id: 'rlch2', subjectId: 'christian_education', subjectName: 'التربية المسيحية', questionText: 'ما هو العيد الذي يحتفل به المسيحيون بقيامة المسيح؟', options: [{id: 'rlch2o1', text: 'عيد الميلاد'}, {id: 'rlch2o2', text: 'عيد الفصح'}, {id: 'rlch2o3', text: 'عيد العنصرة'}], correctOptionId: 'rlch2o2', topic: 'الحياة المسيحية', difficulty: 'easy' },
  { id: 'rlch3', subjectId: 'christian_education', subjectName: 'التربية المسيحية', questionText: 'كم عدد أسفار الكتاب المقدس بعهديه؟', options: [{id: 'rlch3o1', text: '27'}, {id: 'rlch3o2', text: '39'}, {id: 'rlch3o3', text: '66 أو 73 (حسب الطائفة)'}], correctOptionId: 'rlch3o3', topic: 'الكتاب المقدس', difficulty: 'medium' },


  // History questions
  { id: 'h1', subjectId: 'history', subjectName: 'التاريخ', questionText: 'في أي عام بدأت الحرب العالمية الأولى؟', options: [{id: 'h1o1', text: '1914'}, {id: 'h1o2', text: '1918'}, {id: 'h1o3', text: '1939'}, {id: 'h1o4', text: '1945'}], correctOptionId: 'h1o1', topic: 'التاريخ الحديث والمعاصر', difficulty: 'easy' },
  { id: 'h2', subjectId: 'history', subjectName: 'التاريخ', questionText: 'من هو أول رئيس للجمهورية العربية السورية؟', options: [{id: 'h2o1', text: 'شكري القوتلي'}, {id: 'h2o2', text: 'هاشم الأتاسي'}, {id: 'h2o3', text: 'ناظم القدسي'}], correctOptionId: 'h2o1', topic: 'تاريخ سوريا', difficulty: 'medium' },
  { id: 'h3', subjectId: 'history', subjectName: 'التاريخ', questionText: 'ما هي الحضارة التي بنت الأهرامات في مصر؟', options: [{id: 'h3o1', text: 'الحضارة السومرية'}, {id: 'h3o2', text: 'الحضارة المصرية القديمة'}, {id: 'h3o3', text: 'الحضارة الإغريقية'}], correctOptionId: 'h3o2', topic: 'التاريخ القديم', difficulty: 'easy' },


  // Geography questions
  { id: 'g1', subjectId: 'geography', subjectName: 'الجغرافيا', questionText: 'ما هي عاصمة سوريا؟', options: [{id: 'g1o1', text: 'دمشق'}, {id: 'g1o2', text: 'حلب'}, {id: 'g1o3', text: 'حمص'}, {id: 'g1o4', text: 'اللاذقية'}], correctOptionId: 'g1o1', topic: 'جغرافية سوريا', difficulty: 'easy' },
  { id: 'g2', subjectId: 'geography', subjectName: 'الجغرافيا', questionText: 'ما هو أطول نهر في العالم؟', options: [{id: 'g2o1', text: 'نهر النيل'}, {id: 'g2o2', text: 'نهر الأمازون'}, {id: 'g2o3', text: 'نهر اليانغتسي'}, {id: 'g2o4', text: 'نهر المسيسيبي'}], correctOptionId: 'g2o1', topic: 'الجغرافيا الطبيعية', difficulty: 'medium' },
  { id: 'g3', subjectId: 'geography', subjectName: 'الجغرافيا', questionText: 'ما هي أكبر قارة في العالم من حيث المساحة؟', options: [{id: 'g3o1', text: 'أفريقيا'}, {id: 'g3o2', text: 'آسيا'}, {id: 'g3o3', text: 'أمريكا الشمالية'}], correctOptionId: 'g3o2', topic: 'الجغرافيا البشرية', difficulty: 'easy' },


  // Philosophy and Psychology questions
  { id: 'phpsy1', subjectId: 'philosophy_psychology', subjectName: 'الفلسفة وعلم النفس', questionText: 'من هو الفيلسوف الذي قال "أنا أفكر، إذاً أنا موجود"؟', options: [{id: 'phpsy1o1', text: 'أفلاطون'}, {id: 'phpsy1o2', text: 'أرسطو'}, {id: 'phpsy1o3', text: 'ديكارت'}, {id: 'phpsy1o4', text: 'سقراط'}], correctOptionId: 'phpsy1o3', topic: 'تاريخ الفلسفة', difficulty: 'easy' },
  { id: 'phpsy2', subjectId: 'philosophy_psychology', subjectName: 'الفلسفة وعلم النفس', questionText: 'ما هو الفرع من علم النفس الذي يدرس سلوك الفرد في الجماعة؟', options: [{id: 'phpsy2o1', text: 'علم النفس التربوي'}, {id: 'phpsy2o2', text: 'علم النفس الاجتماعي'}, {id: 'phpsy2o3', text: 'علم النفس العيادي'}], correctOptionId: 'phpsy2o2', topic: 'علم النفس العام', difficulty: 'medium' },
  { id: 'phpsy3', subjectId: 'philosophy_psychology', subjectName: 'الفلسفة وعلم النفس', questionText: 'من هو مؤسس التحليل النفسي؟', options: [{id: 'phpsy3o1', text: 'كارل يونغ'}, {id: 'phpsy3o2', text: 'سيغموند فرويد'}, {id: 'phpsy3o3', text: 'إيفان بافلوف'}], correctOptionId: 'phpsy3o2', topic: 'علم النفس العام', difficulty: 'medium' },
];


export const teachers = [
  { id: 'teacher1', name: 'الأستاذ أحمد' },
  { id: 'teacher2', name: 'الأستاذة فاطمة' },
  { id: 'teacher3', name: 'الأستاذ خالد' },
  { id: 'teacher4', name: 'الأستاذة سارة' },
];

export const mockExams = [
  { id: "exam1", title: "اختبار الرياضيات الشامل", subjectId: "math", subjectName: "الرياضيات", teacherName: "الأستاذ أحمد", duration: "ساعتان", totalQuestions: allQuestions.filter(q => q.subjectId === 'math').length, image: "https://placehold.co/600x400.png", imageHint: "math equations", published: true, questions: allQuestions.filter(q => q.subjectId === 'math').slice(0,3) },
  { id: "exam2", title: "اختبار الفيزياء: الكهرباء", subjectId: "physics", subjectName: "الفيزياء", teacherName: "الأستاذة فاطمة", duration: "ساعة ونصف", totalQuestions: allQuestions.filter(q => q.subjectId === 'physics').length, image: "https://placehold.co/600x400.png", imageHint: "physics experiment", published: true, questions: allQuestions.filter(q => q.subjectId === 'physics').slice(0,2) },
  { id: "exam3", title: "اختبار الكيمياء العضوية", subjectId: "chemistry", subjectName: "الكيمياء", teacherName: "الأستاذ خالد", duration: "ساعة واحدة", totalQuestions: allQuestions.filter(q => q.subjectId === 'chemistry').length, image: "https://placehold.co/600x400.png", imageHint: "chemistry lab", published: true, questions: allQuestions.filter(q => q.subjectId === 'chemistry').slice(0,1) },
  { id: "exam4", title: "اختبار تجريبي في اللغة العربية", subjectId: "arabic_language", subjectName: "اللغة العربية", teacherName: "الأستاذة سارة", duration: "ساعتان", totalQuestions: allQuestions.filter(q => q.subjectId === 'arabic_language').length, image: "https://placehold.co/600x400.png", imageHint: "arabic calligraphy", published: true, questions: allQuestions.filter(q => q.subjectId === 'arabic_language').slice(0,1) },
];
