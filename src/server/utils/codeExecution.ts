import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir, rmdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

interface TestCase {
  input: string;
  expectedOutput: string;
  score: number;
}

interface ExecutionResult {
  verdict: string;
  score: number;
  passedTests: number;
  totalTests: number;
  executionDetails: Array<{
    testCase: number;
    passed: boolean;
    output?: string;
    error?: string;
  }>;
}

const TIME_LIMIT_SECONDS = 5;
const MEMORY_LIMIT_MB = 256;

export async function executeCode(
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<ExecutionResult> {
  const executionId = randomUUID();
  const workDir = join('/tmp', `code-exec-${executionId}`);
  
  try {
    // Create working directory
    await mkdir(workDir, { recursive: true });

    let passedTests = 0;
    let totalScore = 0;
    const executionDetails: ExecutionResult['executionDetails'] = [];

    // Write code to file
    const fileName = getFileName(language);
    const filePath = join(workDir, fileName);
    await writeFile(filePath, code, 'utf-8');

    // Compile if needed
    if (language === 'C' || language === 'Java') {
      await compileCode(language, filePath, workDir);
    }

    // Run each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = await runTestCase(language, filePath, workDir, testCase.input);
      
      const passed = normalizeOutput(result.output) === normalizeOutput(testCase.expectedOutput);
      
      if (passed) {
        passedTests++;
        totalScore += testCase.score;
      }

      executionDetails.push({
        testCase: i + 1,
        passed,
        output: result.output,
        error: result.error,
      });
    }

    // Determine verdict
    let verdict = 'WRONG_ANSWER';
    if (passedTests === testCases.length) {
      verdict = 'ACCEPTED';
    } else if (passedTests > 0) {
      verdict = 'PARTIAL';
    }

    return {
      verdict,
      score: totalScore,
      passedTests,
      totalTests: testCases.length,
      executionDetails,
    };
  } catch (error: any) {
    // Handle compilation or runtime errors
    if (error.message.includes('compilation') || error.message.includes('Compilation')) {
      return {
        verdict: 'COMPILATION_ERROR',
        score: 0,
        passedTests: 0,
        totalTests: testCases.length,
        executionDetails: [{
          testCase: 0,
          passed: false,
          error: error.message,
        }],
      };
    }

    if (error.message.includes('timeout') || error.message.includes('Time limit')) {
      return {
        verdict: 'TIME_LIMIT_EXCEEDED',
        score: 0,
        passedTests: 0,
        totalTests: testCases.length,
        executionDetails: [],
      };
    }

    return {
      verdict: 'RUNTIME_ERROR',
      score: 0,
      passedTests: 0,
      totalTests: testCases.length,
      executionDetails: [{
        testCase: 0,
        passed: false,
        error: error.message,
      }],
    };
  } finally {
    // Cleanup
    try {
      await rmdir(workDir, { recursive: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

function getFileName(language: string): string {
  switch (language.toLowerCase()) {
    case 'c':
      return 'main.c';
    case 'python':
      return 'main.py';
    case 'java':
      return 'Main.java';
    default:
      return 'main.txt';
  }
}

async function compileCode(language: string, filePath: string, workDir: string): Promise<void> {
  let command: string;
  
  if (language === 'C') {
    command = `gcc -o ${join(workDir, 'main')} ${filePath} 2>&1`;
  } else if (language === 'Java') {
    command = `javac ${filePath} 2>&1`;
  } else {
    throw new Error('Unsupported language for compilation');
  }

  const { stdout, stderr } = await execAsync(command, {
    timeout: TIME_LIMIT_SECONDS * 1000,
    cwd: workDir,
  });

  if (stderr && !stderr.includes('Note:') && !stderr.includes('warning')) {
    throw new Error(`Compilation error: ${stderr}`);
  }
}

async function runTestCase(
  language: string,
  filePath: string,
  workDir: string,
  input: string
): Promise<{ output: string; error?: string }> {
  let command: string;
  
  if (language === 'C') {
    command = `${join(workDir, 'main')}`;
  } else if (language === 'Python') {
    command = `python3 ${filePath}`;
  } else if (language === 'Java') {
    const className = 'Main';
    command = `java -cp ${workDir} ${className}`;
  } else {
    throw new Error('Unsupported language');
  }

  try {
    // Use spawn for input support instead of exec
    return new Promise<{ output: string; error?: string }>((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, {
        cwd: workDir,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        process.kill();
        reject(new Error('Time limit exceeded'));
      }, TIME_LIMIT_SECONDS * 1000);

      process.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve({
            output: stdout || '',
            error: stderr || undefined,
          });
        } else {
          reject(new Error(stderr || `Process exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      // Write input to stdin
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
    });
  } catch (error: any) {
    if (error.message === 'Time limit exceeded') {
      throw error;
    }
    throw new Error(error.message || 'Execution failed');
  }
}

function normalizeOutput(output: string): string {
  return output.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

