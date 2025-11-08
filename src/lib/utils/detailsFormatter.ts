/**
 * Formats change details string into a bulleted list by splitting on periods,
 * while protecting emails, coordinates, and decimal numbers.
 *
 * This mimics the behavior of the old PHP implementation.
 */
export function formatDetailsAsList(details: string | null | undefined): string[] {
  if (!details) return [];

  let formattedDetails = details;

  // Remove common unwanted phrases
  formattedDetails = formattedDetails.replace(/\. root_server_uri was added as "https:" /g, ' ');

  // Remove empty email_contact changes
  formattedDetails = formattedDetails.replace(/email_contact was changed from "" to ""/g, '');

  // Remove the weird #@-@# from custom fields
  formattedDetails = formattedDetails.replace(/#@-@#/g, ' ');

  // Protect URLs by replacing . with ~DOT~
  formattedDetails = formattedDetails.replace(/(https?:\/\/[^\s"]+)/g, (url) => url.replace(/\./g, '~DOT~'));

  // Protect email addresses by replacing . with ~DOT~
  formattedDetails = formattedDetails.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g, (email) => email.replace(/\./g, '~DOT~'));

  // Protect latitude/longitude coordinates and decimal numbers
  // Pattern: from "123. or from "-123. or to "123. or to "-123.
  formattedDetails = formattedDetails.replace(/(from|to) "(-?[0-9]+)\./g, (match) => match.replace(/\./g, '~DOT~'));

  // Protect periods within quoted strings (e.g., from "text." or to "text.")
  // This prevents splitting on periods that are part of the actual value being changed
  formattedDetails = formattedDetails.replace(/"([^"]*\.[^"]*)"/g, (match) => match.replace(/\./g, '~DOT~'));

  // Split on periods (which will create our list items)
  const items = formattedDetails
    .split('.')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      // Restore the protected dots
      return item.replace(/~DOT~/g, '.');
    });

  return items;
}
