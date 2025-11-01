// backend/services/chatbotService.js

const { ChatGroq } = require('@langchain/groq');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
// const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { OpenAIEmbeddings } = require('@langchain/openai');
// const { ConversationalRetrievalQAChain } = require('langchain/chains');
// const { BufferMemory } = require('langchain/memory');

/**
 * Career Advisor Chatbot powered by LangChain RAG
 * Provides context-aware guidance on resumes, skills, and career paths
 */
class ChatbotService {
  constructor() {
    // Use Groq for fast, free inference (or OpenAI for better quality)
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile', // ✅ Latest supported model
      temperature: 0.7, // Higher for conversational tone
      streaming: true // Enable streaming responses
    });

    this.embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small'
    });

    // Store active chat sessions (use Redis in production)
    this.sessions = new Map();
  }

  /**
   * Initialize a new chat session with user's context
   */
  async createChatSession(userId, context) {
    const { resumeText, jobDescription, skillGapAnalysis, learningRoadmap } = context;

    // Store context for this session
    const sessionContext = {
      resumeText: resumeText || '',
      jobDescription: jobDescription || '',
      skillGapAnalysis: skillGapAnalysis || {},
      learningRoadmap: learningRoadmap || {}
    };

    // Store session without vector store
    this.sessions.set(userId, {
      context: sessionContext,
      chatHistory: [],
      createdAt: new Date(),
      messageCount: 0
    });

    console.log(`Chat session created for user: ${userId}`);

    return {
      sessionId: userId,
      status: 'ready',
      contextLoaded: {
        resume: !!resumeText,
        jobDescription: !!jobDescription,
        skillAnalysis: !!skillGapAnalysis,
        roadmap: !!learningRoadmap
      }
    };
  }

  /**
   * Send a message and get streaming response
   */
  async sendMessage(userId, message, onStream) {
    const session = this.sessions.get(userId);

    if (!session) {
      throw new Error('Chat session not found. Please initialize first.');
    }

    try {
      const { context, chatHistory } = session;
      session.messageCount++;

      // Build context from session data
      const contextText = `
USER'S RESUME:
${context.resumeText?.substring(0, 1500) || 'Not provided'}

TARGET JOB DESCRIPTION:
${context.jobDescription?.substring(0, 1000) || 'Not provided'}

SKILL GAP ANALYSIS:
Match Percentage: ${context.skillGapAnalysis?.matchPercentage || 'N/A'}%
Missing Skills: ${context.skillGapAnalysis?.missingSkills?.map(s => s.skill || s).join(', ') || 'None'}
Matching Skills: ${context.skillGapAnalysis?.matchingSkills?.map(s => s.skill || s).join(', ') || 'None'}

LEARNING ROADMAP:
Timeline: ${context.learningRoadmap?.estimatedTimeToComplete || 'Not available'}
Readiness Score: ${context.learningRoadmap?.readinessScore || 'N/A'}%
`;

      // Build chat history
      const historyText = chatHistory.slice(-5).map(msg => 
        `${msg.role === 'user' ? 'USER' : 'ASSISTANT'}: ${msg.content}`
      ).join('\n');

      // Create prompt
      const prompt = PromptTemplate.fromTemplate(
        `You are an experienced career advisor and mentor helping a professional with their career development.

PERSONALITY:
- Supportive, encouraging, and professional
- Give specific, actionable advice
- Use examples when explaining
- Be honest but constructive with feedback

CAPABILITIES:
1. Resume feedback and optimization
2. Job description analysis and alignment
3. Skill gap assessment and learning strategies
4. Course recommendations and learning paths
5. Interview preparation tips
6. Career progression advice
7. Timeline estimation for skill development

CONTEXT:
{context}

CONVERSATION HISTORY:
{chat_history}

USER QUESTION: {question}

ANSWER (be conversational, helpful, and specific):`
      );

      const formattedPrompt = await prompt.format({
        context: contextText,
        chat_history: historyText || 'No previous messages',
        question: message
      });

      // Get streaming response
      let fullResponse = '';
      
      const stream = await this.llm.stream(formattedPrompt);
      
      for await (const chunk of stream) {
        const token = chunk.content || '';
        fullResponse += token;
        if (onStream) {
          onStream(token);
        }
      }

      // Save to chat history
      chatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: fullResponse }
      );

      return {
        answer: fullResponse,
        sources: [
          { type: 'resume', preview: 'User resume data' },
          { type: 'job_description', preview: 'Target job requirements' },
          { type: 'skill_analysis', preview: 'Skill gap analysis results' }
        ],
        conversationLength: session.messageCount
      };

    } catch (error) {
      console.error('Chatbot error:', error);
      throw new Error('Failed to generate response: ' + error.message);
    }
  }

  /**
   * Get suggested questions based on context
   */
  getSuggestedQuestions(context) {
    const suggestions = [
      "How can I improve my resume to match this job description?",
      "What are the most critical skills I'm missing?",
      "Can you create a 3-month learning plan for me?",
      "Which courses should I prioritize?",
      "How long will it take to become job-ready?"
    ];

    // Customize based on context
    if (context.skillGapAnalysis?.criticalMissingSkills?.length > 0) {
      suggestions.push(
        `How do I learn ${context.skillGapAnalysis.criticalMissingSkills[0]}?`
      );
    }

    if (context.learningRoadmap?.phases) {
      suggestions.push("Walk me through my learning roadmap step by step");
    }

    return suggestions.slice(0, 5); // Return top 5
  }

  /**
   * Clear a chat session
   */
  clearSession(userId) {
    this.sessions.delete(userId);
    console.log(`Chat session cleared for user: ${userId}`);
  }

  /**
   * Get session info
   */
  getSessionInfo(userId) {
    const session = this.sessions.get(userId);
    if (!session) return null;

    return {
      messageCount: session.messageCount,
      createdAt: session.createdAt,
      contextLoaded: {
        resume: !!session.context.resumeText,
        jobDescription: !!session.context.jobDescription,
        skillAnalysis: !!session.context.skillGapAnalysis,
        roadmap: !!session.context.learningRoadmap
      }
    };
  }
}

module.exports = new ChatbotService();
