import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSize } from '../../src/constants/theme';
import { getProfile, saveProfile } from '../../src/services/profileService';
import { type FreelancerProfile, emptyProfile } from '@weva/shared';

const FIELDS: { key: keyof FreelancerProfile; label: string; placeholder: string; keyboard?: 'email-address' | 'phone-pad' }[] = [
  { key: 'name', label: 'Nome / Ragione Sociale', placeholder: 'Mario Rossi' },
  { key: 'vatNumber', label: 'P.IVA', placeholder: '01234567890' },
  { key: 'email', label: 'Email', placeholder: 'mario@esempio.it', keyboard: 'email-address' },
  { key: 'phone', label: 'Telefono', placeholder: '+39 333 1234567', keyboard: 'phone-pad' },
  { key: 'address', label: 'Indirizzo', placeholder: 'Via Roma 1, Milano' },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<FreelancerProfile>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfile);
      setSaved(false);
    }, [])
  );

  const handleSave = useCallback(async () => {
    await saveProfile(profile);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [profile]);

  const handleReset = useCallback(() => {
    Alert.alert('Reset profilo', 'Vuoi cancellare tutti i dati del profilo?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => {
          await saveProfile(emptyProfile);
          setProfile(emptyProfile);
          setEditing(false);
        },
      },
    ]);
  }, []);

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'W';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.title}>{profile.name || 'Il tuo profilo'}</Text>
      <Text style={styles.subtitle}>
        {profile.name ? 'I tuoi dati per i preventivi' : 'Configura i tuoi dati per\npersonalizzare i preventivi'}
      </Text>

      {saved && <Text style={styles.savedMsg}>Salvato!</Text>}

      {FIELDS.map(({ key, label, placeholder, keyboard }) => (
        <View key={key} style={styles.card}>
          <Text style={styles.cardLabel}>{label}</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile[key]}
              onChangeText={(v) => setProfile((p) => ({ ...p, [key]: v }))}
              placeholder={placeholder}
              placeholderTextColor={Colors.textSecondary}
              keyboardType={keyboard ?? 'default'}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
            />
          ) : (
            <Text style={styles.cardValue}>{profile[key] || 'Non configurato'}</Text>
          )}
        </View>
      ))}

      <View style={styles.actions}>
        {editing ? (
          <>
            <Pressable style={[styles.btn, styles.primaryBtn]} onPress={handleSave}>
              <Text style={styles.btnText}>Salva</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.secondaryBtn]} onPress={() => {
              getProfile().then(setProfile);
              setEditing(false);
            }}>
              <Text style={styles.btnTextSecondary}>Annulla</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={[styles.btn, styles.primaryBtn]} onPress={() => setEditing(true)}>
              <Text style={styles.btnText}>Modifica</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.dangerBtn]} onPress={handleReset}>
              <Text style={styles.btnText}>Reset</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { alignItems: 'center', paddingTop: Spacing.xxl, padding: Spacing.lg, paddingBottom: Spacing.xxl },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  title: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  subtitle: {
    fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center',
    marginBottom: Spacing.xl, lineHeight: 22,
  },
  savedMsg: { color: Colors.success, fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.sm },
  card: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: 12,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  cardLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  cardValue: { fontSize: FontSize.lg, color: Colors.text },
  input: {
    fontSize: FontSize.lg, color: Colors.text, backgroundColor: Colors.background,
    borderRadius: 8, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg, width: '100%' },
  btn: { flex: 1, paddingVertical: Spacing.md, borderRadius: 12, alignItems: 'center' },
  primaryBtn: { backgroundColor: Colors.primary },
  secondaryBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  dangerBtn: { backgroundColor: Colors.accent },
  btnText: { color: Colors.text, fontWeight: '600', fontSize: FontSize.md },
  btnTextSecondary: { color: Colors.textSecondary, fontWeight: '600', fontSize: FontSize.md },
});
