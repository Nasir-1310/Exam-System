from docx import Document
from docx.document import Document as DocxDocument
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.oxml.ns import qn
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph
from pathlib import Path
import base64
import html
import mimetypes
from typing import Dict, List, Optional, Tuple, Union


WORD_NAMESPACES: Dict[str, str] = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'm': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
    'wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
    'v': 'urn:schemas-microsoft-com:vml'
}

LATEX_REPLACEMENTS = [
    ('\\', r'\textbackslash{}'),
    ('{', r'\{'),
    ('}', r'\}'),
    ('#', r'\#'),
    ('$', r'\$'),
    ('%', r'\%'),
    ('&', r'\&'),
    ('_', r'\_'),
    ('~', r'\textasciitilde{}'),
    ('^', r'\^{}')
]

NARY_LATEX_MAP = {
    '∑': r'\sum',
    '∏': r'\prod',
    '∐': r'\coprod',
    '∫': r'\int',
    '∮': r'\oint',
    '⋂': r'\bigcap',
    '⋃': r'\bigcup',
    '⋁': r'\bigvee',
    '⋀': r'\bigwedge',
    '⋄': r'\bigodot',
    '⊕': r'\bigoplus',
    '⊗': r'\bigotimes',
    '∧': r'\land',
    '∨': r'\lor'
}

ACCENT_LATEX_MAP = {
    '¯': r'\bar',
    'ˉ': r'\bar',
    'ˆ': r'\hat',
    '^': r'\hat',
    'ˇ': r'\check',
    '˘': r'\breve',
    '˙': r'\dot',
    '¨': r'\ddot',
    '˜': r'\tilde',
    '˚': r'\mathring',
    '˛': r'\textpolhook',
    '´': r'\acute',
    'ˊ': r'\acute',
    '`': r'\grave',
    'ˋ': r'\grave'
}

FUNCTION_LATEX_MAP = {
    'sin': r'\sin',
    'cos': r'\cos',
    'tan': r'\tan',
    'arcsin': r'\arcsin',
    'arccos': r'\arccos',
    'arctan': r'\arctan',
    'sinh': r'\sinh',
    'cosh': r'\cosh',
    'tanh': r'\tanh',
    'log': r'\log',
    'ln': r'\ln',
    'exp': r'\exp',
    'det': r'\det',
    'dim': r'\dim',
    'mod': r'\bmod',
    'gcd': r'\gcd',
    'lim': r'\lim',
    'sup': r'\sup',
    'inf': r'\inf',
    'max': r'\max',
    'min': r'\min'
}

DELIMITER_LATEX_MAP = {
    '(': r'(',
    ')': r')',
    '[': r'[',
    ']': r']',
    '{': r'\{',
    '}': r'\}',
    '|': r'|',
    '∣': r'|',
    '‖': r'\|',
    '∥': r'\|',
    '⌊': r'\lfloor',
    '⌋': r'\rfloor',
    '⌈': r'\lceil',
    '⌉': r'\rceil',
    '⟨': r'\langle',
    '⟩': r'\rangle',
    '⟪': r'\langle\langle',
    '⟫': r'\rangle\rangle',
    '<': r'\langle',
    '>': r'\rangle'
}

GROUP_CHAR_CLOSE_MAP = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
    '⟨': '⟩',
    '⟪': '⟫',
    '|': '|',
    '∣': '∣',
    '‖': '‖',
    '∥': '∥',
    '⌊': '⌋',
    '⌈': '⌉'
}

HIGHLIGHT_COLORS = {
    'black': '#000000',
    'blue': '#0000ff',
    'cyan': '#00ffff',
    'darkblue': '#00008b',
    'darkcyan': '#008b8b',
    'darkgray': '#a9a9a9',
    'darkgreen': '#006400',
    'darkmagenta': '#8b008b',
    'darkred': '#8b0000',
    'darkyellow': '#b5a642',
    'green': '#008000',
    'lightgray': '#d3d3d3',
    'magenta': '#ff00ff',
    'red': '#ff0000',
    'white': '#ffffff',
    'yellow': '#ffff00'
}

ALIGNMENT_MAP = {
    WD_PARAGRAPH_ALIGNMENT.LEFT: 'left',
    WD_PARAGRAPH_ALIGNMENT.CENTER: 'center',
    WD_PARAGRAPH_ALIGNMENT.RIGHT: 'right',
    WD_PARAGRAPH_ALIGNMENT.JUSTIFY: 'justify'
}
if hasattr(WD_PARAGRAPH_ALIGNMENT, 'DISTRIBUTE'):
    ALIGNMENT_MAP[WD_PARAGRAPH_ALIGNMENT.DISTRIBUTE] = 'justify'
