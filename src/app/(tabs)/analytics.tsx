import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '#components/atoms';
import { StyleSheet, useStyles } from '#theme/unistyles';

// Mock haftalık data (Son 7 gün)
const WEEKLY_DATA = [
  { day: 'Pzt', value: 85 },
  { day: 'Sal', value: 60 },
  { day: 'Çar', value: 90 },
  { day: 'Per', value: 100 },
  { day: 'Cum', value: 40 },
  { day: 'Cmt', value: 75 },
  { day: 'Paz', value: 80 },
];

export default function AnalyticsScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const streak = 12;
  const successRate = 85;
  const maxValue = Math.max(...WEEKLY_DATA.map(d => d.value));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İstatistikler</Text>
        <Text style={styles.headerSubtitle}>Performans özeti</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{streak} Gün</Text>
            <Text style={styles.statLabel}>Zincir</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>%{successRate}</Text>
            <Text style={styles.statLabel}>Başarı Oranı</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Haftalık Aktivite</Text>
          <View style={styles.chart}>
            {WEEKLY_DATA.map((item, index) => {
              const barHeight = (item.value / maxValue) * 100;
              return (
                <View key={index} style={styles.chartBarContainer}>
                  <View style={styles.chartBarWrapper}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${barHeight}%`,
                          backgroundColor:
                            item.value >= 80 ? theme.colors.primary : theme.colors.border.PRIMARY,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Activity Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Bu Hafta</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Aktivite</Text>
            <Text style={styles.summaryValue}>21 görev</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tamamlanan</Text>
            <Text style={styles.summaryValue}>18 görev</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ortalama</Text>
            <Text style={styles.summaryValue}>3 görev/gün</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[1],
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[24],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 40,
    marginBottom: theme.spacing[2],
  },
  statValue: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  chartCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  chartTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[4],
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  chartBarWrapper: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing[2],
  },
  chartBar: {
    width: '100%',
    borderRadius: theme.borderRadius.md,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[5],
  },
  summaryTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.PRIMARY,
  },
  summaryLabel: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  summaryValue: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
}));
