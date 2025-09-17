export const generatePromptByPackage = (
  packageType: string,
  userInput: string,
) => {
  const systemContentMap = {
    business: 'Business-level system content',
    student: 'Student-level system content',
    basic: 'Basic system content',
    free: 'Free system content',
  };

  const systemContent =
    systemContentMap[packageType] || 'Default system content';
  const userPrompt = `${capitalize(packageType)} Prompt: ${userInput}`;

  return { systemContent, userPrompt };
};

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);