if hasattr(WD_PARAGRAPH_ALIGNMENT, 'BOTH'):
    ALIGNMENT_MAP[WD_PARAGRAPH_ALIGNMENT.BOTH] = 'justify'

IMAGE_EXT_FALLBACKS = {
    'image/jpeg': '.jpg',
    'image/pjpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/tiff': '.tif',
    'image/bmp': '.bmp',
    'image/x-wmf': '.wmf',
    'image/x-emf': '.emf'
}

DEFAULT_IMAGE_STYLE = 'max-width: 60px; vertical-align:middle; display: inline-block;'


def escape_latex(text: Optional[str]) -> str:
    if text is None:
        return ''
    result = text
    for needle, replacement in LATEX_REPLACEMENTS:
        result = result.replace(needle, replacement)
    return result


def format_delimiter(char: str) -> str:
    if not char:
        return ''
    return DELIMITER_LATEX_MAP.get(char, escape_latex(char))


def escape_html_text(text: str, preserve_space: bool = False) -> str:
    encoded = html.escape(text or '')
    # if preserve_space:
    #     encoded = encoded.replace(' ', '&nbsp;')
    return encoded


def guess_image_extension(mime: Optional[str]) -> str:
    if not mime:
        return ''
    ext = mimetypes.guess_extension(mime)
    if ext:
        return ext
    return IMAGE_EXT_FALLBACKS.get(mime, '')


def resolve_highlight_color(name: str) -> str:
    if not name:
        return ''
    lookup = name.lower()
    if lookup in HIGHLIGHT_COLORS:
        return HIGHLIGHT_COLORS[lookup]
    if name.startswith('#'):
        return name
    if len(name) in {3, 6} and all(c in '0123456789abcdefABCDEF' for c in name):
        return f'#{name}'
    return name

def oxml_xpath(element, query: str):
    node = getattr(element, '_element', element)
    try:
        return node.xpath(query, namespaces=WORD_NAMESPACES)
    except TypeError:
        return node.xpath(query)


def iter_block_items(parent: Union[DocxDocument, _Cell, Paragraph]):
    if isinstance(parent, DocxDocument):
        parent_elm = parent.element.body
    elif isinstance(parent, _Cell):
        parent_elm = parent._tc
    else:
        parent_elm = parent._element
    for child in parent_elm.iterchildren():
        if child.tag == qn('w:p'):
            yield Paragraph(child, parent)
        elif child.tag == qn('w:tbl'):
            yield Table(child, parent)


def get_numbering_format(numbering_part, num_id: str, ilvl: int) -> Optional[str]:
    if numbering_part is None:
        return None
    try:
        numbering_element = numbering_part.element
    except AttributeError:
        return None
    num_elements = oxml_xpath(
        numbering_element,
        f".//w:num[@w:numId='{num_id}']"
    )
    if not num_elements:
        return None
    abstract = num_elements[0].find('w:abstractNumId', WORD_NAMESPACES)
    if abstract is None:
        return None
    abs_id = abstract.get(qn('w:val'))
    if abs_id is None:
        return None
    abstract_elements = oxml_xpath(
        numbering_element,
        f".//w:abstractNum[@w:abstractNumId='{abs_id}']"
    )
    if not abstract_elements:
        return None
    num_fmt = abstract_elements[0].find(
        f"./w:lvl[@w:ilvl='{ilvl}']/w:numFmt", WORD_NAMESPACES
    )
    if num_fmt is None:
        return None
    return num_fmt.get(qn('w:val'))


def detect_list_info(
    para: Paragraph, style_name: str
) -> Optional[Dict[str, Union[str, int, None]]]:
    pPr = para._p.pPr if para._p is not None else None
    numPr = pPr.numPr if pPr is not None else None
    if numPr is not None:
        num_id = numPr.numId.val if numPr.numId is not None else None
        ilvl_val = numPr.ilvl.val if numPr.ilvl is not None else '0'
        try:
            ilvl = int(ilvl_val)
        except (TypeError, ValueError):
            ilvl = 0
        list_type = None
        if num_id is not None:
            numbering_part = getattr(para.part, 'numbering_part', None)
            fmt = get_numbering_format(numbering_part, num_id, ilvl)
            if fmt in {'bullet', 'dingbat', 'image'}:
                list_type = 'ul'
            elif fmt is not None:
                list_type = 'ol'
        if list_type is None:
            if 'bullet' in style_name:
                list_type = 'ul'
            elif 'number' in style_name:
                list_type = 'ol'
        if list_type is not None:
            return {'type': list_type, 'level': ilvl, 'num_id': num_id}
    else:
        if 'bullet' in style_name:
            return {'type': 'ul', 'level': 0, 'num_id': None}
        if 'number' in style_name:
            return {'type': 'ol', 'level': 0, 'num_id': None}
    return None


