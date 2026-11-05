import { AnalysisBlueprint, ScopeMode, TargetPlatform } from '../types/prompt';

export interface IdeaPreset {
  id: string;
  label: string;
  scopeType: ScopeMode;
  recommendedPlatform: TargetPlatform;
  ideaText: string;
  badgeText: string;
}

export const IDEA_PRESETS: IdeaPreset[] = [
  {
    id: 'preset-full-delivery',
    label: 'تطبيق متكامل: إدارة حجوزات العيادات الطبية الذكية',
    scopeType: 'full_app',
    recommendedPlatform: 'flutter',
    badgeText: 'تطبيق كامل من الصفر',
    ideaText:
      'أريد بناء تطبيق متكامل لحجز المواعيد الطبية وإدارة الملف الصحي للمريض. يتيح للمريض البحث عن الأطباء حسب التخصص والمدينة، مشاهدة الأوقات المتاحة، حجز موعد حضوري أو استشارة مرئية، واستلام تنبيهات بمواعيد الأدوية، مع لوحة خاصة للطبيب لإدارة جدول المواعيد وكتابة الوصفة الطبية الإلكترونية.',
  },
  {
    id: 'preset-feature-wallet',
    label: 'ميزة لتطبيق قائم: نظام المحفظة الرقمية وتقسيم الفواتير',
    scopeType: 'feature',
    recommendedPlatform: 'aistudio',
    badgeText: 'ميزة لتطبيق موجود',
    ideaText:
      'لدي تطبيق طلبات مطاعم موجود مسبقاً وأريد إضافة ميزة جديدة داخله وهي "تقسيم الفاتورة والمحفظة الجماعية" بحيث يستطيع أكثر من صديق المشاركة في دفع نفس الطلب عبر رابط سريع، مع حساب نسبة كل شخص تلقائياً أو حسب الأصناف التي اختارها، وإرجاع الفائض للمحفظة داخل التطبيق.',
  },
  {
    id: 'preset-saas-inventory',
    label: 'تطبيق ويب: نظام محاسبة ومخزون للمتاجر السحابية',
    scopeType: 'full_app',
    recommendedPlatform: 'bolt',
    badgeText: 'تطبيق ويب SaaS',
    ideaText:
      'أريد إنشاء نظام ويب لإدارة المخزون والمبيعات ونقاط البيع (POS) يدعم الباركود، تنبيهات انخفاض المخزون، تقارير الأرباح اليومية والشهرية، وإصدار فواتير ضريبية متوافقة مع QR Code مع صلاحيات مختلفة للمدير والكاشير.',
  },
  {
    id: 'preset-feature-offline-sync',
    label: 'ميزة لتطبيق قائم: العمل بدون إنترنت والمزامنة التلقائية',
    scopeType: 'feature',
    recommendedPlatform: 'cursor',
    badgeText: 'ميزة معمارية متقدمة',
    ideaText:
      'عندي تطبيق لمندوبي المبيعات الميدانيين وأحتاج برومبت لإضافة ميزة العمل بدون إنترنت (Offline-First Sync) بحيث يستطيع المندوب تسجيل الطلبات وإضافة العملاء الجدد في المناطق التي لا يوجد بها تغطية، وعند عودة الاتصال تتم المزامنة التلقائية مع الخادم وحل أي تعارض في البيانات.',
  },
];

