import { useEffect } from "react";
import { useLanguage } from "@/site/components/LanguageContext";
import { normalise, toHindi } from "./translate";

/**
 * Shows the website in Hindi when the visitor picks हिं, without changing the English website.
 *
 * The pages always render their English text. While Hindi is selected, this swaps the text on
 * screen (and the placeholder / aria-label / title / alt attributes and the tab title) for the
 * Hindi in ./hi.ts, and keeps watching for new content (page changes, popups, tabs). Every
 * original is remembered, so switching back to English puts the exact English text back.
 *
 * Text with no Hindi entry stays as it is, and anything inside [data-translate="no"] (the legal
 * pages, course titles) is never touched.
 */

const ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);

function isExcluded(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  if (!element) return true;
  if (element.closest('[data-translate="no"]')) return true;
  for (let el: Element | null = element; el; el = el.parentElement) {
    if (SKIP_TAGS.has(el.tagName)) return true;
  }
  return false;
}

export default function HindiTranslator() {
  const { language } = useLanguage();

  useEffect(() => {
    // Hide-until-translated guard added by the inline script when Hindi was saved last time.
    const releaseGuard = () => document.getElementById("hi-pending")?.remove();
    if (language !== "hi") {
      releaseGuard();
      return;
    }

    /** English originals and the Hindi we put in their place. */
    const texts = new Map<Text, { english: string; shown: string }>();
    const attributes = new Map<Element, Map<string, { english: string; shown: string }>>();
    let englishTitle: string | null = null;
    let shownTitle: string | null = null;

    const translateText = (node: Text) => {
      const current = node.nodeValue ?? "";
      const known = texts.get(node);
      if (known && current === known.shown) return; // still our Hindi
      // New text, or React replaced it with new English: remember that English.
      const hindi = toHindi(current);
      if (hindi === null) {
        texts.delete(node);
        return;
      }
      // An <option> without a value submits its text; keep submitting the English.
      const parent = node.parentElement;
      if (parent?.tagName === "OPTION" && !parent.hasAttribute("value"))
        parent.setAttribute("value", normalise(current));
      texts.set(node, { english: current, shown: hindi });
      node.nodeValue = hindi;
    };

    const translateAttributes = (element: Element) => {
      for (const name of ATTRIBUTES) {
        const current = element.getAttribute(name);
        if (current === null) continue;
        let saved = attributes.get(element);
        const known = saved?.get(name);
        if (known && current === known.shown) continue;
        const hindi = toHindi(current);
        if (hindi === null) {
          saved?.delete(name);
          continue;
        }
        if (!saved) attributes.set(element, (saved = new Map()));
        saved.set(name, { english: current, shown: hindi });
        element.setAttribute(name, hindi);
      }
    };

    const translateTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        if (!isExcluded(root)) translateText(root as Text);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      if (
        (root as Element).tagName === "TEXTAREA" &&
        !(root as Element).closest('[data-translate="no"]')
      ) {
        translateAttributes(root as Element);
        return;
      }
      if (isExcluded(root)) return;
      translateAttributes(root as Element);
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              if (el.getAttribute("data-translate") === "no") return NodeFilter.FILTER_REJECT;
              if (SKIP_TAGS.has(el.tagName)) {
                // e.g. a textarea: translate its placeholder, never what the visitor typed.
                if (el.tagName === "TEXTAREA") translateAttributes(el);
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        },
      );
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE) translateText(node as Text);
        else translateAttributes(node as Element);
      }
    };

    const translateTitle = () => {
      if (document.title === shownTitle) return;
      const hindi = toHindi(document.title);
      if (hindi === null) return;
      englishTitle = document.title;
      shownTitle = hindi;
      document.title = hindi;
    };

    const observer = new MutationObserver((records) => {
      observer.disconnect();
      for (const record of records) {
        if (document.head.contains(record.target)) {
          translateTitle(); // the page's tab title changed
        } else if (record.type === "childList") {
          record.addedNodes.forEach(translateTree);
        } else {
          translateTree(record.target);
        }
      }
      observe();
    });
    const observe = () => {
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...ATTRIBUTES],
      });
      observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    };

    translateTree(document.body);
    translateTitle();
    observe();
    releaseGuard();

    return () => {
      // Back to English: restore every original we replaced (unless React already changed it).
      observer.disconnect();
      for (const [node, { english, shown }] of texts) {
        if (node.nodeValue === shown) node.nodeValue = english;
      }
      for (const [element, saved] of attributes) {
        for (const [name, { english, shown }] of saved) {
          if (element.getAttribute(name) === shown) element.setAttribute(name, english);
        }
      }
      if (englishTitle !== null && document.title === shownTitle) document.title = englishTitle;
    };
  }, [language]);

  return null;
}