def omml_to_latex(math_element):
    nsmap = WORD_NAMESPACES

    def get_text_content(elem):
        if elem is None:
            return ''
        if elem.tag == qn('m:t'):
            return escape_latex(elem.text or '')
        fragments = []
        if elem.text:
            fragments.append(escape_latex(elem.text))
        for child in elem:
            fragments.append(get_text_content(child))
            if child.tail:
                fragments.append(escape_latex(child.tail))
        return ''.join(fragments)

    def render_cases(rows):
        formatted_rows = [' & '.join(row) for row in rows]
        return '\\begin{cases}' + ' \\\\ '.join(formatted_rows) + '\\end{cases}'

    def process_element(elem):
        if elem is None:
            return ''
        tag = elem.tag

        if tag in (qn('m:f'), qn('m:frac')):
            num = process_element(elem.find('m:num', nsmap))
            den = process_element(elem.find('m:den', nsmap))
            return f'\\frac{{{num}}}{{{den}}}'

        if tag == qn('m:sSup'):
            base = process_element(elem.find('m:e', nsmap))
            sup = process_element(elem.find('m:sup', nsmap))
            return f'{{{base}}}^{{{sup}}}'

        if tag == qn('m:sSub'):
            base = process_element(elem.find('m:e', nsmap))
            sub = process_element(elem.find('m:sub', nsmap))
            return f'{{{base}}}_{{{sub}}}'

        if tag == qn('m:sSubSup'):
            base = process_element(elem.find('m:e', nsmap))
            sub = process_element(elem.find('m:sub', nsmap))
            sup = process_element(elem.find('m:sup', nsmap))
            return f'{{{base}}}_{{{sub}}}^{{{sup}}}'

        if tag == qn('m:rad'):
            deg = process_element(elem.find('m:deg', nsmap))
            base = process_element(elem.find('m:e', nsmap))
            if deg.strip():
                return f'\\sqrt[{deg}]{{{base}}}'
            return f'\\sqrt{{{base}}}'

        if tag in (qn('m:d'), qn('m:delim')):
            begin = elem.find('m:dPr/m:begChr', nsmap)
            end = elem.find('m:dPr/m:endChr', nsmap)
            left = format_delimiter(begin.get(qn('m:val')) if begin is not None else '(')
            right_char = end.get(qn('m:val')) if end is not None else GROUP_CHAR_CLOSE_MAP.get(left, ')')
            right = format_delimiter(GROUP_CHAR_CLOSE_MAP.get(right_char, right_char))
            content = process_element(elem.find('m:e', nsmap))
            return f'\\left{left}{content}\\right{right}'

        if tag in (qn('m:m'), qn('m:matrix')):
            rows = []
            for r in elem.findall('m:mr', nsmap):
                cells = [process_element(c) for c in r.findall('m:e', nsmap)]
                rows.append(' & '.join(cells))
            return '\\begin{bmatrix}' + ' \\\\ '.join(rows) + '\\end{bmatrix}'

        if tag == qn('m:eqArr'):
            rows = [process_element(e) for e in elem.findall('m:e', nsmap)]
            return '\\begin{aligned}' + ' \\\\ '.join(rows) + '\\end{aligned}'

        if tag == qn('m:nary'):
            chr_elem = elem.find('m:naryPr/m:chr', nsmap)
            chr_val = chr_elem.get(qn('m:val')) if chr_elem is not None else '∑'
            operator = NARY_LATEX_MAP.get(chr_val, f'\\operatorname{{{escape_latex(chr_val)}}}')
            sub = process_element(elem.find('m:sub', nsmap))
            sup = process_element(elem.find('m:sup', nsmap))
            base = process_element(elem.find('m:e', nsmap))
            if sub.strip():
                operator += f'_{{{sub}}}'
            if sup.strip():
                operator += f'^{{{sup}}}'
            return f'{operator} {base}'.strip()

        if tag == qn('m:acc'):
            acc_char_elem = elem.find('m:accPr/m:chr', nsmap)
            acc_char = acc_char_elem.get(qn('m:val')) if acc_char_elem is not None else '^'
            latex_cmd = ACCENT_LATEX_MAP.get(acc_char, r'\widehat')
            base = process_element(elem.find('m:e', nsmap))
            return f'{latex_cmd}{{{base}}}'

        if tag == qn('m:groupChr'):
            chr_elem = elem.find('m:groupChrPr/m:chr', nsmap)
            chr_val = chr_elem.get(qn('m:val')) if chr_elem is not None else '|'
            left = format_delimiter(chr_val)
            right = format_delimiter(GROUP_CHAR_CLOSE_MAP.get(chr_val, chr_val))
            content = process_element(elem.find('m:e', nsmap))
            return f'\\left{left}{content}\\right{right}'

        if tag == qn('m:bar'):
            pos_elem = elem.find('m:barPr/m:pos', nsmap)
            pos = pos_elem.get(qn('m:val')) if pos_elem is not None else 'top'
            base = process_element(elem.find('m:e', nsmap))
            return f'\\overline{{{base}}}' if pos == 'top' else f'\\underline{{{base}}}'

        if tag == qn('m:box'):
            content = [process_element(e) for e in elem.findall('m:e', nsmap)]
            content = ''.join(content) if content else process_element(elem.find('m:e', nsmap))
            return f'\\boxed{{{content}}}'

        if tag in {qn('m:limLow'), qn('m:limUpp'), qn('m:lim')}:
            base = process_element(elem.find('m:e', nsmap))
            lim = process_element(elem.find('m:lim', nsmap))
            sup = process_element(elem.find('m:sup', nsmap))
            sub = process_element(elem.find('m:sub', nsmap))
            result = base
            if sub.strip():
                result += f'_{{{sub}}}'
            if lim.strip():
                result += f'_{{{lim}}}'
            if sup.strip():
                result += f'^{{{sup}}}'
            return result

        if tag == qn('m:func'):
            fname = process_element(elem.find('m:fName', nsmap)).strip()
            argument = process_element(elem.find('m:e', nsmap))
            latex_func = FUNCTION_LATEX_MAP.get(fname, f'\\operatorname{{{fname}}}')
            if latex_func.startswith('\\operatorname'):
                return f'{latex_func}\\left({argument}\\right)'
            return f'{latex_func}{{{argument}}}'

        if tag == qn('m:tbl'):
            rows = []
            max_cols = 0
            for row in elem.findall('m:tr', nsmap):
                cells = []
                for cell in row.findall('m:tc', nsmap):
                    cells.append(process_element(cell))
                max_cols = max(max_cols, len(cells))
                rows.append(cells)
            if max_cols == 2:
                return render_cases(rows)
            body = ' \\\\ '.join(' & '.join(c) for c in rows)
            cols = 'c' * max_cols if max_cols else 'c'
            return f'\\begin{{array}}{{{cols}}}{body}\\end{{array}}'

        if tag == qn('m:brk'):
            return r'\\'

        if tag == qn('m:phant'):
            content = process_element(elem.find('m:e', nsmap))
            return f'\\phantom{{{content}}}'

        if tag == qn('m:r'):
            parts = []
            for child in elem:
                if child.tag == qn('m:rPr'):
                    continue
                parts.append(process_element(child))
            result = ''.join(parts)
            if result:
                return result
            return get_text_content(elem)

        if tag == qn('m:t'):
            return escape_latex(elem.text or '')

        children = []
        for child in elem:
            if child.tag == qn('m:rPr'):
                continue
            children.append(process_element(child))
        if children:
            return ''.join(children)

        return get_text_content(elem)

    return process_element(math_element)


