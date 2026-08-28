/**
 * Guardian Bot - Scam Knowledge Base & Rule Definitions
 * Specifically tuned for scams targeting senior citizens in India & globally.
 */

export const SCAM_CATEGORIES = {
  DIGITAL_ARREST: {
    id: "DIGITAL_ARREST",
    name: "Digital Arrest & Law Enforcement Impersonation",
    severity: "CRITICAL",
    baseScore: 45,
    description: "Fraudsters impersonating Police, CBI, ED, Narcotics, or Customs threatening arrest unless money is paid.",
    warningAdvice: "Law enforcement agencies NEVER arrest anyone over video call or demand money verification.",
    patterns: [
      { pattern: /digital\s*arrest/i, weight: 45, label: "Digital Arrest Mention" },
      { pattern: /\b(cbi|central\s*bureau|police\s*officer|cyber\s*crime\s*branch|narcotics\s*control|customs\s*department|enforcement\s*directorate)\b/i, weight: 30, label: "Agency Impersonation" },
      { pattern: /\b(arrest\s*warrant|supreme\s*court\s*order|case\s*registered|money\s*laundering|terror\s*funding)\b/i, weight: 35, label: "Legal Threat" },
      { pattern: /\b(illegal\s*(consignment|parcel|drugs|passport)|fedex\s*parcel\s*detained)\b/i, weight: 35, label: "Illegal Parcel Claim" },
      { pattern: /\b(stay\s*on\s*(video\s*call|camera|skype)|do\s*not\s*(disconnect|hang\s*up)|confidential\s*investigation)\b/i, weight: 30, label: "Isolation / Stay on Video Coercion" }
    ]
  },

  BANKING_OTP_PHISHING: {
    id: "BANKING_OTP_PHISHING",
    name: "Banking, OTP & KYC Phishing",
    severity: "CRITICAL",
    baseScore: 40,
    description: "Attempts to steal OTPs, CVV, passwords, or PAN card data under the pretext of KYC renewal or account unfreezing.",
    warningAdvice: "NEVER share OTP, CVV, or passwords. Banks will never ask for your verification code.",
    patterns: [
      { pattern: /\b(share|tell|give|enter)\s*(the\s*)?(otp|one\s*time\s*password|verification\s*code|sms\s*code)\b/i, weight: 40, label: "OTP Demand" },
      { pattern: /\b(bank\s*account\s*(blocked|suspended|frozen)|debit\s*card\s*deactivated)\b/i, weight: 35, label: "Account Freeze Threat" },
      { pattern: /\b(kyc\s*(expired|update|verification|mandatory)|pan\s*card\s*link(ing)?)\b/i, weight: 30, label: "Urgent KYC Lure" },
      { pattern: /\b(cvv|atm\s*pin|internet\s*banking\s*password|expiry\s*date)\b/i, weight: 35, label: "Sensitive Credential Request" },
      { pattern: /\b(electricity\s*bill\s*unpaid|power\s*will\s*be\s*disconnected\s*tonight)\b/i, weight: 35, label: "Utility Cutoff Scam" }
    ]
  },

  REMOTE_ACCESS_FRAUD: {
    id: "REMOTE_ACCESS_FRAUD",
    name: "Remote Access Screen-Takeover",
    severity: "CRITICAL",
    baseScore: 40,
    description: "Tricking seniors into installing screen-sharing applications (AnyDesk, TeamViewer, RustDesk) to loot accounts.",
    warningAdvice: "DO NOT download AnyDesk, TeamViewer, or unknown apps. The caller will control your phone.",
    patterns: [
      { pattern: /\b(anydesk|teamviewer|rustdesk|quicksupport|airdroid|any\s*desk)\b/i, weight: 40, label: "Screen Share Tool Mention" },
      { pattern: /\b(install|download)\s*(this\s*)?(app|apk|application|software)\s*(from\s*play\s*store|link)?\b/i, weight: 25, label: "App Installation Request" },
      { pattern: /\b(allow\s*permission|grant\s*access|share\s*your\s*9\s*digit\s*code)\b/i, weight: 30, label: "Screen Takeover Code" }
    ]
  },

  URGENT_FUND_TRANSFER: {
    id: "URGENT_FUND_TRANSFER",
    name: "High-Pressure Coercive Transfer",
    severity: "HIGH",
    baseScore: 30,
    description: "Creating intense panic and urgency demanding immediate UPI/IMPS transfer to a 'safe verification account'.",
    warningAdvice: "Never transfer money to any 'safe account' or 'RBI verification account'—it is 100% fraud.",
    patterns: [
      { pattern: /\b(transfer|send|deposit|pay)\s*(money|funds|amount|penalty|security\s*deposit|rs\.?|inr|\$)\b/i, weight: 25, label: "Direct Payment Request" },
      { pattern: /\b(rbi\s*verification\s*account|refundable\s*security|clearance\s*fee)\b/i, weight: 35, label: "Fake Verification Account" },
      { pattern: /\b(within\s*(5|10|15|30)\s*minutes|immediately|urgently|right\s*now\s*or\s*else)\b/i, weight: 20, label: "Artificial Time Pressure" },
      { pattern: /\b(google\s*pay|phonepe|paytm|upi\s*id|qr\s*code\s*scan)\b/i, weight: 20, label: "UPI/QR Transfer Lure" }
    ]
  },

  FAKE_RELATIVE_EMERGENCY: {
    id: "FAKE_RELATIVE_EMERGENCY",
    name: "Fake Grandchild / Family Distress Scam",
    severity: "HIGH",
    baseScore: 35,
    description: "Pretending a grandson, daughter, or close relative is in hospital, arrested, or in an accident needing bail.",
    warningAdvice: "Hang up and immediately call your family member directly on their known phone number.",
    patterns: [
      { pattern: /\b(your\s*(son|grandson|daughter|granddaughter|relative)\s*(is\s*in\s*jail|arrested|in\s*hospital|accident))\b/i, weight: 40, label: "Relative in Danger Claim" },
      { pattern: /\b(do\s*not\s*tell\s*anyone|keep\s*this\s*secret|do\s*not\s*call\s*parents)\b/i, weight: 30, label: "Secrecy Demand" },
      { pattern: /\b(bail\s*money|urgent\s*doctor\s*fee|surgery\s*deposit)\b/i, weight: 30, label: "Emergency Bail/Hospital Fee" }
    ]
  },

  LOTTERY_TASK_SCAM: {
    id: "LOTTERY_TASK_SCAM",
    name: "Lottery, Prize & Telegram Task Fraud",
    severity: "MEDIUM",
    baseScore: 25,
    description: "Bogus prizes, KBC lottery, or part-time Youtube review/like job deposits.",
    warningAdvice: "You cannot win a lottery you never entered. Never pay advance fees for gifts.",
    patterns: [
      { pattern: /\b(won|winner|congratulations)\s*(of\s*)?(\d+\s*(lakh|crore|million|usd|\$)|kbc\s*lottery|lucky\s*draw)\b/i, weight: 35, label: "Fake Lottery Win" },
      { pattern: /\b(youtube\s*(like|subscribe)\s*job|telegram\s*investment|double\s*your\s*money)\b/i, weight: 30, label: "Work From Home / Crypto Task" },
      { pattern: /\b(processing\s*fee|gst\s*charge\s*to\s*claim\s*prize)\b/i, weight: 25, label: "Prize Claim Fee" }
    ]
  }
};

export const RISK_THRESHOLDS = {
  CRITICAL: 75,
  HIGH: 50,
  MEDIUM: 25,
  SAFE: 0
};
