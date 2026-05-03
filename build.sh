if command -v python3 &>/dev/null; then
    python3 ./src/styles/report_css_variables.py
elif command -v python &>/dev/null; then
    python ./src/styles/report_css_variables.py
else
    echo "Error: Python is not installed. Please install python3 or python."
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Must Check the CSS variables before building"
    exit 1
fi

npm install
npm run build
