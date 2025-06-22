import { pubsub } from "@/utils/pubsub";

export function unimplemented() {
  const { publish } = pubsub;
  return () =>
    publish("addAlertNotification", {
      type: "error",
      msg: "Elemento sin Implementar de momento",
    });
}

export async function copyClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Move textarea out of the viewport so it's not visible
    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }
  }
}