def extract_image_html(
    drawing_elem, doc, para_idx, run_idx, img_idx, image_config
) -> Tuple[str, str]:
    blips = drawing_elem.findall(
        './/' + qn('pic:blipFill') + '/' + qn('a:blip')
    )

    
    if not blips:
        print("No blip found in drawing element.")
        return '', ''
    rel_id = blips[0].get(qn('r:embed'))

    if not rel_id:
        print("No relationship ID found for image.")
        return '', ''
    image_part = doc.part.related_parts.get(rel_id)
    if not image_part:
        print(f"No image part found for relationship ID: {rel_id}")
        return '', ''
    
    mime = image_part.content_type
    doc_pr = drawing_elem.find('.//wp:docPr', WORD_NAMESPACES)
    alt_text = ''
    
    if doc_pr is not None:
        alt_text = doc_pr.get('descr') or doc_pr.get('title') or ''
    
    alt_attr = f' alt="{html.escape(alt_text)}"' if alt_text else ''
    style_attr = f' style="{DEFAULT_IMAGE_STYLE}"'

    print(
        "[IMAGE FOUND] "
        f"paragraph={para_idx if para_idx is not None else '-'}, "
        f"run={run_idx}, "
        f"image_in_run={img_idx}"
    )
    
    if image_config and not image_config.get('embed', True) and image_config.get('dir'):
        image_dir: Path = image_config['dir']
        image_dir.mkdir(parents=True, exist_ok=True)
        ext = guess_image_extension(mime) or ''
        filename_template = image_config.get('namer')
        ext_suffix = ext if ext else ''
        if filename_template:
            filename = filename_template.format(
                para=para_idx if para_idx is not None else 0,
                run=run_idx,
                index=img_idx,
                ext=ext_suffix.lstrip('.')
            )
        else:
            filename = f'image_{para_idx if para_idx is not None else 0}_{run_idx}_{img_idx}{ext_suffix}'
        image_path = image_dir / filename
        with image_path.open('wb') as fp:
            fp.write(image_part.blob)
        src = html.escape(image_path.as_posix())
        return f'<img src="{src}"{alt_attr}{style_attr}/>', ''
    b64 = base64.b64encode(image_part.blob).decode()
    src = f'data:{mime};base64,{b64}'
    return f'<img src="{src}"{alt_attr}{style_attr} />', ''


