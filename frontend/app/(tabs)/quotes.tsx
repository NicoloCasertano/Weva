import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize } from '../../src/constants/theme';
import { getAllQuotes, deleteQuote } from '../../src/services/database';
import type { Quote } from '@weva/shared';

const STATUS_LABEL: Record<Quote['status'], string> = {
  draft: 'Bozza',
  sent: 'Inviato',
  accepted: 'Accettato',
  rejected: 'Rifiutato',
};
const STATUS_COLOR: Record<Quote['status'], string> = {
  draft: Colors.textSecondary,
  sent: Colors.primary,
  accepted: Colors.success,
  rejected: Colors.accent,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function quoteTotal(q: Quote): number {
  return q.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}

export default function QuotesScreen() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllQuotes().then(setQuotes);
    }, [])
  );

  const handleDelete = useCallback(async (id: string) => {
    await deleteQuote(id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  if (quotes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.title}>Nessun preventivo</Text>
        <Text style={styles.subtitle}>
          I tuoi preventivi appariranno qui{'\n'}dopo la prima registrazione
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={quotes}
      keyExtractor={(q) => q.id}
      renderItem={({ item }) => {
        const total = quoteTotal(item);
        return (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/quote/${item.id}`)}
            onLongPress={() => handleDelete(item.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardClient} numberOfLines={1}>{item.clientName}</Text>
              <Text style={[styles.cardStatus, { color: STATUS_COLOR[item.status] }]}>
                {STATUS_LABEL[item.status]}
              </Text>
            </View>
            <Text style={styles.cardItems}>
              {item.items.length} {item.items.length === 1 ? 'voce' : 'voci'}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.cardTotal}>
                {total > 0 ? `€ ${total.toFixed(2)}` : 'Da quotare'}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.md },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: Spacing.lg, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  cardClient: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  cardStatus: { fontSize: FontSize.sm, fontWeight: '600' },
  cardItems: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardTotal: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
});
