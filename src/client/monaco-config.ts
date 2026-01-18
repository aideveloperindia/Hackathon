// Monaco Editor configuration to use local files instead of CDN
import { loader } from '@monaco-editor/react';

// Configure Monaco Editor to use local files
loader.config({ 
  paths: { 
    vs: '/node_modules/monaco-editor/min/vs' 
  } 
});

// Alternative: Use CDN but allow it in CSP
// loader.config({ 
//   paths: { 
//     vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' 
//   } 
// });
