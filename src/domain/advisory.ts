export const languages = ['English', 'Kannada', 'Marathi', 'Hindi'] as const;
export type Language = typeof languages[number];
export type Role = 'farmer' | 'supervisor' | 'agronomist' | 'admin';
export type Action = 'irrigate' | 'defer' | 'rain' | 'adequate' | 'saturated' | 'blocked';
export interface Reading {
  moisture: number | null;
  rainfall: number | null;
  powerHours: number | null;
  ageHours: number;
  previousMoisture: number | null;
  weatherAvailable: boolean;
}
export interface Advisory {
  action: Action; valid: boolean; durationMinutes: number; requiredMinutes: number;
  applicationMm: number; waterStress: number; yieldLoss: number;
  message: string; alerts: string[]; recipients: string[];
  nextCycle: string; scheduled: boolean; language: Language;
}

const translations: Record<Language, Record<Action, string>> = {
  English: {
    irrigate: 'Irrigate in the confirmed power window. Start at 19:30.',
    defer: 'Irrigation is needed, but no power window is available. Wait for the next confirmed window.',
    rain: 'Rainfall is expected. Irrigation is not required today.',
    adequate: 'Soil moisture is adequate. No irrigation is required. Re-evaluate in the next cycle.',
    saturated: 'Soil is saturated. Do not irrigate. Check drainage and re-evaluate in the next cycle.',
    blocked: 'A reliable recommendation cannot be generated. Ask your supervisor to check the data.',
  },
  Kannada: {
    irrigate: 'ದೃಢೀಕರಿಸಿದ ವಿದ್ಯುತ್ ಸಮಯದಲ್ಲಿ ನೀರಾವರಿ ಮಾಡಿ. ಸಂಜೆ 7:30ಕ್ಕೆ ಪ್ರಾರಂಭಿಸಿ.',
    defer: 'ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ, ಆದರೆ ವಿದ್ಯುತ್ ಲಭ್ಯವಿಲ್ಲ. ಮುಂದಿನ ದೃಢೀಕರಿಸಿದ ವಿದ್ಯುತ್ ಸಮಯದವರೆಗೆ ಕಾಯಿರಿ.',
    rain: 'ಮಳೆಯ ನಿರೀಕ್ಷೆ ಇದೆ. ಇಂದು ನೀರಾವರಿ ಅಗತ್ಯವಿಲ್ಲ.',
    adequate: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಾಕಷ್ಟಿದೆ. ನೀರಾವರಿ ಅಗತ್ಯವಿಲ್ಲ. ಮುಂದಿನ ಚಕ್ರದಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.',
    saturated: 'ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಹೆಚ್ಚಾಗಿದೆ. ನೀರಾವರಿ ಮಾಡಬೇಡಿ. ನೀರು ಹರಿದುಹೋಗುವ ವ್ಯವಸ್ಥೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
    blocked: 'ವಿಶ್ವಾಸಾರ್ಹ ಸಲಹೆ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ಮೇಲ್ವಿಚಾರಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  },
  Marathi: {
    irrigate: 'वीज उपलब्ध असलेल्या निश्चित वेळेत पाणी द्या. संध्याकाळी ७:३० वाजता सुरू करा.',
    defer: 'पाणी देणे आवश्यक आहे, पण वीज उपलब्ध नाही. पुढील निश्चित वीज वेळेची वाट पहा.',
    rain: 'पावसाची शक्यता आहे. आज पाणी देण्याची गरज नाही.',
    adequate: 'जमिनीत पुरेसा ओलावा आहे. पाणी देण्याची गरज नाही. पुढील चक्रात पुन्हा तपासा.',
    saturated: 'जमिनीत जास्त ओलावा आहे. पाणी देऊ नका. पाण्याचा निचरा तपासा.',
    blocked: 'विश्वसनीय सल्ला देता येत नाही. माहिती तपासण्यासाठी पर्यवेक्षकाशी संपर्क साधा.',
  },
  Hindi: {
    irrigate: 'बिजली उपलब्ध होने के निश्चित समय में सिंचाई करें। शाम ७:३० बजे शुरू करें।',
    defer: 'सिंचाई आवश्यक है, लेकिन बिजली उपलब्ध नहीं है। अगले निश्चित बिजली समय की प्रतीक्षा करें।',
    rain: 'बारिश की संभावना है। आज सिंचाई की आवश्यकता नहीं है।',
    adequate: 'मिट्टी में पर्याप्त नमी है। सिंचाई की आवश्यकता नहीं है। अगले चक्र में दोबारा जाँचें।',
    saturated: 'मिट्टी में अधिक नमी है। सिंचाई न करें। जल निकासी की जाँच करें।',
    blocked: 'विश्वसनीय सलाह नहीं दी जा सकती। जानकारी जाँचने के लिए पर्यवेक्षक से संपर्क करें।',
  },
};

export function generateAdvisory(reading: Reading, requestedLanguage: string = 'English'): Advisory {
  const supported = languages.includes(requestedLanguage as Language);
  const language = supported ? requestedLanguage as Language : 'English';
  const alerts: string[] = [];
  const { moisture, rainfall, powerHours } = reading;
  const isNumberInRange = (v: unknown, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max;
  if (!supported) alerts.push('Unsupported language. Supported languages: English, Kannada, Marathi, Hindi.');
  if (!isNumberInRange(moisture, 100)) alerts.push(moisture === null ? 'Missing soil moisture data.' : 'Invalid soil moisture: use a number from 0 to 100%.');
  if (!isNumberInRange(rainfall, 200)) alerts.push('Invalid or missing rainfall forecast: use a number from 0 to 200 mm.');
  if (!isNumberInRange(powerHours, 24)) alerts.push('Invalid or missing power availability: use a number from 0 to 24 hours.');
  if (!Number.isFinite(reading.ageHours) || reading.ageHours < 0 || reading.ageHours >= 24) alerts.push('Sensor communication failure: data is stale or its timestamp is invalid. Last valid readings are not current.');
  if (!reading.weatherAvailable) alerts.push('Weather service unavailable. A reliable recommendation cannot be generated.');
  // Experiment 7 does not specify a noise threshold; a >50 percentage-point jump is a documented demo assumption.
  if (moisture !== null && reading.previousMoisture !== null && Math.abs(moisture - reading.previousMoisture) > 50) alerts.push('Noisy sensor reading: sudden soil moisture jump. Inspect or calibrate the sensor.');
  if (alerts.length) return { action: 'blocked', valid: false, durationMinutes: 0, requiredMinutes: 0, applicationMm: 0, waterStress: 0, yieldLoss: 0, message: translations[language].blocked, alerts, recipients: ['farmer', 'supervisor'], nextCycle: 'After data recovery', scheduled: false, language };
  const sm = moisture!, rf = rainfall!, pa = powerHours!;
  const action: Action = sm > 70 ? 'saturated' : rf >= 10 ? 'rain' : sm >= 30 ? 'adequate' : pa === 0 ? 'defer' : 'irrigate';
  const requiredMinutes = sm < 30 && rf < 10 ? Math.max(1, Math.round((30 - sm) * 3)) : 0;
  const durationMinutes = action === 'irrigate' ? Math.min(requiredMinutes, pa * 60) : 0;
  if (action === 'saturated') alerts.push('Saturation warning: soil moisture is high. Check drainage.');
  if (action === 'defer') alerts.push('Farmer alerted: irrigation deferred to the next power window.');
  if (durationMinutes > 0 && durationMinutes < requiredMinutes) alerts.push('Power window limits this session. Schedule the remaining irrigation in the next confirmed window.');
  const waterStress = Math.max(0, Math.round((30 - sm) * 3));
  const yieldLoss = Math.round(waterStress * 0.1733 * 10) / 10;
  return { action, valid: true, durationMinutes, requiredMinutes, applicationMm: Math.round(durationMinutes * 18 / 42 * 10) / 10, waterStress, yieldLoss, message: translations[language][action], alerts, recipients: alerts.length ? ['farmer', 'supervisor'] : [], nextCycle: action === 'irrigate' ? 'Today, 19:30 IST' : action === 'defer' ? 'Next confirmed power window' : 'Next monitoring cycle', scheduled: action === 'irrigate', language };
}

export function durationText(minutes: number, language: Language): string {
  return { English: `Duration: ${minutes} minutes.`, Kannada: `ಅವಧಿ: ${minutes} ನಿಮಿಷಗಳು.`, Marathi: `कालावधी: ${minutes} मिनिटे.`, Hindi: `अवधि: ${minutes} मिनट।` }[language];
}
