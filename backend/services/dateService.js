
export const checkDocumentDate = (documentDate) => {
  if (!documentDate) {
    return {
      status: "manual_review",
      message: "Document date could not be identified."
    };
  }

  const parsedDate = new Date(documentDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      status: "manual_review",
      message: "Invalid document date."
    };
  }

  const today = new Date();

  // Remove the time component
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  // Future dates should not be automatically accepted
  if (parsedDate > today) {
    return {
      status: "manual_review",
      message: "Document date is in the future."
    };
  }

  // Calculate the date three months ago
  const cutoffDate = new Date(today);
  const originalDay = cutoffDate.getDate();

  cutoffDate.setDate(1);
  cutoffDate.setMonth(cutoffDate.getMonth() - 3);

  // Handle months with fewer days
  const lastDay = new Date(
    cutoffDate.getFullYear(),
    cutoffDate.getMonth() + 1,
    0
  ).getDate();

  cutoffDate.setDate(Math.min(originalDay, lastDay));

  if (parsedDate >= cutoffDate) {
    return {
      status: "passed",
      message: "Document is within the last three months."
    };
  }

  return {
    status: "rejected",
    message: "Document is older than three months."
  };
};
