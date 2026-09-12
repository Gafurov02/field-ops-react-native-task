import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LOCATION_PRESETS, STATUS_LABELS } from '../constants/config';
import { FormInput } from '../components/FormInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { Palette } from '../theme/colors';
import { FormErrors, validateTaskDraft } from '../utils/validation';
import { formatDate, formatTime } from '../utils/date';
import { Task, TaskAttachment, TaskDraft, TaskLocation, TaskStatus } from '../types/task';

const initialDue = () => new Date(Date.now() + 60 * 60 * 1000);

interface Props {
  task?: Task;
  colors: Palette;
  demoMode: boolean;
  onBack: () => void;
  onSave: (draft: TaskDraft) => Promise<void>;
}

export function TaskFormScreen({ task, colors, demoMode, onBack, onSave }: Props) {
  const original = useMemo(() => task ? {
    title: task.title,
    description: task.description,
    dueAt: new Date(task.dueAt),
    location: task.location,
    attachments: task.attachments,
    status: task.status,
  } : undefined, [task]);
  const [title, setTitle] = useState(original?.title ?? '');
  const [description, setDescription] = useState(original?.description ?? '');
  const [dueAt, setDueAt] = useState(original?.dueAt ?? initialDue);
  const [address, setAddress] = useState(original?.location.address ?? '');
  const [latitude, setLatitude] = useState(original?.location.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(original?.location.longitude?.toString() ?? '');
  const [attachments, setAttachments] = useState<TaskAttachment[]>(original?.attachments ?? []);
  const [status, setStatus] = useState<TaskStatus>(original?.status ?? 'new');
  const [errors, setErrors] = useState<FormErrors>({});
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const makeDraft = (): TaskDraft => ({
    title,
    description,
    dueAt,
    location: {
      address,
      latitude: latitude.trim() ? Number(latitude) : undefined,
      longitude: longitude.trim() ? Number(longitude) : undefined,
    },
    attachments,
    status,
  });

  const applyPreset = (location: TaskLocation) => {
    setAddress(location.address);
    setLatitude(location.latitude?.toString() ?? '');
    setLongitude(location.longitude?.toString() ?? '');
  };

  const onPickerChange = (_event: DateTimePickerEvent, selected?: Date) => {
    setPicker(null);
    if (!selected) return;
    const next = new Date(dueAt);
    if (picker === 'date') next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    if (picker === 'time') next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setDueAt(next);
  };

  const addImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow photo-library access to attach a site image. You can enable it later in device settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.75 });
    if (result.canceled) return;
    const image = result.assets[0];
    setAttachments((current) => [...current, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      uri: image.uri,
      name: image.fileName ?? `site-photo-${attachments.length + 1}.jpg`,
      mimeType: image.mimeType ?? 'image/jpeg',
      createdAt: new Date().toISOString(),
    }]);
  };

  const submit = async () => {
    const draft = makeDraft();
    const nextErrors = validateTaskDraft(draft, demoMode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setIsSaving(true);
    await onSave(draft);
    setIsSaving(false);
  };

  return <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={10}><Text style={[styles.back, { color: colors.primary }]}>‹ Back</Text></Pressable><Text style={[styles.topTitle, { color: colors.text }]}>{task ? 'Edit task' : 'New task'}</Text><View style={styles.spacer} /></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>{demoMode ? 'Demo reminders arrive after 45 seconds.' : 'A local reminder will be scheduled 30 minutes before the due time.'}</Text>
      <FormInput label="Task title *" value={title} onChangeText={setTitle} placeholder="e.g. Inspect generator" error={errors.title} colors={colors} returnKeyType="next" />
      <FormInput label="Description *" value={description} onChangeText={setDescription} placeholder="Describe the work to be done" error={errors.description} colors={colors} multiline />
      <Text style={[styles.label, { color: colors.text }]}>Due date and time *</Text>
      <View style={styles.dateRow}><Pressable accessibilityRole="button" onPress={() => setPicker('date')} style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: errors.dueAt ? colors.danger : colors.border }]}><Text style={[styles.dateText, { color: colors.text }]}>{formatDate(dueAt)}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setPicker('time')} style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: errors.dueAt ? colors.danger : colors.border }]}><Text style={[styles.dateText, { color: colors.text }]}>{formatTime(dueAt)}</Text></Pressable></View>
      {errors.dueAt ? <Text style={[styles.inlineError, { color: colors.danger }]}>{errors.dueAt}</Text> : null}
      {picker ? <DateTimePicker value={dueAt} mode={picker} display="default" onChange={onPickerChange} minimumDate={picker === 'date' ? new Date() : undefined} /> : null}
      <Text style={[styles.label, styles.locationTitle, { color: colors.text }]}>Work location *</Text>
      <Text style={[styles.help, { color: colors.textMuted }]}>Enter an address. Coordinates are optional, but add them or choose a preset to show a pin on the map.</Text>
      <View style={styles.presetRow}>{LOCATION_PRESETS.map((preset) => <Pressable accessibilityRole="button" key={preset.label} onPress={() => applyPreset(preset.location)} style={[styles.preset, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}><Text style={[styles.presetText, { color: colors.primary }]}>{preset.label}</Text></Pressable>)}</View>
      <FormInput label="Address *" value={address} onChangeText={setAddress} placeholder="Street, building, city" error={errors.location} colors={colors} />
      <View style={styles.coordinateRow}><View style={styles.coordinate}><FormInput label="Latitude" value={latitude} onChangeText={setLatitude} placeholder="41.31" keyboardType="decimal-pad" colors={colors} /></View><View style={styles.coordinate}><FormInput label="Longitude" value={longitude} onChangeText={setLongitude} placeholder="69.28" keyboardType="decimal-pad" colors={colors} /></View></View>
      {errors.coordinates ? <Text style={[styles.coordinateError, { color: colors.danger }]}>{errors.coordinates}</Text> : null}
      <Text style={[styles.label, styles.statusTitle, { color: colors.text }]}>Status</Text>
      <View style={styles.statusRow}>{(Object.keys(STATUS_LABELS) as TaskStatus[]).map((option) => <Pressable accessibilityRole="button" key={option} onPress={() => setStatus(option)} style={[styles.statusOption, { backgroundColor: status === option ? colors.primary : colors.surface, borderColor: status === option ? colors.primary : colors.border }]}><Text style={[styles.statusOptionText, { color: status === option ? '#FFFFFF' : colors.text }]}>{STATUS_LABELS[option]}</Text></Pressable>)}</View>
      <Text style={[styles.label, styles.attachmentTitle, { color: colors.text }]}>Site images</Text>
      <Text style={[styles.help, { color: colors.textMuted }]}>At least one image is supported. You can save without one if it is not needed for this task.</Text>
      <PrimaryButton label="Add image" onPress={() => void addImage()} colors={colors} variant="secondary" />
      {attachments.length ? <View style={styles.imageList}>{attachments.map((attachment) => <View key={attachment.id} style={[styles.attachmentRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><Image source={{ uri: attachment.uri }} style={styles.thumbnail} onError={() => undefined} /><View style={styles.attachmentInfo}><Text numberOfLines={1} style={[styles.attachmentName, { color: colors.text }]}>{attachment.name}</Text><Text style={[styles.attachmentType, { color: colors.textMuted }]}>{attachment.mimeType}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${attachment.name}`} onPress={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}><Text style={[styles.remove, { color: colors.danger }]}>Remove</Text></Pressable></View>)}</View> : <Text style={[styles.noImages, { color: colors.textMuted }]}>No site images attached.</Text>}
      <View style={styles.actions}><PrimaryButton label={task ? 'Save changes' : 'Create task'} onPress={() => void submit()} colors={colors} loading={isSaving} /><PrimaryButton label="Cancel" onPress={onBack} colors={colors} variant="ghost" style={styles.cancel} /></View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { minHeight: 58, paddingHorizontal: 18, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontWeight: '800' }, topTitle: { fontSize: 17, fontWeight: '900' }, spacer: { width: 48 },
  content: { padding: 18, paddingBottom: 44 }, intro: { fontSize: 13, lineHeight: 19, marginBottom: 19 },
  label: { fontSize: 14, fontWeight: '800', marginBottom: 7 }, help: { fontSize: 13, lineHeight: 19, marginTop: -1, marginBottom: 10 },
  dateRow: { flexDirection: 'row', gap: 10 }, dateButton: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 13, justifyContent: 'center' }, dateText: { fontSize: 15, fontWeight: '700' }, inlineError: { fontSize: 13, lineHeight: 18, marginTop: 6, marginBottom: 12 },
  locationTitle: { marginTop: 20 }, presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 }, preset: { borderWidth: 1, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 10 }, presetText: { fontSize: 12, fontWeight: '800' },
  coordinateRow: { flexDirection: 'row', gap: 10 }, coordinate: { flex: 1 }, coordinateError: { fontSize: 13, lineHeight: 18, marginTop: -10, marginBottom: 12 },
  statusTitle: { marginTop: 4 }, statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 21 }, statusOption: { borderWidth: 1, borderRadius: 99, paddingVertical: 8, paddingHorizontal: 11 }, statusOptionText: { fontSize: 12, fontWeight: '800' },
  attachmentTitle: { marginBottom: 4 }, imageList: { marginTop: 12, gap: 8 }, attachmentRow: { minHeight: 66, borderWidth: 1, borderRadius: 12, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 9 }, thumbnail: { height: 48, width: 48, borderRadius: 8, backgroundColor: '#DCE3EE' }, attachmentInfo: { flex: 1, minWidth: 0 }, attachmentName: { fontSize: 13, fontWeight: '800' }, attachmentType: { fontSize: 11, marginTop: 3 }, remove: { fontSize: 12, fontWeight: '800' }, noImages: { marginTop: 11, fontSize: 13 },
  actions: { marginTop: 26 }, cancel: { marginTop: 10 },
});