export const INITIAL_SAMPLE_BLUEPRINT: AnalysisBlueprint = {
  projectTitleAr: 'منصة شفاء بلس لإدارة العيادات والملف الصحي الذكي',
  projectTitleEn: 'ShifaaPlus Smart Clinic & EHR Platform',
  executiveSummary:
    'نظام برمجي متكامل يربط بين المريض والطبيب عبر معمارية نظيفة (Clean Architecture) مقسمة إلى الموديلات، الخدمات، والواجهات، مع دعم كامل للغة العربية واتجاه RTL، التزام صارم بـ Null Safety، وتغطية شاملة لحالات تعارض الحجوزات والتنبيهات الدوائية.',
  detectedScope: 'full_app',
  scopeReasoning:
    'وصف المستخدم يتضمن دورة حياة منتج كاملة تشمل واجهات المريض، جدول الطبيب، الملف الصحي، والوصفات الإلكترونية، مما يتطلب بناء تطبيق متكامل من الصفر بهيكل قاعدة بيانات وواجهات مترابطة.',
  existingAppIntegrationNotes:
    'في حال الرغبة بدمج هذا النظام مستقبلاً مع نظام مستشفى قائم (HIS)، تم تصميم طبقة الخدمات (Services) عبر واجهات مجردة (Repositories) تقبل الربط مع REST API أو FHIR مباشرة دون تعديل شاشات العرض.',
  strengths: [
    'وضوح القيمة الأساسية للجمع بين حجز المواعيد والملف الصحي والوصفة الإلكترونية في تجربة واحدة.',
    'وجود طرفين واضحين في النظام (المريض والطبيب) مما يسهل فصل الصلاحيات ومسارات الشاشات.',
    'إمكانية التوسع العالية لإضافة الدفع الإلكتروني والتأمين الطبي لاحقاً دون تغيير الهيكل الأساسي.',
  ],
  critiquesAndSuggestions: [
    {
      id: 'crit-1',
      category: 'edge_case',
      title: 'منع الحجز المزدوج في نفس اللحظة (Concurrency Lock)',
      problemAnalysis:
        'الشرح النصي لم يحدد ماذا يحدث لو قام مريضان بالضغط على نفس الموعد المتاح في نفس الثانية.',
      proposedSolution:
        'إضافة آلية قفل مؤقت للموعد (Slot Hold / Optimistic Locking) لمدة 5 دقائق أثناء إتمام الحجز مع التحقق الذري في طبقة الخدمة.',
      impact: 'high',
      selected: true,
    },
    {
      id: 'crit-2',
      category: 'ux',
      title: 'تحديد المنطقة الزمنية وتذكيرات الجرعات الذكية',
      problemAnalysis:
        'مواعيد الاستشارات المرئية وتنبيهات الأدوية قدتختل إذا سافر المريض أو اختلفت إعدادات الوقت في جهازه.',
      proposedSolution:
        'تخزين جميع المواعيد بصيغة UTC في الموديل مع تحويلها محلياً في طبقة العرض وإضافة جدولة إشعارات محلية تعمل حتى بدون إنترنت.',
      impact: 'high',
      selected: true,
    },
    {
      id: 'crit-3',
      category: 'security',
      title: 'حماية خصوصية السجل الطبي والوصفات الإلكترونية',
      problemAnalysis:
        'البيانات الصحية حساسة للغاية وتتطلب صلاحيات وصول مشددة بين الأطباء والمرضى.',
      proposedSolution:
        'تطبيق التحقق من الصلاحيات المبني على الأدوار (RBAC) وتوليد رمز تحقق رقمي للوصفة الطبية لمنع التلاعب بها.',
      impact: 'high',
      selected: true,
    },
    {
      id: 'crit-4',
      category: 'architecture',
      title: 'فصل حالة الواجهة وتخزين الملف الصحي مؤقتاً (Offline Caching)',
      problemAnalysis:
        'المريض قد يحتاج لعرض وصفته الطبية أو مواعيده في الصيدلية أو العيادة مع ضعف الاتصال بالإنترنت.',
      proposedSolution:
        'إضافة طبقة تخزين محلي للملف الصحي والوصفات النشطة مع مزامنة تلقائية عند توفر الشبكة.',
      impact: 'medium',
      selected: true,
    },
  ],
  screens: [
    {
      id: 'scr-home',
      screenNameAr: 'الرئيسية والبحث الذكي عن الأطباء',
      screenNameEn: 'Patient Home & Doctor Discovery',
      route: '/home',
      deviceType: 'mobile',
      purpose:
        'تمكين المريض من استعراض موعده القادم، تصفية الأطباء حسب التخصص والمدينة والتقييم، والوصول السريع لتنبيهات الأدوية.',
      userFlowStep: 'نقطة الانطلاق الرئيسية بعد تسجيل الدخول؛ تنقل المستخدم إلى شاشة تفاصيل الطبيب أو شاشة الوصفات.',
      stateHandling: [
        'حالة التحميل: عرض بطاقات هيكلية (Skeleton) أثناء جلب قائمة الأطباء.',
        'حالة عدم وجود نتائج بحث: عرض رسالة واضحة مع زر إعادة ضبط الفلاتر.',
        'حالة الاتصال الضعيف: عرض المواعيد المحفوظة محلياً مع شريط تنبيه هادئ.',
      ],
      components: [
        {
          name: 'شريط البحث والتصفية السريعة',
          type: 'header',
          description: 'حقل بحث فوري بالاسم أو التخصص مع أزرار تصفية التخصصات الطبية.',
          behavior: 'يحدث قائمة الأطباء لحظياً مع Debounce لمدة 250ms لمنع الطلبات الزائدة.',
          sampleData: ['طب القلب والأوعية', 'طب الأطفال', 'الجلدية والليزر', 'العيون'],
        },
        {
          name: 'بطاقة الموعد القادم والتذكير الدوائي',
          type: 'hero',
          description: 'ملخص بارز لأقرب موعد طبي مع العد التنازلي وزر دخول الاستشارة المرئية.',
          behavior: 'يتحول الزر إلى حالة التفعيل قبل الموعد بـ 10 دقائق ويفتح غرفة الاستشارة.',
          sampleData: ['د. سارة المنصور · استشاري باطنية', 'اليوم · 05:30 مساءً', 'استشارة مرئية مؤكدة'],
        },
        {
          name: 'قائمة الأطباء المتاحين',
          type: 'list',
          description: 'بطاقات الأطباء مع التقييم، سعر الكشف، وأقرب وقت متاح للحجز.',
          behavior: 'الضغط على البطاقة يفتح شاشة جدول المواعيد التفصيلي للطبيب.',
          sampleData: [
            'د. خالد العتيبي · استشاري قلب · متاح اليوم 6:00 م',
            'د. ريم الحربي · أخصائية أطفال · متاح غداً 10:00 ص',
            'د. فهد السالم · استشاري عظام · متاح اليوم 8:15 م',
          ],
        },
      ],
    },
    {
      id: 'scr-booking',
      screenNameAr: 'جدولة الموعد وتأكيد الحجز',
      screenNameEn: 'Appointment Slot Picker & Booking',
      route: '/booking/:doctorId',
      deviceType: 'mobile',
      purpose: 'اختيار نوع الموعد (حضوري أو مرئي)، تحديد اليوم والساعة المتاحة، وكتابة الأعراض الأولية للطبيب.',
      userFlowStep: 'تأتي بعد اختيار الطبيب من الرئيسية، وتنتهي بتأكيد الحجز وإصدار رقم المرجع.',
      stateHandling: [
        'التحقق من توافر الفترة الزمنية قبل التأكيد النهائي.',
        'تعطيل الأوقات المحجوزة مسبقاً بصرياً وبرمجياً.',
      ],
      components: [
        {
          name: 'محدد نوع الزيارة والتاريخ',
          type: 'form',
          description: 'اختيار بين زيارة العيادة أو مكالمة فيديو، مع شريط أيام الأسبوع.',
          behavior: 'يعيد جلب الفترات الزمنية المتاحة للطبيب فور تغيير اليوم أو نوع الزيارة.',
          sampleData: ['زيارة حضورية بالعيادة', 'استشارة مرئية عن بُعد', 'الأحد 12 نوفمبر · الإثنين 13 نوفمبر'],
        },
        {
          name: 'شبكة الفترات الزمنية المتاحة',
          type: 'card_grid',
          description: 'عرض الأوقات المتاحة بصيغة واضحة مع حالة كل فترة.',
          behavior: 'يحجز الفترة مؤقتاً عند اختيارها ويحدث ملخص التكلفة في الأسفل.',
          sampleData: ['04:30 م (متاح)', '05:00 م (متاح)', '05:30 م (محجوز)', '06:00 م (متاح)'],
        },
        {
          name: 'شريط تأكيد الحجز الفوري',
          type: 'action_bar',
          description: 'يعرض إجمالي رسوم الكشف وزر تأكيد الموعد النهائي.',
          behavior: 'يستدعي BookingService.createAppointment ويعرض نافذة التأكيد.',
          sampleData: ['رسوم الاستشارة: 150 ر.س', 'تأكيد الحجز الفوري'],
        },
      ],
    },
    {
      id: 'scr-doctor-dashboard',
      screenNameAr: 'لوحة الطبيب وإصدار الوصفة الإلكترونية',
      screenNameEn: 'Doctor Schedule & E-Prescription Console',
      route: '/doctor/console',
      deviceType: 'desktop',
      purpose: 'إدارة جدول المرضى اليومي، استعراض التاريخ المرضي، وإصدار وصفة طبية إلكترونية بجرعات دقيقة.',
      userFlowStep: 'الشاشة المركزية للطبيب؛ تتيح فتح ملف المريض وإرسال الوصفة مباشرة لتطبيق المريض.',
      stateHandling: [
        'التحقق من عدم وجود تعارض دوائي أو حقول جرعات فارغة قبل اعتماد الوصفة.',
        'حفظ المسودة تلقائياً أثناء كتابة التشخيص.',
      ],
      components: [
        {
          name: 'مؤشرات عيادة اليوم',
          type: 'chart',
          description: 'ملخص إحصائي لعدد مواعيد اليوم، الحالات المكتملة، والاستشارات المرئية.',
          behavior: 'تصفية قائمة المرضى عند النقر على أي حالة.',
          sampleData: ['إجمالي المواعيد: 18', 'تم الكشف: 11', 'قيد الانتظار: 7'],
        },
        {
          name: 'نموذج تحرير الوصفة الإلكترونية',
          type: 'form',
          description: 'إضافة اسم الدواء، الجرعة، عدد المرات يومياً، ومدة العلاج بالأيام.',
          behavior: 'ينشئ جدول تنبيهات دوائية تلقائياً في حساب المريض فور الاعتماد.',
          sampleData: ['Amoxicillin 500mg · كبسولة كل 8 ساعات · لمدة 7 أيام', 'Paracetamol 500mg · عند اللزوم'],
        },
      ],
    },
  ],
  codeArchitecture: {
    overview:
      'تم تصميم البنية البرمجية وفق معمارية الطبقات النظيفة (Layered Clean Architecture) مع فصل تام بين نماذج البيانات (Models)، منطق الأعمال والاتصال بالخادم (Services)، وشاشات العرض التفاعلية (Views)، مع توافق 100% مع Null Safety ودعم أصيل للعربية RTL.',
    designPattern: 'Clean Modular Architecture (Models / Services / Views + Repository Pattern)',
    stateManagement: 'Riverpod / ChangeNotifier (Flutter) أو React Context + Custom Hooks (Web)',
    nullSafetyAndEdgeCases: [
      'جميع الحقول غير القابلة للغياب معرّفة بـ required مع قيم افتراضية آمنة عند التحويل من JSON.',
      'معالجة حالات انقطاع الاتصال عبر كائن Result<T> موحد يمنع انهيار الواجهة بسبب الاستثناءات غير المتوقعة.',
      'التحقق الصارم من صلاحية التواريخ ومنع حجز موعد في وقت سابق للوقت الحالي.',
    ],
    rtlAndLocalizationRules: [
      'استخدام EdgeInsetsDirectional و AlignmentDirectional بدلاً من Left/Right الثابتة لضمان انعكاس الواجهة بسلاسة.',
      'تغليف التطبيق بـ Directionality(textDirection: TextDirection.rtl) واعتماد خطوط عربية واضحة.',
      'عرض الأرقام الطبية والتواريخ والأوقات بتنسيق جدول متناسق (tabular-nums).',
    ],
    models: [
      {
        name: 'AppointmentModel & PrescriptionItem',
        filePath: 'lib/models/appointment_model.dart',
        responsibility: 'تمثيل بيانات الموعد الطبي، حالة الحجز، وعناصر الوصفة الطبية مع التحويل الآمن من وإلى JSON.',
        keyFieldsOrMethods: [
          'final String id',
          'final String patientId',
          'final String doctorId',
          'final DateTime scheduledAtUtc',
          'final AppointmentStatus status',
          'factory AppointmentModel.fromJson(Map<String, dynamic> json)',
        ],
        howItWorks:
          'يستقبل البيانات الخام من الخادم ويحولها إلى كائنات غير قابلة للتعديل (Immutable) متوافقة مع Null Safety، مع دالة copyWith لتحديث الحالة بأمان.',
        interactions: 'يُستخدم بواسطة AppointmentService لجلب وإرسال البيانات، ويُقرأ بواسطة شاشات الحجز ولوحة الطبيب.',
        dartCodeSnippet: `enum AppointmentStatus { pending, confirmed, completed, cancelled }

class AppointmentModel {
  final String id;
  final String patientId;
  final String doctorId;
  final String doctorName;
  final String specialty;
  final DateTime scheduledAtUtc;
  final bool isVideoConsultation;
  final AppointmentStatus status;
  final String? notes;

  const AppointmentModel({
    required this.id,
    required this.patientId,
    required this.doctorId,
    required this.doctorName,
    required this.specialty,
    required this.scheduledAtUtc,
    required this.isVideoConsultation,
    required this.status,
    this.notes,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: (json['id'] as String?) ?? '',
      patientId: (json['patientId'] as String?) ?? '',
      doctorId: (json['doctorId'] as String?) ?? '',
      doctorName: (json['doctorName'] as String?) ?? 'طبيب عام',
      specialty: (json['specialty'] as String?) ?? 'عام',
      scheduledAtUtc: DateTime.tryParse((json['scheduledAtUtc'] as String?) ?? '')?.toUtc() ??
          DateTime.now().toUtc(),
      isVideoConsultation: (json['isVideoConsultation'] as bool?) ?? false,
      status: AppointmentStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => AppointmentStatus.pending,
      ),
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'patientId': patientId,
        'doctorId': doctorId,
        'doctorName': doctorName,
        'specialty': specialty,
        'scheduledAtUtc': scheduledAtUtc.toIso8601String(),
        'isVideoConsultation': isVideoConsultation,
        'status': status.name,
        'notes': notes,
      };
}`,
      },
    ],
    services: [
      {
        name: 'AppointmentBookingService',
        filePath: 'lib/services/appointment_booking_service.dart',
        responsibility: 'إدارة عمليات البحث عن الأطباء، التحقق من عدم ازدواجية الموعد، وتأكيد الحجز وإصدار الوصفات.',
        keyFieldsOrMethods: [
          'Future<List<AppointmentModel>> fetchUpcomingAppointments(String patientId)',
          'Future<AppointmentModel> bookSlot({required String doctorId, required DateTime slotUtc})',
          'Future<bool> verifySlotAvailability(String doctorId, DateTime slotUtc)',
        ],
        howItWorks:
          'يتحقق أولاً من توفر الموعد عبر قفل التزامن، ثم ينشئ سجل الحجز ويعيد الكائن المحدث أو يرمي استثناءً واضحاً باللغة العربية للواجهة.',
        interactions: 'يتواصل مع قاعدة البيانات أو واجهة البرمجة الخلفية ويزود طبقة الواجهات بالبيانات الموثقة.',
        dartCodeSnippet: `class AppointmentBookingService {
  final List<AppointmentModel> _cache = [];

  Future<List<AppointmentModel>> fetchUpcomingAppointments(String patientId) async {
    await Future<void>.delayed(const Duration(milliseconds: 250));
    return _cache.where((item) => item.patientId == patientId).toList()
      ..sort((a, b) => a.scheduledAtUtc.compareTo(b.scheduledAtUtc));
  }

  Future<AppointmentModel> bookSlot({
    required String patientId,
    required String doctorId,
    required String doctorName,
    required String specialty,
    required DateTime slotUtc,
    required bool isVideoConsultation,
    String? notes,
  }) async {
    if (slotUtc.isBefore(DateTime.now().toUtc())) {
      throw const FormatException('لا يمكن حجز موعد في وقت سابق للوقت الحالي.');
    }

    final bool hasConflict = _cache.any(
      (existing) =>
          existing.doctorId == doctorId &&
          existing.status != AppointmentStatus.cancelled &&
          existing.scheduledAtUtc.isAtSameMomentAs(slotUtc),
    );

    if (hasConflict) {
      throw StateError('عذراً، هذه الفترة الزمنية تم حجزها للتو. يرجى اختيار وقت آخر.');
    }

    final newAppointment = AppointmentModel(
      id: 'APT-\${DateTime.now().millisecondsSinceEpoch}',
      patientId: patientId,
      doctorId: doctorId,
      doctorName: doctorName,
      specialty: specialty,
      scheduledAtUtc: slotUtc,
      isVideoConsultation: isVideoConsultation,
      status: AppointmentStatus.confirmed,
      notes: notes,
    );

    _cache.add(newAppointment);
    return newAppointment;
  }
}`,
      },
    ],
    views: [
      {
        name: 'PatientBookingScreen (RTL Production Widget)',
        filePath: 'lib/views/patient_booking_screen.dart',
        responsibility: 'عرض شاشة حجز المواعيد بتصميم عربي أصيل (RTL) مع معالجة حالات التحميل والأخطاء والتأكيد الفوري.',
        keyFieldsOrMethods: [
          'Widget build(BuildContext context)',
          'Future<void> _handleConfirmBooking()',
          'Directionality(textDirection: TextDirection.rtl)',
        ],
        howItWorks:
          'تستخدم StatefulWidget مع Directionality RTL وحشوات EdgeInsetsDirectional لعرض الأوقات المتاحة والتفاعل الفوري مع AppointmentBookingService.',
        interactions: 'تستدعي AppointmentBookingService عند ضغط زر التأكيد وتعرض حالة الحجز للمستخدم.',
        dartCodeSnippet: `import 'package:flutter/material.dart';

class PatientBookingScreen extends StatefulWidget {
  final String doctorId;
  final String doctorName;
  final String specialty;

  const PatientBookingScreen({
    super.key,
    required this.doctorId,
    required this.doctorName,
    required this.specialty,
  });

  @override
  State<PatientBookingScreen> createState() => _PatientBookingScreenState();
}

class _PatientBookingScreenState extends State<PatientBookingScreen> {
  int _selectedSlotIndex = 0;
  bool _isVideoConsultation = true;
  bool _isSubmitting = false;
  String? _feedbackMessage;

  final List<String> _availableSlots = const [
    '04:30 مساءً',
    '05:00 مساءً',
    '05:30 مساءً',
    '06:15 مساءً',
  ];

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: Text('حجز موعد · \${widget.doctorName}'),
          centerTitle: false,
        ),
        body: Padding(
          padding: const EdgeInsetsDirectional.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                widget.specialty,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                title: const Text('استشارة مرئية عبر الفيديو'),
                subtitle: const Text('حضور الموعد مباشرة من التطبيق'),
                value: _isVideoConsultation,
                onChanged: (val) => setState(() => _isVideoConsultation = val),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: List.generate(_availableSlots.length, (index) {
                  final isSelected = _selectedSlotIndex == index;
                  return ChoiceChip(
                    label: Text(_availableSlots[index]),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedSlotIndex = index),
                  );
                }),
              ),
              const Spacer(),
              if (_feedbackMessage != null)
                Padding(
                  padding: const EdgeInsetsDirectional.only(bottom: 12),
                  child: Text(_feedbackMessage!),
                ),
              FilledButton(
                onPressed: _isSubmitting ? null : () async {
                  setState(() {
                    _isSubmitting = true;
                    _feedbackMessage = 'تم تأكيد الحجز بنجاح في الفترة المختارة.';
                    _isSubmitting = false;
                  });
                },
                child: const Text('تأكيد حجز الموعد الآن'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`,
      },
    ],
  },
  webSearch: {
    summaryAr:
      'أظهرت نتائج البحث لأفضل منصات الرعاية الصحية الرقمية (مثل Zocdoc و Vezeeta و Epic MyChart) أن أعلى معدل إتمام للحجوزات يتحقق عند دمج اختيار الفترة الزمنية ونوع الاستشارة في شاشة واحدة لا تتطلب أكثر من 3 نقرات، مع إبراز أقرب موعد متاح مباشرة في بطاقة البحث.',
    recommendedPatterns: [
      'Optimistic Slot Reservation: حجز مبدئي للفترة الزمنية لمدة 5 دقائق لمنع التضارب.',
      'Offline-First Prescription Card: تخزين الوصفة الطبية محلياً مع QR Code للصيدليات.',
      'RTL-First Directional Layout: الاعتماد الكامل على خصائص الاتجاه المنطقية (Start/End) بدلاً من (Left/Right).',
    ],
    uiScreenInspirations: [
      {
        screenTitle: 'شاشة اكتشاف الأطباء والفلترة اللحظية',
        referenceAppExamples: 'Vezeeta / Zocdoc / Sehhaty',
        layoutBestPractice: 'وضع شريط التخصصات في الأعلى متبوعاً ببطاقة الموعد القادم ثم قائمة الأطباء المزودة بأقرب وقت متاح.',
        keyUXElements: ['فلترة فورية بدون إعادة تحميل', 'شارة أقرب موعد متاح اليوم', 'تبديل سريع بين عيادة واستشارة فيديو'],
      },
      {
        screenTitle: 'لوحة الطبيب لإصدار الوصفة الإلكترونية',
        referenceAppExamples: 'Epic MyChart / Practo Pro',
        layoutBestPractice: 'تقسيم الشاشة إلى عمودين: قائمة مواعيد اليوم على اليمين، وملف المريض مع نموذج الوصفة على اليسار.',
        keyUXElements: ['قوالب جرعات جاهزة بنقرة واحدة', 'تنبيه تلقائي لتعارض الأدوية', 'إرسال فوري لتنبيهات الجرعات للمريض'],
      },
    ],
    recommendedPackages: [
      { name: 'flutter_riverpod / provider', purpose: 'إدارة حالة المواعيد والملف الصحي بكفاءة عالية مع فصل المنطق عن الواجهات' },
      { name: 'intl & flutter_localizations', purpose: 'دعم كامل للغة العربية واتجاه RTL وتنسيق التواريخ والأوقات' },
      { name: 'freezed / json_serializable', purpose: 'بناء موديلات بيانات آمنة ضد Null مع توليد تلقائي لـ fromJson/toJson' },
    ],
    sources: [
      {
        title: 'Flutter Internationalization & RTL Best Practices - Flutter Docs',
        uri: 'https://docs.flutter.dev/ui/accessibility-and-internationalization/internationalization',
        category: 'architecture',
      },
      {
        title: 'Healthcare Appointment Booking UX Patterns & Wireframes',
        uri: 'https://www.nngroup.com/articles/healthcare-ux/',
        category: 'ui_inspiration',
      },
    ],
  },
  masterPrompts: {
    universalMasterPrompt: `# البرومبت الهندسي الشامل (Master Coding Prompt)
## المشروع: منصة شفاء بلس لإدارة العيادات والملف الصحي الذكي (ShifaaPlus Smart Clinic & EHR)
**نوع الطلب (Scope):** بناء تطبيق متكامل من الصفر (Full Production Application)
**اللغة والاتجاه:** دعم كامل للغة العربية (RTL-First) مع توافق صارم مع Null Safety

---

### 1. الهدف العام والفكرة الأساسية
قم ببناء تطبيق متكامل لحجز المواعيد الطبية وإدارة الملف الصحي والوصفات الإلكترونية يربط بين المريض والطبيب. يجب أن يكون الكود جاهزاً للإنتاج (Production-Ready) خالياً من أي عناصر وهمية (No Mock Stubs)، ومقسماً معمارياً إلى:
1. **الموديلات (Models / Data Layer)**: كيانات البيانات مع التحقق الصارم و Null Safety.
2. **الخدمات (Services / Business Logic)**: إدارة الحجوزات، منع ازدواجية المواعيد، وجدولة الأدوية.
3. **الواجهات (Views / Presentation Layer)**: شاشات تفاعلية متجاوبة تدعم العربية RTL وكافة حالات الواجهة (Loading, Empty, Error, Populated).

---

### 2. المتطلبات المعمارية والتحسينات المعتمدة (Critique-Driven Enhancements)
- **منع الحجز المزدوج (Concurrency Lock)**: التحقق الذري من توفر الفترة الزمنية قبل اعتماد الحجز ومنع حجز نفس الموعد لمريضين.
- **توحيد المناطق الزمنية (UTC Normalization)**: حفظ جميع الأوقات بصيغة UTC وتحويلها للتوقيت المحلي للمستخدم عند العرض.
- **حماية السجل الطبي (RBAC Security)**: فصل صلاحيات عرض المريض عن لوحة تحكم الطبيب وتحقق صارم من حقول الوصفة الإلكترونية.
- **التخزين المحلي الذكي (Offline Caching)**: إتاحة استعراض المواعيد المؤكدة والوصفات النشطة حتى عند انقطاع الاتصال.

---

### 3. تفصيل شاشات واجهة المستخدم (UI Screens & Interactions)
1. **شاشة الرئيسية واكتشاف الأطباء (\`/home\`)**:
   - شريط بحث فوري بالاسم أو التخصص + أزرار تصفية التخصصات.
   - بطاقة بارزة للموعد القادم مع زر دخول الاستشارة المرئية.
   - قائمة الأطباء مع التقييم، رسوم الكشف، وأقرب وقت متاح اليوم.
2. **شاشة جدولة الموعد وتأكيد الحجز (\`/booking/:doctorId\`)**:
   - تبديل بين (زيارة حضورية بالعيادة / استشارة مرئية عن بُعد).
   - شبكة الفترات الزمنية المتاحة مع تعطيل الفترات المحجوزة.
   - حقل ملاحظات الأعراض الأولية وزر تأكيد الحجز الفوري.
3. **لوحة تحكم الطبيب وإصدار الوصفة (\`/doctor/console\`)**:
   - إحصائيات مواعيد اليوم (إجمالي، مكتمل، قيد الانتظار).
   - قائمة المرضى مع إمكانية فتح الملف الصحي.
   - نموذج إصدار وصفة طبية إلكترونية (الدواء، الجرعة، التكرار، مدة العلاج) يولد تنبيهات تلقائية للمريض.

---

### 4. هيكلة الأكواد المطلوبة (Code Structure Specification)
- **Models**: \`DoctorModel\`, \`AppointmentModel\`, \`PrescriptionModel\`, \`MedicationReminderModel\` (كاملة مع \`fromJson\`, \`toJson\`, \`copyWith\`).
- **Services**: \`AppointmentBookingService\`, \`PrescriptionService\`, \`NotificationSchedulerService\`.
- **Views**: \`PatientHomeScreen\`, \`PatientBookingScreen\`, \`DoctorConsoleScreen\`, \`PrescriptionDetailModal\`.

يرجى كتابة الكود الكامل لجميع الملفات المذكورة أعلاه دون اختصار، مع تفعيل جميع الأزرار والنماذج والفلاتر.`,

    platformSpecificPrompt: `# Full-Stack Production Prompt (Google AI Studio / Bolt / Lovable)
Build a complete, production-ready Arabic RTL Smart Clinic & Electronic Health Record web application (**منصة شفاء بلس - ShifaaPlus**).

## Tech Stack & RTL Setup
- **Framework**: React 19 + TypeScript + Tailwind CSS (\`dir="rtl" lang="ar"\` on \`<html>\`).
- **Typography**: Google Fonts \`Cairo\` for headings/buttons, \`Tajawal\` for body text, \`JetBrains Mono\` (\`tabular-nums\`) for dates, times, and medical dosages.
- **Architecture**: Modular separation into \`src/types/models.ts\`, \`src/services/clinicService.ts\`, and \`src/components/views/*\`.

## Core Functional Modules to Implement Completely
1. **Doctor Discovery & Live Filter Engine**:
   - Search by doctor name or specialty (Cardiology, Pediatrics, Dermatology, Orthopedics).
   - Filter by consultation mode (In-Clinic vs. Video Consultation) and availability today.
2. **Concurrency-Safe Appointment Booking Flow**:
   - Interactive day & time-slot selector with conflict detection (prevent double-booking the same doctor & time slot).
   - Instant booking confirmation generating a reference ID and updating the "Upcoming Appointments" list.
3. **Doctor Console & E-Prescription Generator**:
   - Role switcher between "واجهة المريض (Patient View)" and "لوحة الطبيب (Doctor Console)".
   - Doctors can mark appointments as completed and issue multi-item E-Prescriptions (drug name, dosage, frequency, duration) which immediately populate the patient's Medication Reminders tracker.`,

    flutterProductionPrompt: `# برومبت خبير Flutter & Dart (Production-Ready + Null Safety + RTL)
أنت خبير Flutter & Dart. واجبك تقديم كود برمجي كامل جاهز للعمل (Production-Ready) يدعم اللغة العربية وRTL، متوافق 100% مع Null Safety ومقسم بشكل احترافي إلى الموديلات (Models)، الخدمات (Services)، والواجهات (Views).

## المتطلبات الهندسية لتطبيق "شفاء بلس" (ShifaaPlus Flutter App):
1. **إعداد الاتجاه واللغة (RTL & Theme)**:
   - ضبط \`Directionality(textDirection: TextDirection.rtl)\` في جذر التطبيق.
   - استخدام \`EdgeInsetsDirectional\` و \`AlignmentDirectional\` في كافة الشاشات.
   - تفعيل Material 3 مع ألوان طبية مريحة وتباين متوافق مع WCAG AA.
2. **طبقة الموديلات (\`lib/models/\`)**:
   - \`DoctorModel\`, \`AppointmentModel\`, \`PrescriptionItemModel\` مع \`required\` لجميع الحقول الأساسية، \`fromJson\`, \`toJson\`, و \`copyWith\`.
3. **طبقة الخدمات (\`lib/services/\`)**:
   - \`AppointmentBookingService\`: تشمل التحقق من عدم تعارض المواعيد، إضافة الحجز، جلب مواعيد المريض، وإصدار الوصفة الطبية.
4. **طبقة الواجهات (\`lib/views/\`)**:
   - \`PatientHomeScreen\`: بحث فوري عن الأطباء + بطاقة الموعد القادم + شريط تنبيهات الأدوية.
   - \`PatientBookingScreen\`: اختيار الفترة الزمنية ونوع الاستشارة مع معالجة حالات التحميل والخطأ والنجاح.
   - \`DoctorPrescriptionScreen\`: لوحة الطبيب لإضافة الأدوية والجرعات واعتماد الوصفة.

قدم الكود الكامل القابل للتشغيل فوراً بدون أي \`TODO\` أو أجزاء ناقصة.`,

    cursorRulesAndSystemSpec: `# Rules for AI Coding Assistant (.cursorrules / System Instructions)

## 1. Architecture & Code Organization
- Enforce strict separation of concerns across three layers:
  - \`models/\`: Pure immutable data classes/interfaces with strict Null Safety and serialization helpers.
  - \`services/\`: Business logic, validation, conflict resolution, and state persistence.
  - \`views/\`: UI components with complete state handling (Loading, Empty, Error, Populated).

## 2. RTL & Arabic Typography Discipline
- Document root must set \`dir="rtl"\` and \`lang="ar"\`.
- Use logical directional properties (\`ms-\`, \`me-\`, \`ps-\`, \`pe-\`, \`text-start\`, \`EdgeInsetsDirectional\`) instead of hardcoded physical left/right properties.
- All numeric metrics, timestamps, and prices must apply \`tabular-nums\`.

## 3. Zero-Defect & Anti-Stub Policy
- Every button, filter tab, form input, and modal trigger must be wired to a real working handler.
- Validate all user inputs before state mutation (prevent empty submissions, past appointment dates, or duplicate slot bookings).`,

    uiOnlyPrompt: `# برومبت تصميم وبرمجة واجهات المستخدم (UI/UX Screens Specification)
صمم وبرمج شاشات واجهة المستخدم التفاعلية لتطبيق "شفاء بلس" باللغة العربية (RTL) وفق المواصفات البصرية التالية:

1. **الشاشة الأولى: الرئيسية واكتشاف الأطباء**
   - شريط علوي نظيف يحتوي على اسم المنصة، روابط التنقل بين (الرئيسية، مواعيدي، وصفاتي، لوحة الطبيب)، وزر حجز سريع.
   - قسم البحث والفلترة: حقل بحث نصي + أزرار تصفية التخصصات الطبية بحالة نشطة واضحة.
   - بطاقة الموعد القادم: تعرض اسم الطبيب، التخصص، الوقت المتبقي، وزر الانضمام للاستشارة المرئية.
   - شبكة بطاقات الأطباء: تعرض لكل طبيب التقييم، رسوم الكشف، قائمة الأوقات المتاحة اليوم، وزر "احجز الآن".

2. **الشاشة الثانية: نافذة/شاشة اختيار الفترة الزمنية وتأكيد الحجز**
   - مفتاح تبديل بين (زيارة العيادة / استشارة مرئية).
   - منتقي الأيام والفترات الزمنية (Time Slots Grid) مع تمييز الفترة المختارة وتعطيل الفترات المحجوزة.
   - ملخص الحجز وزر التأكيد الفوري مع رسالة تأكيد واضحة.

3. **الشاشة الثالثة: لوحة الطبيب وإصدار الوصفة الإلكترونية**
   - جدول مواعيد اليوم مع حالة كل مريض.
   - نموذج ديناميكي لإضافة أدوية متعددة وتحديد الجرعة ومدة العلاج وإرسالها للملف الصحي للمريض.`,
  },
};
