export interface Message {
  role: 'user' | 'assistant';
  content: string;
  communicationFunction: number; // 0 = functional/referential, 1 = social/phatic
  conversationStructure: number; // 0 = structured/prescribed, 1 = emergent/exploratory
}

export const SAMPLE_MESSAGES: Message[] = [
  { role: 'user', content: "Initiating dialogue sequence...", communicationFunction: 0.2, conversationStructure: 0.8 },
  { role: 'assistant', content: "Connection established. Analyzing topology.", communicationFunction: 0.15, conversationStructure: 0.3 },
  { role: 'user', content: "What patterns emerge from our exchanges?", communicationFunction: 0.4, conversationStructure: 0.7 },
  { role: 'assistant', content: "Detecting elevated communication in sectors 4-7.", communicationFunction: 0.6, conversationStructure: 0.2 },
  { role: 'user', content: "Can you map the resolution points?", communicationFunction: 0.5, conversationStructure: 0.6 },
  { role: 'assistant', content: "Affirmative. Low-elevation indicates consensus.", communicationFunction: 0.3, conversationStructure: 0.25 },
  { role: 'user', content: "Interesting. The terrain tells a story.", communicationFunction: 0.25, conversationStructure: 0.5 },
  { role: 'assistant', content: "Each contour represents a dynamic shift.", communicationFunction: 0.2, conversationStructure: 0.3 },
  { role: 'user', content: "Where do we go from here?", communicationFunction: 0.45, conversationStructure: 0.75 },
  { role: 'assistant', content: "Projecting optimal path through sectors.", communicationFunction: 0.35, conversationStructure: 0.2 },
  { role: 'user', content: "Execute.", communicationFunction: 0.3, conversationStructure: 0.9 },
  { role: 'assistant', content: "Acknowledged. Continuing analysis...", communicationFunction: 0.15, conversationStructure: 0.15 },
];

