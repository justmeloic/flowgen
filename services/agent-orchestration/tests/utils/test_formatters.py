import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi import Request  # For type hinting the mock

from src.utils.formatters import (
    format_text_response,
)  # Ensure this is the correct import path


@pytest.fixture
def mock_request_with_session_id() -> MagicMock:
    """Mocks a FastAPI Request object with state.actual_session_id."""
    request = MagicMock(spec=Request)
    request.state = MagicMock()
    request.state.actual_session_id = 'test-session-123'
    # If your formatter uses request.headers, mock it too:
    # request.headers = MagicMock()
    # request.headers.get = MagicMock(return_value=None) # Default for .get()
    return request


def test_format_text_response_no_references_marker(
    mock_request_with_session_id: MagicMock,
):
    input_text = 'This is a simple response.'
    expected_text = 'This is a simple response.'  # No bolding if no citations
    expected_references = {}

    text, refs = format_text_response(input_text, mock_request_with_session_id)

    assert text == expected_text
    assert refs == expected_references


def test_format_text_response_with_valid_references(
    mock_request_with_session_id: MagicMock,
):
    raw_references = [
        {
            'title': 'Doc 1',
            'link': 'http://example.com/doc1',
            'text': 'Content of doc 1.',
        },
        {
            'title': 'Doc 2',
            'link': 'http://example.com/doc2',
            'text': 'Content of doc 2.',
        },
    ]
    references_json_string = json.dumps(raw_references)
    input_text = f'Main response content. [1] refers to something. <START_OF_REFERENCE_DOCUMENTS> {references_json_string}'

    expected_text = 'Main response content. **[1]** refers to something.'
    expected_references = {
        '1': {
            'title': 'Doc 1',
            'link': 'http://example.com/doc1',
            'text': 'Content of doc 1.',
        },
        '2': {
            'title': 'Doc 2',
            'link': 'http://example.com/doc2',
            'text': 'Content of doc 2.',
        },
    }

    text, refs = format_text_response(input_text, mock_request_with_session_id)

    assert text == expected_text
    assert refs == expected_references


def test_format_text_response_with_empty_references_list(
    mock_request_with_session_id: MagicMock,
):
    input_text = 'Response with no specific references. [citation] <START_OF_REFERENCE_DOCUMENTS> []'
    # [citation] does not match r"(\[[0-9,\s]+\])", so it should NOT be bolded.
    expected_text = 'Response with no specific references. [citation]'
    expected_references = {}

    text, refs = format_text_response(input_text, mock_request_with_session_id)

    assert text == expected_text
    assert refs == expected_references


def test_format_text_response_with_malformed_json_references(
    mock_request_with_session_id: MagicMock,
):
    malformed_json_string = '[{"title": "Doc 1", "text":Invalid}'  # Invalid JSON syntax
    input_text = f'Response with bad refs. <START_OF_REFERENCE_DOCUMENTS> {malformed_json_string}'

    expected_text = 'Response with bad refs.'
    expected_references = {}

    with patch('src.utils.formatters.logger.error') as mock_logger_error:
        text, refs = format_text_response(input_text, mock_request_with_session_id)
        mock_logger_error.assert_called_once()
        log_message = mock_logger_error.call_args[0][0]
        assert 'Failed to parse references JSON' in log_message
        assert mock_request_with_session_id.state.actual_session_id in log_message
        assert malformed_json_string[:50] in log_message

    assert text == expected_text
    assert refs == expected_references


def test_format_text_response_references_json_not_a_list(
    mock_request_with_session_id: MagicMock,
):
    # Test when the root of the parsed JSON is an object, not a list
    not_a_list_json_string = json.dumps(
        {'error': 'this is an object, not a list of refs'}
    )
    input_text = f'Text. <START_OF_REFERENCE_DOCUMENTS> {not_a_list_json_string}'
    expected_text = 'Text.'
    # Your code's list comprehension `for i, ref in enumerate(references_list)` will not iterate
    # if references_list is a dict, or it will iterate keys. `isinstance(key, dict)` will be false.
    expected_references = {}

    text, refs = format_text_response(input_text, mock_request_with_session_id)
    assert text == expected_text
    assert refs == expected_references


