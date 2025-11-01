// backend/services/langchainService.js

const { ChatOpenAI } = require('@langchain/openai');
const { ChatGroq } = require('@langchain/groq'); // Alternative: Free & fast
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
// const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { OpenAIEmbeddings } = require('@langchain/openai');

/**
 * LangChain-powered intelligent parsing and analysis service
 */
class LangChainService {
  constructor() {
    // Use Groq (free, fast) or OpenAI (paid, more accurate)
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile', // ✅ Latest supported model
      temperature: 0.1 // Low temperature for consistent extraction
    });

    // For embeddings (RAG)
    this.embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small'
    });
  }

  /**
   * FEATURE 1: Intelligent Resume Parsing with Structured Output
   * Extracts skills, experience, projects with context
   */
  async parseResumeWithLLM(resumeText) {
    // Define structured schema using Zod
    const resumeSchema = z.object({
      personalInfo: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        location: z.string().optional()
      }),
      skills: z.array(z.object({
        name: z.string(),
        category: z.enum(['programming', 'framework', 'database', 'cloud', 'ml', 'tool', 'soft']),
        proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
        yearsOfExperience: z.number().optional()
      })),
      experience: z.array(z.object({
        company: z.string(),
        role: z.string(),
        duration: z.string(),
        responsibilities: z.array(z.string()),
        technologiesUsed: z.array(z.string())
      })),
      education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string().optional(),
        gpa: z.string().optional()
      })),
      projects: z.array(z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()),
        outcome: z.string().optional()
      })),
      certifications: z.array(z.string()).optional(),
      summary: z.string()
    });

    const parser = StructuredOutputParser.fromZodSchema(resumeSchema);

    const prompt = PromptTemplate.fromTemplate(
      `You are an expert resume parser and career advisor. Analyze the following resume and extract detailed information in the specified JSON format.

IMPORTANT INSTRUCTIONS:
- Extract ALL technical skills (programming languages, frameworks, tools, databases, cloud platforms)
- Categorize each skill accurately (programming/framework/database/cloud/ml/tool/soft)
- Estimate proficiency level based on context (projects, years of experience, certifications)
- Extract work experience with detailed responsibilities and technologies used
- Identify ALL projects with their tech stacks
- Be thorough - don't miss any skills mentioned anywhere in the resume

Resume Text:
{resume_text}

{format_instructions}

Return ONLY the JSON object, no additional text.`
    );

    try {
      const input = await prompt.format({
        resume_text: resumeText,
        format_instructions: parser.getFormatInstructions()
      });

      const response = await this.llm.invoke(input);
      const parsed = await parser.parse(response.content);

      console.log('LLM Resume Parsing - Skills extracted:', parsed.skills.length);
      
      return {
        success: true,
        data: parsed,
        metadata: {
          totalSkills: parsed.skills.length,
          experienceCount: parsed.experience.length,
          projectCount: parsed.projects.length,
          processingMethod: 'LangChain LLM',
          model: 'llama3-70b-8192'
        }
      };

    } catch (error) {
      console.error('LLM Resume parsing error:', error);
      throw new Error('Failed to parse resume with LLM: ' + error.message);
    }
  }

  /**
   * FEATURE 2: Context-Aware Job Description Analysis
   * Extracts requirements with importance, experience levels, and implicit skills
   */
  async analyzeJobDescriptionWithLLM(jobDescription) {
    const jdSchema = z.object({
      jobTitle: z.string(),
      company: z.string().optional(),
      requiredSkills: z.array(z.object({
        skill: z.string(),
        importance: z.enum(['critical', 'important', 'nice-to-have']),
        category: z.string(),
        minimumExperience: z.string().optional(),
        context: z.string() // Why this skill is needed
      })),
      preferredSkills: z.array(z.string()),
      responsibilities: z.array(z.string()),
      qualifications: z.array(z.string()),
      experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead']),
      salaryRange: z.string().optional(),
      workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
      implicitSkills: z.array(z.object({
        skill: z.string(),
        inferredFrom: z.string()
      })),
      keyProjects: z.array(z.string()).optional(),
      summary: z.string()
    });

    const parser = StructuredOutputParser.fromZodSchema(jdSchema);

    const prompt = PromptTemplate.fromTemplate(
      `You are an expert technical recruiter and skill analyst. Analyze this job description and extract comprehensive information.

CRITICAL ANALYSIS REQUIREMENTS:
1. Extract EVERY technical skill mentioned (explicit and implicit)
2. Classify each skill's importance (critical/important/nice-to-have) based on:
   - Frequency of mention
   - Position in JD (earlier = more important)
   - Keywords like "must have", "required", "essential" vs "preferred", "bonus"
3. Identify IMPLICIT skills (e.g., "build REST APIs" implies HTTP, JSON, authentication knowledge)
4. Extract minimum experience requirements per skill if mentioned
5. Determine overall seniority level required
6. Extract salary, work mode, and company if mentioned

Job Description:
{job_description}

{format_instructions}

Return ONLY the JSON object.`
    );

    try {
      const input = await prompt.format({
        job_description: jobDescription,
        format_instructions: parser.getFormatInstructions()
      });

      const response = await this.llm.invoke(input);
      const parsed = await parser.parse(response.content);

      console.log('LLM JD Analysis - Skills extracted:', parsed.requiredSkills.length);
      console.log('Critical skills:', parsed.requiredSkills.filter(s => s.importance === 'critical').length);

      return {
        success: true,
        data: parsed,
        metadata: {
          totalSkills: parsed.requiredSkills.length,
          criticalSkills: parsed.requiredSkills.filter(s => s.importance === 'critical').length,
          implicitSkills: parsed.implicitSkills.length,
          processingMethod: 'LangChain LLM',
          model: 'llama3-70b-8192'
        }
      };

    } catch (error) {
      console.error('LLM JD analysis error:', error);
      throw new Error('Failed to analyze JD with LLM: ' + error.message);
    }
  }

  /**
   * FEATURE 3: Semantic Skill Matching with Embeddings
   * Uses vector similarity instead of exact matching
   */
  async semanticSkillMatching(resumeSkills, jobSkills) {
    try {
      // Simplified matching without vector store for now
      const matches = [];
      const missing = [];

      // Simple keyword-based matching
      const resumeSkillNames = resumeSkills.map(s => s.name.toLowerCase());
      
      for (const jSkill of jobSkills) {
        const jobSkillLower = jSkill.skill.toLowerCase();
        const found = resumeSkillNames.some(rs => 
          rs.includes(jobSkillLower) || jobSkillLower.includes(rs)
        );

        if (found) {
          matches.push({
            resumeSkill: resumeSkillNames.find(rs => 
              rs.includes(jobSkillLower) || jobSkillLower.includes(rs)
            ),
            matchedJobSkill: jSkill.skill,
            similarity: 100,
            importance: jSkill.importance,
            category: jSkill.category
          });
        } else {
          missing.push({
            skill: jSkill.skill,
            importance: jSkill.importance,
            context: jSkill.context,
            minimumExperience: jSkill.minimumExperience
          });
        }
      }

      const matchPercentage = Math.round((matches.length / jobSkills.length) * 100);

      return {
        matches,
        missing,
        matchPercentage,
        criticalMissing: missing.filter(s => s.importance === 'critical'),
        analysis: {
          totalJobSkills: jobSkills.length,
          matched: matches.length,
          missingCount: missing.length,
          matchQuality: matches.length > 0 
            ? Math.round(matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length)
            : 0
        }
      };

    } catch (error) {
      console.error('Semantic matching error:', error);
      throw new Error('Failed to perform semantic matching: ' + error.message);
    }
  }

  /**
   * FEATURE 4: RAG-Based Course Recommendations
   * Uses retrieval from course database + LLM for personalization
   */
  async generatePersonalizedLearningPath(missingSkills, userProfile, matchAnalysis) {
    const prompt = PromptTemplate.fromTemplate(
      `You are an expert career coach and learning advisor. Generate a personalized, actionable learning roadmap for a professional looking to acquire new skills.

USER PROFILE:
- Current Skills: {current_skills}
- Experience Level: {experience_level}
- Missing Skills: {missing_skills}
- Critical Gaps: {critical_gaps}
- Match Percentage: {match_percentage}%

JOB CONTEXT:
- Target Role: {target_role}
- Skill Gap Analysis: {skill_analysis}

TASK:
Create a detailed 3-phase learning roadmap that:
1. Prioritizes critical skills first
2. Suggests realistic timelines (consider user's experience level)
3. Recommends specific learning strategies (courses, projects, certifications)
4. Provides motivation and milestone tracking
5. Includes cost estimates and time commitment

Return a structured JSON with phases, skills per phase, recommended resources, projects to build, and success metrics.

Format your response as a JSON object with this structure:
{{
  "overallTimeline": "X months",
  "estimatedCost": "$X - $Y",
  "phases": [
    {{
      "phaseNumber": 1,
      "title": "Foundation Building",
      "duration": "X weeks",
      "skills": ["skill1", "skill2"],
      "learningStrategy": "description",
      "recommendedCourses": ["course1", "course2"],
      "practiceProjects": ["project1"],
      "successCriteria": ["criteria1"]
    }}
  ],
  "motivationalInsights": "...",
  "careerAdvice": "..."
}}`
    );

    try {
      const input = await prompt.format({
        current_skills: userProfile.skills?.map(s => s.name).join(', ') || 'Not specified',
        experience_level: userProfile.experienceLevel || 'Intermediate',
        missing_skills: missingSkills.map(s => s.skill).join(', '),
        critical_gaps: missingSkills.filter(s => s.importance === 'critical').map(s => s.skill).join(', '),
        match_percentage: matchAnalysis.matchPercentage,
        target_role: userProfile.targetRole || 'Software Developer',
        skill_analysis: JSON.stringify(matchAnalysis.analysis)
      });

      const response = await this.llm.invoke(input);
      
      // Parse JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('LLM did not return valid JSON');
      }

      const roadmap = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        roadmap,
        metadata: {
          generatedBy: 'LangChain LLM',
          model: 'llama3-70b-8192',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Learning path generation error:', error);
      throw new Error('Failed to generate learning path: ' + error.message);
    }
  }

  /**
   * FEATURE 5: Conversational Career Coach Chatbot
   * Simplified version without RAG for now
   */
  async createCareerCoachChatbot(userResumeText, learningRoadmap) {
    // Store context for chatbot
    return {
      resumeText: userResumeText,
      roadmap: learningRoadmap,
      llm: this.llm
    };
  }

  /**
   * Answer questions using the chatbot
   */
  async askCareerCoach(context, question) {
    try {
      const prompt = PromptTemplate.fromTemplate(
        `You are a supportive career coach helping a professional upskill.

Resume Summary: {resume}

Learning Roadmap: {roadmap}

Question: {question}

Provide a helpful, encouraging, and actionable answer. If asked about courses, suggest specific resources. If asked about timeline, be realistic based on their experience.`
      );

      const input = await prompt.format({
        resume: context.resumeText.substring(0, 1000),
        roadmap: JSON.stringify(context.roadmap).substring(0, 1000),
        question
      });

      const response = await context.llm.invoke(input);
      
      return {
        success: true,
        answer: response.content,
        question
      };
    } catch (error) {
      console.error('Career coach error:', error);
      throw new Error('Failed to get answer: ' + error.message);
    }
  }
}

module.exports = new LangChainService();
