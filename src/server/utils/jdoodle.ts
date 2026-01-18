// JDoodle API integration for code execution
import axios from 'axios';

interface JDoodleRequest {
  script: string;
  language: string;
  versionIndex: number;
  stdin?: string;
}

interface JDoodleResponse {
  output: string;
  statusCode: number;
  memory?: number;
  cpuTime?: number;
  compilationStatus?: string;
}

// JDoodle API credentials - from environment variables
const JDoodleClientId = process.env.JDOODLE_CLIENT_ID || 'c20fe833cabe2f9317e5f992b1cc5aee';
const JDoodleClientSecret = process.env.JDOODLE_CLIENT_SECRET || 'f6da21c9933a24fd5fd7d7ed64d88edfaef8aa8a38d83a48ca14aabbbdf846ef';

// Language to JDoodle language code mapping
const languageMap: Record<string, { language: string; versionIndex: number }> = {
  'python': { language: 'python3', versionIndex: 4 },
  'c': { language: 'c', versionIndex: 5 },
  'java': { language: 'java', versionIndex: 4 },
  'cpp': { language: 'cpp17', versionIndex: 0 },
  'javascript': { language: 'nodejs', versionIndex: 4 },
};

export async function executeCodeWithJDoodle(
  code: string,
  language: string,
  input?: string
): Promise<JDoodleResponse> {
  if (!JDoodleClientId || !JDoodleClientSecret) {
    throw new Error('JDoodle API credentials not configured');
  }

  const langConfig = languageMap[language.toLowerCase()];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const requestData: JDoodleRequest = {
    script: code,
    language: langConfig.language,
    versionIndex: langConfig.versionIndex,
    stdin: input || '',
  };

  try {
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      ...requestData,
      clientId: JDoodleClientId,
      clientSecret: JDoodleClientSecret,
    });

    return {
      output: response.data.output || '',
      statusCode: response.data.statusCode || 200,
      memory: response.data.memory,
      cpuTime: response.data.cpuTime,
      compilationStatus: response.data.compileStatus,
    };
  } catch (error: any) {
    console.error('JDoodle API error:', error);
    throw new Error(`Code execution failed: ${error.message}`);
  }
}

export function normalizeOutput(output: string): string {
  return output.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
