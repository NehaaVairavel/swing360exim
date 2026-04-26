/**
 * Utility to generate WhatsApp redirection URL with a pre-filled message.
 * @param productName - Optional name of the machine for context.
 * @param refNumber - Optional reference number of the machine.
 * @returns A formatted WhatsApp wa.me URL.
 */
export const getWhatsAppUrl = (productName, refNumber) => {
  const phoneNumber = "971558599045";
  let message = "Hello Swing360 Exim, I'm interested in your heavy equipment. Please share more details.";

  if (productName) {
    message = `Hello Swing360 Exim, I am interested in the ${productName}${refNumber ? ` (Ref: ${refNumber})` : ""}. Please share more details and technical specifications.`;
  }

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};
