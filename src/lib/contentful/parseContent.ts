import type { Options } from "@contentful/rich-text-html-renderer"
import { BLOCKS, MARKS, INLINES } from "@contentful/rich-text-types"
import type { CustomInlineEntry } from "./types"
import { kebabCase } from "lodash-es"

/**
 * Writing stringed HTML is gross, so I made this so it's less error-prone lol
 *
 * @param tag A vaild HTML tag
 * @param attrs Attributes from the HTML element you provided
 * @param content Anything that'll be appended from `textContent`
 * @returns A gorgeous HTML string that's safe to parse for Contentful to eat :3
 */
const sanitizedHTML = <T extends keyof HTMLElementTagNameMap, C = string>(
  tag: T,
  attrs?: Partial<Omit<HTMLElementTagNameMap[T], keyof HTMLElementTagNameMap[T]>>,
  content?: C
) => {
  // `document` and `window` is not available for server so I had to deal cobbling with fukin arrays
  const START_TAG = `<${tag}>`
  const END_TAG = `</${tag}>`

  const START_TAG_SC = `<${tag} `
  const END_TAG_SC = ` />`

  const parsedAttributes = attrs
    ? Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ")
    : ""

  if (tag === "img") return [START_TAG_SC, parsedAttributes, END_TAG_SC].join("")
  if (parsedAttributes) return [START_TAG_SC, parsedAttributes, ">", content, END_TAG].join("")

  return [START_TAG, content, END_TAG].join("")
}

const kebabHeadings = (tag: keyof HTMLElementTagNameMap, heading: any, node: any) =>
  sanitizedHTML(tag, { id: kebabCase(heading.value) }, node)

export const rendererOptions: Partial<Options> = {
  renderMark: {
    [MARKS.BOLD]: (t) => sanitizedHTML("strong", {}, t),
    [MARKS.ITALIC]: (t) => sanitizedHTML("em", {}, t),
    [MARKS.CODE]: (t) =>
      sanitizedHTML(
        "code",
        { class: "rounded-md bg-kuro-lavender-900 text-[0.96rem] py-0.5 px-1" },
        t
      )
  },
  renderNode: {
    [BLOCKS.HEADING_2]: (node, next) => kebabHeadings("h2", node.content[0], next(node.content)),
    [BLOCKS.HEADING_3]: (node, next) => kebabHeadings("h3", node.content[0], next(node.content)),
    [BLOCKS.UL_LIST]: (node, next) =>
      sanitizedHTML("ul", { class: "list-disc ml-6" }, next(node.content)),
    [BLOCKS.QUOTE]: (node, next) =>
      sanitizedHTML(
        "blockquote",
        {
          class:
            "px-6 py-5 border-l-[6px] border-kuro-lavender-300 bg-kuro-lavender-900 bg-opacity-40 my-2.5 text-kuro-violet-50 prose-p:!font-medium"
        },
        next(node.content)
      ),
    [BLOCKS.PARAGRAPH]: (node, next) => {
      const nodeContent = node.content
      if (!nodeContent.some((x) => (x as any).value === ""))
        return sanitizedHTML("p", {}, next(nodeContent))

      return sanitizedHTML("div", {}, next(nodeContent))
    },
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const embedFields = node.data.target.fields

      return sanitizedHTML(
        "img",
        {
          src: `https:${embedFields.file.url}`,
          alt: embedFields.title,
          class: "rounded-xl max-h-[32rem] mx-auto"
        },
        null
      )
    },

    [INLINES.EMBEDDED_ENTRY]: (node) => {
      const { sys, fields } = node.data.target as CustomInlineEntry
      const strippedUrl = fields.url?.split("/").at(-1)

      if (sys.contentType.sys.id === "youTubeVideo") {
        return sanitizedHTML("yt-embed-wrapper", {
          videoid: strippedUrl
        })
      }

      return sanitizedHTML("p", {}, JSON.stringify(node))
    },
    [INLINES.HYPERLINK]: (node, next) =>
      sanitizedHTML(
        "a",
        {
          class: "text-kuro-lavender-300 hover:text-kuro-lavender-400 hover:underline",
          href: node.data.uri,
          target: "_blank",
          rel: "noopenner noreferrer"
        },
        next(node.content)
      )
  }
}

const renderNothing = () => ""

export const parseForTOC: Partial<Options> = {
  renderNode: {
    [BLOCKS.HEADING_2]: (node, next) =>
      sanitizedHTML(
        "a",
        { class: "block", href: `#${kebabCase(next(node.content))}`, "data-astro-prefetch": false },
        next(node.content)
      ),
    [BLOCKS.HEADING_3]: (node, next) =>
      sanitizedHTML(
        "a",
        {
          class: "block pl-4",
          href: `#${kebabCase(next(node.content))}`,
          "data-astro-prefetch": false
        },
        next(node.content)
      ),
    [BLOCKS.PARAGRAPH]: renderNothing,
    [BLOCKS.UL_LIST]: renderNothing,
    [BLOCKS.OL_LIST]: renderNothing,
    [BLOCKS.QUOTE]: renderNothing,
    [BLOCKS.TABLE]: renderNothing
  }
}
