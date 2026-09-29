import { createAudioPlayer, type AudioPlayer } from "expo-audio";

let yesPlayer: AudioPlayer | null = null;
let noPlayer: AudioPlayer | null = null;

function player(kind: "yes" | "no"): AudioPlayer {
  if (kind === "yes") {
    yesPlayer ??= createAudioPlayer(require("../../assets/sounds/yes.wav"));
    return yesPlayer;
  }
  noPlayer ??= createAudioPlayer(require("../../assets/sounds/no.wav"));
  return noPlayer;
}

export async function playCue(kind: "yes" | "no"): Promise<void> {
  try {
    const p = player(kind);
    await p.seekTo(0);
    p.play();
  } catch {
    // Sound is a bonus, never block the tap.
  }
}
