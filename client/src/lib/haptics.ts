import * as Haptics from "expo-haptics";

export async function hapticYes(first: boolean): Promise<void> {
  try {
    if (first) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // no haptics on this device
  }
}

export async function hapticPick(): Promise<void> {
  try {
    await Haptics.selectionAsync();
  } catch {
    // no haptics on this device
  }
}

export async function hapticNo(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // no haptics on this device
  }
}
