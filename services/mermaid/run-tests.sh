#!/bin/bash

# Set PYTHONPATH to include the 'src' directory
export PYTHONPATH=$(pwd)/src:$PYTHONPATH

find . -name "__pycache__" -type d -exec rm -rf {} +
uv run pytest -v --cov --cov-config=pyproject.toml