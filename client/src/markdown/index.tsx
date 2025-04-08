import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { PluggableList } from 'unified';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import executeCode from '../services/compilerService';

/**
 * CodeBlock component that renders a code block
 */
interface CodeBlockProps {
  language: string;
  code: string;
}

/**
 * CodeBlock component that renders a code block with execution.
 * It allows users to run the code and copy it to the clipboard.
 *
 * @param language The programming language of the code block.
 * @param code The code to be executed and displayed.
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    try {
      const outputStr = await executeCode(code, language);

      setOutput(outputStr);
    } catch (error) {
      setOutput(`Error executing code. ${error}`);
      // eslint-disable-next-line no-console
      console.error(error); // Log the error to the console, ignore lint error
    }
    setIsRunning(false);
  };

  // Function to copy code to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 500); // reset the button after half a second
  };

  return (
    <div className='code-block'>
      <SyntaxHighlighter language={language} style={atomDark}>
        {code}
      </SyntaxHighlighter>
      <div className='code-block-buttons'>
        <button onClick={runCode} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        <button onClick={copyToClipboard}>{copySuccess ? 'Copied!' : 'Copy Code'}</button>
      </div>
      {output && (
        <div className='output'>
          <strong>Output:</strong>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

/**
 * MarkdownRenderer component that renders markdown text with custom components.
 * It supports code blocks and hyperlinks.
 *
 * @param text The markdown text to be rendered.
 */
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => (
  <ReactMarkdown
    remarkPlugins={[remarkBreaks, remarkGfm] as PluggableList}
    components={{
      div: ({ children, ...props }) => (
        <div className='markdown-container' {...props}>
          {children}
        </div>
      ),
      a: ({ href, children, ...props }) => {
        const isValidURL = /^https?:\/\/[\w.-]+\.[a-z]{2,}.*$/.test(href || '');
        return isValidURL ? (
          <a href={href} target='_blank' rel='noopener noreferrer' {...props}>
            {children}
          </a>
        ) : (
          <span style={{ color: 'red', fontWeight: 'bold' }} title='Invalid URL'>
            {children} (Invalid URL)
          </span>
        );
      },
      code({ node, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return match ? (
          <CodeBlock language={match[1]} code={String(children).trim()} />
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}>
    {text}
  </ReactMarkdown>
);

export default MarkdownRenderer;
