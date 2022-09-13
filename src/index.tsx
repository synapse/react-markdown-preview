import React, { useImperativeHandle } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import { PluggableList } from 'unified';
import gfm from 'remark-gfm';
import slug from 'rehype-slug';
import headings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeAttrs from 'rehype-attr';
import rehypeIgnore from 'rehype-ignore';
import rehypePrism from 'rehype-prism-plus';
import { RehypeRewriteOptions } from 'rehype-rewrite';

import { reservedMeta } from './plugins/reservedMeta';

export interface MarkdownPreviewProps extends Omit<Options, 'children'> {
  prefixCls?: string;
  className?: string;
  source?: string;
  style?: React.CSSProperties;
  pluginsFilter?: (type: 'rehype' | 'remark', plugin: PluggableList) => PluggableList;
  warpperElement?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    'data-color-mode'?: 'light' | 'dark';
  };
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onMouseOver?: (e: React.MouseEvent<HTMLDivElement>) => void;
  rehypeRewrite?: RehypeRewriteOptions['rewrite'];
}

export interface MarkdownPreviewRef extends MarkdownPreviewProps {
  mdp: React.RefObject<HTMLDivElement>;
}

const MarkdownPreviewPure = React.forwardRef<MarkdownPreviewRef, MarkdownPreviewProps>((props, ref) => {
  const {
    prefixCls = 'wmde-markdown',
    className,
    source,
    style,
    onScroll,
    onMouseOver,
    pluginsFilter,
    rehypeRewrite: rewrite,
    warpperElement = {},
    ...other
  } = props;
  const mdp = React.createRef<HTMLDivElement>();
  useImperativeHandle(ref, () => ({ ...props, mdp }), [mdp, props]);
  const cls = `${prefixCls || ''} ${className || ''}`;

  const rehypePlugins: PluggableList = [
    reservedMeta,
    [rehypePrism, { ignoreMissing: true }],
    rehypeRaw,
    slug,
    headings,
    rehypeIgnore,
    [rehypeAttrs, { properties: 'attr' }],
    ...(other.rehypePlugins || []),
  ];
  const customProps: MarkdownPreviewProps = {
    allowElement: (element, index, parent) => {
      if (other.allowElement) {
        return other.allowElement(element, index, parent);
      }
      return /^[A-Za-z0-9]+$/.test(element.tagName);
    },
  };
  const remarkPlugins = [...(other.remarkPlugins || []), gfm];
  return (
    <div ref={mdp} onScroll={onScroll} onMouseOver={onMouseOver} {...warpperElement} className={cls} style={style}>
      <ReactMarkdown
        {...other}
        {...customProps}
        rehypePlugins={pluginsFilter ? pluginsFilter('rehype', rehypePlugins) : rehypePlugins}
        remarkPlugins={pluginsFilter ? pluginsFilter('remark', remarkPlugins) : remarkPlugins}
        children={source || ''}
      />
    </div>
  );
});

MarkdownPreviewPure.displayName = 'MarkdownPreview';
export const MarkdownPreview = MarkdownPreviewPure;
