import { Extension } from "prosemirror-unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { Processor } from "unified";
import type { Node as UnistNode } from "unist";

import {
    ParagraphExtension,
    BlockquoteExtension,
    BoldExtension,
    BreakExtension,
    CodeBlockExtension,
    DefinitionExtension,
    HeadingExtension,
    HorizontalRuleExtension,
    ImageExtension,
    ImageReferenceExtension,
    InlineCodeExtension,
    ItalicExtension,
    //LinkExtension,
    //LinkReferenceExtension,
    ListItemExtension,
    OrderedListExtension,
    RootExtension,
    TextExtension,
    UnorderedListExtension,
} from "prosemirror-remark";
import { CustomLinkExtension } from "#prosemirror/CustomLinkExtension.ts";

/**
 * @public
 */
export class CustomMarkdownExtension extends Extension {
  public override dependencies(): Array<Extension> {
    return [
      // ParagraphExtension needs to be first so that it is the default block.
      new ParagraphExtension(),
        new BlockquoteExtension(),
        new BoldExtension(),
        new BreakExtension(),
        new CodeBlockExtension(),
        new DefinitionExtension(),
        new HeadingExtension(),
        new HorizontalRuleExtension(),
        new ImageExtension(),
        new ImageReferenceExtension(),
        new InlineCodeExtension(),
        new ItalicExtension(),
        //new LinkExtension(),
        //new LinkReferenceExtension(),
        new CustomLinkExtension(),
        new ListItemExtension(),
        new OrderedListExtension(),
        new RootExtension(),
        new TextExtension(),
        new UnorderedListExtension(),
    ];
  }

  public override unifiedInitializationHook(
    processor: Processor<UnistNode, UnistNode, UnistNode, UnistNode, string>,
  ): Processor<UnistNode, UnistNode, UnistNode, UnistNode, string> {
    return processor.use(remarkParse).use(remarkStringify, {
      fences: true,
      listItemIndent: "one",
      resourceLink: true,
      rule: "-",
    }) as unknown as Processor<
      UnistNode,
      UnistNode,
      UnistNode,
      UnistNode,
      string
    >;
  }
}
