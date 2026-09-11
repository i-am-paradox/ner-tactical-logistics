const translations = {
  en: {
    platformName: 'NER Tactical Logistics & Emergency Command',
    dashboard: 'Command Dashboard',
    liveMap: 'Live Tracking Map',
    routePlanner: 'AI Route Optimizer',
    incidents: 'Field Incidents',
    reportIncident: 'Submit Incident',
    alerts: 'Alerts & Broadcasts',
    analytics: 'Analytics & Insights',
    districts: 'District Directory',
    shipments: 'Shipment Tracking',
    emergencyMode: 'Emergency Mode',
    safeCorridors: 'Safe Corridors Open',
    activeConvoys: 'Active Convoys',
    criticalIncidents: 'Critical Incidents',
    weatherAlerts: 'Active Advisories',
    offlineStatus: 'Offline Mode Active (Will sync automatically)',
    pendingSync: 'Pending Offline Reports'
  },
  as: {
    platformName: 'উত্তৰ-পূৰ্বাঞ্চল কৌশলগত লজিষ্টিক আৰু জৰুৰীকালীন কমাণ্ড',
    dashboard: 'কমাণ্ড ডেশ্ববৰ্ড',
    liveMap: 'লাইভ ট্ৰেকিং মেপ',
    routePlanner: 'এআই পথ অপটিমাইজাৰ',
    incidents: 'ক্ষেত্ৰৰ ঘটনাৱলী',
    reportIncident: 'ঘটনাৰ প্ৰতিবেদন দাখিল কৰক',
    alerts: 'সতৰ্কবাৰ্তা আৰু সম্প্ৰচাৰ',
    analytics: 'বিশ্লেষণ আৰু অন্তৰ্দৃষ্টি',
    districts: 'জিলা ডাইৰেক্টৰি',
    shipments: 'প্ৰেৰণ ট্ৰেকিং',
    emergencyMode: 'জৰুৰীকালীন মোড',
    safeCorridors: 'সুৰক্ষিত কৰিডৰ মুকলি',
    activeConvoys: 'সক্ৰিয় কনভয়',
    criticalIncidents: 'গুৰুতৰ ঘটনা',
    weatherAlerts: 'বতৰৰ সতৰ্কবাৰ্তা',
    offlineStatus: 'অফলাইন মোড সক্ৰিয় (স্বয়ংক্ৰিয়ভাৱে চিন্ক হ’ব)',
    pendingSync: 'অপেক্ষাকৃত অফলাইন প্ৰতিবেদন'
  },
  bn: {
    platformName: 'উত্তর-পূর্বাঞ্চল কৌশলগত লজিস্টিক ও জরুরি কমান্ড প্ল্যাটফর্ম',
    dashboard: 'কমান্ড ড্যাশবোর্ড',
    liveMap: 'লাইভ ট্র্যাকিং ম্যাপ',
    routePlanner: 'এআই রুট অপটিমাইজার',
    incidents: 'ক্ষেত্রের ঘটনাসমূহ',
    reportIncident: 'ঘটনার রিপোর্ট জমা দিন',
    alerts: 'সতর্কতা ও সম্প্রচার',
    analytics: 'বিশ্লেষণ ও অন্তর্দৃষ্টি',
    districts: 'জেলা ডিরেক্টরি',
    shipments: 'চালান ট্র্যাকিং',
    emergencyMode: 'জরুরি মোড',
    safeCorridors: 'নিরাপদ করিডোর উন্মুক্ত',
    activeConvoys: 'সক্রিয় কনভয়',
    criticalIncidents: 'সংকটজনক ঘটনা',
    weatherAlerts: 'সক্রিয় সতর্কতা',
    offlineStatus: 'অফলাইন মোড সক্রিয় (স্বয়ংক্রিয়ভাবে সিঙ্ক হবে)',
    pendingSync: 'অপেক্ষমাণ অফলাইন রিপোর্ট'
  },
  hi: {
    platformName: 'पूर्वोत्तर सामरिक रसद एवं आपातकालीन कमान मंच',
    dashboard: 'कमान डैशबोर्ड',
    liveMap: 'लाइव ट्रैकिंग मानचित्र',
    routePlanner: 'एआई मार्ग अनुकूलक',
    incidents: 'क्षेत्रीय घटनाएं',
    reportIncident: 'घटना रिपोर्ट दर्ज करें',
    alerts: 'चेतावनी एवं प्रसारण',
    analytics: 'एनालिटिक्स एवं अंतर्दृष्टि',
    districts: 'जिला निर्देशिका',
    shipments: 'खेप ट्रैकिंग',
    emergencyMode: 'आपातकालीन मोड',
    safeCorridors: 'सुरक्षित गलियारे खुले हैं',
    activeConvoys: 'सक्रिय काफिले',
    criticalIncidents: 'गंभीर घटनाएं',
    weatherAlerts: 'सक्रिय मौसम चेतावनी',
    offlineStatus: 'ऑफ़लाइन मोड सक्रिय (ऑनलाइन होने पर स्वतः सिंक होगा)',
    pendingSync: 'लंबित ऑफ़लाइन रिपोर्ट'
  }
};

export function t(key, lang = 'en') {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

export default translations;
