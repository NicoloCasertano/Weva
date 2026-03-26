import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize } from '../../src/constants/theme';
import { getQuoteById, saveQuote, deleteQuote, updateQuoteStatus } from '../../src/services/database';
import { generateAndSharePdf } from '../../src/services/pdfService';
import { getProfile } from '../../src/services/profileService';
import type { Quote, QuoteItem } from '@weva/shared';

const STATUS_OPTIONS: Quote['status'][] = ['draft', 'sent', 'accepted', 'rejected'];
const STATUS_LABEL: Record<Quote['status'], string> = {
  draft: 'Bozza', sent: 'Inviato', accepted: 'Accettato', rejected: 'Rifiutato',
};
const STATUS_COLOR: Record<Quote['status'], string> = {
  draft: Colors.textSecondary, sent: Colors.primary, accepted: Colors.success, rejected: Colors.accent,
};

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id) getQuoteById(id).then(setQuote);
  }, [id]);

  const handleSave = useCallback(async () => {
    if (!quote) return;
    await saveQuote(quote);
    setEditing(false);
  }, [quote]);

  const handleDelete = useCallback(() => {
    if (!quote) return;
    Alert.alert('Elimina preventivo', 'Sei sicuro?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina', style: 'destructive',
        onPress: async () => { await deleteQuote(quote.id); router.back(); },
      },
    ]);
  }, [quote, router]);

  const handleStatusChange = useCallback(async () => {
    if (!quote) return;
    const currentIdx = STATUS_OPTIONS.indexOf(quote.status);
    const next = STATUS_OPTIONS[(currentIdx + 1) % STATUS_OPTIONS.length];
    await updateQuoteStatus(quote.id, next);
    setQuote({ ...quote, status: next });
  }, [quote]);

  const updateField = useCallback(<K extends keyof Quote>(key: K, value: Quote[K]) => {
    setQuote((prev) => prev ? { ...prev, [key]: value } : prev);
  }, []);

  const updateItem = useCallback((itemId: string, key: keyof QuoteItem, value: string | number) => {
    setQuote((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((it) => it.id === itemId ? { ...it, [key]: value } : it),
      };
    });
  }, []);

  const addItem = useCallback(() => {
    setQuote((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [...prev.items, {
          id: `item_${Date.now()}`,
          name: 'Nuova voce',
          description: '',
          quantity: 1,
          unitPrice: 0,
        }],
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setQuote((prev) => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((it) => it.id !== itemId) };
    });
  }, []);

  const handleSharePdf = useCallback(async () => {
    if (!quote) return;
    try {
      const profile = await getProfile();
      await generateAndSharePdf(quote, profile);
    } catch (err) {
      Alert.alert('Errore', err instanceof Error ? err.message : 'Errore generazione PDF');
    }
  }, [quote]);

  if (!quote) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const total = quote.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Status badge */}
      <Pressable style={[styles.statusBadge, { borderColor: STATUS_COLOR[quote.status] }]} onPress={handleStatusChange}>
        <Text style={[styles.statusText, { color: STATUS_COLOR[quote.status] }]}>
          {STATUS_LABEL[quote.status]}
        </Text>
      </Pressable>

      {/* Cliente */}
      <Text style={styles.label}>Cliente</Text>
      {editing ? (
        <TextInput
          style={styles.input}
          value={quote.clientName}
          onChangeText={(v) => updateField('clientName', v)}
          placeholderTextColor={Colors.textSecondary}
        />
      ) : (
        <Text style={styles.value}>{quote.clientName}</Text>
      )}

      {editing && (
        <>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={quote.clientEmail ?? ''}
            onChangeText={(v) => updateField('clientEmail', v || undefined)}
            placeholder="email@esempio.it"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
          />
          <Text style={styles.label}>Telefono</Text>
          <TextInput
            style={styles.input}
            value={quote.clientPhone ?? ''}
            onChangeText={(v) => updateField('clientPhone', v || undefined)}
            placeholder="+39..."
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
          />
        </>
      )}

      {/* Voci */}
      <Text style={styles.sectionTitle}>Voci</Text>
      {quote.items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          {editing ? (
            <>
              <TextInput
                style={styles.input}
                value={item.name}
                onChangeText={(v) => updateItem(item.id, 'name', v)}
                placeholder="Nome voce"
                placeholderTextColor={Colors.textSecondary}
              />
              <TextInput
                style={[styles.input, styles.inputSmall]}
                value={item.description}
                onChangeText={(v) => updateItem(item.id, 'description', v)}
                placeholder="Descrizione"
                placeholderTextColor={Colors.textSecondary}
              />
              <View style={styles.itemRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Qtà</Text>
                  <TextInput
                    style={[styles.input, styles.inputNumber]}
                    value={String(item.quantity)}
                    onChangeText={(v) => updateItem(item.id, 'quantity', parseFloat(v) || 0)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prezzo €</Text>
                  <TextInput
                    style={[styles.input, styles.inputNumber]}
                    value={String(item.unitPrice)}
                    onChangeText={(v) => updateItem(item.id, 'unitPrice', parseFloat(v) || 0)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                <Pressable style={styles.removeBtn} onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description !== '' && (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>
                {item.unitPrice > 0
                  ? `${item.quantity} × €${item.unitPrice.toFixed(2)}`
                  : 'Da quotare'}
              </Text>
            </View>
          )}
        </View>
      ))}

      {editing && (
        <Pressable style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addBtnText}>+ Aggiungi voce</Text>
        </Pressable>
      )}

      {/* Note */}
      <Text style={styles.label}>Note</Text>
      {editing ? (
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={quote.notes}
          onChangeText={(v) => updateField('notes', v)}
          multiline
          placeholderTextColor={Colors.textSecondary}
          placeholder="Note aggiuntive..."
        />
      ) : (
        <Text style={styles.value}>{quote.notes || '—'}</Text>
      )}

      {/* Totale */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Totale</Text>
        <Text style={styles.totalValue}>
          {total > 0 ? `€ ${total.toFixed(2)}` : 'Da quotare'}
        </Text>
      </View>

      {/* Date */}
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>Creato: {new Date(quote.createdAt).toLocaleDateString('it-IT')}</Text>
        <Text style={styles.dateText}>Valido fino: {new Date(quote.validUntil).toLocaleDateString('it-IT')}</Text>
      </View>

      {/* Azioni */}
      <View style={styles.actions}>
        {editing ? (
          <>
            <Pressable style={[styles.btn, styles.primaryBtn]} onPress={handleSave}>
              <Text style={styles.btnText}>Salva</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.secondaryBtn]} onPress={() => {
              if (id) getQuoteById(id).then(setQuote);
              setEditing(false);
            }}>
              <Text style={styles.btnTextSecondary}>Annulla</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={[styles.btn, styles.pdfBtn]} onPress={handleSharePdf}>
              <Text style={styles.btnText}>PDF</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.primaryBtn]} onPress={() => setEditing(true)}>
              <Text style={styles.btnText}>Modifica</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.dangerBtn]} onPress={handleDelete}>
              <Text style={styles.btnText}>Elimina</Text>
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
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  statusBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  statusText: { fontSize: FontSize.sm, fontWeight: '600' },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  value: { fontSize: FontSize.lg, color: Colors.text },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: '600', color: Colors.text,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  itemCard: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  itemDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface, borderRadius: 8, padding: Spacing.sm,
    fontSize: FontSize.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  inputSmall: { fontSize: FontSize.sm },
  inputNumber: { flex: 1 },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
  removeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { color: Colors.text, fontWeight: '700', fontSize: FontSize.md },
  addBtn: {
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: 10, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm,
  },
  addBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.md },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.text },
  totalValue: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.primary },
  dateRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md,
  },
  dateText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
  btn: { flex: 1, paddingVertical: Spacing.md, borderRadius: 12, alignItems: 'center' },
  pdfBtn: { backgroundColor: Colors.surfaceLight },
  primaryBtn: { backgroundColor: Colors.primary },
  secondaryBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  dangerBtn: { backgroundColor: Colors.accent },
  btnText: { color: Colors.text, fontWeight: '600', fontSize: FontSize.md },
  btnTextSecondary: { color: Colors.textSecondary, fontWeight: '600', fontSize: FontSize.md },
});
