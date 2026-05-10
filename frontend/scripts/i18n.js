// Lightweight i18n for static HTML pages (no build step).
// Usage in HTML:
//  - data-i18n="key"             -> element.textContent
//  - data-i18n-placeholder="key" -> element.placeholder
//  - data-i18n-title="key"       -> element.title
//  - data-i18n-aria-label="key"  -> element.ariaLabel
//
// Optional runtime usage:
//  - window.HDIMS_I18N.t("key")
//  - window.HDIMS_I18N.setLanguage("hi")

const STORAGE_KEY = "hdims_lang";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ur", label: "اردو (Urdu)" },
  // a few more common Indian languages
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
];

// Keep translations focused on the strings present in the 3 patient pages.
// Missing keys fall back to English.
const STRINGS = {
  en: {
    app_title: "HDIMS - Patient Portal",
    search_records_placeholder: "Search records...",
    nav_dashboard: "Dashboard",
    nav_medical_records: "Medical Records",
    nav_medications: "Medications",
    emergency_contact: "Emergency Contact",
    call_ambulance: "Call Ambulance",
    change_password: "Change Password",
    sign_out: "Sign Out",
    patient_portal_dashboard: "Patient Portal Dashboard",
    patient_portal: "Patient Portal",
    last_updated: "Last updated:",
    ai_patient_overview: "AI Patient Overview",
    ai_powered_by: "Powered by Groq AI · Auto-generated from your medical records",
    regenerate: "Regenerate",
    analyzing_records: "Analyzing your medical records with AI…",
    daily_medications: "Daily Medications",
    pending: "PENDING",
    loading_medications_ellipsis: "Loading medications…",
    home: "Home",
    records: "Records",
    meds: "Meds",
    medical_records_title: "Medical Records",
    medical_records_subtitle:
      "Access your full medical history, including secure document storage for clinical reports, prescriptions, and digital imaging.",
    no_reports_found: "No reports found",
    no_reports_hint: "Your medical reports will appear here once uploaded by your care team.",
    failed_to_load_reports: "Failed to load reports",
    my_prescriptions_title: "My Prescriptions",
    prescriptions_subtitle: "View and manage your active medication schedule and refill history.",
    active_meds: "Active Meds",
    active_medications: "Active Medications",
    table_medication: "Medication",
    table_schedule: "Schedule",
    table_progress: "Progress",
    table_status: "Status",
    table_log_intake: "Log Intake",
    loading_medications_dots: "Loading medications...",
    no_active_medications: "No active medications on record.",
    error_loading_medications: "Error loading medications. Please try again later.",
    as_prescribed: "As prescribed",
    active: "Active",
    language_label: "Language",
    eligible_policies: "Eligible Policies",
    eligible_policies_subtitle: "Health insurance plans you may qualify for based on your profile",
    policy_tier_basic: "Basic",
    policy_tier_comprehensive: "Comprehensive",
    policy_tier_family: "Family",
    policy_essential_health: "Essential Health Cover",
    policy_essential_health_desc: "Covers OPD, IPD, and emergency services up to ₹3L per annum.",
    policy_senior_care: "Senior Care Plus",
    policy_senior_care_desc: "Full-spectrum coverage including cardiac, diabetic, and critical illness up to ₹10L.",
    policy_family_floater: "Family Floater Shield",
    policy_family_floater_desc: "Shared ₹15L sum insured for up to 4 family members including maternity.",
    est_premium: "Est. Premium",
    per_year: "/ yr",
  },
  hi: {
    app_title: "HDIMS - रोगी पोर्टल",
    search_records_placeholder: "रिकॉर्ड खोजें...",
    nav_dashboard: "डैशबोर्ड",
    nav_medical_records: "चिकित्सा रिकॉर्ड",
    nav_medications: "दवाइयाँ",
    emergency_contact: "आपातकालीन संपर्क",
    call_ambulance: "एंबुलेंस बुलाएँ",
    change_password: "पासवर्ड बदलें",
    sign_out: "साइन आउट",
    patient_portal_dashboard: "रोगी पोर्टल डैशबोर्ड",
    patient_portal: "रोगी पोर्टल",
    last_updated: "अंतिम अपडेट:",
    ai_patient_overview: "AI रोगी सारांश",
    ai_powered_by: "Groq AI द्वारा संचालित · आपके मेडिकल रिकॉर्ड से स्वतः तैयार",
    regenerate: "दोबारा बनाएं",
    analyzing_records: "AI आपके मेडिकल रिकॉर्ड का विश्लेषण कर रहा है…",
    daily_medications: "आज की दवाइयाँ",
    pending: "लंबित",
    loading_medications_ellipsis: "दवाइयाँ लोड हो रही हैं…",
    home: "होम",
    records: "रिकॉर्ड",
    meds: "दवाइयाँ",
    medical_records_title: "चिकित्सा रिकॉर्ड",
    medical_records_subtitle:
      "अपना पूरा चिकित्सा इतिहास देखें—क्लिनिकल रिपोर्ट, प्रिस्क्रिप्शन और इमेजिंग के लिए सुरक्षित दस्तावेज़ स्टोरेज सहित।",
    no_reports_found: "कोई रिपोर्ट नहीं मिली",
    no_reports_hint: "आपकी रिपोर्ट्स आपकी केयर टीम द्वारा अपलोड होने के बाद यहाँ दिखेंगी।",
    failed_to_load_reports: "रिपोर्ट लोड नहीं हो सकीं",
    my_prescriptions_title: "मेरे प्रिस्क्रिप्शन",
    prescriptions_subtitle: "अपनी सक्रिय दवा शेड्यूल और रिफिल इतिहास देखें और प्रबंधित करें।",
    active_meds: "सक्रिय दवाइयाँ",
    active_medications: "सक्रिय दवाइयाँ",
    table_medication: "दवा",
    table_schedule: "शेड्यूल",
    table_progress: "प्रगति",
    table_status: "स्थिति",
    table_log_intake: "सेवन लॉग",
    loading_medications_dots: "दवाइयाँ लोड हो रही हैं...",
    no_active_medications: "कोई सक्रिय दवा रिकॉर्ड में नहीं है।",
    error_loading_medications: "दवाइयाँ लोड करने में त्रुटि। कृपया बाद में प्रयास करें।",
    as_prescribed: "जैसा निर्देशित",
    active: "सक्रिय",
    language_label: "भाषा",
    eligible_policies: "पात्र पॉलिसियाँ",
    eligible_policies_subtitle: "आपकी प्रोफ़ाइल के आधार पर आप जिन स्वास्थ्य बीमा योजनाओं के लिए पात्र हो सकते हैं",
    policy_tier_basic: "बेसिक",
    policy_tier_comprehensive: "व्यापक",
    policy_tier_family: "पारिवारिक",
    policy_essential_health: "आवश्यक स्वास्थ्य कवर",
    policy_essential_health_desc: "OPD, IPD और आपातकालीन सेवाओं को प्रति वर्ष ₹3L तक कवर करता है।",
    policy_senior_care: "सीनियर केयर प्लस",
    policy_senior_care_desc: "हृदय, मधुमेह और गंभीर बीमारी सहित ₹10L तक पूर्ण कवरेज।",
    policy_family_floater: "फैमिली फ्लोटर शील्ड",
    policy_family_floater_desc: "मातृत्व सहित 4 परिवार के सदस्यों के लिए ₹15L तक साझा बीमा।",
    est_premium: "अनुमानित प्रीमियम",
    per_year: "/ वर्ष",
  },
  kn: {
    app_title: "HDIMS - ರೋಗಿ ಪೋರ್ಟಲ್",
    search_records_placeholder: "ರೆಕಾರ್ಡ್‌ಗಳನ್ನು ಹುಡುಕಿ...",
    nav_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nav_medical_records: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು",
    nav_medications: "ಔಷಧಿಗಳು",
    emergency_contact: "ತುರ್ತು ಸಂಪರ್ಕ",
    call_ambulance: "ಆಂಬುಲೆನ್ಸ್ ಕರೆಮಾಡಿ",
    change_password: "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ",
    sign_out: "ಸೈನ್ ಔಟ್",
    patient_portal_dashboard: "ರೋಗಿ ಪೋರ್ಟಲ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    patient_portal: "ರೋಗಿ ಪೋರ್ಟಲ್",
    last_updated: "ಕೊನೆಯ ಅಪ್‌ಡೇಟ್:",
    ai_patient_overview: "AI ರೋಗಿ ಅವಲೋಕನ",
    ai_powered_by: "Groq AI ಬೆಂಬಲಿತ · ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳಿಂದ ಸ್ವಯಂ ರಚಿಸಲಾಗಿದೆ",
    regenerate: "ಮತ್ತೆ ರಚಿಸಿ",
    analyzing_records: "AI ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ…",
    daily_medications: "ದೈನಂದಿನ ಔಷಧಿಗಳು",
    pending: "ಬಾಕಿ",
    loading_medications_ellipsis: "ಔಷಧಿಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ…",
    home: "ಮುಖಪುಟ",
    records: "ದಾಖಲೆಗಳು",
    meds: "ಔಷಧಿಗಳು",
    medical_records_title: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು",
    medical_records_subtitle:
      "ನಿಮ್ಮ ಸಂಪೂರ್ಣ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸವನ್ನು ಪ್ರವೇಶಿಸಿ—ಕ್ಲಿನಿಕಲ್ ವರದಿ, ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ಇಮೇಜಿಂಗ್‌ಗಾಗಿ ಸುರಕ್ಷಿತ ಡಾಕ್ಯುಮೆಂಟ್ ಸಂಗ್ರಹಣೆ ಸಹಿತ.",
    no_reports_found: "ಯಾವುದೇ ವರದಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    no_reports_hint: "ನಿಮ್ಮ ಕೇರ್ ತಂಡ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ನಂತರ ವರದಿಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    failed_to_load_reports: "ವರದಿಗಳು ಲೋಡ್ ಆಗಲಿಲ್ಲ",
    my_prescriptions_title: "ನನ್ನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು",
    prescriptions_subtitle: "ನಿಮ್ಮ ಸಕ್ರಿಯ ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ರಿಫಿಲ್ ಇತಿಹಾಸವನ್ನು ನೋಡಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ.",
    active_meds: "ಸಕ್ರಿಯ ಔಷಧಿಗಳು",
    active_medications: "ಸಕ್ರಿಯ ಔಷಧಿಗಳು",
    table_medication: "ಔಷಧಿ",
    table_schedule: "ವೇಳಾಪಟ್ಟಿ",
    table_progress: "ಪ್ರಗತಿ",
    table_status: "ಸ್ಥಿತಿ",
    table_log_intake: "ಸೇವನ ದಾಖಲು",
    loading_medications_dots: "ಔಷಧಿಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...",
    no_active_medications: "ದಾಖಲಿನಲ್ಲಿ ಸಕ್ರಿಯ ಔಷಧಿಗಳು ಇಲ್ಲ.",
    error_loading_medications: "ಔಷಧಿಗಳನ್ನು ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ. ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    as_prescribed: "ನಿರ್ದೇಶಿಸಿದಂತೆ",
    active: "ಸಕ್ರಿಯ",
    language_label: "ಭಾಷೆ",
    eligible_policies: "ಅರ್ಹ ಪಾಲಿಸಿಗಳು",
    eligible_policies_subtitle: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಆಧಾರಿತ ನೀವು ಅರ್ಹರಾಗಬಹುದಾದ ಆರೋಗ್ಯ ವಿಮಾ ಯೋಜನೆಗಳು",
    policy_tier_basic: "ಮೂಲ",
    policy_tier_comprehensive: "ಸಮಗ್ರ",
    policy_tier_family: "ಕುಟುಂಬ",
    policy_essential_health: "ಅಗತ್ಯ ಆರೋಗ್ಯ ಕವರ್",
    policy_essential_health_desc: "OPD, IPD ಮತ್ತು ತುರ್ತು ಸೇವೆಗಳನ್ನು ವಾರ್ಷಿಕ ₹3L ವರೆಗೆ ಒಳಗೊಂಡಿದೆ.",
    policy_senior_care: "ಹಿರಿಯ ಆರೈಕೆ ಪ್ಲಸ್",
    policy_senior_care_desc: "ಹೃದಯ, ಮಧುಮೇಹ ಮತ್ತು ಗಂಭೀರ ಕಾಯಿಲೆ ಸೇರಿದಂತೆ ₹10L ವರೆಗೆ ಸಂಪೂರ್ಣ ಕವರೇಜ್.",
    policy_family_floater: "ಕುಟುಂಬ ಫ್ಲೋಟರ್ ಶೀಲ್ಡ್",
    policy_family_floater_desc: "ಹೆರಿಗೆ ಸೇರಿದಂತೆ 4 ಕುಟುಂಬ ಸದಸ್ಯರಿಗೆ ₹15L ವರೆಗೆ ಹಂಚಿಕೊಂಡ ವಿಮೆ.",
    est_premium: "ಅಂದಾಜು ಪ್ರೀಮಿಯಂ",
    per_year: "/ ವರ್ಷ",
  },
  te: {
    app_title: "HDIMS - పేషెంట్ పోర్టల్",
    search_records_placeholder: "రికార్డ్స్ వెతకండి...",
    nav_dashboard: "డాష్‌బోర్డ్",
    nav_medical_records: "మెడికల్ రికార్డ్స్",
    nav_medications: "మందులు",
    emergency_contact: "ఎమర్జెన్సీ సంప్రదింపు",
    call_ambulance: "అంబులెన్స్‌కు కాల్ చేయండి",
    change_password: "పాస్‌వర్డ్ మార్చండి",
    sign_out: "సైన్ అవుట్",
    patient_portal_dashboard: "పేషెంట్ పోర్టల్ డాష్‌బోర్డ్",
    patient_portal: "పేషెంట్ పోర్టల్",
    last_updated: "చివరి నవీకరణ:",
    ai_patient_overview: "AI పేషెంట్ ఓవerview",
    ai_powered_by: "Groq AI ఆధారితం · మీ మెడికల్ రికార్డ్స్ నుంచి స్వయంచాలకంగా రూపొందింది",
    regenerate: "మళ్లీ రూపొందించండి",
    analyzing_records: "AI మీ మెడికల్ రికార్డ్స్‌ను విశ్లేషిస్తోంది…",
    daily_medications: "రోజువారి మందులు",
    pending: "పెండింగ్",
    loading_medications_ellipsis: "మందులు లోడ్ అవుతున్నాయి…",
    home: "హోమ్",
    records: "రికార్డ్స్",
    meds: "మందులు",
    medical_records_title: "మెడికల్ రికార్డ్స్",
    medical_records_subtitle:
      "క్లినికల్ రిపోర్టులు, ప్రిస్క్రిప్షన్లు, డిజిటల్ ఇమేజింగ్ కోసం సురక్షిత డాక్యుమెంట్ స్టోరేజ్‌తో మీ పూర్తి వైద్య చరిత్రను చూడండి.",
    no_reports_found: "ఏ రిపోర్టులు లభించలేదు",
    no_reports_hint: "మీ కేర్ టీమ్ అప్లోడ్ చేసిన తర్వాత రిపోర్టులు ఇక్కడ కనిపిస్తాయి.",
    failed_to_load_reports: "రిపోర్టులు లోడ్ కాలేదు",
    my_prescriptions_title: "నా ప్రిస్క్రిప్షన్లు",
    prescriptions_subtitle: "మీ యాక్టివ్ మందుల షెడ్యూల్ మరియు రీఫిల్ హిస్టరీని చూడండి, నిర్వహించండి.",
    active_meds: "యాక్టివ్ మందులు",
    active_medications: "యాక్టివ్ మందులు",
    table_medication: "మందు",
    table_schedule: "షెడ్యూల్",
    table_progress: "ప్రోగ్రెస్",
    table_status: "స్థితి",
    table_log_intake: "ఇంటేక్ లాగ్",
    loading_medications_dots: "మందులు లోడ్ అవుతున్నాయి...",
    no_active_medications: "రికార్డులో యాక్టివ్ మందులు లేవు.",
    error_loading_medications: "మందులు లోడ్ చేయడంలో లోపం. దయచేసి తరువాత ప్రయత్నించండి.",
    as_prescribed: "డాక్టర్ సూచించినట్లు",
    active: "యాక్టివ్",
    language_label: "భాష",
    eligible_policies: "అర్హత ఉన్న పాలసీలు",
    eligible_policies_subtitle: "మీ ప్రొఫైల్ ఆధారంగా మీరు అర్హత పొందగల ఆరోగ్య బీమా ప్రణాళికలు",
    policy_tier_basic: "బేసిక్",
    policy_tier_comprehensive: "సమగ్ర",
    policy_tier_family: "కుటుంబ",
    policy_essential_health: "అవసర ఆరోగ్య కవర్",
    policy_essential_health_desc: "OPD, IPD మరియు అత్యవసర సేవలను సంవత్సరానికి ₹3L వరకు కవర్ చేస్తుంది.",
    policy_senior_care: "సీనియర్ కేర్ ప్లస్",
    policy_senior_care_desc: "హృదయ, మధుమేహం మరియు తీవ్ర అనారోగ్యం సహా ₹10L వరకు పూర్తి కవరేజ్.",
    policy_family_floater: "ఫ్యామిలీ ఫ్లోటర్ షీల్డ్",
    policy_family_floater_desc: "ప్రసూతితో సహా 4 కుటుంబ సభ్యులకు ₹15L వరకు భాగస్వామ్య బీమా.",
    est_premium: "అంచనా ప్రీమియం",
    per_year: "/ సం.",
  },
  ta: {
    app_title: "HDIMS - நோயாளர் போர்டல்",
    search_records_placeholder: "பதிவுகளைத் தேடுங்கள்...",
    nav_dashboard: "டாஷ்போர்டு",
    nav_medical_records: "மருத்துவ பதிவுகள்",
    nav_medications: "மருந்துகள்",
    emergency_contact: "அவசர தொடர்பு",
    call_ambulance: "ஆம்புலன்ஸை அழைக்கவும்",
    change_password: "கடவுச்சொல்லை மாற்றவும்",
    sign_out: "வெளியேறு",
    patient_portal_dashboard: "நோயாளர் போர்டல் டாஷ்போர்டு",
    patient_portal: "நோயாளர் போர்டல்",
    last_updated: "கடைசி புதுப்பிப்பு:",
    ai_patient_overview: "AI நோயாளர் சுருக்கம்",
    ai_powered_by: "Groq AI மூலம் இயக்கப்படுகிறது · உங்கள் மருத்துவ பதிவுகளிலிருந்து தானாக உருவாக்கப்பட்டது",
    regenerate: "மீண்டும் உருவாக்கு",
    analyzing_records: "AI உங்கள் மருத்துவ பதிவுகளை பகுப்பாய்வு செய்கிறது…",
    daily_medications: "தினசரி மருந்துகள்",
    pending: "நிலுவையில்",
    loading_medications_ellipsis: "மருந்துகள் ஏற்றப்படுகிறது…",
    home: "முகப்பு",
    records: "பதிவுகள்",
    meds: "மருந்துகள்",
    medical_records_title: "மருத்துவ பதிவுகள்",
    medical_records_subtitle:
      "கிளினிக்கல் அறிக்கைகள், மருந்துக் குறிப்புகள், டிஜிட்டல் இமேஜிங் உள்ளிட்டவற்றிற்கான பாதுகாப்பான சேமிப்புடன் உங்கள் முழு மருத்துவ வரலாற்றை அணுகுங்கள்.",
    no_reports_found: "அறிக்கைகள் இல்லை",
    no_reports_hint: "உங்கள் பராமரிப்பு குழு பதிவேற்றியதும் அறிக்கைகள் இங்கே தோன்றும்.",
    failed_to_load_reports: "அறிக்கைகள் ஏற்ற முடியவில்லை",
    my_prescriptions_title: "என் மருந்துக் குறிப்புகள்",
    prescriptions_subtitle: "செயலில் உள்ள மருந்து அட்டவணை மற்றும் ரீஃபில் வரலாற்றை பார்க்கவும் நிர்வகிக்கவும்.",
    active_meds: "செயலில் உள்ள மருந்துகள்",
    active_medications: "செயலில் உள்ள மருந்துகள்",
    table_medication: "மருந்து",
    table_schedule: "அட்டவணை",
    table_progress: "முன்னேற்றம்",
    table_status: "நிலை",
    table_log_intake: "உட்கொள்ளல் பதிவு",
    loading_medications_dots: "மருந்துகள் ஏற்றப்படுகிறது...",
    no_active_medications: "செயலில் உள்ள மருந்துகள் பதிவு செய்யப்படவில்லை.",
    error_loading_medications: "மருந்துகளை ஏற்றுவதில் பிழை. பிறகு முயற்சிக்கவும்.",
    as_prescribed: "மருத்துவர் கூறியபடி",
    active: "செயலில்",
    language_label: "மொழி",
    eligible_policies: "தகுதியான பாலிசிகள்",
    eligible_policies_subtitle: "உங்கள் சுயவிவரத்தின் அடிப்படையில் நீங்கள் தகுதி பெறக்கூடிய சுகாதார காப்பீட்டுத் திட்டங்கள்",
    policy_tier_basic: "அடிப்படை",
    policy_tier_comprehensive: "விரிவான",
    policy_tier_family: "குடும்பம்",
    policy_essential_health: "அத்தியாவசிய சுகாதார காப்பு",
    policy_essential_health_desc: "OPD, IPD மற்றும் அவசர சேவைகளை ஆண்டுக்கு ₹3L வரை காப்பீடு.",
    policy_senior_care: "மூத்தோர் பராமரிப்பு பிளஸ்",
    policy_senior_care_desc: "இதய, நீரிழிவு மற்றும் தீவிர நோய் உள்ளிட்ட ₹10L வரை முழு காப்பீடு.",
    policy_family_floater: "குடும்ப ஃப்ளோட்டர் ஷீல்ட்",
    policy_family_floater_desc: "மகப்பேறு உட்பட 4 குடும்ப உறுப்பினர்களுக்கு ₹15L வரை பகிர்ந்த காப்பீடு.",
    est_premium: "மதிப்பிடப்பட்ட பிரீமியம்",
    per_year: "/ ஆண்டு",
  },
  ml: {
    app_title: "HDIMS - പേഷ്യന്റ് പോർട്ടൽ",
    search_records_placeholder: "റെക്കോർഡുകൾ തിരയുക...",
    nav_dashboard: "ഡാഷ്ബോർഡ്",
    nav_medical_records: "മെഡിക്കൽ റെക്കോർഡുകൾ",
    nav_medications: "മരുന്നുകൾ",
    emergency_contact: "അടിയന്തര ബന്ധം",
    call_ambulance: "ആംബുലൻസ് വിളിക്കുക",
    change_password: "പാസ്‌വേഡ് മാറ്റുക",
    sign_out: "സൈൻ ഔട്ട്",
    patient_portal_dashboard: "പേഷ്യന്റ് പോർട്ടൽ ഡാഷ്ബോർഡ്",
    patient_portal: "പേഷ്യന്റ് പോർട്ടൽ",
    last_updated: "അവസാനം അപ്ഡേറ്റ് ചെയ്തത്:",
    ai_patient_overview: "AI പേഷ്യന്റ് അവലോകനം",
    ai_powered_by: "Groq AI പിന്തുണയോടെ · നിങ്ങളുടെ മെഡിക്കൽ റെക്കോർഡുകളിൽ നിന്ന് സ്വയമേവ സൃഷ്ടിച്ചത്",
    regenerate: "വീണ്ടും സൃഷ്ടിക്കുക",
    analyzing_records: "AI നിങ്ങളുടെ മെഡിക്കൽ റെക്കോർഡുകൾ വിശകലനം ചെയ്യുന്നു…",
    daily_medications: "ദൈനംദിന മരുന്നുകൾ",
    pending: "പെൻഡിംഗ്",
    loading_medications_ellipsis: "മരുന്നുകൾ ലോഡാകുന്നു…",
    home: "ഹോം",
    records: "റെക്കോർഡുകൾ",
    meds: "മരുന്നുകൾ",
    medical_records_title: "മെഡിക്കൽ റെക്കോർഡുകൾ",
    medical_records_subtitle:
      "ക്ലിനിക്കൽ റിപ്പോർട്ടുകൾ, പ്രിസ്‌ക്രിപ്ഷനുകൾ, ഡിജിറ്റൽ ഇമേജിംഗ് എന്നിവയ്ക്കുള്ള സുരക്ഷിത സ്റ്റോറേജോടെ നിങ്ങളുടെ പൂർണ്ണ മെഡിക്കൽ ചരിത്രം ആക്‌സസ് ചെയ്യുക.",
    no_reports_found: "റിപ്പോർട്ടുകൾ ഒന്നും കണ്ടെത്തിയില്ല",
    no_reports_hint: "നിങ്ങളുടെ കെയർ ടീം അപ്‌ലോഡ് ചെയ്താൽ റിപ്പോർട്ടുകൾ ഇവിടെ കാണും.",
    failed_to_load_reports: "റിപ്പോർട്ടുകൾ ലോഡ് ചെയ്യാനായില്ല",
    my_prescriptions_title: "എന്റെ പ്രിസ്‌ക്രിപ്ഷനുകൾ",
    prescriptions_subtitle: "സജീവമായ മരുന്ന് ഷെഡ്യൂളും റിഫിൽ ചരിത്രവും കാണാനും നിയന്ത്രിക്കാനും.",
    active_meds: "സജീവ മരുന്നുകൾ",
    active_medications: "സജീവ മരുന്നുകൾ",
    table_medication: "മരുന്ന്",
    table_schedule: "ഷെഡ്യൂൾ",
    table_progress: "പുരോഗതി",
    table_status: "സ്ഥിതി",
    table_log_intake: "ഇൻടേക്ക് ലോഗ്",
    loading_medications_dots: "മരുന്നുകൾ ലോഡാകുന്നു...",
    no_active_medications: "രേഖയിൽ സജീവമായ മരുന്നുകൾ ഇല്ല.",
    error_loading_medications: "മരുന്നുകൾ ലോഡ് ചെയ്യുമ്പോൾ പിശക്. പിന്നീട് ശ്രമിക്കുക.",
    as_prescribed: "നിർദ്ദേശിച്ചതുപോലെ",
    active: "സജീവം",
    language_label: "ഭാഷ",
    eligible_policies: "യോഗ്യമായ പോളിസികൾ",
    eligible_policies_subtitle: "നിങ്ങളുടെ പ്രൊഫൈൽ അടിസ്ഥാനമാക്കി നിങ്ങൾക്ക് യോഗ്യത ലഭിക്കാവുന്ന ആരോഗ്യ ഇൻഷുറൻസ് പ്ലാനുകൾ",
    policy_tier_basic: "അടിസ്ഥാന",
    policy_tier_comprehensive: "സമഗ്ര",
    policy_tier_family: "കുടുംബ",
    policy_essential_health: "അവശ്യ ആരോഗ്യ കവർ",
    policy_essential_health_desc: "OPD, IPD, അടിയന്തര സേവനങ്ങൾ പ്രതിവർഷം ₹3L വരെ കവർ ചെയ്യുന്നു.",
    policy_senior_care: "സീനിയർ കെയർ പ്ലസ്",
    policy_senior_care_desc: "ഹൃദയ, പ്രമേഹ, ഗുരുതര രോഗങ്ങൾ ഉൾപ്പെടെ ₹10L വരെ പൂർണ്ണ കവറേജ്.",
    policy_family_floater: "ഫാമിലി ഫ്ലോട്ടർ ഷീൽഡ്",
    policy_family_floater_desc: "പ്രസവം ഉൾപ്പെടെ 4 കുടുംബാംഗങ്ങൾക്ക് ₹15L വരെ പങ്കിട്ട ഇൻഷുറൻസ്.",
    est_premium: "കണക്കാക്കിയ പ്രീമിയം",
    per_year: "/ വർഷം",
  },
  mr: {
    app_title: "HDIMS - रुग्ण पोर्टल",
    search_records_placeholder: "नोंदी शोधा...",
    nav_dashboard: "डॅशबोर्ड",
    nav_medical_records: "वैद्यकीय नोंदी",
    nav_medications: "औषधे",
    emergency_contact: "आपत्कालीन संपर्क",
    call_ambulance: "रुग्णवाहिका कॉल करा",
    change_password: "पासवर्ड बदला",
    sign_out: "साइन आउट",
    patient_portal_dashboard: "रुग्ण पोर्टल डॅशबोर्ड",
    patient_portal: "रुग्ण पोर्टल",
    last_updated: "शेवटचे अपडेट:",
    ai_patient_overview: "AI रुग्ण आढावा",
    ai_powered_by: "Groq AI द्वारे समर्थित · तुमच्या वैद्यकीय नोंदींवरून स्वयंचलित तयार",
    regenerate: "पुन्हा तयार करा",
    analyzing_records: "AI तुमच्या वैद्यकीय नोंदींचे विश्लेषण करत आहे…",
    daily_medications: "दैनंदिन औषधे",
    pending: "प्रलंबित",
    loading_medications_ellipsis: "औषधे लोड होत आहेत…",
    home: "होम",
    records: "नोंदी",
    meds: "औषधे",
    medical_records_title: "वैद्यकीय नोंदी",
    medical_records_subtitle:
      "क्लिनिकल रिपोर्ट, प्रिस्क्रिप्शन आणि डिजिटल इमेजिंगसाठी सुरक्षित दस्तऐवज साठवणुकीसह तुमचा संपूर्ण वैद्यकीय इतिहास पहा.",
    no_reports_found: "कोणतेही रिपोर्ट आढळले नाहीत",
    no_reports_hint: "तुमची केअर टीम अपलोड केल्यावर रिपोर्ट येथे दिसतील.",
    failed_to_load_reports: "रिपोर्ट लोड झाले नाहीत",
    my_prescriptions_title: "माझी प्रिस्क्रिप्शन्स",
    prescriptions_subtitle: "तुमचा सक्रिय औषध वेळापत्रक आणि रिफिल इतिहास पाहा व व्यवस्थापित करा.",
    active_meds: "सक्रिय औषधे",
    active_medications: "सक्रिय औषधे",
    table_medication: "औषध",
    table_schedule: "वेळापत्रक",
    table_progress: "प्रगती",
    table_status: "स्थिती",
    table_log_intake: "सेवन नोंद",
    loading_medications_dots: "औषधे लोड होत आहेत...",
    no_active_medications: "नोंदींमध्ये सक्रिय औषधे नाहीत.",
    error_loading_medications: "औषधे लोड करताना त्रुटी. कृपया नंतर प्रयत्न करा.",
    as_prescribed: "निर्देशानुसार",
    active: "सक्रिय",
    language_label: "भाषा",
    eligible_policies: "पात्र पॉलिसी",
    eligible_policies_subtitle: "तुमच्या प्रोफाइलवर आधारित तुम्ही पात्र होऊ शकता अशा आरोग्य विमा योजना",
    policy_tier_basic: "मूलभूत",
    policy_tier_comprehensive: "सर्वसमावेशक",
    policy_tier_family: "कौटुंबिक",
    policy_essential_health: "आवश्यक आरोग्य कवर",
    policy_essential_health_desc: "OPD, IPD आणि आपत्कालीन सेवा प्रतिवर्ष ₹3L पर्यंत कवर करते.",
    policy_senior_care: "सीनियर केअर प्लस",
    policy_senior_care_desc: "हृदय, मधुमेह आणि गंभीर आजारांसह ₹10L पर्यंत पूर्ण कवरेज.",
    policy_family_floater: "फॅमिली फ्लोटर शील्ड",
    policy_family_floater_desc: "प्रसूतीसह 4 कुटुंब सदस्यांसाठी ₹15L पर्यंत सामायिक विमा.",
    est_premium: "अंदाजे प्रीमियम",
    per_year: "/ वर्ष",
  },
  pa: {
    app_title: "HDIMS - ਮਰੀਜ਼ ਪੋਰਟਲ",
    search_records_placeholder: "ਰਿਕਾਰਡ ਖੋਜੋ...",
    nav_dashboard: "ਡੈਸ਼ਬੋਰਡ",
    nav_medical_records: "ਮੈਡੀਕਲ ਰਿਕਾਰਡ",
    nav_medications: "ਦਵਾਈਆਂ",
    emergency_contact: "ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ",
    call_ambulance: "ਐਂਬੂਲੈਂਸ ਨੂੰ ਕਾਲ ਕਰੋ",
    change_password: "ਪਾਸਵਰਡ ਬਦਲੋ",
    sign_out: "ਸਾਈਨ ਆਉਟ",
    patient_portal_dashboard: "ਮਰੀਜ਼ ਪੋਰਟਲ ਡੈਸ਼ਬੋਰਡ",
    patient_portal: "ਮਰੀਜ਼ ਪੋਰਟਲ",
    last_updated: "ਆਖਰੀ ਅੱਪਡੇਟ:",
    ai_patient_overview: "AI ਮਰੀਜ਼ ਓਵਰਵਿਊ",
    ai_powered_by: "Groq AI ਨਾਲ ਚੱਲਦਾ · ਤੁਹਾਡੇ ਮੈਡੀਕਲ ਰਿਕਾਰਡਾਂ ਤੋਂ ਆਪਣੇ ਆਪ ਬਣਿਆ",
    regenerate: "ਮੁੜ ਬਣਾਓ",
    analyzing_records: "AI ਤੁਹਾਡੇ ਮੈਡੀਕਲ ਰਿਕਾਰਡਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ…",
    daily_medications: "ਰੋਜ਼ਾਨਾ ਦਵਾਈਆਂ",
    pending: "ਬਕਾਇਆ",
    loading_medications_ellipsis: "ਦਵਾਈਆਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ…",
    home: "ਹੋਮ",
    records: "ਰਿਕਾਰਡ",
    meds: "ਦਵਾਈਆਂ",
    medical_records_title: "ਮੈਡੀਕਲ ਰਿਕਾਰਡ",
    medical_records_subtitle:
      "ਕਲੀਨਿਕਲ ਰਿਪੋਰਟਾਂ, ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਅਤੇ ਡਿਜ਼ਿਟਲ ਇਮੇਜਿੰਗ ਲਈ ਸੁਰੱਖਿਅਤ ਸਟੋਰੇਜ ਸਮੇਤ ਆਪਣਾ ਪੂਰਾ ਮੈਡੀਕਲ ਇਤਿਹਾਸ ਵੇਖੋ।",
    no_reports_found: "ਕੋਈ ਰਿਪੋਰਟ ਨਹੀਂ ਮਿਲੀ",
    no_reports_hint: "ਤੁਹਾਡੀ ਕੇਅਰ ਟੀਮ ਅੱਪਲੋਡ ਕਰਨ ਤੋਂ ਬਾਅਦ ਰਿਪੋਰਟਾਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ।",
    failed_to_load_reports: "ਰਿਪੋਰਟਾਂ ਲੋਡ ਨਹੀਂ ਹੋਈਆਂ",
    my_prescriptions_title: "ਮੇਰੀਆਂ ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨਜ਼",
    prescriptions_subtitle: "ਆਪਣਾ ਸਰਗਰਮ ਦਵਾਈ ਸ਼ਡਿਊਲ ਅਤੇ ਰੀਫ਼ਿਲ ਇਤਿਹਾਸ ਵੇਖੋ ਤੇ ਸੰਭਾਲੋ।",
    active_meds: "ਸਰਗਰਮ ਦਵਾਈਆਂ",
    active_medications: "ਸਰਗਰਮ ਦਵਾਈਆਂ",
    table_medication: "ਦਵਾਈ",
    table_schedule: "ਸ਼ਡਿਊਲ",
    table_progress: "ਪ੍ਰਗਤੀ",
    table_status: "ਹਾਲਤ",
    table_log_intake: "ਸੇਵਨ ਲੌਗ",
    loading_medications_dots: "ਦਵਾਈਆਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
    no_active_medications: "ਰਿਕਾਰਡ ਵਿੱਚ ਕੋਈ ਸਰਗਰਮ ਦਵਾਈ ਨਹੀਂ ਹੈ।",
    error_loading_medications: "ਦਵਾਈਆਂ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    as_prescribed: "ਨੁਸਖੇ ਮੁਤਾਬਕ",
    active: "ਸਰਗਰਮ",
    language_label: "ਭਾਸ਼ਾ",
    eligible_policies: "ਯੋਗ ਪਾਲਿਸੀਆਂ",
    eligible_policies_subtitle: "ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਦੇ ਆਧਾਰ ਤੇ ਤੁਸੀਂ ਜਿਨ੍ਹਾਂ ਸਿਹਤ ਬੀਮਾ ਯੋਜਨਾਵਾਂ ਲਈ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ",
    policy_tier_basic: "ਮੁੱਢਲਾ",
    policy_tier_comprehensive: "ਵਿਆਪਕ",
    policy_tier_family: "ਪਰਿਵਾਰਕ",
    policy_essential_health: "ਜ਼ਰੂਰੀ ਸਿਹਤ ਕਵਰ",
    policy_essential_health_desc: "OPD, IPD ਅਤੇ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨੂੰ ਸਾਲਾਨਾ ₹3L ਤੱਕ ਕਵਰ ਕਰਦਾ ਹੈ।",
    policy_senior_care: "ਸੀਨੀਅਰ ਕੇਅਰ ਪਲੱਸ",
    policy_senior_care_desc: "ਦਿਲ, ਸ਼ੂਗਰ ਅਤੇ ਗੰਭੀਰ ਬਿਮਾਰੀ ਸਮੇਤ ₹10L ਤੱਕ ਪੂਰਾ ਕਵਰੇਜ।",
    policy_family_floater: "ਫੈਮਿਲੀ ਫਲੋਟਰ ਸ਼ੀਲਡ",
    policy_family_floater_desc: "ਜਣੇਪੇ ਸਮੇਤ 4 ਪਰਿਵਾਰਕ ਮੈਂਬਰਾਂ ਲਈ ₹15L ਤੱਕ ਸਾਂਝਾ ਬੀਮਾ।",
    est_premium: "ਅੰਦਾਜ਼ਨ ਪ੍ਰੀਮੀਅਮ",
    per_year: "/ ਸਾਲ",
  },
  ur: {
    app_title: "HDIMS - مریض پورٹل",
    search_records_placeholder: "ریکارڈ تلاش کریں...",
    nav_dashboard: "ڈیش بورڈ",
    nav_medical_records: "طبی ریکارڈ",
    nav_medications: "ادویات",
    emergency_contact: "ہنگامی رابطہ",
    call_ambulance: "ایمبولینس بلائیں",
    change_password: "پاس ورڈ تبدیل کریں",
    sign_out: "سائن آؤٹ",
    patient_portal_dashboard: "مریض پورٹل ڈیش بورڈ",
    patient_portal: "مریض پورٹل",
    last_updated: "آخری اپڈیٹ:",
    ai_patient_overview: "AI مریض خلاصہ",
    ai_powered_by: "Groq AI کے ذریعے · آپ کے طبی ریکارڈ سے خودکار طور پر تیار",
    regenerate: "دوبارہ بنائیں",
    analyzing_records: "AI آپ کے طبی ریکارڈ کا تجزیہ کر رہا ہے…",
    daily_medications: "روزانہ ادویات",
    pending: "زیر التواء",
    loading_medications_ellipsis: "ادویات لوڈ ہو رہی ہیں…",
    home: "ہوم",
    records: "ریکارڈ",
    meds: "ادویات",
    medical_records_title: "طبی ریکارڈ",
    medical_records_subtitle:
      "اپنی مکمل طبی تاریخ دیکھیں، جس میں کلینیکل رپورٹس، نسخے، اور ڈیجیٹل امیجنگ کے لیے محفوظ دستاویز اسٹوریج شامل ہے۔",
    no_reports_found: "کوئی رپورٹس نہیں ملیں",
    no_reports_hint: "آپ کی کیئر ٹیم اپلوڈ کرے گی تو رپورٹس یہاں نظر آئیں گی۔",
    failed_to_load_reports: "رپورٹس لوڈ نہیں ہو سکیں",
    my_prescriptions_title: "میرے نسخے",
    prescriptions_subtitle: "اپنے فعال ادویات کے شیڈول اور ریفل ہسٹری کو دیکھیں اور منظم کریں۔",
    active_meds: "فعال ادویات",
    active_medications: "فعال ادویات",
    table_medication: "دوائی",
    table_schedule: "شیڈول",
    table_progress: "پیش رفت",
    table_status: "حالت",
    table_log_intake: "استعمال لاگ",
    loading_medications_dots: "ادویات لوڈ ہو رہی ہیں...",
    no_active_medications: "ریکارڈ میں کوئی فعال ادویات نہیں ہیں۔",
    error_loading_medications: "ادویات لوڈ کرنے میں مسئلہ۔ بعد میں دوبارہ کوشش کریں۔",
    as_prescribed: "ہدایت کے مطابق",
    active: "فعال",
    language_label: "زبان",
    eligible_policies: "اہل پالیسیاں",
    eligible_policies_subtitle: "آپ کی پروفائل کی بنیاد پر صحت کے انشورنس پلان جن کے لیے آپ اہل ہو سکتے ہیں",
    policy_tier_basic: "بنیادی",
    policy_tier_comprehensive: "جامع",
    policy_tier_family: "خاندانی",
    policy_essential_health: "ضروری صحت کوریج",
    policy_essential_health_desc: "OPD، IPD اور ہنگامی خدمات سالانہ ₹3L تک کور کرتا ہے۔",
    policy_senior_care: "سینئر کیئر پلس",
    policy_senior_care_desc: "دل، ذیابیطس اور سنگین بیماریوں سمیت ₹10L تک مکمل کوریج۔",
    policy_family_floater: "فیملی فلوٹر شیلڈ",
    policy_family_floater_desc: "زچگی سمیت 4 خاندانی ممبران کے لیے ₹15L تک مشترکہ انشورنس۔",
    est_premium: "تخمینی پریمیم",
    per_year: "/ سال",
  },
};

function getDefaultLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && STRINGS[stored]) return stored;
  // Use browser language if it matches one of our languages
  const navLang = (navigator.language || "en").toLowerCase();
  const code = navLang.split("-")[0];
  if (STRINGS[code]) return code;
  return "en";
}

function normalizeLanguage(code) {
  const c = (code || "").toLowerCase().trim();
  if (STRINGS[c]) return c;
  return "en";
}

function t(key, lang) {
  const l = normalizeLanguage(lang || getDefaultLanguage());
  const fromLang = STRINGS[l] || {};
  if (Object.prototype.hasOwnProperty.call(fromLang, key)) return fromLang[key];
  const fromEn = STRINGS.en || {};
  if (Object.prototype.hasOwnProperty.call(fromEn, key)) return fromEn[key];
  return key;
}

function applyTranslations(lang) {
  const l = normalizeLanguage(lang || getDefaultLanguage());
  document.documentElement.lang = l;
  // RTL for Urdu
  document.documentElement.dir = l === "ur" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key, l);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    el.setAttribute("placeholder", t(key, l));
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (!key) return;
    el.setAttribute("title", t(key, l));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    if (!key) return;
    el.setAttribute("aria-label", t(key, l));
  });

  // Update <title> if opted-in
  const titleKey = document.documentElement.getAttribute("data-i18n-title");
  if (titleKey) document.title = t(titleKey, l);
}

