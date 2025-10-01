python ./src/styles/report_css_variables.py

if [ $? -ne 0 ]; then
    echo "Must Check the CSS variables before building"
    exit 1
fi

npm install
npm run build
