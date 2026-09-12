# Field Ops - React Native Intern Task

Candidate code: **SA-RN-8K42**

Field Ops is a TypeScript React Native app for field technicians to create, plan, track, and review daily work tasks. It is designed to remain useful without a connection: all task data and activity history are stored on the device first, and a mock REST server receives queued changes when a connection is available.

## Delivered features

- Create and edit tasks with required title, description, due date/time, and manual address.
- Validate required fields and prevent a normal reminder from being created fewer than 30 minutes before due time.
- Select coordinates manually or apply a predefined location. Tasks with coordinates display as interactive pins on the map.
- Attach one or more images from the device library. Attachment metadata is persisted locally and a clear unavailable state is shown if a URI is missing or inaccessible.
- List, search, sort (date added, due date, status), inspect, edit, and delete tasks.
- Change task status between New, In Progress, Completed, and Cancelled. Completed and cancelled items stay visible until deletion.
- Keep a timestamped history for creation, edits, status updates, attachment changes, deletions, and sync outcomes. Each task also exposes its own history.
- Schedule local notifications 30 minutes before due time. The visible Settings toggle enables demo mode, which schedules the same flow after 45 seconds.
- Provide light and dark themes, empty states, feedback messages, labeled controls, and touch targets sized for a standard Android phone.
- Store tasks and logs with AsyncStorage and reflect Pending sync, Synced, or Sync failed states.
- Queue all changes offline and synchronize them with a local `json-server` mock REST endpoint when online. The documented conflict policy is last-write-wins.

## Technology and architecture

| Area | Choice | Reason |
| --- | --- | --- |
| Framework | Expo / React Native + TypeScript | Fast, installable Android-ready project with strongly typed models. |
| Local persistence | AsyncStorage | Simple durable store for offline tasks, history, theme, and demo setting. |
| State | `useTaskStore` hook | Keeps UI separate from persistence, notification, and sync services without adding unnecessary global-state dependencies. |
| Attachments | `expo-image-picker` | Provides native image-library access and stores attachment metadata alongside tasks. |
| Reminders | `expo-notifications` | Schedules local due-date and 45-second demo notifications, with permission handling. |
| Map | Offline coordinate canvas | Visualizes manually supplied coordinates as clickable relative-position pins, without a map API key or network dependency. |
| Connectivity | `@react-native-community/netinfo` | Detects reconnects so pending local changes can be synchronized. |
| Mock API | `json-server` | Meets the REST synchronization requirement without a production backend. |

Key folders:

```text
src/
  components/      Reusable controls and task cards
  constants/       Candidate code, reminder settings, location presets
  hooks/           Application state and orchestration
  screens/         Tasks, form, details, map, history, settings
  services/        Local notifications and REST synchronization
  storage/         AsyncStorage adapter
  theme/           Light/dark palette
  types/           Shared TypeScript models
  utils/           Validation and date formatting
mock/db.json       Sample json-server database
```

## Install and run

Prerequisites: Node.js 20+ and an Android device/emulator with Expo Go for development. Local notifications should be verified on a physical Android device or a release build.

```bash
npm install
npm run mock-server
```

In another terminal:

```bash
npm start
```

Then choose Android from Expo’s development menu.

The default mock API URL is `http://10.0.2.2:3001`, which is correct for a standard Android emulator. For an Android phone or iOS simulator, copy `.env.example` to `.env`, set `EXPO_PUBLIC_MOCK_API_URL` to the computer’s reachable LAN IP, and restart Expo:

```bash
EXPO_PUBLIC_MOCK_API_URL=http://192.168.1.10:3001 npm start
```

The phone and computer must be on the same network. When the mock server is stopped, task changes remain locally available and show a pending/failed sync state; restart it and tap **Sync now** in Settings (or reconnect) to retry.

## Test and type-check

```bash
npm run typecheck
npm test
```

The included unit test verifies the notification-safe due-date validation and the demo-mode exception.

## Build an installable Android APK

This repository includes `eas.json` with an internal-distribution APK profile. The build requires the submitter’s Expo account; no account credentials or signing keys are stored in this repository.

1. Install and sign in to EAS CLI: `npx eas-cli login`
2. Create or link the Expo project: `npx eas build:configure`
3. Build the installable artifact:

   ```bash
   npx eas build --platform android --profile preview
   ```

EAS returns an APK download URL. Install that APK on an Android phone and record the required 2-5 minute demonstration from the release build.

## Notification behaviour

Normal mode schedules a local notification exactly 30 minutes before the selected due date. To ensure a reliable schedule, the form rejects a due time fewer than 30 minutes away and explains why. If notification permission is declined, the task is still saved and a clear message explains how to enable it later.

For the required video demonstration, enable **Demo reminder mode** in Settings before creating or editing a task. That task will show the same reminder flow after 45 seconds, avoiding a 30-minute wait.

## Offline and conflict policy

Every create, edit, status change, and deletion is applied to AsyncStorage immediately. Tasks are marked `Pending sync`. When connectivity is restored, the app sends queued task records to `json-server`; successful records become `Synced`, while request errors become `Sync failed` and are visible in both the task and history log.

Conflict resolution is deliberately simple: **last write wins**. A newly synchronized local record replaces the task record with the same ID on the mock server. This is appropriate for the assignment’s single-device mock backend, but would need server revisioning for a production multi-user workflow.

## Known limitations and trade-offs

- The app accepts manual addresses and coordinates/presets; it intentionally does not perform paid online geocoding.
- The map is an offline coordinate canvas rather than a turn-by-turn navigation product. It visualizes relative task positions, supports clickable pins, and remains available without a map provider or network connection.
- Device photo URIs are persisted as attachment metadata. An image deleted from the device photo library may no longer be renderable; the details screen handles that case gracefully.
- The mock API is intentionally a local development server, not a production backend.

## Video demonstration checklist

Record a 2-5 minute unrestricted video that shows:

1. The app running from the APK/release build and the in-app candidate code **SA-RN-8K42**.
2. Form validation, then creation of a task with all required fields, a preset or manual coordinate, and an image.
3. List search/sorting, task details, a status change, and deletion flow.
4. Map pin selection and the History tab with timestamps.
5. Settings light/dark toggle and demo reminder mode; wait about 45 seconds for its notification.
6. Offline creation/editing followed by a visible pending sync and a successful mock-server sync.
7. A short walkthrough of `src/services/syncService.ts` or `src/hooks/useTaskStore.ts`.

## AI/tooling disclosure

An AI coding assistant (Codex) was used to help scaffold and implement this take-home project. The code structure, dependency choices, and verification steps are documented here so that each part can be explained and reviewed.