function ensureLanguagePicker() {
  const picker = document.getElementById("hdims-language-select");
  if (!picker) return;

  // Populate options (if not already present)
  if (picker.options.length === 0) {
    LANGUAGES.forEach(({ code, label }) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = label;
      picker.appendChild(opt);
    });
  }

  const current = getDefaultLanguage();
  picker.value = current;

  const label = document.getElementById("hdims-language-label");
  if (label) label.textContent = t("language_label", current);

  picker.addEventListener("change", () => {
    const selected = normalizeLanguage(picker.value);
    localStorage.setItem(STORAGE_KEY, selected);
    applyTranslations(selected);
    // keep label updated too
    if (label) label.textContent = t("language_label", selected);
    window.dispatchEvent(new CustomEvent("hdims:languageChanged", { detail: { language: selected } }));
  });
}

function init() {
  const lang = getDefaultLanguage();
  ensureLanguagePicker();
  applyTranslations(lang);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

window.HDIMS_I18N = {
  languages: LANGUAGES.slice(),
  t: (key) => t(key, getDefaultLanguage()),
  getLanguage: () => getDefaultLanguage(),
  setLanguage: (code) => {
    const lang = normalizeLanguage(code);
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
    const picker = document.getElementById("hdims-language-select");
    if (picker) picker.value = lang;
    const label = document.getElementById("hdims-language-label");
    if (label) label.textContent = t("language_label", lang);
    window.dispatchEvent(new CustomEvent("hdims:languageChanged", { detail: { language: lang } }));
  },
  apply: () => applyTranslations(getDefaultLanguage()),
};