def extract_textboxes_from_drawing(drawing_elem, doc, image_config) -> Tuple[str, str]:
    textboxes = oxml_xpath(drawing_elem, './/w:txbxContent')
    if not textboxes:
        return '', ''
    html_fragments = []
    text_fragments = []
    for txbx in textboxes:
        for p in txbx.findall('w:p', WORD_NAMESPACES):
            paragraph = Paragraph(p, doc)
            html_content, text_content = process_paragraph_with_equations(
                paragraph,
                doc,
                para_idx=None,
                image_config=image_config,
                debug=False
            )
            if html_content.strip():
                html_fragments.append(f'<div class="textbox-paragraph">{html_content}</div>')
            if text_content.strip():
                text_fragments.append(text_content)
    if html_fragments:
        return '<div class="drawing-textbox">' + ''.join(html_fragments) + '</div>', ' '.join(text_fragments)
    return '', ''


def process_nested_child(elem, doc, para_idx, run_idx, image_config):
    html_parts = []
    text_parts = []
    current_run_idx = run_idx
    children = list(elem.iterchildren())
    if not children:
        text_value = elem.text or ''
        if text_value:
            escaped = escape_html_text(text_value)
            return escaped, text_value, current_run_idx
        return '', '', current_run_idx
    for child in children:
        if child.tag == qn('w:r'):
            run_html, run_text = run_to_html(child, doc, para_idx, current_run_idx, image_config)
            if run_html:
                html_parts.append(run_html)
            if run_text:
                text_parts.append(run_text)
            current_run_idx += 1
        elif child.tag == qn('m:oMath'):
            latex = omml_to_latex(child)
            html_parts.append(f'${latex}$')
            text_parts.append(f'${latex}$')
        elif child.tag == qn('m:oMathPara'):
            math_segments = []
            text_segments = []
            for om in oxml_xpath(child, './/m:oMath'):
                latex = omml_to_latex(om)
                math_segments.append(f'$$ {latex} $$')
                text_segments.append(f'$$ {latex} $$')
            if math_segments:
                html_parts.append(''.join(math_segments))
                text_parts.append(' '.join(text_segments))
        elif child.tag == qn('w:hyperlink'):
            link_html, link_text, new_run_idx = hyperlink_to_html(child, doc, para_idx, current_run_idx, image_config)
            if link_html:
                html_parts.append(link_html)
            if link_text:
                text_parts.append(link_text)
            current_run_idx = new_run_idx
        else:
            nested_html, nested_text, new_run_idx = process_nested_child(child, doc, para_idx, current_run_idx, image_config)
            if nested_html:
                html_parts.append(nested_html)
            if nested_text:
                text_parts.append(nested_text)
            current_run_idx = new_run_idx
    return ''.join(html_parts), ''.join(text_parts), current_run_idx


def hyperlink_to_html(hyperlink_elem, doc, para_idx, run_idx, image_config):
    rel_id = hyperlink_elem.get(qn('r:id'))
    anchor = hyperlink_elem.get(qn('w:anchor'))
    tooltip = hyperlink_elem.get(qn('w:tooltip'))
    href = ''
    if rel_id and rel_id in doc.part.rels:
        rel = doc.part.rels[rel_id]
        href = getattr(rel, 'target_ref', '') or getattr(rel, '_target', '')
    content_html, content_text, new_run_idx = process_nested_child(
        hyperlink_elem, doc, para_idx, run_idx, image_config
    )
    if anchor:
        if href:
            if not href.endswith(f'#{anchor}'):
                href = f'{href}#{anchor}'
        else:
            href = f'#{anchor}'
    if href:
        title_attr = f' title="{html.escape(tooltip)}"' if tooltip else ''
        content_html = f'<a href="{html.escape(href)}"{title_attr}>{content_html}</a>'
    return content_html, content_text, new_run_idx


