import type { Link, LinkData, Text } from "mdast";
import { toggleMark, wrapIn } from "prosemirror-commands";
import type { InputRule } from "prosemirror-inputrules";
import { wrappingInputRule } from "prosemirror-inputrules";
import type {
    DOMOutputSpec,
    MarkSpec,
    Mark,
    Node as ProseMirrorNode,
    Schema,
    NodeSpec,
} from "prosemirror-model";
import { wrapInList } from "prosemirror-schema-list";
import type { Command } from "prosemirror-state";
import { NodeExtension, MarkInputRule, createProseMirrorNode } from "prosemirror-unified";

/**
 * @public
 */
export class CustomLinkExtension extends NodeExtension<Link> {
    public override unistNodeName(): "link" {
        return "link";
    }

    public override proseMirrorNodeName(): string {
        return "link";
    }

    public override proseMirrorNodeSpec(): NodeSpec {
        return {
            inline: true,
            attrs: { text: {}, href: { default: null } },
            inclusive: false,
            group: "inline",
            parseDOM: [
                {
                    getAttrs(dom: Node | string): {
                        href: string | null;
                        text: string | null;
                    } {
                        return {
                            text: (dom as HTMLElement).textContent,
                            href: (dom as HTMLElement).getAttribute("href"),
                        };
                    },
                    tag: "a[href]",
                },
            ],
            toDOM(node: ProseMirrorNode): DOMOutputSpec {
                return ["a", node.attrs];
            },
        };
    }

    public override proseMirrorInputRules(
        proseMirrorSchema: Schema<string, string>,
    ): Array<InputRule> {
        return [
            wrappingInputRule(
                /\[(.+)\]\(([^ ]+)(?: \"(.+)\")?\)$/,
                proseMirrorSchema.nodes[this.proseMirrorNodeName()],
                (match) => ({ href: match[2], title: match[1] }),
            ),
        ];
    }



    public override proseMirrorKeymap(
        proseMirrorSchema: Schema<string, string>,
      ): Record<string, Command> {
        return {
          "Ctrl-h": wrapIn(
            proseMirrorSchema.nodes[this.proseMirrorNodeName()],
          ),
        };
      }

    public override unistNodeToProseMirrorNodes(
        node: Link,
        proseMirrorSchema: Schema<string, string>,
        convertedChildren: Array<ProseMirrorNode>,
    ): Array<ProseMirrorNode> {
        return createProseMirrorNode(
            this.proseMirrorNodeName(),
            proseMirrorSchema,
            convertedChildren,
            {
                href: node.url,
                text: node.text,
            },
        );
    }

    public override proseMirrorNodeToUnistNodes(
        node: ProseMirrorNode,
        convertedChildren: Array<Text>,
    ): Array<Link> {
        return [
            {
                type: this.unistNodeName(),
                url: node.attrs.href as string,
                ...(node.attrs.text !== null && { title: node.attrs.text as string }),
                children: convertedChildren,
            }
        ];
    }
}