def test_format_text_response_references_list_with_non_dict_items(
    mock_request_with_session_id: MagicMock,
):
    references_content = json.dumps(
        [
            {'title': 'Good Doc', 'link': 'good.link', 'text': 'good text'},
            'just a string, not a dict',
            123,
            {
                'title': 'Another Good Doc',
                'link': 'another.link',
                'text': 'another text',
            },
        ]
    )
    input_text = f'Mixed ref types. <START_OF_REFERENCE_DOCUMENTS> {references_content}'
    expected_text = 'Mixed ref types.'
    expected_references = {
        '1': {'title': 'Good Doc', 'link': 'good.link', 'text': 'good text'},
        '4': {  # Index matches position in original list
            'title': 'Another Good Doc',
            'link': 'another.link',
            'text': 'another text',
        },
    }

    text, refs = format_text_response(input_text, mock_request_with_session_id)
    assert text == expected_text
    assert refs == expected_references


def test_format_text_response_only_marker_no_content_after(
    mock_request_with_session_id: MagicMock,
):
    input_text = (
        'Text before. <START_OF_REFERENCE_DOCUMENTS>'  # No content after marker
    )
    expected_text = 'Text before.'
    expected_references = {}

    with patch('src.utils.formatters.logger.error') as mock_logger_error:
        text, refs = format_text_response(input_text, mock_request_with_session_id)
        # json.loads("") raises JSONDecodeError
        mock_logger_error.assert_called_once()
        assert 'Failed to parse references JSON' in mock_logger_error.call_args[0][0]

    assert text == expected_text
    assert refs == expected_references


@pytest.mark.parametrize(
    'citation_input, expected_bolded_output',
    [
        ('No citations here.', 'No citations here.'),
        ('Citation [1] here.', 'Citation **[1]** here.'),
        ('Multiple [1, 2] citations [3].', 'Multiple **[1, 2]** citations **[3]**.'),
        ('Mixed [1,2, 3] and [4].', 'Mixed **[1,2, 3]** and **[4]**.'),
        (
            'Invalid [citation] or [1a] or [].',
            'Invalid [citation] or [1a] or [].',
        ),  # Pattern requires digits, commas, spaces
        (
            'Adjacent [1][2] citations.',
            'Adjacent **[1]****[2]** citations.',
        ),  # Check if this is desired
        (
            'Text with [ 1 , 2  ,3 ] spaces in citation.',
            'Text with **[ 1 , 2  ,3 ]** spaces in citation.',
        ),
        ('End of sentence citation [42].', 'End of sentence citation **[42]**.'),
        ('Start of sentence [0] citation.', 'Start of sentence **[0]** citation.'),
    ],
)
def test_citation_bolding(
    mock_request_with_session_id: MagicMock,
    citation_input: str,
    expected_bolded_output: str,
):
    text, _ = format_text_response(citation_input, mock_request_with_session_id)
    assert text == expected_bolded_output


def test_format_text_response_full_flow(mock_request_with_session_id: MagicMock):
    raw_references = [{'title': 'Ref1', 'link': 'link1', 'text': 'text1'}]
    references_json_string = json.dumps(raw_references)
    input_text = f'Main text [1]. See also [2,3] and [non-numeric]. <START_OF_REFERENCE_DOCUMENTS> {references_json_string}'

    expected_text = 'Main text **[1]**. See also **[2,3]** and [non-numeric].'
    expected_references = {'1': {'title': 'Ref1', 'link': 'link1', 'text': 'text1'}}

    text, refs = format_text_response(input_text, mock_request_with_session_id)

    assert text == expected_text
    assert refs == expected_references
