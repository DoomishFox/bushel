import type { Link, Text, PhrasingContent } from "mdast";
import { toggleMark } from "prosemirror-commands";
import type { InputRule } from "prosemirror-inputrules";
import type {
  DOMOutputSpec,
  Mark,
  NodeSpec,
  Node as ProseMirrorNode,
  Schema,
} from "prosemirror-model";
import type { Command } from "prosemirror-state";
import { Extension, NodeExtension, MarkInputRule, createProseMirrorNode } from "prosemirror-unified";
import { LinkInputRule } from "./LinkInputRule";
import { TextExtension } from "prosemirror-remark";

/**
 * @public
 */
export class LinkExtension extends NodeExtension<Link> {
  public override dependencies(): Array<Extension> {
    return [new TextExtension()];
  }

  public override unistNodeName(): "link" {
    return "link";
  }

  public override proseMirrorNodeName(): string {
    return "link";
  }

  public override proseMirrorNodeSpec(): NodeSpec {
    return {
      attrs: { href: {}, title: { default: null } },
      //inclusive: false,
      content: "text*",
      group: "inline",
      inline: true,
      parseDOM: [
        {
          tag: "a[href]",
          //tag: "span.md-url",
          getAttrs(dom: Node | string): {
            href: string | null;
            title: string | null;
          } {
            console.log(dom as HTMLElement)
            return {
              href: (dom as HTMLElement).getAttribute("href"),
              title: (dom as HTMLElement).getAttribute("title"),
            };
          },
        },
      ],
      toDOM(node: ProseMirrorNode): DOMOutputSpec {
        console.log(node)
        return ["a", node.attrs, 0];
      },
    };
  }

  public override unistNodeToProseMirrorNodes(
    node: Link,
    proseMirrorSchema: Schema<string, string>,
    convertedChildren: Array<ProseMirrorNode>,
  ): Array<ProseMirrorNode> {
    console.log(node)
    const prosemirronode = createProseMirrorNode(
      this.proseMirrorNodeName(),
      proseMirrorSchema,
      convertedChildren,
      {
        href: node.url,
        title: node.title,
      }
    );
    console.log(prosemirronode)
    return prosemirronode;
  }

  public override proseMirrorNodeToUnistNodes(
    node: ProseMirrorNode,
    convertedChildren: Array<PhrasingContent>,
  ): Array<Link> {
    return [
      {
        type: this.unistNodeName(),
        children: convertedChildren,
        url: node.attrs.url,
        title: node.attrs.title,
      },
    ];
  }
}
