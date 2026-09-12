import { TaskDraft } from '../types/task';
import { isDueAtLeastThirtyMinutesAway } from './date';

export type FormErrors = Partial<Record<'title' | 'description' | 'dueAt' | 'location' | 'coordinates', string>>;

export const validateTaskDraft = (draft: TaskDraft, isDemoMode: boolean): FormErrors => {
  const errors: FormErrors = {};
  if (!draft.title.trim()) errors.title = 'Enter a task title.';
  if (!draft.description.trim()) errors.description = 'Enter a task description.';
  if (Number.isNaN(draft.dueAt.getTime())) errors.dueAt = 'Select a valid due date and time.';
  else if (!isDemoMode && !isDueAtLeastThirtyMinutesAway(draft.dueAt)) {
    errors.dueAt = 'Choose a due time at least 30 minutes from now. This allows the reminder to be scheduled.';
  }
  if (!draft.location.address.trim()) errors.location = 'Enter the work address.';
  const { latitude, longitude } = draft.location;
  if ((latitude === undefined) !== (longitude === undefined)) {
    errors.coordinates = 'Enter both latitude and longitude, or leave both blank.';
  } else if (latitude !== undefined && (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude! < -180 || longitude! > 180)) {
    errors.coordinates = 'Coordinates are outside the valid range.';
  }
  return errors;
};
