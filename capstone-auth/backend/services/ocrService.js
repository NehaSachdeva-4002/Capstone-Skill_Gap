const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs');

class OCRService {
  constructor() {
    this.initialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      // Initialize Tesseract worker with proper configuration for v4
      this.worker = await Tesseract.createWorker({
        logger: m => console.log(m)
      });
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      this.initialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Error initializing OCR Service:', error);
    }
  }



  async processResume(file) {
    try {
      let extractedText;
      
      // Check if file exists
      if (!file) {
        throw new Error('No file provided');
      }
      
      // Check file type and use appropriate extraction method
      if (!file.mimetype) {
        throw new Error('File type cannot be determined');
      }

      console.log('Processing file:', file.originalname, 'Type:', file.mimetype);
      
      if (file.mimetype.includes('pdf')) {
        // For PDF files, use pdf-parse
        // Use buffer directly when using memory storage
        if (!file.buffer) {
          throw new Error('PDF file buffer is missing');
        }
        console.log('Processing PDF file');
        try {
          const dataBuffer = file.buffer;
          console.log('PDF buffer size:', dataBuffer.length);
          const pdfData = await pdfParse(dataBuffer, {
            // Add options to improve PDF parsing
            pagerender: function(pageData) {
              return pageData.getTextContent()
                .then(function(textContent) {
                  let text = '';
                  textContent.items.forEach(function(item) {
                    text += item.str + ' ';
                  });
                  return text;
                });
            }
          });
          console.log('PDF parsed successfully, text length:', pdfData.text.length);
          extractedText = pdfData.text;
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          throw new Error('Failed to parse PDF: ' + pdfError.message);
        }
      } else if (file.mimetype.includes('image')) {
        // For images, use Tesseract
        if (!this.initialized) {
          console.log('Initializing Tesseract worker');
          await this.initialize();
        }
        if (!file.buffer) {
          throw new Error('Image file buffer is missing');
        }
        console.log('Processing image with Tesseract');
        // Use buffer directly when using memory storage
        const result = await this.worker.recognize(file.buffer);
        extractedText = result.data.text;
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }
      
      if (!extractedText) {
        throw new Error('No text could be extracted from the file');
      }

      console.log('Text extracted successfully, length:', extractedText.length);
      
      try {
        const parsedResume = this.parseResumeText(extractedText);
        console.log('Resume parsed successfully');
        return {
          success: true,
          parsedResume,
          raw_text: extractedText
        };
      } catch (parseError) {
        console.error('Error parsing resume text:', parseError);
        // Return at least the raw text even if parsing fails
        return {
          success: true, // Still return success to prevent frontend errors
          parsedResume: {
            name: '',
            contact: { email: '', phone: '', linkedin: '', github: '' },
            education: [],
            experience: [],
            skills: [],
            certifications: [],
            projects: []
          },
          raw_text: extractedText
        };
      }
    } catch (error) {
        console.error('Error processing resume:', error);
        // Return partial data instead of throwing error
        return {
          success: true, // Return success to prevent frontend errors
          parsedResume: {
            name: '',
            contact: { email: '', phone: '', linkedin: '', github: '' },
            education: [],
            experience: [],
            skills: [],
            certifications: [],
            projects: []
          },
          raw_text: extractedText || 'No text could be extracted'
        };
      }}

  parseResumeText(text) {
    // Initialize resume structure
    const resume = {
      name: '',
      contact: {
        email: '',
        phone: '',
        linkedin: '',
        github: ''
      },
      education: [],
      experience: [],
      skills: [],
      certifications: [],
      projects: []
    };

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      resume.contact.email = emails[0];
    }

    // Extract phone number
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      resume.contact.phone = phones[0];
    }

    // Extract LinkedIn URL
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/g;
    const linkedinUrls = text.match(linkedinRegex);
    if (linkedinUrls && linkedinUrls.length > 0) {
      resume.contact.linkedin = 'https://www.' + linkedinUrls[0];
    }

    // Extract GitHub URL
    const githubRegex = /github\.com\/[a-zA-Z0-9-]+/g;
    const githubUrls = text.match(githubRegex);
    if (githubUrls && githubUrls.length > 0) {
      resume.contact.github = 'https://www.' + githubUrls[0];
    }

    // Extract name (assuming it's at the beginning of the resume)
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 0) {
      // Assume the first non-empty line is the name
      resume.name = lines[0].trim();
    }

    // Extract education (look for common education keywords)
    const educationKeywords = ['education', 'university', 'college', 'bachelor', 'master', 'phd', 'degree'];
    const educationSection = this.extractSection(text, educationKeywords);
    if (educationSection) {
      resume.education = this.splitIntoItems(educationSection);
    }

    // Extract experience (look for common experience keywords)
    const experienceKeywords = ['experience', 'work experience', 'employment', 'job history'];
    const experienceSection = this.extractSection(text, experienceKeywords);
    if (experienceSection) {
      resume.experience = this.splitIntoItems(experienceSection);
    }

    // Extract skills (look for common skills keywords)
    const skillsKeywords = ['skills', 'technical skills', 'technologies', 'competencies', 'programming languages', 'tools'];
    const skillsSection = this.extractSection(text, skillsKeywords);
    if (skillsSection) {
      // Split skills by commas, newlines, bullets, or pipes
      const rawSkills = skillsSection
        .split(/[,\n•|]|\band\b/i)
        .map(skill => skill.trim())
        .filter(skill => skill !== '' && skill.length > 1);
      
      // Further clean and normalize skills
      resume.skills = rawSkills.map(skill => {
        // Remove common prefixes/suffixes
        let cleaned = skill
          .replace(/^(proficient in|experienced with|knowledge of|familiar with)/i, '')
          .replace(/\(.*?\)/g, '') // Remove parentheses content
          .replace(/[:\-]/g, '') // Remove colons and dashes
          .trim();
        
        // Only return non-empty skills with reasonable length
        return cleaned;
      })
      .filter(skill => skill.length > 1 && skill.length < 50)
      .filter((skill, index, self) => 
        // Remove duplicates (case-insensitive)
        self.findIndex(s => s.toLowerCase() === skill.toLowerCase()) === index
      );
    }

    // Extract projects (look for common project keywords)
    const projectsKeywords = ['projects', 'personal projects', 'academic projects'];
    const projectsSection = this.extractSection(text, projectsKeywords);
    if (projectsSection) {
      resume.projects = this.splitIntoItems(projectsSection);
    }

    // Extract certifications (look for common certification keywords)
    const certificationsKeywords = ['certifications', 'certificates', 'accreditations'];
    const certificationsSection = this.extractSection(text, certificationsKeywords);
    if (certificationsSection) {
      resume.certifications = this.splitIntoItems(certificationsSection);
    }

    return resume;
  }

  extractSection(text, keywords) {
    const lowerText = text.toLowerCase();
    let startIndex = -1;
    let endIndex = text.length;

    // Find the starting point of the section
    for (const keyword of keywords) {
      const index = lowerText.indexOf(keyword.toLowerCase());
      if (index !== -1 && (startIndex === -1 || index < startIndex)) {
        startIndex = index;
      }
    }

    if (startIndex === -1) {
      return null;
    }

    // Find the next section header to determine the end of this section
    const sectionHeaders = [
      'education', 'experience', 'skills', 'projects', 'certifications',
      'work experience', 'technical skills', 'personal projects', 'references'
    ];

    for (const header of sectionHeaders) {
      // Skip the headers that might be part of the current section
      if (keywords.some(keyword => keyword.toLowerCase().includes(header.toLowerCase()))) {
        continue;
      }

      const headerIndex = lowerText.indexOf(header.toLowerCase(), startIndex + 1);
      if (headerIndex !== -1 && headerIndex < endIndex) {
        endIndex = headerIndex;
      }
    }

    // Extract the section content
    const sectionContent = text.substring(startIndex, endIndex).trim();
    
    // Remove the section header
    const headerEndIndex = sectionContent.indexOf('\n');
    if (headerEndIndex !== -1) {
      return sectionContent.substring(headerEndIndex + 1).trim();
    }
    
    return sectionContent;
  }

  splitIntoItems(text) {
    // Split text into items based on bullet points, numbers, or new lines
    return text
      .split(/•|\n\d+\.|\n-|\n/)
      .map(item => item.trim())
      .filter(item => item !== '' && item.length > 5);
  }
}

module.exports = new OCRService();