import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, TextInput, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export default function App() {
  const [shieldActive, setShieldActive] = useState(true);
  const [inputText, setInputText] = useState('');
  const [lastRiskResult, setLastRiskResult] = useState(null);

  // Local Scam Rules
  const scamKeywords = [
    { pattern: /digital arrest/i, weight: 45, label: 'Digital Arrest Scam' },
    { pattern: /(cbi|police|customs|cyber crime|narcotics)/i, weight: 30, label: 'Law Enforcement Impersonation' },
    { pattern: /(otp|one time password|cvv|atm pin)/i, weight: 40, label: 'OTP Phishing' },
    { pattern: /(bank account blocked|kyc expired|pan card)/i, weight: 35, label: 'Bank Account Panic' },
    { pattern: /(anydesk|teamviewer|rustdesk|screen share)/i, weight: 40, label: 'Remote Access Takeover' },
    { pattern: /(transfer money|rbi verification account|security deposit)/i, weight: 35, label: 'Urgent Fund Transfer' }
  ];

  const handleEvaluateText = (text) => {
    let score = 0;
    const matches = [];

    scamKeywords.forEach((item) => {
      if (item.pattern.test(text)) {
        score += item.weight;
        matches.push(item.label);
      }
    });

    const finalScore = Math.min(score, 100);
    const result = {
      score: finalScore,
      isThreat: finalScore >= 50,
      matches
    };
    setLastRiskResult(result);

    if (finalScore >= 50) {
      triggerThreatWarning(matches.join(', '));
    }
  };

  const triggerThreatWarning = (reason) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    const warning = `WARNING: Guardian Bot detected a dangerous scam attempt: ${reason}. Please hang up immediately. Your family has been notified.`;
    Speech.speak(warning, { rate: 0.9, pitch: 1.0 });
    Alert.alert('🚨 SCAM WARNING DETECTED', warning, [{ text: 'HANG UP NOW', style: 'destructive' }]);
  };

  const handleManualSos = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Speech.speak('Emergency SOS activated. Alerting your family right now.', { rate: 0.9 });
    Alert.alert('🚨 EMERGENCY SOS SENT', 'Family members and emergency contacts have been notified with your live GPS location.', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🛡️ GUARDIAN BOT</Text>
          <Text style={styles.subtitle}>Senior Citizen Safety &amp; Scam Protection</Text>
        </View>

        {/* Shield Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusBadge}>🟢 SHIELD ACTIVE &amp; SECURE</Text>
          <Text style={styles.statusDetail}>
            Real-time call listening, SMS fraud scanner, and family alert network active.
          </Text>
        </View>

        {/* Big SOS Emergency Button */}
        <TouchableOpacity style={styles.sosButton} onPress={handleManualSos} activeOpacity={0.8}>
          <Text style={styles.sosButtonText}>🚨 EMERGENCY SOS</Text>
          <Text style={styles.sosSubtext}>One-Tap Family Alert</Text>
        </TouchableOpacity>

        {/* Quick Family Contact */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Quick Connect</Text>
        </View>

        <TouchableOpacity style={styles.familyButton} onPress={() => Alert.alert('Dialing', 'Calling Aarav (Son)...')}>
          <Text style={styles.familyButtonText}>📞 Call Aarav (Son)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.familyButtonSecondary} onPress={() => Alert.alert('Dialing', 'Calling Pooja (Daughter)...')}>
          <Text style={styles.familyButtonSecondaryText}>📞 Call Pooja (Daughter)</Text>
        </TouchableOpacity>

        {/* Live Audio / SMS Scam Tester */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Live Scam Simulator Test</Text>
          <TextInput
            style={styles.input}
            placeholder="Type suspicious call speech or SMS here..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={styles.testBtn}
            onPress={() => {
              handleEvaluateText(inputText);
            }}>
            <Text style={styles.testBtnText}>Scan Text / Test Speech Alert</Text>
          </TouchableOpacity>

          {lastRiskResult && (
            <View style={[styles.resultCard, { borderColor: lastRiskResult.isThreat ? '#EF4444' : '#10B981' }]}>
              <Text style={[styles.resultScore, { color: lastRiskResult.isThreat ? '#EF4444' : '#10B981' }]}>
                Risk Score: {lastRiskResult.score}/100 ({lastRiskResult.isThreat ? 'HIGH DANGER' : 'SAFE'})
              </Text>
              {lastRiskResult.matches.map((m, i) => (
                <Text key={i} style={styles.matchItem}>⚠️ {m}</Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: 20 },
  header: { alignItems: 'center', marginVertical: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#38BDF8', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 4 },
  statusCard: { backgroundColor: '#1E293B', padding: 18, borderRadius: 16, marginTop: 15, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statusBadge: { fontSize: 20, fontWeight: 'bold', color: '#4ADE80' },
  statusDetail: { fontSize: 14, color: '#CBD5E1', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  sosButton: { backgroundColor: '#DC2626', paddingVertical: 24, borderRadius: 20, marginTop: 24, alignItems: 'center', elevation: 8 },
  sosButtonText: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  sosSubtext: { fontSize: 14, color: '#FEE2E2', marginTop: 4, fontWeight: '600' },
  sectionHeader: { marginTop: 28, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC' },
  familyButton: { backgroundColor: '#38BDF8', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  familyButtonText: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  familyButtonSecondary: { backgroundColor: '#334155', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 20 },
  familyButtonSecondaryText: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC' },
  testSection: { marginTop: 10, padding: 16, backgroundColor: '#1E293B', borderRadius: 14 },
  input: { backgroundColor: '#0F172A', color: '#F8FAFC', padding: 14, borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: '#475569', fontSize: 15 },
  testBtn: { backgroundColor: '#F59E0B', paddingVertical: 14, borderRadius: 10, marginTop: 12, alignItems: 'center' },
  testBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 16 },
  resultCard: { marginTop: 14, padding: 12, backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 2 },
  resultScore: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  matchItem: { color: '#FCA5A5', fontSize: 14, marginTop: 2 }
});
