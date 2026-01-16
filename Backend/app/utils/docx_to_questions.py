import re
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional, Tuple

from app.utils.docx_utils import extract_questions_from_docx
from app.schemas import QuestionResponse


DELIM_QUESTION = '=='
DELIM_SECTION = '--'


_MARKER_TEMPLATE = r'^(?:<span[^>]*?>)?\s*{token}\s*(?:</span>)?$'


def _is_marker(fragment: str, token: str) -> bool:
    pattern = _MARKER_TEMPLATE.format(token=re.escape(token))
    return bool(re.match(pattern, fragment.strip(), flags=re.IGNORECASE))


def _split_text_and_image(section: str) -> Tuple[Optional[str], Optional[str]]:
    """Return textual content and the first image tag (if any)."""

    if not section:
        return None, None

    img_pattern = re.compile(r'<img[^>]*>', flags=re.IGNORECASE)
    text_parts: List[str] = []
    image_tag: Optional[str] = None

    for line in section.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        images = img_pattern.findall(stripped)
        if images and image_tag is None:
            image_tag = images[0]
        line_without_imgs = img_pattern.sub('', stripped).strip()
        if line_without_imgs:
            text_parts.append(line_without_imgs)

    text_value = '\n'.join(text_parts).strip() if text_parts else None
    return text_value, image_tag


def _parse_answers(raw: str) -> List[str]:
    if not raw:
        return []
    tokens = [part.strip() for part in re.split(r'[\s,]+', raw) if part.strip()]
    return [token.upper() for token in tokens]


def _parse_tags(raw: str) -> List[str]:
    if not raw:
        return []
    return [part.strip() for part in re.split(r'[\n,]+', raw) if part.strip()]


def _build_question_from_segments(segments: List[str]) -> Optional[QuestionResponse]:
    if not segments:
        return None

    content_text, content_img = _split_text_and_image(segments[0] if len(segments) > 0 else '')
    option_labels = ['a', 'b', 'c', 'd']
    option_text: dict = {}
    option_img: dict = {}

    for idx, label in enumerate(option_labels, start=1):
        segment = segments[idx] if len(segments) > idx else ''
        text, image = _split_text_and_image(segment)
        option_text[label] = text
        option_img[label] = image

    answers_raw = segments[5] if len(segments) > 5 else ''
    explanation_raw = segments[6] if len(segments) > 6 else ''
    tags_raw = segments[7] if len(segments) > 7 else ''

    answers = _parse_answers(answers_raw)
    explanation_text, explanation_img = _split_text_and_image(explanation_raw)
    tags = _parse_tags(tags_raw)

    if not (content_text or content_img):
        return None

    timestamp = datetime.now(timezone.utc)
    return QuestionResponse(
        id=uuid4(),
        content=content_text or content_img or '',
        img=content_img,
        explanation=explanation_text,
        explanation_img=explanation_img,
        a=option_text.get('a'),
        a_img=option_img.get('a'),
        b=option_text.get('b'),
        b_img=option_img.get('b'),
        c=option_text.get('c'),
        c_img=option_img.get('c'),
        d=option_text.get('d'),
        d_img=option_img.get('d'),
        answers=answers,
        tags=tags,
        allow_multiple=len(answers) > 1,
        status=Status.ACTIVE,
        created_at=timestamp,
        updated_at=timestamp,
    )


def docx_to_questions(file_path: str) -> List[QuestionResponse]:
    """Parse a DOCX file into a list of QuestionResponse objects.

    Expected structure per question:
    - lines until "--" => question content (text or image)
    - subsequent "--" blocks => options A, B, C, D
    - next block => answers (comma/space separated, case-insensitive)
    - next block (optional) => explanation
    - next block (optional) => tags (comma separated)
    Questions are separated by lines containing "==".
    Empty blocks are honored, so consecutive "--" keeps an empty explanation
    before a tags block.
    """

    fragments = extract_questions_from_docx(file_path)
    questions: List[QuestionResponse] = []
    segments: List[str] = []
    current_lines: List[str] = []

    def flush_segment(force: bool = False):
        nonlocal current_lines, segments
        if current_lines or force:
            segments.append('\n'.join(current_lines).strip())
            current_lines = []

    for fragment in fragments:
        if _is_marker(fragment, DELIM_SECTION):
            flush_segment(force=True)
            continue
        if _is_marker(fragment, DELIM_QUESTION):
            flush_segment(force=bool(current_lines))
            if segments:
                question = _build_question_from_segments(segments)
                if question:
                    questions.append(question)
            segments = []
            current_lines = []
            continue
        current_lines.append(fragment)

    flush_segment(force=bool(current_lines))
    if segments:
        question = _build_question_from_segments(segments)
        if question:
            questions.append(question)

    return questions