def run_to_html(run_elem, doc, para_idx, run_idx, image_config):
    styles = []
    plain_segments = []
    html_segments = []
    rPr = run_elem.find(qn('w:rPr'))
    vert_align = None
    if rPr is not None:
        if rPr.find(qn('w:b')) is not None:
            styles.append('font-weight:bold')
        if rPr.find(qn('w:i')) is not None:
            styles.append('font-style:italic')
        if rPr.find(qn('w:u')) is not None:
            styles.append('text-decoration:underline')
        if rPr.find(qn('w:strike')) is not None:
            styles.append('text-decoration:line-through')
        color = rPr.find(qn('w:color'))
        if color is not None:
            color_val = color.get(qn('w:val'))
            if color_val and color_val.lower() != 'auto':
                if not color_val.startswith('#'):
                    color_val = f'#{color_val}'
                styles.append(f'color:{color_val}')
        highlight = rPr.find(qn('w:highlight'))
        if highlight is not None:
            hl_val = highlight.get(qn('w:val'))
            if hl_val and hl_val.lower() != 'none':
                styles.append(f'background-color:{resolve_highlight_color(hl_val)}')
        sz = rPr.find(qn('w:sz'))
        # if sz is not None and sz.get(qn('w:val')):
        #     try:
        #         size_pt = int(sz.get(qn('w:val'))) / 2
        #         styles.append(f'font-size:{size_pt}pt')
        #     except ValueError:
        #         pass
        vert = rPr.find(qn('w:vertAlign'))
        if vert is not None:
            vert_align = vert.get(qn('w:val'))
    img_idx = 0
    for c in run_elem:
        if c.tag == qn('w:t'):
            preserve_space = c.get('{http://www.w3.org/XML/1998/namespace}space') == 'preserve'
            text_value = c.text or ''
            html_segments.append(escape_html_text(text_value, preserve_space))
            plain_segments.append(text_value)
        elif c.tag == qn('w:tab'):
            html_segments.append('&emsp;')
            plain_segments.append('\t')
        elif c.tag == qn('w:br'):
            br_type = c.get(qn('w:type'))
            if br_type == 'page':
                html_segments.append('<hr class="page-break" />')
            else:
                html_segments.append('<br/>')
            plain_segments.append('\n')
        elif c.tag == qn('w:cr'):
            html_segments.append('<br/>')
            plain_segments.append('\n')
        elif c.tag == qn('w:drawing'):
            print("[DRAWING FOUND] "
                  f"paragraph={para_idx if para_idx is not None else '-'}, "
                  f"run={run_idx}, "
                  f"image_in_run={img_idx}"
                )
            textbox_html, textbox_text = extract_textboxes_from_drawing(c, doc, image_config)
            if textbox_html:
                html_segments.append(textbox_html)
                plain_segments.append(textbox_text)
            img_html, img_text = extract_image_html(c, doc, para_idx, run_idx, img_idx, image_config)
            # print("Image html:", img_html, "Image text:", img_text)
            if img_html:
                img_idx += 1
                html_segments.append(img_html)
                if img_text:
                    plain_segments.append(img_text)
        elif c.tag == qn('w:pict'):
            print("[PICT FOUND] "
                  f"paragraph={para_idx if para_idx is not None else '-'}, "
                  f"run={run_idx}, "
                  f"image_in_run={img_idx}"
                )
            textbox_html, textbox_text = extract_textboxes_from_drawing(c, doc, image_config)
            if textbox_html:
                html_segments.append(textbox_html)
                plain_segments.append(textbox_text)
        elif c.tag == qn('w:sym'):
            char = c.get(qn('w:char'))
            if char:
                try:
                    symbol = chr(int(char, 16))
                except ValueError:
                    symbol = char
                html_segments.append(escape_html_text(symbol))
                plain_segments.append(symbol)
        elif c.tag in {qn('w:footnoteReference'), qn('w:endnoteReference')}:
            note_id = c.get(qn('w:id')) or ''
            note_html = f'<sup class="note-ref">[{note_id}]</sup>'
            html_segments.append(note_html)
            plain_segments.append(f'[{note_id}]')
        elif c.tag == qn('w:instrText'):
            instr_text = c.text or ''
            html_segments.append(escape_html_text(instr_text))
            plain_segments.append(instr_text)
        elif c.tag == qn('m:oMath'):
            latex = omml_to_latex(c)
            html_segments.append(f'${latex}$')
            plain_segments.append(f'${latex}$')
        else:
            nested_html, nested_text, _ = process_nested_child(c, doc, para_idx, run_idx, image_config)
            if nested_html:
                html_segments.append(nested_html)
            if nested_text:
                plain_segments.append(nested_text)
    combined_html = ''.join(html_segments)
    combined_text = ''.join(plain_segments)
    if styles and combined_html:
        combined_html = f'<span style="{";".join(styles)}">{combined_html}</span>' if styles else combined_html
    if vert_align == 'superscript' and combined_html:
        combined_html = f'<sup>{combined_html}</sup>'
        combined_text = f'^{combined_text}'
    elif vert_align == 'subscript' and combined_html:
        combined_html = f'<sub>{combined_html}</sub>'
        combined_text = f'_{combined_text}'
    return combined_html, combined_text


