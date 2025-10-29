// backend/services/resumeService.js

const { createWorker } = require('tesseract.js');
const pdf = require('pdf-parse');

/**
 * Unified Resume Service with Advanced Skill Extraction
 * Combines OCR, PDF parsing, and NLP-based skill extraction
 */
class ResumeService {
    // ========================================
    // PART 1: OCR & PDF PROCESSING
    // ========================================

    /**
     * Extract text from PDF buffer
     */
    async extractTextFromPDF(buffer) {
        try {
            const data = await pdf(buffer);
            return data.text;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Failed to process PDF file');
        }
    }

    /**
     * Perform OCR on images or PDFs with optimized settings
     */
    async performOCR(buffer, fileType) {
        try {
            if (fileType === 'application/pdf') {
                return await this.extractTextFromPDF(buffer);
            }

            // For images, use Tesseract OCR with improved settings
            const worker = await createWorker();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            
            // Configure Tesseract for better accuracy
            await worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,+-()/#@:;\'\"[]{}',
                tessedit_pageseg_mode: '1',  // Automatic page segmentation with OSD
                tessedit_ocr_engine_mode: '3', // Default, based on what is available
                preserve_interword_spaces: '1'
            });

            const { data: { text } } = await worker.recognize(buffer);
            await worker.terminate();
            return text;
        } catch (error) {
            console.error('Error in OCR processing:', error);
            throw new Error('Failed to process resume');
        }
    }

    // ========================================
    // PART 2: ENHANCED SKILL EXTRACTION
    // ========================================

    /**
     * Enhanced skill patterns with categories for comprehensive extraction
     */
    static SKILL_PATTERNS = {
        technical: {
            programming: /\b(python|java|javascript|typescript|c\+\+|c#|ruby|go|rust|scala|kotlin|php|swift|r|matlab)\b/gi,
            frameworks: /\b(react|angular|vue|django|flask|spring|express|fastapi|laravel|rails|nest\.?js|next\.?js|nuxt|svelte)\b/gi,
            databases: /\b(mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|cassandra|oracle|mariadb|sqlite|neo4j)\b/gi,
            cloud: /\b(aws|azure|gcp|google cloud|docker|kubernetes|terraform|jenkins|gitlab|github actions|circleci|travis)\b/gi,
            ml: /\b(tensorflow|pytorch|keras|scikit-learn|pandas|numpy|opencv|yolo|hugging face|langchain|transformers|bert|gpt)\b/gi,
            tools: /\b(git|jira|confluence|postman|swagger|linux|bash|powershell|vs code|jupyter|visual studio)\b/gi,
            web: /\b(html|css|sass|scss|less|bootstrap|tailwind|material-ui|jquery|webpack|babel|rest api|graphql)\b/gi,
            mobile: /\b(react native|flutter|ios|android|xamarin|kotlin|swift|cordova|ionic)\b/gi,
            devops: /\b(ci\/cd|devops|ansible|puppet|chef|nagios|prometheus|grafana|elk stack|kubernetes|helm)\b/gi,
            testing: /\b(jest|mocha|chai|pytest|junit|selenium|cypress|testing|unit testing|integration testing)\b/gi
        },
        soft: /\b(leadership|teamwork|communication|analytical|problem[- ]solving|agile|scrum|kanban|project management|time management|collaboration)\b/gi,
        experience: /(\d+\+?\s*(?:years?|yrs?))\s+(?:of\s+)?(?:experience\s+)?(?:in|with|using)?\s+([a-z0-9\s\+\#\.]+)/gi
    };

    /**
     * Extract skills from resume text with enhanced accuracy
     */
    extractSkills(text) {
        const skillsMap = new Map();
        
        // Step 1: Extract explicit technical skills using pattern matching
        this.extractExplicitSkills(text, skillsMap);
        
        // Step 2: Extract soft skills
        this.extractSoftSkills(text, skillsMap);
        
        // Step 3: Extract domain-specific skills
        this.extractDomainSkills(text, skillsMap);
        
        // Step 4: Normalize and deduplicate skills
        const normalizedSkills = this.normalizeSkills(skillsMap);
        
        return normalizedSkills;
    }

    /**
     * Extract explicit technical skills using regex patterns
     */
    extractExplicitSkills(text, skillsMap) {
        const lowerText = text.toLowerCase();
        
        // Extract from each technical category
        Object.entries(ResumeService.SKILL_PATTERNS.technical).forEach(([category, pattern]) => {
            const matches = lowerText.matchAll(pattern);
            for (const match of matches) {
                const skill = match[0].trim();
                if (!skillsMap.has(skill)) {
                    skillsMap.set(skill, {
                        category: category,
                        type: 'technical',
                        occurrences: 1
                    });
                } else {
                    skillsMap.get(skill).occurrences++;
                }
            }
        });
    }

    /**
     * Extract soft skills from text
     */
    extractSoftSkills(text, skillsMap) {
        const lowerText = text.toLowerCase();
        const softMatches = lowerText.matchAll(ResumeService.SKILL_PATTERNS.soft);
        
        for (const match of softMatches) {
            const skill = match[0].trim();
            if (!skillsMap.has(skill)) {
                skillsMap.set(skill, {
                    category: 'soft',
                    type: 'soft',
                    occurrences: 1
                });
            } else {
                skillsMap.get(skill).occurrences++;
            }
        }
    }

    /**
     * Extract domain-specific skills (ML, Data Science, etc.)
     */
    extractDomainSkills(text, skillsMap) {
        const domainKeywords = {
            'machine learning': ['ml', 'supervised learning', 'unsupervised learning', 'reinforcement learning'],
            'deep learning': ['neural networks', 'cnn', 'rnn', 'lstm', 'gru', 'transformer'],
            'natural language processing': ['nlp', 'text mining', 'sentiment analysis', 'named entity recognition'],
            'computer vision': ['cv', 'image processing', 'object detection', 'image classification', 'segmentation'],
            'data science': ['data analysis', 'data visualization', 'statistical analysis', 'predictive modeling'],
            'data engineering': ['etl', 'data pipeline', 'data warehouse', 'data lake', 'apache spark', 'airflow'],
            'web development': ['full stack', 'frontend', 'backend', 'responsive design', 'spa'],
            'blockchain': ['smart contracts', 'solidity', 'ethereum', 'web3', 'cryptocurrency']
        };

        const lowerText = text.toLowerCase();
        
        Object.entries(domainKeywords).forEach(([domain, keywords]) => {
            keywords.forEach(keyword => {
                if (lowerText.includes(keyword)) {
                    if (!skillsMap.has(keyword)) {
                        skillsMap.set(keyword, {
                            category: 'domain',
                            type: 'technical',
                            domain: domain,
                            occurrences: 1
                        });
                    }
                }
            });
        });
    }

    /**
     * Normalize and clean extracted skills
     */
    normalizeSkills(skillsMap) {
        const normalized = [];
        const seen = new Set();

        skillsMap.forEach((data, skill) => {
            const normalizedSkill = this.normalizeSkillName(skill);
            
            // Skip duplicates and very short skills (likely noise)
            if (!seen.has(normalizedSkill) && normalizedSkill.length > 1) {
                seen.add(normalizedSkill);
                normalized.push({
                    skill: normalizedSkill,
                    originalForm: skill,
                    ...data
                });
            }
        });

        // Sort by occurrences (most frequent first)
        return normalized
            .sort((a, b) => b.occurrences - a.occurrences)
            .map(s => s.skill);
    }

    /**
     * Normalize skill name (handle variations)
     */
    normalizeSkillName(skill) {
        const variations = {
            'node.js': 'nodejs',
            'node': 'nodejs',
            'react.js': 'reactjs',
            'vue.js': 'vue',
            'next.js': 'nextjs',
            'nest.js': 'nestjs',
            'c++': 'cpp',
            'c#': 'csharp'
        };

        const lower = skill.toLowerCase().trim();
        return variations[lower] || lower;
    }

    // ========================================
    // PART 3: JOB DESCRIPTION SKILL EXTRACTION
    // ========================================

    /**
     * Extract skills from job description with context
     */
    extractFromJobDescription(jobDescription) {
        const skills = new Map();
        
        // Step 1: Extract explicit skills using patterns
        this.extractExplicitSkillsFromJD(jobDescription, skills);
        
        // Step 2: Extract implicit skills from sentences
        this.extractImplicitSkills(jobDescription, skills);
        
        // Step 3: Extract experience requirements
        const experienceMap = this.extractExperienceRequirements(jobDescription);
        
        // Step 4: Build skill context objects
        const enrichedSkills = this.buildSkillContext(skills, experienceMap, jobDescription);
        
        return {
            skills: Array.from(enrichedSkills.keys()),
            detailedSkills: enrichedSkills,
            experienceMap
        };
    }

    /**
     * Extract explicit skills from job description
     */
    extractExplicitSkillsFromJD(text, skillsMap) {
        const lowerText = text.toLowerCase();
        
        // Extract from each category
        Object.entries(ResumeService.SKILL_PATTERNS.technical).forEach(([category, pattern]) => {
            const matches = lowerText.matchAll(pattern);
            for (const match of matches) {
                const skill = match[0].trim();
                if (!skillsMap.has(skill)) {
                    skillsMap.set(skill, {
                        category,
                        contexts: [],
                        importance: this.calculateImportance(skill, text)
                    });
                }
            }
        });
        
        // Extract soft skills
        const softMatches = lowerText.matchAll(ResumeService.SKILL_PATTERNS.soft);
        for (const match of softMatches) {
            const skill = match[0].trim();
            if (!skillsMap.has(skill)) {
                skillsMap.set(skill, {
                    category: 'soft',
                    contexts: [],
                    importance: 'medium'
                });
            }
        }
    }

    /**
     * Extract implicit skills from job description phrases
     */
    extractImplicitSkills(text, skillsMap) {
        const implicitMappings = {
            'rest api': ['http', 'json', 'api design', 'postman'],
            'restful': ['rest api', 'http', 'json'],
            'microservices': ['docker', 'kubernetes', 'api gateway', 'messaging'],
            'machine learning': ['python', 'scikit-learn', 'pandas', 'numpy'],
            'deep learning': ['tensorflow', 'pytorch', 'neural networks'],
            'web development': ['html', 'css', 'javascript'],
            'backend': ['sql', 'api', 'server'],
            'backend development': ['nodejs', 'python', 'java', 'sql'],
            'frontend': ['react', 'vue', 'angular', 'html', 'css'],
            'frontend development': ['react', 'javascript', 'html', 'css'],
            'full stack': ['frontend', 'backend', 'database', 'api'],
            'devops': ['ci/cd', 'docker', 'kubernetes', 'jenkins'],
            'data science': ['python', 'pandas', 'matplotlib', 'statistics'],
            'data analysis': ['sql', 'python', 'excel', 'statistics'],
            'cloud computing': ['aws', 'azure', 'gcp'],
            'mobile development': ['react native', 'flutter', 'ios', 'android']
        };

        const lowerText = text.toLowerCase();
        
        Object.entries(implicitMappings).forEach(([phrase, impliedSkills]) => {
            if (lowerText.includes(phrase)) {
                impliedSkills.forEach(skill => {
                    if (!skillsMap.has(skill)) {
                        skillsMap.set(skill, {
                            category: 'implicit',
                            inferredFrom: phrase,
                            contexts: [],
                            importance: 'low'
                        });
                    }
                });
            }
        });
    }

    /**
     * Extract experience requirements from job description
     */
    extractExperienceRequirements(text) {
        const experienceMap = new Map();
        const matches = text.matchAll(ResumeService.SKILL_PATTERNS.experience);
        
        for (const match of matches) {
            const years = match[1].trim();
            const skill = match[2].trim().toLowerCase();
            experienceMap.set(skill, years);
        }
        
        return experienceMap;
    }

    /**
     * Calculate importance of a skill based on frequency and context
     */
    calculateImportance(skill, fullText) {
        const lowerText = fullText.toLowerCase();
        const occurrences = (lowerText.match(new RegExp(`\\b${skill}\\b`, 'g')) || []).length;
        
        // Check if skill appears in important sections
        const inRequirements = new RegExp(`(?:required|must have|essential)[\\s\\S]{0,200}\\b${skill}\\b`, 'i').test(fullText);
        const inPreferred = new RegExp(`(?:preferred|nice to have|bonus)[\\s\\S]{0,200}\\b${skill}\\b`, 'i').test(fullText);
        
        if (inRequirements || occurrences >= 3) return 'high';
        if (inPreferred || occurrences === 2) return 'medium';
        return 'low';
    }

    /**
     * Build enriched skill context objects
     */
    buildSkillContext(skillsMap, experienceMap, fullText) {
        const enrichedSkills = new Map();
        
        skillsMap.forEach((data, skill) => {
            enrichedSkills.set(skill, {
                ...data,
                experienceRequired: experienceMap.get(skill) || 'not specified',
                priority: data.importance === 'high' ? 1 : data.importance === 'medium' ? 2 : 3
            });
        });
        
        return enrichedSkills;
    }

    // ========================================
    // PART 4: MAIN INTERFACE METHODS
    // ========================================

    /**
     * Parse resume and extract structured data
     */
    parseResume(text) {
        return {
            skills: this.extractSkills(text),
            rawText: text
        };
    }

    /**
     * Parse job description and extract skills with context
     */
    parseJobDescription(jobDescription) {
        const extraction = this.extractFromJobDescription(jobDescription);
        
        return {
            skills: extraction.skills,
            detailedSkills: Object.fromEntries(extraction.detailedSkills),
            experienceRequirements: Object.fromEntries(extraction.experienceMap),
            totalSkillsFound: extraction.skills.length
        };
    }
}

module.exports = new ResumeService();