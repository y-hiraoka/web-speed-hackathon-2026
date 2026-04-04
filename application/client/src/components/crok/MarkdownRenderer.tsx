import { useEffect } from "react";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import katexCssUrl from "katex/dist/katex.min.css?url";

import { CodeBlock } from "@web-speed-hackathon-2026/client/src/components/crok/CodeBlock";

interface Props {
  content: string;
}

const MarkdownRenderer = ({ content }: Props) => {
  // Load katex CSS dynamically to avoid blocking initial page load
  useEffect(() => {
    const id = "katex-css";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = katexCssUrl;
      document.head.appendChild(link);
    }
  }, []);
  return (
    <Markdown
      components={{ pre: CodeBlock }}
      key={content}
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkMath, remarkGfm]}
    >
      {content}
    </Markdown>
  );
};

export default MarkdownRenderer;
