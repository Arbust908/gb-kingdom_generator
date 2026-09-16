const spriteUrl = new URL('../img/phosphor.svg', import.meta.url);
const svgNamespace = 'http://www.w3.org/2000/svg';

// Icons accompany visible labels, so they are decorative to assistive technology.
export function icon(name) {
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('class', name === 'spinner-gap' ? 'icon icon-spin' : 'icon');
    svg.setAttribute('viewBox', '0 0 256 256');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(svgNamespace, 'use');
    use.setAttribute('href', `${spriteUrl}#${name}`);
    svg.append(use);
    return svg;
}

export function setIconLabel(node, text, name) {
    node.replaceChildren(icon(name), document.createTextNode(text));
}