def process_paragraph_with_equations(
    para,
    doc,
    para_idx: Optional[int] = None,
    image_config: Optional[Dict[str, Union[bool, Path, str]]] = None,
    debug: bool = False
) -> Tuple[str, str]:
    html_parts = []
    text_parts = []
    run_idx = 0
    for child in para._element.iterchildren():
        if child.tag == qn('w:r'):
            run_html, run_text = run_to_html(child, doc, para_idx, run_idx, image_config)
            if run_html:
                html_parts.append(run_html)
            if run_text:
                text_parts.append(run_text)
            run_idx += 1
        elif child.tag == qn('w:hyperlink'):
            link_html, link_text, new_run_idx = hyperlink_to_html(child, doc, para_idx, run_idx, image_config)
            if link_html:
                html_parts.append(link_html)
            if link_text:
                text_parts.append(link_text)
            run_idx = new_run_idx
        elif child.tag == qn('m:oMath'):
            latex = omml_to_latex(child)
            html_parts.append(f'${latex}$')
            text_parts.append(f'${latex}$')
        elif child.tag == qn('m:oMathPara'):
            math_segments = []
            text_segments = []
            for om in oxml_xpath(child, './/m:oMath'):
                latex = omml_to_latex(om)
                math_segments.append(f'$$ {latex} $$')
                text_segments.append(f'$$ {latex} $$')
            if math_segments:
                html_parts.append(''.join(math_segments))
                text_parts.append(' '.join(text_segments))
        else:
            nested_html, nested_text, new_run_idx = process_nested_child(child, doc, para_idx, run_idx, image_config)
            if nested_html:
                html_parts.append(nested_html)
            if nested_text:
                text_parts.append(nested_text)
            run_idx = new_run_idx
    html_content = ''.join(html_parts)
    text_content = ''.join(text_parts)
    if debug:
        print(f"\nPara number: {(para_idx or 0) + 1}")
        preview = html_content if 'img' not in html_content else '[Img]'
        print(f"HTML Content: {preview}, Text content: {text_content}")
    return html_content, text_content


def classify_paragraph(para: Paragraph) -> Tuple[str, Optional[Dict[str, Union[str, int, None]]], Optional[str]]:
    style_name = (para.style.name if para.style else '').lower()
    tag = 'p'
    if style_name.startswith('heading'):
        parts = style_name.replace('-', ' ').split()
        level = next((int(part) for part in parts if part.isdigit()), 1)
        level = max(1, min(level, 6))
        tag = f'h{level}'
    elif style_name in {'title', 'subtitle'}:
        tag = 'h1'
    elif 'caption' in style_name:
        tag = 'figcaption'
    list_info = detect_list_info(para, style_name)
    alignment = ALIGNMENT_MAP.get(para.alignment) if para.alignment is not None else None
    return tag, list_info, alignment


def table_to_html(
    table: Table,
    doc: DocxDocument,
    image_config: Optional[Dict[str, Union[bool, Path, str]]],
    start_para_idx: int
) -> Tuple[str, int]:
    rows_html = []
    paragraphs_consumed = 0
    for row in table.rows:
        cell_html_fragments = []
        for cell in row.cells:
            fragments = []
            for item in iter_block_items(cell):
                if isinstance(item, Paragraph):
                    html_content, text_content = process_paragraph_with_equations(
                        item,
                        doc,
                        start_para_idx + paragraphs_consumed,
                        image_config,
                        debug=False
                    )
                    paragraphs_consumed += 1
                    if html_content.strip() or text_content.strip():
                        tag, list_info, alignment = classify_paragraph(item)
                        attrs = f' style="text-align:{alignment};"' if alignment else ''
                        if list_info:
                            fragments.append(f'<{list_info["type"]}><li{attrs}>{html_content}</li></{list_info["type"]}>')
                        else:
                            fragments.append(f'<{tag}{attrs}>{html_content}</{tag}>')
                elif isinstance(item, Table):
                    nested_html, nested_consumed = table_to_html(
                        item,
                        doc,
                        image_config,
                        start_para_idx + paragraphs_consumed
                    )
                    paragraphs_consumed += nested_consumed
                    fragments.append(nested_html)
            cell_html_fragments.append('<td>' + ''.join(fragments) + '</td>')
        rows_html.append('<tr>' + ''.join(cell_html_fragments) + '</tr>')
    return '<table>' + ''.join(rows_html) + '</table>', paragraphs_consumed


