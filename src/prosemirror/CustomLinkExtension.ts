import type { Link, Text } from "mdast";
import { toggleMark } from "prosemirror-commands";
import type { InputRule } from "prosemirror-inputrules";
import type {
  DOMOutputSpec,
  Mark,
  MarkSpec,
  Node as ProseMirrorNode,
  Schema,
} from "prosemirror-model";
import type { Command } from "prosemirror-state";
import { MarkExtension, MarkInputRule } from "prosemirror-unified";
import { LinkInputRule } from "./LinkInputRule";

/**
 * @public
 */
export class LinkExtension extends MarkExtension<Link> {
  public override unistNodeName(): "link" {
    return "link";
  }

  public override proseMirrorMarkName(): string {
    return "link";
  }

  public override proseMirrorMarkSpec(): MarkSpec {
    return {
      attrs: { href: {}, title: { default: null } },
      inclusive: false,
      parseDOM: [
        {
          //tag: "a[href]",
          tag: "span.md-url",
          getAttrs(dom: Node | string): {
            href: string | null;
            title: string | null;
          } {
            console.log(dom as HTMLElement)
            return {
              href: (dom as HTMLElement).querySelector("[data-href]")?.textContent ?? "",
              title: (dom as HTMLElement).querySelector("[data-title]")?.textContent ?? null,
            };
          },
        },
      ],
      toDOM(node: Mark): DOMOutputSpec {
        console.log(node);
        const href: (string | any)[] = ["span", { "data-href": true }, node.attrs.href];
        if (node.attrs.title) {
            const title = ["span", { "data-title": true }, node.attrs.title]
            href.push(title);
        }
        return [
            "span",
            { class: "md-url" },
            ["span", { "data-text": true }, 0],
            href,
        ];
        //return ["a", node.attrs];
      },
    };
  }

  public override proseMirrorInputRules(
    proseMirrorSchema: Schema<string, string>,
  ): Array<InputRule> {
    return [
      new LinkInputRule(
        /\[(.+?)\]\(([^ ]+)(?: \"(.+?)\")?\)([\s\S])$/,
        proseMirrorSchema.marks[this.proseMirrorMarkName()],
      ),
    ];
  }

  public override proseMirrorKeymap(
    proseMirrorSchema: Schema<string, string>,
  ): Record<string, Command> {
    const markType = proseMirrorSchema.marks[this.proseMirrorMarkName()];
    return {
      "Mod-h": toggleMark(markType),
      "Mod-H": toggleMark(markType),
    };
  }

  public override unistNodeToProseMirrorNodes(
    node: Link,
    proseMirrorSchema: Schema<string, string>,
    convertedChildren: Array<ProseMirrorNode>,
  ): Array<ProseMirrorNode> {
    return convertedChildren.map((child) =>
      child.mark(
        child.marks.concat([
          proseMirrorSchema.marks[this.proseMirrorMarkName()].create({
            href: node.url,
            title: node.title,
          }),
        ]),
      ),
    );
  }

  public override processConvertedUnistNode(
    convertedNode: Text,
    originalMark: Mark,
  ): Link {
    return {
      type: this.unistNodeName(),
      url: originalMark.attrs.href as string,
      ...(originalMark.attrs.title !== null && {
        title: originalMark.attrs.title as string,
      }),
      children: [convertedNode],
    };
  }
}
