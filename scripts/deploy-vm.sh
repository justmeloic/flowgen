#!/bin/bash

VERSION="\$1"
if [[ -z "\$VERSION" ]]; then
  echo "Usage: . deploy.sh <version>  (e.g., . deploy.sh 3 )"
  
fi

gsutil cp "gs://cn-agent-deployment/train_chatbot_v\${VERSION}.zip" .
if [[ \$? -ne 0 ]]; then
    echo "Failed to download from GCS"
    
fi

unzip "train_chatbot_v\${VERSION}.zip"
if [[ \$? -ne 0 ]]; then
    echo "Failed to unzip"
    
fi


# The rest remains the same, assuming the unzipped directory structure is consistent across versions.
cd train_chatbot_v\$VERSION
python3 -m venv .venv
source .venv/bin/activate
pip install -r cn_rail_chatbot/requirements.txt

cd cn_rail_chatbot
streamlit run src/app.py   --browser.serverAddress=localhost   --server.enableCORS=false   --server.enableXsrfProtection=false   --server.port 8443