def extract_questions_from_docx(
    input_file: Union[str, Path]
) -> List[str]:
    """Convert a DOCX into a flat list of non-empty content fragments.

    The output preserves inline HTML (including embedded images) produced by
    ``process_paragraph_with_equations`` so callers can further parse the
    question/option delimiters ("==" and "--") while keeping media intact.
    """

    doc = Document(str(input_file))
    image_config: Dict[str, Union[bool, Path, str]] = {'embed': True}
    fragments: List[str] = []
    paragraph_index = 0

    for block in iter_block_items(doc):
        if isinstance(block, Paragraph):
            html_content, text_content = process_paragraph_with_equations(
                block,
                doc,
                paragraph_index,
                image_config,
                debug=False
            )
            paragraph_index += 1
            merged = (html_content or '').strip() or (text_content or '').strip()
            if merged:
                fragments.append(merged)
        elif isinstance(block, Table):
            table_html, consumed = table_to_html(
                block,
                doc,
                image_config,
                paragraph_index
            )
            paragraph_index += consumed
            if table_html.strip():
                fragments.append(table_html.strip())

    return fragments


def docx_to_html_with_latex(
    input_file: Union[str, Path],
    output_file: Optional[Union[str, Path]] = None,
    image_output_dir: Optional[Union[str, Path]] = None,
    embed_images: bool = True,
    write_output: bool = True,
    debug: bool = False
) -> str:
    doc = Document(str(input_file))
    image_config: Dict[str, Union[bool, Path, str]] = {'embed': embed_images}
    if image_output_dir:
        image_config['dir'] = Path(image_output_dir)

    html_fragments = []
    list_stack: List[Dict[str, Union[str, int, None]]] = []
    paragraph_index = 0

    for block in iter_block_items(doc):
        if isinstance(block, Paragraph):
            html_content, text_content = process_paragraph_with_equations(
                block,
                doc,
                paragraph_index,
                image_config,
                debug=debug
            )
            paragraph_index += 1
            if not (html_content.strip() or text_content.strip()):
                continue

            tag, list_info, alignment = classify_paragraph(block)
            if list_info:
                current = list_stack[-1] if list_stack else None
                if (
                    current is None
                    or current['type'] != list_info['type']
                    or current.get('num_id') != list_info.get('num_id')
                ):
                    while list_stack:
                        closing = list_stack.pop()
                        html_fragments.append(f'</{closing["type"]}>')
                    html_fragments.append(f'<{list_info["type"]}>')
                    list_stack.append({'type': list_info['type'], 'num_id': list_info.get('num_id')})
                li_attrs = f' style="text-align:{alignment};"' if alignment else ''
                html_fragments.append(f'<li{li_attrs}>{html_content}</li>')
            else:
                while list_stack:
                    closing = list_stack.pop()
                    html_fragments.append(f'</{closing["type"]}>')
                attrs = f' style="text-align:{alignment};"' if alignment else ''
                html_fragments.append(f'<{tag}{attrs}>{html_content}</{tag}>')
        elif isinstance(block, Table):
            while list_stack:
                closing = list_stack.pop()
                html_fragments.append(f'</{closing["type"]}>')
            table_html, consumed = table_to_html(
                block,
                doc,
                image_config,
                paragraph_index
            )
            html_fragments.append(table_html)
            paragraph_index += consumed

    while list_stack:
        closing = list_stack.pop()
        html_fragments.append(f'</{closing["type"]}>')

    html_output = '\n'.join(html_fragments)

    if write_output:
        output_path = Path(output_file) if output_file else Path(input_file).with_suffix('.html')
        output_path.write_text(html_output, encoding='utf-8')

    return html_output


def main() -> None:
    input_path = Path('Formatted_Equations.docx')
    if not input_path.exists():
        print('Formatted_Equations.docx not found in the current directory.')
        return

    output_path = input_path.with_suffix('.html')
    docx_to_html_with_latex(
        input_file=input_path,
        output_file=output_path,
        embed_images=True,
        write_output=True,
        debug=False
    )
    print(f'Conversion completed. HTML saved to {output_path}')


if __name__ == '__main__':
    main()
