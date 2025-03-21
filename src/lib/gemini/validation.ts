
/**
 * Utility functions for validating chat messages
 */

/**
 * Checks if a user query is allowed based on content relevance to water topics
 * 
 * @param query The user's input query
 * @returns boolean indicating if the query is on-topic
 */
export const isAllowedQuery = (query: string): boolean => {
  const basicConversation = [
    'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
    'how are you', 'how\'s it going', 'what\'s up', 'nice to meet you', 'thanks', 'thank you',
    'welcome', 'please', 'okay', 'help', 'bye', 'goodbye', 'see you'
  ];
  
  const waterKeywords = [
    'water', 'rainwater', 'rain', 'ph', 'acid', 'alkaline', 'quality',
    'treatment', 'filter', 'purif', 'clean', 'contamina', 'pollut',
    'drinking', 'irrigation', 'garden', 'plant', 'household', 'temperat',
    'sensor', 'reading', 'measure', 'system', 'collect', 'tank', 'barrel',
    'sustain', 'conserv', 'recycl', 'reuse', 'harvest', 'storage', 'runoff',
    'potable', 'non-potable', 'bacteria', 'pathogen', 'safe', 'health',
    'minerals', 'sediment', 'turbid', 'clarity', 'conductivity'
  ];
  
  const dataKeywords = [
    'data', 'database', 'reading', 'sensor', 'history', 'historical', 'trend',
    'average', 'mean', 'median', 'record', 'log', 'measurement', 'metric',
    'value', 'number', 'statistic', 'analytic', 'analysis', 'chart', 'graph',
    'plot', 'display', 'show', 'tell', 'what is', 'what are', 'how much',
    'how many', 'when', 'where', 'monitor', 'track', 'store', 'latest',
    'recent', 'current', 'past', 'previous', 'compare', 'comparison'
  ];
  
  const systemKeywords = [
    'system', 'ai-rams', 'rams', 'how it works', 'function', 'software', 'hardware',
    'time', 'date', 'updated', 'last update', 'refresh', 'version', 'software',
    'weather', 'predict', 'forecast', 'rain', 'precipitation', 'humidity'
  ];
  
  const queryLower = query.toLowerCase();
  
  const isBasicConversation = basicConversation.some(phrase => 
    queryLower.includes(phrase) || queryLower === phrase
  );
  
  const isWaterRelated = waterKeywords.some(keyword => 
    queryLower.includes(keyword)
  );
  
  const isDataRelated = dataKeywords.some(keyword => 
    queryLower.includes(keyword)
  );
  
  const isSystemRelated = systemKeywords.some(keyword => 
    queryLower.includes(keyword)
  );
  
  return isBasicConversation || isWaterRelated || isDataRelated || isSystemRelated;
};
