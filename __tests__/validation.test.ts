import { TaskDraft } from '../src/types/task';
import { validateTaskDraft } from '../src/utils/validation';

const draft: TaskDraft = {
  title: 'Inspect generator',
  description: 'Check coolant level and safety seal.',
  dueAt: new Date(Date.now() + 60 * 60 * 1000),
  location: { address: 'Depot 4' },
  attachments: [],
  status: 'new',
};

describe('validateTaskDraft', () => {
  it('requires the reminder-safe 30 minute lead time outside demo mode', () => {
    const errors = validateTaskDraft({ ...draft, dueAt: new Date(Date.now() + 10 * 60 * 1000) }, false);
    expect(errors.dueAt).toContain('at least 30 minutes');
  });

  it('allows a near-term date in demo mode', () => {
    expect(validateTaskDraft({ ...draft, dueAt: new Date(Date.now() + 10 * 60 * 1000) }, true)).toEqual({});
  });
});
