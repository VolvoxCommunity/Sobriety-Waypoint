import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/database';
import { CheckCircle, Circle, X, Calendar } from 'lucide-react-native';

export default function TasksScreen() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('tasks')
      .select('*, sponsor:sponsor_id(*)')
      .eq('sponsee_id', profile.id)
      .order('created_at', { ascending: false });
    setTasks(data || []);
  }, [profile]);

  useEffect(() => {
    fetchTasks();
  }, [profile, fetchTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleCompleteTask = (task: Task) => {
    setSelectedTask(task);
    setCompletionNotes('');
    setShowCompleteModal(true);
  };

  const submitTaskCompletion = async () => {
    if (!selectedTask) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: completionNotes.trim() || null,
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: selectedTask.sponsor_id,
        type: 'task_completed',
        title: 'Task Completed',
        content: `${profile?.first_name} ${profile?.last_initial}. has completed: ${selectedTask.title}`,
        data: {
          task_id: selectedTask.id,
          step_number: selectedTask.step_number,
        },
      });

      setShowCompleteModal(false);
      setSelectedTask(null);
      setCompletionNotes('');
      await fetchTasks();

      if (Platform.OS === 'web') {
        window.alert('Task marked as completed!');
      } else {
        Alert.alert('Success', 'Task marked as completed!');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to complete task');
      } else {
        Alert.alert('Error', 'Failed to complete task');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <Text style={styles.headerSubtitle}>Track your step progress</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {getTasksByStatus('assigned').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Tasks</Text>
            {getTasksByStatus('assigned').map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  {task.step_number && (
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>Step {task.step_number}</Text>
                    </View>
                  )}
                  <Text style={styles.taskDate}>
                    {new Date(task.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
                {task.due_date && (
                  <View style={styles.dueDateContainer}>
                    <Calendar size={14} color={theme.textSecondary} />
                    <Text style={styles.dueDateText}>
                      Due {new Date(task.due_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                <View style={styles.taskFooter}>
                  <Text style={styles.sponsorText}>
                    From: {task.sponsor?.first_name} {task.sponsor?.last_initial}.
                  </Text>
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleCompleteTask(task)}
                  >
                    <CheckCircle size={20} color={theme.primary} />
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {getTasksByStatus('completed').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed</Text>
            {getTasksByStatus('completed').map((task) => (
              <View key={task.id} style={[styles.taskCard, styles.completedCard]}>
                <View style={styles.taskHeader}>
                  {task.step_number && (
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>Step {task.step_number}</Text>
                    </View>
                  )}
                  <CheckCircle size={20} color={theme.primary} />
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <Text style={styles.completedDate}>
                  Completed {new Date(task.completed_at!).toLocaleDateString()}
                </Text>
                {task.completion_notes && (
                  <View style={styles.completionNotesContainer}>
                    <Text style={styles.completionNotesLabel}>Your Notes:</Text>
                    <Text style={styles.completionNotesText}>{task.completion_notes}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Circle size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyText}>
              Your sponsor will assign tasks to help you progress through the 12 steps
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCompleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Task</Text>
              <TouchableOpacity
                onPress={() => setShowCompleteModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedTask && (
                <>
                  <View style={styles.taskSummary}>
                    {selectedTask.step_number && (
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>Step {selectedTask.step_number}</Text>
                      </View>
                    )}
                    <Text style={styles.taskSummaryTitle}>{selectedTask.title}</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Completion Notes (Optional)</Text>
                    <Text style={styles.helpText}>
                      Share your reflections, insights, or any challenges you faced with this task.
                    </Text>
                    <TextInput
                      style={styles.textArea}
                      value={completionNotes}
                      onChangeText={setCompletionNotes}
                      placeholder="What did you learn? How do you feel?"
                      placeholderTextColor={theme.textTertiary}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />
                  </View>
                </>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCompleteModal(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                onPress={submitTaskCompletion}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Mark Complete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 24,
      paddingTop: 60,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: theme.fontRegular,
      fontWeight: '700',
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    taskCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    completedCard: {
      opacity: 0.7,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    stepBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    stepBadgeText: {
      fontSize: 12,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: '#ffffff',
    },
    taskDate: {
      fontSize: 12,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
    },
    taskTitle: {
      fontSize: 18,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    taskDescription: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    taskFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    sponsorText: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
    },
    completeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0fdf4',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    completeButtonText: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.primary,
      marginLeft: 6,
    },
    completedDate: {
      fontSize: 12,
      fontFamily: theme.fontRegular,
      color: theme.primary,
      fontWeight: '600',
      marginTop: 8,
    },
    completionNotesContainer: {
      backgroundColor: theme.background,
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    completionNotesLabel: {
      fontSize: 12,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    completionNotesText: {
      fontSize: 13,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    dueDateText: {
      fontSize: 12,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: theme.fontRegular,
      fontWeight: '700',
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    modalBody: {
      padding: 20,
    },
    taskSummary: {
      marginBottom: 20,
      alignItems: 'center',
    },
    taskSummaryTitle: {
      fontSize: 18,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginTop: 12,
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    helpText: {
      fontSize: 13,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 18,
    },
    textArea: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      fontFamily: theme.fontRegular,
      color: theme.text,
      minHeight: 120,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    submitButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: theme.primary,
      alignItems: 'center',
    },
    submitButtonText: {
      fontSize: 16,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: '#ffffff',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginTop: 16,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 32,
    },
  });
