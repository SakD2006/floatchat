"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageFormatterProps {
  content: string;
  isUser?: boolean;
}

export default function MessageFormatter({
  content,
  isUser = false,
}: MessageFormatterProps) {
  return (
    <div
      className={`prose prose-sm sm:prose-base max-w-none ${
        isUser ? "prose-invert" : "prose-neutral"
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom code block component
          code({
            className,
            children,
            ...props
          }: React.HTMLProps<HTMLElement>) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !className?.includes("language-");

            if (!isInline && language) {
              return (
                <div className="my-4 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 text-gray-200 px-4 py-2 text-xs font-mono border-b border-gray-700">
                    {language}
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      fontSize: "0.8125rem", // Balanced size for mobile and desktop
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // Inline code
            return (
              <code
                className={`
                  px-1.5 py-0.5 rounded text-xs font-mono
                  ${
                    isUser
                      ? "bg-blue-600/30 text-blue-100"
                      : "bg-gray-700/50 text-gray-200"
                  }
                `}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Custom paragraph styling
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
          },

          // Custom heading styling
          h1({ children }) {
            return (
              <h1 className="text-lg font-semibold mb-2 mt-4 first:mt-0">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-sm font-semibold mb-2 mt-3 first:mt-0">
                {children}
              </h3>
            );
          },

          // Custom list styling
          ul({ children }) {
            return (
              <ul className="ml-4 mb-2 list-disc space-y-1">{children}</ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="ml-4 mb-2 list-decimal space-y-1">{children}</ol>
            );
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },

          // Custom blockquote styling
          blockquote({ children }) {
            return (
              <blockquote
                className={`
                pl-4 py-2 my-2 border-l-4 italic
                ${
                  isUser
                    ? "border-blue-300 bg-blue-500/10"
                    : "border-gray-400 bg-gray-700/20"
                }
              `}
              >
                {children}
              </blockquote>
            );
          },

          // Custom table styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border-collapse border border-gray-600 text-xs">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th
                className={`
                border border-gray-600 px-2 py-1 font-semibold text-left
                ${isUser ? "bg-blue-600/20" : "bg-gray-700/30"}
              `}
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-gray-600 px-2 py-1">{children}</td>
            );
          },

          // Custom link styling
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  underline hover:no-underline transition-colors
                  ${
                    isUser
                      ? "text-blue-200 hover:text-blue-100"
                      : "text-blue-400 hover:text-blue-300"
                  }
                `}
              >
                {children}
              </a>
            );
          },

          // Custom horizontal rule
          hr() {
            return (
              <hr
                className={`
                my-4 border-0 h-px
                ${isUser ? "bg-blue-300/30" : "bg-gray-600/50"}
              `}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
